import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedActor } from '@/lib/techSession';
import { sendFcmMessage } from '@/lib/notify';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const auth = await getAuthenticatedActor(request);
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const technicianId = auth.user.id;
    const now = new Date();
    const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);

    // Find active work orders due within next 48 hours
    const dueTasks = await (db as any).workOrder.findMany({
      where: {
        assignedToId: technicianId,
        status: { in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS'] },
        dueDate: {
          gte: now,
          lte: in48h,
        },
      },
      select: {
        id: true,
        title: true,
        dueDate: true,
        building: { select: { name: true } },
      },
      orderBy: { dueDate: 'asc' },
      take: 10,
    });

    if (dueTasks.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No tasks due within 48h',
        dueCount: 0,
        pushed: false,
      });
    }

    // Check if recent digest notification already exists (12-hour deduplication)
    const recentDigest = await (db as any).notification.findFirst({
      where: {
        userId: technicianId,
        type: 'DIGEST',
        createdAt: { gte: twelveHoursAgo },
      },
    });

    if (recentDigest) {
      return NextResponse.json({
        success: true,
        message: 'Digest already sent in the last 12h',
        dueCount: dueTasks.length,
        pushed: false,
      });
    }

    const firstTask = dueTasks[0];
    const dueStr = firstTask.dueDate
      ? new Date(firstTask.dueDate).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
        })
      : 'soon';

    const title =
      dueTasks.length === 1
        ? `Task Due Soon: ${firstTask.title}`
        : `${dueTasks.length} Tasks Due Soon (${firstTask.title})`;

    const message = `Due by ${dueStr} at ${firstTask.building?.name || 'Assigned Site'}. Tap to review tasks.`;

    // Persist digest notification record
    const notif = await (db as any).notification.create({
      data: {
        userId: technicianId,
        organizationId: auth.organization?.id || null,
        title,
        message,
        type: 'DIGEST',
        link: '/technician',
        pushSent: false,
      },
    });

    // Query active tokens
    const tokens = await (db as any).deviceToken.findMany({
      where: { technicianId },
      select: { fcmToken: true },
    });

    let pushed = false;
    if (tokens && tokens.length > 0) {
      for (const t of tokens) {
        const ok = await sendFcmMessage(t.fcmToken, {
          title,
          body: message,
          data: {
            type: 'TASK_DIGEST',
            link: '/technician',
            taskId: firstTask.id,
          },
        });
        if (ok) pushed = true;
      }

      if (pushed) {
        await (db as any).notification.update({
          where: { id: notif.id },
          data: { pushSent: true },
        }).catch(() => null);
      }
    }

    return NextResponse.json({
      success: true,
      dueCount: dueTasks.length,
      pushed,
    });
  } catch (error: any) {
    console.error('Error running due-soon digest:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  // Allow manual POST trigger or cron trigger
  return GET(request);
}
