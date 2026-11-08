import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { headers, cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { extractCookie, TECH_SESSION_COOKIE, verifyTechSessionToken } from '@/lib/techSession';
import { db } from '@/lib/db';

export const OWNER_SESSION_COOKIE = 'vigil_owner_session';
export const DEFAULT_OWNER_LOGIN_ID = 'shaizan@vigilamc.com';
export const DEFAULT_OWNER_INITIAL_PASSWORD = 'VigilOwner@2026!';

const DEFAULT_SUPER_ADMIN_FALLBACK = [
  'test-owner@example.com',
  'vigilamc@gmail.com',
  'shaizan@vigilamc.com',
  'shaizansiddiqui99@gmail.com',
];

function getOwnerSigningSecret(): string {
  return (
    process.env.SUPABASE_JWT_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.DATABASE_URL ||
    'vigilamc-owner-console-hmac-secret-2026'
  );
}

export function hashOwnerPassword(plainPassword: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto
    .pbkdf2Sync(plainPassword, salt, 100000, 32, 'sha256')
    .toString('hex');
  return `pbkdf2_sha256$${salt}$${derived}`;
}

export function verifyOwnerPassword(plainPassword: string, storedHash: string): boolean {
  try {
    if (!storedHash || !storedHash.startsWith('pbkdf2_sha256$')) return false;
    const parts = storedHash.split('$');
    if (parts.length !== 3) return false;
    const [, salt, originalHex] = parts;
    const derivedHex = crypto
      .pbkdf2Sync(plainPassword, salt, 100000, 32, 'sha256')
      .toString('hex');
    const a = Buffer.from(originalHex, 'hex');
    const b = Buffer.from(derivedHex, 'hex');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function ensureOwnerCredential(): Promise<{
  id: string;
  loginId: string;
  passwordHash: string;
  updatedBy: string | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}> {
  const existing = await (db as any).ownerCredential.findUnique({
    where: { id: 'singleton' },
  });
  if (existing) {
    return existing;
  }
  const initialHash = hashOwnerPassword(DEFAULT_OWNER_INITIAL_PASSWORD);
  return await (db as any).ownerCredential.create({
    data: {
      id: 'singleton',
      loginId: DEFAULT_OWNER_LOGIN_ID,
      passwordHash: initialHash,
      updatedBy: 'system-init',
    },
  });
}

export interface OwnerSessionPayload {
  loginId: string;
  iat: number;
  exp: number;
}

export function createOwnerSessionToken(loginId: string): string {
  const nowSec = Math.floor(Date.now() / 1000);
  const payload: OwnerSessionPayload = {
    loginId: loginId.trim(),
    iat: nowSec,
    exp: nowSec + 7 * 24 * 60 * 60, // 7 days
  };
  const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = crypto
    .createHmac('sha256', getOwnerSigningSecret())
    .update(encoded)
    .digest('base64url');
  return `vowner.${encoded}.${sig}`;
}

export function verifyOwnerSessionToken(token?: string | null): OwnerSessionPayload | null {
  try {
    if (!token || !token.startsWith('vowner.')) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [, encoded, sig] = parts;
    const expectedSig = crypto
      .createHmac('sha256', getOwnerSigningSecret())
      .update(encoded)
      .digest('base64url');
    const a = Buffer.from(sig);
    const b = Buffer.from(expectedSig);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as OwnerSessionPayload;
    const nowSec = Math.floor(Date.now() / 1000);
    if (!payload.loginId || !payload.exp || payload.exp < nowSec) return null;
    return payload;
  } catch {
    return null;
  }
}

function getSupabaseConfig() {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseUrl =
    envUrl && !envUrl.includes('hkjaaqpfkpflifqekztk')
      ? envUrl
      : 'https://hgsgboleolmgrggzodxa.supabase.co';

  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabaseKey =
    envKey && !envUrl.includes('hkjaaqpfkpflifqekztk')
      ? envKey
      : 'sb_publishable_r6t5us-FRTOa2Pogh7XBEg_gEvUQ4he';

  return { supabaseUrl, supabaseKey };
}

/**
 * Reads SUPER_ADMIN_EMAILS strictly on the server.
 * Never exposed via NEXT_PUBLIC_* or client bundles.
 */
export function getSuperAdminEmails(): string[] {
  const raw = process.env.SUPER_ADMIN_EMAILS;
  if (typeof raw === 'string' && raw.trim().length > 0) {
    return raw
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);
  }
  return DEFAULT_SUPER_ADMIN_FALLBACK;
}

export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  if (!normalized) return false;
  return getSuperAdminEmails().includes(normalized);
}

export interface OwnerAuthState {
  status: 'SIGNED_OUT' | 'NON_OWNER' | 'OWNER';
  email: string | null;
  userId: string | null;
}

/**
 * Evaluates current caller session against:
 * 1) Dedicated Owner Login ID & Password session cookie (vigil_owner_session)
 * 2) Supabase Auth session cookie / Authorization Bearer against SUPER_ADMIN_EMAILS
 * 3) Detects technician cookie sessions (TECH_SESSION_COOKIE) as signed-in NON_OWNER
 */
export async function verifyOwnerSession(req?: Request): Promise<OwnerAuthState> {
  try {
    let authHeader = req?.headers?.get('authorization') || req?.headers?.get('Authorization') || null;
    if (!authHeader) {
      try {
        const h = headers();
        authHeader = h.get('authorization') || h.get('Authorization');
      } catch {
        // Ignored outside Next.js request context
      }
    }

    // 1. Check dedicated Owner Console session cookie (or Bearer vowner.*)
    let ownerCookieToken = extractCookie(req, OWNER_SESSION_COOKIE);
    if (!ownerCookieToken) {
      try {
        const cookieStore = cookies();
        ownerCookieToken = cookieStore.get(OWNER_SESSION_COOKIE)?.value || null;
      } catch {
        // Ignored outside Next.js cookies() scope
      }
    }
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
    const candidateOwnerToken =
      ownerCookieToken || (bearerToken?.startsWith('vowner.') ? bearerToken : null);
    if (candidateOwnerToken) {
      const ownerPayload = verifyOwnerSessionToken(candidateOwnerToken);
      if (ownerPayload) {
        return {
          status: 'OWNER',
          email: ownerPayload.loginId,
          userId: 'owner-credential',
        };
      }
    }

    // 2. Check Supabase Auth Bearer or SSR session cookie against SUPER_ADMIN_EMAILS
    let authUser: { id: string; email?: string | null } | null = null;

    if (bearerToken && !bearerToken.startsWith('vowner.')) {
      try {
        const { supabaseUrl, supabaseKey } = getSupabaseConfig();
        const directClient = createClient(supabaseUrl, supabaseKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const { data, error } = await directClient.auth.getUser(bearerToken);
        if (!error && data?.user) {
          authUser = data.user;
        }
      } catch {
        // Ignore malformed token
      }
    }

    if (!authUser) {
      try {
        const supabase = createServerSupabaseClient();
        const { data, error } = await supabase.auth.getUser();
        if (!error && data?.user) {
          authUser = data.user;
        }
      } catch {
        // Outside Next.js cookies() scope
      }
    }

    if (authUser && authUser.email) {
      const email = authUser.email.trim().toLowerCase();
      if (isSuperAdminEmail(email)) {
        return {
          status: 'OWNER',
          email,
          userId: authUser.id,
        };
      }
      return {
        status: 'NON_OWNER',
        email,
        userId: authUser.id,
      };
    }

    // 3. Also check if caller is signed in via technician session cookie or technician Bearer token
    let techTokenFromCookie = extractCookie(req, TECH_SESSION_COOKIE);
    if (!techTokenFromCookie) {
      try {
        const cookieStore = cookies();
        techTokenFromCookie = cookieStore.get(TECH_SESSION_COOKIE)?.value || null;
      } catch {
        // Ignored outside Next.js cookies() scope
      }
    }
    const candidateTechToken = techTokenFromCookie || bearerToken;
    if (candidateTechToken) {
      const payload = verifyTechSessionToken(candidateTechToken);
      if (payload) {
        return {
          status: 'NON_OWNER',
          email: payload.email || null,
          userId: payload.userId,
        };
      }
    }

    return {
      status: 'SIGNED_OUT',
      email: null,
      userId: null,
    };
  } catch {
    return {
      status: 'SIGNED_OUT',
      email: null,
      userId: null,
    };
  }
}

/**
 * Gate helper for all /api/owner/* endpoints.
 * Always returns HTTP 404 (Not found) for any non-owner caller so existence is never confirmed.
 */
export async function requireOwnerApi(req?: Request): Promise<
  | { ok: true; owner: { email: string; userId: string } }
  | { ok: false; response: NextResponse }
> {
  const state = await verifyOwnerSession(req);
  if (state.status !== 'OWNER' || !state.email || !state.userId) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Not found' },
        {
          status: 404,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
          },
        }
      ),
    };
  }
  return {
    ok: true,
    owner: {
      email: state.email,
      userId: state.userId,
    },
  };
}
