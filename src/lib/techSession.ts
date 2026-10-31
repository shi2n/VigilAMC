import crypto from 'crypto';
import { db } from '@/lib/db';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { headers, cookies } from 'next/headers';
import { getOrCreateAgencySubscription } from '@/lib/plans';

export const TECH_SESSION_COOKIE = 'vigil_tech_session';

const TOKEN_EXPIRY_SECONDS = 30 * 24 * 60 * 60; // 30 days

function getSecretKey(): string {
  const secret =
    process.env.NEXTAUTH_SECRET ||
    process.env.SUPABASE_JWT_SECRET ||
    process.env.DATABASE_URL ||
    'vigilamc-secure-default-key-production-safety';
  return secret;
}

/**
 * Hash a 6-digit PIN or password using Node crypto scrypt with random salt
 */
export function hashPin(pin: string): string {
  const clean = String(pin || '').trim();
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(clean, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

/**
 * Verify a PIN against a stored scrypt hash
 */
export function verifyPin(pin: string, storedHash?: string | null): boolean {
  if (!pin || !storedHash || !storedHash.includes(':')) {
    return false;
  }
  try {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return false;
    const derived = crypto.scryptSync(String(pin).trim(), salt, 64);
    const storedBuf = Buffer.from(key, 'hex');
    if (derived.length !== storedBuf.length) return false;
    return crypto.timingSafeEqual(derived, storedBuf);
  } catch (err) {
    console.error('Error verifying pin:', err);
    return false;
  }
}

export interface TechSessionPayload {
  userId: string;
  orgId: string;
  role: string;
  email?: string;
  iat?: number;
  exp?: number;
}

/**
 * Sign a session token using HMAC-SHA256
 */
export function signTechSessionToken(payload: {
  userId: string;
  orgId: string;
  role: string;
  email?: string;
}): string {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: TechSessionPayload = {
    ...payload,
    iat: now,
    exp: now + TOKEN_EXPIRY_SECONDS,
  };

  const payloadB64 = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const secret = getSecretKey();
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payloadB64);
  const sig = hmac.digest('base64url');

  return `${payloadB64}.${sig}`;
}

/**
 * Verify a session token using HMAC-SHA256
 */
export function verifyTechSessionToken(token: string): TechSessionPayload | null {
  if (!token || typeof token !== 'string' || !token.includes('.')) {
    return null;
  }
  try {
    const [payloadB64, sig] = token.split('.');
    if (!payloadB64 || !sig) return null;

    const secret = getSecretKey();
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payloadB64);
    const expectedSig = hmac.digest('base64url');

    const expectedBuf = Buffer.from(expectedSig);
    const actualBuf = Buffer.from(sig);
    if (expectedBuf.length !== actualBuf.length || !crypto.timingSafeEqual(expectedBuf, actualBuf)) {
      return null;
    }

    const jsonStr = Buffer.from(payloadB64, 'base64url').toString('utf8');
    const parsed = JSON.parse(jsonStr) as TechSessionPayload;

    if (!parsed || !parsed.userId) return null;
    if (parsed.exp && parsed.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }

    return parsed;
  } catch (err) {
    return null;
  }
}

/**
 * Extracts a cookie value from a Request or header
 */
export function extractCookie(req?: Request, cookieName: string = TECH_SESSION_COOKIE): string | null {
  try {
    // 1. Try from request headers directly
    const cookieHeader = req?.headers?.get('cookie');
    if (cookieHeader) {
      const match = cookieHeader
        .split(';')
        .map((c) => c.trim())
        .find((c) => c.startsWith(`${cookieName}=`));
      if (match) {
        return decodeURIComponent(match.substring(cookieName.length + 1));
      }
    }

    // 2. Try Next.js cookies() store
    try {
      const cookieStore = cookies();
      const val = cookieStore.get(cookieName)?.value;
      if (val) return val;
    } catch {
      // Ignored outside Next.js request lifecycle
    }
  } catch {
    // ignore
  }
  return null;
}

export interface AuthenticatedActor {
  user: {
    id: string;
    email: string;
  };
  profile: any;
  organization: any;
  subscription: any;
}

/**
 * Unified authentication helper for Technicians, Staff, and Admins:
 * 1. Checks HttpOnly 'vigil_tech_session' cookie -> loads Prisma UserProfile directly.
 * 2. Checks Bearer token via Supabase Auth -> loads/syncs Prisma UserProfile.
 * 3. Checks standard Supabase SSR cookies -> loads/syncs Prisma UserProfile.
 */
