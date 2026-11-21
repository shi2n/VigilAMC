import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  NO_STORE_HEADERS,
  buildOfficeDmKey,
  buildTechDmKey,
  resolveMessagingActor,
} from '@/lib/messaging';

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

    if (actor.kind !== 'TECHNICIAN') {
      return NextResponse.json(
        { error: 'Forbidden: contacts endpoint is for technicians' },
        { status: 403, headers: NO_STORE_HEADERS }
      );
    }

    const url = new URL(request.url);
    const q = (url.searchParams.get('q') || '').trim().toLowerCase();

    const officeDmKey = buildOfficeDmKey(actor.userId);

    const [org, otherTechs, unreadGrouped, recentMessages] = await Promise.all([
      (db as any).organization.findUnique({
        where: { id: actor.organizationId },
        select: { id: true, name: true },
      }),
      (db as any).userProfile.findMany({
        where: {
          organizationId: actor.organizationId,
          role: 'TECHNICIAN',
          status: 'ACTIVE',
          id: { not: actor.userId },
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          employeeId: true,
          status: true,
        },
        orderBy: { fullName: 'asc' },
      }),
      (db as any).message.groupBy({
        by: ['dmKey'],
        where: {
          organizationId: actor.organizationId,
          recipientRole: 'TECHNICIAN',
          recipientId: actor.userId,
          readAt: null,
        },
        _count: { _all: true },
      }),
      (db as any).message.findMany({
        where: {
          organizationId: actor.organizationId,
          OR: [
            { dmKey: officeDmKey },
            { senderId: actor.userId, recipientRole: 'TECHNICIAN' },
            { recipientId: actor.userId, recipientRole: 'TECHNICIAN' },
          ],
        },
        orderBy: { createdAt: 'desc' },
        distinct: ['dmKey'],
        select: {
          id: true,
          dmKey: true,
          senderRole: true,
          senderId: true,
          body: true,
          attachmentKind: true,
          readAt: true,
          createdAt: true,
        },
      }),
    ]);

    const organizationName = org?.name?.trim() || 'Agency Office';

    const unreadMap = new Map<string, number>();
    let totalUnread = 0;
    for (const row of unreadGrouped as Array<{ dmKey: string | null; _count: { _all: number } }>) {
      if (!row.dmKey) continue;
      const c = row._count?._all ?? 0;
      unreadMap.set(row.dmKey, c);
      totalUnread += c;
    }

    const lastMsgMap = new Map<string, any>();
    for (const msg of recentMessages as any[]) {
      if (msg.dmKey) {
        lastMsgMap.set(msg.dmKey, msg);
      }
    }

    const formatLast = (last: any) =>
      last
        ? {
            id: last.id,
            senderRole: last.senderRole as 'AGENCY' | 'TECHNICIAN',
            senderId: last.senderId as string,
            body: last.body ?? null,
            attachmentKind: (last.attachmentKind as 'IMAGE' | null) ?? null,
            readAt: last.readAt ? new Date(last.readAt).toISOString() : null,
            createdAt: new Date(last.createdAt).toISOString(),
          }
        : null;

    const officeContact = {
      kind: 'OFFICE' as const,
      target: 'office',
      dmKey: officeDmKey,
      id: 'office',
      name: organizationName,
      employeeId: null as string | null,
      pinned: true,
      unreadCount: unreadMap.get(officeDmKey) || 0,
      lastMessage: formatLast(lastMsgMap.get(officeDmKey) || null),
    };

    const peerContacts = (otherTechs as any[]).map((tech) => {
      const dmKey = buildTechDmKey(actor.userId, tech.id);
      const name = tech.fullName?.trim() || tech.email?.split('@')[0] || 'Technician';
      return {
        kind: 'TECHNICIAN' as const,
        target: `technician:${tech.id}`,
        dmKey,
        id: tech.id as string,
        name,
        employeeId: (tech.employeeId as string | null) || null,
        pinned: false,
        unreadCount: unreadMap.get(dmKey) || 0,
        lastMessage: formatLast(lastMsgMap.get(dmKey) || null),
      };
    });

    // Sort peer contacts by latest message desc, then alphabetical
    peerContacts.sort((a, b) => {
      const aTime = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const bTime = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
      if (bTime !== aTime) return bTime - aTime;
      return a.name.localeCompare(b.name);
    });

    const allContacts = [officeContact, ...peerContacts];
    const filteredContacts = q
      ? allContacts.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            (c.employeeId && c.employeeId.toLowerCase().includes(q)) ||
            (c.kind === 'OFFICE' && 'office agency'.includes(q))
        )
      : allContacts;

    return NextResponse.json(
      {
        organizationId: actor.organizationId,
        organizationName,
        technicianId: actor.userId,
        totalUnread,
        contacts: filteredContacts,
      },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (err: any) {
    console.error('[GET /api/messages/contacts] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to load contacts' },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
