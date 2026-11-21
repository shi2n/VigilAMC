import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  NO_STORE_HEADERS,
  buildOfficeDmKey,
  buildTechDmKey,
  emitRealtimeMessageBroadcast,
  isValidUuid,
  parseDmKey,
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
    const requestedDmKey = typeof payload?.dmKey === 'string' ? payload.dmKey.trim() : '';
    const requestedTarget = typeof payload?.target === 'string' ? payload.target.trim() : '';
    const requestedTechId =
      typeof payload?.technicianId === 'string' ? payload.technicianId.trim() : '';
    const upToId = typeof payload?.upToId === 'string' ? payload.upToId.trim() : '';

    let resolvedDmKey = '';
    let targetTechnicianId = '';
    let isTechToTechDm = false;
    let peerTechId = '';

    if (actor.kind === 'AGENCY') {
      if (requestedDmKey.startsWith('dm__')) {
        return NextResponse.json(
          { error: 'Forbidden: technician-to-technician DMs are private' },
          { status: 403, headers: NO_STORE_HEADERS }
        );
      }

      let techIdCandidate = requestedTechId;
      if (!techIdCandidate && requestedDmKey.startsWith('office__')) {
        const parsed = parseDmKey(requestedDmKey);
        if (parsed?.kind === 'OFFICE') techIdCandidate = parsed.technicianId;
      }

      if (!techIdCandidate) {
        return NextResponse.json(
          { error: 'technicianId or dmKey is required' },
          { status: 400, headers: NO_STORE_HEADERS }
        );
      }
      const tech = await verifyTechnicianInOrg(techIdCandidate, actor.organizationId);
      if (!tech) {
        return NextResponse.json(
          { error: 'Technician not found in your organization' },
          { status: 404, headers: NO_STORE_HEADERS }
        );
      }
      targetTechnicianId = tech.id;
      resolvedDmKey = buildOfficeDmKey(tech.id);
    } else {
      // TECHNICIAN actor
      if (requestedDmKey) {
        const parsed = parseDmKey(requestedDmKey);
        if (!parsed) {
          return NextResponse.json({ error: 'Invalid dmKey' }, { status: 400, headers: NO_STORE_HEADERS });
        }
        if (parsed.kind === 'OFFICE') {
          if (parsed.technicianId !== actor.userId) {
            return NextResponse.json(
              { error: 'Forbidden: cannot mark another technician thread as read' },
              { status: 403, headers: NO_STORE_HEADERS }
            );
          }
          targetTechnicianId = actor.userId;
          resolvedDmKey = buildOfficeDmKey(actor.userId);
        } else {
          if (!parsed.techIds.includes(actor.userId)) {
            return NextResponse.json(
              { error: 'Forbidden: you are not a participant in this DM thread' },
              { status: 403, headers: NO_STORE_HEADERS }
            );
          }
          isTechToTechDm = true;
          peerTechId = parsed.techIds[0] === actor.userId ? parsed.techIds[1] : parsed.techIds[0];
          targetTechnicianId = peerTechId;
          resolvedDmKey = buildTechDmKey(actor.userId, peerTechId);
        }
      } else if (requestedTarget.startsWith('technician:')) {
        const candidate = requestedTarget.slice('technician:'.length).trim();
        if (!candidate || candidate === actor.userId) {
          return NextResponse.json({ error: 'Invalid target' }, { status: 400, headers: NO_STORE_HEADERS });
        }
        isTechToTechDm = true;
        peerTechId = candidate;
        targetTechnicianId = candidate;
        resolvedDmKey = buildTechDmKey(actor.userId, candidate);
      } else {
        if (requestedTechId && requestedTechId !== actor.userId) {
          return NextResponse.json(
            { error: 'Forbidden: cannot mark another technician thread as read' },
            { status: 403, headers: NO_STORE_HEADERS }
          );
        }
        targetTechnicianId = actor.userId;
        resolvedDmKey = buildOfficeDmKey(actor.userId);
      }
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
          dmKey: resolvedDmKey,
        },
        select: { createdAt: true },
      });
      if (upToMsg?.createdAt) {
        cutoffDate = upToMsg.createdAt;
      }
    }

    const now = new Date();
    const whereClause: Record<string, any> = isTechToTechDm
      ? {
          organizationId: actor.organizationId,
          dmKey: resolvedDmKey,
          recipientRole: 'TECHNICIAN',
          recipientId: actor.userId,
          senderId: { not: actor.userId },
          readAt: null,
          ...(cutoffDate ? { createdAt: { lte: cutoffDate } } : {}),
        }
      : actor.kind === 'TECHNICIAN'
        ? {
            organizationId: actor.organizationId,
            dmKey: resolvedDmKey,
            senderRole: 'AGENCY',
            readAt: null,
            ...(cutoffDate ? { createdAt: { lte: cutoffDate } } : {}),
          }
        : {
            organizationId: actor.organizationId,
            dmKey: resolvedDmKey,
            senderRole: 'TECHNICIAN',
            recipientRole: 'AGENCY',
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
        recipientTechnicianIds: isTechToTechDm ? [actor.userId, peerTechId] : [targetTechnicianId],
        includeAgency: !isTechToTechDm,
        payload: {
          organization_id: actor.organizationId,
          technician_id: targetTechnicianId,
          dm_key: resolvedDmKey,
          sender_role: isTechToTechDm ? 'TECHNICIAN' : actor.kind === 'TECHNICIAN' ? 'AGENCY' : 'TECHNICIAN',
          read_at: now.toISOString(),
          ids: unreadRows.map((r) => r.id),
        },
      });
    }

    return NextResponse.json(
      {
        ok: true,
        dmKey: resolvedDmKey,
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
