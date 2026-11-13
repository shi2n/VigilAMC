import crypto from 'crypto';
import http2 from 'http2';
import { db } from '@/lib/db';

const APNS_HOSTS = {
  production: 'https://api.push.apple.com',
  sandbox: 'https://api.sandbox.push.apple.com',
} as const;

type ApnsEnvironment = keyof typeof APNS_HOSTS;

interface ApnsConfig {
  keyId: string;
  teamId: string;
  bundleId: string;
  privateKey: string;
  environments: ApnsEnvironment[];
}

let cachedProviderToken: { token: string; issuedAt: number; keyId: string } | null = null;

function base64url(input: string | Buffer): string {
  const buf = typeof input === 'string' ? Buffer.from(input) : input;
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

/**
 * Capacitor's iOS push plugin reports the raw APNs device token as 64 hex characters,
 * whereas FCM registration tokens are ~150+ characters and contain a colon.
 */
export function isApnsDeviceToken(token: string | null | undefined): boolean {
  return typeof token === 'string' && /^[0-9a-fA-F]{64}$/.test(token.trim());
}

function getApnsConfig(): ApnsConfig | null {
  const keyId = (process.env.APNS_KEY_ID || '').trim();
  const teamId = (process.env.APNS_TEAM_ID || '').trim();
  const bundleId = (process.env.APNS_BUNDLE_ID || 'com.vigilamc').trim();
  let privateKey = (process.env.APNS_PRIVATE_KEY || '').trim();

  if (!keyId || !teamId || !privateKey) return null;

  if (!privateKey.includes('BEGIN PRIVATE KEY')) {
    try {
      privateKey = Buffer.from(privateKey, 'base64').toString('utf8').trim();
    } catch {
      return null;
    }
  }
  privateKey = privateKey.replace(/\\n/g, '\n');

  const envSetting = (process.env.APNS_ENVIRONMENT || '').trim().toLowerCase();
  const environments: ApnsEnvironment[] =
    envSetting === 'production' || envSetting === 'sandbox'
      ? [envSetting]
      : ['production', 'sandbox'];

  return { keyId, teamId, bundleId, privateKey, environments };
}

export function isApnsConfigured(): boolean {
  return getApnsConfig() !== null;
}

function getProviderToken(config: ApnsConfig): string {
  const now = Math.floor(Date.now() / 1000);
  // Apple rejects provider tokens older than 60 minutes and throttles refreshes faster than 20 minutes.
  if (
    cachedProviderToken &&
    cachedProviderToken.keyId === config.keyId &&
    now - cachedProviderToken.issuedAt < 50 * 60
  ) {
    return cachedProviderToken.token;
  }

  const header = base64url(JSON.stringify({ alg: 'ES256', kid: config.keyId }));
  const claims = base64url(JSON.stringify({ iss: config.teamId, iat: now }));
  const signingInput = `${header}.${claims}`;
  const signature = crypto.sign('sha256', Buffer.from(signingInput), {
    key: config.privateKey,
    dsaEncoding: 'ieee-p1363',
  });

  const token = `${signingInput}.${base64url(signature)}`;
  cachedProviderToken = { token, issuedAt: now, keyId: config.keyId };
  return token;
}

function postToApns(
  environment: ApnsEnvironment,
  deviceToken: string,
  headers: Record<string, string>,
  body: string
): Promise<{ status: number; reason?: string }> {
  return new Promise((resolve) => {
    let settled = false;
    const client = http2.connect(APNS_HOSTS[environment]);

    const finish = (result: { status: number; reason?: string }) => {
      if (settled) return;
      settled = true;
      client.close();
      resolve(result);
    };

    client.on('error', (err) => finish({ status: 0, reason: err.message }));
    client.setTimeout(10_000, () => {
      client.destroy();
      finish({ status: 0, reason: 'TIMEOUT' });
    });

    const req = client.request({
      ':method': 'POST',
      ':path': `/3/device/${deviceToken}`,
      ...headers,
    });

    let status = 0;
    let raw = '';
    req.setEncoding('utf8');
    req.on('response', (responseHeaders) => {
      status = Number(responseHeaders[':status']) || 0;
    });
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      let reason: string | undefined;
      try {
        reason = raw ? JSON.parse(raw).reason : undefined;
      } catch {}
      finish({ status, reason });
    });
    req.on('error', (err) => finish({ status: 0, reason: err.message }));
    req.end(body);
  });
}

/**
 * Dispatch an alert push to an iOS device via APNs HTTP/2 (token-based auth).
 */
export async function sendApnsMessage(
  deviceToken: string,
  payload: {
    title: string;
    body: string;
    data?: Record<string, string>;
  }
): Promise<boolean> {
  const config = getApnsConfig();
  if (!config) {
    console.info('[apns] APNS_KEY_ID / APNS_TEAM_ID / APNS_PRIVATE_KEY not configured. iOS system push requires the owner to set them in Vercel.');
    return false;
  }

  const cleanToken = deviceToken.trim();
  const customData: Record<string, string> = { ...(payload.data || {}) };
  delete customData.aps;
  const body = JSON.stringify({
    aps: {
      alert: { title: payload.title, body: payload.body },
      sound: 'default',
      badge: 1,
    },
    ...customData,
  });

  const collapseId = payload.data?.taskId ? `task-${payload.data.taskId}`.slice(0, 64) : undefined;

  try {
    const headers: Record<string, string> = {
      authorization: `bearer ${getProviderToken(config)}`,
      'apns-topic': config.bundleId,
      'apns-push-type': 'alert',
      'apns-priority': '10',
      'apns-expiration': String(Math.floor(Date.now() / 1000) + 86400),
      ...(collapseId ? { 'apns-collapse-id': collapseId } : {}),
    };

    for (let i = 0; i < config.environments.length; i++) {
      const environment = config.environments[i];
      const result = await postToApns(environment, cleanToken, headers, body);
      if (result.status === 200) return true;

      // App Store / TestFlight builds use production, Xcode debug builds use sandbox.
      const isLastAttempt = i === config.environments.length - 1;
      if (result.status === 400 && result.reason === 'BadDeviceToken' && !isLastAttempt) {
        continue;
      }

      console.warn(`[apns] Send failed (${environment} ${result.status}): ${result.reason || 'unknown'}`);
      if (result.status === 410 || (result.status === 400 && result.reason === 'BadDeviceToken')) {
        console.info(`[apns] Deleting unregistered iOS token ${cleanToken.slice(0, 10)}... from DB`);
        await (db as any).deviceToken.deleteMany({ where: { fcmToken: deviceToken } }).catch(() => null);
      }
      return false;
    }
  } catch (err: any) {
    console.warn('[apns] Error dispatching APNs message:', err?.message || err);
  }
  return false;
}
