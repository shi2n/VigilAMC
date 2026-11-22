'use client';

import React, { useEffect, useState } from 'react';
import { Camera, CameraOff, Clock, ExternalLink, MapPin, X, ZoomIn } from 'lucide-react';
import { getPhotoEvidenceDictionary, formatPhotoTemplate } from '@/lib/i18n/photoEvidence';

export interface EvidencePhotoItem {
  id?: string;
  photoUrl: string | null | undefined;
  caption?: string | null;
  capturedAt?: string | Date | null;
  dayOfWeek?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  gpsAccuracy?: number | null;
  gpsSource?: string | null;
  assetTag?: string | null;
  buildingName?: string | null;
}

/**
 * Extract all valid displayable photo items from an Inspection or WorkOrder record.
 * Always prefers normalized `inspectionPhotos` / `photos` relation rows (full-res stamped photos)
 * over legacy JSON string columns.
 */
export function extractEvidencePhotos(record: any): EvidencePhotoItem[] {
  const items: EvidencePhotoItem[] = [];
  const seenUrls = new Set<string>();

  const pushIfValid = (item: EvidencePhotoItem) => {
    const url = typeof item.photoUrl === 'string' ? item.photoUrl.trim() : '';
    if (!url || seenUrls.has(url)) return;
    seenUrls.add(url);
    items.push({ ...item, photoUrl: url });
  };

  // 1. InspectionPhoto relation rows (authoritative full-res stamped photos)
  if (Array.isArray(record?.inspectionPhotos)) {
    for (const p of record.inspectionPhotos) {
      if (p?.photoUrl) {
        pushIfValid({
          id: p.id,
          photoUrl: p.photoUrl,
          caption: p.caption || record?.remarks || null,
          capturedAt: p.capturedAt || record?.date || p.createdAt || null,
          dayOfWeek: p.dayOfWeek || null,
          latitude: p.latitude ?? record?.latitude ?? null,
          longitude: p.longitude ?? record?.longitude ?? null,
          gpsAccuracy: p.gpsAccuracy ?? record?.gpsAccuracy ?? null,
          gpsSource: p.gpsSource || null,
          assetTag: record?.equipment?.qrCode || null,
          buildingName: record?.building?.name || null,
        });
      }
    }
  }

  // 2. WorkOrderPhoto relation rows (array of objects with photoUrl)
  if (Array.isArray(record?.photos)) {
    for (const p of record.photos) {
      if (typeof p === 'string') {
        pushIfValid({
          photoUrl: p,
          caption: record?.remarks || record?.notes || null,
          capturedAt: record?.date || record?.completedAt || record?.createdAt || null,
          latitude: record?.latitude ?? null,
          longitude: record?.longitude ?? null,
          gpsAccuracy: record?.gpsAccuracy ?? null,
          assetTag: record?.equipment?.qrCode || null,
          buildingName: record?.building?.name || null,
        });
      } else if (p && typeof p === 'object' && p.photoUrl) {
        pushIfValid({
          id: p.id,
          photoUrl: p.photoUrl,
          caption: p.caption || record?.notes || record?.title || null,
          capturedAt: p.capturedAt || record?.completedAt || p.createdAt || null,
          dayOfWeek: p.dayOfWeek || null,
          latitude: p.latitude ?? null,
          longitude: p.longitude ?? null,
          gpsAccuracy: p.gpsAccuracy ?? null,
          gpsSource: p.gpsSource || null,
          assetTag: record?.equipment?.qrCode || null,
          buildingName: record?.building?.name || null,
        });
      }
    }
  } else if (typeof record?.photos === 'string' && record.photos.trim()) {
    // 3. Legacy JSON string column on Inspection.photos
    try {
      const parsed = JSON.parse(record.photos);
      if (Array.isArray(parsed)) {
        for (const u of parsed) {
          if (typeof u === 'string') {
            pushIfValid({
              photoUrl: u,
              caption: record?.remarks || null,
              capturedAt: record?.date || record?.createdAt || null,
              latitude: record?.latitude ?? null,
              longitude: record?.longitude ?? null,
              gpsAccuracy: record?.gpsAccuracy ?? null,
              assetTag: record?.equipment?.qrCode || null,
              buildingName: record?.building?.name || null,
            });
          }
        }
      }
    } catch {
      if (record.photos.startsWith('https://')) {
        pushIfValid({
          photoUrl: record.photos,
          caption: record?.remarks || null,
          capturedAt: record?.date || record?.createdAt || null,
          assetTag: record?.equipment?.qrCode || null,
          buildingName: record?.building?.name || null,
        });
      }
    }
  }

  // 4. Primary photoUrl column (e.g. WorkOrder.photoUrl or Equipment.photoUrl)
  if (typeof record?.photoUrl === 'string' && record.photoUrl.trim()) {
    pushIfValid({
      id: `primary-${record?.id || '0'}`,
      photoUrl: record.photoUrl,
      caption: record?.notes || record?.remarks || record?.title || null,
      capturedAt: record?.completedAt || record?.date || record?.updatedAt || null,
      assetTag: record?.equipment?.qrCode || null,
      buildingName: record?.building?.name || null,
    });
  }

  return items;
}

