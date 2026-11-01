import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedActor } from '@/lib/techSession';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const auth = await getAuthenticatedActor(request);
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = auth.user.id;
    const organizationId = auth.organization?.id;

    const notifications = await (db as any).notification.findMany({
      where: {
        OR: [
          { userId },
          ...(organizationId ? [{ organizationId, userId: null }] : []),
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = notifications.filter((n: any) => !n.read).length;

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error: any) {
    console.error('Error fetching technician notifications:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await getAuthenticatedActor(request);
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = auth.user.id;
    const body = await request.json().catch(() => ({}));
    const { id, markAllRead } = body;

    if (markAllRead) {
      await (db as any).notification.updateMany({
        where: {
          userId,
          read: false,
        },
        data: { read: true },
      });
      return NextResponse.json({ success: true, message: 'All notifications marked as read' });
    }

    if (id && typeof id === 'string') {
      await (db as any).notification.updateMany({
        where: {
          id,
          userId,
        },
        data: { read: true },
      });
      return NextResponse.json({ success: true, message: 'Notification marked as read' });
    }

    return NextResponse.json({ error: 'id or markAllRead is required' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating technician notification:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
