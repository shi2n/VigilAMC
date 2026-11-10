'use client';

import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Menu,
  Mail,
  HelpCircle,
  Activity,
  Building2,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Camera,
  Layers,
  ArrowRight,
  LogOut,
  RefreshCw,
  Search,
  Check,
  Phone,
  Mic,
  MicOff,
  Wifi,
  WifiOff,
  Download,
  Flame,
  Sliders,
  Headphones,
  TrendingUp,
  Award,
  LayoutDashboard,
  Bell,
  Wrench,
  ChevronRight,
  ArrowLeft,
  PenTool,
  Lock,
  Shield,
  User,
  Sparkles,
  Eye,
  EyeOff,
  Globe,
  Navigation,
  ListTodo,
  History as HistoryIcon,
  Clock,
  Calendar,
  Crosshair,
  FileCheck2,
  Info,
  X,
  ChevronDown,
  ChevronUp,
  Trash2,
  Copy,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import {
  isNativePlatform,
  registerNativeLifecycle,
  registerNativePush,
  unregisterNativePush,
  scheduleOfflineDueReminders,
  capturePhotoNative,
  getNativeLocation,
  watchNativeLocation,
  clearNativeWatch,
} from '@/lib/native/nativeBridge';
import {
  compressPhotoToBudget,
  createInspectionThumbnail,
  compressSignatureToBudget,
  estimateDataUrlBytes,
} from '@/lib/photoPipeline';
import {
  repairOversizedOutboxItems,
} from '@/lib/offline/techOutbox';
import {
  SupportedLanguage,
  SUPPORTED_LANGUAGES,
  TRANSLATIONS,
  formatLocalizedDate,
  formatLocalizedTime,
  formatLocalizedDateTime,
} from '@/lib/i18n/technician';
import {
  enqueueOutboxItem,
  getPendingOutboxItems,
  getOutboxCount,
  setLocalCache,
  getLocalCache,
  drainOutbox,
  migrateLegacyLocalStorageQueue,
  discardOutboxItem,
  getSyncDiagnosticLogs,
  OutboxItem,
  SyncDiagnosticLog,
} from '@/lib/offline/techOutbox';
import { todayCalendarDateString, addCalendarDays, addCalendarMonths, fromDbDate, calendarDayDiff } from '@/lib/dates';

interface GPSCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  isBasementCached?: boolean;
}

interface StoredPhotoMetadata {
  url: string;
  capturedAt: number;
  dayOfWeek: string;
  latitude?: number;
  longitude?: number;
  gpsAccuracy?: number;
  gpsSource: 'LIVE' | 'BASEMENT_CACHED';
}

const COMMON_DEFECT_CHIPS = [
  { id: 'LOW_PRESSURE', label: 'Low Pressure / Refill', icon: '📉' },
  { id: 'HOSE_LEAK', label: 'Valve / Hose Leak', icon: '💧' },
  { id: 'SEAL_MISSING', label: 'Pin / Seal Missing', icon: '🔒' },
  { id: 'DAMAGED_PART', label: 'Damaged Horn / Part', icon: '⚠️' },
  { id: 'PANEL_FAULT', label: 'Battery / Panel Fault', icon: '⚡' },
  { id: 'BLOCKED_ACCESS', label: 'Missing / Blocked', icon: '🚫' },
];

