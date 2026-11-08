import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  OWNER_SESSION_COOKIE,
  requireOwnerApi,
  ensureOwnerCredential,
  verifyOwnerPassword,
  hashOwnerPassword,
  createOwnerSessionToken,
} from '@/lib/ownerAuth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const gate = await requireOwnerApi(request);
  if (!gate.ok) return gate.response;

  try {
    const cred = await ensureOwnerCredential();
    return NextResponse.json(
      {
        loginId: cred.loginId,
        updatedBy: cred.updatedBy,
        lastLoginAt: cred.lastLoginAt,
        updatedAt: cred.updatedAt,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error: any) {
    console.error('Error in GET /api/owner/credentials:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to load owner credentials' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const gate = await requireOwnerApi(request);
  if (!gate.ok) return gate.response;

  try {
    const body = await request.json();
    const currentPassword =
      typeof body.currentPassword === 'string' ? body.currentPassword : '';
    const newLoginId =
      typeof body.newLoginId === 'string' ? body.newLoginId.trim() : '';
    const newPassword =
      typeof body.newPassword === 'string' ? body.newPassword : '';

    if (!currentPassword) {
      return NextResponse.json(
        { error: 'Current password is required to update Owner credentials.' },
        { status: 400 }
      );
    }

    if (!newLoginId || newLoginId.length < 3) {
      return NextResponse.json(
        { error: 'New Login ID must be at least 3 characters long.' },
        { status: 400 }
      );
    }

    const cred = await ensureOwnerCredential();

    const currentPasswordValid = verifyOwnerPassword(
      currentPassword,
      cred.passwordHash
    );
    if (!currentPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect.' },
        { status: 400 }
      );
    }

    if (newPassword && newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const nextHash = newPassword
      ? hashOwnerPassword(newPassword)
      : cred.passwordHash;

    const updated = await (db as any).ownerCredential.update({
      where: { id: 'singleton' },
      data: {
        loginId: newLoginId,
        passwordHash: nextHash,
        updatedBy: gate.owner.email,
      },
    });

    // Record in ActivityLog (using first organization if available)
    try {
      const firstOrg = await (db as any).organization.findFirst({
        select: { id: true },
      });
      if (firstOrg) {
        await (db as any).activityLog.create({
          data: {
            organizationId: firstOrg.id,
            userEmail: updated.loginId,
            action: 'OWNER_CREDENTIALS_UPDATED',
            entityType: 'OWNER_CREDENTIAL',
            entityId: 'singleton',
            details: JSON.stringify({
              summary: `Owner updated console Login ID to ${updated.loginId}${newPassword ? ' and changed password' : ''}`,
              previousLoginId: cred.loginId,
              newLoginId: updated.loginId,
              passwordChanged: Boolean(newPassword),
            }),
          },
        });
      }
    } catch {
      // Non-blocking
    }

    const freshToken = createOwnerSessionToken(updated.loginId);
    const response = NextResponse.json({
      ok: true,
      loginId: updated.loginId,
      passwordChanged: Boolean(newPassword),
      updatedAt: updated.updatedAt,
    });

    response.cookies.set(OWNER_SESSION_COOKIE, freshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error('Error in PATCH /api/owner/credentials:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update owner credentials' },
      { status: 500 }
    );
  }
}
