/**
 * Client-side HTML5 <canvas> image compression utility.
 * Scales max dimension to 1280px (preserving aspect ratio) and encodes to WebP/JPEG at 0.75 quality
 * (~70–110 KB instead of 5–10 MB raw camera photos).
 *
 * Guarantees:
 * - Pure in-memory base64 -> Uint8Array -> Blob conversion (never calls fetch(dataUrl), avoiding CSP/WebView failures)
 * - Always validates output Blob/File has size > 0 and an allowed image MIME type (image/webp, image/jpeg, image/png)
 * - Returns both canonical `url` (storageUrl for DB persistence) AND `signedUrl` / `localPreviewUrl` for immediate UI display
 */

export interface CompressImageOptions {
  maxDimension?: number;
  quality?: number;
  mimeType?: string;
}

const VALID_OUTPUT_MIMES = new Set(['image/webp', 'image/jpeg', 'image/png']);

function normalizeMime(raw?: string | null): 'image/webp' | 'image/jpeg' | 'image/png' {
  const clean = (raw || '').toLowerCase().trim();
  if (clean === 'image/jpg' || clean === 'image/jpeg') return 'image/jpeg';
  if (clean === 'image/webp') return 'image/webp';
  if (clean === 'image/png') return 'image/png';
  return 'image/jpeg';
}

function dataUrlToValidatedBlob(dataUrl: string, fallbackMime = 'image/jpeg'): Blob {
  const match = dataUrl.trim().match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,([\s\S]+)$/);
  if (!match || !match[2]) {
    throw new Error('Image compression produced an invalid data URL');
  }
  const mime = normalizeMime(match[1] || fallbackMime);
  const binStr = atob(match[2]);
  if (binStr.length === 0) {
    throw new Error('Image compression produced an empty image (0 bytes)');
  }
  const bytes = new Uint8Array(binStr.length);
  for (let i = 0; i < binStr.length; i++) {
    bytes[i] = binStr.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: mime });
  if (blob.size === 0) {
    throw new Error('Image compression produced a 0-byte Blob');
  }
  return blob;
}