function formatCaptureTime(raw?: string | Date | null): string {
  if (!raw) return '—';
  const dt = new Date(raw);
  if (isNaN(dt.getTime())) return '—';
  return dt.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/**
 * Honest "Photo not received" placeholder (never an empty/broken <img>, never a fake logo).
 * Contrast: #44403C on #FFF8F2 = 9.8:1 (>= 4.5:1).
 */
export function PhotoNotReceivedSlot({
  lang = 'en',
  compact = false,
  testId = 'photo-not-received-placeholder',
}: {
  lang?: string;
  compact?: boolean;
  testId?: string;
}) {
  const photoT = getPhotoEvidenceDictionary(lang);

  if (compact) {
    return (
      <span
        data-testid={testId}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FFF8F2] border border-dashed border-[#FED7AA] text-[#44403C] text-[11px] font-semibold whitespace-nowrap"
      >
        <CameraOff className="w-3.5 h-3.5 text-[#9A3412] shrink-0" aria-hidden="true" />
        <span>{photoT.photoNotReceived}</span>
      </span>
    );
  }

  return (
    <div
      data-testid={testId}
      className="w-full rounded-xl bg-[#FFF8F2] border border-dashed border-[#FED7AA] px-4 py-5 flex flex-col items-center justify-center gap-2 text-center min-h-[108px]"
    >
      <div className="w-9 h-9 rounded-xl bg-white border border-[#FED7AA] flex items-center justify-center text-[#9A3412]">
        <CameraOff className="w-4 h-4" aria-hidden="true" />
      </div>
      <span className="text-xs font-bold text-[#44403C]">{photoT.photoNotReceived}</span>
    </div>
  );
}

/**
 * Single resilient thumbnail button that falls back cleanly to PhotoNotReceivedSlot if load fails.
 * Fixed dimensions ensure CLS = 0.
 */
export function EvidencePhotoThumb({
  photo,
  lang = 'en',
  size = 'sm',
  onOpen,
  countBadge,
}: {
  photo: EvidencePhotoItem;
  lang?: string;
  size?: 'sm' | 'md';
  onOpen: (photo: EvidencePhotoItem) => void;
  countBadge?: number;
}) {
  const [broken, setBroken] = useState(false);
  const photoT = getPhotoEvidenceDictionary(lang);

  if (!photo.photoUrl || broken) {
    return <PhotoNotReceivedSlot lang={lang} compact={size === 'sm'} />;
  }

  const dimClass = size === 'sm' ? 'w-11 h-11 rounded-lg' : 'w-full aspect-[4/3] rounded-xl';

  return (
    <button
      type="button"
      data-testid="evidence-photo-thumb-btn"
      onClick={() => onOpen(photo)}
      title={photoT.viewFullSize}
      className={`group relative overflow-hidden border border-[#FED7AA] bg-[#FFF8F2] text-left focus:outline-none focus:ring-2 focus:ring-[#C2410C] ${
        size === 'sm' ? 'inline-flex items-center gap-2 pr-2.5 rounded-xl bg-white hover:border-[#EA580C]' : 'block w-full rounded-xl hover:border-[#EA580C]'
      } motion-safe:transition-colors`}
    >
      <span className={`relative block overflow-hidden shrink-0 ${dimClass} bg-[#FFF8F2]`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.photoUrl}
          alt={photo.caption || photoT.photoEvidenceTitle}
          loading="lazy"
          decoding="async"
          onError={() => setBroken(true)}
          className="w-full h-full object-cover"
        />
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-[#1C1917]/0 group-hover:bg-[#1C1917]/25 flex items-center justify-center motion-safe:transition-colors"
        >
          <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 motion-safe:transition-opacity" />
        </span>
      </span>
      {size === 'sm' && (
        <span className="text-[11px] font-bold text-[#9A3412] whitespace-nowrap">
          {countBadge && countBadge > 1
            ? formatPhotoTemplate(photoT.photosCountLabel, countBadge)
            : photoT.viewFullSize}
        </span>
      )}
    </button>
  );
}

/**
 * Full-size Evidence Photo Lightbox showing the stamped image cleanly with readable DAY+TIME+GPS stamp,
 * original capture timestamp, and GPS coordinates. Light FIRE modal surface (never dark theme!).
 */
export function EvidencePhotoLightbox({
  photo,
  lang = 'en',
  onClose,
}: {
  photo: EvidencePhotoItem | null;
  lang?: string;
  onClose: () => void;
}) {
  const [broken, setBroken] = useState(false);
  const photoT = getPhotoEvidenceDictionary(lang);

  useEffect(() => {
    setBroken(false);
  }, [photo?.photoUrl]);

  useEffect(() => {
    if (!photo) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [photo, onClose]);

  if (!photo) return null;

  return (
    <div
      data-testid="evidence-photo-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={photoT.photoEvidenceTitle}
      onClick={onClose}
      className="fixed inset-0 z-[70] bg-[#1C1917]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl bg-white border border-[#FED7AA] rounded-2xl shadow-2xl overflow-hidden text-[#1C1917]"
      >
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[#FED7AA] bg-[#FFF8F2]">
          <div className="flex items-center gap-2 min-w-0">
            <Camera className="w-4 h-4 text-[#C2410C] shrink-0" aria-hidden="true" />
            <h3 className="text-sm font-black text-[#1C1917] truncate">
              {photoT.photoEvidenceTitle}
              {photo.assetTag ? ` · ${photo.assetTag}` : ''}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {photo.photoUrl && !broken && (
              <a
                href={photo.photoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-[#FED7AA] text-[#9A3412] hover:bg-[#FFF0E6] text-xs font-bold"
              >
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">{photoT.viewFullSize}</span>
              </a>
            )}
            <button
              type="button"
              data-testid="close-evidence-lightbox-btn"
              onClick={onClose}
              aria-label={photoT.closeViewer}
              className="p-2 rounded-lg bg-white border border-[#FED7AA] text-[#1C1917] hover:bg-[#FFF0E6]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-4 bg-[#FFF8F2]/50 flex items-center justify-center">
          {photo.photoUrl && !broken ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              data-testid="evidence-lightbox-img"
              src={photo.photoUrl}
              alt={photo.caption || photoT.photoEvidenceTitle}
              onError={() => setBroken(true)}
              className="w-full max-h-[72vh] object-contain rounded-xl border border-[#FED7AA] bg-white"
            />
          ) : (
            <PhotoNotReceivedSlot lang={lang} testId="lightbox-photo-not-received" />
          )}
        </div>

        <div className="px-4 py-3 border-t border-[#FED7AA] bg-white flex flex-wrap items-center justify-between gap-3 text-xs text-[#44403C]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 font-semibold text-[#1C1917]">
              <Clock className="w-3.5 h-3.5 text-[#C2410C]" aria-hidden="true" />
              <span>
                {photoT.capturedAtLabel}: {formatCaptureTime(photo.capturedAt)}
                {photo.dayOfWeek ? ` (${photo.dayOfWeek})` : ''}
              </span>
            </span>
            {typeof photo.latitude === 'number' && typeof photo.longitude === 'number' && (
              <span className="inline-flex items-center gap-1.5 font-mono font-semibold text-[#1C1917]">
                <MapPin className="w-3.5 h-3.5 text-[#059669]" aria-hidden="true" />
                <span>
                  {photoT.gpsLabel}: {photo.latitude.toFixed(6)}, {photo.longitude.toFixed(6)}
                  {photo.gpsAccuracy ? ` (±${Math.round(photo.gpsAccuracy)}m)` : ''}
                </span>
              </span>
            )}
          </div>
          {photo.caption && (
            <p className="text-xs text-[#44403C] font-medium break-words max-w-full">
              {photo.caption}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Grid gallery for Task Detail / Inspection Detail panels.
 * Always shows honest PhotoNotReceivedSlot when photos array is empty.
 */
export function EvidencePhotoGallery({
  photos,
  lang = 'en',
  onSelectPhoto,
}: {
  photos: EvidencePhotoItem[];
  lang?: string;
  onSelectPhoto: (photo: EvidencePhotoItem) => void;
}) {
  const photoT = getPhotoEvidenceDictionary(lang);

  return (
    <div className="space-y-2" data-testid="evidence-photo-gallery">
      <div className="flex items-center justify-between">
        <span className="text-xs font-extrabold text-[#1C1917] flex items-center gap-1.5">
          <Camera className="w-3.5 h-3.5 text-[#C2410C]" aria-hidden="true" />
          <span>{photoT.photoEvidenceTitle}</span>
        </span>
        {photos.length > 0 && (
          <span className="text-[11px] font-bold text-[#9A3412]">
            {formatPhotoTemplate(photoT.photosCountLabel, photos.length)}
          </span>
        )}
      </div>

      {photos.length === 0 ? (
        <PhotoNotReceivedSlot lang={lang} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {photos.map((photo, idx) => (
            <EvidencePhotoThumb
              key={photo.id || photo.photoUrl || idx}
              photo={photo}
              lang={lang}
              size="md"
              onOpen={onSelectPhoto}
            />
          ))}
        </div>
      )}
    </div>
  );
}
