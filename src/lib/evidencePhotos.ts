import crypto from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const EVIDENCE_PHOTOS_BUCKET = 'evidence-photos';
export const MAX_EVIDENCE_PHOTO_BYTES = 2 * 1024 * 1024; // 2 MB hard cap
export const SIGNED_EVIDENCE_URL_TTL_SEC = 900; // 15 min short-lived read URLs

export const ALLOWED_EVIDENCE_MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export const ALLOWED_EVIDENCE_FOLDERS = new Set([
  'tasks',
  'inspections',
  'reports',
  'equipment',
  'defects',
]);

export const EVIDENCE_NO_STORE_HEADERS: Record<string, string> = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  Pragma: 'no-cache',
};

function getSupabaseOrigin(): string {
  const raw = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
  return raw.replace(/\/+$/, '');
}

/**
 * Verify magic bytes match an allowed image format (JPEG, PNG, or WebP)
 */
export function detectImageMimeFromBuffer(buf: Buffer): 'image/jpeg' | 'image/png' | 'image/webp' | null {
  if (!buf || buf.length < 12) return null;
  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return 'image/jpeg';
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  ) {
    return 'image/png';
  }
  // WebP: RIFF....WEBP
  if (
    buf[0] === 0x52 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x46 &&
    buf[8] === 0x57 &&
    buf[9] === 0x45 &&
    buf[10] === 0x42 &&
    buf[11] === 0x50
  ) {
    return 'image/webp';
  }
  return null;
}

export function sanitizeIdSegment(raw: string, fallback = 'item'): string {
  const cleaned = String(raw || '')
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '');
  return cleaned.slice(0, 80) || fallback;
}

/**
 * Canonical private storage HTTPS URL stored in database records.
 * Format: https://<supabase-host>/storage/v1/object/evidence-photos/orgs/<orgId>/<folder>/<clientPhotoId>.<ext>
 * Direct unauthenticated requests to this URL fail (bucket is private).
 * Authorized reads exchange this URL for a short-lived signed read URL.
 */
export function buildCanonicalEvidenceStorageUrl(storagePath: string): string {
  const origin = getSupabaseOrigin();
  const cleanPath = storagePath.replace(/^\/+/, '');
  return `${origin}/storage/v1/object/${EVIDENCE_PHOTOS_BUCKET}/${cleanPath}`;
}

/**
 * Extract the bucket-relative storage path if a URL points to our private `evidence-photos` bucket.
 * Supports canonical object URLs, signed URLs (strips query), and bare `orgs/...` paths.
 */
