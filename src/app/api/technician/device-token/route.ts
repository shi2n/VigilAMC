import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedActor } from '@/lib/techSession';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const auth = await getAuthenticatedActor(request);
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { fcmToken, platform = 'android' } = body;

    if (!fcmToken || typeof fcmToken !== 'string' || fcmToken.trim().length === 0) {
      return NextResponse.json({ error: 'fcmToken is required' }, { status: 400 });
    }

    const cleanToken = fcmToken.trim();
    const technicianId = auth.user.id;

    // Upsert or replace device token for this device
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
    });
  } catch (error: any) {
    console.error('Error registering device token:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to register device token' },
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
    const { fcmToken } = body;
    const technicianId = auth.user.id;

    if (fcmToken && typeof fcmToken === 'string') {
      await (db as any).deviceToken.deleteMany({
        where: {
          fcmToken: fcmToken.trim(),
          technicianId,
        },
      });
    } else {
      // If token not provided on logout, remove tokens belonging to this technician session
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
    console.error('Error removing device token:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to remove device token' },
      { status: 500 }
    );
  }
}
