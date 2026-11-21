'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Building2,
  Lock,
  RefreshCw,
  Search,
  Volume2,
  VolumeX,
  WifiOff,
  X,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import {
  formatMsgTemplate,
  getMessagingContactsDictionary,
  getMessagingDictionary,
  getMessagingSoundDictionary,
} from '@/lib/i18n/messaging';
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
  formatTimeShort,
  getInitials,
  getLocalDayKey,
  uploadChatPhotoViaSignedUrl,
} from '@/components/messaging/ChatPrimitives';

const CONTACTS_CACHE_KEY = 'vigil_tech_chat_contacts_v1';
const threadCacheKey = (dmKey: string) => `vigil_tech_chat_thread_${dmKey}`;

interface TechContactItem {
  kind: 'OFFICE' | 'TECHNICIAN';
  target: string; // 'office' | 'technician:<id>'
  dmKey: string;
  id: string; // 'office' | '<techId>'
  name: string;
  employeeId: string | null;
  pinned: boolean;
  unreadCount: number;
  lastMessage: {
    id: string;
    senderRole: 'AGENCY' | 'TECHNICIAN';
    senderId: string;
    body: string | null;
    attachmentKind: 'IMAGE' | null;
    readAt: string | null;
    createdAt: string;
  } | null;
}

function getTechAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const token = localStorage.getItem('vigil_tech_token');
    if (token) return { Authorization: `Bearer ${token}` };
  } catch {}
  return {};
}

function readDmKeyFromLocation(): string {
  if (typeof window === 'undefined') return '';
  try {
    const sp = new URLSearchParams(window.location.search);
    return (sp.get('dmKey') || '').trim();
  } catch {
    return '';
  }
}

