import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  NO_STORE_HEADERS,
  emitRealtimeMessageBroadcast,
  isValidUuid,
  resolveMessagingActor,
  verifyTechnicianInOrg,
} from '@/lib/messaging';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { actor, forbiddenReason } = await resolveMessagingActor(request);
    if (!actor) {
      if (forbiddenReason) {
        return NextResponse.json({ error: forbiddenReason }, { status: 403, headers: NO_STORE_HEADERS });
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: NO_STORE_HEADERS });
    }

    const payload = await request.json().catch(() => ({}));
    const requestedTechId =
      typeof payload?.technicianId === 'string' ? payload.technicianId.trim() : '';
    const upToId = typeof payload?.upToId === 'string' ? payload.upToId.trim() : '';

    let targetTechnicianId: string;
    let otherSideRole: 'AGENCY' | 'TECHNICIAN';

    if (actor.kind === 'TECHNICIAN') {
      if (requestedTechId && requestedTechId !== actor.userId) {
        return NextResponse.json(
          { error: 'Forbidden: cannot mark another technician thread as read' },
          { status: 403, headers: NO_STORE_HEADERS }
        );
      }
      targetTechnicianId = actor.userId;
      otherSideRole = 'AGENCY';
    } else {
      if (!requestedTechId) {
        return NextResponse.json(
          { error: 'technicianId is required' },
          { status: 400, headers: NO_STORE_HEADERS }
        );
      }
      const tech = await verifyTechnicianInOrg(requestedTechId, actor.organizationId);
      if (!tech) {
        return NextResponse.json(
          { error: 'Technician not found in your organization' },
          { status: 404, headers: NO_STORE_HEADERS }
        );
      }
      targetTechnicianId = tech.id;
      otherSideRole = 'TECHNICIAN';
    }

    let cutoffDate: Date | null = null;
    if (upToId) {
      if (!isValidUuid(upToId)) {
        return NextResponse.json(
          { error: 'upToId must be a valid UUID' },
          { status: 400, headers: NO_STORE_HEADERS }
        );
      }
      const upToMsg = await (db as any).message.findFirst({
        where: {
          id: upToId,
          organizationId: actor.organizationId,
          technicianId: targetTechnicianId,
        },
        select: { createdAt: true },
      });
      if (upToMsg?.createdAt) {
        cutoffDate = upToMsg.createdAt;
      }
    }

    const now = new Date();
    const whereClause = {
      organizationId: actor.organizationId,
      technicianId: targetTechnicianId,
      senderRole: otherSideRole,
      readAt: null,
      ...(cutoffDate ? { createdAt: { lte: cutoffDate } } : {}),
    };

    const unreadRows: Array<{ id: string }> = await (db as any).message.findMany({
      where: whereClause,
      select: { id: true },
    });

    const result = await (db as any).message.updateMany({
      where: whereClause,
      data: {
        readAt: now,
      },
    });

    if (unreadRows.length > 0) {
      await emitRealtimeMessageBroadcast({
        event: 'message_read',
        organizationId: actor.organizationId,
        technicianId: targetTechnicianId,
        payload: {
          organization_id: actor.organizationId,
          technician_id: targetTechnicianId,
          sender_role: otherSideRole,
          read_at: now.toISOString(),
          ids: unreadRows.map((r) => r.id),
        },
      });
    }

    return NextResponse.json(
      {
        ok: true,
        technicianId: targetTechnicianId,
        updatedCount: result.count ?? 0,
        readAt: now.toISOString(),
      },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (err: any) {
    console.error('[POST /api/messages/read] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to mark messages as read' },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