export function extractPrivateEvidencePath(urlOrPath: string | null | undefined): string | null {
  if (!urlOrPath || typeof urlOrPath !== 'string') return null;
  const trimmed = urlOrPath.trim();
  if (!trimmed) return null;

  // Bare tenant path (backward-safe helper)
  if (trimmed.startsWith('orgs/') && !trimmed.includes('..')) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    const pathname = decodeURIComponent(parsed.pathname);
    const markers = [
      `/storage/v1/object/${EVIDENCE_PHOTOS_BUCKET}/`,
      `/storage/v1/object/sign/${EVIDENCE_PHOTOS_BUCKET}/`,
      `/storage/v1/object/authenticated/${EVIDENCE_PHOTOS_BUCKET}/`,
      `/storage/v1/object/public/${EVIDENCE_PHOTOS_BUCKET}/`,
    ];
    for (const marker of markers) {
      const idx = pathname.indexOf(marker);
      if (idx >= 0) {
        const rel = pathname.slice(idx + marker.length).replace(/^\/+/, '');
        if (rel && !rel.includes('..')) return rel;
      }
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Server-side strict validation for persisted photo URLs.
 * - Rejects blob:, data:, http:, javascript:, relative paths, or empty strings.
 * - Requires https:// URL.
 * - If URL references our private evidence-photos bucket, enforces that it belongs to `organizationId`.
 */
export function validateStoredPhotoUrl(
  rawUrl: unknown,
  organizationId: string
): { valid: true; url: string } | { valid: false; error: string; status: number } {
  if (typeof rawUrl !== 'string' || !rawUrl.trim()) {
    return { valid: false, error: 'Photo URL must be a non-empty https:// URL.', status: 400 };
  }

  const trimmed = rawUrl.trim();
  const lower = trimmed.toLowerCase();

  if (lower.startsWith('blob:') || lower.startsWith('data:')) {
    return {
      valid: false,
      error: 'Local blob:/data: URLs are rejected. Upload the photo to storage first.',
      status: 400,
    };
  }

  if (!lower.startsWith('https://')) {
    return {
      valid: false,
      error: 'Only confirmed https:// photo URLs are allowed.',
      status: 400,
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { valid: false, error: 'Invalid photo URL format.', status: 400 };
  }

  if (parsed.protocol !== 'https:' || !parsed.hostname) {
    return { valid: false, error: 'Only confirmed https:// photo URLs are allowed.', status: 400 };
  }

  // Enforce strict tenant isolation for private evidence-photos bucket URLs
  const privatePath = extractPrivateEvidencePath(trimmed);
  if (privatePath) {
    const safeOrgId = sanitizeIdSegment(organizationId, '');
    if (!safeOrgId || !privatePath.startsWith(`orgs/${safeOrgId}/`)) {
      return {
        valid: false,
        error: 'Forbidden: photo URL does not belong to your organization.',
        status: 403,
      };
    }
    // Always store the canonical (unsigned) https:// storage object URL, never an expiring signed token
    return { valid: true, url: buildCanonicalEvidenceStorageUrl(privatePath) };
  }

  return { valid: true, url: trimmed };
}

/**
 * Upload raw image bytes (Buffer) into private Supabase Storage bucket `evidence-photos`.
 * Uses deterministic idempotent key `orgs/<orgId>/<folder>/<clientPhotoId>.<ext>` with upsert:true
 * so retried uploads NEVER duplicate objects.
 */
export async function uploadEvidencePhotoBuffer(params: {
  buffer: Buffer;
  declaredMimeType?: string;
  organizationId: string;
  folder: string;
  clientPhotoId?: string;
}): Promise<{
  clientPhotoId: string;
  storagePath: string;
  storageUrl: string;
  signedUrl: string | null;
  contentType: string;
  sizeBytes: number;
}> {
  const { buffer, declaredMimeType, organizationId } = params;
  if (!buffer || buffer.byteLength === 0) {
    throw new Error('Uploaded photo is empty.');
  }
  if (buffer.byteLength > MAX_EVIDENCE_PHOTO_BYTES) {
    throw new Error(
      `Photo exceeds maximum size limit of 2 MB (${(buffer.byteLength / (1024 * 1024)).toFixed(2)} MB received).`
    );
  }

  const detectedMime = detectImageMimeFromBuffer(buffer);
  const declaredClean = (declaredMimeType || '').toLowerCase().trim();
  const normalizedDeclared = declaredClean === 'image/jpg' ? 'image/jpeg' : declaredClean;

  // Enforce real image binary signature (prevents non-image payloads)
  if (!detectedMime) {
    throw new Error('Invalid image file. Only JPEG, PNG, and WebP images are supported.');
  }
  if (normalizedDeclared && !ALLOWED_EVIDENCE_MIME_TO_EXT[normalizedDeclared]) {
    throw new Error(
      `Unsupported image format "${declaredMimeType}". Only JPEG, PNG, and WebP images are allowed.`
    );
  }

  const contentType = detectedMime;
  const ext = ALLOWED_EVIDENCE_MIME_TO_EXT[contentType] || 'jpg';
  const safeOrgId = sanitizeIdSegment(organizationId, '');
  if (!safeOrgId) {
    throw new Error('Valid organizationId is required for photo upload.');
  }

  const folderClean = (params.folder || 'inspections').toLowerCase().trim();
  const safeFolder = ALLOWED_EVIDENCE_FOLDERS.has(folderClean) ? folderClean : 'inspections';
  const clientPhotoId = sanitizeIdSegment(params.clientPhotoId || '', '') || crypto.randomUUID();
  const storagePath = `orgs/${safeOrgId}/${safeFolder}/${clientPhotoId}.${ext}`;

  const supabase = getSupabaseAdmin();
  const { error: uploadError } = await supabase.storage
    .from(EVIDENCE_PHOTOS_BUCKET)
    .upload(storagePath, buffer, {
      contentType,
      upsert: true,
      cacheControl: '31536000',
    });

  if (uploadError) {
    throw new Error(`Storage upload failed: ${uploadError.message}`);
  }

  const storageUrl = buildCanonicalEvidenceStorageUrl(storagePath);

  // Also mint a short-lived signed read URL for immediate confirmation/preview
  const { data: signedData } = await supabase.storage
    .from(EVIDENCE_PHOTOS_BUCKET)
    .createSignedUrl(storagePath, SIGNED_EVIDENCE_URL_TTL_SEC)
    .catch(() => ({ data: null }));

  return {
    clientPhotoId,
    storagePath,
    storageUrl,
    signedUrl: signedData?.signedUrl || null,
    contentType,
    sizeBytes: buffer.byteLength,
  };
}

/**
 * Decode a base64 `data:image/...;base64,...` string (used ONLY for server-side legacy outbox recovery)
 * and upload it to the private `evidence-photos` bucket. Throws on ANY error (never silently returns data:!).
 */
export async function uploadLegacyDataUrlToEvidenceBucket(params: {
  dataUrl: string;
  organizationId: string;
  folder: string;
  clientPhotoId?: string;
}): Promise<{
  clientPhotoId: string;
  storagePath: string;
  storageUrl: string;
  signedUrl: string | null;
}> {
  const match = params.dataUrl.trim().match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,([\s\S]+)$/);
  if (!match) {
    throw new Error('Invalid base64 image dataUrl format.');
  }
  const declaredMimeType = match[1].toLowerCase();
  const buffer = Buffer.from(match[2], 'base64');
  return uploadEvidencePhotoBuffer({
    buffer,
    declaredMimeType,
    organizationId: params.organizationId,
    folder: params.folder,
    clientPhotoId: params.clientPhotoId,
  });
}

/**
 * Batch-mint short-lived signed read URLs for a list of raw stored URLs,
 * enforcing strict tenant isolation (`orgs/<organizationId>/...`).
 * - Private `evidence-photos` URLs belonging to `organizationId` -> short-lived signed URL (15 min).
 * - Private `evidence-photos` URLs belonging to ANOTHER org -> null (blocked!).
 * - Legacy external `https://` URLs (e.g. historic R2 URLs) -> returned as-is for backward compatibility.
 * - Any invalid / non-https / data: / blob: URL -> null (triggers honest "Photo not received" placeholder).
 */
export async function resolveSignedEvidenceUrlMap(
  rawUrls: Array<string | null | undefined>,
  organizationId: string
): Promise<Map<string, string | null>> {
  const result = new Map<string, string | null>();
  const safeOrgId = sanitizeIdSegment(organizationId, '');
  const pathsToSign: string[] = [];
  const rawToPath = new Map<string, string>();

  const uniqueUrls = Array.from(
    new Set(
      rawUrls
        .filter((u): u is string => typeof u === 'string' && u.trim().length > 0)
        .map((u) => u.trim())
    )
  );

  for (const raw of uniqueUrls) {
    const privatePath = extractPrivateEvidencePath(raw);
    if (privatePath) {
      if (!safeOrgId || !privatePath.startsWith(`orgs/${safeOrgId}/`)) {
        result.set(raw, null);
        continue;
      }
      rawToPath.set(raw, privatePath);
      if (!pathsToSign.includes(privatePath)) {
        pathsToSign.push(privatePath);
      }
      continue;
    }

    if (raw.startsWith('https://')) {
      result.set(raw, raw);
    } else {
      result.set(raw, null);
    }
  }

  if (pathsToSign.length > 0) {
    try {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase.storage
        .from(EVIDENCE_PHOTOS_BUCKET)
        .createSignedUrls(pathsToSign, SIGNED_EVIDENCE_URL_TTL_SEC);

      const signedByPath = new Map<string, string>();
      if (!error && Array.isArray(data)) {
        for (const entry of data) {
          if (entry?.path && entry?.signedUrl) {
            signedByPath.set(entry.path, entry.signedUrl);
          }
        }
      }

      for (const [raw, path] of rawToPath.entries()) {
        result.set(raw, signedByPath.get(path) || null);
      }
    } catch (err) {
      console.error('[evidencePhotos] Failed to mint signed read URLs:', err);
      for (const [raw] of rawToPath.entries()) {
        result.set(raw, null);
      }
    }
  }

  return result;
}

/**
 * Helper to parse legacy `Inspection.photos` JSON/string into array of strings
 */
export function parsePhotosField(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.filter((v): v is string => typeof v === 'string' && v.trim().length > 0).map((v) => v.trim());
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed
          .filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
          .map((v) => v.trim());
      }
    } catch {
      return [trimmed];
    }
  }
  return [];
}

