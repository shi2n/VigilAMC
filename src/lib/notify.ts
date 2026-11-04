import crypto from 'crypto';
import { db } from '@/lib/db';
import { TRANSLATIONS, SupportedLanguage } from '@/lib/i18n/technician';

interface ServiceAccountKey {
  project_id: string;
  client_email: string;
  private_key: string;
}

let cachedAccessToken: { token: string; expiresAt: number } | null = null;

function base64url(input: string | Buffer): string {
  const buf = typeof input === 'string' ? Buffer.from(input) : input;
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

/**
 * Mint Google OAuth2 access token for FCM v1 REST API
 */
async function getFcmAccessToken(serviceAccount: ServiceAccountKey): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedAccessToken && cachedAccessToken.expiresAt > now + 60) {
    return cachedAccessToken.token;
  }

  const header = { alg: 'RS256', typ: 'JWT' };
  const claims = {
    iss: serviceAccount.client_email,
    sub: serviceAccount.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
  };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedClaims = base64url(JSON.stringify(claims));
  const signatureInput = `${encodedHeader}.${encodedClaims}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signatureInput);
  const signature = base64url(signer.sign(serviceAccount.private_key));
  const assertion = `${signatureInput}.${signature}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google OAuth token request failed (${res.status}): ${errText}`);
  }

  const tokenData = await res.json();
  cachedAccessToken = {
    token: tokenData.access_token,
    expiresAt: now + (tokenData.expires_in || 3600),
  };

  return cachedAccessToken.token;
}

/**
 * Dispatch FCM push notification to a device token via FCM v1 HTTP API
 */
export async function sendFcmMessage(
  fcmToken: string,
  payload: {
    title: string;
    body: string;
    data?: Record<string, string>;
  }
): Promise<boolean> {
  const rawServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!rawServiceAccount) {
    // Owner setup pending (§5.1) - graceful skip
    return false;
  }

  try {
    const serviceAccount: ServiceAccountKey = JSON.parse(rawServiceAccount);
    if (!serviceAccount.project_id || !serviceAccount.client_email || !serviceAccount.private_key) {
      console.warn('[notify] Incomplete FIREBASE_SERVICE_ACCOUNT_JSON structure');
      return false;
    }

    const accessToken = await getFcmAccessToken(serviceAccount);
    const url = `https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`;

    const messagePayload = {
      message: {
        token: fcmToken,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data || {},
        android: {
          priority: 'HIGH',
          notification: {
            channel_id: 'vigil_field_tasks',
            color: '#EA580C',
            sound: 'default',
            default_sound: true,
            default_vibrate_timings: true,
          },
        },
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messagePayload),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.warn(`[notify] FCM send failed (${response.status}): ${errBody}`);
      // Stale or unregistered token cleanup can happen on 404 UNREGISTERED
      return false;
    }

    return true;
  } catch (err: any) {
    console.warn('[notify] Error dispatching FCM message:', err?.message || err);
    return false;
  }
}

interface NotifyAssignmentParams {
  type: 'WORK_ORDER' | 'BUILDING';
  technicianId: string;
  organizationId?: string | null;
  title?: string;
  message?: string;
  taskTitle?: string;
  buildingCount?: number;
  link?: string;
  taskId?: string;
  dueDate?: Date | null;
}

/**
 * Single entry point for technician task and building assignments:
 * 1. Resolves technician preferredLanguage and localizes push title/body (ALL 10 Indian languages)
 * 2. Writes in-app Notification row
 * 3. Fetches registered FCM DeviceTokens
 * 4. Sends FCM Push notification
 * 5. Updates Notification.pushSent flag if pushed
 * Failures never break business logic.
 */
export async function notifyOnAssignment(params: NotifyAssignmentParams): Promise<void> {
  try {
    const { technicianId, organizationId, link, taskId, dueDate } = params;

    // 1. Resolve technician preferred language (en/hi/mr/gu/ta/te/kn/ml/bn/pa)
    let lang: SupportedLanguage = 'en';
    try {
      const techUser = await (db as any).userProfile.findUnique({
        where: { id: technicianId },
        select: { preferredLanguage: true },
      });
      if (techUser?.preferredLanguage && TRANSLATIONS[techUser.preferredLanguage as SupportedLanguage]) {
        lang = techUser.preferredLanguage as SupportedLanguage;
      }
    } catch (langErr) {
      console.warn('[notify] Could not determine technician preferred language, defaulting to en:', langErr);
    }

    const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;

    let resolvedTitle = params.title;
    let resolvedMessage = params.message;

    if (params.type === 'WORK_ORDER') {
      resolvedTitle = dict.pushTaskAssignedTitle || TRANSLATIONS.en.pushTaskAssignedTitle || 'New Task Assigned';
      const taskName = params.taskTitle || params.title || 'Work Order';
      const dueStr = dueDate
        ? ` · Due: ${new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short' }).format(dueDate)}`
        : '';
      const template =
        dict.pushTaskAssignedBody ||
        TRANSLATIONS.en.pushTaskAssignedBody ||
        'Work Order: "{title}" assigned to you{due}';
      resolvedMessage = template.replace('{title}', taskName).replace('{due}', dueStr);
    } else if (params.type === 'BUILDING') {
      resolvedTitle =
        dict.pushBuildingAssignedTitle ||
        TRANSLATIONS.en.pushBuildingAssignedTitle ||
        'New Building Assignment';
      const count = params.buildingCount || 1;
      const template =
        dict.pushBuildingAssignedBody ||
        TRANSLATIONS.en.pushBuildingAssignedBody ||
        'You have been assigned to {count} building premises.';
      resolvedMessage = template.replace('{count}', String(count));
    }

    // 2. Create in-app Notification record
    let notificationId: string | null = null;
    try {
      const created = await (db as any).notification.create({
        data: {
          organizationId: organizationId || null,
          userId: technicianId,
          title: resolvedTitle || 'Task Notification',
          message: resolvedMessage || 'A new task was assigned to you.',
          type: 'INFO',
          link: link || (taskId ? `/technician?taskId=${taskId}` : null),
          pushSent: false,
        },
      });
      notificationId = created.id;
    } catch (dbErr) {
      console.warn('[notify] Failed to persist Notification row:', dbErr);
    }

    // 3. Fetch Device Tokens for technician
    let deviceTokens: Array<{ fcmToken: string }> = [];
    try {
      deviceTokens = await (db as any).deviceToken.findMany({
        where: { technicianId },
        select: { fcmToken: true },
      });
    } catch (tokenErr) {
      console.warn('[notify] Could not query device tokens:', tokenErr);
    }

    if (!deviceTokens || deviceTokens.length === 0) {
      return;
    }

    // 4. Dispatch FCM Push to each device token
    let anyPushSuccess = false;
    const fcmData: Record<string, string> = {
      type: params.type,
      ...(link ? { link } : {}),
      ...(taskId ? { taskId } : {}),
      ...(dueDate ? { dueDate: dueDate.toISOString() } : {}),
    };

    for (const dt of deviceTokens) {
      const ok = await sendFcmMessage(dt.fcmToken, {
        title: resolvedTitle || 'Task Notification',
        body: resolvedMessage || 'A new task was assigned to you.',
        data: fcmData,
      });
      if (ok) anyPushSuccess = true;
    }

    // 5. Update pushSent flag
    if (anyPushSuccess && notificationId) {
      await (db as any).notification
        .update({
          where: { id: notificationId },
          data: { pushSent: true },
        })
        .catch(() => null);
    }
  } catch (err: any) {
    // Non-fatal safety catch: assignments MUST never fail due to notification dispatch
    console.warn('[notify] Non-fatal notifyOnAssignment error:', err?.message || err);
  }
}
