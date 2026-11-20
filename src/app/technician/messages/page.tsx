'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, WifiOff, X, RefreshCw, Volume2, VolumeX } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { getMessagingDictionary, getMessagingSoundDictionary } from '@/lib/i18n/messaging';
import { subscribeToTechnicianThread } from '@/lib/messagingRealtime';
import { onMessageReceived } from '@/lib/messagingHooks';
import {
  ensureMessageSoundHookRegistered,
  isMessageSoundEnabled,
  setMessageSoundEnabled,
} from '@/lib/messagingSound';
import {
  drainOutbox,
  enqueueOutboxItem,
  getLocalCache,
  getPendingMessageOutboxItems,
  resetOutboxItemForRetry,
  setLocalCache,
} from '@/lib/offline/techOutbox';
import {
  ChatBubble,
  ChatEmptyIllustration,
  ChatMessageItem,
  ChatSkeleton,
  CompressedChatPhoto,
  PaperPlaneIcon,
  PaperclipIcon,
  compressChatPhotoToJpeg,
  formatDateDivider,
  getLocalDayKey,
  uploadChatPhotoViaSignedUrl,
} from '@/components/messaging/ChatPrimitives';

const MESSAGES_CACHE_KEY = 'vigil_tech_chat_messages_v1';

function getTechAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const token = localStorage.getItem('vigil_tech_token');
    if (token) return { Authorization: `Bearer ${token}` };
  } catch {}
  return {};
}

