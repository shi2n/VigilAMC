import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getAuthenticatedActor } from '@/lib/techSession';
import { uploadToR2 } from '@/lib/r2';
import {
  EVIDENCE_NO_STORE_HEADERS,
  MAX_EVIDENCE_PHOTO_BYTES,
  uploadEvidencePhotoBuffer,
} from '@/lib/evidencePhotos';

export const dynamic = 'force-dynamic';

const ALLOWED_MIME_TYPES: Record<string, string> = {
  'image/webp': 'webp',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
};

const PRIVATE_EVIDENCE_FOLDERS = new Set(['inspections', 'tasks', 'defects', 'reports']);
const ALLOWED_FOLDERS = new Set(['inspections', 'tasks', 'reports', 'equipment', 'defects', 'branding']);
const MAX_BRANDING_SIZE_BYTES = 4 * 1024 * 1024; // 4 MB for agency branding/equipment

export async function POST(request: Request) {
  try {
    const auth = await getAuthenticatedActor(request);
    const organizationId = auth?.profile?.organizationId || auth?.organization?.id;

    if (!auth || !auth.user || !organizationId) {
      return NextResponse.json(
        { error: 'Unauthorized: Valid authentication required' },
        { status: 401, headers: EVIDENCE_NO_STORE_HEADERS }
      );
    }

    const contentTypeHeader = (request.headers.get('content-type') || '').toLowerCase();

    let buffer: Buffer;
    let mimeType = '';
    let requestedFolder = 'inspections';
    let clientPhotoId = '';

    if (contentTypeHeader.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file');
      const folderField = formData.get('folder');
      const clientIdField = formData.get('clientPhotoId') || formData.get('client_id');
      if (typeof folderField === 'string' && folderField.trim()) {
        requestedFolder = folderField.trim().toLowerCase();
      }
      if (typeof clientIdField === 'string' && clientIdField.trim()) {
        clientPhotoId = clientIdField.trim();
      }

      if (!file || typeof (file as any).arrayBuffer !== 'function') {
        return NextResponse.json(
          { error: 'File field is required in multipart/form-data' },
          { status: 400, headers: EVIDENCE_NO_STORE_HEADERS }
        );
      }

      const blob = file as File;
      mimeType = (blob.type || '').toLowerCase();
      const arrayBuf = await blob.arrayBuffer();
      buffer = Buffer.from(arrayBuf);
    } else {
      const body = await request.json().catch(() => null);
      if (!body || typeof body.dataUrl !== 'string') {
        return NextResponse.json(
          { error: 'Provide either multipart/form-data with "file" or JSON with "dataUrl"' },
          { status: 400, headers: EVIDENCE_NO_STORE_HEADERS }
        );
      }

      if (typeof body.folder === 'string' && body.folder.trim()) {
        requestedFolder = body.folder.trim().toLowerCase();
      }
      if (typeof body.clientPhotoId === 'string' && body.clientPhotoId.trim()) {
        clientPhotoId = body.clientPhotoId.trim();
      }

      const match = body.dataUrl.trim().match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,([\s\S]+)$/);
      if (!match) {
        return NextResponse.json(
          { error: 'Invalid base64 image dataUrl format' },
          { status: 400, headers: EVIDENCE_NO_STORE_HEADERS }
        );
      }

      mimeType = match[1].toLowerCase();
      buffer = Buffer.from(match[2], 'base64');
    }

    const safeFolder = ALLOWED_FOLDERS.has(requestedFolder) ? requestedFolder : 'inspections';

    // Route all evidence photos (inspections, tasks, defects, reports) into private Supabase Storage bucket
    if (PRIVATE_EVIDENCE_FOLDERS.has(safeFolder)) {
      if (buffer.byteLength > MAX_EVIDENCE_PHOTO_BYTES) {
        return NextResponse.json(
          {
            error: `Image exceeds maximum size limit of 2 MB (received ${(buffer.byteLength / (1024 * 1024)).toFixed(2)} MB)`,
          },
          { status: 413, headers: EVIDENCE_NO_STORE_HEADERS }
        );
      }
      const uploaded = await uploadEvidencePhotoBuffer({
        buffer,
        declaredMimeType: mimeType,
        organizationId,
        folder: safeFolder,
        clientPhotoId: clientPhotoId || undefined,
      });
      return NextResponse.json(
        {
          success: true,
          ok: true,
          url: uploaded.storageUrl,
          storageUrl: uploaded.storageUrl,
          signedUrl: uploaded.signedUrl,
          clientPhotoId: uploaded.clientPhotoId,
          key: uploaded.storagePath,
          sizeBytes: uploaded.sizeBytes,
        },
        { status: 200, headers: EVIDENCE_NO_STORE_HEADERS }
      );
    }

    // Branding & equipment catalog photos continue using R2 public CDN
    const ext = ALLOWED_MIME_TYPES[mimeType];
    if (!ext) {
      return NextResponse.json(
        { error: `Unsupported image MIME type "${mimeType}". Allowed: image/webp, image/jpeg, image/png.` },
        { status: 400, headers: EVIDENCE_NO_STORE_HEADERS }
      );
    }

    if (buffer.byteLength === 0) {
      return NextResponse.json(
        { error: 'Uploaded image file is empty' },
        { status: 400, headers: EVIDENCE_NO_STORE_HEADERS }
      );
    }

    if (buffer.byteLength > MAX_BRANDING_SIZE_BYTES) {
      return NextResponse.json(
        { error: `Image exceeds maximum size limit of 4 MB (received ${(buffer.byteLength / (1024 * 1024)).toFixed(2)} MB)` },
        { status: 400, headers: EVIDENCE_NO_STORE_HEADERS }
      );
    }

    const safeOrgId = String(organizationId).replace(/[^a-zA-Z0-9_-]/g, '');
    const key = `orgs/${safeOrgId}/${safeFolder}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
    const normalizedContentType = mimeType === 'image/jpg' ? 'image/jpeg' : mimeType;

    const { url } = await uploadToR2({
      key,
      body: buffer,
      contentType: normalizedContentType,
      cacheControl: 'public, max-age=31536000, immutable',
    });

    return NextResponse.json(
      {
        success: true,
        url,
        key,
        sizeBytes: buffer.byteLength,
      },
      { status: 200, headers: EVIDENCE_NO_STORE_HEADERS }
    );
  } catch (error: any) {
    console.error('Error in POST /api/upload:', error);
    const msg = error?.message || 'Photo upload failed';
    const isClientErr = /invalid image|unsupported image|empty|exceeds|required/i.test(msg);
    return NextResponse.json(
      { error: msg },
      { status: isClientErr ? 400 : 500, headers: EVIDENCE_NO_STORE_HEADERS }
    );
  }
}
