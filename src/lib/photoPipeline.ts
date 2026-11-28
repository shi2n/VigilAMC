/**
 * photoPipeline.ts
 * VigilAMC Technician Shared Evidence Photo Stamping & Normalization Pipeline
 * - Shared across Task Completion, Checklist/Unit Inspection, and Report Evidence
 * - Stamps crisp DAY + TIME (IST) + GPS overlay on max-1600px canvas
 * - Normalizes to JPEG (q≈0.82, max edge 1600px, hard cap <= 2MB) for zoom-proof stamp clarity
 * - Assigns stable clientPhotoId (UUID) and authoritative capturedAt timestamp at capture time
 */

export interface CompressionResult {
  dataUrl: string;
  sizeBytes: number;
  width: number;
  height: number;
}

export interface StampedEvidencePhoto {
  clientPhotoId: string;
  blob: Blob;
  file: File;
  previewUrl: string; // Local object URL for immediate preview ONLY — never sent to server
  contentType: 'image/jpeg';
  sizeBytes: number;
  width: number;
  height: number;
  capturedAt: number; // Authoritative capture timestamp (ms)
  dayOfWeek: string;
  latitude: number | null;
  longitude: number | null;
  gpsAccuracy: number | null;
  gpsSource: 'LIVE' | 'BASEMENT_CACHED';
}

export interface StampPhotoOptions {
  file: File;
  buildingName?: string;
  subjectLabel?: string; // e.g. asset tag or task title
  formattedDateTime?: string; // localized or formatted date+time string
  gps?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    timestamp?: number;
    isBasementCached?: boolean;
  } | null;
  isBasementCached?: boolean;
  maxEdge?: number; // default 1600
  maxBytes?: number; // default 2MB
}

