import crypto from 'crypto';
import { NextResponse } from 'next/server';
import {
  ALLOWED_IMAGE_MIME_TO_EXT,
  CHAT_MEDIA_BUCKET,
  MAX_IMAGE_BYTES,
  NO_STORE_HEADERS,
  resolveMessagingActor,
  verifyTechnicianInOrg,
} from '@/lib/messaging';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

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
    const isBroadcast = payload?.broadcast === true;
    const requestedTechId =
      typeof payload?.technicianId === 'string' ? payload.technicianId.trim() : '';
    const kind =
      typeof payload?.kind === 'string' ? payload.kind.trim().toUpperCase() : 'IMAGE';
    const rawContentType =
      typeof payload?.contentType === 'string'
        ? payload.contentType.trim().toLowerCase()
        : typeof payload?.mimeType === 'string'
          ? payload.mimeType.trim().toLowerCase()
          : 'image/jpeg';
    const sizeBytes =
      payload?.sizeBytes !== undefined && payload?.sizeBytes !== null
        ? Number(payload.sizeBytes)
        : null;

    if (kind !== 'IMAGE') {
      return NextResponse.json(
        { error: 'Only IMAGE attachments are supported' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const ext = ALLOWED_IMAGE_MIME_TO_EXT[rawContentType];
    if (!ext) {
      return NextResponse.json(
        {
          error: `Unsupported contentType "${rawContentType}". Allowed: image/jpeg, image/png, image/webp.`,
        },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    if (sizeBytes !== null) {
      if (!Number.isFinite(sizeBytes) || sizeBytes <= 0) {
        return NextResponse.json(
          { error: 'sizeBytes must be a positive number' },
          { status: 400, headers: NO_STORE_HEADERS }
        );
      }
      if (sizeBytes > MAX_IMAGE_BYTES) {
        return NextResponse.json(
          {
            error: `File exceeds maximum allowed size of 2 MB (${(sizeBytes / (1024 * 1024)).toFixed(2)} MB provided)`,
          },
          { status: 400, headers: NO_STORE_HEADERS }
        );
      }
    }

    let pathScope: string;
    if (isBroadcast) {
      if (actor.kind !== 'AGENCY') {
        return NextResponse.json(
          { error: 'Forbidden: only agency users can upload broadcast media' },
          { status: 403, headers: NO_STORE_HEADERS }
        );
      }
      const safeOrgId = actor.organizationId.replace(/[^a-zA-Z0-9_-]/g, '');
      pathScope = `broadcast_${safeOrgId}`;
    } else if (actor.kind === 'TECHNICIAN') {
      if (requestedTechId && requestedTechId !== actor.userId) {
        return NextResponse.json(
          { error: 'Forbidden: technicians can only upload media to their own thread' },
          { status: 403, headers: NO_STORE_HEADERS }
        );
      }
      pathScope = actor.userId.replace(/[^a-zA-Z0-9_-]/g, '');
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
      pathScope = tech.id.replace(/[^a-zA-Z0-9_-]/g, '');
    }

    const storagePath = `chat/${pathScope}/${crypto.randomUUID()}.${ext}`;
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.storage
      .from(CHAT_MEDIA_BUCKET)
      .createSignedUploadUrl(storagePath);

    if (error || !data?.signedUrl) {
      console.error('[POST /api/messages/upload-url] Storage error:', error);
      return NextResponse.json(
        { error: error?.message || 'Failed to mint signed upload URL' },
        { status: 500, headers: NO_STORE_HEADERS }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        bucket: CHAT_MEDIA_BUCKET,
        path: data.path || storagePath,
        uploadUrl: data.signedUrl,
        token: data.token,
        maxBytes: MAX_IMAGE_BYTES,
        contentType: rawContentType === 'image/jpg' ? 'image/jpeg' : rawContentType,
      },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (err: any) {
    console.error('[POST /api/messages/upload-url] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to mint signed upload URL' },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
