import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedActor, verifyTechSessionToken } from '@/lib/techSession';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    let auth = await getAuthenticatedActor(request);
    const body = await request.json().catch(() => ({}));

    // Fallback: Verify techToken passed in body if cookies/Bearer weren't captured
    if ((!auth || !auth.user) && body.techToken) {
      const payload = verifyTechSessionToken(body.techToken);
      if (payload?.userId) {
        auth = { user: { id: payload.userId, email: payload.email || '' } } as any;
      }
    }

    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rawToken = body.fcmToken || body.pushToken || body.token;
    const platform = body.platform || 'android';

    if (!rawToken || typeof rawToken !== 'string' || rawToken.trim().length === 0) {
      return NextResponse.json({ error: 'pushToken / fcmToken is required' }, { status: 400 });
    }

    const cleanToken = rawToken.trim();
    const technicianId = auth.user.id;

    // Upsert device token for this technician
    const deviceToken = await (db as any).deviceToken.upsert({
      where: { fcmToken: cleanToken },
      update: {
        technicianId,
        platform: platform || 'android',
        lastSeenAt: new Date(),
      },
      create: {
        technicianId,
        fcmToken: cleanToken,
        platform: platform || 'android',
        lastSeenAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      registered: true,
      tokenId: deviceToken.id,
      platform,
    });
  } catch (error: any) {
    console.error('[push-token] Error registering token:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to register push token' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await getAuthenticatedActor(request);
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const rawToken = body.fcmToken || body.pushToken || body.token;
    const technicianId = auth.user.id;

    if (rawToken && typeof rawToken === 'string') {
      await (db as any).deviceToken.deleteMany({
        where: {
          fcmToken: rawToken.trim(),
          technicianId,
        },
      });
    } else {
      // Invalidate all tokens for this technician session on explicit logout
      await (db as any).deviceToken.deleteMany({
        where: {
          technicianId,
        },
      });
    }

    return NextResponse.json({
      success: true,
      removed: true,
    });
  } catch (error: any) {
    console.error('[push-token] Error removing token:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to remove push token' },
      { status: 500 }
    );
  }
}