export default function TechnicianMessagesPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [currentLang, setCurrentLang] = useState<string>('en');
  const msgT = useMemo(() => getMessagingDictionary(currentLang), [currentLang]);
  const soundT = useMemo(() => getMessagingSoundDictionary(currentLang), [currentLang]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const [agencyName, setAgencyName] = useState<string>('');
  const [technicianId, setTechnicianId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [queuedMessages, setQueuedMessages] = useState<ChatMessageItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);

  const [composerText, setComposerText] = useState<string>('');
  const [pendingPhoto, setPendingPhoto] = useState<CompressedChatPhoto | null>(null);
  const [offlinePhotoNotice, setOfflinePhotoNotice] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [lightbox, setLightbox] = useState<{ url: string; caption?: string | null } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const scrollEndRef = useRef<HTMLDivElement | null>(null);

  // Read persisted technician language + online state + sound hook
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    ensureMessageSoundHookRegistered();
    setSoundEnabled(isMessageSoundEnabled('TECHNICIAN'));
    try {
      const savedLang = localStorage.getItem('vigil_preferred_lang');
      if (savedLang) setCurrentLang(savedLang);
    } catch {}
    setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);
  }, []);

  const refreshQueuedFromOutbox = useCallback(async (techId?: string) => {
    const pending = await getPendingMessageOutboxItems(techId);
    const mapped: ChatMessageItem[] = pending.map((item) => ({
      id: `local-${item.clientSyncId}`,
      clientMsgId: item.clientSyncId,
      technicianId: item.technicianId || techId || '',
      senderRole: 'TECHNICIAN',
      senderId: item.technicianId || techId || '',
      body: item.payload?.body ?? null,
      attachmentUrl: null,
      attachmentSignedUrl: null,
      attachmentKind: null,
      readAt: null,
      createdAt: new Date(item.createdAt).toISOString(),
      localStatus: item.status === 'FAILED' ? 'FAILED' : 'QUEUED',
      localError: item.lastError,
    }));
    setQueuedMessages(mapped);
  }, []);

  const markRead = useCallback(async (techId: string) => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;
    try {
      await fetch('/api/messages/read', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...getTechAuthHeaders(),
        },
        body: JSON.stringify({ technicianId: techId }),
      });
    } catch {
      // Non-fatal
    }
  }, []);

  const loadThread = useCallback(
    async (cursor?: string | null, silent = false) => {
      if (!cursor && !silent) {
        setLoading(true);
        setLoadError(null);
      }

      // First hydrate from local IndexedDB cache when offline or initial load
      if (!cursor && !silent) {
        const cached = await getLocalCache<{
          agencyName?: string;
          technicianId?: string;
          messages?: ChatMessageItem[];
        }>(MESSAGES_CACHE_KEY);
        if (cached?.data) {
          if (cached.data.agencyName) setAgencyName(cached.data.agencyName);
          if (cached.data.technicianId) setTechnicianId(cached.data.technicianId);
          if (Array.isArray(cached.data.messages)) setMessages(cached.data.messages);
        }
        await refreshQueuedFromOutbox(cached?.data?.technicianId);
      }

      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setLoading(false);
        return;
      }

      try {
        const headers = getTechAuthHeaders();

        // Resolve agency name + technicianId
        let resolvedTechId = technicianId;
        let resolvedAgency = agencyName;
        if (!cursor) {
          const metaRes = await fetch('/api/messages/threads', {
            credentials: 'include',
            cache: 'no-store',
            headers,
          });
          if (metaRes.status === 401) {
            router.replace('/technician');
            return;
          }
          if (metaRes.ok) {
            const meta = await metaRes.json();
            resolvedTechId = meta.technicianId || resolvedTechId;
            resolvedAgency = meta.organizationName || resolvedAgency;
            if (resolvedTechId) setTechnicianId(resolvedTechId);
            if (resolvedAgency) setAgencyName(resolvedAgency);
          }
        }

        const params = new URLSearchParams({ limit: '50' });
        if (resolvedTechId) params.set('technicianId', resolvedTechId);
        if (cursor) params.set('cursor', cursor);

        const res = await fetch(`/api/messages?${params.toString()}`, {
          credentials: 'include',
          cache: 'no-store',
          headers,
        });
        if (res.status === 401) {
          router.replace('/technician');
          return;
        }
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(json?.error || msgT.loadFailed);
        }

        const incoming: ChatMessageItem[] = Array.isArray(json.messages) ? json.messages : [];
        if (json.technicianId && !resolvedTechId) {
          resolvedTechId = json.technicianId;
          setTechnicianId(json.technicianId);
        }

        if (cursor) {
          setMessages((prev) => [...incoming, ...prev]);
        } else {
          setMessages(incoming);
          await setLocalCache(MESSAGES_CACHE_KEY, {
            agencyName: resolvedAgency,
            technicianId: resolvedTechId,
            messages: incoming,
          }).catch(() => null);
          setTimeout(() => scrollEndRef.current?.scrollIntoView({ behavior: 'auto' }), 30);
        }
        setNextCursor(json.nextCursor || null);
        setHasMore(Boolean(json.hasMore));
        setLoadError(null);

        if (resolvedTechId) {
          await markRead(resolvedTechId);
          await refreshQueuedFromOutbox(resolvedTechId);
        }
      } catch (err: any) {
        const message = err?.message || msgT.loadFailed;
        setLoadError(message);
        if (!silent) toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    [agencyName, technicianId, router, markRead, refreshQueuedFromOutbox, msgT.loadFailed]
  );

  useEffect(() => {
    loadThread(null, false);
  }, [loadThread]);

  // Auto-drain offline message outbox on reconnect & listen for synced events
  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      setOfflinePhotoNotice(false);
      await drainOutbox({ force: true }).catch(() => null);
      await refreshQueuedFromOutbox(technicianId || undefined);
      await loadThread(null, true);
    };
    const handleOffline = () => {
      setIsOnline(false);
    };
    const handleOutboxSynced = (ev: Event) => {
      const detail = (ev as CustomEvent).detail as {
        clientMsgId?: string;
        message?: ChatMessageItem;
      };
      if (!detail?.clientMsgId) return;
      setQueuedMessages((prev) => prev.filter((m) => m.clientMsgId !== detail.clientMsgId));
      if (detail.message) {
        setMessages((prev) => {
          if (
            prev.some(
              (m) =>
                m.id === detail.message!.id ||
                m.clientMsgId === detail.message!.clientMsgId
            )
          ) {
            return prev;
          }
          return [...prev, detail.message!];
        });
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('vigil:message-outbox-synced', handleOutboxSynced);

    // If online on mount and items exist in outbox, drain them automatically
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      drainOutbox({ force: false })
        .then(() => refreshQueuedFromOutbox(technicianId || undefined))
        .catch(() => null);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('vigil:message-outbox-synced', handleOutboxSynced);
    };
  }, [technicianId, refreshQueuedFromOutbox, loadThread]);

  // Realtime subscription on technician thread + 15s polling fallback
  useEffect(() => {
    if (!technicianId) return;
    const handle = subscribeToTechnicianThread({
      supabase,
      technicianId,
      onInsert: (row) => {
        if (row.sender_role === 'AGENCY') {
          const preview = (row.body || msgT.photoLabel).slice(0, 80);
          onMessageReceived({
            surface: 'TECHNICIAN',
            messageId: row.id,
            technicianId: row.technician_id,
            senderRole: row.sender_role,
            senderName: agencyName || msgT.agencyOffice,
            preview,
            hasImage: row.attachment_kind === 'IMAGE',
            createdAt: row.created_at,
          });
          markRead(technicianId);
        }

        if (row.attachment_kind === 'IMAGE') {
          loadThread(null, true);
          return;
        }

        setMessages((prev) => {
          if (prev.some((m) => m.id === row.id || m.clientMsgId === row.client_msg_id)) {
            return prev;
          }
          return [
            ...prev,
            {
              id: row.id,
              clientMsgId: row.client_msg_id,
              organizationId: row.organization_id,
              technicianId: row.technician_id,
              senderRole: row.sender_role,
              senderId: row.sender_id,
              body: row.body,
              attachmentUrl: row.attachment_url,
              attachmentSignedUrl: null,
              attachmentKind: row.attachment_kind,
              readAt: row.read_at,
              createdAt: row.created_at,
            },
          ];
        });
        setTimeout(() => scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 30);
      },
      onUpdate: (row) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === row.id || m.clientMsgId === row.client_msg_id
              ? { ...m, readAt: row.read_at }
              : m
          )
        );
      },
      onPollFallback: () => {
        loadThread(null, true);
      },
    });

    return () => {
      handle.unsubscribe().catch(() => null);
    };
  }, [technicianId, supabase, agencyName, msgT.agencyOffice, msgT.photoLabel, markRead, loadThread]);

  const handleSelectPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!isOnline) {
      setOfflinePhotoNotice(true);
      toast.info(msgT.offlinePhotoHint);
      return;
    }
    try {
      const compressed = await compressChatPhotoToJpeg(file);
      if (pendingPhoto?.previewUrl) URL.revokeObjectURL(pendingPhoto.previewUrl);
      setPendingPhoto(compressed);
      setOfflinePhotoNotice(false);
    } catch (err: any) {
      if (err?.message === 'PHOTO_TOO_LARGE') {
        toast.error(msgT.photoTooLarge);
      } else {
        toast.error(err?.message || msgT.sendFailed);
      }
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (sending) return;
    const trimmed = composerText.trim();
    if (!trimmed && !pendingPhoto) return;

    // Photos are strictly online-only
    if (pendingPhoto && !isOnline) {
      setOfflinePhotoNotice(true);
      toast.info(msgT.offlinePhotoHint);
      return;
    }

    const clientMsgId = crypto.randomUUID();
    const nowIso = new Date().toISOString();

    // OFFLINE TEXT PATH -> enqueue in existing IndexedDB outbox (clock icon)
    if (!isOnline && trimmed && !pendingPhoto) {
      setComposerText('');
      try {
        await enqueueOutboxItem({
          clientSyncId: clientMsgId,
          actionType: 'SEND_MESSAGE',
          payload: {
            technicianId: technicianId || undefined,
            body: trimmed,
          },
          createdAt: Date.now(),
          attempts: 0,
          status: 'PENDING',
          technicianId: technicianId || undefined,
        });
        await refreshQueuedFromOutbox(technicianId || undefined);
        setTimeout(() => scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 30);
      } catch (err: any) {
        setComposerText(trimmed);
        toast.error(err?.message || msgT.sendFailed);
      }
      return;
    }

    setSending(true);
    const photoToSend = pendingPhoto;
    const textToSend = trimmed;
    setComposerText('');
    setPendingPhoto(null);

    try {
      const headers = getTechAuthHeaders();
      let imageRef: string | null = null;

      if (photoToSend) {
        const uploaded = await uploadChatPhotoViaSignedUrl({
          compressed: photoToSend,
          technicianId: technicianId || undefined,
          authHeaders: headers,
        });
        imageRef = uploaded.path;
      }

      const res = await fetch('/api/messages', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify({
          technicianId: technicianId || undefined,
          body: textToSend || null,
          imageRef,
          clientMsgId,
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.error || msgT.sendFailed);
      }

      if (photoToSend?.previewUrl) {
        URL.revokeObjectURL(photoToSend.previewUrl);
      }

      if (json.message) {
        setMessages((prev) => {
          if (
            prev.some(
              (m) => m.id === json.message.id || m.clientMsgId === json.message.clientMsgId
            )
          ) {
            return prev;
          }
          return [...prev, json.message];
        });
        setTimeout(() => scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 30);
      }
    } catch (err: any) {
      // If text-only send hit a network failure, automatically queue it in outbox instead of losing it
      if (!photoToSend && (err?.name === 'TypeError' || !navigator.onLine)) {
        await enqueueOutboxItem({
          clientSyncId: clientMsgId,
          actionType: 'SEND_MESSAGE',
          payload: {
            technicianId: technicianId || undefined,
            body: textToSend,
          },
          createdAt: new Date(nowIso).getTime(),
          attempts: 0,
          status: 'PENDING',
          technicianId: technicianId || undefined,
        }).catch(() => null);
        await refreshQueuedFromOutbox(technicianId || undefined);
      } else {
        setComposerText(textToSend);
        if (photoToSend) setPendingPhoto(photoToSend);
        toast.error(err?.message || msgT.sendFailed);
      }
    } finally {
      setSending(false);
    }
  };

  const handleRetryQueued = async (msg: ChatMessageItem) => {
    await resetOutboxItemForRetry(msg.clientMsgId);
    await drainOutbox({ force: true, targetSyncId: msg.clientMsgId }).catch(() => null);
    await refreshQueuedFromOutbox(technicianId || undefined);
  };

  // Merge server messages + pending offline outbox messages (deduplicated by clientMsgId)
  const combinedMessages = useMemo(() => {
    const serverIds = new Set(messages.map((m) => m.clientMsgId));
    const uniqueQueued = queuedMessages.filter((q) => !serverIds.has(q.clientMsgId));
    return [...messages, ...uniqueQueued].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [messages, queuedMessages]);

  return (
    <div className="flex flex-col h-[100dvh] w-full max-w-2xl mx-auto bg-white text-[#1C1917] sm:border-x sm:border-[#E7E5E4]">
      {/* Fixed Header (h-14) */}
      <header className="h-14 shrink-0 border-b border-[#E7E5E4] px-3 sm:px-4 flex items-center justify-between gap-2 bg-white">
        <div className="flex items-center gap-2.5 min-w-0">
          <Link
            href="/technician"
            data-testid="tech-messages-back"
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#1C1917] hover:bg-[#FFF0E6] hover:text-[#C2410C] shrink-0"
            aria-label={msgT.backToHome}
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0">
            <h1
              data-testid="tech-messages-header-title"
              className="text-sm sm:text-base font-extrabold text-[#1C1917] truncate"
            >
              {agencyName || msgT.agencyOffice}
            </h1>
            <p className="text-[11px] font-semibold text-[#44403C] truncate">{msgT.navMessages}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            data-testid="tech-messages-sound-toggle"
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              setMessageSoundEnabled('TECHNICIAN', next);
            }}
            className="w-9 h-9 rounded-full border border-[#E7E5E4] bg-white hover:bg-[#FFF0E6] flex items-center justify-center shrink-0"
            aria-label={soundT.soundToggleTitle}
            title={soundEnabled ? soundT.soundOn : soundT.soundOff}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-[#C2410C]" />
            ) : (
              <VolumeX className="w-4 h-4 text-[#57534E]" />
            )}
          </button>

          {!isOnline && (
            <span
              data-testid="tech-messages-offline-pill"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FEF3C7] text-[#92400E] text-[11px] font-extrabold shrink-0"
            >
              <WifiOff className="w-3.5 h-3.5" />
              <span>{msgT.queuedStatus}</span>
            </span>
          )}
        </div>
      </header>

      {/* Honest Offline Banner */}
      {!isOnline && (
        <div
          data-testid="tech-messages-offline-banner"
          className="shrink-0 px-3.5 py-2 bg-[#FFF8F2] border-b border-[#FED7AA] text-xs font-semibold text-[#9A3412]"
        >
          {msgT.offlineBanner}
        </div>
      )}

      {/* Messages Thread Scroll Area */}
      <main className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-4 py-4 space-y-3 bg-[#FFFDFB]">
        {loading ? (
          <ChatSkeleton />
        ) : loadError && combinedMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-2.5">
            <p className="text-sm font-bold text-[#DC2626]">{loadError}</p>
            <button
              type="button"
              onClick={() => loadThread(null, false)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C2410C] text-white text-xs font-bold"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {msgT.retry}
            </button>
          </div>
        ) : combinedMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-2.5">
            <ChatEmptyIllustration className="w-16 h-16" />
            <h2 className="text-sm font-extrabold text-[#1C1917]">{msgT.emptyThreadTitle}</h2>
            <p className="text-xs text-[#44403C] max-w-xs">{msgT.emptyThreadDesc}</p>
          </div>
        ) : (
          <>
            {hasMore && nextCursor && (
              <div className="flex justify-center pb-2">
                <button
                  type="button"
                  onClick={() => loadThread(nextCursor, false)}
                  className="px-3 py-1.5 rounded-full border border-[#D6D3D1] bg-white text-xs font-bold text-[#44403C] hover:border-[#EA580C] hover:text-[#C2410C]"
                >
                  {msgT.loadOlder}
                </button>
              </div>
            )}

            {combinedMessages.map((msg, idx) => {
              const prev = idx > 0 ? combinedMessages[idx - 1] : null;
              const showDateDivider =
                !prev || getLocalDayKey(prev.createdAt) !== getLocalDayKey(msg.createdAt);

              return (
                <React.Fragment key={msg.id || msg.clientMsgId}>
                  {showDateDivider && (
                    <div className="flex justify-center py-1">
                      <span className="px-3 py-0.5 rounded-full bg-[#F4F4F5] text-[#44403C] text-[11px] font-bold">
                        {formatDateDivider(msg.createdAt, msgT, currentLang)}
                      </span>
                    </div>
                  )}
                  <ChatBubble
                    message={msg}
                    isOwn={msg.senderRole === 'TECHNICIAN'}
                    lang={currentLang}
                    t={msgT}
                    onRetry={handleRetryQueued}
                    onOpenImage={(url, caption) => setLightbox({ url, caption })}
                  />
                </React.Fragment>
              );
            })}
            <div ref={scrollEndRef} />
          </>
        )}
      </main>

      {/* Honest Offline Photo Attach Hint */}
      {offlinePhotoNotice && !isOnline && (
        <div
          data-testid="offline-photo-hint"
          role="status"
          className="shrink-0 px-3.5 py-2 bg-[#FEF3C7] border-t border-[#FDE68A] flex items-center justify-between gap-2 text-xs font-bold text-[#92400E]"
        >
          <span>{msgT.offlinePhotoHint}</span>
          <button
            type="button"
            onClick={() => setOfflinePhotoNotice(false)}
            className="p-1 rounded text-[#92400E]"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Pending Photo Preview (with optional caption) */}
      {pendingPhoto && (
        <div
          data-testid="tech-photo-preview"
          className="shrink-0 px-3.5 py-2 bg-[#FFF8F2] border-t border-[#FED7AA] flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pendingPhoto.previewUrl}
              alt={msgT.photoLabel}
              width={48}
              height={48}
              className="w-12 h-12 rounded-lg object-cover border border-[#FED7AA] shrink-0"
            />
            <div className="min-w-0">
              <div className="text-xs font-bold text-[#1C1917] truncate">
                {pendingPhoto.file.name}
              </div>
              <div className="text-[11px] font-medium text-[#44403C]">
                {Math.max(1, Math.round(pendingPhoto.sizeBytes / 1024))} KB
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              URL.revokeObjectURL(pendingPhoto.previewUrl);
              setPendingPhoto(null);
            }}
            className="p-1.5 rounded-lg text-[#44403C] hover:bg-[#FEE6E0] hover:text-[#9A3412]"
            aria-label={msgT.removePhoto}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Fixed-height Composer (h-[68px] -> CLS = 0) */}
      <form
        onSubmit={handleSend}
        className="h-[68px] shrink-0 border-t border-[#E7E5E4] px-3 flex items-center gap-2 bg-white"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleSelectPhoto}
          className="hidden"
          data-testid="tech-photo-input"
        />

        <button
          type="button"
          data-testid="tech-attach-btn"
          onClick={() => {
            if (!isOnline) {
              setOfflinePhotoNotice(true);
              return;
            }
            fileInputRef.current?.click();
          }}
          className="w-10 h-10 rounded-full flex items-center justify-center text-[#44403C] hover:bg-[#FFF0E6] hover:text-[#C2410C] transition-colors shrink-0"
          aria-label={msgT.attachPhoto}
          title={msgT.attachPhoto}
        >
          <PaperclipIcon className="w-5 h-5" />
        </button>

        <input
          type="text"
          data-testid="tech-composer-input"
          value={composerText}
          onChange={(e) => setComposerText(e.target.value)}
          maxLength={2000}
          placeholder={pendingPhoto ? msgT.addCaption : msgT.typeMessage}
          aria-label={pendingPhoto ? msgT.addCaption : msgT.typeMessage}
          className="flex-1 h-11 px-4 rounded-full border border-[#D6D3D1] bg-[#FFFDFB] text-sm text-[#1C1917] placeholder:text-[#57534E] focus:outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/20"
        />

        <button
          type="submit"
          data-testid="tech-send-btn"
          disabled={sending || (!composerText.trim() && !pendingPhoto)}
          className="w-10 h-10 rounded-full bg-[#EA580C] hover:bg-[#C2410C] disabled:opacity-45 text-white flex items-center justify-center transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:ring-offset-2"
          aria-label={msgT.send}
          title={msgT.send}
        >
          <PaperPlaneIcon className="w-4 h-4" />
        </button>
      </form>

      {/* Photo Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-[#1C1917]/80 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative max-w-lg w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightbox(null)}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white text-[#1C1917] flex items-center justify-center shadow"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightbox.url}
              alt={lightbox.caption || msgT.photoLabel}
              className="w-full max-h-[75vh] object-contain bg-[#F4F4F5]"
            />
            {lightbox.caption && (
              <p className="p-4 text-sm text-[#1C1917]">{lightbox.caption}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
