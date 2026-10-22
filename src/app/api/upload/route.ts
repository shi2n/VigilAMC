import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getCurrentUser } from '@/lib/auth';
import { uploadToR2 } from '@/lib/r2';

export const dynamic = 'force-dynamic';

const ALLOWED_MIME_TYPES: Record<string, string> = {
  'image/webp': 'webp',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
};

const ALLOWED_FOLDERS = new Set(['inspections', 'equipment', 'defects']);
const MAX_SIZE_BYTES = 4 * 1024 * 1024; // 4 MB

export async function POST(request: Request) {
  try {
    const auth = await getCurrentUser(request);
    const organizationId = auth?.profile?.organizationId || auth?.organization?.id;

    if (!auth || !auth.user || !organizationId) {
      return NextResponse.json({ error: 'Unauthorized: Valid authentication required' }, { status: 401 });
    }

    const contentTypeHeader = (request.headers.get('content-type') || '').toLowerCase();

    let buffer: Buffer;
    let mimeType = '';
    let requestedFolder = 'inspections';

    if (contentTypeHeader.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file');
      const folderField = formData.get('folder');
      if (typeof folderField === 'string' && folderField.trim()) {
        requestedFolder = folderField.trim().toLowerCase();
      }

      if (!file || typeof (file as any).arrayBuffer !== 'function') {
        return NextResponse.json({ error: 'File field is required in multipart/form-data' }, { status: 400 });
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
          { status: 400 }
        );
      }

      if (typeof body.folder === 'string' && body.folder.trim()) {
        requestedFolder = body.folder.trim().toLowerCase();
      }

      const match = body.dataUrl.trim().match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,([\s\S]+)$/);
      if (!match) {
        return NextResponse.json({ error: 'Invalid base64 image dataUrl format' }, { status: 400 });
      }

      mimeType = match[1].toLowerCase();
      buffer = Buffer.from(match[2], 'base64');
    }

    const ext = ALLOWED_MIME_TYPES[mimeType];
    if (!ext) {
      return NextResponse.json(
        { error: `Unsupported image MIME type "${mimeType}". Allowed: image/webp, image/jpeg, image/png.` },
        { status: 400 }
      );
    }

    if (buffer.byteLength === 0) {
      return NextResponse.json({ error: 'Uploaded image file is empty' }, { status: 400 });
    }

    if (buffer.byteLength > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: `Image exceeds maximum size limit of 4 MB (received ${(buffer.byteLength / (1024 * 1024)).toFixed(2)} MB)` },
        { status: 400 }
      );
    }

    const safeFolder = ALLOWED_FOLDERS.has(requestedFolder) ? requestedFolder : 'inspections';
    const safeOrgId = String(organizationId).replace(/[^a-zA-Z0-9_-]/g, '');
    const key = `orgs/${safeOrgId}/${safeFolder}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

    const normalizedContentType = mimeType === 'image/jpg' ? 'image/jpeg' : mimeType;

    const { url } = await uploadToR2({
      key,
      body: buffer,
      contentType: normalizedContentType,
      cacheControl: 'public, max-age=31536000, immutable',
    });

    return NextResponse.json({
      success: true,
      url,
      key,
      sizeBytes: buffer.byteLength,
    });
  } catch (error: any) {
    console.error('Error in POST /api/upload:', error);
    return NextResponse.json({ error: error.message || 'Photo upload failed' }, { status: 500 });
  }
}
