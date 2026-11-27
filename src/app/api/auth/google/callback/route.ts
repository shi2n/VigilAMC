import crypto from 'crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { isFounderOwner } from '@/lib/founderAuth';

const GOOGLE_OAUTH_STATE_COOKIE = 'vigil_google_oauth_state';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface OAuthStateCookie {
  state: string;
  rawNonce: string;
  next: string;
  redirectUri: string;
}

function getCallbackOrigin(request: Request): string {
  const url = new URL(request.url);
  const forwardedHost = request.headers.get('x-forwarded-host') || request.headers.get('host');
  const forwardedProto = request.headers.get('x-forwarded-proto') || (url.protocol === 'http:' ? 'http' : 'https');

  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }
  return url.origin;
}

function redirectWithClearedCookie(destination: string, isHttps: boolean): NextResponse {
  const res = NextResponse.redirect(destination, 302);
  res.cookies.set(GOOGLE_OAUTH_STATE_COOKIE, '', {
    httpOnly: true,
    secure: isHttps,
    sameSite: 'lax',
    path: '/api/auth/google',
    maxAge: 0,
  });
  return res;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = getCallbackOrigin(request);
  const isHttps = origin.startsWith('https://');

  const oauthError = url.searchParams.get('error');
  if (oauthError) {
    return redirectWithClearedCookie(
      `${origin}/login?error=${encodeURIComponent(oauthError)}`,
      isHttps
    );
  }

  const code = url.searchParams.get('code');
  const returnedState = url.searchParams.get('state');
  const clientId = (process.env.GOOGLE_CLIENT_ID || '').trim();
  const clientSecret = (process.env.GOOGLE_CLIENT_SECRET || '').trim();

  if (!code || !returnedState || !clientId || !clientSecret) {
    return redirectWithClearedCookie(`${origin}/login?error=google_callback_invalid`, isHttps);
  }

  const rawCookie = cookies().get(GOOGLE_OAUTH_STATE_COOKIE)?.value;
  if (!rawCookie) {
    return redirectWithClearedCookie(`${origin}/login?error=google_state_missing`, isHttps);
  }

  let parsedCookie: OAuthStateCookie | null = null;
  try {
    const decoded = Buffer.from(rawCookie, 'base64url').toString('utf8');
    parsedCookie = JSON.parse(decoded) as OAuthStateCookie;
  } catch {
    parsedCookie = null;
  }

  if (!parsedCookie?.state || !parsedCookie?.rawNonce) {
    return redirectWithClearedCookie(`${origin}/login?error=google_state_invalid`, isHttps);
  }

  const expectedBuf = Buffer.from(parsedCookie.state);
  const returnedBuf = Buffer.from(returnedState);
  if (
    expectedBuf.length !== returnedBuf.length ||
    !crypto.timingSafeEqual(expectedBuf, returnedBuf)
  ) {
    return redirectWithClearedCookie(`${origin}/login?error=google_state_mismatch`, isHttps);
  }

  const redirectUri = parsedCookie.redirectUri || `${origin}/api/auth/google/callback`;
  const nextPath =
    parsedCookie.next && parsedCookie.next.startsWith('/') && !parsedCookie.next.startsWith('//')
      ? parsedCookie.next
      : '/dashboard';

  // 1. Exchange authorization code directly with Google for id_token
  let idToken = '';
  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }).toString(),
    });

    const tokenJson = (await tokenRes.json().catch(() => null)) as {
      id_token?: string;
      error?: string;
      error_description?: string;
    } | null;

    if (!tokenRes.ok || !tokenJson?.id_token) {
      console.error('[auth/google/callback] Google token exchange failed:', tokenJson?.error);
      return redirectWithClearedCookie(`${origin}/login?error=google_token_exchange_failed`, isHttps);
    }

    idToken = tokenJson.id_token;
  } catch (err) {
    console.error('[auth/google/callback] Token fetch error:', err);
    return redirectWithClearedCookie(`${origin}/login?error=google_network_error`, isHttps);
  }

  // 2. Sign into Supabase Auth with Google ID Token (sets SSR session cookies)
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: idToken,
    nonce: parsedCookie.rawNonce,
  });

  if (error || !data?.user) {
    console.error('[auth/google/callback] Supabase signInWithIdToken failed:', error?.message);
    return redirectWithClearedCookie(`${origin}/login?error=google_supabase_signin_failed`, isHttps);
  }

  // 3. Enforce profile completion for first-time Google users
  const authUser = data.user;
  const normalizedEmail = (authUser.email || '').trim().toLowerCase();
  const isFounder = isFounderOwner(normalizedEmail);

  if (!isFounder) {
    try {
      let profile = await (db as any).userProfile.findUnique({
        where: { id: authUser.id },
        include: { organization: true },
      });

      if (!profile && normalizedEmail) {
        profile = await (db as any).userProfile.findUnique({
          where: { email: normalizedEmail },
          include: { organization: true },
        });
      }

      if (profile?.role === 'TECHNICIAN') {
        return redirectWithClearedCookie(`${origin}/login?error=technician_app_required`, isHttps);
      }

      const isSuperAdmin = profile?.role === 'SUPER_ADMIN';
      const hasOrgName = Boolean(profile?.organization?.name?.trim());
      const hasPhone = Boolean(profile?.phone?.trim());

      if (!isSuperAdmin && (!profile || !profile.organizationId || !hasOrgName || !hasPhone)) {
        const completeUrl = new URL(`${origin}/login`);
        completeUrl.searchParams.set('mode', 'complete-profile');
        if (nextPath !== '/dashboard') {
          completeUrl.searchParams.set('redirect', nextPath);
        }
        return redirectWithClearedCookie(completeUrl.toString(), isHttps);
      }
    } catch (lookupErr) {
      console.error('[auth/google/callback] Profile completeness check failed:', lookupErr);
      return redirectWithClearedCookie(`${origin}/login?mode=complete-profile`, isHttps);
    }
  }

  return redirectWithClearedCookie(`${origin}${nextPath}`, isHttps);
}