export async function compressImageToDataUrl(
  file: File,
  options?: CompressImageOptions
): Promise<string> {
  if (!file || file.size === 0) {
    throw new Error('Selected image file is empty (0 bytes)');
  }

  const maxDimension = options?.maxDimension ?? 1280;
  const quality = options?.quality ?? 0.75;
  const requestedMime = normalizeMime(options?.mimeType ?? 'image/webp');

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = () => {
      const rawDataUrl = typeof reader.result === 'string' ? reader.result : '';
      if (!rawDataUrl.startsWith('data:')) {
        reject(new Error('Unsupported image format'));
        return;
      }

      const img = new Image();
      img.onerror = () => {
        // Only fall back to raw data URL if it is already an allowed browser-renderable image MIME
        const mimeMatch = rawDataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/);
        const rawMime = mimeMatch?.[1]?.toLowerCase() === 'image/jpg' ? 'image/jpeg' : mimeMatch?.[1]?.toLowerCase();
        if (rawMime && VALID_OUTPUT_MIMES.has(rawMime)) {
          resolve(rawDataUrl);
        } else {
          reject(new Error('Unsupported image format. Please select a JPEG, PNG, or WebP photo.'));
        }
      };
      img.onload = () => {
        try {
          let width = img.naturalWidth || img.width;
          let height = img.naturalHeight || img.height;
          if (!width || !height) {
            reject(new Error('Image has invalid zero dimensions'));
            return;
          }

          if (width > maxDimension || height > maxDimension) {
            if (width >= height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas 2D context unavailable for image compression'));
            return;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          let compressedDataUrl = canvas.toDataURL(requestedMime, quality);
          // Fallback to JPEG if browser does not support WebP canvas encoding or returned empty data URL
          if (
            !compressedDataUrl ||
            compressedDataUrl === 'data:,' ||
            !compressedDataUrl.startsWith(`data:${requestedMime};base64,`)
          ) {
            compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          }

          // Free canvas backing store immediately
          canvas.width = 0;
          canvas.height = 0;

          if (!compressedDataUrl || compressedDataUrl === 'data:,' || compressedDataUrl.length < 64) {
            reject(new Error('Failed to encode compressed image'));
            return;
          }

          resolve(compressedDataUrl);
        } catch (err) {
          reject(err);
        }
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  });
}

export async function compressImageToFile(
  file: File,
  options?: CompressImageOptions
): Promise<File> {
  const dataUrl = await compressImageToDataUrl(file, options);
  const fallbackMime = normalizeMime(options?.mimeType ?? 'image/webp');
  const blob = dataUrlToValidatedBlob(dataUrl, fallbackMime);
  const validMime = normalizeMime(blob.type || fallbackMime);
  const baseName = (file.name || 'photo').replace(/\.[^/.]+$/, '');
  const ext = validMime === 'image/webp' ? 'webp' : validMime === 'image/png' ? 'png' : 'jpg';
  const compressedFile = new File([blob], `${baseName}.${ext}`, {
    type: validMime,
    lastModified: Date.now(),
  });
  if (compressedFile.size === 0) {
    throw new Error('Compressed image file is empty (0 bytes)');
  }
  return compressedFile;
}

/**
 * Compresses an image on-device (max 1280px, 0.75 quality) and uploads it
 * via POST /api/upload, returning:
 * - `url`: confirmed canonical https:// storageUrl (safe to persist to DB)
 * - `signedUrl`: short-lived presigned read URL (for private evidence folders) or null (for public CDN folders)
 * - `previewUrl`: immediately displayable URL (`signedUrl || url` or localPreviewUrl)
 */
export async function uploadCompressedPhoto(
  file: File,
  folder: 'inspections' | 'equipment' | 'defects' | 'branding' = 'equipment',
  options?: CompressImageOptions
): Promise<{
  url: string;
  signedUrl: string | null;
  previewUrl: string;
  key?: string;
  sizeBytes: number;
  localPreviewUrl: string;
}> {
  const localPreviewUrl = await compressImageToDataUrl(file, options);
  const fallbackMime = normalizeMime(options?.mimeType ?? 'image/webp');
  const blob = dataUrlToValidatedBlob(localPreviewUrl, fallbackMime);
  const validMime = normalizeMime(blob.type || fallbackMime);
  const baseName = (file.name || 'photo').replace(/\.[^/.]+$/, '');
  const ext = validMime === 'image/webp' ? 'webp' : validMime === 'image/png' ? 'png' : 'jpg';
  const compressedFile = new File([blob], `${baseName}.${ext}`, {
    type: validMime,
    lastModified: Date.now(),
  });

  if (compressedFile.size === 0) {
    throw new Error('Compressed image is empty (0 bytes) — upload aborted.');
  }

  const formData = new FormData();
  formData.append('file', compressedFile);
  formData.append('folder', folder);

  const uploadHeaders: Record<string, string> = {};
  try {
    const { getFreshAccessToken } = await import('@/lib/clientAuth');
    const token = await getFreshAccessToken(false);
    if (token) {
      uploadHeaders['Authorization'] = `Bearer ${token}`;
    }
  } catch {
    // Fall back to cookies if token helper fails
  }

  const { fetchWithAuth } = await import('@/lib/clientAuth');
  const uploadRes = await fetchWithAuth('/api/upload', {
    method: 'POST',
    headers: uploadHeaders,
    body: formData,
  });

  const json = await uploadRes.json().catch(() => ({}));
  const canonicalUrl: string | undefined = json.storageUrl || json.url;
  if (!uploadRes.ok || typeof canonicalUrl !== 'string' || !canonicalUrl.startsWith('https://')) {
    throw new Error(json.error || `Photo upload failed (HTTP ${uploadRes.status})`);
  }

  const signedUrl: string | null =
    typeof json.signedUrl === 'string' && json.signedUrl.startsWith('https://')
      ? json.signedUrl
      : null;

  return {
    url: canonicalUrl,
    signedUrl,
    previewUrl: signedUrl || (canonicalUrl.includes('.r2.cloudflarestorage.com') ? localPreviewUrl : canonicalUrl),
    key: json.key as string | undefined,
    sizeBytes: (json.sizeBytes as number) || compressedFile.size,
    localPreviewUrl,
  };
}

export default compressImageToDataUrl;
