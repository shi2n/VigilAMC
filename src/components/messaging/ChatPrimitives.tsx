'use client';

import React from 'react';
import type { MessagingDictionary } from '@/lib/i18n/messaging';
import { toDateInputString, todayCalendarDateString, addCalendarDays } from '@/lib/dates';

export interface ChatMessageItem {
  id: string;
  clientMsgId: string;
  organizationId?: string;
  technicianId: string;
  senderRole: 'AGENCY' | 'TECHNICIAN';
  senderId: string;
  recipientRole?: 'AGENCY' | 'TECHNICIAN';
  recipientId?: string | null;
  dmKey?: string;
  body: string | null;
  attachmentUrl: string | null;
  attachmentSignedUrl: string | null;
  attachmentKind: 'IMAGE' | null;
  readAt: string | null;
  createdAt: string;
  localStatus?: 'QUEUED' | 'SENDING' | 'FAILED';
  localError?: string;
}

// --- INLINE SVGs ONLY (zero emoji icons) ---

export function PaperclipIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  );
}

export function PaperPlaneIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M22 2L11 13" />
      <path d="M22 2L15 22L11 13L2 9L22 2Z" />
    </svg>
  );
}

export function SingleTickIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="#64748B"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-label="Sent"
    >
      <path d="M3 8.5L6.5 12L13 4.5" />
    </svg>
  );
}

export function DoubleTickIcon({ className = 'w-4 h-3.5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 16"
      fill="none"
      stroke="#EA580C"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-label="Read"
    >
      <path d="M1.5 8.5L5 12L11.5 4.5" />
      <path d="M7.5 8.5L11 12L17.5 4.5" />
    </svg>
  );
}

export function ClockQueueIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="#64748B"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-label="Queued offline"
    >
      <circle cx="8" cy="8" r="6" />
      <path d="M8 4.5V8L10.5 9.5" />
    </svg>
  );
}

export function BroadcastIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 11l18-5v12L3 13v-2z" />
      <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </svg>
  );
}

export function ChatEmptyIllustration({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect x="6" y="10" width="38" height="26" rx="8" fill="#FEE6E0" stroke="#EA580C" strokeWidth="2" />
      <path d="M16 36L12 44L23 36" fill="#FEE6E0" stroke="#EA580C" strokeWidth="2" strokeLinejoin="round" />
      <line x1="15" y1="20" x2="35" y2="20" stroke="#C2410C" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="15" y1="27" x2="28" y2="27" stroke="#C2410C" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="24" y="30" width="34" height="22" rx="8" fill="#FFFFFF" stroke="#D6D3D1" strokeWidth="2" />
      <line x1="32" y1="39" x2="50" y2="39" stroke="#78716C" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="32" y1="45" x2="44" y2="45" stroke="#A8A29E" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

// --- PHOTO COMPRESSION (max edge 1280px, JPEG q≈0.8, <=2MB) ---

export interface CompressedChatPhoto {
  file: File;
  blob: Blob;
  previewUrl: string;
  sizeBytes: number;
  originalBytes: number;
}

export async function compressChatPhotoToJpeg(file: File): Promise<CompressedChatPhoto> {
  const MAX_EDGE = 1280;
  const MAX_BYTES = 2 * 1024 * 1024;
  const originalBytes = file.size;

  const dataUrl: string = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = () => resolve(String(reader.result || ''));
    reader.readAsDataURL(file);
  });

  const img: HTMLImageElement = await new Promise((resolve, reject) => {
    const el = new Image();
    el.onerror = () => reject(new Error('Unsupported image format'));
    el.onload = () => resolve(el);
    el.src = dataUrl;
  });

  let width = img.naturalWidth || img.width;
  let height = img.naturalHeight || img.height;
  if (width > MAX_EDGE || height > MAX_EDGE) {
    if (width >= height) {
      height = Math.max(1, Math.round((height * MAX_EDGE) / width));
      width = MAX_EDGE;
    } else {
      width = Math.max(1, Math.round((width * MAX_EDGE) / height));
      height = MAX_EDGE;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);

  const qualities = [0.8, 0.65, 0.5];
  let finalBlob: Blob | null = null;
  for (const q of qualities) {
    const blob: Blob | null = await new Promise((res) =>
      canvas.toBlob((b) => res(b), 'image/jpeg', q)
    );
    if (blob) {
      finalBlob = blob;
      if (blob.size <= MAX_BYTES) break;
    }
  }

  if (!finalBlob) {
    throw new Error('Image compression failed');
  }
  if (finalBlob.size > MAX_BYTES) {
    throw new Error('PHOTO_TOO_LARGE');
  }

  const baseName = (file.name || 'photo').replace(/\.[^/.]+$/, '');
  const compressedFile = new File([finalBlob], `${baseName}.jpg`, {
    type: 'image/jpeg',
    lastModified: Date.now(),
  });
  const previewUrl = URL.createObjectURL(finalBlob);

  return {
    file: compressedFile,
    blob: finalBlob,
    previewUrl,
    sizeBytes: finalBlob.size,
    originalBytes,
  };
}

export async function uploadChatPhotoViaSignedUrl(params: {
  compressed: CompressedChatPhoto;
  technicianId?: string;
  broadcast?: boolean;
  authHeaders?: Record<string, string>;
}): Promise<{ path: string; sizeBytes: number; originalBytes: number }> {
  const res = await fetch('/api/messages/upload-url', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(params.authHeaders || {}),
    },
    body: JSON.stringify({
      technicianId: params.broadcast ? undefined : params.technicianId,
      broadcast: params.broadcast ? true : undefined,
      kind: 'IMAGE',
      contentType: 'image/jpeg',
      sizeBytes: params.compressed.sizeBytes,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.uploadUrl || !data?.path) {
    throw new Error(data?.error || `Upload URL request failed (HTTP ${res.status})`);
  }

  const putRes = await fetch(data.uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'image/jpeg',
    },
    body: params.compressed.blob,
  });

  if (!putRes.ok) {
    throw new Error(`Direct storage upload failed (HTTP ${putRes.status})`);
  }

  return {
    path: data.path as string,
    sizeBytes: params.compressed.sizeBytes,
    originalBytes: params.compressed.originalBytes,
  };
}

