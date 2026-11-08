import { NextResponse } from 'next/server';
import { headers, cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { extractCookie, TECH_SESSION_COOKIE, verifyTechSessionToken } from '@/lib/techSession';

const DEFAULT_SUPER_ADMIN_FALLBACK = [
  'test-owner@example.com',
  'vigilamc@gmail.com',
  'shaizan@vigilamc.com',
  'shaizansiddiqui99@gmail.com',
];

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
 * Evaluates current caller session against SUPER_ADMIN_EMAILS.
 * - Supports Supabase Auth session cookie and Authorization: Bearer <jwt>
 * - Detects technician cookie sessions (TECH_SESSION_COOKIE) as signed-in NON_OWNER
 */
export async function verifyOwnerSession(req?: Request): Promise<OwnerAuthState> {
  try {
    let authUser: { id: string; email?: string | null } | null = null;

    let authHeader = req?.headers?.get('authorization') || req?.headers?.get('Authorization') || null;
    if (!authHeader) {
      try {
        const h = headers();
        authHeader = h.get('authorization') || h.get('Authorization');
      } catch {
        // Ignored outside Next.js request context
      }
    }

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7).trim();
      if (token) {
        try {
          const { supabaseUrl, supabaseKey } = getSupabaseConfig();
          const directClient = createClient(supabaseUrl, supabaseKey, {
            auth: { persistSession: false, autoRefreshToken: false },
          });
          const { data, error } = await directClient.auth.getUser(token);
          if (!error && data?.user) {
            authUser = data.user;
          }
        } catch {
          // Ignore malformed token
        }
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

    // Also check if caller is signed in via technician session cookie or technician Bearer token
    let techTokenFromCookie = extractCookie(req, TECH_SESSION_COOKIE);
    if (!techTokenFromCookie) {
      try {
        const cookieStore = cookies();
        techTokenFromCookie = cookieStore.get(TECH_SESSION_COOKIE)?.value || null;
      } catch {
        // Ignored outside Next.js cookies() scope
      }
    }
    const techTokenFromBearer =
      authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
    const candidateTechToken = techTokenFromCookie || techTokenFromBearer;
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
