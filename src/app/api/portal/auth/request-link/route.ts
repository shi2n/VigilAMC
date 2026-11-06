import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  checkPortalLoginRateLimit,
  generateMagicToken,
} from '@/lib/portalSession';
import { sendMagicLinkEmail } from '@/lib/email';
import { SITE_CONFIG, getBaseUrl } from '@/lib/siteConfig';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = (body.email || '').trim().toLowerCase();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    // Rate limiting: max 5 requests per hour per email
    const rateLimit = checkPortalLoginRateLimit(email);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many login link requests. Please wait an hour before requesting again.' },
        { status: 429 }
      );
    }

    // Lookup active PortalUser for this email (generic response ensures zero user enumeration)
    const portalUser = await (db as any).portalUser.findFirst({
      where: {
        email,
        revokedAt: null,
      },
      include: {
        organization: true,
      },
    });

    if (portalUser && (!portalUser.organization || portalUser.organization.clientPortalEnabled !== false)) {
      const { rawToken, tokenHash, expiresAt } = generateMagicToken();

      await (db as any).portalUser.update({
        where: { id: portalUser.id },
        data: {
          magicTokenHash: tokenHash,
          magicTokenExpiresAt: expiresAt,
        },
      });

      // Construct magic link URL
      const origin = getBaseUrl(request);
      const magicLink = `${origin}/portal/verify?token=${rawToken}`;

      const emailRes = await sendMagicLinkEmail({
        to: portalUser.email,
        name: portalUser.name,
        agencyName: portalUser.organization?.name || 'Your Servicing Agency',
        magicLink,
        expiresMinutes: 30,
      });

      if (!emailRes.success) {
        return NextResponse.json({
          success: true,
          emailSent: false,
          directLink: magicLink,
          message:
            'SMTP email service is not configured in this environment. You can sign in directly using the access link below.',
        });
      }

      return NextResponse.json({
        success: true,
        emailSent: true,
        message: 'A sign-in link has been sent to your email inbox.',
      });
    }

    // Generic response (always returns success to prevent user enumeration)
    return NextResponse.json({
      success: true,
      emailSent: true,
      message: 'If your email is registered with an agency, a sign-in link has been sent to your inbox.',
    });
  } catch (error: any) {
    console.error('[Portal Request Link Error]:', error);
    return NextResponse.json({ error: 'Failed to process request.' }, { status: 500 });
  }
}
