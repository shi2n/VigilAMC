import { NextResponse } from 'next/server';
import { getAuthenticatedActor } from '@/lib/techSession';
import {
  EVIDENCE_NO_STORE_HEADERS,
  MAX_EVIDENCE_PHOTO_BYTES,
  uploadEvidencePhotoBuffer,
} from '@/lib/evidencePhotos';

export const dynamic = 'force-dynamic';

/**
 * POST /api/photos/upload
 * Network-first, idempotent, confirmed evidence photo upload to private bucket (`evidence-photos`).
 * Accepts multipart/form-data (`file`, `clientPhotoId`, `folder`, `capturedAt`, ...)
 * or JSON (`dataUrl`, `clientPhotoId`, `folder`, `capturedAt`).
 * Returns confirmed canonical `storageUrl` (https://...) + short-lived `signedUrl`.
 */
export async function POST(request: Request) {
  try {
    const auth = await getAuthenticatedActor(request);
    const organizationId = auth?.profile?.organizationId || auth?.organization?.id;

    if (!auth || !auth.user || !organizationId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: EVIDENCE_NO_STORE_HEADERS }
      );
    }

    const contentTypeHeader = (request.headers.get('content-type') || '').toLowerCase();

    let buffer: Buffer;
    let declaredMimeType = '';
    let folder = 'inspections';
    let clientPhotoId = '';
    let capturedAtRaw: string | null = null;

    if (contentTypeHeader.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file');
      const folderField = formData.get('folder');
      const clientIdField = formData.get('clientPhotoId') || formData.get('client_id');
      const capturedAtField = formData.get('capturedAt');

      if (typeof folderField === 'string' && folderField.trim()) {
        folder = folderField.trim().toLowerCase();
      }
      if (typeof clientIdField === 'string' && clientIdField.trim()) {
        clientPhotoId = clientIdField.trim();
      }
      if (typeof capturedAtField === 'string' && capturedAtField.trim()) {
        capturedAtRaw = capturedAtField.trim();
      }

      if (!file || typeof (file as any).arrayBuffer !== 'function') {
        return NextResponse.json(
          { error: 'File field is required in multipart/form-data.' },
          { status: 400, headers: EVIDENCE_NO_STORE_HEADERS }
        );
      }

      const blob = file as File;
      declaredMimeType = (blob.type || '').toLowerCase();
      const arr = await blob.arrayBuffer();
      buffer = Buffer.from(arr);
    } else {
      const body = await request.json().catch(() => null);
      if (!body || typeof body.dataUrl !== 'string') {
        return NextResponse.json(
          { error: 'Provide multipart/form-data with "file" or JSON with "dataUrl".' },
          { status: 400, headers: EVIDENCE_NO_STORE_HEADERS }
        );
      }
      if (typeof body.folder === 'string' && body.folder.trim()) {
        folder = body.folder.trim().toLowerCase();
      }
      if (typeof body.clientPhotoId === 'string' && body.clientPhotoId.trim()) {
        clientPhotoId = body.clientPhotoId.trim();
      } else if (typeof body.client_id === 'string' && body.client_id.trim()) {
        clientPhotoId = body.client_id.trim();
      }
      if (body.capturedAt) {
        capturedAtRaw = String(body.capturedAt);
      }

      const match = body.dataUrl.trim().match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,([\s\S]+)$/);
      if (!match) {
        return NextResponse.json(
          { error: 'Invalid base64 image dataUrl format.' },
          { status: 400, headers: EVIDENCE_NO_STORE_HEADERS }
        );
      }
      declaredMimeType = match[1].toLowerCase();
      buffer = Buffer.from(match[2], 'base64');
    }

    if (buffer.byteLength === 0) {
      return NextResponse.json(
        { error: 'Uploaded photo is empty.' },
        { status: 400, headers: EVIDENCE_NO_STORE_HEADERS }
      );
    }

    if (buffer.byteLength > MAX_EVIDENCE_PHOTO_BYTES) {
      return NextResponse.json(
        {
          error: `Photo exceeds 2 MB limit (${(buffer.byteLength / (1024 * 1024)).toFixed(2)} MB received).`,
        },
        { status: 413, headers: EVIDENCE_NO_STORE_HEADERS }
      );
    }

    const uploaded = await uploadEvidencePhotoBuffer({
      buffer,
      declaredMimeType,
      organizationId,
      folder,
      clientPhotoId: clientPhotoId || undefined,
    });

    // Preserve original capture timestamp (never overwrite with "now" if provided)
    let capturedAtIso: string | null = null;
    if (capturedAtRaw) {
      const asNum = Number(capturedAtRaw);
      const dt = Number.isFinite(asNum) && asNum > 1e11 ? new Date(asNum) : new Date(capturedAtRaw);
      if (!isNaN(dt.getTime())) {
        capturedAtIso = dt.toISOString();
      }
    }

    return NextResponse.json(
      {
        ok: true,
        success: true,
        clientPhotoId: uploaded.clientPhotoId,
        storagePath: uploaded.storagePath,
        storageUrl: uploaded.storageUrl,
        url: uploaded.storageUrl,
        signedUrl: uploaded.signedUrl,
        contentType: uploaded.contentType,
        sizeBytes: uploaded.sizeBytes,
        capturedAt: capturedAtIso,
      },
      { status: 200, headers: EVIDENCE_NO_STORE_HEADERS }
    );
  } catch (error: any) {
    console.error('[POST /api/photos/upload] Error:', error);
    const msg = error?.message || 'Photo upload failed';
    const isClientErr = /invalid image|unsupported image|empty|exceeds|required/i.test(msg);
    return NextResponse.json(
      { error: msg },
      { status: isClientErr ? 400 : 500, headers: EVIDENCE_NO_STORE_HEADERS }
    );
  }
}
