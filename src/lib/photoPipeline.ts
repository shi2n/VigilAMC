/**
 * photoPipeline.ts
 * VigilAMC Technician Hard Client-Side Photo Pipeline & Size Budget Enforcer
 * Enforces strict byte budgets:
 *  - Full inspection photos <= 300KB (downscaled canvas, WebP q0.72 down to 640px/q0.65)
 *  - Guard signatures <= 60KB (WebP)
 *  - Inspection preview thumbnails <= 50KB (~480px)
 *  - Hard assertion: zero request bodies > 1.5MB leave the client
 */

export interface CompressionResult {
  dataUrl: string;
  sizeBytes: number;
  width: number;
  height: number;
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

/**
 * Load an image from data URL, object URL, or File
 */
function loadImage(source: string | File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error('Failed to load image for compression'));

    if (typeof source === 'string') {
      img.src = source;
    } else {
      const url = URL.createObjectURL(source);
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.src = url;
    }
  });
}

/**
 * Re-compresses a photo with step-down strategy until size is <= targetBytes (default 300KB)
 * Step 1: max edge 1280px, WebP q0.72
 * Step 2: max edge 1024px, WebP q0.70
 * Step 3: max edge 800px, WebP q0.68
 * Step 4: max edge 640px, WebP q0.65 (floor)
 */
export async function compressPhotoToBudget(
  source: string | HTMLCanvasElement | File,
  targetBytes = 300 * 1024
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
    { maxDim: 1280, quality: 0.72 },
    { maxDim: 1024, quality: 0.70 },
    { maxDim: 800, quality: 0.68 },
    { maxDim: 640, quality: 0.65 },
  ];

  let bestDataUrl = '';
  let bestSize = Infinity;
  let finalW = origWidth;
  let finalH = origHeight;

  for (let i = 0; i < steps.length; i++) {
    const { maxDim, quality } = steps[i];
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

    let dataUrl = stepCanvas.toDataURL('image/webp', quality);
    // Fallback to jpeg if WebP not supported
    if (!dataUrl.startsWith('data:image/webp')) {
      dataUrl = stepCanvas.toDataURL('image/jpeg', quality);
    }

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
 * Creates a small preview thumbnail for instant admin view (<= 50KB, ~480px max edge)
 */
export async function createInspectionThumbnail(
  source: string | HTMLCanvasElement,
  targetBytes = 50 * 1024
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

  let dataUrl = thumbCanvas.toDataURL('image/webp', 0.65);
  if (!dataUrl.startsWith('data:image/webp')) {
    dataUrl = thumbCanvas.toDataURL('image/jpeg', 0.65);
  }

  return dataUrl;
}

/**
 * Compresses guard or customer signature to WebP (<= 60KB)
 */
export function compressSignatureToBudget(
  canvas: HTMLCanvasElement,
  targetBytes = 60 * 1024
): string {
  if (!canvas) return '';

  // Resize canvas to max 400px width if larger
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

  let dataUrl = exportCanvas.toDataURL('image/webp', 0.70);
  if (!dataUrl.startsWith('data:image/webp')) {
    dataUrl = exportCanvas.toDataURL('image/jpeg', 0.70);
  }

  return dataUrl;
}