export async function getAuthenticatedActor(req?: Request): Promise<AuthenticatedActor | null> {
  try {
    // --- METHOD 1: Check vigil_tech_session cookie OR Bearer header token ---
    let sessionToken = extractCookie(req, TECH_SESSION_COOKIE);

    let authHeader = req?.headers?.get('authorization') || req?.headers?.get('Authorization');
    if (!authHeader) {
      try {
        const headerStore = headers();
        authHeader = headerStore.get('authorization') || headerStore.get('Authorization');
      } catch {
        // ignore
      }
    }

    if (!sessionToken && authHeader?.startsWith('Bearer ')) {
      const candidate = authHeader.substring(7).trim();
      if (candidate.includes('.')) {
        const testPayload = verifyTechSessionToken(candidate);
        if (testPayload) {
          sessionToken = candidate;
        }
      }
    }

    if (sessionToken) {
      const payload = verifyTechSessionToken(sessionToken);
      if (payload && payload.userId) {
        const profile = await (db as any).userProfile.findUnique({
          where: { id: payload.userId },
          include: {
            organization: {
              include: {
                subscription: true,
              },
            },
            assignedBuildings: {
              include: {
                building: true,
              },
            },
          },
        });

        if (profile) {
          // Immediately reject deactivated accounts
          if (profile.status === 'INACTIVE' || profile.status === 'SUSPENDED') {
            return null;
          }

          // Update lastLoginAt if older than 10 mins
          const lastLogin = profile.lastLoginAt ? new Date(profile.lastLoginAt).getTime() : 0;
          if (Date.now() - lastLogin > 10 * 60 * 1000) {
            (db as any).userProfile
              .update({
                where: { id: profile.id },
                data: { lastLoginAt: new Date() },
              })
              .catch(() => {});
          }

          let subscription = profile.organization?.subscription || null;
          if (!subscription && profile.organizationId) {
            subscription = await getOrCreateAgencySubscription(profile.organizationId).catch(() => null);
          }

          return {
            user: {
              id: profile.id,
              email: profile.email,
            },
            profile,
            organization: profile.organization || null,
            subscription,
          };
        }
      }
    }

    // --- METHOD 2 & 3: Supabase Bearer Header & Supabase SSR Cookies ---
    const supabase = createServerSupabaseClient();
    let authUser: any = null;

    if (!authHeader) {
      authHeader = req?.headers?.get('authorization') || req?.headers?.get('Authorization');
      if (!authHeader) {
        try {
          const headerStore = headers();
          authHeader = headerStore.get('authorization') || headerStore.get('Authorization');
        } catch {
          // ignore
        }
      }
    }

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      if (token) {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser(token);
        if (!error && user) {
          authUser = user;
        }
      }
    }

    if (!authUser) {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (!error && user) {
        authUser = user;
      }
    }

    if (!authUser) {
      return null;
    }

    let profile = await (db as any).userProfile.findUnique({
      where: { id: authUser.id },
      include: {
        organization: {
          include: {
            subscription: true,
          },
        },
        assignedBuildings: {
          include: {
            building: true,
          },
        },
      },
    });

    if (!profile) {
      const explicitRole = authUser.user_metadata?.role === 'TECHNICIAN' ? 'TECHNICIAN' : 'ORG_ADMIN';
      const explicitOrgId = authUser.user_metadata?.organizationId;
      let orgId = explicitOrgId;

      const rawMetaName = (authUser.user_metadata?.full_name as string)?.trim();
      const safeFullName =
        rawMetaName && rawMetaName.toLowerCase() !== 'jordan michael'
          ? rawMetaName
          : authUser.email?.split('@')[0] || 'User';

      if (!orgId && explicitRole === 'ORG_ADMIN') {
        const agencyName =
          (authUser.user_metadata?.agency_name as string) || `${safeFullName} Fire Agency`;

        const org = await (db as any).organization.create({
          data: {
            name: agencyName,
            email: authUser.email || '',
            phone: (authUser.user_metadata?.phone as string) || '',
          },
        });
        orgId = org.id;
      }

      profile = await (db as any).userProfile.create({
        data: {
          id: authUser.id,
          email: authUser.email || '',
          fullName: safeFullName,
          role: explicitRole,
          status: 'ACTIVE',
          phone: authUser.user_metadata?.phone || '',
          employeeId: authUser.user_metadata?.employeeId || null,
          organizationId: orgId || null,
          lastLoginAt: new Date(),
        },
        include: {
          organization: {
            include: {
              subscription: true,
            },
          },
          assignedBuildings: {
            include: {
              building: true,
            },
          },
        },
      });
    }

    if (profile.status === 'INACTIVE' || profile.status === 'SUSPENDED') {
      return null;
    }

    let subscription = profile.organization?.subscription || null;
    if (!subscription && profile.organizationId) {
      subscription = await getOrCreateAgencySubscription(profile.organizationId).catch(() => null);
    }

    return {
      user: {
        id: authUser.id,
        email: authUser.email || '',
      },
      profile,
      organization: profile.organization || null,
      subscription,
    };
  } catch (error) {
    console.error('Error in getAuthenticatedActor:', error);
    return null;
  }
}
