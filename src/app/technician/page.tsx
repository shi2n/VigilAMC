'use client';

import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
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
  Wrench,
  ChevronRight,
  ArrowLeft,
  PenTool,
  Lock,
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
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
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
  OutboxItem,
} from '@/lib/offline/techOutbox';

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
  const [activeTab, setActiveTab] = useState<'TASKS' | 'CHECKLISTS' | 'HISTORY'>('TASKS');

  // ----------------------------------------------------------------------------------
  // AUTHENTICATION & PROFILE STATE
  // ----------------------------------------------------------------------------------
  const [authChecking, setAuthChecking] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isAdminTester, setIsAdminTester] = useState(false);

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
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string | null>(null);
  const [cachedDataNotice, setCachedDataNotice] = useState(false);

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
  }, []);

  // ----------------------------------------------------------------------------------
  // 2. CONTINUOUS GPS WATCHER (WITH BASEMENT CACHE PERSISTENCE)
  // ----------------------------------------------------------------------------------
  useEffect(() => {
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
      // 1. Fetch Dashboard & Tasks Feed in parallel
      const [dashRes, tasksRes, historyRes] = await Promise.all([
        fetch('/api/technician/dashboard').catch(() => null),
        fetch('/api/technician/tasks').catch(() => null),
        fetch('/api/technician/history?dateRange=all').catch(() => null),
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

        // Apply profile language if available
        if (dashJson.profile?.preferredLanguage && TRANSLATIONS[dashJson.profile.preferredLanguage as SupportedLanguage]) {
          setCurrentLang(dashJson.profile.preferredLanguage as SupportedLanguage);
        }
      }

      if (tasksRes && tasksRes.ok) {
        const tasksJson = await tasksRes.json();
        const incomingTasks = tasksJson.tasks || [];

        // Check for newly assigned tasks since last load for Assignment Nudge (Section 8.7)
        if (cachedTasks?.data && Array.isArray(cachedTasks.data)) {
          const prevIds = new Set(cachedTasks.data.map((t: any) => t.id));
          const newTask = incomingTasks.find((t: any) => !prevIds.has(t.id) && t.status !== 'COMPLETED');
          if (newTask) {
            setAssignmentNudge(newTask.title);
          }
        }

        setTaskList(incomingTasks);
        await setLocalCache('technician_tasks', incomingTasks);
      }

      if (historyRes && historyRes.ok) {
        const historyJson = await historyRes.json();
        setHistoryList(historyJson.history || []);
        await setLocalCache('technician_history', historyJson.history || []);
      }

      setCachedDataNotice(false);
    } catch (err: any) {
      console.warn('Network load error, falling back to cached state:', err);
      setCachedDataNotice(true);
    } finally {
      setDataLoading(false);
      setAuthChecking(false);
      await refreshOutboxCounts();
    }
  }, [refreshOutboxCounts]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // ----------------------------------------------------------------------------------
  // 4. SYNC ENGINE: DRAIN OUTBOX IDEMPOTENTLY (Section 5.3)
  // ----------------------------------------------------------------------------------
  const handleTriggerSync = useCallback(async () => {
    if (!navigator.onLine) {
      triggerToast(t.offlineSavedToast);
      return;
    }
    if (isSyncing) return;

    setIsSyncing(true);
    try {
      const result = await drainOutbox();
      const nowStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      setLastSyncedTime(nowStr);

      if (result.syncedCount > 0) {
        triggerToast(t.allSyncedToast);
        await loadDashboardData();
      } else if (result.failedCount > 0) {
        triggerToast(`⚠ ${result.failedCount} item(s) failed sync — tap retry.`);
      }
    } catch (err: any) {
      triggerToast(`Sync failed: ${err.message || 'Network error'}`);
    } finally {
      setIsSyncing(false);
      await refreshOutboxCounts();
    }
  }, [isSyncing, t, loadDashboardData, refreshOutboxCounts]);

  // Network Online / Visibility / Interval Auto-Sync Triggers
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onOnline = () => {
      setIsOnline(true);
      triggerToast(t.networkRestoredToast);
      handleTriggerSync();
    };
    const onOffline = () => {
      setIsOnline(false);
      triggerToast(t.offlineBannerMsg);
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        refreshOutboxCounts();
        handleTriggerSync();
      }
    };

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    document.addEventListener('visibilitychange', onVisibility);

    // 60-second gentle retry interval when online with pending items
    const interval = setInterval(() => {
      if (navigator.onLine && pendingSyncCount > 0 && !isSyncing) {
        handleTriggerSync();
      }
    }, 60000);

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      document.removeEventListener('visibilitychange', onVisibility);
      clearInterval(interval);
    };
  }, [handleTriggerSync, pendingSyncCount, isSyncing, t]);

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
        triggerToast('✅ Signed in successfully!');
        await loadDashboardData();
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
        triggerToast('✅ Signed in successfully!');
        await loadDashboardData();
      }
    } catch (err: any) {
      setLoginError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
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
  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

      // Export WebP at quality 0.8
      const watermarkedWebP = canvas.toDataURL('image/webp', 0.8);
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
  // 9. SUBMIT CHECK SHEET: ENQUEUE TO OUTBOX & ATTEMPT SYNC (Feature C)
  // ----------------------------------------------------------------------------------
  const handleSubmitChecksheet = async () => {
    if (!selectedBuilding || !activeAssetInspection) return;
    setSubmittingInspection(true);

    const clientSyncId = `SYNC-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const nowTs = Date.now();
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

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
      photoDataUrl: capturedPhotoUrl || undefined,
      photos: capturedPhotoUrl ? [capturedPhotoUrl] : [],
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
      // 1. Enqueue to IndexedDB Outbox
      const outboxItem: OutboxItem = {
        clientSyncId,
        actionType: 'COMPLETE_INSPECTION',
        payload: inspectionPayload,
        createdAt: nowTs,
        attempts: 0,
        status: 'PENDING',
      };
      await enqueueOutboxItem(outboxItem);
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
        handleTriggerSync();
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
            body: JSON.stringify({ taskId: task.id, status: newStatus }),
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
      setSignatureDataUrl(sigCanvasRef.current.toDataURL('image/png'));
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
    if (navigator.onLine) handleTriggerSync();
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

  // ----------------------------------------------------------------------------------
  // COMPUTED HISTORY LIST
  // ----------------------------------------------------------------------------------
  const filteredHistory = useMemo(() => {
    const s = historySearch.trim().toLowerCase();
    const now = Date.now();
    let minTime = 0;
    if (historyDateRange === 'week') minTime = now - 7 * 24 * 60 * 60 * 1000;
    if (historyDateRange === 'month') minTime = now - 30 * 24 * 60 * 60 * 1000;

    return historyList.filter((item) => {
      const itemTs = new Date(item.date).getTime();
      if (minTime > 0 && itemTs < minTime) return false;
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
      <div
        className="min-h-screen bg-[#FFF8F2] text-[#1C1917] flex items-center justify-center p-4"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 25%, rgba(232, 89, 12, 0.18) 0%, rgba(255, 140, 66, 0.12) 40%, rgba(255, 248, 242, 0) 72%)',
        }}
      >
        <div className="text-center space-y-3 glass-panel p-6 rounded-2xl max-w-xs w-full shadow-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/logo-tile-192.png"
            alt="VigilAMC Logo"
            width={44}
            height={44}
            className="w-11 h-11 object-cover mx-auto rounded-xl shadow-xs"
          />
          <RefreshCw className="w-6 h-6 animate-spin text-[#C2410C] mx-auto" />
          <p className="text-xs font-bold text-slate-700">Loading VigilAMC Field Operations...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div
        className="relative min-h-screen bg-[#FFF8F2] text-[#1C1917] flex flex-col justify-center px-4 py-8 overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #FFF8F2 42%, #FFE8D6 100%)' }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[360px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(232, 89, 12, 0.22) 0%, rgba(255, 140, 66, 0.15) 48%, rgba(255, 248, 242, 0) 74%)',
            filter: 'blur(85px)',
          }}
        />

        <div className="relative z-10 max-w-md w-full mx-auto space-y-6">
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
      className="relative min-h-screen bg-[#FFF8F2] text-[#1C1917] flex flex-col justify-between selection:bg-[#EA580C]/20"
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
      <div className="max-w-md w-full mx-auto flex-1 flex flex-col pb-24">
        {/* =========================================================================
            TOP APP HEADER & WELCOME BACK BAR (Feature F + C.5 Sync Confidence UI)
        ========================================================================= */}
        <header className="sticky top-0 z-40 glass-panel-dense border-t-0 border-x-0 p-3 space-y-2.5">
          {/* Top Bar: Logo/Back, Welcome Back, Language & SignOut */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 truncate">
              {selectedBuilding ? (
                <button
                  type="button"
                  onClick={() => setSelectedBuilding(null)}
                  className="p-2 rounded-xl bg-slate-100 border border-[#FED7AA] text-slate-700 hover:text-slate-900 shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src="/brand/logo-tile-192.png"
                  alt="VigilAMC Logo"
                  width={38}
                  height={38}
                  className="w-9 h-9 object-cover rounded-xl shadow-xs shrink-0"
                />
              )}

              <div className="truncate">
                {/* Feature F: Welcome back, <technician name> */}
                <h1 className="font-extrabold text-sm text-slate-900 truncate leading-tight">
                  {t.welcomeBack}, {userProfile?.fullName?.split(' ')[0] || 'Technician'}!
                </h1>
                <span className="text-[11px] text-[#C2410C] font-semibold truncate block">
                  {userProfile?.employeeId || 'TECH-STAFF'} • {userProfile?.agencyName || 'VigilAMC Agency'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Language Selector Button (Feature D) */}
              <button
                type="button"
                onClick={() => setShowLanguageSheet(true)}
                className="px-2.5 py-1.5 rounded-xl bg-white border border-[#FED7AA] text-slate-700 hover:border-[#EA580C] text-[11px] font-bold flex items-center gap-1 min-h-[44px]"
                title="Change Language"
              >
                <Globe className="w-3.5 h-3.5 text-[#C2410C]" />
                <span className="hidden sm:inline">
                  {SUPPORTED_LANGUAGES.find((l) => l.code === currentLang)?.nativeName || 'EN'}
                </span>
              </button>

              {isAdminTester && (
                <Link
                  href="/dashboard"
                  className="px-2.5 py-1.5 rounded-xl bg-[#FFF0E6] text-[#C2410C] border border-[#FED7AA] text-[10px] font-bold hover:bg-[#FED7AA] min-h-[44px] flex items-center"
                >
                  Admin
                </Link>
              )}

              <button
                type="button"
                onClick={handleSignOut}
                className="p-2 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 border border-[#FED7AA] min-h-[44px] min-w-[44px] flex items-center justify-center"
                title={t.signOut}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sync Confidence Pill (Feature C.5 & Section 8.2) */}
          <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-white/80 border border-[#FED7AA] text-[11px]">
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
                onClick={handleTriggerSync}
                className="px-2 py-1 rounded-lg bg-[#FFF0E6] hover:bg-[#FED7AA] text-[#C2410C] font-bold text-[10px] flex items-center gap-1 border border-[#FED7AA] active:scale-95 transition-all"
                title={t.syncNow}
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? t.syncing : t.syncNow}</span>
              </button>
            </div>
          </div>

          {/* Failed Sync Attention Strip if any items failed */}
          {failedSyncCount > 0 && (
            <div className="px-3 py-1.5 rounded-xl bg-red-50 border border-red-200 text-[11px] text-red-800 flex items-center justify-between gap-2">
              <span className="font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                <span>{t.syncFailed.replace('{n}', String(failedSyncCount))}</span>
              </span>
              <button
                type="button"
                onClick={handleTriggerSync}
                className="font-black text-[10px] underline hover:text-red-900"
              >
                {t.retry}
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

            {/* Task Cards List (Section 3.1) */}
            {filteredTasks.length === 0 ? (
              <div className="glass-panel rounded-3xl p-8 text-center space-y-3 shadow-sm">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800">{t.noTasksDue}</h3>
                <p className="text-xs text-slate-500">All fire safety AMC tasks are up to date.</p>
              </div>
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
                      : encodeURIComponent(task.building?.address || task.building?.name || '');
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
                            <span className="truncate">{task.building?.name}</span>
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
                        <h4 className="text-sm font-extrabold text-slate-900 leading-snug">{task.title}</h4>
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
                              const bldg = assignedBuildings.find((b: any) => b.id === task.building?.id);
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
            BOTTOM NAVIGATION BAR (3 Tabs, ≥ 48px Touch Targets)
        ========================================================================= */}
        <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#FED7AA] shadow-lg max-w-md mx-auto">
          <div className="grid grid-cols-3 h-16">
            {/* Tab 1: My Tasks (with Section 8.1 Overdue Dot) */}
            <button
              type="button"
              onClick={() => setActiveTab('TASKS')}
              className={`flex flex-col items-center justify-center gap-1 transition-all ${
                activeTab === 'TASKS' ? 'text-[#C2410C] font-black' : 'text-slate-500 font-semibold hover:text-slate-900'
              }`}
            >
              <div className="relative">
                <ListTodo className="w-5 h-5" />
                {overdueTasksCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 rounded-full bg-[#DC2626] ring-2 ring-white" />
                )}
              </div>
              <span className="text-[11px]">{t.myTasksTab}</span>
            </button>

            {/* Tab 2: Checklists */}
            <button
              type="button"
              onClick={() => setActiveTab('CHECKLISTS')}
              className={`flex flex-col items-center justify-center gap-1 transition-all ${
                activeTab === 'CHECKLISTS' ? 'text-[#C2410C] font-black' : 'text-slate-500 font-semibold hover:text-slate-900'
              }`}
            >
              <FileCheck2 className="w-5 h-5" />
              <span className="text-[11px]">{t.checklistsTab}</span>
            </button>

            {/* Tab 3: History */}
            <button
              type="button"
              onClick={() => setActiveTab('HISTORY')}
              className={`flex flex-col items-center justify-center gap-1 transition-all ${
                activeTab === 'HISTORY' ? 'text-[#C2410C] font-black' : 'text-slate-500 font-semibold hover:text-slate-900'
              }`}
            >
              <HistoryIcon className="w-5 h-5" />
              <span className="text-[11px]">{t.historyTab}</span>
            </button>
          </div>
        </nav>
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
                    onClick={() => fileInputRef.current?.click()}
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
