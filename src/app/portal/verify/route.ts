import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  hashToken,
  signPortalSession,
  PORTAL_COOKIE_NAME,
} from '@/lib/portalSession';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const rawToken = url.searchParams.get('token');

  if (!rawToken || rawToken.trim().length < 16) {
    return NextResponse.redirect(new URL('/portal/login?error=missing_token', request.url));
  }

  try {
    const tokenHash = hashToken(rawToken);
    const now = new Date();

    const portalUser = await (db as any).portalUser.findFirst({
      where: {
        magicTokenHash: tokenHash,
        magicTokenExpiresAt: {
          gt: now,
        },
        revokedAt: null,
      },
      include: {
        organization: true,
      },
    });

    if (!portalUser) {
      return NextResponse.redirect(new URL('/portal/login?error=invalid_or_expired', request.url));
    }

    if (portalUser.organization && portalUser.organization.clientPortalEnabled === false) {
      return NextResponse.redirect(new URL('/portal/login?error=portal_disabled', request.url));
    }

    // Single-use token: immediately invalidate token and record lastLoginAt
    await (db as any).portalUser.update({
      where: { id: portalUser.id },
      data: {
        magicTokenHash: null,
        magicTokenExpiresAt: null,
        lastLoginAt: now,
      },
    });

    // Sign session token
    const sessionToken = signPortalSession({
      portalUserId: portalUser.id,
      email: portalUser.email,
      clientOrgId: portalUser.clientOrgId,
      organizationId: portalUser.organizationId,
    });

    // Redirect to /portal and set httpOnly cookie
    const response = NextResponse.redirect(new URL('/portal', request.url));
    response.cookies.set({
      name: PORTAL_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (err) {
    console.error('[Portal Verify Error]:', err);
    return NextResponse.redirect(new URL('/portal/login?error=server_error', request.url));
  }
}
