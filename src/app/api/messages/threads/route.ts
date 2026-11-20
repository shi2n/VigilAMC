import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { NO_STORE_HEADERS, resolveMessagingActor } from '@/lib/messaging';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { actor, forbiddenReason } = await resolveMessagingActor(request);
    if (!actor) {
      if (forbiddenReason) {
        return NextResponse.json({ error: forbiddenReason }, { status: 403, headers: NO_STORE_HEADERS });
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: NO_STORE_HEADERS });
    }

    const org = await (db as any).organization.findUnique({
      where: { id: actor.organizationId },
      select: { id: true, name: true },
    });
    const organizationName = org?.name?.trim() || 'Agency Office';

    if (actor.kind === 'TECHNICIAN') {
      const unreadCount = await (db as any).message.count({
        where: {
          organizationId: actor.organizationId,
          technicianId: actor.userId,
          senderRole: 'AGENCY',
          readAt: null,
        },
      });
      return NextResponse.json(
        {
          organizationId: actor.organizationId,
          organizationName,
          technicianId: actor.userId,
          unreadCount,
        },
        { status: 200, headers: NO_STORE_HEADERS }
      );
    }

    // Agency view: list all technicians in org with last message & unread count
    const [technicians, unreadGrouped, recentMessages] = await Promise.all([
      (db as any).userProfile.findMany({
        where: {
          organizationId: actor.organizationId,
          role: 'TECHNICIAN',
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          employeeId: true,
          phone: true,
          status: true,
        },
        orderBy: { fullName: 'asc' },
      }),
      (db as any).message.groupBy({
        by: ['technicianId'],
        where: {
          organizationId: actor.organizationId,
          senderRole: 'TECHNICIAN',
          readAt: null,
        },
        _count: { _all: true },
      }),
      (db as any).message.findMany({
        where: { organizationId: actor.organizationId },
        orderBy: { createdAt: 'desc' },
        distinct: ['technicianId'],
        select: {
          id: true,
          technicianId: true,
          senderRole: true,
          body: true,
          attachmentKind: true,
          readAt: true,
          createdAt: true,
        },
      }),
    ]);

    const unreadMap = new Map<string, number>();
    let totalUnread = 0;
    for (const row of unreadGrouped as Array<{ technicianId: string; _count: { _all: number } }>) {
      const count = row._count?._all ?? 0;
      unreadMap.set(row.technicianId, count);
      totalUnread += count;
    }

    const lastMsgMap = new Map<string, any>();
    for (const msg of recentMessages as any[]) {
      lastMsgMap.set(msg.technicianId, msg);
    }

    const threads = (technicians as any[]).map((tech) => {
      const last = lastMsgMap.get(tech.id) || null;
      return {
        technicianId: tech.id,
        fullName: tech.fullName?.trim() || tech.email?.split('@')[0] || 'Technician',
        employeeId: tech.employeeId || null,
        status: tech.status || 'ACTIVE',
        unreadCount: unreadMap.get(tech.id) || 0,
        lastMessage: last
          ? {
              id: last.id,
              senderRole: last.senderRole,
              body: last.body ?? null,
              attachmentKind: last.attachmentKind ?? null,
              readAt: last.readAt ? new Date(last.readAt).toISOString() : null,
              createdAt: new Date(last.createdAt).toISOString(),
            }
          : null,
      };
    });

    // Sort: threads with latest message first, then alphabetical
    threads.sort((a, b) => {
      const aTime = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const bTime = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
      if (bTime !== aTime) return bTime - aTime;
      return a.fullName.localeCompare(b.fullName);
    });

    const activeTechnicianCount = threads.filter((t) => t.status === 'ACTIVE').length;

    return NextResponse.json(
      {
        organizationId: actor.organizationId,
        organizationName,
        totalUnread,
        activeTechnicianCount,
        threads,
      },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (err: any) {
    console.error('[GET /api/messages/threads] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to load message threads' },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
