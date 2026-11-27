import crypto from 'crypto';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const GOOGLE_OAUTH_STATE_COOKIE = 'vigil_google_oauth_state';

function sanitizeNextPath(rawNext: string | null): string {
  if (rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//')) {
    return rawNext;
  }
  return '/dashboard';
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

export async function GET(request: Request) {
  const url = new URL(request.url);
  const clientId = (process.env.GOOGLE_CLIENT_ID || '').trim();
  const clientSecret = (process.env.GOOGLE_CLIENT_SECRET || '').trim();
  const configured = Boolean(clientId && clientSecret);
  const origin = getCallbackOrigin(request);
  const redirectUri = `${origin}/api/auth/google/callback`;

  // Lightweight capability check used by /login so Google Sign-In never breaks before env vars are set
  if (url.searchParams.get('check') === '1') {
    return NextResponse.json(
      { configured, redirectUri },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  }

  if (!configured) {
    return NextResponse.redirect(`${origin}/login?error=google_not_configured`);
  }

  const next = sanitizeNextPath(url.searchParams.get('next'));
  const state = crypto.randomBytes(24).toString('hex');
  const rawNonce = crypto.randomBytes(24).toString('hex');
  const hashedNonce = crypto.createHash('sha256').update(rawNonce).digest('hex');

  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.set('client_id', clientId);
  googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('scope', 'openid email profile');
  googleAuthUrl.searchParams.set('access_type', 'offline');
  googleAuthUrl.searchParams.set('prompt', 'select_account');
  googleAuthUrl.searchParams.set('state', state);
  googleAuthUrl.searchParams.set('nonce', hashedNonce);

  const cookiePayload = Buffer.from(
    JSON.stringify({ state, rawNonce, next, redirectUri }),
    'utf8'
  ).toString('base64url');

  const response = NextResponse.redirect(googleAuthUrl.toString(), 302);
  response.cookies.set(GOOGLE_OAUTH_STATE_COOKIE, cookiePayload, {
    httpOnly: true,
    secure: origin.startsWith('https://'),
    sameSite: 'lax',
    path: '/api/auth/google',
    maxAge: 600,
  });

  return response;
}