export default function TechnicianPWA() {
  const router = useRouter();
  const supabase = createClient();

  // ----------------------------------------------------------------------------------
  // I18N STATE
  // ----------------------------------------------------------------------------------
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>('en');
  const [showLanguageSheet, setShowLanguageSheet] = useState(false);
  const t = useMemo(() => TRANSLATIONS[currentLang] || TRANSLATIONS.en, [currentLang]);

  // ----------------------------------------------------------------------------------
  // NAVIGATION TAB STATE (TASKS | CHECKLISTS | HISTORY)
  // ----------------------------------------------------------------------------------
  type TechNavTab = 'HOME' | 'TASKS' | 'CHECKLISTS' | 'HISTORY' | 'PROFILE';
  const [activeTab, setActiveTab] = useState<TechNavTab>('HOME');
  const [showProgressModal, setShowProgressModal] = useState<boolean>(false);
  const [showSupportModal, setShowSupportModal] = useState<boolean>(false);
  const [showSettingsSheet, setShowSettingsSheet] = useState<boolean>(false);
  const [showLocationPrePrompt, setShowLocationPrePrompt] = useState<boolean>(false);
  const [showNavDrawer, setShowNavDrawer] = useState<boolean>(false);
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);
  const [pushPermissionDenied, setPushPermissionDenied] = useState<boolean>(false);

  // ----------------------------------------------------------------------------------
  // AUTHENTICATION & PROFILE STATE
  // ----------------------------------------------------------------------------------
  const [authChecking, setAuthChecking] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isAdminTester, setIsAdminTester] = useState(false);
  const [pendingDeletionRequest, setPendingDeletionRequest] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePinInput, setDeletePinInput] = useState('');
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [cancelSubmitting, setCancelSubmitting] = useState(false);

  // In-App Login Form
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // PWA Install Prompt
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  // ----------------------------------------------------------------------------------
  // DATA STATE
  // ----------------------------------------------------------------------------------
  const [dataLoading, setDataLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [taskList, setTaskList] = useState<any[]>([]);
  const [taskFilter, setTaskFilter] = useState<'ALL' | 'OVERDUE' | 'DUE_SOON' | 'OK'>('ALL');
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [historySearch, setHistorySearch] = useState('');
  const [historyDateRange, setHistoryDateRange] = useState<'week' | 'month' | 'all'>('all');
  const [historyResultFilter, setHistoryResultFilter] = useState<'ALL' | 'PASSED' | 'FAILED' | 'SERVICE_REQUIRED'>('ALL');
  const [activePhotoViewer, setActivePhotoViewer] = useState<any | null>(null);

  // Building & Checklist Flow
  const [selectedBuilding, setSelectedBuilding] = useState<any>(null);
  const [activeFloorFilter, setActiveFloorFilter] = useState<string>('ALL');
  const [activeAssetInspection, setActiveAssetInspection] = useState<any>(null);

  // Assignment Nudge Banner (Section 8.7)
  const [assignmentNudge, setAssignmentNudge] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotificationsDrawer, setShowNotificationsDrawer] = useState<boolean>(false);

  // Freshness, Polling & Session Notification tracking
  const knownTaskIdsRef = useRef<Set<string> | null>(null);
  const [sessionNewTaskIds, setSessionNewTaskIds] = useState<Set<string>>(new Set());
  const [pullY, setPullY] = useState<number>(0);
  const [isPullRefreshing, setIsPullRefreshing] = useState<boolean>(false);
  const touchStartYRef = useRef<number>(0);


  const toggleNavDrawer = useCallback((open: boolean) => {
    if (open) {
      if (typeof window !== 'undefined') {
        window.history.pushState({ techDrawer: true }, '');
      }
      setShowNavDrawer(true);
    } else {
      setShowNavDrawer(false);
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      if (showNavDrawer) {
        setShowNavDrawer(false);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [showNavDrawer]);

  // Mark notification read handler
  const handleMarkNotificationRead = async (id?: string) => {
    try {
      const res = await fetch('/api/technician/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(id ? { id } : { markAllRead: true, markAll: true }),
      });
      if (res.ok) {
        if (id) {
          setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
        } else {
          setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        }
      }
    } catch (e) {
      console.error('Failed to mark notification read:', e);
    }
  };

  // ----------------------------------------------------------------------------------
  // LIVE GPS TRACKER
  // ----------------------------------------------------------------------------------
  const [gpsLocation, setGpsLocation] = useState<GPSCoordinates | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'LOCKING' | 'LOCKED' | 'BASEMENT_CACHED' | 'DENIED'>('LOCKING');
  const lastKnownGpsRef = useRef<GPSCoordinates | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // ----------------------------------------------------------------------------------
  // OFFLINE & SYNC LEDGER (IndexedDB techOutbox)
  // ----------------------------------------------------------------------------------
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [failedSyncCount, setFailedSyncCount] = useState(0);
  const [failedItemsList, setFailedItemsList] = useState<OutboxItem[]>([]);
  const [showFailedDetails, setShowFailedDetails] = useState(false);
  const [showSyncDiagnostics, setShowSyncDiagnostics] = useState(false);
  const [diagnosticLogs, setDiagnosticLogs] = useState<SyncDiagnosticLog[]>([]);
  const [sessionExpiredAlert, setSessionExpiredAlert] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string | null>(null);
  const [cachedDataNotice, setCachedDataNotice] = useState(false);
  const [tasksFetchError, setTasksFetchError] = useState<string | null>(null);
  const [isWrongOrigin, setIsWrongOrigin] = useState<boolean>(false);
  const [wrongOriginPreserving, setWrongOriginPreserving] = useState<boolean>(false);

  // ----------------------------------------------------------------------------------
  // INSPECTION MODAL STATE
  // ----------------------------------------------------------------------------------
  const [inspStatus, setInspStatus] = useState<'PASSED' | 'FAILED'>('PASSED');
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [pressureReading, setPressureReading] = useState('');
  const [remarks, setRemarks] = useState('');
  const [isListeningMic, setIsListeningMic] = useState(false);
  const [submittingInspection, setSubmittingInspection] = useState(false);

  // Camera & Geo-Stamped Photo State (Feature E)
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [photoMeta, setPhotoMeta] = useState<StoredPhotoMetadata | null>(null);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [photoStampConfirmed, setPhotoStampConfirmed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Guard Signature Pad
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [guardName, setGuardName] = useState('');
  const [guardDesignation, setGuardDesignation] = useState('Site Security Supervisor');
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [isDrawingSignature, setIsDrawingSignature] = useState(false);
  const sigCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Toasts
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  // Audible and Haptic notification for field technicians
  const playChimeNotification = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.15);
          gain.gain.setValueAtTime(0.18, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.35);
        }
      }
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([150, 80, 150]);
      }
    } catch {
      // Audio or vibration unavailable in background
    }
  }, []);

  // Web Notification API (PWA & browser foreground/background tray)
  const triggerWebNotification = useCallback(
    (title: string, dueDate?: string | Date) => {
      if (typeof window === 'undefined' || !('Notification' in window)) return;
      if (Notification.permission === 'granted') {
        try {
          const dueStr = dueDate
            ? ` · Due: ${formatLocalizedDate(dueDate, currentLang)}`
            : '';
          new Notification(t.pushTaskAssignedTitle || 'New Task Assigned', {
            body: `Work Order: "${title}" assigned to you${dueStr}`,
            icon: '/logo.jpg',
            tag: `vigil-task-${title}`,
          });
        } catch (e) {
          console.warn('Web notification dispatch failed:', e);
        }
      }
    },
    [currentLang, t.pushTaskAssignedTitle]
  );

  // ----------------------------------------------------------------------------------
  // 1. INITIALIZATION: LANGUAGE + OFFLINE CACHE + LEGACY MIGRATION
  // ----------------------------------------------------------------------------------
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Load preferred language from localStorage or navigator
    const savedLang = localStorage.getItem('vigil_preferred_lang') as SupportedLanguage;
    if (savedLang && TRANSLATIONS[savedLang]) {
      setCurrentLang(savedLang);
    } else {
      const navLang = navigator.language.slice(0, 2).toLowerCase() as SupportedLanguage;
      if (TRANSLATIONS[navLang]) {
        setCurrentLang(navLang);
      }
    }

    // Set online status
    setIsOnline(navigator.onLine);

    // Run legacy localStorage queue migration into IndexedDB outbox
    migrateLegacyLocalStorageQueue().then((migratedCount) => {
      if (migratedCount > 0) {
        console.log(`Migrated ${migratedCount} legacy offline inspections to IndexedDB`);
        refreshOutboxCounts();
      }
    });

    // Section 2: Auto-repair any oversized legacy items from previous sessions (e.g. 5 stuck items)
    repairOversizedOutboxItems().then((repaired) => {
      if (repaired > 0) {
        console.log(`Auto-repaired ${repaired} oversized outbox items into parent/child items`);
        refreshOutboxCounts();
      }
    });

    // Check installed mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsAppInstalled(true);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const refreshOutboxCounts = useCallback(async () => {
    const counts = await getOutboxCount();
    setPendingSyncCount(counts.pending);
    setFailedSyncCount(counts.failed);
    const pending = await getPendingOutboxItems();
    setFailedItemsList(pending.filter((i) => i.status === 'FAILED'));
  }, []);

  // ----------------------------------------------------------------------------------
  // Section 5: VISIT STAMP RECORDING (Dedupe 30m per building)
  // ----------------------------------------------------------------------------------
  const recordVisitStamp = useCallback(
    async (buildingId: string, taskId?: string) => {
      if (!buildingId || typeof window === 'undefined') return;
      const cacheKey = `vigil_visit_stamp_${buildingId}`;
      const lastStamp = sessionStorage.getItem(cacheKey);
      const now = Date.now();
      if (lastStamp && now - Number(lastStamp) < 30 * 60 * 1000) {
        return; // Dedupe: at most one visit stamp per building per 30 minutes
      }

      const clientSyncId = `VISIT-${now}-${Math.random().toString(36).slice(2, 6)}`;
      const visitPayload = {
        buildingId,
        taskId: taskId || null,
        latitude: gpsLocation?.latitude ?? lastKnownGpsRef.current?.latitude ?? null,
        longitude: gpsLocation?.longitude ?? lastKnownGpsRef.current?.longitude ?? null,
        gpsAccuracy: gpsLocation?.accuracy ?? lastKnownGpsRef.current?.accuracy ?? 8,
        arrivedAt: now,
        deviceId: 'MOBILE_PWA',
      };

      try {
        await enqueueOutboxItem({
          clientSyncId,
          actionType: 'VISIT_STAMP',
          payload: visitPayload,
          createdAt: now,
          attempts: 0,
          status: 'PENDING',
        });
        sessionStorage.setItem(cacheKey, String(now));
        await refreshOutboxCounts();
        // Silent background trigger
        drainOutbox().catch(() => {});
      } catch (err) {
        console.warn('Failed to record visit stamp:', err);
      }
    },
    [gpsLocation, refreshOutboxCounts]
  );

  // Re-request GPS on open / foreground
  const requestLiveLocation = useCallback(async () => {
    if (isNativePlatform()) {
      setGpsStatus('LOCKING');
      const nativeCoords = await getNativeLocation();
      if (nativeCoords) {
        setGpsLocation(nativeCoords);
        setGpsStatus('LOCKED');
        lastKnownGpsRef.current = nativeCoords;
        try {
          localStorage.setItem('vigil_last_known_gps', JSON.stringify(nativeCoords));
        } catch {}
        return;
      }
    }

    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setGpsStatus('DENIED');
      return;
    }
    setGpsStatus('LOCKING');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: GPSCoordinates = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy || 8),
          timestamp: pos.timestamp,
          isBasementCached: false,
        };
        setGpsLocation(coords);
        setGpsStatus('LOCKED');
        lastKnownGpsRef.current = coords;
        try {
          localStorage.setItem('vigil_last_known_gps', JSON.stringify(coords));
        } catch {}
      },
      (err) => {
        console.warn('Live location error:', err);
        if (lastKnownGpsRef.current) {
          setGpsStatus('BASEMENT_CACHED');
        } else {
          setGpsStatus('DENIED');
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );
  }, []);

  // Foreground listener: re-request live location when app comes into view
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        requestLiveLocation();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [requestLiveLocation]);

  // ----------------------------------------------------------------------------------
  // 2. CONTINUOUS GPS WATCHER (WITH BASEMENT CACHE PERSISTENCE)
  // ----------------------------------------------------------------------------------
  useEffect(() => {
    let nativeWatchId: string | null = null;
    let isCancelled = false;

    if (isNativePlatform()) {
      setGpsStatus('LOCKING');
      try {
        const savedGps = localStorage.getItem('vigil_last_known_gps');
        if (savedGps) lastKnownGpsRef.current = JSON.parse(savedGps);
      } catch {}

      watchNativeLocation(
        (coords) => {
          if (isCancelled) return;
          setGpsLocation(coords);
          setGpsStatus('LOCKED');
          lastKnownGpsRef.current = coords;
          try {
            localStorage.setItem('vigil_last_known_gps', JSON.stringify(coords));
          } catch {}
        },
        (err) => {
          if (isCancelled) return;
          console.warn('Native GPS drop:', err);
          if (lastKnownGpsRef.current) {
            setGpsLocation({ ...lastKnownGpsRef.current, isBasementCached: true });
            setGpsStatus('BASEMENT_CACHED');
          } else {
            setGpsStatus('DENIED');
          }
        }
      ).then((id) => {
        if (!isCancelled) nativeWatchId = id;
        else if (id) clearNativeWatch(id);
      });

      return () => {
        isCancelled = true;
        if (nativeWatchId) clearNativeWatch(nativeWatchId);
      };
    }

    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      setGpsStatus('LOCKING');
      try {
        const savedGps = localStorage.getItem('vigil_last_known_gps');
        if (savedGps) {
          lastKnownGpsRef.current = JSON.parse(savedGps);
        }
      } catch {}

      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const coords: GPSCoordinates = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy || 10),
            timestamp: pos.timestamp,
            isBasementCached: false,
          };
          setGpsLocation(coords);
          setGpsStatus('LOCKED');
          lastKnownGpsRef.current = coords;
          try {
            localStorage.setItem('vigil_last_known_gps', JSON.stringify(coords));
          } catch {}
        },
        (err) => {
          console.warn('Geolocation drop / basement entry:', err);
          if (lastKnownGpsRef.current) {
            setGpsLocation({
              ...lastKnownGpsRef.current,
              isBasementCached: true,
            });
            setGpsStatus('BASEMENT_CACHED');
          } else {
            setGpsStatus('DENIED');
          }
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
      );

      return () => {
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
        }
      };
    }
  }, []);

  // ----------------------------------------------------------------------------------
  // 3. DATA LOADING: LOAD LOCAL CACHE FIRST, THEN REFRESH FROM NETWORK
  // ----------------------------------------------------------------------------------
  const loadDashboardData = useCallback(async () => {
    setDataLoading(true);

    // Read LOCAL state first (instant response in basements & offline)
    const cachedTasks = await getLocalCache<any[]>('technician_tasks');
    const cachedDashboard = await getLocalCache<any>('technician_dashboard');
    const cachedHistory = await getLocalCache<any[]>('technician_history');
    const cachedProfile = await getLocalCache<any>('technician_profile');

    if (cachedProfile?.data) {
      setUserProfile(cachedProfile.data);
      if (cachedProfile.data.preferredLanguage && TRANSLATIONS[cachedProfile.data.preferredLanguage as SupportedLanguage]) {
        setCurrentLang(cachedProfile.data.preferredLanguage as SupportedLanguage);
      }
    }
    if (cachedDashboard?.data) {
      setDashboardData(cachedDashboard.data);
      setIsAdminTester(
        cachedDashboard.data.profile?.role === 'ORG_ADMIN' ||
        cachedDashboard.data.profile?.role === 'SUPER_ADMIN'
      );
    }
    if (cachedTasks?.data) {
      setTaskList(cachedTasks.data);
    }
    if (cachedHistory?.data) {
      setHistoryList(cachedHistory.data);
    }
    if (!navigator.onLine && (cachedTasks || cachedDashboard)) {
      setCachedDataNotice(true);
      setDataLoading(false);
      setAuthChecking(false);
      await refreshOutboxCounts();
      return;
    }

    try {
      // 1. Fetch Dashboard, Tasks Feed, & Notifications in parallel
      const [dashRes, tasksRes, historyRes, notifsRes] = await Promise.all([
        fetch('/api/technician/dashboard').catch(() => null),
        fetch('/api/technician/tasks').catch(() => null),
        fetch('/api/technician/history?dateRange=all').catch(() => null),
        fetch('/api/technician/notifications').catch(() => null),
      ]);

      if (dashRes && dashRes.status === 401) {
        setUserProfile(null);
        setAuthChecking(false);
        setDataLoading(false);
        return;
      }

      if (dashRes && dashRes.ok) {
        const dashJson = await dashRes.json();
        setDashboardData(dashJson);
        setUserProfile(dashJson.profile);
        setIsAdminTester(dashJson.profile?.role === 'ORG_ADMIN' || dashJson.profile?.role === 'SUPER_ADMIN');
        await setLocalCache('technician_dashboard', dashJson);
        await setLocalCache('technician_profile', dashJson.profile);

        if (dashJson.pendingDeletionRequest || dashJson.profile?.pendingDeletionRequest) {
          setPendingDeletionRequest(dashJson.pendingDeletionRequest || dashJson.profile?.pendingDeletionRequest);
        } else {
          setPendingDeletionRequest(null);
        }

        // Apply profile language if available
        if (dashJson.profile?.preferredLanguage && TRANSLATIONS[dashJson.profile.preferredLanguage as SupportedLanguage]) {
          setCurrentLang(dashJson.profile.preferredLanguage as SupportedLanguage);
        }
      }

      if (tasksRes && tasksRes.ok) {
        setTasksFetchError(null);
        const tasksJson = await tasksRes.json();
        const incomingTasks: any[] = tasksJson.tasks || [];

        // Check for newly assigned tasks (both live refresh and cache diff)
        const prevIds =
          knownTaskIdsRef.current ||
          (cachedTasks?.data && Array.isArray(cachedTasks.data)
            ? new Set(cachedTasks.data.map((t: any) => t.id))
            : null);

        if (prevIds) {
          const newAssignedTasks = incomingTasks.filter(
            (t: any) =>
              !prevIds.has(t.id) &&
              t.status !== 'COMPLETED' &&
              t.status !== 'CANCELLED'
          );

          if (newAssignedTasks.length > 0) {
            const latest = newAssignedTasks[0];
            // 1. In-app Nudge banner
            setAssignmentNudge(latest.title);
            // 2. In-app Toast
            triggerToast(t.newTaskAssignedToast.replace('{title}', latest.title));
            // 3. Mark for session NEW badge
            setSessionNewTaskIds((prev) => {
              const next = new Set(prev);
              newAssignedTasks.forEach((nt: any) => next.add(nt.id));
              return next;
            });
            // 4. Subtle audio chime + vibration
            playChimeNotification();
            // 5. System Web Notification
            triggerWebNotification(latest.title, latest.dueDate);
          }
        }

        knownTaskIdsRef.current = new Set(incomingTasks.map((t: any) => t.id));
        setTaskList(incomingTasks);
        scheduleOfflineDueReminders(incomingTasks);
        fetch('/api/technician/digest').catch(() => null);
        await setLocalCache('technician_tasks', incomingTasks);
      } else {
        setTasksFetchError('FAILED');
      }

      if (historyRes && historyRes.ok) {
        const historyJson = await historyRes.json();
        setHistoryList(historyJson.history || []);
        await setLocalCache('technician_history', historyJson.history || []);
      }

      if (notifsRes && notifsRes.ok) {
        const notifsJson = await notifsRes.json().catch(() => ({}));
        if (Array.isArray(notifsJson.notifications)) {
          const normalized = notifsJson.notifications.map((n: any) => ({
            ...n,
            isRead: n.read ?? n.isRead ?? false,
          }));
          setNotifications(normalized);
        }
      }

      setCachedDataNotice(false);
    } catch (err: any) {
      console.warn('Network load error, falling back to cached state:', err);
      setCachedDataNotice(true);
      setTasksFetchError('FAILED');
    } finally {
      setDataLoading(false);
      setAuthChecking(false);
      await refreshOutboxCounts();
    }
  }, [refreshOutboxCounts, playChimeNotification, triggerWebNotification, t.newTaskAssignedToast]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // ----------------------------------------------------------------------------------
  // 4. SYNC ENGINE: DRAIN OUTBOX IDEMPOTENTLY (Section 5.3 & Sections 2 & 4)
  // ----------------------------------------------------------------------------------
  const handleTriggerSync = useCallback(
    async (opts?: { force?: boolean; targetSyncId?: string }) => {
      if (!navigator.onLine) {
        triggerToast(t.offlineSavedToast);
        return;
      }
      if (isSyncing) return;

      setIsSyncing(true);
      try {
        const result = await drainOutbox({
          force: opts?.force ?? true,
          targetSyncId: opts?.targetSyncId,
        });
        const nowStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        setLastSyncedTime(nowStr);

        if (result.authRequired) {
          setSessionExpiredAlert(true);
          triggerToast('⚠️ Session expired — sign in to send your saved items.');
        } else if (result.syncedCount > 0) {
          setSessionExpiredAlert(false);
          triggerToast(t.allSyncedToast);
          await loadDashboardData();
        } else if (result.failedCount > 0) {
          triggerToast(`⚠ ${result.failedCount} item(s) failed sync — tap to view details.`);
        }
      } catch (err: any) {
        triggerToast(`Sync failed: ${err.message || 'Network error'}`);
      } finally {
        setIsSyncing(false);
        await refreshOutboxCounts();
      }
    },
    [isSyncing, t, loadDashboardData, refreshOutboxCounts]
  );

  // Network Online / Visibility / Window Focus / 60s Interval Auto-Sync & Task Freshness Triggers
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onOnline = () => {
      setIsOnline(true);
      triggerToast(t.networkRestoredToast);
      loadDashboardData();
      handleTriggerSync({ force: true });
    };
    const onOffline = () => {
      setIsOnline(false);
      triggerToast(t.offlineBannerMsg);
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        loadDashboardData();
        refreshOutboxCounts();
        handleTriggerSync({ force: false });
      }
    };
    const onFocus = () => {
      if (navigator.onLine) {
        loadDashboardData();
      }
    };

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', onFocus);

    // 60-second gentle polling interval when online to refresh assigned tasks and notifications
    const interval = setInterval(() => {
      if (navigator.onLine && !isSyncing) {
        if (document.visibilityState === 'visible') {
          loadDashboardData();
        }
        if (pendingSyncCount > 0) {
          handleTriggerSync({ force: false });
        }
      }
    }, 60000);

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', onFocus);
      clearInterval(interval);
    };
  }, [handleTriggerSync, loadDashboardData, pendingSyncCount, isSyncing, t]);

  // ----------------------------------------------------------------------------------
  // 5. LANGUAGE SWITCHER HANDLER (Feature D)
  // ----------------------------------------------------------------------------------
  const handleSelectLanguage = async (langCode: SupportedLanguage) => {
    setCurrentLang(langCode);
    setShowLanguageSheet(false);
    try {
      localStorage.setItem('vigil_preferred_lang', langCode);
      if (navigator.onLine) {
        await fetch('/api/technician/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ preferredLanguage: langCode }),
        }).catch(() => {});
      }
    } catch {}
  };

  // ----------------------------------------------------------------------------------
  // SERVICE WORKER REGISTRATION & WRONG-ORIGIN SELF-HEAL (Sections 1 & 8)
  // ----------------------------------------------------------------------------------
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Service Worker v2 Registration with runtime caching & offline shell
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw-field-v2.js')
        .then((reg) => {
          reg.update().catch(() => null);
        })
        .catch((err) => {
          console.warn('[sw-field-v2] Registration failed:', err);
        });
    }

    // 2. Wrong-Origin Self-Heal: detect running on non-app origin
    const hostname = window.location.hostname.toLowerCase();
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.local');
    const isCorrectOrigin = isLocal || window.location.origin === 'https://vigilamc.vercel.app';
    if (!isCorrectOrigin) {
      setIsWrongOrigin(true);
      (async () => {
        try {
          const counts = await getOutboxCount();
          if (counts.pending > 0) {
            setWrongOriginPreserving(true);
            await drainOutbox({ force: true });
          }
        } catch (err) {
          console.warn('[WrongOrigin] Outbox preservation warning:', err);
        } finally {
          setWrongOriginPreserving(false);
          await refreshOutboxCounts();
        }
      })();
    }
  }, [refreshOutboxCounts]);

  // ----------------------------------------------------------------------------------
  // 6. IN-APP MOBILE / STAFF ID LOGIN
  // ----------------------------------------------------------------------------------
  const handleInAppLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    if (!navigator.onLine) {
      setLoginError(t.offlineLoginWarning);
      setLoginLoading(false);
      return;
    }

    try {
      const rawIdent = loginIdentifier.trim();
      const rawPass = loginPassword.trim();

      // Step A: First try POST /api/technician/login
      const techRes = await fetch('/api/technician/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: rawIdent, password: rawPass }),
      });
      const techData = await techRes.json().catch(() => ({}));

      if (techRes.ok && techData.success) {
        if (techData.token) {
          localStorage.setItem('vigil_tech_token', techData.token);
        }
        setSessionExpiredAlert(false);
        triggerToast('✅ Signed in successfully!');
        await loadDashboardData();
        handleTriggerSync({ force: true });
        return;
      } else if (techRes.status === 403) {
        throw new Error(techData.error || 'This staff account has been deactivated.');
      }

      // Step B: Fallback to Supabase password login
      let resolvedEmail = rawIdent.toLowerCase();
      if (!rawIdent.includes('@')) {
        const resolveRes = await fetch('/api/auth/resolve-identifier', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: rawIdent }),
        });
        const resolveData = await resolveRes.json().catch(() => ({}));
        if (!resolveRes.ok || !resolveData.email) {
          throw new Error(resolveData.error || 'Account not found. Please check with your supervisor.');
        }
        resolvedEmail = resolveData.email.trim().toLowerCase();
      }

      const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
        email: resolvedEmail,
        password: rawPass,
      });

      if (authErr) {
        throw new Error(authErr.message || 'Invalid credentials or PIN.');
      }

      if (authData.session) {
        setSessionExpiredAlert(false);
        triggerToast('✅ Signed in successfully!');
        await loadDashboardData();
        handleTriggerSync({ force: true });
      }
    } catch (err: any) {
      setLoginError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Native Android Shell: Push notifications, FCM token registration & resume lifecycle
  useEffect(() => {
    if (!isNativePlatform()) return;

    const unbindLifecycle = registerNativeLifecycle(async () => {
      await loadDashboardData();
    });

    registerNativePush({
      onNotificationReceived: (notif) => {
        triggerToast(`🔔 ${notif.title || 'Task Notification'}`);
        fetch('/api/technician/notifications')
          .then((r) => r.json())
          .then((d) => {
            if (d.notifications) setNotifications(d.notifications);
          })
          .catch(() => null);
      },
      onNotificationTapped: (action) => {
        const taskId = action.notification?.data?.taskId;
        if (taskId) {
          setActiveTab('TASKS');
        }
      },
    });

    return () => {
      unbindLifecycle();
    };
  }, [loadDashboardData]);


  // ----------------------------------------------------------------------------------
  // ACCOUNT DELETION HANDLERS (DPDP Act 2023 Right-to-Erasure)
  // ----------------------------------------------------------------------------------
  const handleRequestDeletion = async () => {
    if (!deletePinInput || !deletePinInput.trim()) {
      triggerToast(t.pinRequiredToast || 'Please enter your 6-digit PIN');
      return;
    }
    setDeleteSubmitting(true);
    try {
      const res = await fetch('/api/technician/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request', pin: deletePinInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        triggerToast(data.error || 'Failed to submit deletion request');
        return;
      }
      setPendingDeletionRequest(data.request || { status: 'PENDING' });
      setShowDeleteModal(false);
      setDeletePinInput('');
      triggerToast(t.deletionRequestedToast || 'Account deletion request submitted');
    } catch (err: any) {
      triggerToast(err.message || 'Network error while requesting deletion');
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const handleCancelDeletion = async () => {
    setCancelSubmitting(true);
    try {
      const res = await fetch('/api/technician/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      });
      const data = await res.json();
      if (!res.ok) {
        triggerToast(data.error || 'Failed to cancel deletion request');
        return;
      }
      setPendingDeletionRequest(null);
      triggerToast(t.deletionCancelledToast || 'Account deletion request cancelled');
    } catch (err: any) {
      triggerToast(err.message || 'Network error while cancelling deletion');
    } finally {
      setCancelSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    try {
      localStorage.removeItem('vigil_tech_token');
      await unregisterNativePush().catch(() => null);
      await fetch('/api/technician/logout', { method: 'POST' }).catch(() => {});
      await supabase.auth.signOut().catch(() => {});
    } finally {
      setUserProfile(null);
      setDashboardData(null);
      setSelectedBuilding(null);
      setActiveAssetInspection(null);
      triggerToast('Signed out');
    }
  };

  const handleInstallApp = async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      const choice = await deferredInstallPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsAppInstalled(true);
        setDeferredInstallPrompt(null);
      }
    } else {
      triggerToast('📱 Open browser menu & select "Add to Home Screen"');
    }
  };

  // ----------------------------------------------------------------------------------
  // 7. FEATURE E: PHOTO STAMP UPGRADE (TIME + DAY + GPS IN PIXELS AND STORED)
  // ----------------------------------------------------------------------------------
  const processPhotoFile = async (file: File) => {
    try {
      setIsProcessingPhoto(true);
      setPhotoStampConfirmed(false);

      const originalSize = file.size;
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = objectUrl;
      });

      // Section 8.3: Cap longest edge at 1600px for data-light transfer
      const maxDim = 1600;
      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      ctx.drawImage(img, 0, 0, width, height);

      // Current capture metadata (authoritative)
      const now = new Date();
      const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
      const dayOfWeek = dayNames[now.getDay()];

      // Section 6.1: High contrast charcoal (#1C1917) bar at bottom, height ~110px on 1600px
      const barHeight = Math.max(76, Math.round(height * 0.11));
      ctx.fillStyle = 'rgba(28, 25, 23, 0.94)';
      ctx.fillRect(0, height - barHeight, width, barHeight);

      const bldgName = selectedBuilding?.name || 'VigilAMC Site Inspection';
      const assetCode = activeAssetInspection?.qrCode || activeAssetInspection?.id || 'Fire Unit';

      // Line 1: VigilAMC Verified • Building • Asset Tag
      const line1 = `VigilAMC Verified • ${bldgName} • ${assetCode}`;

      // Line 2: DAY + full date + time (IST) e.g. "Mon • 12 Oct 2026 • 10:42:07 IST"
      const dateStr = formatLocalizedDateTime(now, currentLang);
      const line2 = `${dayOfWeek} • ${dateStr} IST`;

      // Line 3: GPS Coordinates (6 decimal places) or Cached basement notice
      let line3 = 'GPS Locked • Site Verified';
      const isBasement = gpsLocation?.isBasementCached || gpsStatus === 'BASEMENT_CACHED';
      if (gpsLocation?.latitude && gpsLocation?.longitude) {
        const lat = gpsLocation.latitude.toFixed(6);
        const lng = gpsLocation.longitude.toFixed(6);
        const acc = Math.round(gpsLocation.accuracy || 8);
        if (isBasement) {
          const cacheMin = Math.max(1, Math.round((Date.now() - gpsLocation.timestamp) / 60000));
          line3 = `GPS cached ${cacheMin}m ago • ${lat}, ${lng} (±${acc}m)`;
        } else {
          line3 = `${lat}, ${lng} (±${acc}m)`;
        }
      } else if (lastKnownGpsRef.current) {
        const lat = lastKnownGpsRef.current.latitude.toFixed(6);
        const lng = lastKnownGpsRef.current.longitude.toFixed(6);
        line3 = `GPS cached (gate) • ${lat}, ${lng} (±${lastKnownGpsRef.current.accuracy}m)`;
      }

      const fontSize1 = Math.max(13, Math.round(barHeight * 0.28));
      const fontSize2 = Math.max(11, Math.round(barHeight * 0.22));

      // Draw Line 1 (Ember orange)
      ctx.fillStyle = '#FF8C42';
      ctx.font = `bold ${fontSize1}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.fillText(line1, 20, height - barHeight * 0.64);

      // Draw Line 2 (White)
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `${fontSize2}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.fillText(`🕒 ${line2}`, 20, height - barHeight * 0.36);

      // Draw Line 3 (Light emerald / amber)
      ctx.fillStyle = isBasement ? '#FBBF24' : '#34D399';
      ctx.font = `bold ${fontSize2}px monospace`;
      ctx.fillText(`📍 ${line3}`, 20, height - barHeight * 0.12);

      // Section 2.1: Hard Client-Side Size Budget: Compress photo until <= 300KB
      const compRes = await compressPhotoToBudget(canvas, 300 * 1024);
      const watermarkedWebP = compRes.dataUrl;
      setCapturedPhotoUrl(watermarkedWebP);

      // Section 6.2: Save STORED metadata
      const meta: StoredPhotoMetadata = {
        url: watermarkedWebP,
        capturedAt: now.getTime(),
        dayOfWeek,
        latitude: gpsLocation?.latitude || lastKnownGpsRef.current?.latitude,
        longitude: gpsLocation?.longitude || lastKnownGpsRef.current?.longitude,
        gpsAccuracy: gpsLocation?.accuracy || lastKnownGpsRef.current?.accuracy,
        gpsSource: isBasement ? 'BASEMENT_CACHED' : 'LIVE',
      };
      setPhotoMeta(meta);
      setPhotoStampConfirmed(true);

      URL.revokeObjectURL(objectUrl);

      // Section 8.3: Toast compressed size savings
      const approxCompressedBytes = Math.round((watermarkedWebP.length * 3) / 4);
      const savedBytes = Math.max(0, originalSize - approxCompressedBytes);
      const savedMb = (savedBytes / (1024 * 1024)).toFixed(1);
      triggerToast(
        savedBytes > 100000
          ? `${t.stampedConfirmed} (${savedMb} MB saved)`
          : t.stampedConfirmed
      );
    } catch (err: any) {
      console.error('Error stamping photo:', err);
      triggerToast('Error capturing photo. Please try again.');
    } finally {
      setIsProcessingPhoto(false);
    }
  };

  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processPhotoFile(file);
    }
  };

  const handleCameraTrigger = async () => {
    if (isNativePlatform()) {
      try {
        setIsProcessingPhoto(true);
        const nativeFile = await capturePhotoNative();
        if (nativeFile) {
          await processPhotoFile(nativeFile);
        }
      } catch (err) {
        console.warn('Native camera capture error:', err);
      } finally {
        setIsProcessingPhoto(false);
      }
    } else {
      fileInputRef.current?.click();
    }
  };

  // ----------------------------------------------------------------------------------
  // 8. VOICE-TO-TEXT MIC HANDLER (Feature 7.2)
  // ----------------------------------------------------------------------------------
  const toggleSpeechRecognition = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      triggerToast(t.voiceUnavailable);
      return;
    }

    if (isListeningMic) {
      setIsListeningMic(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      // Map to selected language's BCP-47 tag
      const langMeta = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang);
      recognition.lang = langMeta?.bcp47 || 'hi-IN';

      recognition.onstart = () => {
        setIsListeningMic(true);
        triggerToast(`🎤 ${t.micListening} (${langMeta?.name || 'Speech'})`);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setRemarks((prev) => (prev ? `${prev} • ${transcript}` : transcript));
        setIsListeningMic(false);
        triggerToast('✓ Voice note captured!');
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition error:', e);
        setIsListeningMic(false);
        triggerToast(t.voiceUnavailable);
      };

      recognition.onend = () => {
        setIsListeningMic(false);
      };

      recognition.start();
    } catch {
      setIsListeningMic(false);
      triggerToast(t.voiceUnavailable);
    }
  };

  // ----------------------------------------------------------------------------------
  // 9. SUBMIT CHECK SHEET: ENQUEUE TO OUTBOX & ATTEMPT SYNC (Section 2 Rework)
  // ----------------------------------------------------------------------------------
  const handleSubmitChecksheet = async () => {
    if (!selectedBuilding || !activeAssetInspection) return;
    setSubmittingInspection(true);

    const clientSyncId = `SYNC-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const nowTs = Date.now();
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    // Section 2.1: Generate small thumbnail for instant admin preview (<= 50KB)
    let thumbnailDataUrl: string | undefined = undefined;
    if (capturedPhotoUrl) {
      try {
        thumbnailDataUrl = await createInspectionThumbnail(capturedPhotoUrl, 50 * 1024);
      } catch {
        thumbnailDataUrl = undefined;
      }
    }

    // COMPLETE_INSPECTION payload carries NO full photos (only lightweight thumbnail + metadata)
    const inspectionPayload = {
      clientSyncId,
      buildingId: selectedBuilding.id,
      equipmentId: activeAssetInspection.id,
      status: inspStatus,
      checklist: {
        pressure: pressureReading || (inspStatus === 'PASSED' ? 'NORMAL' : 'LOW'),
        condition: inspStatus === 'PASSED' ? 'GOOD' : 'NEEDS_ATTENTION',
        issues: selectedIssues,
      },
      remarks: remarks.trim(),
      photoDataUrl: thumbnailDataUrl || undefined,
      photos: thumbnailDataUrl ? [thumbnailDataUrl] : [],
      hasExternalPhotos: Boolean(capturedPhotoUrl),
      technicianSignature: signatureDataUrl || undefined,
      latitude: photoMeta?.latitude ?? gpsLocation?.latitude,
      longitude: photoMeta?.longitude ?? gpsLocation?.longitude,
      gpsAccuracy: photoMeta?.gpsAccuracy ?? gpsLocation?.accuracy,
      gpsSource: photoMeta?.gpsSource || (gpsStatus === 'BASEMENT_CACHED' ? 'BASEMENT_CACHED' : 'LIVE'),
      capturedAt: photoMeta?.capturedAt || nowTs,
      dayOfWeek: photoMeta?.dayOfWeek || dayNames[new Date().getDay()],
      technicianName: userProfile?.fullName || 'Field Technician',
      issueChips: selectedIssues,
      createdAt: nowTs,
    };

    try {
      // 1. Enqueue parent COMPLETE_INSPECTION item (<= 150KB body)
      const outboxItem: OutboxItem = {
        clientSyncId,
        actionType: 'COMPLETE_INSPECTION',
        payload: inspectionPayload,
        createdAt: nowTs,
        attempts: 0,
        status: 'PENDING',
      };
      await enqueueOutboxItem(outboxItem);

      // 2. Enqueue child UPLOAD_PHOTO item carrying the full compressed photo (<= 300KB)
      if (capturedPhotoUrl) {
        const photoSyncId = `PHOTO-${clientSyncId}`;
        const photoItem: OutboxItem = {
          clientSyncId: photoSyncId,
          actionType: 'UPLOAD_PHOTO',
          parentClientSyncId: clientSyncId,
          payload: {
            parentClientSyncId: clientSyncId,
            photoDataUrl: capturedPhotoUrl,
            category: 'GAUGE',
            caption: remarks.trim() || 'Field Inspection Photo',
            equipmentId: activeAssetInspection.id,
            buildingId: selectedBuilding.id,
            capturedAt: photoMeta?.capturedAt || nowTs,
            latitude: inspectionPayload.latitude,
            longitude: inspectionPayload.longitude,
            gpsAccuracy: inspectionPayload.gpsAccuracy,
            gpsSource: inspectionPayload.gpsSource,
          },
          createdAt: nowTs + 5,
          attempts: 0,
          status: 'PENDING',
        };
        await enqueueOutboxItem(photoItem);
      }

      await refreshOutboxCounts();

      // 2. Optimistically update local tasks & history
      const localHistoryEntry = {
        id: clientSyncId,
        source: 'INSPECTION',
        date: new Date(nowTs).toISOString(),
        building: {
          id: selectedBuilding.id,
          name: selectedBuilding.name,
          address: selectedBuilding.address,
        },
        assetTag: activeAssetInspection.qrCode || activeAssetInspection.id,
        equipmentType: activeAssetInspection.type || 'Fire Unit',
        floorZone: activeAssetInspection.floorZone || 'Main Zone',
        result: inspStatus,
        remarks: remarks.trim(),
        photos: capturedPhotoUrl
          ? [
              {
                id: `local-photo-${clientSyncId}`,
                photoUrl: capturedPhotoUrl,
                caption: remarks.trim() || null,
                capturedAt: new Date(photoMeta?.capturedAt || nowTs).toISOString(),
                dayOfWeek: photoMeta?.dayOfWeek || dayNames[new Date().getDay()],
                latitude: inspectionPayload.latitude,
                longitude: inspectionPayload.longitude,
                gpsAccuracy: inspectionPayload.gpsAccuracy,
                gpsSource: inspectionPayload.gpsSource,
              },
            ]
          : [],
        syncStatus: navigator.onLine ? 'SYNCED' : 'PENDING',
      };

      setHistoryList((prev) => [localHistoryEntry, ...prev]);
      setTaskList((prev) =>
        prev.map((t) => {
          if (t.equipmentId === activeAssetInspection.id) {
            return { ...t, status: 'COMPLETED', completedAt: new Date(nowTs).toISOString() };
          }
          return t;
        })
      );

      closeInspectionModal();

      if (!navigator.onLine) {
        triggerToast(t.offlineSavedToast);
      } else {
        triggerToast(t.allSyncedToast);
        handleTriggerSync({ force: true });
      }
    } catch (err: any) {
      console.error('Failed to enqueue inspection:', err);
      triggerToast('Error saving inspection. Please try again.');
    } finally {
      setSubmittingInspection(false);
    }
  };

  const closeInspectionModal = () => {
    setActiveAssetInspection(null);
    setCapturedPhotoUrl(null);
    setPhotoMeta(null);
    setPhotoStampConfirmed(false);
    setRemarks('');
    setSelectedIssues([]);
  };

  // ----------------------------------------------------------------------------------
  // 10. TASK STATUS ACTION HANDLER (Start -> IN_PROGRESS, Open Checklist)
  // ----------------------------------------------------------------------------------
  const handleTaskStatusChange = async (task: any, newStatus: string) => {
    try {
      // Optimistic local update
      setTaskList((prev) =>
        prev.map((item) => (item.id === task.id ? { ...item, status: newStatus } : item))
      );

      if (newStatus === 'IN_PROGRESS') {
        triggerToast(t.taskStartedToast);
      }

      if (!task.id.startsWith('AMC-')) {
        const clientSyncId = `SYNC-WO-${task.id}-${Date.now()}`;
        const outboxItem: OutboxItem = {
          clientSyncId,
          actionType: 'UPDATE_STATUS',
          payload: { workOrderId: task.id, status: newStatus },
          createdAt: Date.now(),
          attempts: 0,
          status: 'PENDING',
        };
        await enqueueOutboxItem(outboxItem);
        await refreshOutboxCounts();

        if (navigator.onLine) {
          await fetch('/api/technician/tasks', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              taskId: task.id,
              workOrderId: task.id,
              status: newStatus,
            }),
          }).catch(() => {});
        }
      }
    } catch (err: any) {
      console.warn('Status update error:', err);
    }
  };

  // Guard Signature Pad Draw Handlers
  const startDrawingSig = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawingSignature(true);
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const drawSig = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingSignature) return;
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1C1917';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawingSig = () => {
    setIsDrawingSignature(false);
    if (sigCanvasRef.current) {
      // Section 2.1: Compress signature to WebP <= 60KB
      const sigWebP = compressSignatureToBudget(sigCanvasRef.current, 60 * 1024);
      setSignatureDataUrl(sigWebP);
    }
  };

  const clearSignature = () => {
    const canvas = sigCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
    setSignatureDataUrl(null);
  };

  const handleSubmitGuardSignoff = async () => {
    if (!selectedBuilding || !signatureDataUrl) return;
    const clientSyncId = `SIG-${Date.now()}`;
    const payload = {
      buildingId: selectedBuilding.id,
      status: 'PASSED',
      customerName: guardName || 'Site Security Guard',
      customerDesignation: guardDesignation,
      customerSignature: signatureDataUrl,
      latitude: gpsLocation?.latitude,
      longitude: gpsLocation?.longitude,
      gpsAccuracy: gpsLocation?.accuracy,
    };

    await enqueueOutboxItem({
      clientSyncId,
      actionType: 'COMPLETE_INSPECTION',
      payload,
      createdAt: Date.now(),
      attempts: 0,
      status: 'PENDING',
    });
    await refreshOutboxCounts();

    triggerToast('✍️ Site Guard sign-off submitted!');
    setShowSignatureModal(false);
    clearSignature();
    if (navigator.onLine) handleTriggerSync({ force: true });
  };

  // ----------------------------------------------------------------------------------
  // COMPUTED TASK LIST COUNTERS
  // ----------------------------------------------------------------------------------
  const activeTasks = useMemo(
    () => taskList.filter((t) => t.status !== 'CANCELLED' && t.status !== 'COMPLETED'),
    [taskList]
  );
  const overdueTasksCount = useMemo(
    () => activeTasks.filter((t) => t.dueState === 'EXPIRED').length,
    [activeTasks]
  );
  const dueSoonTasksCount = useMemo(
    () => activeTasks.filter((t) => t.dueState === 'DUE_SOON').length,
    [activeTasks]
  );
  const upcomingTasksCount = useMemo(
    () => activeTasks.filter((t) => t.dueState === 'OK').length,
    [activeTasks]
  );

  const filteredTasks = useMemo(() => {
    if (taskFilter === 'OVERDUE') return activeTasks.filter((t) => t.dueState === 'EXPIRED');
    if (taskFilter === 'DUE_SOON') return activeTasks.filter((t) => t.dueState === 'DUE_SOON');
    if (taskFilter === 'OK') return activeTasks.filter((t) => t.dueState === 'OK');
    return taskList; // Show all (including completed at bottom)
  }, [taskList, activeTasks, taskFilter]);

  const filteredAndSortedTasks = useMemo(() => {
    return [...activeTasks].sort((a: any, b: any) => {
      const rank = (state: string) => (state === 'EXPIRED' ? 0 : state === 'DUE_SOON' ? 1 : 2);
      const rA = rank(a.dueState);
      const rB = rank(b.dueState);
      if (rA !== rB) return rA - rB;
      const dueA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
      const dueB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
      return dueA - dueB;
    });
  }, [activeTasks]);

  // ----------------------------------------------------------------------------------
  // COMPUTED HISTORY LIST
  // ----------------------------------------------------------------------------------
  const filteredHistory = useMemo(() => {
    const s = historySearch.trim().toLowerCase();
    const todayStr = todayCalendarDateString();
    let minDateStr = '';
    if (historyDateRange === 'week') minDateStr = addCalendarDays(todayStr, -7);
    if (historyDateRange === 'month') minDateStr = addCalendarMonths(todayStr, -1);

    return historyList.filter((item) => {
      if (minDateStr) {
        const itemDateStr = fromDbDate(item.date);
        if (calendarDayDiff(itemDateStr, minDateStr) < 0) return false;
      }
      if (historyResultFilter !== 'ALL' && item.result !== historyResultFilter) return false;
      if (s) {
        const bName = (item.building?.name || '').toLowerCase();
        const tag = (item.assetTag || '').toLowerCase();
        const rem = (item.remarks || '').toLowerCase();
        if (!bName.includes(s) && !tag.includes(s) && !rem.includes(s)) return false;
      }
      return true;
    });
  }, [historyList, historySearch, historyDateRange, historyResultFilter]);

  // ----------------------------------------------------------------------------------
  // RENDER SCREEN 1: FULL SCREEN IN-APP LOGIN (If not authenticated)
  // ----------------------------------------------------------------------------------
  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#FFF8F2] text-[#1C1917] p-3 max-w-md mx-auto space-y-3 w-full max-w-full overflow-x-hidden">
        {/* Instant Skeleton Header */}
        <header className="flex items-center justify-between p-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#EA580C]/15 animate-pulse" />
            <div className="space-y-1.5">
              <div className="w-24 h-4 bg-stone-200 rounded animate-pulse" />
              <div className="w-32 h-3 bg-stone-100 rounded animate-pulse" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="w-9 h-9 rounded-full bg-stone-200 animate-pulse" />
            <div className="w-9 h-9 rounded-full bg-stone-200 animate-pulse" />
          </div>
        </header>
        {/* Skeleton Sync Pill */}
        <div className="h-9 bg-white/80 border border-[#FED7AA] rounded-xl animate-pulse" />
        {/* Skeleton Hero Card */}
        <div className="h-28 bg-stone-900/10 rounded-3xl border border-stone-200/50 animate-pulse" />
        {/* Skeleton Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="h-20 bg-white border border-[#FED7AA] rounded-2xl animate-pulse" />
          <div className="h-20 bg-white border border-[#FED7AA] rounded-2xl animate-pulse" />
        </div>
        {/* Skeleton Card List */}
        <div className="space-y-2 pt-1">
          <div className="h-16 bg-white border border-[#FED7AA] rounded-2xl animate-pulse" />
          <div className="h-16 bg-white border border-[#FED7AA] rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div
        className="relative min-h-screen bg-[#FFF8F2] text-[#1C1917] flex flex-col justify-center px-4 py-8 overflow-hidden w-full max-w-full"
        style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #FFF8F2 42%, #FFE8D6 100%)' }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[420px] h-[360px] rounded-full overflow-hidden"
          style={{
            background:
              'radial-gradient(circle, rgba(232, 89, 12, 0.22) 0%, rgba(255, 140, 66, 0.15) 48%, rgba(255, 248, 242, 0) 74%)',
            filter: 'blur(85px)',
          }}
        />

        <div className="relative z-10 max-w-md w-full mx-auto space-y-6">
          {/* Wrong-Origin Warning Banner on Login */}
          {isWrongOrigin && (
            <div data-testid="wrong-origin-banner" className="p-3.5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 text-xs shadow-xs space-y-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="font-bold">{t.wrongOriginNotice || 'Please reopen from the app icon or use the app link'}</p>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    {wrongOriginPreserving
                      ? (t.wrongOriginFlushing || 'Preserving saved records...')
                      : `Opened on ${typeof window !== 'undefined' ? window.location.origin : ''}. Field data and session belong to the installed app.`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <a
                  href="https://vigilamc.vercel.app/technician"
                  className="px-3 py-1.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs shadow-xs inline-flex items-center gap-1.5 active:scale-95 transition-all"
                >
                  <span>{t.wrongOriginOpenApp || 'Open Field App'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {/* Language Selector Pill on Login */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowLanguageSheet(true)}
              className="px-3 py-1.5 rounded-full bg-white border border-[#FED7AA] text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-xs hover:border-[#EA580C]"
            >
              <Globe className="w-3.5 h-3.5 text-[#C2410C]" />
              <span>{SUPPORTED_LANGUAGES.find((l) => l.code === currentLang)?.nativeName || 'English'}</span>
            </button>
          </div>

          <div className="text-center space-y-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo-tile-192.png"
              alt="VigilAMC Logo"
              width={48}
              height={48}
              className="w-12 h-12 object-cover mx-auto rounded-xl shadow-md"
            />
            <h1 className="text-2xl font-black tracking-tight text-slate-900">VigilAMC Field Operations</h1>
            <p className="text-xs text-slate-600 font-medium">{t.welcomeBack} • Pan-India Fire AMC Platform</p>
          </div>

          {/* Offline Notice if Disconnected */}
          {!isOnline && (
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3.5 text-xs text-amber-900 flex items-start gap-2 shadow-xs">
              <WifiOff className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{t.offlineLoginWarning}</span>
            </div>
          )}

          {/* Login Card */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
            <div className="border-b border-[#FED7AA] pb-3">
              <h2 className="text-base font-bold text-slate-900">Mobile / Staff ID Sign In</h2>
              <p className="text-xs text-slate-500">Enter your 10-digit Phone, Staff ID, or Admin Email + PIN</p>
            </div>

            {loginError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span className="font-semibold">{loginError}</span>
              </div>
            )}

            <form onSubmit={handleInAppLogin} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1.5 text-[11px]">
                  Mobile / Staff ID / Email *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="e.g. 9876543210 or TECH-101"
                    className="w-full pl-10 pr-3 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C2410C] focus:border-[#C2410C] font-mono shadow-sm min-h-[48px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1.5 text-[11px]">
                  6-Digit Login PIN / Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full pl-10 pr-10 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C2410C] focus:border-[#C2410C] font-mono tracking-widest shadow-sm min-h-[48px]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="btn-flame w-full min-h-[52px] py-3.5 bg-[#C2410C] hover:bg-[#9A3412] text-white font-black text-sm rounded-2xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loginLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Enter Field App</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Language Bottom Sheet on Login */}
        {showLanguageSheet && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-white border border-[#FED7AA] rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#FED7AA] pb-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-[#C2410C]" />
                  <h3 className="text-base font-bold text-slate-900">{t.chooseLanguage}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLanguageSheet(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5 max-h-[60vh] overflow-y-auto">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleSelectLanguage(lang.code)}
                    className={`min-h-[50px] p-3 rounded-2xl text-left border flex flex-col justify-center transition-all ${
                      currentLang === lang.code
                        ? 'bg-[#FFF0E6] border-[#C2410C] shadow-xs ring-2 ring-[#C2410C]/20'
                        : 'bg-white border-slate-200 hover:border-[#FED7AA]'
                    }`}
                  >
                    <span className="text-sm font-bold text-slate-900">{lang.nativeName}</span>
                    <span className="text-[10px] text-slate-500 font-medium">{lang.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ----------------------------------------------------------------------------------
  // RENDER SCREEN 2: STANDALONE TECHNICIAN APP SHELL
  // ----------------------------------------------------------------------------------
  const assignedBuildings = dashboardData?.assignedBuildings || [];
  const selectedBldgEquipments = selectedBuilding?.equipments || [];
  const availableFloors = Array.from(
    new Set(selectedBldgEquipments.map((eq: any) => eq.floorZone).filter(Boolean))
  ) as string[];
  const filteredAssets = selectedBldgEquipments.filter((eq: any) => {
    if (activeFloorFilter === 'ALL') return true;
    return eq.floorZone === activeFloorFilter;
  });

  return (
    <div
      className="relative min-h-screen bg-[#FFF8F2] text-[#1C1917] flex flex-col justify-between selection:bg-[#EA580C]/20 w-full max-w-full overflow-x-hidden"
      style={{
        backgroundImage:
          'radial-gradient(circle at 50% 12%, rgba(232, 89, 12, 0.16) 0%, rgba(255, 140, 66, 0.10) 36%, rgba(255, 248, 242, 0) 70%)',
      }}
    >
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#1C1917] text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold border border-white/20">
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Container constrained to mobile max-w-md */}
      <div
        className="max-w-md w-full mx-auto flex-1 flex flex-col pb-8 overflow-x-hidden"
        onTouchStart={(e) => {
          if (typeof window !== 'undefined' && window.scrollY === 0) {
            touchStartYRef.current = e.touches[0].clientY;
          } else {
            touchStartYRef.current = 0;
          }
        }}
        onTouchMove={(e) => {
          if (touchStartYRef.current > 0 && typeof window !== 'undefined' && window.scrollY === 0) {
            const currentY = e.touches[0].clientY;
            const diff = currentY - touchStartYRef.current;
            if (diff > 0) {
              setPullY(Math.min(diff * 0.45, 80));
            }
          }
        }}
        onTouchEnd={async () => {
          if (pullY > 45 && !isPullRefreshing) {
            setIsPullRefreshing(true);
            setPullY(45);
            try {
              await loadDashboardData();
            } finally {
              setTimeout(() => {
                setIsPullRefreshing(false);
                setPullY(0);
              }, 400);
            }
          } else {
            setPullY(0);
          }
          touchStartYRef.current = 0;
        }}
      >
        {pullY > 0 && (
          <div
            className="flex items-center justify-center gap-2 py-2 text-xs font-bold text-[#EA580C] bg-[#FFF0E6] border-b border-[#FED7AA] transition-all"
            style={{ height: `${pullY}px`, overflow: 'hidden' }}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPullRefreshing ? 'animate-spin' : ''}`} />
            <span>{isPullRefreshing ? (t.syncing || 'Refreshing...') : 'Pull down to refresh'}</span>
          </div>
        )}
        {/* =========================================================================
            TOP APP HEADER (Section 3.1: Logo tile + wordmark + circular buttons + avatar)
        ========================================================================= */}
        <header className="sticky top-0 z-40 glass-panel-dense border-t-0 border-x-0 p-3 space-y-2.5 bg-white/95 backdrop-blur-md">
          {/* Top Bar: Logo, Wordmark, and Circular Actions */}
          <div className="flex items-center justify-between gap-1.5 sm:gap-2 min-w-0">
            <div className="flex items-center gap-2.5">
              {selectedBuilding ? (
                <button
                  type="button"
                  onClick={() => setSelectedBuilding(null)}
                  className="w-10 h-10 rounded-full bg-slate-100 border border-[#FED7AA] text-slate-700 hover:text-slate-900 flex items-center justify-center shrink-0 active:scale-95 transition-transform"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => toggleNavDrawer(true)}
                  aria-label={t.navMenu || 'Open Navigation Menu'}
                  title={t.navMenu || 'Open Navigation Menu'}
                  className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#EA580C] to-[#C2410C] text-white flex items-center justify-center shadow-xs shrink-0 active:scale-95 transition-transform"
                >
                  <Menu className="w-5 h-5 stroke-[2.5]" />
                </button>
              )}

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-black text-base text-[#1C1917] tracking-tight">
                    VigilAMC
                  </span>
                  <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded-md bg-[#FFF0E6] text-[#C2410C] border border-[#FED7AA]">
                    TECH
                  </span>
                </div>
                <p className="text-[10px] text-[#78716C] font-medium truncate max-w-[140px] sm:max-w-[180px]">
                  {userProfile?.agencyName || 'Fire AMC Operations'}
                </p>
              </div>
            </div>

            {/* Right Circular Buttons (Notification Bell, Language, Logout, Avatar) */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Notification Bell */}
              <button
                type="button"
                onClick={() => setShowNotificationsDrawer(true)}
                className="relative w-9 h-9 rounded-full bg-white border border-[#FED7AA] text-slate-700 hover:border-[#EA580C] flex items-center justify-center shadow-xs active:scale-95 transition-transform"
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4 text-[#C2410C]" />
                {notifications.some((n: any) => !n.isRead) && (
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#EA580C] border-2 border-white animate-pulse" />
                )}
              </button>

              {/* Language Selector */}
              <button
                type="button"
                onClick={() => setShowLanguageSheet(true)}
                className="w-9 h-9 rounded-full bg-white border border-[#FED7AA] text-slate-700 hover:border-[#EA580C] flex items-center justify-center shadow-xs active:scale-95 transition-transform"
                title="Change Language"
                aria-label="Change Language"
              >
                <Globe className="w-4 h-4 text-[#C2410C]" />
              </button>

              {/* Admin Portal Link for testers */}
              {isAdminTester && (
                <Link
                  href="/dashboard"
                  className="px-2 py-1 rounded-full bg-[#FFF0E6] text-[#C2410C] border border-[#FED7AA] text-[10px] font-bold"
                >
                  Admin
                </Link>
              )}

              {/* Logout Button */}
              <button
                type="button"
                onClick={handleSignOut}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 flex items-center justify-center shadow-xs active:scale-95 transition-transform"
                title={t.signOut}
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>

              {/* Avatar with Online/Offline Dot */}
              <div
                onClick={() => setActiveTab('PROFILE')}
                className="relative cursor-pointer group active:scale-95 transition-transform"
                title="Technician Profile"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#EA580C] to-[#C2410C] text-white flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-xs">
                  {userProfile?.fullName?.charAt(0).toUpperCase() || 'T'}
                </div>
                <span
                  className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                    isOnline ? 'bg-emerald-500' : 'bg-slate-400'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Sync Confidence Pill (Feature C.5 & Section 8.2) */}
          <div onClick={() => setShowSyncDiagnostics(true)} className="cursor-pointer hover:bg-white active:scale-[0.99] transition-all flex items-center justify-between px-3 py-1.5 rounded-xl bg-white/80 border border-[#FED7AA] text-[11px]" title="Tap to view Sync Diagnostics">
            <div className="flex items-center gap-2 truncate">
              {isOnline ? (
                pendingSyncCount > 0 ? (
                  <span className="text-amber-700 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span>{t.syncWaiting.replace('{n}', String(pendingSyncCount))}</span>
                  </span>
                ) : (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>{t.syncAllSynced}</span>
                  </span>
                )
              ) : (
                <span className="text-amber-800 font-bold flex items-center gap-1">
                  <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                  <span>{t.syncOfflineSaved.replace('{n}', String(pendingSyncCount))}</span>
                </span>
              )}

              {lastSyncedTime && (
                <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                  • {t.syncedAtTime.replace('{time}', lastSyncedTime)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* GPS indicator with cached age (Section 8.9) */}
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-lg border font-semibold flex items-center gap-1 ${
                  gpsStatus === 'LOCKED'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : gpsStatus === 'BASEMENT_CACHED'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                <Crosshair className="w-2.5 h-2.5" />
                {gpsStatus === 'LOCKED'
                  ? `±${gpsLocation?.accuracy || 8}m`
                  : gpsStatus === 'BASEMENT_CACHED'
                  ? 'B1 Cache'
                  : 'GPS...'}
              </span>

              {/* Manual "Sync now" button (Section 8.2) */}
              <button
                type="button"
                disabled={isSyncing}
                onClick={async () => {
                  await Promise.allSettled([
                    handleTriggerSync({ force: true }),
                    loadDashboardData(),
                  ]);
                }}
                className="px-2 py-1 rounded-lg bg-[#FFF0E6] hover:bg-[#FED7AA] text-[#C2410C] font-bold text-[10px] flex items-center gap-1 border border-[#FED7AA] active:scale-95 transition-all"
                title={t.syncNow}
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? t.syncing : t.syncNow}</span>
              </button>
            </div>
          </div>

          {/* Section 2 [A] & 4.3: Session Expired Alert with Re-Auth */}
          {sessionExpiredAlert && (
            <div className="px-3.5 py-3 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <p className="font-bold text-xs">Session expired</p>
                  <p className="text-[11px] text-amber-800">
                    Sign in to send your {pendingSyncCount} saved field items.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setUserProfile(null)}
                className="px-3 py-1.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs shrink-0 shadow-xs active:scale-95 transition-all"
              >
                Sign In
              </button>
            </div>
          )}

          {/* Section 4.5: Failed Sync Attention Strip with Expandable Error Details */}
          {failedSyncCount > 0 && (
            <div className="space-y-2">
              <div className="px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-[11px] text-red-800 flex items-center justify-between gap-2 shadow-xs">
                <span className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span>{t.syncFailed.replace('{n}', String(failedSyncCount))}</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowFailedDetails((prev) => !prev)}
                    className="font-bold text-[10px] text-red-700 underline hover:text-red-900 flex items-center gap-0.5"
                  >
                    <span>{showFailedDetails ? 'Hide' : 'Details'}</span>
                    {showFailedDetails ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={isSyncing}
                    onClick={() => handleTriggerSync({ force: true })}
                    className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-black text-[10px] active:scale-95 transition-all"
                  >
                    {t.retry} all
                  </button>
                </div>
              </div>

              {/* Expandable Per-Item Failure Cards (§4.5) */}
              {showFailedDetails && (
                <div className="glass-panel p-3 rounded-2xl border border-red-200 bg-white/95 space-y-2 shadow-xs text-xs">
                  <div className="flex items-center justify-between pb-1 border-b border-red-100">
                    <span className="font-bold text-[11px] text-slate-800">
                      Sync Outbox Queue ({failedItemsList.length} failed)
                    </span>
                    <button
                      type="button"
                      onClick={async () => {
                        const logs = await getSyncDiagnosticLogs();
                        setDiagnosticLogs(logs);
                        setShowSyncDiagnostics(true);
                      }}
                      className="text-[10px] text-[#EA580C] hover:text-[#C2410C] font-bold underline"
                    >
                      View Diagnostics Log
                    </button>
                  </div>

                  {failedItemsList.length === 0 ? (
                    <p className="text-[11px] text-slate-500 py-1">No failed items in outbox.</p>
                  ) : (
                    failedItemsList.map((item) => (
                      <div
                        key={item.clientSyncId}
                        className="p-2.5 rounded-xl bg-red-50/70 border border-red-100 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-white text-slate-800 border border-slate-200">
                            {item.actionType}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(item.createdAt).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        {/* Error Message + HTTP Status (§4.5) */}
                        <div className="text-[11px] text-red-900 font-medium break-words">
                          <span className="font-bold">Error: </span>
                          <span>{item.lastError || 'Unknown processing error'}</span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-red-100/60 text-[10px]">
                          <span className="text-slate-500 font-mono">
                            {item.httpStatus ? `HTTP ${item.httpStatus}` : 'Net Dropped'} • {item.attempts}{' '}
                            {item.attempts === 1 ? 'try' : 'tries'}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={async () => {
                                if (
                                  window.confirm(
                                    'Discard this unsynced item permanently? This cannot be undone.'
                                  )
                                ) {
                                  await discardOutboxItem(item.clientSyncId);
                                  await refreshOutboxCounts();
                                  triggerToast('Item discarded');
                                }
                              }}
                              className="text-slate-500 hover:text-red-700 underline text-[10px] font-semibold"
                            >
                              Discard
                            </button>
                            <button
                              type="button"
                              disabled={isSyncing}
                              onClick={() =>
                                handleTriggerSync({ force: true, targetSyncId: item.clientSyncId })
                              }
                              className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] active:scale-95 transition-all"
                            >
                              Retry
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* Wrong-Origin Warning Banner */}
          {isWrongOrigin && (
            <div data-testid="wrong-origin-banner" className="p-3.5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 text-xs shadow-xs space-y-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="font-bold">{t.wrongOriginNotice || 'Please reopen from the app icon or use the app link'}</p>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    {wrongOriginPreserving
                      ? (t.wrongOriginFlushing || 'Preserving saved records...')
                      : `Opened on ${typeof window !== 'undefined' ? window.location.origin : ''}. Field data and session belong to the installed app.`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <a
                  href="https://vigilamc.vercel.app/technician"
                  className="px-3 py-1.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs inline-flex items-center gap-1 shadow-xs active:scale-95 transition-all"
                >
                  <span>{t.wrongOriginOpenApp || 'Open Field App'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
                {pendingSyncCount > 0 && (
                  <span className="text-[10px] text-amber-700 font-bold">
                    {pendingSyncCount} saved items preserved
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Visible Tasks Load Failure Retry Banner */}
          {tasksFetchError && (
            <div data-testid="tasks-fetch-error-banner" className="px-3.5 py-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex items-center justify-between gap-2 shadow-xs text-xs">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="font-bold">{t.tasksLoadFailed || "Couldn't load tasks"}</span>
              </div>
              <button
                type="button"
                onClick={() => loadDashboardData()}
                className="px-2.5 py-1 rounded-lg bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-[11px] shrink-0 active:scale-95 transition-all"
              >
                {t.retryLoading || 'Retry'}
              </button>
            </div>
          )}

          {/* Cached Data Offline Notice */}
          {cachedDataNotice && (
            <div className="px-3 py-1 rounded-lg bg-amber-50 border border-amber-200 text-[10px] text-amber-800 flex items-center gap-1.5 font-medium">
              <Info className="w-3 h-3 text-amber-600 shrink-0" />
              <span>{t.offlineBannerMsg}</span>
            </div>
          )}

          {/* Section 8.7: Assignment Nudge Banner */}
          {assignmentNudge && (
            <div className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 flex items-center justify-between gap-2 shadow-xs">
              <span className="font-semibold truncate">
                {t.newTaskAssignedToast.replace('{title}', assignmentNudge)}
              </span>
              <button
                type="button"
                onClick={() => setAssignmentNudge(null)}
                className="p-1 text-emerald-700 hover:text-emerald-900 font-bold"
              >
                ✕
              </button>
            </div>
          )}
        </header>

        {/* =========================================================================
            TAB: HOME SCREEN (Section 3: Redesign to match design-target.png)
        ========================================================================= */}
        {activeTab === 'HOME' && (
          <div className="p-4 space-y-4">
            {/* Friendly Location Pre-Prompt if GPS not granted (Section 5.1) */}
            {gpsStatus === 'DENIED' && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-xs text-amber-950 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <MapPin className="w-5 h-5 text-[#EA580C] shrink-0" />
                  <p className="text-[11px] leading-snug">
                    VigilAMC uses your location to prove site visits and stamp photos — only while the app is open.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={requestLiveLocation}
                  className="px-3 py-1.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs shrink-0 shadow-xs active:scale-95"
                >
                  Enable GPS
                </button>
              </div>
            )}

            {/* 3.2 WELCOME BANNER (Owner-approved dark charcoal to fire-orange gradient card) */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1C1917] via-[#292524] to-[#C2410C] p-5 text-white shadow-lg border border-[#EA580C]/20">
              {/* Subtle embossed logo watermark on right */}
              <Flame className="w-28 h-28 text-white/10 absolute -right-4 -bottom-4 rotate-12 pointer-events-none" />

              <div className="relative z-10 space-y-1">
                <span className="text-xs text-slate-300 font-normal">Welcome back,</span>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-1.5">
                  <span>{userProfile?.fullName?.split(' ')[0] || 'Technician'}!</span>
                  <span>👋</span>
                </h2>
                <p className="text-xs text-orange-200/90 pt-0.5">
                  {t.keepUpGoodWork || 'Keep up the great work today.'}
                </p>

                {/* GPS Status Chip on Banner (Section 5.1) */}
                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={requestLiveLocation}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold transition-all border ${
                      gpsStatus === 'LOCKED'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : gpsStatus === 'BASEMENT_CACHED'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-rose-500/25 text-rose-300 border-rose-500/40'
                    }`}
                  >
                    <Crosshair className="w-3 h-3" />
                    <span>
                      {gpsStatus === 'LOCKED'
                        ? `GPS ±${gpsLocation?.accuracy || 8}m`
                        : gpsStatus === 'BASEMENT_CACHED'
                        ? 'GPS cached 4m ago'
                        : 'Location off — tap to enable'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* 3.3 THREE STAT CARDS (White rounded-2xl, tap = deep link) */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {/* Card 1: Waiting to Sync (Orange tint) */}
              <button
                type="button"
                onClick={() => setShowFailedDetails((prev) => !prev)}
                className="p-3.5 rounded-2xl bg-white border border-[#FED7AA] shadow-xs text-left hover:border-[#EA580C] transition-all flex flex-col justify-between group active:scale-[0.98]"
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200/60 text-[#EA580C] flex items-center justify-center">
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#EA580C] transition-colors" />
                </div>
                <div className="mt-2">
                  <span className="text-xl sm:text-2xl font-black text-slate-900 block leading-tight">
                    {pendingSyncCount}
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 block truncate mt-0.5">
                    {t.waitingToSync || 'Waiting to Sync'}
                  </span>
                </div>
              </button>

              {/* Card 2: Due soon (48h) (Green tint tile, #D97706 pill semantics) */}
              <button
                type="button"
                onClick={() => {
                  setTaskFilter('DUE_SOON');
                  setActiveTab('TASKS');
                }}
                className="p-3.5 rounded-2xl bg-white border border-[#FED7AA] shadow-xs text-left hover:border-[#EA580C] transition-all flex flex-col justify-between group active:scale-[0.98]"
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-600 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#EA580C] transition-colors" />
                </div>
                <div className="mt-2">
                  <span className="text-xl sm:text-2xl font-black text-slate-900 block leading-tight">
                    {dueSoonTasksCount}
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 block truncate mt-0.5">
                    {t.dueSoon48h || 'Due soon (48h)'}
                  </span>
                </div>
              </button>

              {/* Card 3: Upcoming (Violet tint tile) */}
              <button
                type="button"
                onClick={() => {
                  setTaskFilter('OK');
                  setActiveTab('TASKS');
                }}
                className="p-3.5 rounded-2xl bg-white border border-[#FED7AA] shadow-xs text-left hover:border-[#EA580C] transition-all flex flex-col justify-between group active:scale-[0.98]"
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200/60 text-purple-600 flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#EA580C] transition-colors" />
                </div>
                <div className="mt-2">
                  <span className="text-xl sm:text-2xl font-black text-slate-900 block leading-tight">
                    {upcomingTasksCount}
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 block truncate mt-0.5">
                    {t.upcomingTasks || 'Upcoming'}
                  </span>
                </div>
              </button>
            </div>

            {/* 3.4 "MY TASKS" SECTION HEADER */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-5 bg-[#EA580C] rounded-full block" />
                <h3 className="font-display font-black text-base sm:text-lg text-slate-900">
                  {t.myTasksTab || 'My Tasks'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('TASKS')}
                className="text-xs font-bold text-[#EA580C] hover:text-[#C2410C] flex items-center gap-1 active:scale-95"
              >
                <span>{t.viewAll || 'View All'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Top Tasks Feed (Sorted overdue first) */}
            {(!isOnline || cachedDataNotice) && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold shadow-xs">
                <WifiOff className="w-3 h-3 text-slate-500" />
                <span>{t.offlineSavedDataChip || 'Offline · showing saved data'}</span>
              </div>
            )}

            <div className="space-y-3">
              {filteredAndSortedTasks.length === 0 && (
                tasksFetchError ? (
                  <div data-testid="home-tasks-fetch-error" className="p-6 text-center space-y-2 bg-amber-50/70 border border-amber-200 rounded-2xl">
                    <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
                    <h4 className="text-sm font-bold text-amber-900">{t.tasksLoadFailed || "Couldn't load tasks"}</h4>
                    <button
                      type="button"
                      onClick={() => loadDashboardData()}
                      className="px-3 py-1.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs active:scale-95 transition-all"
                    >
                      {t.retryLoading || 'Retry'}
                    </button>
                  </div>
                ) : (
                  <div className="p-6 text-center space-y-2 bg-slate-50 border border-slate-200 rounded-2xl text-slate-500 text-xs">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                    <p className="font-bold text-slate-700">{t.noTasksDue || 'No tasks due'}</p>
                  </div>
                )
              )}
              {filteredAndSortedTasks.slice(0, 4).map((task: any) => {
                const isOverdue = task.dueState === 'EXPIRED';
                const isDueSoon = task.dueState === 'DUE_SOON';
                const diff = task.diffDays ?? 0;
                const dueText = isOverdue
                  ? `Overdue by ${Math.abs(diff || 1)}d`
                  : isDueSoon
                  ? 'Due tomorrow'
                  : task.dueDate
                  ? `Due in ${Math.max(1, diff)} days`
                  : 'Scheduled';

                return (
                  <div
                    key={task.id}
                    className="p-4 rounded-2xl bg-white border border-[#FED7AA] shadow-xs space-y-3 hover:border-[#EA580C]/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3 min-w-0">
                        {/* Tinted rounded-square icon tile */}
                        <div className="w-10 h-10 rounded-xl bg-[#FFF0E6] text-[#EA580C] border border-[#FED7AA] flex items-center justify-center shrink-0 mt-0.5">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-sm text-slate-900 truncate">
                              {task.title}
                            </h4>
                            {sessionNewTaskIds.has(task.id) && (
                              <span className="px-2 py-0.5 rounded-full bg-[#EA580C] text-white font-black text-[9px] uppercase tracking-wider animate-pulse shadow-xs shrink-0">
                                {t.badgeNew || 'NEW'}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5 truncate">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{(task.buildingName || task.building?.name || 'Facility')} • {task.floorZone || 'Floor checklist'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Top-right Status Pill */}
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase shrink-0 border ${
                          isOverdue
                            ? 'bg-rose-50 text-[#DC2626] border-rose-200'
                            : isDueSoon
                            ? 'bg-amber-50 text-[#D97706] border-amber-200'
                            : 'bg-emerald-50 text-[#059669] border-emerald-200'
                        }`}
                      >
                        {dueText}
                      </span>
                    </div>

                    {/* Metadata & Status row */}
                    <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-1 font-mono text-[11px] text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Scheduled'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                        <span>Checklist Pending</span>
                        <ChevronRight className="w-3 h-3 text-slate-400" />
                      </div>
                    </div>

                    {/* Action buttons (Solid orange Open Checklist + White outline Navigate) */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          const targetBldg = assignedBuildings.find((b: any) => b.id === (task.buildingId || task.building?.id));
                          if (targetBldg) {
                            setSelectedBuilding(targetBldg);
                            recordVisitStamp(targetBldg.id, task.id);
                          }
                          setActiveTab('CHECKLISTS');
                        }}
                        className="btn-flame py-2.5 px-3 rounded-xl text-white font-bold text-xs shadow-xs text-center flex items-center justify-center gap-1 active:scale-[0.98]"
                      >
                        <FileCheck2 className="w-3.5 h-3.5" />
                        <span>{t.openChecklist || 'Open Checklist'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const bldg = assignedBuildings.find((b: any) => b.id === (task.buildingId || task.building?.id));
                          const addr = bldg?.address || task.buildingName || task.building?.name || '';
                          window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addr)}`, '_blank');
                        }}
                        className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-[#FED7AA] font-bold text-xs shadow-xs text-center flex items-center justify-center gap-1 active:scale-[0.98]"
                      >
                        <Navigation className="w-3.5 h-3.5 text-[#EA580C]" />
                        <span>{t.navigate || 'Navigate'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 3.5 QUICK ACTION BAR (One white rounded-2xl row with 4 equal items) */}
            <div className="bg-white border border-[#FED7AA] rounded-2xl p-2.5 shadow-xs grid grid-cols-4 divide-x divide-slate-100">
              {/* 1. Sync Now */}
              <button
                type="button"
                disabled={isSyncing}
                onClick={() => handleTriggerSync({ force: true })}
                className="flex flex-col items-center justify-center gap-1 py-1 text-slate-700 hover:text-[#EA580C] active:scale-95 transition-all"
              >
                <RefreshCw className={`w-4 h-4 text-[#EA580C] ${isSyncing ? 'animate-spin' : ''}`} />
                <span className="text-[10px] font-bold">{t.quickSyncNow || 'Sync Now'}</span>
              </button>

              {/* 2. Progress */}
              <button
                type="button"
                onClick={() => setShowProgressModal(true)}
                className="flex flex-col items-center justify-center gap-1 py-1 text-slate-700 hover:text-[#EA580C] active:scale-95 transition-all"
              >
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span className="text-[10px] font-bold">{t.quickProgress || 'Progress'}</span>
              </button>

              {/* 3. Support */}
              <button
                type="button"
                onClick={() => setShowSupportModal(true)}
                className="flex flex-col items-center justify-center gap-1 py-1 text-slate-700 hover:text-[#EA580C] active:scale-95 transition-all"
              >
                <Headphones className="w-4 h-4 text-purple-600" />
                <span className="text-[10px] font-bold">{t.quickSupport || 'Support'}</span>
              </button>

              {/* 4. Settings */}
              <button
                type="button"
                onClick={() => setShowSettingsSheet(true)}
                className="flex flex-col items-center justify-center gap-1 py-1 text-slate-700 hover:text-[#EA580C] active:scale-95 transition-all"
              >
                <Sliders className="w-4 h-4 text-slate-600" />
                <span className="text-[10px] font-bold">{t.quickSettings || 'Settings'}</span>
              </button>
            </div>
          </div>
        )}

                {/* =========================================================================
            TAB 1: "MY TASKS" DASHBOARD (Feature A & Section 3)
        ========================================================================= */}
        {activeTab === 'TASKS' && (
          <div className="p-4 space-y-4">
            {/* Today Summary Strip (Section 3.1 & 8.1 Due-State Intelligence) */}
            <div className="grid grid-cols-3 gap-2">
              {/* OVERDUE COUNTER: text #DC2626 */}
              <button
                type="button"
                onClick={() => setTaskFilter((prev) => (prev === 'OVERDUE' ? 'ALL' : 'OVERDUE'))}
                className={`p-3 rounded-2xl border text-center transition-all min-h-[72px] flex flex-col justify-center ${
                  taskFilter === 'OVERDUE'
                    ? 'bg-red-50 border-[#DC2626] ring-2 ring-[#DC2626]/20 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-red-300'
                }`}
              >
                <span className="text-xl font-black text-[#DC2626] block leading-none">
                  {overdueTasksCount}
                </span>
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mt-1 block">
                  {t.overdue}
                </span>
              </button>

              {/* DUE SOON COUNTER: text #D97706 */}
              <button
                type="button"
                onClick={() => setTaskFilter((prev) => (prev === 'DUE_SOON' ? 'ALL' : 'DUE_SOON'))}
                className={`p-3 rounded-2xl border text-center transition-all min-h-[72px] flex flex-col justify-center ${
                  taskFilter === 'DUE_SOON'
                    ? 'bg-amber-50 border-[#D97706] ring-2 ring-[#D97706]/20 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-amber-300'
                }`}
              >
                <span className="text-xl font-black text-[#D97706] block leading-none">
                  {dueSoonTasksCount}
                </span>
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mt-1 block">
                  {t.dueSoon}
                </span>
              </button>

              {/* OK / UPCOMING: text #059669 */}
              <button
                type="button"
                onClick={() => setTaskFilter((prev) => (prev === 'OK' ? 'ALL' : 'OK'))}
                className={`p-3 rounded-2xl border text-center transition-all min-h-[72px] flex flex-col justify-center ${
                  taskFilter === 'OK'
                    ? 'bg-emerald-50 border-[#059669] ring-2 ring-[#059669]/20 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-emerald-300'
                }`}
              >
                <span className="text-xl font-black text-[#059669] block leading-none">
                  {upcomingTasksCount}
                </span>
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mt-1 block">
                  {t.upcoming}
                </span>
              </button>
            </div>

            {/* Filter Pill Header */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-900">
                {taskFilter === 'ALL'
                  ? t.allTasks
                  : taskFilter === 'OVERDUE'
                  ? `${t.overdue} (${overdueTasksCount})`
                  : taskFilter === 'DUE_SOON'
                  ? `${t.dueSoon} (${dueSoonTasksCount})`
                  : `${t.upcoming} (${upcomingTasksCount})`}
              </span>
              {taskFilter !== 'ALL' && (
                <button
                  type="button"
                  onClick={() => setTaskFilter('ALL')}
                  className="text-[11px] font-bold text-[#C2410C] hover:underline"
                >
                  Show All
                </button>
              )}
            </div>

            {/* Offline Chip indicator */}
            {(!isOnline || cachedDataNotice) && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold shadow-xs">
                <WifiOff className="w-3 h-3 text-slate-500" />
                <span>{t.offlineSavedDataChip || 'Offline · showing saved data'}</span>
              </div>
            )}

            {/* Task Cards List (Section 3.1) */}
            {filteredTasks.length === 0 ? (
              tasksFetchError ? (
                <div data-testid="tasks-empty-error-state" className="p-8 text-center space-y-3 bg-amber-50/70 border border-amber-200 rounded-3xl shadow-xs">
                  <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
                  <h3 className="text-sm font-bold text-amber-900">{t.tasksLoadFailed || "Couldn't load tasks"}</h3>
                  <p className="text-xs text-amber-700">Unable to reach the tasks service. Tap retry to reload.</p>
                  <button
                    type="button"
                    onClick={() => loadDashboardData()}
                    className="px-4 py-2 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs shadow-xs active:scale-95 transition-all"
                  >
                    {t.retryLoading || 'Retry'}
                  </button>
                </div>
              ) : (
                <div className="glass-panel rounded-3xl p-8 text-center space-y-3 shadow-sm">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                  <h3 className="text-sm font-bold text-slate-800">{t.noTasksDue}</h3>
                  <p className="text-xs text-slate-500">All fire safety AMC tasks are up to date.</p>
                </div>
              )
            ) : (
              <div className="space-y-3.5">
                {filteredTasks.map((task: any) => {
                  const isCompleted = task.status === 'COMPLETED';
                  const isCancelled = task.status === 'CANCELLED';

                  // Mandated Due Colors: EXPIRED #DC2626 · DUE SOON #D97706 · OK #059669
                  const dueBadge =
                    task.dueState === 'EXPIRED' ? (
                      <span className="px-2 py-0.5 rounded-full bg-red-100 text-[#DC2626] font-bold text-[10px] border border-red-200">
                        {t.overdueByDays.replace('{n}', String(Math.abs(task.diffDays || 1)))}
                      </span>
                    ) : task.dueState === 'DUE_SOON' ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-[#D97706] font-bold text-[10px] border border-amber-200">
                        {t.dueTomorrow}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[#059669] font-bold text-[10px] border border-emerald-200">
                        {task.dueDate ? t.dueOn.replace('{date}', formatLocalizedDate(task.dueDate, currentLang)) : 'Scheduled'}
                      </span>
                    );

                  // Priority Chip
                  const priorityColor =
                    task.priority === 'URGENT' || task.priority === 'HIGH'
                      ? 'bg-red-50 text-[#DC2626] border-red-200'
                      : task.priority === 'MEDIUM'
                      ? 'bg-amber-50 text-[#D97706] border-amber-200'
                      : 'bg-emerald-50 text-[#059669] border-emerald-200';

                  // Google Maps Navigation URL (Section 8.4)
                  const mapDestination =
                    task.building?.latitude && task.building?.longitude
                      ? `${task.building.latitude},${task.building.longitude}`
                      : encodeURIComponent(task.building?.address || task.building?.name || task.buildingName || '');
                  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${mapDestination}`;

                  return (
                    <div
                      key={task.id}
                      className={`glass-panel rounded-3xl p-4 space-y-3 transition-colors ${
                        isCancelled ? 'opacity-50 line-through' : ''
                      }`}
                    >
                      {/* Top Header: Building & Floor/Zone */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5 truncate">
                          <div className="flex items-center gap-1.5 text-slate-800 text-xs font-bold truncate">
                            <Building2 className="w-3.5 h-3.5 text-[#C2410C] shrink-0" />
                            <span className="truncate">{task.building?.name || task.buildingName || 'Facility'}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 truncate">
                            <Layers className="w-3 h-3 shrink-0 text-slate-400" />
                            <span className="truncate">{task.floorZone}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {dueBadge}
                          <span
                            className={`px-2 py-0.5 rounded-full border text-[10px] font-extrabold uppercase ${priorityColor}`}
                          >
                            {task.priority}
                          </span>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-extrabold text-slate-900 leading-snug">{task.title}</h4>
                          {sessionNewTaskIds.has(task.id) && (
                            <span className="px-2 py-0.5 rounded-full bg-[#EA580C] text-white font-black text-[9px] uppercase tracking-wider animate-pulse shadow-xs shrink-0">
                              {t.badgeNew || 'NEW'}
                            </span>
                          )}
                        </div>
                        {task.description && (
                          <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">{task.description}</p>
                        )}
                      </div>

                      {/* Status Pill */}
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-[11px] text-slate-500 font-semibold">Status:</span>
                        <span
                          className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold font-mono uppercase ${
                            task.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-[#059669]'
                              : task.status === 'IN_PROGRESS'
                              ? 'bg-amber-100 text-[#D97706]'
                              : task.status === 'ASSIGNED'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {task.status}
                        </span>
                      </div>

                      {/* One-Tap Action Buttons (≥ 48px Glove-Friendly Touch Targets, Section 8.6) */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        {/* Start Button (Section 3.2: sets IN_PROGRESS) */}
                        {task.status !== 'IN_PROGRESS' && task.status !== 'COMPLETED' ? (
                          <button
                            type="button"
                            onClick={() => handleTaskStatusChange(task, 'IN_PROGRESS')}
                            className="btn-flame min-h-[48px] py-2.5 px-3 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white font-extrabold text-xs shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
                          >
                            <Flame className="w-4 h-4" />
                            <span>{t.startTask}</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              // Open checklist directly
                              const bldg = assignedBuildings.find((b: any) => b.id === (task.building?.id || task.buildingId));
                              if (bldg) {
                                setSelectedBuilding(bldg);
                                setActiveTab('CHECKLISTS');
                                if (task.equipment) {
                                  setActiveAssetInspection(task.equipment);
                                }
                              } else {
                                setActiveTab('CHECKLISTS');
                              }
                            }}
                            className="btn-flame min-h-[48px] py-2.5 px-3 rounded-xl bg-[#0E9F6E] hover:bg-emerald-700 text-white font-extrabold text-xs shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
                          >
                            <FileCheck2 className="w-4 h-4" />
                            <span>{t.openChecklist}</span>
                          </button>
                        )}

                        {/* Navigate Button (Section 8.4) */}
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-h-[48px] py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 border border-[#FED7AA] text-slate-800 font-extrabold text-xs shadow-xs flex items-center justify-center gap-1.5 active:scale-95"
                        >
                          <Navigation className="w-4 h-4 text-[#C2410C]" />
                          <span>{t.navigate}</span>
                        </a>

                        {/* Call Site Button (Section 8.5: 48px One-Tap Call) */}
                        {task.contactPhone && (
                          <a
                            href={`tel:${task.contactPhone}`}
                            className="col-span-2 min-h-[48px] py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 border border-slate-200"
                          >
                            <Phone className="w-4 h-4 text-[#C2410C]" />
                            <span>
                              {t.callSite}: {task.contactName ? `${task.contactName} (${task.contactPhone})` : task.contactPhone}
                            </span>
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 2: CHECKLISTS & FACILITY AMC (Existing Visual Checklist Flow)
        ========================================================================= */}
        {activeTab === 'CHECKLISTS' && (
          <div className="p-4 space-y-4">
            {/* VIEW A: FACILITY SELECTION */}
            {!selectedBuilding && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-black text-slate-900">{t.checklistsTab}</h2>
                    <p className="text-xs text-slate-500">Select a premise for floor/zone checklist</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FFF0E6] border border-[#FED7AA] text-xs font-bold text-[#C2410C]">
                    {assignedBuildings.length} Facilities
                  </span>
                </div>

                {assignedBuildings.length === 0 ? (
                  <div className="glass-panel rounded-3xl p-8 text-center space-y-3 shadow-sm">
                    <Building2 className="w-10 h-10 text-slate-400 mx-auto" />
                    <h3 className="text-sm font-bold text-slate-800">No Facilities Assigned</h3>
                    <p className="text-xs text-slate-500">Assigned sites from your admin will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {assignedBuildings.map((bldg: any) => {
                      const percentChecked =
                        bldg.totalAssets > 0
                          ? Math.min(100, Math.round((bldg.checkedCount / bldg.totalAssets) * 100))
                          : 0;

                      return (
                        <div
                          key={bldg.id}
                          className="glass-panel rounded-3xl p-4 space-y-3.5 hover:border-[#EA580C]/50 transition-colors shadow-xs"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-0.5 truncate">
                              <h3 className="text-base font-extrabold text-slate-900 truncate">{bldg.name}</h3>
                              <p className="text-xs text-slate-500 flex items-center gap-1 truncate">
                                <MapPin className="w-3.5 h-3.5 text-[#C2410C] shrink-0" />
                                <span className="truncate">{bldg.address}</span>
                              </p>
                            </div>
                            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#FFF0E6] text-[#C2410C] border border-[#FED7AA] shrink-0">
                              {bldg.totalAssets} Units
                            </span>
                          </div>

                          {/* Progress */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px] text-slate-500 font-bold">
                              <span>Checked: {bldg.checkedCount} / {bldg.totalAssets}</span>
                              <span className="text-[#C2410C]">{percentChecked}%</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-[#EA580C] to-[#FF8C42] rounded-full transition-all duration-300"
                                style={{ width: `${percentChecked}%` }}
                              />
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedBuilding(bldg);
                              setActiveFloorFilter('ALL');
                            }}
                            className="btn-flame w-full min-h-[50px] py-3 rounded-2xl bg-[#C2410C] hover:bg-[#9A3412] text-white font-extrabold text-xs shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                          >
                            <MapPin className="w-4 h-4 text-white" />
                            <span>📍 Open Site Checklists</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* VIEW B: INSIDE FACILITY — FLOOR/ZONE LIST */}
            {selectedBuilding && (
              <div className="space-y-4">
                <div className="glass-panel rounded-2xl p-3 flex items-center justify-between gap-3 shadow-xs">
                  <div className="truncate">
                    <span className="text-[10px] uppercase font-bold text-[#C2410C] block">Inspecting Premise</span>
                    <h2 className="text-sm font-extrabold text-slate-900 truncate">{selectedBuilding.name}</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSignatureModal(true)}
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-sm min-h-[44px]"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>Guard Sign-Off</span>
                  </button>
                </div>

                {/* Floor / Zone Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setActiveFloorFilter('ALL')}
                    className={`min-h-[44px] px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      activeFloorFilter === 'ALL'
                        ? 'bg-[#C2410C] text-white font-black shadow-xs'
                        : 'bg-white border border-[#FED7AA] text-slate-700'
                    }`}
                  >
                    All Units ({selectedBldgEquipments.length})
                  </button>
                  {availableFloors.map((fl) => (
                    <button
                      key={fl}
                      type="button"
                      onClick={() => setActiveFloorFilter(fl)}
                      className={`min-h-[44px] px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                        activeFloorFilter === fl
                          ? 'bg-[#C2410C] text-white font-black shadow-xs'
                          : 'bg-white border border-[#FED7AA] text-slate-700'
                      }`}
                    >
                      {fl}
                    </button>
                  ))}
                </div>

                {/* Assets List */}
                <div className="space-y-3">
                  {filteredAssets.map((asset: any) => {
                    const isChecked = asset.isCheckedToday || asset.isCheckedCycle;

                    return (
                      <div
                        key={asset.id}
                        className="glass-panel rounded-2xl p-4 space-y-3 hover:border-[#EA580C]/50 transition-colors shadow-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-0.5 truncate">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-base font-black text-slate-900">{asset.qrCode}</span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFF0E6] text-[#C2410C] border border-[#FED7AA]">
                                {asset.capacity || asset.type}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 truncate">{asset.location || 'Location not set'}</p>
                          </div>

                          {isChecked ? (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold flex items-center gap-1 shrink-0">
                              <Check className="w-3 h-3" />
                              <span>DONE</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-extrabold shrink-0">
                              PENDING
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveAssetInspection(asset);
                            setInspStatus('PASSED');
                            setSelectedIssues([]);
                            setPressureReading('');
                            setRemarks('');
                            setCapturedPhotoUrl(null);
                            setPhotoMeta(null);
                            setPhotoStampConfirmed(false);
                          }}
                          className="btn-flame w-full min-h-[48px] py-3 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold text-xs flex items-center justify-between px-4 transition-all active:scale-95"
                        >
                          <span>MARK SERVICED • 6-Sec Inspection</span>
                          <ChevronRight className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 3: "HISTORY" OF COMPLETED TASKS (Feature B & Section 4)
        ========================================================================= */}
        {activeTab === 'HISTORY' && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-slate-900">{t.historyTab}</h2>
                <p className="text-xs text-slate-500">Completed field inspections & work orders</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#FFF0E6] border border-[#FED7AA] text-xs font-bold text-[#C2410C]">
                {filteredHistory.length} Done
              </span>
            </div>

            {/* Search Box with Voice Mic (Section 4 & 7.2) */}
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder={t.searchHistory}
                className="w-full pl-10 pr-12 py-3 bg-white border border-[#FED7AA] rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C2410C] shadow-xs min-h-[48px]"
              />
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`absolute right-2 p-2 rounded-xl transition-all ${
                  isListeningMic ? 'bg-red-500 text-white animate-pulse' : 'text-slate-500 hover:text-[#C2410C]'
                }`}
                title="Search via Voice"
              >
                {isListeningMic ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>

            {/* Date Range Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
              {(['all', 'week', 'month'] as const).map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setHistoryDateRange(range)}
                  className={`min-h-[44px] px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                    historyDateRange === range
                      ? 'bg-[#C2410C] text-white shadow-xs'
                      : 'bg-white border border-[#FED7AA] text-slate-700'
                  }`}
                >
                  {range === 'week' ? t.filterWeek : range === 'month' ? t.filterMonth : t.filterAll}
                </button>
              ))}

              {/* Result Filter Chips */}
              {(['ALL', 'PASSED', 'FAILED', 'SERVICE_REQUIRED'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setHistoryResultFilter(r)}
                  className={`min-h-[44px] px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                    historyResultFilter === r
                      ? 'bg-[#1C1917] text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600'
                  }`}
                >
                  {r === 'ALL'
                    ? 'All Results'
                    : r === 'PASSED'
                    ? t.resultPassed
                    : r === 'FAILED'
                    ? t.resultFailed
                    : t.resultServiceRequired}
                </button>
              ))}
            </div>

            {/* History Feed Cards (Section 4) */}
            {filteredHistory.length === 0 ? (
              <div className="glass-panel rounded-3xl p-8 text-center space-y-3 shadow-sm">
                <HistoryIcon className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800">{t.emptyHistory}</h3>
                <p className="text-xs text-slate-500">Your completed service logs will be stored here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredHistory.map((item: any) => {
                  const dateStr = formatLocalizedDateTime(item.date, currentLang);
                  const resultColor =
                    item.result === 'PASSED' || item.result === 'COMPLETED'
                      ? 'bg-emerald-50 text-[#059669] border-emerald-200'
                      : item.result === 'FAILED'
                      ? 'bg-red-50 text-[#DC2626] border-red-200'
                      : 'bg-amber-50 text-[#D97706] border-amber-200';

                  const photos = item.photos || [];

                  return (
                    <div
                      key={item.id}
                      className="glass-panel rounded-2xl p-4 space-y-2.5 shadow-xs hover:border-[#EA580C]/40 transition-colors"
                    >
                      {/* Top Row: Date & Result Chip */}
                      <div className="flex items-center justify-between text-xs gap-2">
                        <span className="font-mono text-slate-500 text-[11px] truncate flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{dateStr}</span>
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span
                            className={`px-2 py-0.5 rounded-full border text-[10px] font-extrabold uppercase ${resultColor}`}
                          >
                            {item.result}
                          </span>
                          {/* Synced Badge */}
                          {item.syncStatus === 'PENDING' ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                              {t.pendingSyncBadge}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-[#059669] border border-emerald-200 text-[10px] font-bold flex items-center gap-0.5">
                              <Check className="w-2.5 h-2.5" />
                              <span>{t.syncedBadge}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Building & Asset Tag */}
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900 truncate">
                          {item.building?.name || 'Facility'} • {item.assetTag}
                        </h4>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                          <Layers className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{item.floorZone || 'Main Zone'}</span>
                          {item.equipmentType && <span>• {item.equipmentType}</span>}
                        </p>
                      </div>

                      {/* Remarks */}
                      {item.remarks && (
                        <p className="text-xs text-slate-700 bg-white/70 p-2.5 rounded-xl border border-slate-200/80 line-clamp-2">
                          {item.remarks}
                        </p>
                      )}

                      {/* Photo Thumbnails: tap to open full metadata modal (Section 4 & 6.2) */}
                      {photos.length > 0 && (
                        <div className="pt-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                            {t.viewPhotoEvidence} ({photos.length})
                          </span>
                          <div className="flex items-center gap-2 overflow-x-auto pb-1">
                            {photos.map((p: any, idx: number) => (
                              <button
                                key={p.id || idx}
                                type="button"
                                onClick={() =>
                                  setActivePhotoViewer({
                                    ...p,
                                    buildingName: item.building?.name,
                                    assetTag: item.assetTag,
                                  })
                                }
                                className="relative rounded-xl overflow-hidden border border-slate-300 w-16 h-16 shrink-0 group hover:ring-2 hover:ring-[#C2410C]"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={p.photoUrl}
                                  alt="Inspection evidence"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                                <span className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[8px] font-mono text-center truncate px-0.5">
                                  {p.dayOfWeek || 'GPS'}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 5: PROFILE SCREEN (Section 6.4)
        ========================================================================= */}
        {activeTab === 'PROFILE' && (
          <div className="p-4 space-y-4">
            {/* Profile Hero Card */}
            <div className="p-5 rounded-3xl bg-white border border-[#FED7AA] shadow-xs space-y-4 text-center">
              <div className="relative w-20 h-20 mx-auto">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#EA580C] to-[#C2410C] text-white flex items-center justify-center font-black text-2xl shadow-md ring-4 ring-orange-50">
                  {userProfile?.fullName?.charAt(0).toUpperCase() || 'T'}
                </div>
                <span className={`absolute bottom-1 right-1 w-4 h-4 rounded-full ring-2 ring-white ${
                  isOnline ? 'bg-emerald-500' : 'bg-slate-400'
                }`} />
              </div>

              <div>
                <h3 className="font-display font-black text-lg text-slate-900">
                  {userProfile?.fullName || 'Field Technician'}
                </h3>
                <p className="text-xs font-mono font-bold text-[#EA580C] mt-0.5">
                  {userProfile?.employeeId || 'STAFF-TECH'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {userProfile?.agencyName || 'VigilAMC Operations'}
                </p>
              </div>

              {/* Performance Mini Stats */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-left">
                <div className="p-2.5 rounded-xl bg-[#FFF8F2] border border-[#FED7AA]/60">
                  <span className="text-base font-black text-slate-900 block leading-tight">
                    {historyList.length}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Inspections</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FFF8F2] border border-[#FED7AA]/60">
                  <span className="text-base font-black text-emerald-600 block leading-tight">
                    {assignedBuildings.length}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Sites</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FFF8F2] border border-[#FED7AA]/60">
                  <span className="text-base font-black text-[#EA580C] block leading-tight">
                    {pendingSyncCount === 0 ? '100%' : `${pendingSyncCount} pend`}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Sync Health</span>
                </div>
              </div>
            </div>


            {/* Persistent Deletion Request Banner */}
            {pendingDeletionRequest && pendingDeletionRequest.status === 'PENDING' && (
              <div className="p-4 rounded-2xl bg-amber-50 border-2 border-[#DC2626] shadow-xs space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0 text-[#DC2626]">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-[#DC2626] uppercase tracking-wider">
                      {t.deletionPendingBannerTitle || 'Account Deletion Requested'}
                    </h4>
                    <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                      {t.deletionPendingBannerText || 'Your account deletion request has been submitted and is pending review by your agency administrator (processed within 7 days). Your account remains active until approved.'}
                    </p>
                  </div>
                </div>
                <div className="flex justify-end pt-1 border-t border-rose-200">
                  <button
                    type="button"
                    onClick={handleCancelDeletion}
                    disabled={cancelSubmitting}
                    className="px-3.5 py-1.5 rounded-xl bg-white border border-rose-300 hover:bg-rose-50 text-[#DC2626] text-xs font-bold shadow-xs active:scale-95 transition-all disabled:opacity-50"
                  >
                    {cancelSubmitting ? '...' : (t.cancelDeletionRequestBtn || 'Cancel Request')}
                  </button>
                </div>
              </div>
            )}

            {/* Account & Data Card (DPDP Right-to-Erasure) */}
            <div className="bg-white rounded-2xl border border-[#FED7AA] shadow-xs p-4 space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                <Shield className="w-4 h-4 text-[#EA580C]" />
                <span>{t.accountAndDataTitle || 'Account & Data'}</span>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between pb-2">
                  <span className="text-[11px] font-black text-[#DC2626] uppercase tracking-wider">
                    {t.dangerZoneTitle || 'Danger Zone'}
                  </span>
                </div>
                {pendingDeletionRequest && pendingDeletionRequest.status === 'PENDING' ? (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs">
                    <div className="flex items-center gap-2 text-[#DC2626] font-semibold">
                      <span className="w-2 h-2 rounded-full bg-[#DC2626] animate-pulse" />
                      <span>{t.deletionPendingBannerTitle || 'Deletion Requested'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCancelDeletion}
                      disabled={cancelSubmitting}
                      className="text-xs text-[#DC2626] font-bold underline hover:text-[#991B1B]"
                    >
                      {cancelSubmitting ? '...' : (t.cancelDeletionRequestBtn || 'Cancel')}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setDeletePinInput('');
                      setShowDeleteModal(true);
                    }}
                    className="w-full p-3 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-[#DC2626] text-xs font-bold flex items-center justify-between transition-colors shadow-xs"
                  >
                    <span className="flex items-center gap-2">
                      <Trash2 className="w-4 h-4" />
                      {t.requestAccountDeletionBtn || 'Request account deletion'}
                    </span>
                    <span>›</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick Settings list */}
            <div className="bg-white rounded-2xl border border-[#FED7AA] shadow-xs divide-y divide-slate-100 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setShowLanguageSheet(true)}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2.5 text-slate-800">
                  <Globe className="w-4 h-4 text-[#EA580C]" />
                  <span>Language</span>
                </div>
                <span className="text-xs text-slate-500">
                  {SUPPORTED_LANGUAGES.find((l) => l.code === currentLang)?.nativeName || 'English'} ›
                </span>
              </button>

              <button
                type="button"
                onClick={requestLiveLocation}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2.5 text-slate-800">
                  <Crosshair className="w-4 h-4 text-emerald-600" />
                  <span>GPS Location Status</span>
                </div>
                <span className="text-xs text-slate-500">
                  {gpsStatus === 'LOCKED' ? '±8m Locked' : gpsStatus} ›
                </span>
              </button>

              <button
                type="button"
                onClick={() => setShowSupportModal(true)}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2.5 text-slate-800">
                  <Headphones className="w-4 h-4 text-purple-600" />
                  <span>Support &amp; FAQ</span>
                </div>
                <span className="text-xs text-slate-500">›</span>
              </button>

              <button
                type="button"
                onClick={handleSignOut}
                className="w-full p-4 flex items-center justify-between hover:bg-rose-50 text-rose-600 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </div>
                <span className="text-xs">›</span>
              </button>
            </div>

            {/* Account Deletion Confirmation Modal */}
            {showDeleteModal && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl border border-[#FED7AA] shadow-2xl max-w-sm w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center gap-3 text-[#DC2626]">
                    <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5 text-[#DC2626]" />
                    </div>
                    <div>
                      <h3 className="font-display font-black text-base text-slate-900">
                        {t.deleteAccountModalTitle || 'Request Account Deletion'}
                      </h3>
                      <p className="text-[10px] text-slate-500 font-medium">DPDP Act 2023 • Right to Erasure</p>
                    </div>
                  </div>

                  {/* Information list */}
                  <div className="p-3.5 rounded-2xl bg-[#FFF8F2] border border-[#FED7AA] text-[11px] space-y-2 text-slate-700">
                    <p className="leading-snug">
                      <strong className="text-rose-700 block mb-0.5">• What is deleted:</strong>
                      {t.deleteWhatDeleted}
                    </p>
                    <p className="leading-snug">
                      <strong className="text-slate-900 block mb-0.5">• What is retained:</strong>
                      {t.deleteWhatRetained}
                    </p>
                    <p className="leading-snug">
                      <strong className="text-slate-900 block mb-0.5">• Processing time:</strong>
                      {t.deleteProcessingTime}
                    </p>
                    <p className="leading-snug">
                      <strong className="text-emerald-700 block mb-0.5">• Cancellable:</strong>
                      {t.deleteCanCancel}
                    </p>
                  </div>

                  {/* Re-authentication PIN */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 block">
                      {t.deleteEnterPinPrompt || 'Enter your 6-digit login PIN to confirm:'}
                    </label>
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={8}
                      value={deletePinInput}
                      onChange={(e) => setDeletePinInput(e.target.value)}
                      placeholder="••••••"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-center text-lg font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
                      autoFocus
                    />
                  </div>

                  {/* Modal Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowDeleteModal(false);
                        setDeletePinInput('');
                      }}
                      className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
                    >
                      {t.deleteModalCancel || 'Keep Account'}
                    </button>
                    <button
                      type="button"
                      onClick={handleRequestDeletion}
                      disabled={deleteSubmitting || deletePinInput.trim().length < 4}
                      className="w-full py-2.5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                    >
                      {deleteSubmitting ? '...' : (t.deleteConfirmSubmitBtn || 'Confirm Deletion')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bottom navigation replaced with Left Slide-Out Navigation Drawer (Item 5) */}
      </div>

      {/* =========================================================================
          MODAL: 6-SECOND VISUAL CHECK SHEET (GIANT BUTTONS + DEFECT CHIPS + STAMPED CAMERA)
      ========================================================================= */}
      {activeAssetInspection && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end sm:justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-[#FED7AA] rounded-t-3xl sm:rounded-3xl max-w-md w-full mx-auto p-5 space-y-4 max-h-[92vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#FED7AA]">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#C2410C] block font-mono">
                  {activeAssetInspection.qrCode} • {activeAssetInspection.capacity}
                </span>
                <h3 className="text-base font-black text-slate-900">{activeAssetInspection.location}</h3>
              </div>
              <button
                type="button"
                onClick={closeInspectionModal}
                className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Giant Side-by-Side Status Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setInspStatus('PASSED');
                  setSelectedIssues([]);
                }}
                className={`py-4 px-3 rounded-2xl font-black text-sm flex flex-col items-center justify-center gap-1.5 transition-all border-2 min-h-[58px] ${
                  inspStatus === 'PASSED'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-md scale-[1.02]'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                <CheckCircle2 className="w-6 h-6" />
                <span>🟢 {t.resultPassed}</span>
              </button>

              <button
                type="button"
                onClick={() => setInspStatus('FAILED')}
                className={`py-4 px-3 rounded-2xl font-black text-sm flex flex-col items-center justify-center gap-1.5 transition-all border-2 min-h-[58px] ${
                  inspStatus === 'FAILED'
                    ? 'bg-red-600 text-white border-red-500 shadow-md scale-[1.02]'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                <AlertTriangle className="w-6 h-6" />
                <span>🔴 {t.resultFailed}</span>
              </button>
            </div>

            {/* Visual Defect Chips (Shown when DEFECT is chosen) */}
            {inspStatus === 'FAILED' && (
              <div className="space-y-2 p-3 bg-red-50/70 rounded-2xl border border-red-200">
                <span className="text-[11px] font-bold text-red-800 uppercase tracking-wide block">
                  {t.commonDefects}:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {COMMON_DEFECT_CHIPS.map((chip) => {
                    const isSel = selectedIssues.includes(chip.label);
                    return (
                      <button
                        key={chip.id}
                        type="button"
                        onClick={() => {
                          if (isSel) {
                            setSelectedIssues((prev) => prev.filter((i) => i !== chip.label));
                          } else {
                            setSelectedIssues((prev) => [...prev, chip.label]);
                          }
                        }}
                        className={`min-h-[48px] p-2.5 rounded-xl border text-left font-bold flex items-center gap-2 transition-all ${
                          isSel
                            ? 'bg-[#FFF0E6] text-[#1C1917] border-2 border-[#C2410C] shadow-xs'
                            : 'bg-white text-[#1C1917] border-[#FED7AA]'
                        }`}
                      >
                        <span className="text-base">{chip.icon}</span>
                        <span className="truncate">{chip.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Feature E: Camera Photo with Stamped Day + Time + GPS */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                {t.capturePhoto} (Day + Time + GPS Stamped)
              </span>

              {capturedPhotoUrl ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-300 shadow-xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={capturedPhotoUrl} alt="Inspection Watermarked" className="w-full h-48 object-cover" />
                  <div className="absolute top-2 right-2 flex items-center gap-1.5">
                    {photoStampConfirmed && (
                      <span className="px-2 py-1 bg-emerald-600/90 text-white rounded-lg text-[10px] font-bold">
                        Stamped ✓
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setCapturedPhotoUrl(null);
                        setPhotoMeta(null);
                        setPhotoStampConfirmed(false);
                      }}
                      className="px-2.5 py-1 bg-black/75 text-white rounded-lg text-xs font-bold"
                    >
                      {t.retakePhoto}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoCapture}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={isProcessingPhoto}
                    onClick={handleCameraTrigger}
                    className="w-full min-h-[52px] py-4 rounded-2xl bg-[#FFF8F2] border-2 border-dashed border-[#FED7AA] hover:border-[#C2410C] text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
                  >
                    <Camera className="w-5 h-5 text-[#C2410C]" />
                    <span>{isProcessingPhoto ? t.stampingPhoto : `📸 ${t.capturePhoto}`}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Optional Voice Notes / Remarks (Feature 7.2) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">{t.remarksLabel}</span>
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  className={`text-[11px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 min-h-[36px] ${
                    isListeningMic
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-[#FFF0E6] text-[#C2410C] border border-[#FED7AA]'
                  }`}
                >
                  {isListeningMic ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  <span>{isListeningMic ? 'Stop' : '🎤 Mic'}</span>
                </button>
              </div>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder={t.remarksPlaceholder}
                className="w-full px-3 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C2410C] min-h-[48px]"
              />
            </div>

            {/* Final Submit Button */}
            <button
              type="button"
              disabled={submittingInspection || isProcessingPhoto}
              onClick={handleSubmitChecksheet}
              className="w-full min-h-[52px] py-4 rounded-2xl bg-gradient-to-r from-[#0E9F6E] to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-sm shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submittingInspection ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{t.submitting}</span>
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  <span>
                    {t.submitInspection} ({inspStatus === 'PASSED' ? 'PASS' : 'DEFECT'})
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: FULL PHOTO VIEWER + STORED GEO-STAMP METADATA CARD (Feature 6.2)
      ========================================================================= */}
      {activePhotoViewer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white border border-[#FED7AA] rounded-3xl max-w-md w-full overflow-hidden shadow-2xl space-y-3">
            {/* Header */}
            <div className="p-3.5 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                {t.photoMetadata}
              </h3>
              <button
                type="button"
                onClick={() => setActivePhotoViewer(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stamped Photo */}
            <div className="relative bg-black px-2 py-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activePhotoViewer.photoUrl}
                alt="Stamped inspection photo"
                className="w-full max-h-[48vh] object-contain mx-auto rounded-lg"
              />
            </div>

            {/* Stored Metadata Card (Section 6.2: Date · Day · Time · Lat, Lng · ±accuracy · building · asset tag) */}
            <div className="p-4 bg-[#FFF8F2] border-t border-[#FED7AA] space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-white p-2 rounded-xl border border-[#FED7AA]">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">{t.dayOfWeek}</span>
                  <span className="font-extrabold text-slate-800">{activePhotoViewer.dayOfWeek || 'MON'}</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-[#FED7AA]">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">{t.captureTime}</span>
                  <span className="font-mono text-slate-800">
                    {activePhotoViewer.capturedAt
                      ? formatLocalizedDateTime(activePhotoViewer.capturedAt, currentLang)
                      : 'Verified'}
                  </span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-[#FED7AA]">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">{t.gpsCoordinates}</span>
                  <span className="font-mono text-slate-800">
                    {activePhotoViewer.latitude
                      ? `${activePhotoViewer.latitude.toFixed(6)}, ${activePhotoViewer.longitude?.toFixed(6)}`
                      : 'Site Verified'}
                  </span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-[#FED7AA]">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">{t.gpsSource}</span>
                  <span className="font-bold text-slate-800">
                    {activePhotoViewer.gpsSource || 'LIVE'} (±{activePhotoViewer.gpsAccuracy || 8}m)
                  </span>
                </div>
              </div>

              {activePhotoViewer.buildingName && (
                <div className="text-[11px] text-slate-600 flex items-center justify-between pt-1">
                  <span>{activePhotoViewer.buildingName}</span>
                  <span className="font-mono font-bold text-[#C2410C]">{activePhotoViewer.assetTag}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: GUARD FINGER TOUCH SIGNATURE PAD
      ========================================================================= */}
      {showSignatureModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#FED7AA] rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#FED7AA] pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">{t.guardSignoff}</h3>
                <p className="text-xs text-slate-500">Site Facility Manager / Security Guard signs on glass</p>
              </div>
              <button
                type="button"
                onClick={() => setShowSignatureModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">{t.guardNamePlaceholder}</label>
                <input
                  type="text"
                  value={guardName}
                  onChange={(e) => setGuardName(e.target.value)}
                  placeholder="e.g. Surender Singh (Head Security)"
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 min-h-[48px]"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-slate-700 font-bold">{t.drawSignatureHere}</label>
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="text-[11px] text-[#C2410C] font-bold hover:underline"
                  >
                    {t.clearSignature}
                  </button>
                </div>
                <div className="bg-[#FFF8F2] border-2 border-[#1C1917] rounded-2xl overflow-hidden touch-none">
                  <canvas
                    ref={sigCanvasRef}
                    width={360}
                    height={160}
                    onMouseDown={startDrawingSig}
                    onMouseMove={drawSig}
                    onMouseUp={stopDrawingSig}
                    onTouchStart={startDrawingSig}
                    onTouchMove={drawSig}
                    onTouchEnd={stopDrawingSig}
                    className="w-full h-40 cursor-crosshair bg-white"
                  />
                </div>
              </div>

              <button
                type="button"
                disabled={!signatureDataUrl}
                onClick={handleSubmitGuardSignoff}
                className="btn-flame w-full min-h-[52px] py-3.5 rounded-2xl bg-[#C2410C] hover:bg-[#9A3412] disabled:opacity-50 text-white font-black text-xs shadow-md transition-all flex items-center justify-center"
              >
                SIGN & LOCK • Submit Verified Site Sign-Off
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: SYNC DIAGNOSTICS BREADCRUMBS (Section 4.6)
      ========================================================================= */}
      {showSyncDiagnostics && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white border border-[#FED7AA] rounded-t-3xl sm:rounded-3xl max-w-lg w-full p-5 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#FED7AA] pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-[#C2410C]" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">Sync Diagnostics</h3>
                  <p className="text-[11px] text-slate-500">Last 20 outbox drain attempts (audit trail)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSyncDiagnostics(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Extended Diagnostics Context: Origin, Session, Network, Tasks Fetch, Outbox */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-mono space-y-1 text-slate-700 shrink-0">
              <div className="flex justify-between">
                <span className="text-slate-500">Origin:</span>
                <span className="font-bold truncate max-w-[220px]">{typeof window !== 'undefined' ? window.location.origin : '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Session User:</span>
                <span className="font-bold">{userProfile?.employeeId || userProfile?.fullName || 'Not signed in'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Network / Mode:</span>
                <span className={`font-bold ${isOnline ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {isOnline ? 'Online' : 'Offline'} {cachedDataNotice ? '(Cached Data)' : ''}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tasks Fetch:</span>
                <span className={`font-bold ${tasksFetchError ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {tasksFetchError ? 'Failed (offline/network/401)' : 'OK'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Outbox Queue:</span>
                <span className="font-bold">{pendingSyncCount} pending, {failedSyncCount} failed</span>
              </div>
            </div>

            <div className="flex items-center justify-between shrink-0 text-xs">
              <span className="text-slate-500 font-mono text-[11px]">
                {diagnosticLogs.length} diagnostic records
              </span>
              <button
                type="button"
                onClick={() => {
                  const headerInfo = [
                    '--- VigilAMC Field Diagnostics ---',
                    `Timestamp: ${new Date().toISOString()}`,
                    `Origin: ${typeof window !== 'undefined' ? window.location.origin : '—'}`,
                    `User: ${userProfile?.employeeId || userProfile?.fullName || 'Anonymous'} (${userProfile?.id || '—'})`,
                    `Network: ${isOnline ? 'ONLINE' : 'OFFLINE'} | CachedData: ${cachedDataNotice}`,
                    `TasksFetch: ${tasksFetchError || 'OK'}`,
                    `Outbox: pending=${pendingSyncCount}, failed=${failedSyncCount}`,
                    `--- Sync Attempt Logs (${diagnosticLogs.length}) ---`,
                  ].join('\n');
                  const txt = headerInfo + '\n' + diagnosticLogs
                    .map(
                      (l) =>
                        `[${new Date(l.timestamp).toISOString()}] [${l.actionType}] [${l.status}] HTTP ${
                          l.httpStatus || 0
                        } - ${l.message} (${l.clientSyncId})`
                    )
                    .join('\n');
                  navigator.clipboard.writeText(txt);
                  triggerToast('📋 Diagnostics copied to clipboard');
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                <span>Copy Logs</span>
              </button>
            </div>

            <div className="space-y-2 overflow-y-auto flex-1 pr-1">
              {diagnosticLogs.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No sync attempts logged yet in this session.
                </div>
              ) : (
                diagnosticLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-xs space-y-1 ${
                      log.status === 'SYNCED'
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                        : 'bg-red-50/60 border-red-200 text-red-950'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-white/80 border border-current/20">
                        {log.actionType}
                      </span>
                      <span className="text-slate-500 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="font-medium text-[11px] break-words">{log.message}</p>
                    <div className="flex items-center justify-between pt-0.5 text-[10px] text-slate-500 font-mono">
                      <span>HTTP {log.httpStatus || 0}</span>
                      <span className="truncate max-w-[200px]">{log.clientSyncId}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}


      {/* =========================================================================
          LEFT NAVIGATION DRAWER (Item 5: Primary Navigation at 375px)
      ========================================================================= */}
      {showNavDrawer && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => toggleNavDrawer(false)}
          />

          {/* Slide-out Panel */}
          <div className="relative w-[300px] max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="p-4 bg-gradient-to-br from-[#1C1917] to-[#292524] text-white space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#EA580C] to-[#C2410C] p-1.5 flex items-center justify-center">
                    <Flame className="w-5 h-5 text-white stroke-[2.5]" />
                  </div>
                  <span className="font-display font-black text-lg tracking-tight">VigilAMC</span>
                </div>
                <button
                  type="button"
                  onClick={() => toggleNavDrawer(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Technician Identity */}
              <div className="flex items-center gap-3 pt-1 border-t border-white/10">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-[#EA580C] text-white flex items-center justify-center font-bold text-sm ring-2 ring-white/30">
                    {userProfile?.fullName?.charAt(0).toUpperCase() || 'T'}
                  </div>
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-[#1C1917] ${
                      isOnline ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  />
                </div>
                <div className="truncate">
                  <p className="font-bold text-sm text-white truncate">{userProfile?.fullName || 'Technician'}</p>
                  <p className="text-[11px] text-white/70 truncate">{userProfile?.agencyName || 'Fire AMC Operations'}</p>
                </div>
              </div>
            </div>

            {/* Navigation Destinations */}
            <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('HOME');
                  toggleNavDrawer(false);
                }}
                className={`w-full min-h-[48px] px-3 rounded-xl flex items-center gap-3 text-sm font-bold transition-all ${
                  activeTab === 'HOME'
                    ? 'bg-[#FFF0E6] text-[#C2410C] border border-[#FED7AA]'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-5 h-5 text-[#EA580C]" />
                <span className="flex-1 text-left">{t.navHome || t.tabHome || 'Home'}</span>
                {activeTab === 'HOME' && <span className="w-2 h-2 rounded-full bg-[#EA580C]" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('TASKS');
                  toggleNavDrawer(false);
                }}
                className={`w-full min-h-[48px] px-3 rounded-xl flex items-center gap-3 text-sm font-bold transition-all ${
                  activeTab === 'TASKS'
                    ? 'bg-[#FFF0E6] text-[#C2410C] border border-[#FED7AA]'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="relative">
                  <ListTodo className="w-5 h-5 text-[#EA580C]" />
                  {overdueTasksCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#DC2626] ring-2 ring-white" />
                  )}
                </div>
                <span className="flex-1 text-left">{t.navTasks || t.myTasksTab || 'Tasks'}</span>
                {overdueTasksCount > 0 ? (
                  <span className="px-2 py-0.5 rounded-full bg-red-100 text-[#DC2626] text-[10px] font-extrabold">
                    {overdueTasksCount}
                  </span>
                ) : activeTab === 'TASKS' ? (
                  <span className="w-2 h-2 rounded-full bg-[#EA580C]" />
                ) : null}
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('CHECKLISTS');
                  toggleNavDrawer(false);
                }}
                className={`w-full min-h-[48px] px-3 rounded-xl flex items-center gap-3 text-sm font-bold transition-all ${
                  activeTab === 'CHECKLISTS'
                    ? 'bg-[#FFF0E6] text-[#C2410C] border border-[#FED7AA]'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <FileCheck2 className="w-5 h-5 text-[#EA580C]" />
                <span className="flex-1 text-left">{t.navChecklists || t.checklistsTab || 'Checklists'}</span>
                {activeTab === 'CHECKLISTS' && <span className="w-2 h-2 rounded-full bg-[#EA580C]" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('HISTORY');
                  toggleNavDrawer(false);
                }}
                className={`w-full min-h-[48px] px-3 rounded-xl flex items-center gap-3 text-sm font-bold transition-all ${
                  activeTab === 'HISTORY'
                    ? 'bg-[#FFF0E6] text-[#C2410C] border border-[#FED7AA]'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <HistoryIcon className="w-5 h-5 text-[#EA580C]" />
                <span className="flex-1 text-left">{t.navHistory || t.historyTab || 'History'}</span>
                {activeTab === 'HISTORY' && <span className="w-2 h-2 rounded-full bg-[#EA580C]" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('PROFILE');
                  toggleNavDrawer(false);
                }}
                className={`w-full min-h-[48px] px-3 rounded-xl flex items-center gap-3 text-sm font-bold transition-all ${
                  activeTab === 'PROFILE'
                    ? 'bg-[#FFF0E6] text-[#C2410C] border border-[#FED7AA]'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <User className="w-5 h-5 text-[#EA580C]" />
                <span className="flex-1 text-left">{t.navProfile || t.tabProfile || 'Profile'}</span>
                {activeTab === 'PROFILE' && <span className="w-2 h-2 rounded-full bg-[#EA580C]" />}
              </button>

              {/* Secondary Tools Divider */}
              <div className="pt-3 pb-1 px-3">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Field Tools</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowSyncDiagnostics(true);
                  toggleNavDrawer(false);
                }}
                className="w-full min-h-[44px] px-3 rounded-xl flex items-center gap-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                <Activity className="w-4 h-4 text-[#EA580C]" />
                <span className="flex-1 text-left">{t.navSyncDiagnostics || 'Sync Diagnostics'}</span>
                {pendingSyncCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                    {pendingSyncCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowNotificationsDrawer(true);
                  toggleNavDrawer(false);
                }}
                className="w-full min-h-[44px] px-3 rounded-xl flex items-center gap-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                <Bell className="w-4 h-4 text-[#EA580C]" />
                <span className="flex-1 text-left">Notifications</span>
                {notifications.some((n: any) => !n.isRead) && (
                  <span className="w-2 h-2 rounded-full bg-[#EA580C]" />
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowSupportModal(true);
                  toggleNavDrawer(false);
                }}
                className="w-full min-h-[44px] px-3 rounded-xl flex items-center gap-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                <HelpCircle className="w-4 h-4 text-purple-600" />
                <span className="flex-1 text-left">{t.navSupportFaq || 'Support & FAQ'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowSettingsSheet(true);
                  toggleNavDrawer(false);
                }}
                className="w-full min-h-[44px] px-3 rounded-xl flex items-center gap-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                <Sliders className="w-4 h-4 text-slate-500" />
                <span className="flex-1 text-left">{t.quickSettings || 'Settings'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowLanguageSheet(true);
                  toggleNavDrawer(false);
                }}
                className="w-full min-h-[44px] px-3 rounded-xl flex items-center gap-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                <Globe className="w-4 h-4 text-emerald-600" />
                <span className="flex-1 text-left">Language</span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {SUPPORTED_LANGUAGES.find((l) => l.code === currentLang)?.nativeName || 'English'}
                </span>
              </button>
            </div>

            {/* Drawer Footer */}
            <div className="p-3 border-t border-slate-100 bg-slate-50 space-y-2">
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full min-h-[44px] px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>{t.signOut || 'Sign Out'}</span>
              </button>
              <div className="text-center text-[10px] text-slate-400 font-mono">
                VigilAMC Field v1.0.2 (Build 3)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          NOTIFICATIONS DRAWER (Item 3 & 6: Real In-App Notification Feed)
      ========================================================================= */}
      {showNotificationsDrawer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white border border-[#FED7AA] rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 space-y-4 max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#FED7AA] pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#C2410C]" />
                <h3 className="text-base font-bold text-slate-900">Task Notifications</h3>
              </div>
              <div className="flex items-center gap-2">
                {notifications.some((n: any) => !n.isRead) && (
                  <button
                    type="button"
                    onClick={() => handleMarkNotificationRead()}
                    className="text-[11px] font-bold text-[#C2410C] hover:underline"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowNotificationsDrawer(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default' && (
                <div className="p-3 rounded-2xl bg-[#FFF8F2] border border-[#FED7AA] flex items-center justify-between gap-2 shadow-xs">
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-xs font-bold text-slate-900">Enable Push Alerts</p>
                    <p className="text-[11px] text-slate-500">Get notified immediately when new tasks are assigned.</p>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const res = await Notification.requestPermission();
                        if (res === 'granted') triggerToast('Push notifications enabled!');
                      } catch {
                        // ignore
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold shrink-0 transition-colors"
                  >
                    Allow
                  </button>
                </div>
              )}
              {notifications.length === 0 ? (
                <div className="text-center py-10 space-y-2 text-slate-400">
                  <Bell className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-semibold">No notifications yet</p>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                    When admins assign tasks or update AMC schedules, you will see alerts here.
                  </p>
                </div>
              ) : (
                notifications.map((notif: any) => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      if (!notif.isRead) handleMarkNotificationRead(notif.id);
                      if (notif.linkUrl?.includes('tasks') || notif.title?.toLowerCase().includes('task')) {
                        setShowNotificationsDrawer(false);
                        setActiveTab('TASKS');
                      }
                    }}
                    className={`p-3.5 rounded-2xl border text-xs space-y-1 cursor-pointer transition-all active:scale-[0.99] ${
                      notif.isRead
                        ? 'bg-white border-slate-200 text-slate-700'
                        : 'bg-[#FFF8F2] border-[#FED7AA] text-slate-900 ring-1 ring-[#EA580C]/20 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        {!notif.isRead && <span className="w-2 h-2 rounded-full bg-[#EA580C]" />}
                        {notif.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 break-words">{notif.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUPPORT & FAQ SHEET (Item 6: Real answers + mailto:vigilamc@gmail.com)
      ========================================================================= */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white border border-[#FED7AA] rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 space-y-4 max-h-[90vh] flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#FED7AA] pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-purple-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">{t.faqTitle || 'Support & FAQ'}</h3>
                  <p className="text-[10px] text-slate-500">{t.faqSubtitle || 'Field troubleshooting & answers'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSupportModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* FAQ Accordion List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
              {[
                { q: t.faqQ1 || 'How does offline mode work?', a: t.faqA1 || 'All inspections and stamped photos are saved securely on your device. When your internet reconnects, they sync to the dashboard automatically.' },
                { q: t.faqQ2 || 'Why do photos require GPS stamps?', a: t.faqA2 || 'Auditors and building safety laws require timestamp and geo-location proof for verified AMC equipment inspection.' },
                { q: t.faqQ3 || 'What should I do if sync is pending?', a: t.faqA3 || 'Keep the app open or tap "Sync Now". If you are in a basement without cellular signal, sync will complete as soon as you step outside.' },
                { q: t.faqQ4 || 'How do I change the app language?', a: t.faqA4 || 'Tap the navigation menu or the globe icon in the top header. You can pick between English and 9 Indian languages anytime.' },
                { q: t.faqQ5 || 'What is my security PIN used for?', a: t.faqA5 || 'Your 6-digit PIN is provided by your agency administrator for secure account identity verification and account management.' },
                { q: t.faqQ6 || 'Can I dictate inspection remarks by voice?', a: t.faqA6 || 'Yes! Tap the microphone icon beside Remarks during any inspection to speak in Hindi or your preferred language.' },
              ].map((faq, idx) => (
                <div key={idx} className="border border-[#FED7AA]/60 rounded-xl bg-[#FFF8F2]/60 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setActiveFaqIndex(activeFaqIndex === idx ? null : idx)}
                    className="w-full p-3 text-left font-bold text-slate-800 flex items-center justify-between gap-2 hover:bg-[#FFF0E6] transition-colors"
                  >
                    <span>{faq.q}</span>
                    {activeFaqIndex === idx ? (
                      <ChevronUp className="w-4 h-4 text-[#EA580C] shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {activeFaqIndex === idx && (
                    <div className="px-3 pb-3 text-[11px] text-slate-600 leading-relaxed border-t border-[#FED7AA]/40 pt-2 bg-white">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Contact Support Section */}
            <div className="pt-2 border-t border-[#FED7AA] space-y-2">
              <p className="text-[11px] font-bold text-slate-700">{t.contactSupport || 'Need Direct Assistance?'}</p>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="mailto:vigilamc@gmail.com?subject=Technician%20Support%20Request"
                  className="min-h-[44px] px-3 py-2 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span>Email Support</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText('vigilamc@gmail.com');
                      triggerToast(t.emailCopiedToast || 'Email copied: vigilamc@gmail.com');
                    }
                  }}
                  className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-200 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  <span>{t.copyEmail || 'Copy Email'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          PROGRESS MODAL (Item 6: Real Field Metrics)
      ========================================================================= */}
      {showProgressModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white border border-[#FED7AA] rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 space-y-4 max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#FED7AA] pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">{t.progressTitle || "Today's Field Progress"}</h3>
                  <p className="text-[10px] text-slate-500">Live operational snapshot</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowProgressModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">{t.todayCompleted || 'Inspections Done'}</span>
                <span className="text-2xl font-black text-emerald-950 block mt-1">
                  {historyList.filter((h) => new Date(h.date).toDateString() === new Date().toDateString()).length}
                </span>
                <span className="text-[10px] text-emerald-700">Today</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
                <span className="text-[10px] font-bold text-amber-800 uppercase block">{t.scheduledToday || 'Scheduled Tasks'}</span>
                <span className="text-2xl font-black text-amber-950 block mt-1">
                  {taskList.filter((t) => t.status !== 'COMPLETED').length}
                </span>
                <span className="text-[10px] text-amber-700">Remaining</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-700 uppercase block">{t.passRate || 'Pass Rate'}</span>
                <span className="text-2xl font-black text-slate-900 block mt-1">
                  {(() => {
                    const todayInsp = historyList.filter((h) => new Date(h.date).toDateString() === new Date().toDateString());
                    if (todayInsp.length === 0) return '100%';
                    const passed = todayInsp.filter((h) => h.result === 'PASSED').length;
                    return Math.round((passed / todayInsp.length) * 100) + '%';
                  })()}
                </span>
                <span className="text-[10px] text-slate-500">Inspection health</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-orange-50 border border-orange-200">
                <span className="text-[10px] font-bold text-[#C2410C] uppercase block">{t.pendingOutbox || 'Outbox Queue'}</span>
                <span className="text-2xl font-black text-[#9A3412] block mt-1">
                  {pendingSyncCount}
                </span>
                <span className="text-[10px] text-orange-700">{pendingSyncCount === 0 ? 'All synced' : 'Pending upload'}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#FED7AA] flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowProgressModal(false);
                  setActiveTab('TASKS');
                }}
                className="flex-1 min-h-[44px] py-2 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold text-xs flex items-center justify-center"
              >
                Open Tasks Feed
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowProgressModal(false);
                  setActiveTab('CHECKLISTS');
                }}
                className="flex-1 min-h-[44px] py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center border border-slate-200"
              >
                Open Checklists
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SETTINGS SHEET (Item 6: Real Field Settings)
      ========================================================================= */}
      {showSettingsSheet && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white border border-[#FED7AA] rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#FED7AA] pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-slate-700" />
                <h3 className="text-base font-bold text-slate-900">{t.settingsTitle || 'Field Settings'}</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSettingsSheet(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setShowSettingsSheet(false);
                  setShowLanguageSheet(true);
                }}
                className="w-full min-h-[48px] p-3 rounded-xl border border-slate-200 hover:border-[#FED7AA] flex items-center justify-between text-left transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-[#EA580C]" />
                  <span>Language</span>
                </div>
                <span className="text-slate-500 font-mono text-[11px]">
                  {SUPPORTED_LANGUAGES.find((l) => l.code === currentLang)?.nativeName || 'English'} ›
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  requestLiveLocation();
                  triggerToast('Re-locking GPS position...');
                }}
                className="w-full min-h-[48px] p-3 rounded-xl border border-slate-200 hover:border-[#FED7AA] flex items-center justify-between text-left transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Crosshair className="w-4 h-4 text-emerald-600" />
                  <span>{t.gpsRecalibrate || 'Recalibrate GPS'}</span>
                </div>
                <span className="text-slate-500 font-mono text-[11px]">
                  {gpsStatus === 'LOCKED' ? '±8m' : gpsStatus} ›
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowSettingsSheet(false);
                  setShowSyncDiagnostics(true);
                }}
                className="w-full min-h-[48px] p-3 rounded-xl border border-slate-200 hover:border-[#FED7AA] flex items-center justify-between text-left transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Activity className="w-4 h-4 text-[#EA580C]" />
                  <span>Offline Outbox & Diagnostics</span>
                </div>
                <span className="text-slate-500 font-mono text-[11px]">
                  {pendingSyncCount} queued ›
                </span>
              </button>

              {typeof window !== 'undefined' && 'Notification' in window && (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const perm = await Notification.requestPermission();
                      if (perm === 'granted') {
                        triggerToast('Push notifications enabled!');
                      } else {
                        triggerToast('Notifications: ' + perm);
                      }
                    } catch {
                      triggerToast('Could not request notification permission');
                    }
                  }}
                  className="w-full min-h-[48px] p-3 rounded-xl border border-slate-200 hover:border-[#FED7AA] flex items-center justify-between text-left transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Bell className="w-4 h-4 text-[#EA580C]" />
                    <span>Push Notifications</span>
                  </div>
                  <span className="text-slate-500 font-mono text-[11px] capitalize">
                    {Notification.permission} ›
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={async () => {
                  triggerToast('Refreshing operational data...');
                  await loadDashboardData();
                  triggerToast('Data refreshed successfully');
                }}
                className="w-full min-h-[48px] p-3 rounded-xl border border-slate-200 hover:border-[#FED7AA] flex items-center justify-between text-left transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <RefreshCw className="w-4 h-4 text-blue-600" />
                  <span>{t.refreshData || 'Refresh App Data'}</span>
                </div>
                <span className="text-slate-500 text-[11px]">Sync ›</span>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100 text-center">
              <span className="text-[10px] text-slate-400 font-mono">
                VigilAMC Field v1.0.2 (Build 3) • Play Release
              </span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: LANGUAGE BOTTOM SHEET PICKER (Feature D)
      ========================================================================= */}
      {showLanguageSheet && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white border border-[#FED7AA] rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#FED7AA] pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#C2410C]" />
                <h3 className="text-base font-bold text-slate-900">{t.chooseLanguage}</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLanguageSheet(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 max-h-[60vh] overflow-y-auto">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelectLanguage(lang.code)}
                  className={`min-h-[52px] p-3 rounded-2xl text-left border flex flex-col justify-center transition-all ${
                    currentLang === lang.code
                      ? 'bg-[#FFF0E6] border-[#C2410C] shadow-xs ring-2 ring-[#C2410C]/20'
                      : 'bg-white border-slate-200 hover:border-[#FED7AA]'
                  }`}
                >
                  <span className="text-sm font-bold text-slate-900">{lang.nativeName}</span>
                  <span className="text-[10px] text-slate-500 font-medium">{lang.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