export default function TechnicianMessagesPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [currentLang, setCurrentLang] = useState<string>('en');
  const msgT = useMemo(() => getMessagingDictionary(currentLang), [currentLang]);
  const soundT = useMemo(() => getMessagingSoundDictionary(currentLang), [currentLang]);
  const contactT = useMemo(() => getMessagingContactsDictionary(currentLang), [currentLang]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const [agencyName, setAgencyName] = useState<string>('');
  const [technicianId, setTechnicianId] = useState<string>('');
  const [contacts, setContacts] = useState<TechContactItem[]>([]);
  const [contactsLoading, setContactsLoading] = useState<boolean>(true);
  const [contactsError, setContactsError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [activeDmKey, setActiveDmKey] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [queuedMessages, setQueuedMessages] = useState<ChatMessageItem[]>([]);
  const [threadLoading, setThreadLoading] = useState<boolean>(false);
  const [threadError, setThreadError] = useState<string | null>(null);
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
  const activeDmKeyRef = useRef<string | null>(null);
  const contactsRef = useRef<TechContactItem[]>([]);

  useEffect(() => {
    activeDmKeyRef.current = activeDmKey;
  }, [activeDmKey]);

  useEffect(() => {
    contactsRef.current = contacts;
  }, [contacts]);

  const activeContact = useMemo(
    () => (activeDmKey ? contacts.find((c) => c.dmKey === activeDmKey) || null : null),
    [contacts, activeDmKey]
  );

  // Initialize language, sound hook, online state
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

  const refreshQueuedFromOutbox = useCallback(async (techId?: string, dmKey?: string | null) => {
    if (!dmKey) {
      setQueuedMessages([]);
      return;
    }
    const pending = await getPendingMessageOutboxItems(techId, dmKey);
    const mapped: ChatMessageItem[] = pending.map((item) => ({
      id: `local-${item.clientSyncId}`,
      clientMsgId: item.clientSyncId,
      technicianId: item.technicianId || techId || '',
      senderRole: 'TECHNICIAN',
      senderId: techId || item.technicianId || '',
      dmKey,
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

  const markRead = useCallback(async (dmKey: string) => {
    if (!dmKey || (typeof navigator !== 'undefined' && !navigator.onLine)) return;
    try {
      await fetch('/api/messages/read', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...getTechAuthHeaders(),
        },
        body: JSON.stringify({ dmKey }),
      });
      setContacts((prev) =>
        prev.map((c) => (c.dmKey === dmKey ? { ...c, unreadCount: 0 } : c))
      );
    } catch {
      // Non-fatal
    }
  }, []);

  const loadContacts = useCallback(
    async (silent = false) => {
      if (!silent) {
        setContactsLoading(true);
        setContactsError(null);
      }

      if (!silent) {
        const cached = await getLocalCache<{
          agencyName?: string;
          technicianId?: string;
          contacts?: TechContactItem[];
        }>(CONTACTS_CACHE_KEY);
        if (cached?.data) {
          if (cached.data.agencyName) setAgencyName(cached.data.agencyName);
          if (cached.data.technicianId) setTechnicianId(cached.data.technicianId);
          if (Array.isArray(cached.data.contacts)) {
            setContacts(cached.data.contacts);
          }
        }
      }

      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setContactsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/messages/contacts', {
          credentials: 'include',
          cache: 'no-store',
          headers: getTechAuthHeaders(),
        });
        if (res.status === 401) {
          router.replace('/technician');
          return;
        }
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(json?.error || msgT.loadFailed);
        }

        const resolvedOrg = json.organizationName || '';
        const resolvedTechId = json.technicianId || '';
        const list: TechContactItem[] = Array.isArray(json.contacts) ? json.contacts : [];

        if (resolvedOrg) setAgencyName(resolvedOrg);
        if (resolvedTechId) setTechnicianId(resolvedTechId);
        setContacts(list);
        setContactsError(null);

        await setLocalCache(CONTACTS_CACHE_KEY, {
          agencyName: resolvedOrg,
          technicianId: resolvedTechId,
          contacts: list,
        }).catch(() => null);

        // Deep-link support (?dmKey=...) or desktop auto-select Office
        const urlDmKey = readDmKeyFromLocation();
        if (urlDmKey && list.some((c) => c.dmKey === urlDmKey)) {
          setActiveDmKey((prev) => prev || urlDmKey);
        } else if (
          typeof window !== 'undefined' &&
          window.innerWidth >= 768 &&
          list.length > 0
        ) {
          setActiveDmKey((prev) => prev || list[0].dmKey);
        }
      } catch (err: any) {
        const message = err?.message || msgT.loadFailed;
        setContactsError(message);
        if (!silent) toast.error(message);
      } finally {
        setContactsLoading(false);
      }
    },
    [router, msgT.loadFailed]
  );

  const loadThread = useCallback(
    async (dmKey: string, cursor?: string | null, silent = false) => {
      if (!dmKey) return;
      if (!cursor && !silent) {
        setThreadLoading(true);
        setThreadError(null);
      }

      if (!cursor && !silent) {
        const cached = await getLocalCache<{ messages?: ChatMessageItem[] }>(
          threadCacheKey(dmKey)
        );
        if (cached?.data && Array.isArray(cached.data.messages)) {
          setMessages(cached.data.messages);
        } else {
          setMessages([]);
        }
        await refreshQueuedFromOutbox(technicianId || undefined, dmKey);
      }

      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setThreadLoading(false);
        return;
      }

      try {
        const params = new URLSearchParams({ dmKey, limit: '50' });
        if (cursor) params.set('cursor', cursor);

        const res = await fetch(`/api/messages?${params.toString()}`, {
          credentials: 'include',
          cache: 'no-store',
          headers: getTechAuthHeaders(),
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
        if (cursor) {
          setMessages((prev) => [...incoming, ...prev]);
        } else {
          setMessages(incoming);
          await setLocalCache(threadCacheKey(dmKey), { messages: incoming }).catch(() => null);
          setTimeout(() => scrollEndRef.current?.scrollIntoView({ behavior: 'auto' }), 30);
        }
        setNextCursor(json.nextCursor || null);
        setHasMore(Boolean(json.hasMore));
        setThreadError(null);

        await markRead(dmKey);
        await refreshQueuedFromOutbox(technicianId || undefined, dmKey);
      } catch (err: any) {
        const message = err?.message || msgT.loadFailed;
        setThreadError(message);
        if (!silent) toast.error(message);
      } finally {
        setThreadLoading(false);
      }
    },
    [technicianId, router, markRead, refreshQueuedFromOutbox, msgT.loadFailed]
  );

  // Initial contacts load
  useEffect(() => {
    loadContacts(false);
  }, [loadContacts]);

  // Load thread whenever activeDmKey changes
  useEffect(() => {
    if (!activeDmKey) {
      setMessages([]);
      setQueuedMessages([]);
      setNextCursor(null);
      setHasMore(false);
      return;
    }
    loadThread(activeDmKey, null, false);
  }, [activeDmKey, loadThread]);

  // Auto-drain offline outbox on reconnect & sync events
  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      setOfflinePhotoNotice(false);
      await drainOutbox({ force: true }).catch(() => null);
      const currentDm = activeDmKeyRef.current;
      await refreshQueuedFromOutbox(technicianId || undefined, currentDm);
      await loadContacts(true);
      if (currentDm) {
        await loadThread(currentDm, null, true);
      }
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
        const syncedMsg = detail.message;
        const msgDmKey = syncedMsg.dmKey || (technicianId ? `office__${technicianId}` : '');
        if (msgDmKey === activeDmKeyRef.current) {
          setMessages((prev) => {
            if (
              prev.some(
                (m) => m.id === syncedMsg.id || m.clientMsgId === syncedMsg.clientMsgId
              )
            ) {
              return prev;
            }
            return [...prev, syncedMsg];
          });
        }
        loadContacts(true);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('vigil:message-outbox-synced', handleOutboxSynced);

    if (typeof navigator !== 'undefined' && navigator.onLine) {
      drainOutbox({ force: false })
        .then(() => refreshQueuedFromOutbox(technicianId || undefined, activeDmKeyRef.current))
        .catch(() => null);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('vigil:message-outbox-synced', handleOutboxSynced);
    };
  }, [technicianId, refreshQueuedFromOutbox, loadContacts, loadThread]);

  // Realtime subscription on technician channel (receives Office + Tech<->Tech DMs)
  useEffect(() => {
    if (!technicianId) return;
    const handle = subscribeToTechnicianThread({
      supabase,
      technicianId,
      onInsert: (row) => {
        const rowDmKey = row.dm_key || `office__${row.technician_id}`;
        const isOwn = row.sender_id === technicianId;
        const isCurrentThread = activeDmKeyRef.current === rowDmKey;

        const matchingContact = contactsRef.current.find((c) => c.dmKey === rowDmKey);
        const senderName =
          row.sender_name ||
          matchingContact?.name ||
          (row.sender_role === 'AGENCY' ? agencyName || msgT.agencyOffice : contactT.colleagueLabel);

        // Update contact preview & unread count immediately
        setContacts((prev) => {
          const updated = prev.map((c) => {
            if (c.dmKey !== rowDmKey) return c;
            return {
              ...c,
              unreadCount: !isOwn && !isCurrentThread ? c.unreadCount + 1 : c.unreadCount,
              lastMessage: {
                id: row.id,
                senderRole: row.sender_role,
                senderId: row.sender_id,
                body: row.body,
                attachmentKind: row.attachment_kind,
                readAt: row.read_at,
                createdAt: row.created_at,
              },
            };
          });
          // Keep Office pinned first, sort peers by latest message desc
          const pinned = updated.filter((c) => c.pinned);
          const peers = updated
            .filter((c) => !c.pinned)
            .sort((a, b) => {
              const aT = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
              const bT = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
              if (bT !== aT) return bT - aT;
              return a.name.localeCompare(b.name);
            });
          return [...pinned, ...peers];
        });

        if (!isOwn) {
          const preview = (row.body || msgT.photoLabel).slice(0, 80);
          onMessageReceived({
            surface: 'TECHNICIAN',
            messageId: row.id,
            technicianId: row.technician_id,
            senderRole: row.sender_role,
            senderId: row.sender_id,
            dmKey: rowDmKey,
            isOwn: false,
            senderName,
            preview,
            hasImage: row.attachment_kind === 'IMAGE',
            createdAt: row.created_at,
          });

          if (isCurrentThread) {
            markRead(rowDmKey);
          } else {
            toast(formatMsgTemplate(msgT.newMessageFrom, { name: senderName }), {
              description: preview,
              action: {
                label: msgT.openChat,
                onClick: () => setActiveDmKey(rowDmKey),
              },
            });
          }
        }

        if (isCurrentThread) {
          if (row.attachment_kind === 'IMAGE') {
            loadThread(rowDmKey, null, true);
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
                recipientRole: row.recipient_role,
                recipientId: row.recipient_id ?? null,
                dmKey: rowDmKey,
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
        }
      },
      onUpdate: (row) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === row.id || (row.client_msg_id && m.clientMsgId === row.client_msg_id)
              ? { ...m, readAt: row.read_at }
              : m
          )
        );
      },
      onPollFallback: () => {
        loadContacts(true);
        if (activeDmKeyRef.current) {
          loadThread(activeDmKeyRef.current, null, true);
        }
      },
    });

    return () => {
      handle.unsubscribe().catch(() => null);
    };
  }, [
    technicianId,
    supabase,
    agencyName,
    msgT.agencyOffice,
    msgT.photoLabel,
    msgT.newMessageFrom,
    msgT.openChat,
    contactT.colleagueLabel,
    markRead,
    loadContacts,
    loadThread,
  ]);

  const handleSelectContact = (contact: TechContactItem) => {
    setActiveDmKey(contact.dmKey);
    setComposerText('');
    if (pendingPhoto?.previewUrl) URL.revokeObjectURL(pendingPhoto.previewUrl);
    setPendingPhoto(null);
    setOfflinePhotoNotice(false);
    // Keep URL clean / shareable for back navigation
    if (typeof window !== 'undefined') {
      const nextUrl = `/technician/messages?dmKey=${encodeURIComponent(contact.dmKey)}`;
      window.history.replaceState(null, '', nextUrl);
    }
  };

  const handleBackToContacts = () => {
    setActiveDmKey(null);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', '/technician/messages');
    }
  };

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
    if (sending || !activeContact) return;
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
    const dmKey = activeContact.dmKey;
    const target = activeContact.target;
    const recipientId = activeContact.kind === 'TECHNICIAN' ? activeContact.id : undefined;

    // OFFLINE TEXT PATH -> enqueue in IndexedDB outbox (works for BOTH Office and Tech<->Tech DMs)
    if (!isOnline && trimmed && !pendingPhoto) {
      setComposerText('');
      try {
        await enqueueOutboxItem({
          clientSyncId: clientMsgId,
          actionType: 'SEND_MESSAGE',
          payload: {
            target,
            dmKey,
            recipientId,
            technicianId: technicianId || undefined,
            body: trimmed,
          },
          createdAt: Date.now(),
          attempts: 0,
          status: 'PENDING',
          technicianId: technicianId || undefined,
        });
        await refreshQueuedFromOutbox(technicianId || undefined, dmKey);
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
          target,
          dmKey,
          recipientId,
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
        const sentMsg: ChatMessageItem = json.message;
        setMessages((prev) => {
          if (
            prev.some(
              (m) => m.id === sentMsg.id || m.clientMsgId === sentMsg.clientMsgId
            )
          ) {
            return prev;
          }
          return [...prev, sentMsg];
        });
        setContacts((prev) =>
          prev.map((c) =>
            c.dmKey === dmKey
              ? {
                  ...c,
                  lastMessage: {
                    id: sentMsg.id,
                    senderRole: sentMsg.senderRole,
                    senderId: sentMsg.senderId,
                    body: sentMsg.body,
                    attachmentKind: sentMsg.attachmentKind,
                    readAt: sentMsg.readAt,
                    createdAt: sentMsg.createdAt,
                  },
                }
              : c
          )
        );
        setTimeout(() => scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 30);
      }
    } catch (err: any) {
      if (!photoToSend && (err?.name === 'TypeError' || !navigator.onLine)) {
        await enqueueOutboxItem({
          clientSyncId: clientMsgId,
          actionType: 'SEND_MESSAGE',
          payload: {
            target,
            dmKey,
            recipientId,
            technicianId: technicianId || undefined,
            body: textToSend,
          },
          createdAt: new Date(nowIso).getTime(),
          attempts: 0,
          status: 'PENDING',
          technicianId: technicianId || undefined,
        }).catch(() => null);
        await refreshQueuedFromOutbox(technicianId || undefined, dmKey);
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
    await refreshQueuedFromOutbox(technicianId || undefined, activeDmKey);
  };

  const filteredContacts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.employeeId && c.employeeId.toLowerCase().includes(q)) ||
        (c.kind === 'OFFICE' &&
          (contactT.officeLabel.toLowerCase().includes(q) || 'office agency'.includes(q)))
    );
  }, [contacts, searchQuery, contactT.officeLabel]);

  const combinedMessages = useMemo(() => {
    const serverIds = new Set(messages.map((m) => m.clientMsgId));
    const uniqueQueued = queuedMessages.filter((q) => !serverIds.has(q.clientMsgId));
    return [...messages, ...uniqueQueued].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [messages, queuedMessages]);

  return (
    <div className="flex h-[100dvh] w-full max-w-5xl mx-auto bg-white text-[#1C1917] md:border-x md:border-[#E7E5E4]">
      {/* LEFT PANE: CONTACTS LIST (full screen on mobile when no thread active, always visible on md+) */}
      <aside
        data-testid="tech-contacts-pane"
        className={`${
          activeDmKey ? 'hidden md:flex' : 'flex'
        } flex-col w-full md:w-[340px] shrink-0 md:border-r md:border-[#E7E5E4] bg-white h-full`}
      >
        {/* Contacts Header */}
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
                className="text-base font-extrabold text-[#1C1917] truncate"
              >
                {contactT.contactsTitle}
              </h1>
              {agencyName && (
                <p className="text-[11px] font-semibold text-[#44403C] truncate">{agencyName}</p>
              )}
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

        {/* Search Input */}
        <div className="p-3 border-b border-[#E7E5E4] bg-[#FFFDFB] shrink-0">
          <div className="relative">
            <Search
              className="w-4 h-4 text-[#57534E] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              data-testid="tech-contacts-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={contactT.searchContacts}
              aria-label={contactT.searchContacts}
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#D6D3D1] bg-white text-sm text-[#1C1917] placeholder:text-[#57534E] focus:outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/20"
            />
          </div>
        </div>

        {/* Contact List */}
        <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-[#F4F4F5]">
          {contactsLoading && contacts.length === 0 ? (
            <div className="p-4 space-y-3" aria-busy="true">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <div className="w-11 h-11 rounded-full bg-[#F4F4F5] animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-32 rounded bg-[#F4F4F5] animate-pulse" />
                    <div className="h-3 w-48 rounded bg-[#F4F4F5] animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : contactsError && contacts.length === 0 ? (
            <div className="p-6 text-center space-y-2.5">
              <p className="text-sm font-bold text-[#DC2626]">{contactsError}</p>
              <button
                type="button"
                onClick={() => loadContacts(false)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C2410C] text-white text-xs font-bold"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {msgT.retry}
              </button>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="p-8 text-center text-sm font-semibold text-[#57534E]">
              {contactT.noMatchingContacts}
            </div>
          ) : (
            filteredContacts.map((contact) => {
              const isSelected = activeDmKey === contact.dmKey;
              const previewText = contact.lastMessage
                ? contact.lastMessage.body ||
                  (contact.lastMessage.attachmentKind === 'IMAGE'
                    ? msgT.photoLabel
                    : contactT.startChatHint)
                : contactT.startChatHint;

              return (
                <button
                  key={contact.dmKey}
                  type="button"
                  data-testid={
                    contact.kind === 'OFFICE'
                      ? 'contact-row-office'
                      : `contact-row-tech-${contact.id}`
                  }
                  onClick={() => handleSelectContact(contact)}
                  className={`w-full px-3.5 py-3 flex items-center gap-3 text-left motion-safe:transition-colors ${
                    isSelected
                      ? 'bg-[#FFF0E6] border-l-4 border-[#EA580C]'
                      : 'bg-white hover:bg-[#FFF8F2] border-l-4 border-transparent'
                  }`}
                >
                  {/* Avatar */}
                  {contact.kind === 'OFFICE' ? (
                    <div className="w-11 h-11 rounded-full bg-[#C2410C] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Building2 className="w-5 h-5" aria-hidden="true" />
                    </div>
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-[#FEE6E0] text-[#9A3412] font-extrabold text-sm flex items-center justify-center shrink-0">
                      {getInitials(contact.name)}
                    </div>
                  )}

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-sm font-extrabold text-[#1C1917] truncate">
                          {contact.name}
                        </span>
                        {contact.pinned && (
                          <span className="px-1.5 py-0.5 rounded bg-[#FFF0E6] text-[#9A3412] text-[10px] font-extrabold shrink-0">
                            {contactT.officeLabel}
                          </span>
                        )}
                      </div>
                      {contact.lastMessage && (
                        <span className="text-[11px] font-semibold text-[#57534E] shrink-0">
                          {formatTimeShort(contact.lastMessage.createdAt, currentLang)}
                        </span>
                      )}
                    </div>

                    <div className="mt-0.5 flex items-center justify-between gap-2">
                      <p className="text-xs font-medium text-[#44403C] truncate">{previewText}</p>
                      {contact.unreadCount > 0 && (
                        <span
                          data-testid={`contact-unread-${contact.id}`}
                          className="min-w-[20px] h-5 px-1.5 rounded-full bg-[#C2410C] text-white text-[11px] font-extrabold inline-flex items-center justify-center shrink-0"
                        >
                          {contact.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}

          {!contactsLoading &&
            contacts.length === 1 &&
            contacts[0]?.kind === 'OFFICE' &&
            !searchQuery.trim() && (
              <div className="px-4 py-6 text-center text-xs font-medium text-[#57534E]">
                {contactT.noOtherTechnicians}
              </div>
            )}
        </div>
      </aside>

      {/* RIGHT PANE: ACTIVE CHAT THREAD */}
      <section
        data-testid="tech-thread-pane"
        className={`${
          activeDmKey ? 'flex' : 'hidden md:flex'
        } flex-col flex-1 min-w-0 bg-white h-full`}
      >
        {!activeContact ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#FFFDFB] space-y-3">
            <ChatEmptyIllustration className="w-16 h-16" />
            <h2 className="text-base font-extrabold text-[#1C1917]">{contactT.contactsTitle}</h2>
            <p className="text-xs font-medium text-[#44403C] max-w-xs">
              {contactT.startChatHint}
            </p>
          </div>
        ) : (
          <>
            {/* Thread Header (h-14) */}
            <header className="h-14 shrink-0 border-b border-[#E7E5E4] px-3 sm:px-4 flex items-center justify-between gap-2 bg-white">
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  type="button"
                  data-testid="tech-thread-back"
                  onClick={handleBackToContacts}
                  className="md:hidden w-9 h-9 rounded-full flex items-center justify-center text-[#1C1917] hover:bg-[#FFF0E6] hover:text-[#C2410C] shrink-0"
                  aria-label={contactT.backToContacts}
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                {activeContact.kind === 'OFFICE' ? (
                  <div className="w-9 h-9 rounded-full bg-[#C2410C] text-white flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4" aria-hidden="true" />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[#FEE6E0] text-[#9A3412] font-extrabold text-xs flex items-center justify-center shrink-0">
                    {getInitials(activeContact.name)}
                  </div>
                )}

                <div className="min-w-0">
                  <h2
                    data-testid="tech-thread-title"
                    className="text-sm sm:text-base font-extrabold text-[#1C1917] truncate"
                  >
                    {activeContact.name}
                  </h2>
                  <p className="text-[11px] font-semibold text-[#44403C] truncate flex items-center gap-1">
                    {activeContact.kind === 'TECHNICIAN' && (
                      <Lock className="w-3 h-3 text-[#57534E] shrink-0" aria-hidden="true" />
                    )}
                    <span>
                      {activeContact.kind === 'OFFICE'
                        ? msgT.agencyOffice
                        : contactT.privateDmBadge}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const next = !soundEnabled;
                    setSoundEnabled(next);
                    setMessageSoundEnabled('TECHNICIAN', next);
                  }}
                  className="md:hidden w-9 h-9 rounded-full border border-[#E7E5E4] bg-white hover:bg-[#FFF0E6] flex items-center justify-center shrink-0"
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
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FEF3C7] text-[#92400E] text-[11px] font-extrabold shrink-0">
                    <WifiOff className="w-3.5 h-3.5" />
                    <span>{msgT.queuedStatus}</span>
                  </span>
                )}
              </div>
            </header>

            {/* Offline Banner */}
            {!isOnline && (
              <div
                data-testid="tech-messages-offline-banner"
                className="shrink-0 px-3.5 py-2 bg-[#FFF8F2] border-b border-[#FED7AA] text-xs font-semibold text-[#9A3412]"
              >
                {msgT.offlineBanner}
              </div>
            )}

            {/* Thread Scroll Area */}
            <main className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-4 py-4 space-y-3 bg-[#FFFDFB]">
              {threadLoading ? (
                <ChatSkeleton />
              ) : threadError && combinedMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-2.5">
                  <p className="text-sm font-bold text-[#DC2626]">{threadError}</p>
                  <button
                    type="button"
                    onClick={() => loadThread(activeContact.dmKey, null, false)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C2410C] text-white text-xs font-bold"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    {msgT.retry}
                  </button>
                </div>
              ) : combinedMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-2.5">
                  <ChatEmptyIllustration className="w-16 h-16" />
                  <h3 className="text-sm font-extrabold text-[#1C1917]">{msgT.emptyThreadTitle}</h3>
                  <p className="text-xs text-[#44403C] max-w-xs">{msgT.emptyThreadDesc}</p>
                </div>
              ) : (
                <>
                  {hasMore && nextCursor && (
                    <div className="flex justify-center pb-2">
                      <button
                        type="button"
                        onClick={() => loadThread(activeContact.dmKey, nextCursor, false)}
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

                    const isOwnMessage = technicianId
                      ? msg.senderId === technicianId
                      : msg.senderRole === 'TECHNICIAN';

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
                          isOwn={isOwnMessage}
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

            {/* Offline Photo Hint */}
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

            {/* Pending Photo Preview */}
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
                className="w-10 h-10 rounded-full flex items-center justify-center text-[#44403C] hover:bg-[#FFF0E6] hover:text-[#C2410C] motion-safe:transition-colors shrink-0"
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
                className="w-10 h-10 rounded-full bg-[#C2410C] hover:bg-[#9A3412] disabled:opacity-45 text-white flex items-center justify-center motion-safe:transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:ring-offset-2"
                aria-label={msgT.send}
                title={msgT.send}
              >
                <PaperPlaneIcon className="w-4 h-4" />
              </button>
            </form>
          </>
        )}
      </section>

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