const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export function generateClientPhotoId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `photo-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Approximate byte length of a base64 data URL
 */
export function estimateDataUrlBytes(dataUrl: string): number {
  if (!dataUrl) return 0;
  const commaIdx = dataUrl.indexOf(',');
  const b64 = commaIdx >= 0 ? dataUrl.slice(commaIdx + 1) : dataUrl;
  return Math.round((b64.length * 3) / 4);
}

function dataUrlToBlobSync(dataUrl: string, fallbackMime = 'image/jpeg'): Blob | null {
  try {
    const match = dataUrl.trim().match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,([\s\S]+)$/);
    if (!match || !match[2]) return null;
    const mime = match[1].toLowerCase() === 'image/jpg' ? 'image/jpeg' : match[1].toLowerCase();
    const binStr = atob(match[2]);
    if (binStr.length === 0) return null;
    const bytes = new Uint8Array(binStr.length);
    for (let i = 0; i < binStr.length; i++) {
      bytes[i] = binStr.charCodeAt(i);
    }
    return new Blob([bytes], { type: mime || fallbackMime });
  } catch {
    return null;
  }
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string' && reader.result.startsWith('data:')) {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read captured photo'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read captured photo'));
    reader.readAsDataURL(file);
  });
}

/**
 * Load an image from data URL, object URL, or File.
 * Avoids crossOrigin on local blob:/data: URLs and falls back to FileReader if object URL fails.
 */
function loadImage(source: string | File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    if (typeof source === 'string') {
      if (source.startsWith('http://') || source.startsWith('https://')) {
        img.crossOrigin = 'anonymous';
      }
      img.onload = () => {
        if ((img.naturalWidth || img.width) > 0 && (img.naturalHeight || img.height) > 0) {
          resolve(img);
        } else {
          reject(new Error('Decoded image has invalid zero dimensions'));
        }
      };
      img.onerror = () => reject(new Error('Failed to load image for processing'));
      img.src = source;
    } else {
      if (!source || source.size === 0) {
        reject(new Error('Captured photo file is empty (0 bytes)'));
        return;
      }
      const url = URL.createObjectURL(source);
      img.onload = () => {
        URL.revokeObjectURL(url);
        if ((img.naturalWidth || img.width) > 0 && (img.naturalHeight || img.height) > 0) {
          resolve(img);
        } else {
          reject(new Error('Captured photo has invalid zero dimensions'));
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        // Fallback via FileReader (handles restricted WebViews where blob: URLs fail to decode)
        readFileAsDataUrl(source)
          .then((dataUrl) => loadImage(dataUrl))
          .then(resolve)
          .catch(() => reject(new Error('Failed to load captured photo')));
      };
      img.src = url;
    }
  });
}

async function canvasToBlob(canvas: HTMLCanvasElement, mime: string, quality: number): Promise<Blob> {
  const normalizedMime = mime === 'image/jpg' ? 'image/jpeg' : mime;

  if (typeof canvas.toBlob === 'function') {
    const nativeBlob = await new Promise<Blob | null>((resolve) => {
      try {
        canvas.toBlob((blob) => resolve(blob), normalizedMime, quality);
      } catch {
        resolve(null);
      }
    });
    if (nativeBlob && nativeBlob.size > 0) {
      if (nativeBlob.type === normalizedMime) {
        return nativeBlob;
      }
      // Some WebViews emit an empty MIME type on toBlob; ensure proper MIME type
      const buf = await nativeBlob.arrayBuffer();
      if (buf.byteLength > 0) {
        return new Blob([buf], { type: normalizedMime });
      }
    }
  }

  // Fallback to canvas.toDataURL when toBlob returns null/0-byte on constrained Android WebViews
  const dataUrl = canvas.toDataURL(normalizedMime, quality);
  const fallbackBlob = dataUrlToBlobSync(dataUrl, normalizedMime);
  if (fallbackBlob && fallbackBlob.size > 0) {
    return fallbackBlob;
  }

  throw new Error('Canvas failed to encode JPEG blob (0 bytes)');
}

/**
 * Shared evidence photo processor:
 * 1. Normalizes dimensions to max edge 1600px
 * 2. Burns crisp high-contrast DAY + TIME (IST) + GPS stamp bar into pixels
 * 3. Encodes to JPEG (q=0.82, gentle fallback only if > 2MB)
 * 4. Returns real Blob + local objectURL preview + stable clientPhotoId + authoritative capturedAt
 */
export async function stampAndNormalizeEvidencePhoto(
  options: StampPhotoOptions
): Promise<StampedEvidencePhoto> {
  const {
    file,
    buildingName = 'VigilAMC Site',
    subjectLabel = 'Fire Safety Unit',
    formattedDateTime,
    gps = null,
    isBasementCached = false,
    maxEdge = 1600,
    maxBytes = 2 * 1024 * 1024,
  } = options;

  const img = await loadImage(file);
  const origW = img.naturalWidth || img.width;
  const origH = img.naturalHeight || img.height;
  if (!origW || !origH) {
    throw new Error('Captured photo could not be decoded (0x0 dimensions)');
  }

  let width = origW;
  let height = origH;
  if (width > maxEdge || height > maxEdge) {
    if (width >= height) {
      height = Math.round((height * maxEdge) / width);
      width = maxEdge;
    } else {
      width = Math.round((width * maxEdge) / height);
      height = maxEdge;
    }
  }
  // Ensure minimum crisp canvas size so stamp text is always zoom-proof & legible
  if (width < 480 && height < 480) {
    const scale = 640 / Math.max(width, height, 1);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const now = new Date();
  const capturedAt = now.getTime();
  const dayOfWeek = DAY_NAMES[now.getDay()];

  const drawStampedCanvas = (targetW: number, targetH: number): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable');

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, targetW, targetH);

    // High-contrast charcoal (#1C1917) stamp bar sized proportionally so text is crisp at 1600px
    const barHeight = Math.max(88, Math.min(200, Math.round(targetH * 0.135)));
    const barY = targetH - barHeight;

    ctx.fillStyle = 'rgba(28, 25, 23, 0.94)';
    ctx.fillRect(0, barY, targetW, barHeight);

    // Subtle ember top border accent
    ctx.fillStyle = '#EA580C';
    ctx.fillRect(0, barY, targetW, Math.max(2, Math.round(barHeight * 0.03)));

    const padX = Math.max(16, Math.round(targetW * 0.022));
    const maxTextWidth = targetW - padX * 2;

    const cleanBldg = String(buildingName || 'VigilAMC Site').trim().slice(0, 42);
    const cleanSubj = String(subjectLabel || 'Fire Unit').trim().slice(0, 42);
    const line1 = `VigilAMC Verified | ${cleanBldg} | ${cleanSubj}`;

    const dateTimeLabel =
      formattedDateTime ||
      now.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
    const line2 = `${dayOfWeek} | ${dateTimeLabel} IST`;

    const effectiveBasement = Boolean(isBasementCached || gps?.isBasementCached);
    let line3 = 'GPS Site Verified';
    if (gps && Number.isFinite(gps.latitude) && Number.isFinite(gps.longitude)) {
      const lat = gps.latitude.toFixed(6);
      const lng = gps.longitude.toFixed(6);
      const acc = Math.round(gps.accuracy || 8);
      if (effectiveBasement && gps.timestamp) {
        const cacheMin = Math.max(1, Math.round((Date.now() - gps.timestamp) / 60000));
        line3 = `GPS cached ${cacheMin}m ago | ${lat}, ${lng} (+/-${acc}m)`;
      } else {
        line3 = `GPS ${lat}, ${lng} (+/-${acc}m)`;
      }
    }

    const fontSize1 = Math.max(15, Math.min(34, Math.round(barHeight * 0.25)));
    const fontSize2 = Math.max(13, Math.min(28, Math.round(barHeight * 0.22)));

    ctx.textBaseline = 'middle';

    // Line 1: Ember Orange
    ctx.fillStyle = '#FF8C42';
    ctx.font = `700 ${fontSize1}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillText(line1, padX, barY + barHeight * 0.24, maxTextWidth);

    // Line 2: Pure White — Day + Date + Time (IST)
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `600 ${fontSize2}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillText(line2, padX, barY + barHeight * 0.54, maxTextWidth);

    // Line 3: High-contrast Emerald / Amber monospace — GPS Coordinates
    ctx.fillStyle = effectiveBasement ? '#FBBF24' : '#34D399';
    ctx.font = `700 ${fontSize2}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
    ctx.fillText(line3, padX, barY + barHeight * 0.82, maxTextWidth);

    return canvas;
  };

  // Encode to JPEG q≈0.82 at max 1600px, stepping down gently only if > 2MB
  const ladder = [
    { scale: 1.0, quality: 0.82 },
    { scale: 1.0, quality: 0.76 },
    { scale: 0.85, quality: 0.74 },
    { scale: 0.7, quality: 0.72 },
    { scale: 0.55, quality: 0.66 },
    { scale: 0.45, quality: 0.6 },
  ];

  let finalBlob: Blob | null = null;
  let finalW = width;
  let finalH = height;

  for (const step of ladder) {
    const w = Math.max(480, Math.round(width * step.scale));
    const h = Math.max(360, Math.round(height * step.scale));
    const canvas = drawStampedCanvas(w, h);
    try {
      const blob = await canvasToBlob(canvas, 'image/jpeg', step.quality);
      if (blob.size > 0) {
        finalBlob = blob;
        finalW = w;
        finalH = h;
        if (blob.size <= maxBytes) {
          break;
        }
      }
    } finally {
      // Release canvas backing store immediately to prevent OOM on low-RAM Android WebViews
      canvas.width = 0;
      canvas.height = 0;
    }
  }

  if (!finalBlob || finalBlob.size === 0) {
    throw new Error('Failed to normalize captured photo (empty image output)');
  }

  if (finalBlob.size > maxBytes) {
    throw new Error(
      `Compressed photo is still ${(finalBlob.size / (1024 * 1024)).toFixed(2)} MB (limit ${(maxBytes / (1024 * 1024)).toFixed(1)} MB).`
    );
  }

  const clientPhotoId = generateClientPhotoId();
  const normalizedFile = new File([finalBlob], `${clientPhotoId}.jpg`, {
    type: 'image/jpeg',
    lastModified: capturedAt,
  });
  const previewUrl = URL.createObjectURL(finalBlob);
  const effectiveBasement = Boolean(isBasementCached || gps?.isBasementCached);

  return {
    clientPhotoId,
    blob: finalBlob,
    file: normalizedFile,
    previewUrl,
    contentType: 'image/jpeg',
    sizeBytes: finalBlob.size,
    width: finalW,
    height: finalH,
    capturedAt,
    dayOfWeek,
    latitude: gps && Number.isFinite(gps.latitude) ? gps.latitude : null,
    longitude: gps && Number.isFinite(gps.longitude) ? gps.longitude : null,
    gpsAccuracy: gps && Number.isFinite(gps.accuracy) ? Math.round(gps.accuracy!) : null,
    gpsSource: effectiveBasement ? 'BASEMENT_CACHED' : 'LIVE',
  };
}