// --- DATE / TIME FORMATTING ---

export function getLocalDayKey(isoDate: string): string {
  return toDateInputString(isoDate) || 'unknown';
}

export function formatDateDivider(isoDate: string, t: MessagingDictionary, lang = 'en'): string {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return '';
  const todayKey = todayCalendarDateString();
  const yestKey = toDateInputString(addCalendarDays(todayKey, -1));
  const msgKey = getLocalDayKey(isoDate);

  if (msgKey === todayKey) return t.today;
  if (msgKey === yestKey) return t.yesterday;

  try {
    return new Intl.DateTimeFormat(`${lang}-IN`, {
      day: 'numeric',
      month: 'short',
      year: d.getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
    }).format(d);
  } catch {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
    }).format(d);
  }
}

export function formatTimeShort(isoDate: string, lang = 'en'): string {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return '';
  try {
    return new Intl.DateTimeFormat(`${lang}-IN`, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(d);
  } catch {
    return new Intl.DateTimeFormat('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(d);
  }
}

export function getInitials(name: string): string {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return 'T';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

// --- CHAT BUBBLE ---

interface ChatBubbleProps {
  message: ChatMessageItem;
  isOwn: boolean;
  lang: string;
  t: MessagingDictionary;
  onRetry?: (msg: ChatMessageItem) => void;
  onOpenImage?: (url: string, caption?: string | null) => void;
}

export function ChatBubble({
  message,
  isOwn,
  lang,
  t,
  onRetry,
  onOpenImage,
}: ChatBubbleProps) {
  const imgSrc = message.attachmentSignedUrl;

  return (
    <div
      data-testid={isOwn ? 'chat-bubble-own' : 'chat-bubble-other'}
      data-client-msg-id={message.clientMsgId}
      className={`flex w-full ${isOwn ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[82%] sm:max-w-[70%] rounded-2xl px-3.5 py-2.5 shadow-xs ${
          isOwn
            ? 'bg-[#FEE6E0] text-[#1C1917] rounded-br-md'
            : 'bg-[#F4F4F5] text-[#1C1917] rounded-bl-md'
        }`}
      >
        {message.attachmentKind === 'IMAGE' && (
          <div className="mb-1.5">
            {imgSrc ? (
              <button
                type="button"
                onClick={() => onOpenImage?.(imgSrc, message.body)}
                className="block w-[220px] sm:w-[260px] aspect-[4/3] rounded-xl overflow-hidden bg-[#1C1917]/5 focus:outline-none focus:ring-2 focus:ring-[#EA580C]"
                aria-label={t.photoLabel}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imgSrc}
                  alt={message.body || t.photoLabel}
                  width={260}
                  height={195}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </button>
            ) : (
              <div className="w-[220px] sm:w-[260px] aspect-[4/3] rounded-xl bg-[#1C1917]/5 flex items-center justify-center text-xs font-medium text-[#57534E]">
                {t.photoLabel}
              </div>
            )}
          </div>
        )}

        {message.body && (
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words text-[#1C1917]">
            {message.body}
          </p>
        )}

        <div className="mt-1 flex items-center justify-end gap-1.5 select-none">
          <span className="text-[11px] font-medium text-[#44403C]">
            {formatTimeShort(message.createdAt, lang)}
          </span>

          {isOwn && (
            <span className="inline-flex items-center" data-testid="msg-delivery-tick">
              {message.localStatus === 'QUEUED' || message.localStatus === 'SENDING' ? (
                <ClockQueueIcon />
              ) : message.localStatus === 'FAILED' ? (
                <button
                  type="button"
                  onClick={() => onRetry?.(message)}
                  className="text-[11px] font-bold text-[#DC2626] underline underline-offset-2 hover:text-[#991B1B]"
                >
                  {t.retry}
                </button>
              ) : message.readAt ? (
                <DoubleTickIcon />
              ) : (
                <SingleTickIcon />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="space-y-4 p-4" aria-busy="true" aria-label="Loading messages">
      <div className="flex justify-start">
        <div className="h-14 w-56 rounded-2xl bg-[#F4F4F5] animate-pulse" />
      </div>
      <div className="flex justify-end">
        <div className="h-12 w-64 rounded-2xl bg-[#FEE6E0]/70 animate-pulse" />
      </div>
      <div className="flex justify-start">
        <div className="h-16 w-48 rounded-2xl bg-[#F4F4F5] animate-pulse" />
      </div>
      <div className="flex justify-end">
        <div className="h-12 w-52 rounded-2xl bg-[#FEE6E0]/70 animate-pulse" />
      </div>
    </div>
  );
}
