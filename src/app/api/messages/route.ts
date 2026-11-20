import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  MAX_MESSAGE_BODY_LEN,
  NO_STORE_HEADERS,
  checkMessageRateLimit,
  deriveBroadcastClientMsgId,
  emitRealtimeMessageBroadcast,
  isValidUuid,
  resolveMessagingActor,
  serializeMessagesWithSignedUrls,
  validateImageRefPath,
  verifyTechnicianInOrg,
  verifyUploadedChatImage,
} from '@/lib/messaging';
import { enqueueChatMessagePush } from '@/lib/notify';

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

    const url = new URL(request.url);
    const requestedTechId = url.searchParams.get('technicianId')?.trim() || '';
    const cursorParam = url.searchParams.get('cursor')?.trim() || '';
    const limitRaw = parseInt(url.searchParams.get('limit') || '50', 10);
    const limit = Math.min(Math.max(Number.isFinite(limitRaw) ? limitRaw : 50, 1), 100);

    let targetTechnicianId: string;
    if (actor.kind === 'TECHNICIAN') {
      if (requestedTechId && requestedTechId !== actor.userId) {
        return NextResponse.json(
          { error: 'Forbidden: cannot access another technician thread' },
          { status: 403, headers: NO_STORE_HEADERS }
        );
      }
      targetTechnicianId = actor.userId;
    } else {
      if (!requestedTechId) {
        return NextResponse.json(
          { error: 'technicianId query parameter is required' },
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
    }

    let cursorDate: Date | null = null;
    if (cursorParam) {
      const parsed = new Date(cursorParam);
      if (Number.isNaN(parsed.getTime())) {
        return NextResponse.json(
          { error: 'Invalid cursor timestamp' },
          { status: 400, headers: NO_STORE_HEADERS }
        );
      }
      cursorDate = parsed;
    }

    const rows = await (db as any).message.findMany({
      where: {
        organizationId: actor.organizationId,
        technicianId: targetTechnicianId,
        ...(cursorDate ? { createdAt: { lt: cursorDate } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
    });

    const hasMore = rows.length > limit;
    const slicedDesc = hasMore ? rows.slice(0, limit) : rows;
    const chronological = slicedDesc.reverse();
    const messages = await serializeMessagesWithSignedUrls(chronological);
    const nextCursor = hasMore && messages.length > 0 ? messages[0].createdAt : null;

    return NextResponse.json(
      {
        technicianId: targetTechnicianId,
        messages,
        nextCursor,
        hasMore,
      },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (err: any) {
    console.error('[GET /api/messages] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to load messages' },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { actor, forbiddenReason } = await resolveMessagingActor(request);
    if (!actor) {
      if (forbiddenReason) {
        return NextResponse.json({ error: forbiddenReason }, { status: 403, headers: NO_STORE_HEADERS });
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: NO_STORE_HEADERS });
    }

    const payload = await request.json().catch(() => null);
    if (!payload || typeof payload !== 'object') {
      return NextResponse.json(
        { error: 'Invalid JSON request body' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const isBroadcast = payload.broadcast === true;
    const requestedTechId =
      typeof payload.technicianId === 'string' ? payload.technicianId.trim() : '';
    const rawBody = typeof payload.body === 'string' ? payload.body.trim() : '';
    const cleanBody: string | null = rawBody.length > 0 ? rawBody : null;
    const rawImageRef = typeof payload.imageRef === 'string' ? payload.imageRef.trim() : '';
    const cleanImageRef: string | null = rawImageRef.length > 0 ? rawImageRef : null;

    if (cleanBody && cleanBody.length > MAX_MESSAGE_BODY_LEN) {
      return NextResponse.json(
        { error: `Message body exceeds maximum length of ${MAX_MESSAGE_BODY_LEN} characters` },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    if (!cleanBody && !cleanImageRef) {
      return NextResponse.json(
        { error: 'Message must include either body text or imageRef' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    let clientMsgId: string;
    if (payload.clientMsgId !== undefined && payload.clientMsgId !== null && payload.clientMsgId !== '') {
      if (!isValidUuid(payload.clientMsgId)) {
        return NextResponse.json(
          { error: 'clientMsgId must be a valid UUID' },
          { status: 400, headers: NO_STORE_HEADERS }
        );
      }
      clientMsgId = payload.clientMsgId.trim().toLowerCase();
    } else {
      clientMsgId = crypto.randomUUID();
    }

    // Authorization check for broadcast vs 1:1
    let targetTechnicianId = '';
    if (isBroadcast) {
      if (actor.kind !== 'AGENCY') {
        return NextResponse.json(
          { error: 'Forbidden: only agency users can send broadcast messages' },
          { status: 403, headers: NO_STORE_HEADERS }
        );
      }
    } else if (actor.kind === 'TECHNICIAN') {
      if (requestedTechId && requestedTechId !== actor.userId) {
        return NextResponse.json(
          { error: 'Forbidden: technicians can only send messages in their own thread' },
          { status: 403, headers: NO_STORE_HEADERS }
        );
      }
      targetTechnicianId = actor.userId;
    } else {
      if (!requestedTechId) {
        return NextResponse.json(
          { error: 'technicianId is required unless broadcast: true is set' },
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
    }

    // Idempotency fast-path for 1:1 retries before consuming rate limit
    if (!isBroadcast) {
      const existing = await (db as any).message.findUnique({
        where: { clientMsgId },
      });
      if (existing) {
        if (
          existing.organizationId !== actor.organizationId ||
          existing.technicianId !== targetTechnicianId
        ) {
          return NextResponse.json(
            { error: 'Conflict: clientMsgId already used' },
            { status: 409, headers: NO_STORE_HEADERS }
          );
        }
        const [serialized] = await serializeMessagesWithSignedUrls([existing]);
        return NextResponse.json(
          { ok: true, deduplicated: true, message: serialized },
          { status: 200, headers: NO_STORE_HEADERS }
        );
      }
    }

    // Rate limit: 30/min per technician and 30/min per agency user
    const rate = await checkMessageRateLimit(actor.kind, actor.userId);
    if (!rate.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded (max 30 messages per minute). Please wait before sending again.',
          retryAfterSec: rate.retryAfterSec,
        },
        {
          status: 429,
          headers: {
            ...NO_STORE_HEADERS,
            'Retry-After': String(rate.retryAfterSec),
          },
        }
      );
    }

    // Validate imageRef if provided (must exist in private chat-media bucket, IMAGE, <=2MB)
    if (cleanImageRef) {
      const broadcastScope = `broadcast_${actor.organizationId}`;
      const allowedScopes = isBroadcast
        ? [broadcastScope]
        : actor.kind === 'AGENCY'
          ? [targetTechnicianId, broadcastScope]
          : [targetTechnicianId];

      const pathCheck = validateImageRefPath(cleanImageRef, allowedScopes);
      if (!pathCheck.valid) {
        return NextResponse.json(
          { error: pathCheck.error || 'Invalid imageRef' },
          { status: 400, headers: NO_STORE_HEADERS }
        );
      }

      const storageCheck = await verifyUploadedChatImage(cleanImageRef);
      if (!storageCheck.ok) {
        return NextResponse.json(
          { error: storageCheck.error || 'Invalid uploaded image' },
          { status: 400, headers: NO_STORE_HEADERS }
        );
      }
    }

    // --- BROADCAST FLOW ---
    if (isBroadcast) {
      const activeTechs: Array<{ id: string }> = await (db as any).userProfile.findMany({
        where: {
          organizationId: actor.organizationId,
          role: 'TECHNICIAN',
          status: 'ACTIVE',
        },
        select: { id: true },
        orderBy: { createdAt: 'asc' },
      });

      if (activeTechs.length === 0) {
        return NextResponse.json(
          { ok: true, broadcast: true, sentTo: 0, messages: [] },
          { status: 200, headers: NO_STORE_HEADERS }
        );
      }

      const createdRows: any[] = [];
      for (const tech of activeTechs) {
        const derivedId = deriveBroadcastClientMsgId(clientMsgId, tech.id);
        const existingRow = await (db as any).message.findUnique({
          where: { clientMsgId: derivedId },
        });
        if (existingRow) {
          createdRows.push(existingRow);
          continue;
        }
        try {
          const row = await (db as any).message.create({
            data: {
              clientMsgId: derivedId,
              organizationId: actor.organizationId,
              technicianId: tech.id,
              senderRole: 'AGENCY',
              senderId: actor.userId,
              body: cleanBody,
              attachmentUrl: cleanImageRef,
              attachmentKind: cleanImageRef ? 'IMAGE' : null,
            },
          });
          createdRows.push(row);
        } catch (createErr: any) {
          if (createErr?.code === 'P2002') {
            const raceRow = await (db as any).message.findUnique({
              where: { clientMsgId: derivedId },
            });
            if (raceRow) createdRows.push(raceRow);
          } else {
            throw createErr;
          }
        }
      }

      // Enqueue DATA-only FCM push for every technician thread
      const fcmResults = await Promise.allSettled(
        createdRows.map((row) =>
          enqueueChatMessagePush({
            recipientUserIds: [row.technicianId],
            technicianId: row.technicianId,
            body: cleanBody,
            attachmentKind: row.attachmentKind,
            senderName: actor.displayName,
            messageId: row.id,
            senderRole: 'AGENCY',
          })
        )
      );

      let totalTargeted = 0;
      let totalSent = 0;
      let samplePayload: Record<string, string> | null = null;
      for (const res of fcmResults) {
        if (res.status === 'fulfilled') {
          totalTargeted += res.value.targetedDevices;
          totalSent += res.value.sentCount;
          if (!samplePayload) samplePayload = res.value.payload;
        }
      }

      const serialized = await serializeMessagesWithSignedUrls(createdRows);
      // Emit Realtime Broadcast for instant delivery across all auth paths
      await Promise.allSettled(
        createdRows.map((row) =>
          emitRealtimeMessageBroadcast({
            event: 'message_insert',
            organizationId: row.organizationId,
            technicianId: row.technicianId,
            payload: {
              id: row.id,
              client_msg_id: row.clientMsgId,
              organization_id: row.organizationId,
              technician_id: row.technicianId,
              sender_role: row.senderRole,
              sender_id: row.senderId,
              body: row.body,
              attachment_url: row.attachmentUrl,
              attachment_kind: row.attachmentKind,
              read_at: row.readAt ? new Date(row.readAt).toISOString() : null,
              created_at: new Date(row.createdAt).toISOString(),
            },
          })
        )
      );
      return NextResponse.json(
        {
          ok: true,
          broadcast: true,
          sentTo: serialized.length,
          messages: serialized,
          fcm: {
            targetedDevices: totalTargeted,
            sentCount: totalSent,
            payload: samplePayload,
          },
        },
        { status: 201, headers: NO_STORE_HEADERS }
      );
    }

    // --- 1:1 MESSAGE FLOW ---
    let created: any;
    let deduplicated = false;
    try {
      created = await (db as any).message.create({
        data: {
          clientMsgId,
          organizationId: actor.organizationId,
          technicianId: targetTechnicianId,
          senderRole: actor.kind,
          senderId: actor.userId,
          body: cleanBody,
          attachmentUrl: cleanImageRef,
          attachmentKind: cleanImageRef ? 'IMAGE' : null,
        },
      });
    } catch (createErr: any) {
      if (createErr?.code === 'P2002') {
        created = await (db as any).message.findUnique({ where: { clientMsgId } });
        deduplicated = true;
      } else {
        throw createErr;
      }
    }

    // Determine recipient user IDs for DATA-only FCM push
    let recipientUserIds: string[] = [];
    if (actor.kind === 'AGENCY') {
      recipientUserIds = [targetTechnicianId];
    } else {
      const agencyUsers: Array<{ id: string }> = await (db as any).userProfile.findMany({
        where: {
          organizationId: actor.organizationId,
          status: 'ACTIVE',
          role: { notIn: ['TECHNICIAN', 'CLIENT'] },
        },
        select: { id: true },
      });
      recipientUserIds = agencyUsers.map((u) => u.id);
    }

    const fcmResult = deduplicated
      ? { targetedDevices: 0, sentCount: 0, payload: null }
      : await enqueueChatMessagePush({
          recipientUserIds,
          technicianId: targetTechnicianId,
          body: cleanBody,
          attachmentKind: created.attachmentKind,
          senderName: actor.displayName,
          messageId: created.id,
          senderRole: actor.kind,
        });

    const [serialized] = await serializeMessagesWithSignedUrls([created]);

    if (!deduplicated) {
      await emitRealtimeMessageBroadcast({
        event: 'message_insert',
        organizationId: created.organizationId,
        technicianId: created.technicianId,
        payload: {
          id: created.id,
          client_msg_id: created.clientMsgId,
          organization_id: created.organizationId,
          technician_id: created.technicianId,
          sender_role: created.senderRole,
          sender_id: created.senderId,
          body: created.body,
          attachment_url: created.attachmentUrl,
          attachment_kind: created.attachmentKind,
          read_at: created.readAt ? new Date(created.readAt).toISOString() : null,
          created_at: new Date(created.createdAt).toISOString(),
        },
      });
    }

    return NextResponse.json(
      {
        ok: true,
        deduplicated,
        message: serialized,
        fcm: fcmResult,
      },
      { status: deduplicated ? 200 : 201, headers: NO_STORE_HEADERS }
    );
  } catch (err: any) {
    console.error('[POST /api/messages] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to send message' },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
