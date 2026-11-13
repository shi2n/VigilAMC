import crypto from 'crypto';
import { db } from '@/lib/db';
import { TRANSLATIONS, SupportedLanguage } from '@/lib/i18n/technician';
import { isApnsDeviceToken, sendApnsMessage } from '@/lib/apns';

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
 * Robust parser for FIREBASE_SERVICE_ACCOUNT_JSON across all hosting environments:
 * - Direct JSON object strings
 * - Vercel env variables wrapped in outer quotes: "{"type":"service_account",...}"
 * - Double-escaped JSON strings: {\"type\":\"service_account\",...}
 * - Base64 encoded JSON
 */
export function parseServiceAccount(rawInput?: string): ServiceAccountKey | null {
  if (!rawInput || typeof rawInput !== 'string') return null;
  let raw = rawInput.trim();
  if (!raw) return null;

  // 1. Outer quotes wrapping raw JSON: "{"type":"service_account",...}"
  if (raw.startsWith('"') && raw.endsWith('"')) {
    const unquoted = raw.slice(1, -1).trim();
    if (unquoted.startsWith('{') && unquoted.endsWith('}')) {
      try {
        const parsed = JSON.parse(unquoted);
        if (parsed?.project_id && parsed?.client_email && parsed?.private_key) {
          return parsed;
        }
      } catch {}
    }
  }

  // 2. Direct JSON.parse
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.project_id && parsed?.client_email && parsed?.private_key) {
      return parsed;
    }
  } catch {}

  // 3. Double-escaped JSON: \"type\":\"service_account\"
  try {
    if (raw.includes('\\"')) {
      const unescaped = raw.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
      const parsed = JSON.parse(unescaped);
      if (parsed?.project_id && parsed?.client_email && parsed?.private_key) {
        return parsed;
      }
    }
  } catch {}

  // 4. Base64 encoded JSON
  try {
    const decoded = Buffer.from(raw, 'base64').toString('utf8');
    if (decoded.trim().startsWith('{')) {
      const parsed = JSON.parse(decoded);
      if (parsed?.project_id && parsed?.client_email && parsed?.private_key) {
        return parsed;
      }
    }
  } catch {}

  return null;
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

  // Ensure escaped \n characters in private key are converted to actual newlines
  let privateKey = serviceAccount.private_key;
  if (privateKey && privateKey.includes('\\n')) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signatureInput);
  const signature = base64url(signer.sign(privateKey));
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
    // Owner setup pending - Firebase service account not configured in Vercel environment
    console.info('[notify] FIREBASE_SERVICE_ACCOUNT_JSON not configured in environment. In-app notification and web push alert preserved; Android system push requires owner to set FIREBASE_SERVICE_ACCOUNT_JSON.');
    return false;
  }

  const serviceAccount = parseServiceAccount(rawServiceAccount);
  if (!serviceAccount || !serviceAccount.project_id || !serviceAccount.client_email || !serviceAccount.private_key) {
    console.warn('[notify] Incomplete or unparseable FIREBASE_SERVICE_ACCOUNT_JSON structure');
    return false;
  }

  try {

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
          ttl: '86400s',
          collapse_key: payload.data?.taskId ? `task-${payload.data.taskId}` : 'vigilamc_tasks',
          notification: {
            channel_id: 'vigilamc-tasks',
            color: '#EA580C',
            icon: 'ic_stat_fire',
            sound: 'default',
            default_sound: true,
            default_vibrate_timings: true,
            notification_priority: 'PRIORITY_MAX',
            visibility: 'PUBLIC',
            notification_count: 1,
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
      console.warn(`[notify] FCM v1 send failed (${response.status}): ${errBody}`);
      // Clean up stale or unregistered tokens so subsequent dispatches do not fail
      if (
        response.status === 404 ||
        errBody.includes('UNREGISTERED') ||
        errBody.includes('NOT_FOUND') ||
        errBody.includes('INVALID_ARGUMENT')
      ) {
        console.info(`[notify] Deleting unregistered/stale FCM token ${fcmToken.slice(0, 10)}... from DB`);
        await (db as any).deviceToken.deleteMany({
          where: { fcmToken },
        }).catch(() => null);
      }
      return false;
    }

    return true;
  } catch (err: any) {
    console.warn('[notify] Error dispatching FCM message:', err?.message || err);
    return false;
  }
}

/**
 * Route a push to the right provider: iOS devices register raw APNs tokens, Android devices register FCM tokens.
 */
