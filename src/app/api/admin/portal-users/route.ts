import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { generateMagicToken } from '@/lib/portalSession';
import { isSmtpConfigured, sendMagicLinkEmail } from '@/lib/email';
import { SITE_CONFIG, getBaseUrl } from '@/lib/siteConfig';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const auth = await getCurrentUser(request);
    if (!auth?.organization?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const portalUsers = await (db as any).portalUser.findMany({
      where: {
        organizationId: auth.organization.id,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            contactPerson: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ portalUsers });
  } catch (error: any) {
    console.error('[Admin Portal Users GET Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch portal users' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getCurrentUser(request);
    if (!auth?.organization?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const clientOrgId = (body.clientOrgId || '').trim();
    const email = (body.email || '').trim().toLowerCase();
    const name = (body.name || '').trim();

    if (!clientOrgId || !email || !name) {
      return NextResponse.json(
        { error: 'Client organization, contact name, and email are required.' },
        { status: 400 }
      );
    }

    // Verify client belongs to this organization
    const client = await (db as any).client.findFirst({
      where: {
        id: clientOrgId,
        organizationId: auth.organization.id,
      },
    });

    if (!client) {
      return NextResponse.json({ error: 'Selected client does not exist' }, { status: 404 });
    }

    const { rawToken, tokenHash, expiresAt } = generateMagicToken();

    // Create or update PortalUser
    const portalUser = await (db as any).portalUser.upsert({
      where: {
        organizationId_email: {
          organizationId: auth.organization.id,
          email,
        },
      },
      create: {
        organizationId: auth.organization.id,
        clientOrgId,
        email,
        name,
        invitedByUserId: auth.user.id,
        magicTokenHash: tokenHash,
        magicTokenExpiresAt: expiresAt,
        revokedAt: null,
      },
      update: {
        clientOrgId,
        name,
        magicTokenHash: tokenHash,
        magicTokenExpiresAt: expiresAt,
        revokedAt: null, // Re-inviting resets revocation
      },
    });

    const origin = getBaseUrl(request);
    const magicLink = `${origin}/portal/verify?token=${rawToken}`;

    // Log invite activity
    await (db as any).activityLog.create({
      data: {
        organizationId: auth.organization.id,
        userId: auth.user.id,
        userEmail: auth.user.email,
        action: 'PORTAL_USER_INVITED',
        entityType: 'PortalUser',
        entityId: portalUser.id,
        details: `Invited client user ${name} (${email}) for client ${client.name}`,
      },
    });

    if (isSmtpConfigured()) {
      const emailRes = await sendMagicLinkEmail({
        to: email,
        name,
        agencyName: auth.organization.name,
        magicLink,
        expiresMinutes: 30,
      });

      if (emailRes.success) {
        return NextResponse.json({
          success: true,
          mode: 'EMAIL',
          message: `Invitation email sent successfully to ${email}.`,
          portalUser,
        });
      }
    }

    // FALLBACK B2: Return copyable invite link
    return NextResponse.json({
      success: true,
      mode: 'LINK',
      inviteLink: magicLink,
      message: 'SMTP is not configured in this environment. Copy the magic invite link below to share with your client.',
      portalUser,
    });
  } catch (error: any) {
    console.error('[Admin Portal Users POST Error]:', error);
    return NextResponse.json({ error: 'Failed to invite portal user' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await getCurrentUser(request);
    if (!auth?.organization?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { portalUserId, action } = body;

    if (!portalUserId || !['REVOKE', 'RESTORE'].includes(action)) {
      return NextResponse.json({ error: 'portalUserId and valid action are required' }, { status: 400 });
    }

    const portalUser = await (db as any).portalUser.findFirst({
      where: {
        id: portalUserId,
        organizationId: auth.organization.id,
      },
    });

    if (!portalUser) {
      return NextResponse.json({ error: 'Portal user not found' }, { status: 404 });
    }

    const updated = await (db as any).portalUser.update({
      where: { id: portalUserId },
      data: {
        revokedAt: action === 'REVOKE' ? new Date() : null,
      },
    });

    await (db as any).activityLog.create({
      data: {
        organizationId: auth.organization.id,
        userId: auth.user.id,
        userEmail: auth.user.email,
        action: action === 'REVOKE' ? 'PORTAL_USER_REVOKED' : 'PORTAL_USER_RESTORED',
        entityType: 'PortalUser',
        entityId: portalUserId,
        details: `${action === 'REVOKE' ? 'Revoked' : 'Restored'} portal access for ${portalUser.email}`,
      },
    });

    return NextResponse.json({ success: true, portalUser: updated });
  } catch (error: any) {
    console.error('[Admin Portal Users PATCH Error]:', error);
    return NextResponse.json({ error: 'Failed to update portal user' }, { status: 500 });
  }
}