/**
 * Legacy helper kept for backward compatibility (e.g. non-evidence compression).
 */
export async function compressPhotoToBudget(
  source: string | HTMLCanvasElement | File,
  targetBytes = 1.8 * 1024 * 1024
): Promise<CompressionResult> {
  if (typeof window === 'undefined') {
    return { dataUrl: typeof source === 'string' ? source : '', sizeBytes: 0, width: 0, height: 0 };
  }

  let sourceCanvas: HTMLCanvasElement;
  let origWidth = 0;
  let origHeight = 0;

  if (source instanceof HTMLCanvasElement) {
    sourceCanvas = source;
    origWidth = source.width;
    origHeight = source.height;
  } else {
    const img = await loadImage(source);
    origWidth = img.naturalWidth || img.width;
    origHeight = img.naturalHeight || img.height;
    sourceCanvas = document.createElement('canvas');
    sourceCanvas.width = origWidth;
    sourceCanvas.height = origHeight;
    const ctx = sourceCanvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable');
    ctx.drawImage(img, 0, 0);
  }

  const steps = [
    { maxDim: 1600, quality: 0.82 },
    { maxDim: 1280, quality: 0.78 },
    { maxDim: 1024, quality: 0.74 },
    { maxDim: 800, quality: 0.7 },
  ];

  let bestDataUrl = '';
  let bestSize = Infinity;
  let finalW = origWidth;
  let finalH = origHeight;

  for (const { maxDim, quality } of steps) {
    let w = origWidth;
    let h = origHeight;

    if (w > maxDim || h > maxDim) {
      if (w >= h) {
        h = Math.round((h * maxDim) / w);
        w = maxDim;
      } else {
        w = Math.round((w * maxDim) / h);
        h = maxDim;
      }
    }

    const stepCanvas = document.createElement('canvas');
    stepCanvas.width = w;
    stepCanvas.height = h;
    const ctx = stepCanvas.getContext('2d');
    if (!ctx) continue;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(sourceCanvas, 0, 0, w, h);

    const dataUrl = stepCanvas.toDataURL('image/jpeg', quality);
    const size = estimateDataUrlBytes(dataUrl);
    bestDataUrl = dataUrl;
    bestSize = size;
    finalW = w;
    finalH = h;

    if (size <= targetBytes) {
      break;
    }
  }

  return {
    dataUrl: bestDataUrl,
    sizeBytes: bestSize,
    width: finalW,
    height: finalH,
  };
}