export async function sendPushToDevice(
  device: { fcmToken: string; platform?: string | null },
  payload: {
    title: string;
    body: string;
    data?: Record<string, string>;
  }
): Promise<boolean> {
  if (device.platform === 'ios' || isApnsDeviceToken(device.fcmToken)) {
    return sendApnsMessage(device.fcmToken, payload);
  }
  return sendFcmMessage(device.fcmToken, payload);
}

interface NotifyAssignmentParams {
  type: 'WORK_ORDER' | 'BUILDING';
  technicianId: string;
  actionType?: 'ASSIGN' | 'RESCHEDULE';
  assetTag?: string;
  organizationId?: string | null;
  title?: string;
  message?: string;
  taskTitle?: string;
  buildingName?: string;
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

    // 1. Resolve technician details: preferred language and technician name
    let lang: SupportedLanguage = 'en';
    let technicianName = 'Technician';
    try {
      const techUser = await (db as any).userProfile.findUnique({
        where: { id: technicianId },
        select: { fullName: true, employeeId: true, preferredLanguage: true },
      });
      if (techUser?.preferredLanguage && TRANSLATIONS[techUser.preferredLanguage as SupportedLanguage]) {
        lang = techUser.preferredLanguage as SupportedLanguage;
      }
      technicianName = techUser?.fullName?.trim() || techUser?.employeeId?.trim() || 'Technician';
    } catch (langErr) {
      console.warn('[notify] Could not determine technician details, defaulting to en:', langErr);
    }

    const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;

    let resolvedTitle = params.title;
    let resolvedMessage = params.message;
    let resolvedBuildingName = params.buildingName;

    if (!resolvedBuildingName && taskId) {
      try {
        const wo = await (db as any).workOrder.findUnique({
          where: { id: taskId },
          select: { building: { select: { name: true } } },
        });
        if (wo?.building?.name) {
          resolvedBuildingName = wo.building.name;
        }
      } catch {}
    }

    if (params.type === 'WORK_ORDER') {
      if (params.actionType === 'RESCHEDULE') {
        const titleTemplate =
          dict.pushTaskRescheduledTitle ||
          TRANSLATIONS.en.pushTaskRescheduledTitle ||
          'Task re-scheduled';
        resolvedTitle = `${technicianName}: ${titleTemplate}`;
        const dueFormatted = dueDate
          ? new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(dueDate)
          : 'soon';
        const tagFormatted = params.assetTag || params.taskTitle || 'Asset';
        const bodyTemplate =
          dict.pushTaskRescheduledBody ||
          TRANSLATIONS.en.pushTaskRescheduledBody ||
          'Due date changed to {dueDate} for {assetTag}';
        resolvedMessage = bodyTemplate
          .replace('{dueDate}', dueFormatted)
          .replace('{assetTag}', tagFormatted);
      } else {
        const titleTemplate =
          dict.pushAssignedTitle ||
          dict.pushTaskAssignedTitle ||
          TRANSLATIONS.en.pushTaskAssignedTitle ||
          'New Task Assigned';
        resolvedTitle = `${technicianName}: ${titleTemplate}`;
        const taskName = params.taskTitle || params.title || 'Work Order';
        const bldgPart = resolvedBuildingName ? ` · ${resolvedBuildingName}` : '';
        const dueStr = dueDate
          ? ` · Due ${new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short' }).format(dueDate)}`
          : '';
        resolvedMessage = `${taskName}${bldgPart}${dueStr}`;
      }
    } else if (params.type === 'BUILDING') {
      const titleTemplate =
        dict.pushBuildingAssignedTitle ||
        TRANSLATIONS.en.pushBuildingAssignedTitle ||
        'New Building Assignment';
      resolvedTitle = `${technicianName}: ${titleTemplate}`;
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
    let deviceTokens: Array<{ fcmToken: string; platform: string | null }> = [];
    try {
      deviceTokens = await (db as any).deviceToken.findMany({
        where: { technicianId },
        select: { fcmToken: true, platform: true },
      });
    } catch (tokenErr) {
      console.warn('[notify] Could not query device tokens:', tokenErr);
    }

    if (!deviceTokens || deviceTokens.length === 0) {
      return;
    }

    // 4. Dispatch push (FCM for Android, APNs for iOS) to each device token
    let anyPushSuccess = false;
    const fcmData: Record<string, string> = {
      type: 'task_assigned',
      taskId: taskId || '',
      link: link || (taskId ? `/technician?taskId=${taskId}` : '/technician'),
      ...(dueDate ? { dueDate: dueDate.toISOString() } : {}),
      ...(resolvedBuildingName ? { building: resolvedBuildingName } : {}),
      technicianName,
    };

    for (const dt of deviceTokens) {
      const ok = await sendPushToDevice(dt, {
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
