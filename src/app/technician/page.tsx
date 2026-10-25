'use client';

import { toast } from 'sonner';

import React, { useEffect, useState, useRef, useCallback } from 'react';
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
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface GPSCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  isBasementCached?: boolean;
}

interface QueuedInspection {
  clientSyncId: string;
  buildingId: string;
  equipmentId?: string;
  status: 'PASSED' | 'FAILED';
  checklist: any;
  remarks: string;
  photoDataUrl?: string;
  latitude?: number;
  longitude?: number;
  gpsAccuracy?: number;
  technicianName?: string;
  issueChips?: string[];
  createdAt: number;
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

  // Authentication State
  const [authChecking, setAuthChecking] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isAdminTester, setIsAdminTester] = useState(false);

  // In-App Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // PWA Install Prompt State
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  // Data State
  const [dataLoading, setDataLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<any>(null);
  const [activeFloorFilter, setActiveFloorFilter] = useState<string>('ALL');
  const [activeAssetInspection, setActiveAssetInspection] = useState<any>(null);

  // Live GPS Tracker State
  const [gpsLocation, setGpsLocation] = useState<GPSCoordinates | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'LOCKING' | 'LOCKED' | 'BASEMENT_CACHED' | 'DENIED'>('LOCKING');
  const lastKnownGpsRef = useRef<GPSCoordinates | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // Inspection Check Sheet State
  const [inspStatus, setInspStatus] = useState<'PASSED' | 'FAILED'>('PASSED');
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [pressureReading, setPressureReading] = useState('');
  const [remarks, setRemarks] = useState('');
  const [isListeningMic, setIsListeningMic] = useState(false);
  const [submittingInspection, setSubmittingInspection] = useState(false);

  // Stamped Camera Photo State
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Offline Basement Sync Queue
  const [offlineQueue, setOfflineQueue] = useState<QueuedInspection[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncingQueue, setIsSyncingQueue] = useState(false);

  // Guard Signature Pad State
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [guardName, setGuardName] = useState('');
  const [guardDesignation, setGuardDesignation] = useState('Site Security Supervisor');
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [isDrawingSignature, setIsDrawingSignature] = useState(false);
  const sigCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Toast Notification
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // 1. Service Worker & PWA Install Listener
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const handleOnline = () => {
        setIsOnline(true);
        triggerToast('🟢 Network restored. Syncing offline logs...');
      };
      const handleOffline = () => {
        setIsOnline(false);
        triggerToast('🟠 Offline mode activated (Basement safe).');
      };
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      // Register Service Worker
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch((err) => {
          console.warn('SW registration failed:', err);
        });
      }

      // Capture beforeinstallprompt
      const handleBeforeInstall = (e: Event) => {
        e.preventDefault();
        setDeferredInstallPrompt(e);
      };
      window.addEventListener('beforeinstallprompt', handleBeforeInstall);

      // Check if installed
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsAppInstalled(true);
      }

      // Load offline queue from localStorage
      try {
        const savedQueue = localStorage.getItem('vigil_offline_insp_queue');
        if (savedQueue) {
          setOfflineQueue(JSON.parse(savedQueue));
        }
        const savedGps = localStorage.getItem('vigil_last_known_gps');
        if (savedGps) {
          lastKnownGpsRef.current = JSON.parse(savedGps);
        }
      } catch {
        // Ignore JSON error
      }

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      };
    }
  }, []);

  // 2. Continuous GPS Location Tracker (navigator.geolocation.watchPosition)
  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      setGpsStatus('LOCKING');
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
          console.warn('Geolocation error / basement drop:', err);
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
        {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 5000,
        }
      );

      return () => {
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
        }
      };
    }
  }, []);

  // 3. Authenticate User Session
  const loadDashboardData = useCallback(async () => {
    try {
      setDataLoading(true);
      const res = await fetch('/api/technician/dashboard');
      if (res.status === 401) {
        setUserProfile(null);
        return;
      }
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to load technician app');
      }
      setUserProfile(json.profile);
      setIsAdminTester(json.profile?.role === 'ORG_ADMIN' || json.profile?.role === 'SUPER_ADMIN');
      setDashboardData(json);
      setLoginError(null);
    } catch (e: any) {
      console.error(e);
      setLoginError(e?.message || 'Failed to load technician app');
    } finally {
      setDataLoading(false);
      setAuthChecking(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // 4. In-App Mobile / Staff ID Login with Dual Auth
  const handleInAppLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    try {
      const rawIdent = loginIdentifier.trim();
      const rawPass = loginPassword.trim();

      // Step A: First try POST /api/technician/login (instant dual auth with cookie)
      try {
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
          throw new Error(techData.error || 'This staff account has been deactivated by your agency admin.');
        }
      } catch (techErr: any) {
        if (techErr.message?.includes('deactivated')) {
          throw techErr;
        }
      }

      // Step B: If not authenticated via local PIN, resolve identifier and try Supabase Auth
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

  // 5. Offline Queue Sync Handler
  const syncOfflineQueue = useCallback(async () => {
    if (offlineQueue.length === 0 || !navigator.onLine || isSyncingQueue) return;
    setIsSyncingQueue(true);

    const remaining: QueuedInspection[] = [];

    for (const item of offlineQueue) {
      try {
        const res = await fetch('/api/inspections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            buildingId: item.buildingId,
            equipmentId: item.equipmentId,
            status: item.status,
            checklist: item.checklist,
            remarks: item.remarks,
            photos: item.photoDataUrl ? [item.photoDataUrl] : [],
            latitude: item.latitude,
            longitude: item.longitude,
            gpsAccuracy: item.gpsAccuracy,
            technicianName: item.technicianName,
            issueChips: item.issueChips,
          }),
        });

        if (!res.ok) {
          remaining.push(item);
        }
      } catch {
        remaining.push(item);
      }
    }

    setOfflineQueue(remaining);
    try {
      localStorage.setItem('vigil_offline_insp_queue', JSON.stringify(remaining));
    } catch {}

    setIsSyncingQueue(false);
    if (remaining.length === 0) {
      triggerToast('🟢 All offline basement inspections synced successfully!');
      loadDashboardData();
    } else {
      triggerToast(`⚠ ${remaining.length} inspection${remaining.length === 1 ? '' : 's'} failed to sync — will retry`);
    }
  }, [offlineQueue, isSyncingQueue, loadDashboardData]);

  useEffect(() => {
    if (isOnline && offlineQueue.length > 0) {
      syncOfflineQueue();
    }
  }, [isOnline, offlineQueue.length, syncOfflineQueue]);

  // 6. Camera Photo Capture + Burned-In GPS Watermark
  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessingPhoto(true);

      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = objectUrl;
      });

      const maxDim = 1280;
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

      // Burn-in Dark Semi-Transparent Footer Badge
      const barHeight = Math.max(54, Math.round(height * 0.09));
      ctx.fillStyle = 'rgba(7, 25, 46, 0.88)';
      ctx.fillRect(0, height - barHeight, width, barHeight);

      const bldgName = selectedBuilding?.name || 'Site Inspection';
      const assetCode = activeAssetInspection?.qrCode || 'Fire Unit';
      const gpsString = gpsLocation
        ? `${gpsLocation.latitude.toFixed(4)}°N, ${gpsLocation.longitude.toFixed(4)}°E (±${gpsLocation.accuracy}m)${
            gpsLocation.isBasementCached ? ' [B1 Cached]' : ''
          }`
        : 'GPS Locked';

      const dateString = new Date().toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      ctx.fillStyle = '#38BDF8'; // Cyan
      ctx.font = `bold ${Math.round(barHeight * 0.32)}px sans-serif`;
      ctx.fillText(`VigilAMC Verified • ${bldgName} • ${assetCode}`, 16, height - barHeight * 0.55);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = `${Math.round(barHeight * 0.26)}px sans-serif`;
      ctx.fillText(`📍 ${gpsString} • 🕒 ${dateString} IST`, 16, height - barHeight * 0.2);

      const watermarkedWebP = canvas.toDataURL('image/webp', 0.82);
      setCapturedPhotoUrl(watermarkedWebP);
      URL.revokeObjectURL(objectUrl);
      triggerToast('📸 Photo stamped with GPS & Timestamp!');
    } catch (err: any) {
      console.error(err);
      triggerToast('Error capturing photo. Please try again.');
    } finally {
      setIsProcessingPhoto(false);
    }
  };

  // 7. Speech-to-Text Voice Notes Handler
  const toggleSpeechRecognition = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      triggerToast('Speech recognition not supported in this browser. Please type notes.');
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
      recognition.lang = 'hi-IN'; // Multi-lingual Indian English / Hindi

      recognition.onstart = () => {
        setIsListeningMic(true);
        triggerToast('🎤 Listening... Speak your observation now');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setRemarks((prev) => (prev ? `${prev} • ${transcript}` : transcript));
        setIsListeningMic(false);
        triggerToast('✓ Voice note captured!');
      };

      recognition.onerror = () => {
        setIsListeningMic(false);
      };

      recognition.onend = () => {
        setIsListeningMic(false);
      };

      recognition.start();
    } catch {
      setIsListeningMic(false);
    }
  };

  // 8. Submit Check Sheet (Online or Offline Basement Queue)
  const handleSubmitChecksheet = async () => {
    if (!selectedBuilding || !activeAssetInspection) return;
    setSubmittingInspection(true);

    const inspectionPayload = {
      clientSyncId: `SYNC-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
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
      latitude: gpsLocation?.latitude,
      longitude: gpsLocation?.longitude,
      gpsAccuracy: gpsLocation?.accuracy,
      technicianName: userProfile?.fullName || 'Field Technician',
      issueChips: selectedIssues,
      createdAt: Date.now(),
    };

    if (!navigator.onLine) {
      const updatedQueue = [...offlineQueue, inspectionPayload];
      setOfflineQueue(updatedQueue);
      try {
        localStorage.setItem('vigil_offline_insp_queue', JSON.stringify(updatedQueue));
      } catch {}
      triggerToast('📦 Saved in Offline Basement Queue. Will sync automatically.');
      closeInspectionModal();
      setSubmittingInspection(false);
      return;
    }

    try {
      let finalPhotoUrl = capturedPhotoUrl;
      if (capturedPhotoUrl) {
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dataUrl: capturedPhotoUrl,
            folder: 'inspections',
          }),
        });
        const uploadData = await uploadRes.json();
        if (uploadRes.ok && uploadData.url) {
          finalPhotoUrl = uploadData.url;
        }
      }

      const res = await fetch('/api/inspections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buildingId: inspectionPayload.buildingId,
          equipmentId: inspectionPayload.equipmentId,
          status: inspectionPayload.status,
          checklist: inspectionPayload.checklist,
          remarks: inspectionPayload.remarks,
          photoUrl: finalPhotoUrl,
          latitude: inspectionPayload.latitude,
          longitude: inspectionPayload.longitude,
          gpsAccuracy: inspectionPayload.gpsAccuracy,
          technicianName: inspectionPayload.technicianName,
          issueChips: inspectionPayload.issueChips,
        }),
      });

      if (!res.ok) {
        throw new Error('Server submission error');
      }

      triggerToast('✅ Inspection logged with GPS & photo watermark!');
      closeInspectionModal();
      loadDashboardData();
    } catch (err: any) {
      console.warn('Network failed during submission, queuing offline:', err);
      const updatedQueue = [...offlineQueue, inspectionPayload];
      setOfflineQueue(updatedQueue);
      try {
        localStorage.setItem('vigil_offline_insp_queue', JSON.stringify(updatedQueue));
      } catch {}
      triggerToast('🟠 Connection dropped. Saved to Basement Queue!');
      closeInspectionModal();
    } finally {
      setSubmittingInspection(false);
    }
  };

  const closeInspectionModal = () => {
    setActiveAssetInspection(null);
    setInspStatus('PASSED');
    setSelectedIssues([]);
    setPressureReading('');
    setRemarks('');
    setCapturedPhotoUrl(null);
  };

  // 9. Guard Signature Canvas Drawing Handlers
  const startDrawingSig = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawingSignature(true);
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const drawSig = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingSignature) return;
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#023E8A'; // VigilAMC Deep Brand Blue
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
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
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureDataUrl(null);
  };

  const handleSubmitGuardSignoff = async () => {
    if (!selectedBuilding || !signatureDataUrl) return;
    try {
      await fetch('/api/inspections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buildingId: selectedBuilding.id,
          status: 'PASSED',
          customerName: guardName || 'Site Security Guard',
          customerDesignation: guardDesignation,
          customerSignature: signatureDataUrl,
          latitude: gpsLocation?.latitude,
          longitude: gpsLocation?.longitude,
          gpsAccuracy: gpsLocation?.accuracy,
        }),
      });
      triggerToast('✍️ Site Guard sign-off submitted successfully!');
      setShowSignatureModal(false);
      clearSignature();
      loadDashboardData();
    } catch {
      triggerToast('Error saving signoff. Please try again.');
    }
  };

  // ----------------------------------------------------------------------------------
  // RENDER SCREEN 1: FULL SCREEN IN-APP LOGIN (If not authenticated)
  // ----------------------------------------------------------------------------------
  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#F4F8FB] text-slate-900 flex items-center justify-center p-4">
        <div className="text-center space-y-3 bg-white p-6 rounded-2xl border border-[#DCE7F2] shadow-sm max-w-xs w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.jpg"
            alt="VigilAMC Logo"
            className="h-10 w-auto mx-auto rounded-lg shadow-sm border border-[#DCE7F2]"
          />
          <RefreshCw className="w-6 h-6 animate-spin text-[#0077B6] mx-auto" />
          <p className="text-xs font-bold text-slate-700">Initializing VigilAMC Field App...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-[#F4F8FB] text-slate-900 flex flex-col justify-center px-4 py-8">
        <div className="max-w-md w-full mx-auto space-y-6">
          {/* Header Brand */}
          <div className="text-center space-y-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.jpg"
              alt="VigilAMC"
              className="h-12 w-auto mx-auto rounded-xl shadow-md border border-[#DCE7F2]"
            />
            <h1 className="text-2xl font-black tracking-tight text-slate-900">VigilAMC Field Operations</h1>
            <p className="text-xs text-slate-500 font-medium">
              Pan-India Mobile App for Fire Safety Field Technicians &amp; Facility Managers
            </p>
          </div>

          {/* Quick Install Banner if available */}
          {deferredInstallPrompt && !isAppInstalled && (
            <div className="bg-[#F0F7FF] border border-[#DCE7F2] rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-sm">
              <div className="text-left text-xs">
                <span className="font-bold text-[#0077B6] block">Install as Mobile App?</span>
                <p className="text-[11px] text-slate-500">Fast 1-tap launch directly from your home screen</p>
              </div>
              <button
                type="button"
                onClick={handleInstallApp}
                className="px-3.5 py-1.5 rounded-xl bg-[#0077B6] hover:bg-[#023E8A] text-white font-bold text-xs shrink-0 shadow-sm transition-all"
              >
                Install App
              </button>
            </div>
          )}

          {/* Login Card in Brand Light Enterprise Theme */}
          <div className="bg-white border border-[#DCE7F2] rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
            <div className="border-b border-[#DCE7F2] pb-3">
              <h2 className="text-base font-bold text-slate-900">Mobile / Staff ID Sign In</h2>
              <p className="text-xs text-slate-500">
                Enter your 10-digit Mobile Number, Staff ID, or Admin Email + PIN
              </p>
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
                  Mobile Number, Staff ID, or Admin Email *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="e.g. 9876543210, TECH-101, or admin@agency.in"
                    className="w-full pl-10 pr-3 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0077B6] focus:border-[#0077B6] font-mono shadow-sm"
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
                    className="w-full pl-10 pr-10 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0077B6] focus:border-[#0077B6] font-mono tracking-widest shadow-sm"
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
                className="w-full py-3.5 bg-gradient-to-r from-[#0077B6] to-[#023E8A] hover:from-[#0096C7] hover:to-[#0077B6] text-white font-black text-sm rounded-2xl shadow-md shadow-[#0077B6]/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loginLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Enter Mobile Field App</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2">
              <p className="text-[11px] text-slate-500">
                Staff login PIN is provided via WhatsApp by your agency admin.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------------------
  // RENDER SCREEN 2: STANDALONE MOBILE APP SHELL (`max-w-md mx-auto bg-[#F4F8FB]`)
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
    <div className="min-h-screen bg-[#F4F8FB] text-slate-900 flex flex-col justify-between selection:bg-[#0077B6]/20">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-4">
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Container constrained to mobile max-w-md */}
      <div className="max-w-md w-full mx-auto flex-1 flex flex-col pb-16">
        {/* Top App Header & Live GPS Status Bar */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#DCE7F2] p-3 space-y-2 shadow-sm">
          {/* Top Bar: Admin Return Pill & Profile */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              {selectedBuilding ? (
                <button
                  type="button"
                  onClick={() => setSelectedBuilding(null)}
                  className="p-1.5 rounded-xl bg-slate-100 border border-[#DCE7F2] text-slate-700 hover:text-slate-900"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src="/logo.jpg"
                  alt="VigilAMC"
                  className="h-8 w-auto rounded-lg border border-[#DCE7F2] shadow-xs"
                />
              )}
              <div className="truncate">
                <span className="font-extrabold text-sm text-slate-900 block truncate leading-tight">
                  {selectedBuilding ? selectedBuilding.name : 'VigilAMC Field App'}
                </span>
                <span className="text-[11px] text-[#0077B6] font-semibold truncate block">
                  {userProfile?.fullName || 'Technician'} ({userProfile?.employeeId || 'STAFF'})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {isAdminTester && (
                <Link
                  href="/dashboard"
                  className="px-2.5 py-1 rounded-full bg-[#F0F7FF] text-[#0077B6] border border-[#DCE7F2] text-[10px] font-bold hover:bg-[#E1EFFF] transition-all"
                >
                  ← Admin Dashboard
                </Link>
              )}

              {deferredInstallPrompt && (
                <button
                  type="button"
                  onClick={handleInstallApp}
                  className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold flex items-center gap-1 hover:bg-emerald-100"
                >
                  <Download className="w-3 h-3" />
                  <span>Install</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleSignOut}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 border border-[#DCE7F2]"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Persistent Continuous GPS Status Pill */}
          <div
            className={`flex items-center justify-between px-3 py-1.5 rounded-xl border text-[11px] font-mono ${
              gpsStatus === 'LOCKED'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : gpsStatus === 'BASEMENT_CACHED'
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-sky-50 border-sky-200 text-[#0077B6]'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              {gpsStatus === 'LOCKED' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span className="font-bold truncate">
                    GPS Locked: {gpsLocation?.latitude.toFixed(4)}° N, {gpsLocation?.longitude.toFixed(4)}° E (±{gpsLocation?.accuracy}m)
                  </span>
                </>
              ) : gpsStatus === 'BASEMENT_CACHED' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  <span className="font-bold truncate">
                    Basement Mode (Gate Cached ±{gpsLocation?.accuracy}m)
                  </span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#0077B6] animate-spin shrink-0" />
                  <span className="font-semibold truncate">Locking Satellite GPS...</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0 text-[10px] font-sans">
              {isOnline ? (
                <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                  <Wifi className="w-3 h-3" /> Live
                </span>
              ) : (
                <span className="text-amber-700 font-bold flex items-center gap-0.5">
                  <WifiOff className="w-3 h-3" /> Offline ({offlineQueue.length})
                </span>
              )}
              {isSyncingQueue && (
                <span className="ml-1 inline-flex items-center gap-1 text-[#0077B6] font-bold">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Syncing
                </span>
              )}
            </div>
          </div>
        </header>

        {loginError && (
          <div className="mx-3 mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-700 text-xs font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{loginError}</span>
          </div>
        )}

        {/* VIEW A: ASSIGNED BUILDINGS LIST */}
        {!selectedBuilding && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-slate-900">Assigned Facilities</h2>
                <p className="text-xs text-slate-500">Tap a site to start continuous inspection</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#F0F7FF] border border-[#DCE7F2] text-xs font-bold text-[#0077B6]">
                {assignedBuildings.length} Sites
              </span>
            </div>

            {assignedBuildings.length === 0 ? (
              <div className="bg-white border border-[#DCE7F2] rounded-3xl p-8 text-center space-y-3 shadow-sm">
                <Building2 className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800">No Facilities Assigned Yet</h3>
                <p className="text-xs text-slate-500">
                  Your administrator has not assigned specific buildings yet.
                </p>
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
                      className="bg-white border border-[#DCE7F2] rounded-3xl p-4 shadow-sm space-y-3.5 hover:border-[#0077B6] transition-all duration-150 animate-in fade-in"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <h3 className="text-base font-extrabold text-slate-900">{bldg.name}</h3>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-[#0077B6] shrink-0" />
                            <span className="truncate">{bldg.address}</span>
                          </p>
                        </div>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#F0F7FF] text-[#0077B6] border border-[#DCE7F2]">
                          {bldg.totalAssets} Units
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-slate-500 font-bold">
                          <span>Progress: {bldg.checkedCount} / {bldg.totalAssets} Checked</span>
                          <span className="text-[#0077B6]">{percentChecked}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#0077B6] to-emerald-500 rounded-full transition-all duration-300"
                            style={{ width: `${percentChecked}%` }}
                          />
                        </div>
                      </div>

                      {/* Action Button: 52px+ height touch target */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBuilding(bldg);
                          setActiveFloorFilter('ALL');
                        }}
                        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#0077B6] to-[#023E8A] hover:from-[#0096C7] hover:to-[#0077B6] text-white font-extrabold text-sm shadow-md shadow-[#0077B6]/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                      >
                        <MapPin className="w-4 h-4 text-white" />
                        <span>📍 Start Site Inspection</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* VIEW B: INSIDE BUILDING — FLOOR TABS + 6-SECOND VISUAL CHECK SHEET */}
        {selectedBuilding && (
          <div className="p-4 space-y-4">
            {/* Building Info Card + Supervisor Signoff Action */}
            <div className="bg-white border border-[#DCE7F2] rounded-2xl p-3 flex items-center justify-between gap-3 shadow-sm">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#0077B6] block">Inspecting Premise</span>
                <h2 className="text-sm font-extrabold text-slate-900 truncate max-w-[200px]">
                  {selectedBuilding.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowSignatureModal(true)}
                className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-sm"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Guard Sign-Off</span>
              </button>
            </div>

            {/* Horizontal Floor / Zone Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveFloorFilter('ALL')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeFloorFilter === 'ALL'
                    ? 'bg-[#0077B6] text-white font-black shadow-sm'
                    : 'bg-white border border-[#DCE7F2] text-slate-700 hover:bg-slate-50'
                }`}
              >
                All Units ({selectedBldgEquipments.length})
              </button>
              {availableFloors.map((fl) => (
                <button
                  key={fl}
                  type="button"
                  onClick={() => setActiveFloorFilter(fl)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    activeFloorFilter === fl
                      ? 'bg-[#0077B6] text-white font-black shadow-sm'
                      : 'bg-white border border-[#DCE7F2] text-slate-700 hover:bg-slate-50'
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
                    className="bg-white border border-[#DCE7F2] rounded-2xl p-4 space-y-3 shadow-sm hover:border-[#0077B6] transition-all duration-150 animate-in fade-in"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-base font-black text-slate-900">{asset.qrCode}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F0F7FF] text-[#0077B6] border border-[#DCE7F2]">
                            {asset.capacity || asset.type}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">{asset.location || 'Location not specified'}</p>
                      </div>

                      {isChecked ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>DONE</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-extrabold">
                          PENDING
                        </span>
                      )}
                    </div>

                    {/* Big Action Tap Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveAssetInspection(asset);
                        setInspStatus('PASSED');
                        setSelectedIssues([]);
                        setPressureReading('');
                        setRemarks('');
                        setCapturedPhotoUrl(null);
                      }}
                      className="w-full py-3 rounded-xl bg-[#EAF6FF] hover:bg-[#D5EEFF] text-[#0077B6] border border-[#DCE7F2] font-bold text-xs flex items-center justify-between px-4 transition-all duration-150 active:scale-95"
                    >
                      <span>⚡ Open 6-Sec Inspection Form</span>
                      <ChevronRight className="w-4 h-4 text-[#0077B6]" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          MODAL: 6-SECOND VISUAL CHECK SHEET (GIANT BUTTONS + DEFECT CHIPS + CAMERA)
      ========================================================================= */}
      {activeAssetInspection && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end sm:justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-[#DCE7F2] rounded-t-3xl sm:rounded-3xl max-w-md w-full mx-auto p-5 space-y-4 max-h-[92vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE7F2]">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#0077B6] block font-mono">
                  {activeAssetInspection.qrCode} • {activeAssetInspection.capacity}
                </span>
                <h3 className="text-base font-black text-slate-900">{activeAssetInspection.location}</h3>
              </div>
              <button
                type="button"
                onClick={closeInspectionModal}
                className="p-1.5 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-800"
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
                className={`py-4 px-3 rounded-2xl font-black text-sm flex flex-col items-center justify-center gap-1.5 transition-all border-2 ${
                  inspStatus === 'PASSED'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg scale-[1.02]'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                <CheckCircle2 className="w-6 h-6" />
                <span>🟢 ✓ PASS / OK</span>
              </button>

              <button
                type="button"
                onClick={() => setInspStatus('FAILED')}
                className={`py-4 px-3 rounded-2xl font-black text-sm flex flex-col items-center justify-center gap-1.5 transition-all border-2 ${
                  inspStatus === 'FAILED'
                    ? 'bg-red-600 text-white border-red-500 shadow-lg scale-[1.02]'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                <AlertTriangle className="w-6 h-6" />
                <span>🔴 ⚠ DEFECT / REFILL</span>
              </button>
            </div>

            {/* Visual Defect Chips (Shown when DEFECT is chosen) */}
            {inspStatus === 'FAILED' && (
              <div className="space-y-2 p-3 bg-red-50/60 rounded-2xl border border-red-200">
                <span className="text-[11px] font-bold text-red-800 uppercase tracking-wide block">
                  Select Visual Defect Reason:
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
                        className={`p-2.5 rounded-xl border text-left font-bold flex items-center gap-2 transition-all ${
                          isSel
                            ? 'bg-red-600 text-white border-red-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
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

            {/* Camera Photo with Stamped GPS & Watermark */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Evidence Photo (Rear Camera Stamped)
              </span>

              {capturedPhotoUrl ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-300 shadow-xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={capturedPhotoUrl} alt="Inspection Watermarked" className="w-full h-44 object-cover" />
                  <button
                    type="button"
                    onClick={() => setCapturedPhotoUrl(null)}
                    className="absolute top-2 right-2 px-2.5 py-1 bg-black/75 text-white rounded-lg text-xs font-bold"
                  >
                    Retake
                  </button>
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
                    className="w-full py-4 rounded-2xl bg-[#F4F8FB] border-2 border-dashed border-[#DCE7F2] hover:border-[#0077B6] text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-all"
                  >
                    <Camera className="w-5 h-5 text-[#0077B6]" />
                    <span>{isProcessingPhoto ? 'Burning Watermark...' : '📸 Open Camera & Stamp GPS'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Optional Voice Notes / Remarks */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Notes / Audio Speech Note</span>
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 ${
                    isListeningMic ? 'bg-red-500 text-white animate-pulse' : 'bg-[#F0F7FF] text-[#0077B6] border border-[#DCE7F2]'
                  }`}
                >
                  {isListeningMic ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                  <span>{isListeningMic ? 'Stop Recording' : '🎤 Speak Voice Note'}</span>
                </button>
              </div>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Optional observation (or speak using mic above)..."
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0077B6] focus:border-[#0077B6]"
              />
            </div>

            {/* Final Submit Button */}
            <button
              type="button"
              disabled={submittingInspection || isProcessingPhoto}
              onClick={handleSubmitChecksheet}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#0E9F6E] to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-sm shadow-xl transition-all duration-150 active:scale-95 flex items-center justify-center gap-2"
            >
              {submittingInspection ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Logging Inspection...</span>
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  <span>Save Inspection ({inspStatus === 'PASSED' ? 'PASS' : 'DEFECT'})</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: GUARD / SUPERVISOR FINGER SIGNATURE PAD
      ========================================================================= */}
      {showSignatureModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#DCE7F2] rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#DCE7F2] pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Facility Guard Sign-Off</h3>
                <p className="text-xs text-slate-500">Site Facility Manager / Security Guard signs on glass</p>
              </div>
              <button
                type="button"
                onClick={() => setShowSignatureModal(false)}
                className="p-1 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Guard / Supervisor Name</label>
                <input
                  type="text"
                  value={guardName}
                  onChange={(e) => setGuardName(e.target.value)}
                  placeholder="e.g. Surender Singh (Security Head)"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0077B6] focus:border-[#0077B6]"
                />
              </div>

              {/* Touch Canvas Pad */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-slate-700 font-bold">Finger Touch Signature *</label>
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="text-[11px] text-[#0077B6] font-bold hover:underline"
                  >
                    Clear Signature
                  </button>
                </div>
                <div className="bg-[#F8FAFC] border-2 border-dashed border-[#DCE7F2] rounded-2xl overflow-hidden touch-none">
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
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs shadow-md transition-all"
              >
                Submit Verified Site Sign-Off
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