/**
 * Creates a small preview thumbnail (kept for backward compatibility)
 */
export async function createInspectionThumbnail(
  source: string | HTMLCanvasElement,
  _targetBytes = 50 * 1024
): Promise<string> {
  if (typeof window === 'undefined') return '';

  let imgOrCanvas: HTMLImageElement | HTMLCanvasElement;
  let origW = 0;
  let origH = 0;

  if (source instanceof HTMLCanvasElement) {
    imgOrCanvas = source;
    origW = source.width;
    origH = source.height;
  } else {
    imgOrCanvas = await loadImage(source);
    origW = (imgOrCanvas as HTMLImageElement).naturalWidth || imgOrCanvas.width;
    origH = (imgOrCanvas as HTMLImageElement).naturalHeight || imgOrCanvas.height;
  }

  const maxDim = 480;
  let w = origW;
  let h = origH;
  if (w > maxDim || h > maxDim) {
    if (w >= h) {
      h = Math.round((h * maxDim) / w);
      w = maxDim;
    } else {
      w = Math.round((w * maxDim) / h);
      h = maxDim;
    }
  }

  const thumbCanvas = document.createElement('canvas');
  thumbCanvas.width = w;
  thumbCanvas.height = h;
  const ctx = thumbCanvas.getContext('2d');
  if (!ctx) return '';

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'medium';
  ctx.drawImage(imgOrCanvas, 0, 0, w, h);

  return thumbCanvas.toDataURL('image/jpeg', 0.72);
}

/**
 * Compresses guard or customer signature to WebP/JPEG (<= 60KB)
 */
export function compressSignatureToBudget(
  canvas: HTMLCanvasElement,
  _targetBytes = 60 * 1024
): string {
  if (!canvas) return '';

  let exportCanvas = canvas;
  if (canvas.width > 400) {
    const scale = 400 / canvas.width;
    const scaledCanvas = document.createElement('canvas');
    scaledCanvas.width = 400;
    scaledCanvas.height = Math.round(canvas.height * scale);
    const ctx = scaledCanvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height);
      exportCanvas = scaledCanvas;
    }
  }

  let dataUrl = exportCanvas.toDataURL('image/webp', 0.7);
  if (!dataUrl.startsWith('data:image/webp')) {
    dataUrl = exportCanvas.toDataURL('image/jpeg', 0.7);
  }

  return dataUrl;
}
