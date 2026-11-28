import crypto from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import {
  buildR2PrivateObjectUrl,
  extractR2PrivateKey,
  isR2PrivateConfigured,
  presignR2GetUrl,
  uploadPrivateToR2,
} from '@/lib/r2';

export const EVIDENCE_PHOTOS_BUCKET = 'evidence-photos';
export const PRIVATE_R2_PREFIX = 'private-evidence';
export const MAX_EVIDENCE_PHOTO_BYTES = 2 * 1024 * 1024; // 2 MB hard cap
export const SIGNED_EVIDENCE_URL_TTL_SEC = 3600; // 60 min presigned read URLs (prevents mid-session expiration on agency dashboard)

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
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return 'image/jpeg';
  }
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

export function buildCanonicalEvidenceStorageUrl(storagePath: string): string {
  const origin = getSupabaseOrigin();
  const cleanPath = storagePath.replace(/^\/+/, '');
  return `${origin}/storage/v1/object/${EVIDENCE_PHOTOS_BUCKET}/${cleanPath}`;
}

/**
 * Extract the bucket-relative storage path if a URL points to Supabase private `evidence-photos`.
 */
export function extractPrivateEvidencePath(urlOrPath: string | null | undefined): string | null {
  if (!urlOrPath || typeof urlOrPath !== 'string') return null;
  const trimmed = urlOrPath.trim();
  if (!trimmed) return null;

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
 * - Rejects blob:, data:, http:, javascript:, relative paths, or empty strings (HTTP 400).
 * - Requires https:// URL.
 * - For private storage URLs (R2 private S3 endpoint OR Supabase private bucket), enforces that
 *   the path belongs strictly to `organizationId` (HTTP 403 on cross-org spoofing) and strips
 *   any expiring signature query params so canonical unsigned private URLs are persisted.
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

  if (
    lower.startsWith('blob:') ||
    lower.startsWith('data:') ||
    lower.startsWith('file:') ||
    lower.startsWith('content:') ||
    lower.startsWith('capacitor:')
  ) {
    return {
      valid: false,
      error: 'Local blob:/file:/data: URLs are rejected. Upload the photo to storage first.',
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

  const safeOrgId = sanitizeIdSegment(organizationId, '');

  // Check 1: Private R2 S3 endpoint URL
  const r2PrivateKey = extractR2PrivateKey(trimmed);
  if (r2PrivateKey) {
    const allowedPrefix1 = `${PRIVATE_R2_PREFIX}/orgs/${safeOrgId}/`;
    const allowedPrefix2 = `orgs/${safeOrgId}/`;
    if (!safeOrgId || (!r2PrivateKey.startsWith(allowedPrefix1) && !r2PrivateKey.startsWith(allowedPrefix2))) {
      return {
        valid: false,
        error: 'Forbidden: photo URL does not belong to your organization.',
        status: 403,
      };
    }
    return { valid: true, url: buildR2PrivateObjectUrl(r2PrivateKey) };
  }

  // Check 2: Private Supabase Storage `evidence-photos` URL
  const supabasePrivatePath = extractPrivateEvidencePath(trimmed);
  if (supabasePrivatePath) {
    if (!safeOrgId || !supabasePrivatePath.startsWith(`orgs/${safeOrgId}/`)) {
      return {
        valid: false,
        error: 'Forbidden: photo URL does not belong to your organization.',
        status: 403,
      };
    }
    return { valid: true, url: buildCanonicalEvidenceStorageUrl(supabasePrivatePath) };
  }

  return { valid: true, url: trimmed };
}

/**
 * Upload raw image bytes (Buffer) into private tenant-isolated storage.
 * Primary: Cloudflare R2 private S3 endpoint (`private-evidence/orgs/<orgId>/<folder>/<clientPhotoId>.<ext>`)
 *   with short-lived AWS SigV4 presigned GET read URLs (direct unsigned GET denied with 400/403).
 * Fallback: Private Supabase Storage bucket `evidence-photos` if R2 is not configured.
 * Deterministic idempotent key guarantees retried uploads NEVER duplicate objects.
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

  // Primary: Private Cloudflare R2 S3 endpoint + short-lived SigV4 presigned GET read URLs
  if (isR2PrivateConfigured()) {
    const r2Key = `${PRIVATE_R2_PREFIX}/orgs/${safeOrgId}/${safeFolder}/${clientPhotoId}.${ext}`;
    const uploaded = await uploadPrivateToR2({
      key: r2Key,
      body: buffer,
      contentType,
      expiresSec: SIGNED_EVIDENCE_URL_TTL_SEC,
    });
    return {
      clientPhotoId,
      storagePath: uploaded.key,
      storageUrl: uploaded.storageUrl,
      signedUrl: uploaded.signedUrl,
      contentType,
      sizeBytes: buffer.byteLength,
    };
  }

  // Fallback: Private Supabase Storage bucket `evidence-photos`
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
 * and upload it to private storage FIRST. Throws on ANY error (never silently returns data:!).
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
 * - Private R2 S3 URLs belonging to `organizationId` -> 15-min AWS SigV4 presigned GET URL (<1ms local signing!).
 * - Private Supabase `evidence-photos` URLs belonging to `organizationId` -> 15-min Supabase signed URL.
 * - Private URLs belonging to ANOTHER org -> null (blocked!).
 * - Legacy external `https://` URLs (historic R2 public URLs) -> returned as-is for backward compatibility.
 * - Any invalid / non-https / data: / blob: URL -> null (renders honest "Photo not received" placeholder).
 */
export async function resolveSignedEvidenceUrlMap(
  rawUrls: Array<string | null | undefined>,
  organizationId: string
): Promise<Map<string, string | null>> {
  const result = new Map<string, string | null>();
  const safeOrgId = sanitizeIdSegment(organizationId, '');
  const sbPathsToSign: string[] = [];
  const rawToSbPath = new Map<string, string>();

  const uniqueUrls = Array.from(
    new Set(
      rawUrls
        .filter((u): u is string => typeof u === 'string' && u.trim().length > 0)
        .map((u) => u.trim())
    )
  );

  for (const raw of uniqueUrls) {
    const lowerRaw = raw.toLowerCase();
    // Explicitly reject local temporary/inline schemes
    if (
      lowerRaw.startsWith('blob:') ||
      lowerRaw.startsWith('file:') ||
      lowerRaw.startsWith('content:') ||
      lowerRaw.startsWith('capacitor:') ||
      lowerRaw.startsWith('data:') ||
      lowerRaw.startsWith('javascript:')
    ) {
      result.set(raw, null);
      continue;
    }

    // 1. Private R2 S3 endpoint URL or relative `private-evidence/...` key -> instant local SigV4 presigned GET URL
    const r2Key = extractR2PrivateKey(raw);
    if (r2Key) {
      const okPrefix1 = `${PRIVATE_R2_PREFIX}/orgs/${safeOrgId}/`;
      const okPrefix2 = `orgs/${safeOrgId}/`;
      if (!safeOrgId || (!r2Key.startsWith(okPrefix1) && !r2Key.startsWith(okPrefix2))) {
        result.set(raw, null);
        continue;
      }
      result.set(raw, presignR2GetUrl(r2Key, SIGNED_EVIDENCE_URL_TTL_SEC));
      continue;
    }

    // 2. Relative `orgs/<orgId>/...` path (with or without leading slash)
    const strippedRel = raw.replace(/^\/+/, '');
    if (strippedRel.startsWith('orgs/') && !strippedRel.includes('..')) {
      if (!safeOrgId || !strippedRel.startsWith(`orgs/${safeOrgId}/`)) {
        result.set(raw, null);
        continue;
      }
      // Prefer R2 presigned GET URL when R2 is configured (covers both public and private R2 objects)
      if (isR2PrivateConfigured()) {
        const signed = presignR2GetUrl(strippedRel, SIGNED_EVIDENCE_URL_TTL_SEC);
        if (signed) {
          result.set(raw, signed);
          continue;
        }
      }
      // Otherwise sign against private Supabase Storage `evidence-photos` bucket
      rawToSbPath.set(raw, strippedRel);
      if (!sbPathsToSign.includes(strippedRel)) {
        sbPathsToSign.push(strippedRel);
      }
      continue;
    }

    // 3. Full Private Supabase Storage `evidence-photos` URL
    const sbPath = extractPrivateEvidencePath(raw);
    if (sbPath) {
      if (!safeOrgId || !sbPath.startsWith(`orgs/${safeOrgId}/`)) {
        result.set(raw, null);
        continue;
      }
      rawToSbPath.set(raw, sbPath);
      if (!sbPathsToSign.includes(sbPath)) {
        sbPathsToSign.push(sbPath);
      }
      continue;
    }

    // 4. Historic external https:// URLs (backward compatibility for pre-fix R2 public URLs)
    if (raw.startsWith('https://')) {
      result.set(raw, raw);
    } else {
      result.set(raw, null);
    }
  }

  if (sbPathsToSign.length > 0) {
    try {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase.storage
        .from(EVIDENCE_PHOTOS_BUCKET)
        .createSignedUrls(sbPathsToSign, SIGNED_EVIDENCE_URL_TTL_SEC);

      const signedByPath = new Map<string, string>();
      if (!error && Array.isArray(data)) {
        for (const entry of data) {
          if (entry?.path && entry?.signedUrl) {
            signedByPath.set(entry.path, entry.signedUrl);
          }
        }
      }

      for (const [raw, path] of rawToSbPath.entries()) {
        result.set(raw, signedByPath.get(path) || null);
      }
    } catch (err) {
      console.error('[evidencePhotos] Failed to mint Supabase signed read URLs:', err);
      for (const [raw] of rawToSbPath.entries()) {
        result.set(raw, null);
      }
    }
  }

  return result;
}

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

/**
 * Sign Equipment records including `equipment.photoUrl` and nested `inspections[].photos` / `inspectionPhotos[]`.
 * Ensures every dashboard equipment list, building-nested equipment list, and edit modal receives valid read URLs.
 */
export async function signEquipmentRecords<T extends Record<string, any>>(
  equipments: T[],
  organizationId: string
): Promise<T[]> {
  if (!Array.isArray(equipments) || equipments.length === 0) return equipments;

  const allUrls: string[] = [];
  for (const eq of equipments) {
    if (typeof eq?.photoUrl === 'string' && eq.photoUrl.trim()) {
      allUrls.push(eq.photoUrl);
    }
    if (Array.isArray(eq?.inspections)) {
      for (const ins of eq.inspections) {
        if (Array.isArray(ins?.inspectionPhotos)) {
          for (const p of ins.inspectionPhotos) {
            if (p?.photoUrl) allUrls.push(p.photoUrl);
          }
        }
        for (const u of parsePhotosField(ins?.photos)) {
          allUrls.push(u);
        }
      }
    }
  }

  const signedMap = await resolveSignedEvidenceUrlMap(allUrls, organizationId);

  return equipments.map((eq) => {
    const signedInspections = Array.isArray(eq.inspections)
      ? eq.inspections.map((ins: any) => {
          const signedRelPhotos = Array.isArray(ins.inspectionPhotos)
            ? ins.inspectionPhotos.map((p: any) => {
                const resolved = p?.photoUrl ? signedMap.get(String(p.photoUrl).trim()) ?? null : null;
                return {
                  ...p,
                  storageUrl: p?.photoUrl || null,
                  photoUrl: resolved,
                  signedUrl: resolved,
                };
              })
            : ins.inspectionPhotos;

          const signedLegacy = parsePhotosField(ins.photos)
            .map((u) => signedMap.get(u) ?? null)
            .filter((u): u is string => Boolean(u));

          return {
            ...ins,
            inspectionPhotos: signedRelPhotos,
            photos:
              signedLegacy.length > 0
                ? JSON.stringify(signedLegacy)
                : Array.isArray(signedRelPhotos) && signedRelPhotos.some((p: any) => p.photoUrl)
                ? JSON.stringify(signedRelPhotos.map((p: any) => p.photoUrl).filter(Boolean))
                : null,
          };
        })
      : eq.inspections;

    const latestInspPhoto =
      signedInspections?.[0]?.inspectionPhotos?.find((p: any) => p?.photoUrl)?.photoUrl ||
      parsePhotosField(signedInspections?.[0]?.photos)[0] ||
      null;

    const resolvedEqPhoto = eq.photoUrl
      ? signedMap.get(String(eq.photoUrl).trim()) ?? null
      : null;

    return {
      ...eq,
      photoUrl: resolvedEqPhoto || latestInspPhoto,
      inspections: signedInspections,
    };
  });
}
