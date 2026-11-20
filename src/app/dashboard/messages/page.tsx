'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Menu, Search, ArrowLeft, X, WifiOff, RefreshCw, Volume2, VolumeX } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { getAdminDictionary } from '@/lib/i18n/admin';
import { getMessagingDictionary, getMessagingSoundDictionary, formatMsgTemplate } from '@/lib/i18n/messaging';
import { subscribeToAgencyMessages } from '@/lib/messagingRealtime';
import { onMessageReceived } from '@/lib/messagingHooks';
import {
  ensureMessageSoundHookRegistered,
  isMessageSoundEnabled,
  requestDashboardNotificationPermissionOnce,
  setMessageSoundEnabled,
} from '@/lib/messagingSound';
import {
  BroadcastIcon,
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

interface ThreadSummary {
  technicianId: string;
  fullName: string;
  employeeId: string | null;
  status: string;
  unreadCount: number;
  lastMessage: {
    id: string;
    senderRole: 'AGENCY' | 'TECHNICIAN';
    body: string | null;
    attachmentKind: 'IMAGE' | null;
    readAt: string | null;
    createdAt: string;
  } | null;
}

export default function DashboardMessagesPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  const adminT = useMemo(() => getAdminDictionary(currentLanguage), [currentLanguage]);
  const msgT = useMemo(() => getMessagingDictionary(currentLanguage), [currentLanguage]);
  const soundT = useMemo(() => getMessagingSoundDictionary(currentLanguage), [currentLanguage]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [orgId, setOrgId] = useState<string>('');
  const [orgName, setOrgName] = useState<string>('');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userEmail, setUserEmail] = useState<string>('');

  const [threads, setThreads] = useState<ThreadSummary[]>([]);
  const [activeTechCount, setActiveTechCount] = useState<number>(0);
  const [totalUnread, setTotalUnread] = useState<number>(0);
  const [loadingThreads, setLoadingThreads] = useState<boolean>(true);
  const [threadsError, setThreadsError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTechId, setSelectedTechId] = useState<string | null>(null);
  const [broadcastMode, setBroadcastMode] = useState<boolean>(false);

  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);

  const [composerText, setComposerText] = useState<string>('');
  const [pendingPhoto, setPendingPhoto] = useState<CompressedChatPhoto | null>(null);
  const [sending, setSending] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [lightbox, setLightbox] = useState<{ url: string; caption?: string | null } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const scrollEndRef = useRef<HTMLDivElement | null>(null);
  const selectedTechRef = useRef<string | null>(null);
  selectedTechRef.current = selectedTechId;

  // Enforce light FIRE theme, sound hook & read persisted language
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    ensureMessageSoundHookRegistered();
    setSoundEnabled(isMessageSoundEnabled('DASHBOARD'));
    try {
      const saved = localStorage.getItem('vigilamc_admin_language');
      if (saved) setCurrentLanguage(saved);
    } catch {}
    setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);
    const onUp = () => setIsOnline(true);
    const onDown = () => setIsOnline(false);
    const onFirstClick = () => {
      requestDashboardNotificationPermissionOnce().catch(() => null);
      window.removeEventListener('pointerdown', onFirstClick);
    };
    window.addEventListener('online', onUp);
    window.addEventListener('offline', onDown);
    window.addEventListener('pointerdown', onFirstClick, { passive: true });
    return () => {
      window.removeEventListener('online', onUp);
      window.removeEventListener('offline', onDown);
      window.removeEventListener('pointerdown', onFirstClick);
    };
  }, []);

  // Load user profile for sidebar & language fallback
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include', cache: 'no-store' });
        if (res.status === 401) {
          router.replace('/login');
          return;
        }
        if (res.ok) {
          const json = await res.json();
          if (json?.profile) {
            setUserProfile(json.profile);
            setUserEmail(json.user?.email || json.profile?.email || '');
            const stored = localStorage.getItem('vigilamc_admin_language');
            if (!stored && json.profile.preferredLanguage) {
              setCurrentLanguage(json.profile.preferredLanguage);
            }
          }
        }
      } catch {
        // Non-fatal
      }
    })();
  }, [router]);

  const loadThreads = useCallback(async (silent = false) => {
    if (!silent) {
      setLoadingThreads(true);
      setThreadsError(null);
    }
    try {
      const res = await fetch('/api/messages/threads', {
        credentials: 'include',
        cache: 'no-store',
      });
      if (res.status === 401) {
        router.replace('/login');
        return;
      }
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.error || msgT.loadFailed);
      }
      setOrgId(json.organizationId || '');
      setOrgName(json.organizationName || '');
      setThreads(Array.isArray(json.threads) ? json.threads : []);
      setActiveTechCount(typeof json.activeTechnicianCount === 'number' ? json.activeTechnicianCount : 0);
      setTotalUnread(typeof json.totalUnread === 'number' ? json.totalUnread : 0);
      setThreadsError(null);
    } catch (err: any) {
      const message = err?.message || msgT.loadFailed;
      setThreadsError(message);
      if (!silent) toast.error(message);
    } finally {
      if (!silent) setLoadingThreads(false);
    }
  }, [router, msgT.loadFailed]);

  useEffect(() => {
    loadThreads(false);
  }, [loadThreads]);

  const markThreadRead = useCallback(async (technicianId: string) => {
    try {
      const res = await fetch('/api/messages/read', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ technicianId }),
      });
      if (res.ok) {
        setThreads((prev) => {
          let cleared = 0;
          const next = prev.map((th) => {
            if (th.technicianId === technicianId && th.unreadCount > 0) {
              cleared = th.unreadCount;
              return { ...th, unreadCount: 0 };
            }
            return th;
          });
          if (cleared > 0) {
            setTotalUnread((u) => Math.max(0, u - cleared));
          }
          return next;
        });
      }
    } catch {
      // Non-fatal
    }
  }, []);

  const loadMessages = useCallback(
    async (technicianId: string, cursor?: string | null) => {
      if (!cursor) {
        setLoadingMessages(true);
        setMessagesError(null);
      }
      try {
        const params = new URLSearchParams({ technicianId, limit: '50' });
        if (cursor) params.set('cursor', cursor);
        const res = await fetch(`/api/messages?${params.toString()}`, {
          credentials: 'include',
          cache: 'no-store',
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(json?.error || msgT.loadFailed);
        }
        const incoming: ChatMessageItem[] = Array.isArray(json.messages) ? json.messages : [];
        if (cursor) {
          setMessages((prev) => [...incoming, ...prev]);
        } else {
          setMessages(incoming);
          setTimeout(() => scrollEndRef.current?.scrollIntoView({ behavior: 'auto' }), 30);
        }
        setNextCursor(json.nextCursor || null);
        setHasMore(Boolean(json.hasMore));
        setMessagesError(null);
        await markThreadRead(technicianId);
      } catch (err: any) {
        const message = err?.message || msgT.loadFailed;
        setMessagesError(message);
        toast.error(message);
      } finally {
        setLoadingMessages(false);
      }
    },
    [markThreadRead, msgT.loadFailed]
  );

  useEffect(() => {
    if (selectedTechId && !broadcastMode) {
      loadMessages(selectedTechId, null);
    }
  }, [selectedTechId, broadcastMode, loadMessages]);

  // Live Supabase Realtime subscription (Agency channel + 15s polling fallback)
  useEffect(() => {
    if (!orgId) return;
    const handle = subscribeToAgencyMessages({
      supabase,
      organizationId: orgId,
      onInsert: async (row) => {
        const isCurrentThread = selectedTechRef.current === row.technician_id;

        if (row.sender_role === 'TECHNICIAN') {
          const preview = (row.body || msgT.photoLabel).slice(0, 80);
          onMessageReceived({
            surface: 'DASHBOARD',
            messageId: row.id,
            technicianId: row.technician_id,
            senderRole: row.sender_role,
            preview,
            hasImage: row.attachment_kind === 'IMAGE',
            createdAt: row.created_at,
          });
        }

        if (isCurrentThread) {
          // If message has an image, re-fetch thread to get fresh signed read URL; else append directly
          if (row.attachment_kind === 'IMAGE') {
            loadMessages(row.technician_id, null);
          } else {
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
            if (row.sender_role === 'TECHNICIAN') {
              markThreadRead(row.technician_id);
            }
          }
        }

        loadThreads(true);
      },
      onUpdate: (row) => {
        if (selectedTechRef.current === row.technician_id) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === row.id || m.clientMsgId === row.client_msg_id
                ? { ...m, readAt: row.read_at }
                : m
            )
          );
        }
        loadThreads(true);
      },
      onPollFallback: () => {
        loadThreads(true);
        if (selectedTechRef.current) {
          loadMessages(selectedTechRef.current, null);
        }
      },
    });

    return () => {
      handle.unsubscribe().catch(() => null);
    };
  }, [orgId, supabase, loadThreads, loadMessages, markThreadRead, msgT.photoLabel]);

  const handleSelectPhotoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!isOnline) {
      toast.info(msgT.offlinePhotoHint);
      return;
    }
    try {
      const compressed = await compressChatPhotoToJpeg(file);
      if (pendingPhoto?.previewUrl) URL.revokeObjectURL(pendingPhoto.previewUrl);
      setPendingPhoto(compressed);
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
    if (!broadcastMode && !selectedTechId) return;
    if (!isOnline && pendingPhoto) {
      toast.info(msgT.offlinePhotoHint);
      return;
    }

    setSending(true);
    const clientMsgId = crypto.randomUUID();
    const photoToSend = pendingPhoto;
    const textToSend = trimmed;

    // Clear inputs optimistically (restore on failure)
    setComposerText('');
    setPendingPhoto(null);

    try {
      let imageRef: string | null = null;
      if (photoToSend) {
        const uploaded = await uploadChatPhotoViaSignedUrl({
          compressed: photoToSend,
          technicianId: broadcastMode ? undefined : selectedTechId || undefined,
          broadcast: broadcastMode,
        });
        imageRef = uploaded.path;
      }

      const res = await fetch('/api/messages', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          broadcastMode
            ? {
                broadcast: true,
                body: textToSend || null,
                imageRef,
                clientMsgId,
              }
            : {
                technicianId: selectedTechId,
                body: textToSend || null,
                imageRef,
                clientMsgId,
              }
        ),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.error || msgT.sendFailed);
      }

      if (photoToSend?.previewUrl) {
        URL.revokeObjectURL(photoToSend.previewUrl);
      }

      if (broadcastMode) {
        const sentTo = typeof json.sentTo === 'number' ? json.sentTo : activeTechCount;
        toast.success(formatMsgTemplate(msgT.broadcastSentToast, { count: sentTo }));
        await loadThreads(true);
      } else if (json.message) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === json.message.id || m.clientMsgId === json.message.clientMsgId)) {
            return prev;
          }
          return [...prev, json.message];
        });
        setTimeout(() => scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 30);
        await loadThreads(true);
      }
    } catch (err: any) {
      // Revert inputs so user never loses their message
      setComposerText(textToSend);
      if (photoToSend) setPendingPhoto(photoToSend);
      toast.error(err?.message || msgT.sendFailed);
    } finally {
      setSending(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    router.replace('/login');
  };

  const filteredThreads = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return threads;
    return threads.filter(
      (th) =>
        th.fullName.toLowerCase().includes(q) ||
        (th.employeeId || '').toLowerCase().includes(q)
    );
  }, [threads, searchQuery]);

  const selectedThread = useMemo(
    () => threads.find((th) => th.technicianId === selectedTechId) || null,
    [threads, selectedTechId]
  );

  const showMobileThread = Boolean(selectedTechId || broadcastMode);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#FFF8F2] text-[#1C1917]">
      <AdminSidebar
        activeTab="MESSAGES"
        onSelectTab={() => router.push('/dashboard')}
        isMobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        company={{ name: orgName || 'VigilAMC' }}
        userEmail={userEmail}
        userProfile={userProfile}
        onLogout={handleLogout}
        unreadMessagesCount={totalUnread}
        currentLanguage={currentLanguage}
        t={adminT}
      />

      <main className="flex-1 min-w-0 h-full flex flex-col bg-white">
        {/* Top bar (fixed height to avoid CLS) */}
        <header className="h-14 shrink-0 border-b border-[#E7E5E4] px-3 sm:px-5 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-[#44403C] hover:bg-[#FFF0E6] hover:text-[#C2410C]"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base sm:text-lg font-extrabold text-[#1C1917] truncate">
              {msgT.navMessages}
            </h1>
            {totalUnread > 0 && (
              <span
                data-testid="messages-header-unread"
                className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-[#C2410C] text-white"
              >
                {totalUnread}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              data-testid="dashboard-sound-toggle"
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                setMessageSoundEnabled('DASHBOARD', next);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[#E7E5E4] bg-white hover:bg-[#FFF0E6] text-xs font-bold text-[#1C1917] transition-colors"
              aria-label={soundT.soundToggleTitle}
              title={soundT.soundToggleTitle}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-[#C2410C]" />
              ) : (
                <VolumeX className="w-4 h-4 text-[#57534E]" />
              )}
              <span className="hidden sm:inline">
                {soundEnabled ? soundT.soundOn : soundT.soundOff}
              </span>
            </button>

            {!isOnline && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FEF3C7] text-[#92400E] text-xs font-bold">
                <WifiOff className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{msgT.offlinePhotoHint}</span>
              </div>
            )}
          </div>
        </header>

        {/* Split Messaging Body */}
        <div className="flex-1 min-h-0 flex overflow-hidden">
          {/* LEFT PANE: Broadcast row + Technician List */}
          <aside
            data-testid="dashboard-thread-list"
            className={`${
              showMobileThread ? 'hidden md:flex' : 'flex'
            } w-full md:w-80 lg:w-88 shrink-0 flex-col border-r border-[#E7E5E4] bg-[#FFFDFB] h-full`}
          >
            {/* Broadcast to all row pinned on top */}
            <div className="p-3 border-b border-[#E7E5E4]">
              <button
                type="button"
                data-testid="broadcast-row-btn"
                onClick={() => {
                  setBroadcastMode(true);
                  setSelectedTechId(null);
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors border ${
                  broadcastMode
                    ? 'bg-[#FEE6E0] border-[#EA580C] text-[#1C1917]'
                    : 'bg-white border-[#FED7AA] hover:bg-[#FFF8F2] text-[#1C1917]'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-[#EA580C] text-white flex items-center justify-center shrink-0">
                  <BroadcastIcon className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-[#1C1917] truncate">
                    {msgT.broadcastToAll}
                  </div>
                  <div className="text-xs font-medium text-[#44403C] truncate">
                    {formatMsgTemplate(msgT.broadcastConfirm, { count: activeTechCount })}
                  </div>
                </div>
              </button>
            </div>

            {/* Search bar */}
            <div className="p-3 border-b border-[#E7E5E4]">
              <div className="relative">
                <Search className="w-4 h-4 text-[#57534E] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={msgT.searchTechnicians}
                  aria-label={msgT.searchTechnicians}
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#D6D3D1] bg-white text-sm text-[#1C1917] placeholder:text-[#57534E] focus:outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/20"
                />
              </div>
            </div>

            {/* Thread list */}
            <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-[#F5F5F4]">
              {loadingThreads ? (
                <div className="p-3 space-y-3" aria-busy="true">
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} className="flex items-center gap-3 p-2 animate-pulse">
                      <div className="w-10 h-10 rounded-full bg-[#F4F4F5] shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3.5 w-28 bg-[#F4F4F5] rounded" />
                        <div className="h-3 w-40 bg-[#F4F4F5] rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : threadsError ? (
                <div className="p-5 text-center space-y-2">
                  <p className="text-sm font-bold text-[#DC2626]">{threadsError}</p>
                  <button
                    type="button"
                    onClick={() => loadThreads(false)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C2410C] text-white text-xs font-bold"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    {msgT.retry}
                  </button>
                </div>
              ) : filteredThreads.length === 0 ? (
                <div className="p-6 text-center space-y-2">
                  <ChatEmptyIllustration className="w-14 h-14 mx-auto" />
                  <p className="text-sm font-bold text-[#1C1917]">{msgT.noTechniciansTitle}</p>
                  <p className="text-xs text-[#44403C]">{msgT.noTechniciansDesc}</p>
                </div>
              ) : (
                filteredThreads.map((th) => {
                  const isSelected = !broadcastMode && selectedTechId === th.technicianId;
                  const previewText = th.lastMessage
                    ? th.lastMessage.body ||
                      (th.lastMessage.attachmentKind === 'IMAGE' ? msgT.photoLabel : '')
                    : msgT.emptyThreadTitle;
                  return (
                    <button
                      key={th.technicianId}
                      type="button"
                      data-testid={`thread-row-${th.technicianId}`}
                      onClick={() => {
                        setBroadcastMode(false);
                        setSelectedTechId(th.technicianId);
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-3 text-left transition-colors ${
                        isSelected ? 'bg-[#FFF0E6]' : 'hover:bg-[#FFF8F2]'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-[#FEE6E0] text-[#9A3412] font-extrabold text-xs flex items-center justify-center shrink-0 border border-[#FED7AA]">
                        {getInitials(th.fullName)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-bold text-[#1C1917] truncate">
                            {th.fullName}
                          </span>
                          {th.lastMessage?.createdAt && (
                            <span className="text-[11px] font-medium text-[#44403C] shrink-0">
                              {formatTimeShort(th.lastMessage.createdAt, currentLanguage)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-2 mt-0.5">
                          <span className="text-xs text-[#44403C] truncate">{previewText}</span>
                          {th.unreadCount > 0 && (
                            <span
                              data-testid={`thread-unread-${th.technicianId}`}
                              className="px-1.5 py-0.5 min-w-[20px] text-center rounded-full bg-[#C2410C] text-white text-[11px] font-extrabold shrink-0"
                            >
                              {th.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* RIGHT PANE: Active Thread or Broadcast Compose */}
          <section
            data-testid="dashboard-thread-pane"
            className={`${
              showMobileThread ? 'flex' : 'hidden md:flex'
            } flex-1 min-w-0 flex-col bg-white h-full`}
          >
            {!selectedThread && !broadcastMode ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3">
                <ChatEmptyIllustration className="w-20 h-20" />
                <h2 className="text-base font-extrabold text-[#1C1917]">
                  {msgT.selectThreadTitle}
                </h2>
                <p className="text-sm text-[#44403C] max-w-sm">{msgT.selectThreadDesc}</p>
              </div>
            ) : (
              <>
                {/* Thread header (fixed height h-14) */}
                <div className="h-14 shrink-0 border-b border-[#E7E5E4] px-3 sm:px-5 flex items-center justify-between gap-3 bg-white">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTechId(null);
                        setBroadcastMode(false);
                      }}
                      className="md:hidden p-1.5 rounded-lg text-[#44403C] hover:bg-[#FFF0E6]"
                      aria-label={msgT.backToHome}
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>

                    {broadcastMode ? (
                      <>
                        <div className="w-9 h-9 rounded-full bg-[#EA580C] text-white flex items-center justify-center shrink-0">
                          <BroadcastIcon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-extrabold text-[#1C1917] truncate">
                            {msgT.broadcastToAll}
                          </div>
                          <div className="text-xs text-[#44403C] truncate">
                            {formatMsgTemplate(msgT.broadcastConfirm, { count: activeTechCount })}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-9 h-9 rounded-full bg-[#FEE6E0] text-[#9A3412] font-extrabold text-xs flex items-center justify-center shrink-0 border border-[#FED7AA]">
                          {getInitials(selectedThread?.fullName || '')}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-extrabold text-[#1C1917] truncate">
                            {selectedThread?.fullName}
                          </div>
                          {selectedThread?.employeeId && (
                            <div className="text-xs text-[#44403C] truncate">
                              {selectedThread.employeeId}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Broadcast toggle right inside header for quick switching */}
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none shrink-0">
                    <span className="text-xs font-bold text-[#44403C] hidden sm:inline">
                      {msgT.broadcastToggleLabel}
                    </span>
                    <input
                      type="checkbox"
                      data-testid="broadcast-toggle"
                      checked={broadcastMode}
                      onChange={(e) => setBroadcastMode(e.target.checked)}
                      className="sr-only peer"
                    />
                    <span className="w-10 h-5 rounded-full bg-[#D6D3D1] peer-checked:bg-[#EA580C] relative transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5" />
                  </label>
                </div>

                {/* Messages Scroll Area */}
                <div className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-6 py-4 space-y-3 bg-[#FFFDFB]">
                  {broadcastMode ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                      <div className="w-14 h-14 rounded-2xl bg-[#FEE6E0] text-[#C2410C] flex items-center justify-center">
                        <BroadcastIcon className="w-7 h-7" />
                      </div>
                      <h2 className="text-base font-extrabold text-[#1C1917]">
                        {msgT.broadcastToAll}
                      </h2>
                      <p className="text-sm font-medium text-[#44403C] max-w-sm">
                        {formatMsgTemplate(msgT.broadcastConfirm, { count: activeTechCount })}
                      </p>
                    </div>
                  ) : loadingMessages ? (
                    <ChatSkeleton />
                  ) : messagesError ? (
                    <div className="p-6 text-center space-y-2">
                      <p className="text-sm font-bold text-[#DC2626]">{messagesError}</p>
                      <button
                        type="button"
                        onClick={() => selectedTechId && loadMessages(selectedTechId, null)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C2410C] text-white text-xs font-bold"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        {msgT.retry}
                      </button>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2.5">
                      <ChatEmptyIllustration className="w-16 h-16" />
                      <h3 className="text-sm font-extrabold text-[#1C1917]">
                        {msgT.emptyThreadTitle}
                      </h3>
                      <p className="text-xs text-[#44403C] max-w-xs">{msgT.emptyThreadDesc}</p>
                    </div>
                  ) : (
                    <>
                      {hasMore && nextCursor && (
                        <div className="flex justify-center pb-2">
                          <button
                            type="button"
                            onClick={() =>
                              selectedTechId && loadMessages(selectedTechId, nextCursor)
                            }
                            className="px-3 py-1.5 rounded-full border border-[#D6D3D1] bg-white text-xs font-bold text-[#44403C] hover:border-[#EA580C] hover:text-[#C2410C]"
                          >
                            {msgT.loadOlder}
                          </button>
                        </div>
                      )}

                      {messages.map((msg, idx) => {
                        const prev = idx > 0 ? messages[idx - 1] : null;
                        const showDateDivider =
                          !prev || getLocalDayKey(prev.createdAt) !== getLocalDayKey(msg.createdAt);

                        return (
                          <React.Fragment key={msg.id || msg.clientMsgId}>
                            {showDateDivider && (
                              <div className="flex justify-center py-1">
                                <span className="px-3 py-0.5 rounded-full bg-[#F4F4F5] text-[#44403C] text-[11px] font-bold">
                                  {formatDateDivider(msg.createdAt, msgT, currentLanguage)}
                                </span>
                              </div>
                            )}
                            <ChatBubble
                              message={msg}
                              isOwn={msg.senderRole === 'AGENCY'}
                              lang={currentLanguage}
                              t={msgT}
                              onOpenImage={(url, caption) => setLightbox({ url, caption })}
                            />
                          </React.Fragment>
                        );
                      })}
                      <div ref={scrollEndRef} />
                    </>
                  )}
                </div>

                {/* Broadcast confirm banner when toggle ON */}
                {broadcastMode && (
                  <div
                    data-testid="broadcast-confirm-row"
                    className="shrink-0 px-4 py-2 bg-[#FFF0E6] border-t border-[#FED7AA] flex items-center gap-2 text-xs font-bold text-[#9A3412]"
                  >
                    <BroadcastIcon className="w-4 h-4 shrink-0" />
                    <span>{formatMsgTemplate(msgT.broadcastConfirm, { count: activeTechCount })}</span>
                  </div>
                )}

                {/* Pending photo preview */}
                {pendingPhoto && (
                  <div className="shrink-0 px-4 py-2 bg-[#FFF8F2] border-t border-[#FED7AA] flex items-center justify-between gap-3">
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
                        <div className="text-[11px] text-[#44403C]">
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

                {/* Fixed-height Composer (CLS = 0) */}
                <form
                  onSubmit={handleSend}
                  className="h-[68px] shrink-0 border-t border-[#E7E5E4] px-3 sm:px-5 flex items-center gap-2.5 bg-white"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleSelectPhotoFile}
                    className="hidden"
                    data-testid="dashboard-photo-input"
                  />

                  <button
                    type="button"
                    data-testid="dashboard-attach-btn"
                    onClick={() => {
                      if (!isOnline) {
                        toast.info(msgT.offlinePhotoHint);
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
                    data-testid="dashboard-composer-input"
                    value={composerText}
                    onChange={(e) => setComposerText(e.target.value)}
                    maxLength={2000}
                    placeholder={pendingPhoto ? msgT.addCaption : msgT.typeMessage}
                    aria-label={pendingPhoto ? msgT.addCaption : msgT.typeMessage}
                    className="flex-1 h-11 px-4 rounded-full border border-[#D6D3D1] bg-[#FFFDFB] text-sm text-[#1C1917] placeholder:text-[#57534E] focus:outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/20"
                  />

                  <button
                    type="submit"
                    data-testid="dashboard-send-btn"
                    disabled={sending || (!composerText.trim() && !pendingPhoto)}
                    className="w-10 h-10 rounded-full bg-[#EA580C] hover:bg-[#C2410C] disabled:opacity-45 text-white flex items-center justify-center transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:ring-offset-2"
                    aria-label={msgT.send}
                    title={msgT.send}
                  >
                    <PaperPlaneIcon className="w-4 h-4" />
                  </button>
                </form>
              </>
            )}
          </section>
        </div>
      </main>

      {/* Photo Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-[#1C1917]/80 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
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
