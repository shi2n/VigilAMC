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

    if (actor.kind === 'TECHNICIAN') {
      // Count ALL unread messages addressed to this technician (Office + Tech<->Tech DMs)
      const grouped: Array<{ dmKey: string | null; _count: { _all: number } }> = await (
        db as any
      ).message.groupBy({
        by: ['dmKey'],
        where: {
          organizationId: actor.organizationId,
          recipientRole: 'TECHNICIAN',
          recipientId: actor.userId,
          readAt: null,
        },
        _count: { _all: true },
      });

      const perDmKey: Record<string, number> = {};
      let total = 0;
      for (const row of grouped) {
        const c = row._count?._all ?? 0;
        if (c > 0) {
          if (row.dmKey) perDmKey[row.dmKey] = c;
          total += c;
        }
      }

      const perTechnician: Record<string, number> = total > 0 ? { [actor.userId]: total } : {};
      return NextResponse.json(
        { total, perTechnician, perDmKey },
        { status: 200, headers: NO_STORE_HEADERS }
      );
    }

    // AGENCY: strictly office<->technician messages only (NEVER private tech<->tech DMs)
    const grouped: Array<{ technicianId: string; _count: { _all: number } }> = await (
      db as any
    ).message.groupBy({
      by: ['technicianId'],
      where: {
        organizationId: actor.organizationId,
        senderRole: 'TECHNICIAN',
        recipientRole: 'AGENCY',
        dmKey: { startsWith: 'office__' },
        readAt: null,
      },
      _count: {
        _all: true,
      },
    });

    const perTechnician: Record<string, number> = {};
    let total = 0;
    for (const row of grouped) {
      const c = row._count?._all ?? 0;
      if (c > 0) {
        perTechnician[row.technicianId] = c;
        total += c;
      }
    }

    return NextResponse.json(
      { total, perTechnician },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (err: any) {
    console.error('[GET /api/messages/unread] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to load unread counts' },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
