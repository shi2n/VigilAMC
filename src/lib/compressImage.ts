/**
 * Client-side HTML5 <canvas> image compression utility.
 * Scales max dimension to 1280px (preserving aspect ratio) and encodes to WebP at 0.75 quality
 * (~70–110 KB instead of 5–10 MB raw camera photos).
 */

export interface CompressImageOptions {
  maxDimension?: number;
  quality?: number;
  mimeType?: string;
}

export async function compressImageToDataUrl(
  file: File,
  options?: CompressImageOptions
): Promise<string> {
  const maxDimension = options?.maxDimension ?? 1280;
  const quality = options?.quality ?? 0.75;
  const mimeType = options?.mimeType ?? 'image/webp';

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => {
        // Fallback to raw data URL if browser cannot decode format directly (e.g., certain HEIC containers)
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Unsupported image format'));
        }
      };
      img.onload = () => {
        try {
          let width = img.naturalWidth || img.width;
          let height = img.naturalHeight || img.height;

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
            resolve(reader.result as string);
            return;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          let compressedDataUrl = canvas.toDataURL(mimeType, quality);
          // Fallback to JPEG if browser does not support WebP canvas encoding
          if (!compressedDataUrl.startsWith(`data:${mimeType}`)) {
            compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          }

          resolve(compressedDataUrl);
        } catch (err) {
          reject(err);
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export async function compressImageToFile(
  file: File,
  options?: CompressImageOptions
): Promise<File> {
  const dataUrl = await compressImageToDataUrl(file, options);
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  const ext = blob.type === 'image/webp' ? 'webp' : 'jpg';
  return new File([blob], `${baseName}.${ext}`, {
    type: blob.type,
    lastModified: Date.now(),
  });
}

export default compressImageToDataUrl;
