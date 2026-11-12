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
      const parts = cookieHeader.split(';').map((c) => c.trim());
      const match = parts.find((c) => c.startsWith(`${cookieName}=`));
      if (match) {
        return decodeURIComponent(match.substring(cookieName.length + 1));
      }
      // Reassemble chunked cookies from headers: cookieName.0, cookieName.1, ...
      const prefix = `${cookieName}.`;
      const chunks: { idx: number; val: string }[] = [];
      for (const part of parts) {
        if (part.startsWith(prefix)) {
          const eqIdx = part.indexOf('=');
          if (eqIdx !== -1) {
            const num = parseInt(part.slice(prefix.length, eqIdx), 10);
            if (!isNaN(num)) {
              chunks.push({ idx: num, val: decodeURIComponent(part.slice(eqIdx + 1)) });
            }
          }
        }
      }
      if (chunks.length > 0) {
        chunks.sort((a, b) => a.idx - b.idx);
        return chunks.map((c) => c.val).join('');
      }
    }

    // 2. Try Next.js cookies() store
    try {
      const cookieStore = cookies();
      const val = cookieStore.get(cookieName)?.value;
      if (val) return val;
      const all = cookieStore.getAll();
      const prefix = `${cookieName}.`;
      const chunks: { idx: number; val: string }[] = [];
      for (const c of all) {
        if (c.name.startsWith(prefix)) {
          const num = parseInt(c.name.slice(prefix.length), 10);
          if (!isNaN(num)) {
            chunks.push({ idx: num, val: c.value });
          }
        }
      }
      if (chunks.length > 0) {
        chunks.sort((a, b) => a.idx - b.idx);
        return chunks.map((c) => c.val).join('');
      }
    } catch {
      // Ignored outside Next.js request lifecycle
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Reassembles chunked or non-chunked Supabase auth token cookie values:
 * Matches `sb-*-auth-token` or `sb-*-auth-token.0`, `sb-*-auth-token.1`, ...
 * Parses JSON session or returns string access token.
 */
export function extractSupabaseTokenFromCookies(req?: Request): string | null {
  try {
    const cookieHeader = req?.headers?.get('cookie') || '';
    const chunkMap: Record<string, { idx: number; val: string }[]> = {};
    const directTokens: string[] = [];

    // 1. Check req header cookies
    if (cookieHeader) {
      const parts = cookieHeader.split(';').map((c) => c.trim());
      for (const part of parts) {
        const eqIdx = part.indexOf('=');
        if (eqIdx === -1) continue;
        const name = part.slice(0, eqIdx).trim();
        const rawVal = decodeURIComponent(part.slice(eqIdx + 1).trim());

        if (/^sb-[a-z0-9_-]+-auth-token$/i.test(name)) {
          directTokens.push(rawVal);
        } else {
          const match = name.match(/^(sb-[a-z0-9_-]+-auth-token)\.(\d+)$/i);
          if (match) {
            const base = match[1];
            const idx = parseInt(match[2], 10);
            if (!chunkMap[base]) chunkMap[base] = [];
            chunkMap[base].push({ idx, val: rawVal });
          }
        }
      }
    }

    // 2. Check Next.js cookies() store
    try {
      const cookieStore = cookies();
      const all = cookieStore.getAll();
      for (const c of all) {
        if (/^sb-[a-z0-9_-]+-auth-token$/i.test(c.name)) {
          directTokens.push(c.value);
        } else {
          const match = c.name.match(/^(sb-[a-z0-9_-]+-auth-token)\.(\d+)$/i);
          if (match) {
            const base = match[1];
            const idx = parseInt(match[2], 10);
            if (!chunkMap[base]) chunkMap[base] = [];
            chunkMap[base].push({ idx, val: c.value });
          }
        }
      }
    } catch {
      // Ignored outside Next.js request lifecycle
    }

    const candidates: string[] = [...directTokens];
    for (const base in chunkMap) {
      const chunks = chunkMap[base].sort((a, b) => a.idx - b.idx);
      candidates.push(chunks.map((c) => c.val).join(''));
    }

    for (let raw of candidates) {
      if (!raw) continue;
      if (raw.startsWith('base64-')) {
        try {
          raw = Buffer.from(raw.slice(7), 'base64').toString('utf8');
        } catch {}
      }
      try {
        const parsed = JSON.parse(raw);
        if (parsed?.access_token) return parsed.access_token;
        if (Array.isArray(parsed) && parsed[0]) return parsed[0];
      } catch {
        if (raw.split('.').length === 3) return raw;
      }
    }
  } catch {}
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
    let acceptedPath: 'BEARER_JWT' | 'CHUNKED_SB_COOKIE' | 'VTECH_SESSION' | 'SB_SSR_COOKIE' | null = null;

    // --- PRIORITY 1: Bearer Access Token (Supabase auth.getUser(jwt) or Tech session) ---
    let authHeader = req?.headers?.get('authorization') || req?.headers?.get('Authorization');
    if (!authHeader) {
      try {
        const headerStore = headers();
        authHeader = headerStore.get('authorization') || headerStore.get('Authorization');
      } catch {}
    }

    const supabase = createServerSupabaseClient();
    let authUser: any = null;

    if (authHeader?.startsWith('Bearer ')) {
      const bearerToken = authHeader.substring(7).trim();
      if (bearerToken) {
        // Try Supabase auth.getUser(jwt)
        const { data: { user }, error } = await supabase.auth.getUser(bearerToken);
        if (!error && user) {
          authUser = user;
          acceptedPath = 'BEARER_JWT';
        } else if (bearerToken.includes('.')) {
          // Check if it's a signed tech session token
          const techPayload = verifyTechSessionToken(bearerToken);
          if (techPayload?.userId) {
            const profile = await (db as any).userProfile.findUnique({
              where: { id: techPayload.userId },
              include: {
                organization: { include: { subscription: true } },
                assignedBuildings: { include: { building: true } },
              },
            });
            if (profile && profile.status !== 'INACTIVE' && profile.status !== 'SUSPENDED') {
              console.log('[Auth] Accepted path: VTECH_SESSION (Bearer)');
              let subscription = profile.organization?.subscription || null;
              if (!subscription && profile.organizationId) {
                subscription = await getOrCreateAgencySubscription(profile.organizationId).catch(() => null);
              }
              return {
                user: { id: profile.id, email: profile.email },
                profile,
                organization: profile.organization || null,
                subscription,
              };
            }
          }
        }
      }
    }

    // --- PRIORITY 2: Chunk-reassembled sb-*-auth-token.{n} cookies ---
    if (!authUser) {
      const sbCookieToken = extractSupabaseTokenFromCookies(req);
      if (sbCookieToken) {
        const { data: { user }, error } = await supabase.auth.getUser(sbCookieToken);
        if (!error && user) {
          authUser = user;
          acceptedPath = 'CHUNKED_SB_COOKIE';
        }
      }
    }

    // --- PRIORITY 3: Standard Supabase SSR Cookies fallback ---
    if (!authUser) {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!error && user) {
        authUser = user;
        acceptedPath = 'SB_SSR_COOKIE';
      }
    }

    // --- PRIORITY 4: vigil_tech_session / vtech_session cookie ---
    if (!authUser) {
      const sessionToken = extractCookie(req, TECH_SESSION_COOKIE) || extractCookie(req, 'vtech_session');
      const payload = sessionToken ? verifyTechSessionToken(sessionToken) : null;
      if (payload?.userId) {
        const profile = await (db as any).userProfile.findUnique({
          where: { id: payload.userId },
          include: {
            organization: { include: { subscription: true } },
            assignedBuildings: { include: { building: true } },
          },
        });
        if (profile && profile.status !== 'INACTIVE' && profile.status !== 'SUSPENDED') {
          console.log('[Auth] Accepted path: VTECH_SESSION (Cookie)');
          let subscription = profile.organization?.subscription || null;
          if (!subscription && profile.organizationId) {
            subscription = await getOrCreateAgencySubscription(profile.organizationId).catch(() => null);
          }
          return {
            user: { id: profile.id, email: profile.email },
            profile,
            organization: profile.organization || null,
            subscription,
          };
        }
      }
    }

    if (!authUser) {
      return null;
    }

    console.log(`[Auth] Accepted path: ${acceptedPath || 'SUPABASE_AUTH'}`);

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