/**
 * Sign all evidence photos on an array of Inspection rows (both `inspectionPhotos` and `photos` JSON).
 */
export async function signInspectionRecords<T extends Record<string, any>>(
  inspections: T[],
  organizationId: string
): Promise<T[]> {
  if (!Array.isArray(inspections) || inspections.length === 0) return inspections;

  const allUrls: string[] = [];
  for (const ins of inspections) {
    if (Array.isArray(ins.inspectionPhotos)) {
      for (const p of ins.inspectionPhotos) {
        if (p?.photoUrl) allUrls.push(p.photoUrl);
      }
    }
    for (const u of parsePhotosField(ins.photos)) {
      allUrls.push(u);
    }
  }

  const signedMap = await resolveSignedEvidenceUrlMap(allUrls, organizationId);

  return inspections.map((ins) => {
    const signedInspectionPhotos = Array.isArray(ins.inspectionPhotos)
      ? ins.inspectionPhotos.map((p: any) => {
          const resolved = p?.photoUrl ? signedMap.get(p.photoUrl.trim()) ?? null : null;
          return {
            ...p,
            storageUrl: p?.photoUrl || null,
            photoUrl: resolved,
            signedUrl: resolved,
          };
        })
      : ins.inspectionPhotos;

    const rawLegacy = parsePhotosField(ins.photos);
    const signedLegacy = rawLegacy
      .map((u) => signedMap.get(u) ?? null)
      .filter((u): u is string => Boolean(u));

    return {
      ...ins,
      inspectionPhotos: signedInspectionPhotos,
      photos:
        signedLegacy.length > 0
          ? JSON.stringify(signedLegacy)
          : Array.isArray(signedInspectionPhotos) && signedInspectionPhotos.some((p: any) => p.photoUrl)
          ? JSON.stringify(signedInspectionPhotos.map((p: any) => p.photoUrl).filter(Boolean))
          : null,
    };
  });
}

