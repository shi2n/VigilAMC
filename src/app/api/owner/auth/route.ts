import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  OWNER_SESSION_COOKIE,
  ensureOwnerCredential,
  verifyOwnerPassword,
  createOwnerSessionToken,
} from '@/lib/ownerAuth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawLoginId = typeof body.loginId === 'string' ? body.loginId.trim() : '';
    const rawPassword = typeof body.password === 'string' ? body.password : '';

    if (!rawLoginId || !rawPassword) {
      return NextResponse.json(
        { error: 'Please enter both Owner Login ID and Password.' },
        { status: 400 }
      );
    }

    const cred = await ensureOwnerCredential();

    const loginMatches =
      rawLoginId.toLowerCase() === cred.loginId.trim().toLowerCase();
    const passwordMatches = verifyOwnerPassword(rawPassword, cred.passwordHash);

    if (!loginMatches || !passwordMatches) {
      return NextResponse.json(
        { error: 'Invalid Owner Login ID or Password.' },
        { status: 401 }
      );
    }

    // Update lastLoginAt non-blockingly
    try {
      await (db as any).ownerCredential.update({
        where: { id: 'singleton' },
        data: { lastLoginAt: new Date() },
      });
    } catch {
      // Non-blocking
    }

    const sessionToken = createOwnerSessionToken(cred.loginId);
    const response = NextResponse.json({
      ok: true,
      loginId: cred.loginId,
    });

    response.cookies.set(OWNER_SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error('Error in POST /api/owner/auth:', error);
    return NextResponse.json(
      { error: error?.message || 'Owner authentication failed.' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(OWNER_SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}
