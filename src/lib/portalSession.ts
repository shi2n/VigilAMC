import crypto from 'crypto';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

export const PORTAL_COOKIE_NAME = 'vigil_portal_session';
const SESSION_SECRET =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXTAUTH_SECRET ||
  'vigilamc-secure-portal-session-secret-key-2026';

// In-memory sliding window rate-limiter: max 5 requests per hour per email
interface RateLimitEntry {
  count: number;
  resetAt: number;
}
const loginRateLimitMap = new Map<string, RateLimitEntry>();

// In-memory lookup rate-limiter for /verify: max 30 requests per minute per IP
const verifyRateLimitMap = new Map<string, RateLimitEntry>();

export function checkPortalLoginRateLimit(email: string): { allowed: boolean; remaining: number } {
  const key = email.trim().toLowerCase();
  const now = Date.now();
  const entry = loginRateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    loginRateLimitMap.set(key, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return { allowed: true, remaining: 4 };
  }

  if (entry.count >= 5) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  return { allowed: true, remaining: 5 - entry.count };
}

export function checkVerifyRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const key = ip || 'anonymous';
  const now = Date.now();
  const entry = verifyRateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    verifyRateLimitMap.set(key, { count: 1, resetAt: now + 60 * 1000 });
    return { allowed: true, remaining: 29 };
  }

  if (entry.count >= 30) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  return { allowed: true, remaining: 30 - entry.count };
}

export function generateMagicToken(): { rawToken: string; tokenHash: string; expiresAt: Date } {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
  return { rawToken, tokenHash, expiresAt };
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token.trim()).digest('hex');
}

export interface PortalSessionData {
  portalUserId: string;
  email: string;
  clientOrgId: string;
  organizationId: string;
  issuedAt: number;
}

export function signPortalSession(data: Omit<PortalSessionData, 'issuedAt'>): string {
  const payload: PortalSessionData = {
    ...data,
    issuedAt: Date.now(),
  };
  const jsonStr = JSON.stringify(payload);
  const b64 = Buffer.from(jsonStr).toString('base64url');
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(b64).digest('base64url');
  return `${b64}.${signature}`;
}

export function verifyPortalSessionToken(rawToken: string): PortalSessionData | null {
  if (!rawToken || !rawToken.includes('.')) return null;
  const [b64, signature] = rawToken.split('.');
  if (!b64 || !signature) return null;

  const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(b64).digest('base64url');
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  try {
    const jsonStr = Buffer.from(b64, 'base64url').toString('utf8');
    const parsed = JSON.parse(jsonStr) as PortalSessionData;
    // Session token expires in 7 days
    if (Date.now() - parsed.issuedAt > 7 * 24 * 60 * 60 * 1000) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export interface PortalActor {
  portalUser: any;
  client: any;
  organization: any;
}

export async function getPortalActor(req?: Request): Promise<PortalActor | null> {
  try {
    let token: string | undefined;

    if (req) {
      const cookieHeader = req.headers.get('cookie') || '';
      const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${PORTAL_COOKIE_NAME}=([^;]+)`));
      if (match) {
        token = decodeURIComponent(match[1]);
      }
    }

    if (!token) {
      try {
        const cookieStore = cookies();
        token = cookieStore.get(PORTAL_COOKIE_NAME)?.value;
      } catch {
        // Not in server action context
      }
    }

    if (!token) return null;

    const sessionData = verifyPortalSessionToken(token);
    if (!sessionData) return null;

    const portalUser = await (db as any).portalUser.findUnique({
      where: { id: sessionData.portalUserId },
      include: {
        client: true,
        organization: true,
      },
    });

    if (!portalUser) return null;

    // Check if user has been revoked by admin
    if (portalUser.revokedAt) {
      return null;
    }

    // Check if agency has disabled client portal
    if (portalUser.organization && portalUser.organization.clientPortalEnabled === false) {
      return null;
    }

    return {
      portalUser,
      client: portalUser.client,
      organization: portalUser.organization,
    };
  } catch (err) {
    console.error('[Portal Auth Error]:', err);
    return null;
  }
}