/**
 * Sign all evidence photos on an array of WorkOrder rows (`photoUrl` and `photos: WorkOrderPhoto[]`).
 */
export async function signWorkOrderRecords<T extends Record<string, any>>(
  workOrders: T[],
  organizationId: string
): Promise<T[]> {
  if (!Array.isArray(workOrders) || workOrders.length === 0) return workOrders;

  const allUrls: string[] = [];
  for (const wo of workOrders) {
    if (wo?.photoUrl) allUrls.push(wo.photoUrl);
    if (Array.isArray(wo?.photos)) {
      for (const p of wo.photos) {
        if (p?.photoUrl) allUrls.push(p.photoUrl);
      }
    }
  }

  const signedMap = await resolveSignedEvidenceUrlMap(allUrls, organizationId);

  return workOrders.map((wo) => {
    const signedPhotos = Array.isArray(wo.photos)
      ? wo.photos.map((p: any) => {
          const resolved = p?.photoUrl ? signedMap.get(p.photoUrl.trim()) ?? null : null;
          return {
            ...p,
            storageUrl: p?.photoUrl || null,
            photoUrl: resolved,
            signedUrl: resolved,
          };
        })
      : [];

    const primarySigned =
      (wo.photoUrl ? signedMap.get(wo.photoUrl.trim()) ?? null : null) ||
      signedPhotos.find((p: any) => p.photoUrl)?.photoUrl ||
      null;

    return {
      ...wo,
      photoUrl: primarySigned,
      photos: signedPhotos,
    };
  });
}
