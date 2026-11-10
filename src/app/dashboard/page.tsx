// UI 'unslop' pass method by Damir Sokolovsky (@heydamir) — github.com/heydamir/unslop (CC BY 4.0)
'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { createClient } from '@/lib/supabase/client';
import {
  Building2,
  Settings as SettingsIcon,
  LayoutDashboard,
  Minus,
  Plus,
  CheckCircle2,
  RefreshCw,
  LogOut,
  Menu,
  FileSpreadsheet,
  Bell,
  Sparkles,
  MessageSquare,
  Camera,
  Users,
  ClipboardList,
  Calendar,
  UserCheck,
  Flame,
  FileText,
  X,
  Wrench,
  AlertTriangle,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react';
import { AdminSidebar, AdminNavTab } from '@/components/admin/AdminSidebar';
import { WorkspaceTabs, WorkspaceTabItem } from '@/components/admin/WorkspaceTabs';
import { MinimizeTray, MinimizedItem } from '@/components/admin/MinimizeTray';
import dynamic from 'next/dynamic';
import type { ImportType } from '@/lib/excelImport';
import { INDIAN_STATES_AND_UTS, REPORTING_CYCLES } from '@/lib/constants/india';
import { isDuplicateSubmission, clearSubmissionLock } from '@/lib/submissionGuard';
import {
  toCalendarDateInput,
  getCalendarDayDiff,
  formatCalendarDate,
} from '@/lib/dateUtils';
import {
  toDateInputString,
  addCalendarMonths,
  addCalendarDays,
  calendarDayDiff,
  todayCalendarDateString,
  fromDbDate,
} from '@/lib/dates';
import { getAdminDictionary } from '@/lib/i18n/admin';
import { WelcomeTestingModal } from '@/components/admin/WelcomeTestingModal';

const DashboardOverview = dynamic(
  () => import('@/components/admin/DashboardOverview').then((m) => m.DashboardOverview),
  {
    loading: () => (
      <div className="space-y-6 animate-pulse">
        <div className="h-44 bg-slate-100 rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="h-28 bg-slate-100 rounded-2xl" />
          <div className="h-28 bg-slate-100 rounded-2xl" />
          <div className="h-28 bg-slate-100 rounded-2xl" />
          <div className="h-28 bg-slate-100 rounded-2xl" />
        </div>
      </div>
    ),
    ssr: false,
  }
);

const WorkOrdersView = dynamic(
  () => import('@/components/admin/WorkOrdersView').then((m) => m.WorkOrdersView),
  { loading: () => <div className="h-96 bg-slate-100 rounded-2xl animate-pulse" />, ssr: false }
);

const InspectionsView = dynamic(
  () => import('@/components/admin/InspectionsView').then((m) => m.InspectionsView),
  { loading: () => <div className="h-96 bg-slate-100 rounded-2xl animate-pulse" />, ssr: false }
);

const ApprovalsQueueView = dynamic(
  () => import('@/components/admin/ApprovalsQueueView').then((m) => m.ApprovalsQueueView),
  { loading: () => <div className="h-96 bg-slate-100 rounded-2xl animate-pulse" />, ssr: false }
);

const CorrectiveActionsBoard = dynamic(
  () => import('@/components/admin/CorrectiveActionsBoard').then((m) => m.CorrectiveActionsBoard),
  { loading: () => <div className="h-96 bg-slate-100 rounded-2xl animate-pulse" />, ssr: false }
);

const ExpiryRadarView = dynamic(
  () => import('@/components/admin/ExpiryRadarView').then((m) => m.ExpiryRadarView),
  { loading: () => <div className="h-96 bg-slate-100 rounded-2xl animate-pulse" />, ssr: false }
);

const FloorPlansModal = dynamic(
  () => import('@/components/admin/FloorPlansModal').then((m) => m.FloorPlansModal),
  { ssr: false }
);

const ReportsView = dynamic(
  () => import('@/components/admin/ReportsView').then((m) => m.ReportsView),
  { loading: () => <div className="h-96 bg-slate-100 rounded-2xl animate-pulse" />, ssr: false }
);

const ClientsView = dynamic(
  () => import('@/components/admin/ClientsView').then((m) => m.ClientsView),
  { loading: () => <div className="h-96 bg-slate-100 rounded-2xl animate-pulse" />, ssr: false }
);

const BuildingsView = dynamic(
  () => import('@/components/admin/BuildingsView').then((m) => m.BuildingsView),
  { loading: () => <div className="h-96 bg-slate-100 rounded-2xl animate-pulse" />, ssr: false }
);

const FireAssetsView = dynamic(
  () => import('@/components/admin/FireAssetsView').then((m) => m.FireAssetsView),
  { loading: () => <div className="h-96 bg-slate-100 rounded-2xl animate-pulse" />, ssr: false }
);

const SettingsView = dynamic(
  () => import('@/components/admin/SettingsView').then((m) => m.SettingsView),
  { loading: () => <div className="h-96 bg-slate-100 rounded-2xl animate-pulse" />, ssr: false }
);

const ClientPortalAdminPanel = dynamic(
  () => import('@/components/admin/ClientPortalAdminPanel').then((m) => m.ClientPortalAdminPanel),
  { loading: () => <div className="h-96 bg-slate-100 rounded-2xl animate-pulse" />, ssr: false }
);

const TechnicianManagement = dynamic(
  () => import('@/components/admin/TechnicianManagement').then((m) => m.TechnicianManagement),
  { loading: () => <div className="h-96 bg-slate-100 rounded-2xl animate-pulse" />, ssr: false }
);

const TechnicianAssignments = dynamic(
  () => import('@/components/admin/TechnicianAssignments').then((m) => m.TechnicianAssignments),
  { loading: () => <div className="h-96 bg-slate-100 rounded-2xl animate-pulse" />, ssr: false }
);

const TechnicianActivityLog = dynamic(
  () => import('@/components/admin/TechnicianActivityLog').then((m) => m.TechnicianActivityLog),
  { loading: () => <div className="h-96 bg-slate-100 rounded-2xl animate-pulse" />, ssr: false }
);

const ExportModal = dynamic(
  () => import('@/components/admin/ExportModal').then((m) => m.ExportModal),
  { ssr: false }
);

const ImportModal = dynamic(
  () => import('@/components/admin/ImportModal').then((m) => m.ImportModal),
  { ssr: false }
);

const FeedbackModal = dynamic(
  () => import('@/components/admin/FeedbackModal').then((m) => m.FeedbackModal),
  { ssr: false }
);

const GuideModal = dynamic(
  () => import('@/components/admin/GettingStartedGuide').then((m) => m.GuideModal),
  { ssr: false }
);

const LAST_ORG_CACHE_KEY = 'vigilamc_dash_last_org';

// Shared date helpers imported directly from @/lib/dates

function getEquipmentLiveStatus(eq: any) {
  if (!eq) return { text: 'Not Inspected', cls: 'bg-[#FFF8F2] text-slate-700 border border-[#FED7AA]' };
  const diffDays = getCalendarDayDiff(eq.nextDueDate);
  const isOverdue = (diffDays !== null && diffDays < 0) || eq.status === 'OVERDUE' || eq.liveStatus === 'OVERDUE';
  const isDueSoon = !isOverdue && ((diffDays !== null && diffDays <= 30) || eq.status === 'DUE_SOON' || eq.liveStatus === 'DUE_SOON');
  const isVerified = !isOverdue && !isDueSoon && (eq.status === 'VERIFIED' || eq.status === 'COMPLIANT' || eq.liveStatus === 'COMPLIANT' || eq.liveStatus === 'VERIFIED');

  if (isOverdue) {
    return { text: 'OVERDUE', cls: 'bg-rose-50 text-[#B91C1C] border border-[#B91C1C]/30' };
  }
  if (isDueSoon) {
    return { text: 'DUE SOON', cls: 'bg-amber-50 text-amber-800 border border-amber-300' };
  }
  if (isVerified) {
    return { text: 'Verified', cls: 'bg-emerald-50 text-[#0E9F6E] border border-[#0E9F6E]/30' };
  }
  return { text: 'Not Inspected', cls: 'bg-[#FFF8F2] text-slate-700 border border-[#FED7AA]' };
}

function getTaskStatusChip(status: string) {
  switch (status) {
    case 'COMPLETED':
      return {
        label: 'COMPLETED',
        cls: 'bg-emerald-50 text-[#059669] border border-emerald-300',
      };
    case 'IN_PROGRESS':
      return {
        label: 'IN_PROGRESS',
        cls: 'bg-[#FFF0E6] text-[#C2410C] border border-[#FED7AA]',
      };
    case 'ASSIGNED':
      return {
        label: 'ASSIGNED',
        cls: 'bg-amber-50 text-amber-800 border border-amber-300',
      };
    case 'CANCELLED':
      return {
        label: 'CANCELLED',
        cls: 'bg-rose-50 text-[#DC2626] border border-rose-200 opacity-60',
      };
    default:
      return {
        label: 'OPEN',
        cls: 'bg-slate-100 text-[#64748B] border border-slate-300',
      };
  }
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRevalidating, setIsRevalidating] = useState(false);
  const [expandedBuildingId, setExpandedBuildingId] = useState<string | null>(null);

  // Reactive Dashboard Language (synced from localStorage -> user profile -> fallback 'en')
  const [currentLanguage, setCurrentLanguage] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('vigilamc_admin_language') || 'en';
    }
    return 'en';
  });

  const t = useMemo(() => getAdminDictionary(currentLanguage), [currentLanguage]);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('vigilamc_admin_language') : null;
    if (!stored && data?.profile?.preferredLanguage) {
      setCurrentLanguage(data.profile.preferredLanguage);
    }
  }, [data?.profile?.preferredLanguage]);

  const handleLanguageChange = useCallback((code: string) => {
    setCurrentLanguage(code);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('vigilamc_admin_language', code);
      } catch {}
    }
    setData((prev: any) => {
      if (!prev) return prev;
      return {
        ...prev,
        profile: prev.profile ? { ...prev.profile, preferredLanguage: code } : prev.profile,
      };
    });
  }, []);

  // Theme Mode: Strictly light theme per brand guidelines
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('vigil_dashboard_theme', 'light');
  }, []);

  // Authenticated Admin Navigation Tab (6 Core Groups)
  const [activeTab, setActiveTab] = useState<AdminNavTab>('OVERVIEW');
  const [clientsSitesSubTab, setClientsSitesSubTab] = useState<'BUILDINGS' | 'CLIENTS'>('BUILDINGS');
  const [inspectionsWorkSubTab, setInspectionsWorkSubTab] = useState<
    'INSPECTIONS' | 'APPROVALS' | 'FINDINGS' | 'RADAR' | 'REPAIRS'
  >('INSPECTIONS');
  const [inspectionsMainTab, setInspectionsMainTab] = useState<'INSPECTIONS' | 'REPAIRS'>('INSPECTIONS');
  const [techniciansSubTab, setTechniciansSubTab] = useState<'TEAM' | 'ASSIGNMENTS' | 'ACTIVITY'>('TEAM');
  const [clientFilter, setClientFilter] = useState<{ id: string; name: string } | null>(null);
  const [floorPlansBuilding, setFloorPlansBuilding] = useState<any | null>(null);
  const [prefillFinding, setPrefillFinding] = useState<any | null>(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [helpMenuOpen, setHelpMenuOpen] = useState(false);
  const [showCorrectiveBoard, setShowCorrectiveBoard] = useState(false);
  const [welcomeModalOpen, setWelcomeModalOpen] = useState(false);
  const welcomeDismissedInSessionRef = React.useRef(false);
  const [isSubmittingBuilding, setIsSubmittingBuilding] = useState(false);
  const [isSubmittingEquip, setIsSubmittingEquip] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);

  // Export Modal Dialog State
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportConfigKey, setExportConfigKey] = useState<string>('FIRE_ASSETS');

  // Excel Import Modal State
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importDataType, setImportDataType] = useState<ImportType>('FIRE_ASSETS');

  const handleOpenImport = (type: ImportType = 'FIRE_ASSETS') => {
    setImportDataType(type);
    setImportModalOpen(true);
  };

  // Real Database Operational KPIs
  const [kpis, setKpis] = useState({
    totalClients: 0,
    totalBuildings: 0,
    totalEquipments: 0,
    activeTechnicians: 0,
    openWorkOrders: 0,
    dueInspections: 0,
    overdueInspections: 0,
    complianceRate: 100,
  });

  // In-memory collections hydrated by /api/dashboard/bootstrap
  const [techniciansList, setTechniciansList] = useState<any[]>([]);
  const [workOrdersList, setWorkOrdersList] = useState<any[]>([]);
  const [inspectionsList, setInspectionsList] = useState<any[]>([]);
  const [correctiveActionsList, setCorrectiveActionsList] = useState<any[]>([]);
  const [clientsList, setClientsList] = useState<any[]>([]);
  const [equipmentsList, setEquipmentsList] = useState<any[]>([]);
  const [equipSearch, setEquipSearch] = useState('');
  const [equipFilterBuilding, setEquipFilterBuilding] = useState('ALL');

  // Modals
  const [addBuildingModalOpen, setAddBuildingModalOpen] = useState(false);
  const [bulkAddModalOpen, setBulkAddModalOpen] = useState<any>(null);
  const [singleAddEquipModalOpen, setSingleAddEquipModalOpen] = useState<any>(null);
  const [editClientModal, setEditClientModal] = useState<any>(null);
  const [editBuildingModal, setEditBuildingModal] = useState<any>(null);
  const [editEquipmentModal, setEditEquipmentModal] = useState<any>(null);
  const [editEquipDueDateMode, setEditEquipDueDateMode] = useState<'auto' | 'manual'>('auto');
  const [compressingPhoto, setCompressingPhoto] = useState(false);

  const prefersReducedMotion = useReducedMotion();

  // Assign task inside Edit Equipment state
  const [assignTaskOpen, setAssignTaskOpen] = useState(false);
  const [assigningTask, setAssigningTask] = useState(false);
  const [assignTaskForm, setAssignTaskForm] = useState({
    technicianId: '',
    type: 'Routine Inspection',
    dueDate: addCalendarDays(todayCalendarDateString(), 7),
    notes: '',
  });

  const ensureTechniciansLoaded = useCallback(async () => {
    if (techniciansList.length > 0) return;
    try {
      const res = await fetch('/api/admin/technicians');
      const data = await res.json().catch(() => ({}));
      if (res.ok && Array.isArray(data.technicians)) {
        setTechniciansList(data.technicians);
      }
    } catch {}
  }, [techniciansList.length]);

  const recentTasksForAsset = useMemo(() => {
    if (!editEquipmentModal) return [];
    return workOrdersList
      .filter((wo) => wo.equipmentId === editEquipmentModal.id || wo.equipment?.id === editEquipmentModal.id)
      .slice(0, 3);
  }, [workOrdersList, editEquipmentModal]);

  const handleAssignTaskInsideModal = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editEquipmentModal) return;
    if (!assignTaskForm.technicianId) {
      toast.error('Please select a technician');
      showToast('Please select a technician');
      return;
    }
    setAssigningTask(true);
    try {
      const selectedTech = techniciansList.find((t) => t.id === assignTaskForm.technicianId);
      const techName = selectedTech?.fullName || selectedTech?.email || 'Technician';

      const payload = {
        equipmentId: editEquipmentModal.id,
        buildingId: editEquipmentModal.buildingId || editEquipmentModal.building?.id,
        assignedToId: assignTaskForm.technicianId,
        technicianId: assignTaskForm.technicianId,
        type: assignTaskForm.type,
        dueDate: assignTaskForm.dueDate,
        notes: assignTaskForm.notes,
        status: 'ASSIGNED',
      };

      const res = await fetch('/api/work-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error || 'Failed to assign task');
      }

      if (json.workOrder) {
        const enriched = {
          ...json.workOrder,
          assignedTo: json.workOrder.assignedTo || (selectedTech ? { id: selectedTech.id, fullName: selectedTech.fullName, email: selectedTech.email } : undefined),
        };
        setWorkOrdersList((prev) => [enriched, ...prev]);
      }

      toast.success(`Task assigned to ${techName} for ${editEquipmentModal.qrCode}`);
      showToast(`Task assigned to ${techName} for ${editEquipmentModal.qrCode}`);

      // Reset form fields
      setAssignTaskForm({
        technicianId: '',
        type: 'Routine Inspection',
        dueDate: addCalendarDays(todayCalendarDateString(), 7),
        notes: '',
      });
      refreshDashboard({ silent: true });
    } catch (err: any) {
      console.error(err);
      const msg = err.message || 'Failed to assign task';
      toast.error(msg);
      showToast(msg);
    } finally {
      setAssigningTask(false);
    }
  };
  // Notification / Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    const isErr = /fail|error|invalid|could not|denied|unauth/i.test(msg);
    if (isErr) {
      toast.error(msg, { duration: 5500 });
    } else {
      toast.success(msg);
    }
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Add building form state
  const [buildingForm, setBuildingForm] = useState({
    clientName: '',
    contactPerson: '',
    phone: '',
    email: '',
    buildingName: '',
    address: '',
    state: 'Delhi',
    reportingCycle: 'Quarterly',
    complianceRuleName: '',
    complianceCycle: 'Quarterly',
    cycleIntervalMos: 3,
  });

  // Bulk add equipment form state
  const [equipmentForm, setEquipmentForm] = useState({
    type: 'Fire Extinguisher',
    capacity: 'ABC Dry Powder 6kg',
    prefix: '',
    count: 10,
    locationBase: 'Floor Landing Corridor',
    serviceIntervalMonths: 12,
    lastServiceDate: toDateInputString(new Date()),
    nextDueDate: addCalendarMonths(toDateInputString(new Date()), 12),
  });

  // Single add equipment form state
  const [singleEquipForm, setSingleEquipForm] = useState({
    qrCode: '',
    type: 'Fire Extinguisher',
    capacity: 'ABC Dry Powder 6kg',
    location: '',
    serviceIntervalMonths: 12,
    lastServiceDate: toDateInputString(new Date()),
    nextDueDate: addCalendarMonths(toDateInputString(new Date()), 12),
    photoUrl: '',
  });

  // Company profile form state
  const [companyForm, setCompanyForm] = useState({
    name: '',
    fullName: '',
    licenseNumber: '',
    phone: '',
    email: '',
    address: '',
    brandLogoUrl: '',
    signatoryName: '',
    signatoryDesignation: '',
    signatorySignatureUrl: '',
    reportFooterText: '',
    autoSchedulingEnabled: true,
  });

  const applyBootstrapPayload = useCallback(
    (json: any) => {
      setData(json);
      if (json.kpis) setKpis(json.kpis);
      if (Array.isArray(json.clients)) setClientsList(json.clients);
      if (Array.isArray(json.equipments)) setEquipmentsList(json.equipments);
      if (Array.isArray(json.inspections)) setInspectionsList(json.inspections);
      if (Array.isArray(json.correctiveActions)) setCorrectiveActionsList(json.correctiveActions);
      if (Array.isArray(json.workOrders)) setWorkOrdersList(json.workOrders);
      if (Array.isArray(json.technicians)) setTechniciansList(json.technicians);
      if (json.subscription) setSubscriptionData(json.subscription);

      const rawName = json.profile?.fullName?.trim();
      const emailPrefix = json.user?.email?.split('@')[0] || '';
      const cleanName =
        rawName && rawName.toLowerCase() !== 'jordan michael'
          ? rawName
          : emailPrefix
          ? emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1)
          : '';

      if (json.company) {
        setCompanyForm({
          name: json.company.name || '',
          fullName: cleanName,
          licenseNumber: json.company.licenseNumber || '',
          phone: json.company.phone || '',
          email: json.company.email || '',
          address: json.company.address || '',
          brandLogoUrl: json.company.brandLogoUrl || '',
          signatoryName: json.company.signatoryName || '',
          signatoryDesignation: json.company.signatoryDesignation || '',
          signatorySignatureUrl: json.company.signatorySignatureUrl || '',
          reportFooterText: json.company.reportFooterText || '',
          autoSchedulingEnabled: json.company.autoSchedulingEnabled !== false,
        });
      }

      setExpandedBuildingId((prev) => {
        if (!prev && json.buildings?.length > 0) {
          return json.buildings[0].id;
        }
        return prev;
      });
    },
    []
  );

  const handleDismissWelcome = useCallback((seenAtIso: string) => {
    try {
      localStorage.setItem('vigilamc_welcome_seen', 'true');
    } catch {
      // ignore
    }
    welcomeDismissedInSessionRef.current = true;
    setWelcomeModalOpen(false);
    setData((prev: any) => {
      if (!prev) return prev;
      const next = {
        ...prev,
        profile: prev.profile ? { ...prev.profile, welcomeSeenAt: seenAtIso } : prev.profile,
      };
      try {
        const orgKey = next.company?.id || next.user?.id || 'default';
        sessionStorage.setItem(`vigilamc_dash_cache_${orgKey}`, JSON.stringify(next));
      } catch {
        // Ignore sessionStorage errors
      }
      return next;
    });
  }, []);

  // Unified stale-while-revalidate dashboard refresh helper
  const refreshDashboard = useCallback(
    async (options?: { silent?: boolean }) => {
      const isSilent = options?.silent ?? Boolean(data);
      try {
        if (isSilent) {
          setIsRevalidating(true);
        } else {
          setLoading(true);
        }

        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession().catch(() => ({ data: { session: null } }));
        const authHeaders: Record<string, string> = {};
        if (session?.access_token) {
          authHeaders['Authorization'] = `Bearer ${session.access_token}`;
        }

        const res = await fetch('/api/dashboard/bootstrap', {
          cache: 'no-store',
          headers: authHeaders,
        });

        if (res.status === 401) {
          window.location.href = '/login?redirect=/dashboard';
          return;
        }

        const json = await res.json();
        if (json.authenticated === false) {
          window.location.href = '/login?redirect=/dashboard';
          return;
        }

        // If user is a TECHNICIAN, redirect back to login (technicians use VigilAMC Field Android app)
        if (json.profile?.role === 'TECHNICIAN') {
          window.location.href = '/login';
          return;
        }

        applyBootstrapPayload(json);

        const hasSeenLocal = typeof window !== 'undefined' && localStorage.getItem('vigilamc_welcome_seen') === 'true';
        if (
          !hasSeenLocal &&
          !welcomeDismissedInSessionRef.current &&
          json.profile &&
          json.profile.role !== 'TECHNICIAN' &&
          json.profile.welcomeSeenAt === null
        ) {
          setWelcomeModalOpen(true);
        } else if (json.profile?.welcomeSeenAt || hasSeenLocal) {
          setWelcomeModalOpen(false);
        }

        // Cache snapshot in sessionStorage keyed by organization/user ID
        try {
          const orgKey = json.company?.id || json.user?.id || 'default';
          sessionStorage.setItem(LAST_ORG_CACHE_KEY, orgKey);
          sessionStorage.setItem(`vigilamc_dash_cache_${orgKey}`, JSON.stringify(json));
          sessionStorage.setItem(`vigilamc_dash_cache_ts_${orgKey}`, String(Date.now()));
        } catch {
          // Ignore sessionStorage quota issues
        }
      } catch (e) {
        console.error('Failed to refresh dashboard bootstrap:', e);
      } finally {
        setLoading(false);
        setIsRevalidating(false);
      }
    },
    [applyBootstrapPayload, data]
  );

  // Initial mount: paint immediately from sessionStorage if available (<50ms), then revalidate silently
  useEffect(() => {
    let hydratedFromCache = false;
    let isFreshPrewarmedCache = false;
    try {
      const lastOrg = sessionStorage.getItem(LAST_ORG_CACHE_KEY);
      if (lastOrg) {
        const cachedRaw = sessionStorage.getItem(`vigilamc_dash_cache_${lastOrg}`);
        const cachedTs = Number(sessionStorage.getItem(`vigilamc_dash_cache_ts_${lastOrg}`) || '0');
        if (cachedRaw) {
          const cachedJson = JSON.parse(cachedRaw);
          if (cachedJson && cachedJson.authenticated) {
            applyBootstrapPayload(cachedJson);
            setLoading(false);
            hydratedFromCache = true;
            if (cachedTs && Date.now() - cachedTs < 8000) {
              isFreshPrewarmedCache = true;
            }
          }
        }
      }
    } catch {
      // Ignore cache read error
    }

    if (!isFreshPrewarmedCache) {
      refreshDashboard({ silent: hydratedFromCache });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Instant 0ms in-memory equipment filtering for FireAssetsView
  const filteredEquipmentsList = useMemo(() => {
    return equipmentsList.filter((eq) => {
      if (equipFilterBuilding !== 'ALL' && eq.buildingId !== equipFilterBuilding) {
        return false;
      }
      if (equipSearch.trim()) {
        const q = equipSearch.trim().toLowerCase();
        const matchesQr = eq.qrCode?.toLowerCase().includes(q);
        const matchesLoc = eq.location?.toLowerCase().includes(q);
        const matchesCap = eq.capacity?.toLowerCase().includes(q);
        const matchesType = eq.type?.toLowerCase().includes(q);
        if (!matchesQr && !matchesLoc && !matchesCap && !matchesType) {
          return false;
        }
      }
      return true;
    });
  }, [equipmentsList, equipFilterBuilding, equipSearch]);

  const handleOpenExport = (key?: string) => {
    if (key) {
      setExportConfigKey(key);
    } else {
      const tabMap: Record<string, string> = {
        OVERVIEW: 'FIRE_ASSETS',
        HOME: 'FIRE_ASSETS',
        CLIENTS_SITES: clientsSitesSubTab === 'BUILDINGS' ? 'BUILDINGS' : 'CLIENTS',
        SITES: 'BUILDINGS',
        FIRE_EQUIPMENT: 'FIRE_ASSETS',
        INSPECTIONS_WORK: inspectionsWorkSubTab === 'INSPECTIONS' ? 'INSPECTIONS' : 'WORK_ORDERS',
        INSPECTIONS: 'INSPECTIONS',
        REPAIRS: 'WORK_ORDERS',
        FIELD_TEAM: 'TECHNICIANS',
        REPORTS: 'FIRE_ASSETS',
        SETTINGS: 'CLIENTS',
      };
      setExportConfigKey(tabMap[activeTab] || 'FIRE_ASSETS');
    }
    setExportModalOpen(true);
  };

  const handleLogout = async () => {
    try {
      sessionStorage.removeItem(LAST_ORG_CACHE_KEY);
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = '/login';
    } catch (e) {
      console.error(e);
      window.location.href = '/login';
    }
  };

  // Client-side WebP photo compression + Cloudflare R2 CDN upload handler for equipment modals
  const handlePhotoFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    mode: 'SINGLE_ADD' | 'EDIT'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setCompressingPhoto(true);
      const { compressImageToDataUrl, uploadCompressedPhoto } = await import('@/lib/compressImage');
      // Show instant local WebP thumbnail preview while uploading to Cloudflare R2
      const previewDataUrl = await compressImageToDataUrl(file, {
        maxDimension: 1280,
        quality: 0.75,
        mimeType: 'image/webp',
      });
      if (mode === 'SINGLE_ADD') {
        setSingleEquipForm((prev) => ({ ...prev, photoUrl: previewDataUrl }));
      } else {
        setEditEquipmentModal((prev: any) => (prev ? { ...prev, photoUrl: previewDataUrl } : prev));
      }

      const uploaded = await uploadCompressedPhoto(file, 'equipment', {
        maxDimension: 1280,
        quality: 0.75,
        mimeType: 'image/webp',
      });

      if (mode === 'SINGLE_ADD') {
        setSingleEquipForm((prev) => ({ ...prev, photoUrl: uploaded.url }));
      } else {
        setEditEquipmentModal((prev: any) => (prev ? { ...prev, photoUrl: uploaded.url } : prev));
      }
      showToast('Equipment photo uploaded successfully!');
    } catch (err: any) {
      console.error('Photo upload failed:', err);
      showToast(err?.message || 'Could not upload photo, please try another image.');
    } finally {
      setCompressingPhoto(false);
    }
  };

  // Company Profile Update
  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/company', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyForm),
      });
      const resData = await res.json().catch(() => ({}));
      if (res.ok && resData.success) {
        showToast('AMC Company Profile saved successfully!');
        refreshDashboard({ silent: true });
      } else {
        showToast(resData.error || 'Failed to update company');
      }
    } catch (e: any) {
      console.error(e);
      showToast(e?.message || 'Failed to update company');
    }
  };

  // Create Client & Building with duplicate prevention
  const handleCreateBuilding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingBuilding) return;

    const dedupeKey = `create-building-${buildingForm.clientName.trim().toLowerCase()}-${buildingForm.buildingName.trim().toLowerCase()}`;
    if (isDuplicateSubmission(dedupeKey, 3000)) {
      showToast('Registration is already processing. Please wait.');
      return;
    }

    try {
      setIsSubmittingBuilding(true);
      const res = await fetch('/api/admin/buildings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildingForm),
      });
      const resData = await res.json().catch(() => ({}));
      if (res.ok && resData.success) {
        setAddBuildingModalOpen(false);
        showToast(`Building '${buildingForm.buildingName}' created successfully.`);
        setBuildingForm({
          clientName: '',
          contactPerson: '',
          phone: '',
          email: '',
          buildingName: '',
          address: '',
          state: 'Delhi',
          reportingCycle: 'Quarterly',
          complianceRuleName: '',
          complianceCycle: 'Quarterly',
          cycleIntervalMos: 3,
        });
        refreshDashboard({ silent: true });
      } else {
        clearSubmissionLock(dedupeKey);
        showToast(resData.error || 'Failed to create building');
      }
    } catch (e: any) {
      clearSubmissionLock(dedupeKey);
      console.error(e);
      showToast(e?.message || 'Failed to create building');
    } finally {
      setIsSubmittingBuilding(false);
    }
  };

  // Bulk Add Equipment
  const handleBulkAddEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkAddModalOpen) return;
    try {
      const res = await fetch('/api/admin/equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buildingId: bulkAddModalOpen.id,
          ...equipmentForm,
        }),
      });
      const resData = await res.json().catch(() => ({}));
      if (res.ok && resData.success) {
        setBulkAddModalOpen(null);
        showToast(`Added ${resData.count} fire equipment items for ${bulkAddModalOpen.name}`);
        refreshDashboard({ silent: true });
      } else {
        showToast(resData.error || 'Failed to add equipment');
      }
    } catch (e: any) {
      console.error(e);
      showToast(e?.message || 'Failed to add equipment');
    }
  };

  // Single Add Equipment with duplicate prevention
  const handleSingleAddEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleAddEquipModalOpen || isSubmittingEquip) return;

    const dedupeKey = `single-equip-${singleAddEquipModalOpen.id}-${singleEquipForm.qrCode.trim().toLowerCase()}`;
    if (isDuplicateSubmission(dedupeKey, 3000)) {
      showToast('Equipment creation is already processing.');
      return;
    }

    try {
      setIsSubmittingEquip(true);
      const res = await fetch('/api/admin/equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isSingle: true,
          buildingId: singleAddEquipModalOpen.id,
          ...singleEquipForm,
        }),
      });
      const resData = await res.json().catch(() => ({}));
      if (res.ok && resData.success) {
        setSingleAddEquipModalOpen(null);
        showToast(`Added equipment ${singleEquipForm.qrCode}`);
        setSingleEquipForm({
          qrCode: '',
          type: 'Fire Extinguisher',
          capacity: 'ABC Dry Powder 6kg',
          location: '',
          serviceIntervalMonths: 12,
          lastServiceDate: toDateInputString(new Date()),
          nextDueDate: addCalendarMonths(toDateInputString(new Date()), 12),
          photoUrl: '',
        });
        await refreshDashboard({ silent: true });
      } else {
        clearSubmissionLock(dedupeKey);
        showToast(resData.error || 'Failed to add equipment');
      }
    } catch (e: any) {
      clearSubmissionLock(dedupeKey);
      console.error(e);
      showToast(e?.message || 'Failed to add equipment');
    } finally {
      setIsSubmittingEquip(false);
    }
  };

  // Update Client
  const handleUpdateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editClientModal) return;
    try {
      const res = await fetch(`/api/admin/clients/${editClientModal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editClientModal),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success) {
        setEditClientModal(null);
        showToast('Client details updated');
        refreshDashboard({ silent: true });
      } else {
        showToast(json.error || 'Failed to update client');
      }
    } catch (e: any) {
      console.error(e);
      showToast(e?.message || 'Failed to update client');
    }
  };

  // Delete Client
  const handleDeleteClient = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete client '${name}'? This will also delete their buildings and equipment.`)) return;
    const prevClients = clientsList;
    // Optimistic removal
    setClientsList((prev) => prev.filter((c) => c.id !== id));
    try {
      const res = await fetch(`/api/admin/clients/${id}`, { method: 'DELETE' });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success) {
        showToast(`Deleted client '${name}'`);
        refreshDashboard({ silent: true });
      } else {
        setClientsList(prevClients);
        showToast(json.error || 'Failed to delete client');
        refreshDashboard({ silent: true });
      }
    } catch (e: any) {
      console.error(e);
      setClientsList(prevClients);
      showToast(e?.message || 'Failed to delete client');
      refreshDashboard({ silent: true });
    }
  };

  // Update Building
  const handleUpdateBuilding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBuildingModal) return;
    try {
      const res = await fetch(`/api/admin/buildings/${editBuildingModal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editBuildingModal),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success) {
        setEditBuildingModal(null);
        showToast('Building updated successfully');
        refreshDashboard({ silent: true });
      } else {
        showToast(json.error || 'Failed to update building');
      }
    } catch (e: any) {
      console.error(e);
      showToast(e?.message || 'Failed to update building');
    }
  };

  // Delete Building
  const handleDeleteBuilding = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete building '${name}' and all its equipment?`)) return;
    try {
      const res = await fetch(`/api/admin/buildings/${id}`, { method: 'DELETE' });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success) {
        showToast(`Deleted building '${name}'`);
        refreshDashboard({ silent: true });
      } else {
        showToast(json.error || 'Failed to delete building');
        refreshDashboard({ silent: true });
      }
    } catch (e: any) {
      console.error(e);
      showToast(e?.message || 'Failed to delete building');
      refreshDashboard({ silent: true });
    }
  };

  // Update Equipment
  const handleUpdateEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editEquipmentModal) return;
    try {
      const res = await fetch(`/api/admin/equipment/${editEquipmentModal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editEquipmentModal),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success) {
        setEditEquipmentModal(null);
        showToast(`Updated equipment ${editEquipmentModal.qrCode}`);
        refreshDashboard({ silent: true });
      } else {
        showToast(json.error || 'Failed to update equipment');
      }
    } catch (e: any) {
      console.error(e);
      showToast(e?.message || 'Failed to update equipment');
    }
  };

  // Delete Equipment
  const handleDeleteEquipment = async (id: string, qrCode: string) => {
    if (!confirm(`Are you sure you want to delete equipment '${qrCode}'?`)) return;
    const prevEquipments = equipmentsList;
    // Optimistic removal
    setEquipmentsList((prev) => prev.filter((eq) => eq.id !== id));
    try {
      const res = await fetch(`/api/admin/equipment/${id}`, { method: 'DELETE' });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success) {
        showToast(`Deleted equipment '${qrCode}'`);
        refreshDashboard({ silent: true });
      } else {
        setEquipmentsList(prevEquipments);
        showToast(json.error || 'Failed to delete equipment');
        refreshDashboard({ silent: true });
      }
    } catch (e: any) {
      console.error(e);
      setEquipmentsList(prevEquipments);
      showToast(e?.message || 'Failed to delete equipment');
      refreshDashboard({ silent: true });
    }
  };

  const summary = data?.summary;
  const buildings = data?.buildings || [];
  const company = data?.company;
  const agencyName = company?.name || 'VigilAMC Operating System';
  const licenseNo = company?.licenseNumber && !company.licenseNumber.startsWith('DL/FIRE/LIC/') ? company.licenseNumber : 'Not Provided';

  // Live reactive KPI computations so any mutation updates Overview & Sidebar in 0ms
  const liveEquipmentMetrics = useMemo(() => {
    const now = new Date();
    let overdue = 0;
    let dueSoon = 0;
    for (const eq of equipmentsList) {
      const diffDays = getCalendarDayDiff(eq.nextDueDate, now);
      if ((diffDays !== null && diffDays < 0) || eq.status === 'OVERDUE' || eq.liveStatus === 'OVERDUE') overdue++;
      else if ((diffDays !== null && diffDays <= 30) || eq.status === 'DUE_SOON' || eq.liveStatus === 'DUE_SOON') dueSoon++;
    }
    return { overdue, dueSoon, total: equipmentsList.length };
  }, [equipmentsList]);

  const liveOpenRepairsCount = useMemo(() => {
    if (workOrdersList.length > 0) {
      return workOrdersList.filter((w) => ['OPEN', 'ASSIGNED', 'IN_PROGRESS'].includes(w.status)).length;
    }
    return kpis.openWorkOrders || 0;
  }, [workOrdersList, kpis.openWorkOrders]);

  const liveAttentionDigest: any[] = data?.attentionDigest || [];

  const liveInspectionsThisWeek = useMemo(() => {
    if (!inspectionsList || inspectionsList.length === 0) {
      return (kpis as any).inspectionsThisWeek ?? 0;
    }
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return inspectionsList.filter((ins) => {
      const rawDate = ins.date || ins.createdAt;
      if (!rawDate) return false;
      const d = new Date(rawDate);
      return !isNaN(d.getTime()) && d >= sevenDaysAgo;
    }).length;
  }, [inspectionsList, kpis]);

  const exportDataMap: Record<string, any[]> = {
    CLIENTS: clientsList,
    BUILDINGS: buildings || [],
    FIRE_ASSETS: equipmentsList,
    TECHNICIANS: techniciansList,
    WORK_ORDERS: workOrdersList,
    INSPECTIONS: inspectionsList,
  };

  // Workspace Multi-Tasking & Minimized State
  const [openTabs, setOpenTabs] = useState<WorkspaceTabItem[]>([
    { id: 'OVERVIEW', minimized: false, lastAccessed: Date.now() },
  ]);
  const [minimizedModals, setMinimizedModals] = useState<string[]>([]);
  const mainRef = React.useRef<HTMLElement>(null);
  const scrollTopMapRef = React.useRef<Record<string, number>>({});
  const initialEquipmentRef = React.useRef<any>(null);
  const initialBuildingRef = React.useRef<any>(null);

  // Restore workspace layout from localStorage on initial mount, but always land on OVERVIEW first
  useEffect(() => {
    try {
      const saved = localStorage.getItem('vigilamc:workspace-tabs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const validIds: AdminNavTab[] = [
            'OVERVIEW',
            'CLIENTS_SITES',
            'FIRE_EQUIPMENT',
            'INSPECTIONS_WORK',
            'FIELD_TEAM',
            'CLIENT_PORTAL',
            'REPORTS',
            'SETTINGS',
          ];
          const otherValidTabs = parsed
            .filter((t: any) => validIds.includes(t.id) && t.id !== 'OVERVIEW')
            .slice(0, 5)
            .map((t: any) => ({
              id: t.id as AdminNavTab,
              minimized: !!t.minimized,
              lastAccessed: Date.now() - 1000,
            }));

          setOpenTabs([
            { id: 'OVERVIEW', minimized: false, lastAccessed: Date.now() },
            ...otherValidTabs,
          ]);
        }
      }
      setActiveTab('OVERVIEW');
    } catch (e) {
      console.warn('Failed to restore workspace tabs', e);
      setActiveTab('OVERVIEW');
    }
  }, []);

  // Persist workspace tabs layout to localStorage (layout only, never form data)
  useEffect(() => {
    try {
      const toSave = openTabs.map((t) => ({ id: t.id, minimized: t.minimized }));
      localStorage.setItem('vigilamc:workspace-tabs', JSON.stringify(toSave));
    } catch {}
  }, [openTabs]);

  // Tab definitions & metadata
  const TAB_CONFIG: Record<string, { label: string; icon: any; badge?: number | string }> = useMemo(
    () => ({
      OVERVIEW: { label: t.navOverview || 'Home', icon: LayoutDashboard },
      CLIENTS_SITES: { label: t.navClients || 'Buildings', icon: Building2 },
      FIRE_EQUIPMENT: { label: t.navEquipment || 'Equipment', icon: Flame },
      INSPECTIONS_WORK: {
        label: t.navInspections || 'Inspections & Repairs',
        icon: CheckCircle2,
        badge: liveOpenRepairsCount > 0 ? liveOpenRepairsCount : undefined,
      },
      FIELD_TEAM: { label: t.navFieldTeam || 'Technicians', icon: Users },
      CLIENT_PORTAL: { label: t.portalNavTab || 'Client Login', icon: ShieldCheck },
      REPORTS: { label: t.navReports || 'Reports', icon: FileText },
      SETTINGS: { label: t.navSettings || 'Settings', icon: SettingsIcon },
      // Legacy alias mappings
      HOME: { label: t.navOverview || 'Home', icon: LayoutDashboard },
      SITES: { label: t.navClients || 'Buildings', icon: Building2 },
      BUILDINGS: { label: t.navClients || 'Buildings', icon: Building2 },
      EQUIPMENT: { label: t.navEquipment || 'Equipment', icon: Flame },
      INSPECTIONS: { label: t.navInspections || 'Inspections & Repairs', icon: CheckCircle2 },
      REPAIRS: { label: t.navInspections || 'Inspections & Repairs', icon: CheckCircle2 },
      TECHNICIANS: { label: t.navFieldTeam || 'Technicians', icon: Users },
      CLIENT_LOGIN: { label: t.portalNavTab || 'Client Login', icon: ShieldCheck },
    }),
    [liveOpenRepairsCount, t]
  );

  // Open or switch to a section tab (A2 & A3: 6-tab cap with LRU eviction)
  const handleOpenTab = useCallback(
    (rawTab: AdminNavTab | string) => {
      const normalized: AdminNavTab =
        rawTab === 'HOME'
          ? 'OVERVIEW'
          : rawTab === 'SITES' || rawTab === 'BUILDINGS'
          ? 'CLIENTS_SITES'
          : rawTab === 'EQUIPMENT'
          ? 'FIRE_EQUIPMENT'
          : rawTab === 'TECHNICIANS'
          ? 'FIELD_TEAM'
          : rawTab === 'CLIENT_LOGIN'
          ? 'CLIENT_PORTAL'
          : rawTab === 'INSPECTIONS' || rawTab === 'REPAIRS'
          ? 'INSPECTIONS_WORK'
          : (rawTab as AdminNavTab);

      if (rawTab === 'REPAIRS') {
        setInspectionsMainTab('REPAIRS');
        setInspectionsWorkSubTab('REPAIRS');
      } else if (rawTab === 'INSPECTIONS') {
        setInspectionsMainTab('INSPECTIONS');
        setInspectionsWorkSubTab('INSPECTIONS');
      }

      // Save scroll position for currently active tab
      if (mainRef.current) {
        scrollTopMapRef.current[activeTab] = mainRef.current.scrollTop;
      }

      setOpenTabs((prev) => {
        const existingIdx = prev.findIndex((t) => t.id === normalized);
        if (existingIdx !== -1) {
          // Unminimize and focus
          return prev.map((t) =>
            t.id === normalized ? { ...t, minimized: false, lastAccessed: Date.now() } : t
          );
        }

        // Cap check: max 6 tabs open at once
        let nextTabs = [...prev];
        if (nextTabs.length >= 6) {
          const backgroundTabs = nextTabs.filter((t) => t.id !== activeTab);
          const lruTab = backgroundTabs.reduce((oldest, current) => {
            const oldestTime = oldest.lastAccessed || 0;
            const currentTime = current.lastAccessed || 0;
            return currentTime < oldestTime ? current : oldest;
          }, backgroundTabs[0]);

          if (lruTab) {
            nextTabs = nextTabs.filter((t) => t.id !== lruTab.id);
            const lruLabel = TAB_CONFIG[lruTab.id]?.label || 'tab';
            toast.info(`Closed ${lruLabel} to free memory`);
          }
        }

        nextTabs.push({ id: normalized, minimized: false, lastAccessed: Date.now() });
        return nextTabs;
      });

      setActiveTab(normalized);
    },
    [activeTab, TAB_CONFIG]
  );

  const handleSelectTab = (tabId: AdminNavTab) => {
    if (tabId === activeTab) return;
    if (mainRef.current) {
      scrollTopMapRef.current[activeTab] = mainRef.current.scrollTop;
    }
    setOpenTabs((prev) =>
      prev.map((t) => (t.id === tabId ? { ...t, minimized: false, lastAccessed: Date.now() } : t))
    );
    setActiveTab(tabId);
  };

  const handleMinimizeTab = (tabId: AdminNavTab) => {
    if (mainRef.current) {
      scrollTopMapRef.current[tabId] = mainRef.current.scrollTop;
    }

    setOpenTabs((prev) =>
      prev.map((t) => (t.id === tabId ? { ...t, minimized: true } : t))
    );

    if (activeTab === tabId) {
      const remaining = openTabs.filter((t) => t.id !== tabId && !t.minimized);
      if (remaining.length > 0) {
        const nextActive = remaining.reduce((latest, cur) => {
          return (cur.lastAccessed || 0) > (latest.lastAccessed || 0) ? cur : latest;
        }, remaining[0]);
        setActiveTab(nextActive.id);
      } else {
        handleOpenTab('OVERVIEW');
      }
    }
  };

  const handleCloseTab = (tabId: AdminNavTab) => {
    setOpenTabs((prev) => {
      const filtered = prev.filter((t) => t.id !== tabId);
      if (filtered.length === 0) {
        return [{ id: 'OVERVIEW', minimized: false, lastAccessed: Date.now() }];
      }
      return filtered;
    });

    if (activeTab === tabId) {
      const remaining = openTabs.filter((t) => t.id !== tabId && !t.minimized);
      if (remaining.length > 0) {
        setActiveTab(remaining[0].id);
      } else {
        setActiveTab('OVERVIEW');
      }
    }
  };

  const handleCloseOtherTabs = (currentTabId: AdminNavTab) => {
    setOpenTabs((prev) => prev.filter((t) => t.id === currentTabId));
    setActiveTab(currentTabId);
  };

  const handleCloseAllTabs = () => {
    setOpenTabs([{ id: 'OVERVIEW', minimized: false, lastAccessed: Date.now() }]);
    setActiveTab('OVERVIEW');
  };

  const handleResetWorkspace = () => {
    try {
      localStorage.removeItem('vigilamc:workspace-tabs');
    } catch {}
    setOpenTabs([{ id: 'OVERVIEW', minimized: false, lastAccessed: Date.now() }]);
    setActiveTab('OVERVIEW');
    toast.success('Workspace layout reset');
  };

  // Keyboard shortcuts: Ctrl+1..6 quick-switch, Ctrl+W closes active tab
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey) {
        const unminimized = openTabs.filter((t) => !t.minimized);
        if (e.key >= '1' && e.key <= '6') {
          const idx = parseInt(e.key, 10) - 1;
          if (idx < unminimized.length) {
            e.preventDefault();
            handleSelectTab(unminimized[idx].id);
          }
        } else if (e.key.toLowerCase() === 'w') {
          e.preventDefault();
          if (unminimized.length > 1) {
            handleCloseTab(activeTab);
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openTabs, activeTab]);

  // Restore scroll position when activeTab changes
  useEffect(() => {
    const saved = scrollTopMapRef.current[activeTab] || 0;
    if (mainRef.current) {
      mainRef.current.scrollTop = saved;
    }
    const timer = requestAnimationFrame(() => {
      if (mainRef.current) {
        mainRef.current.scrollTop = saved;
      }
    });
    return () => cancelAnimationFrame(timer);
  }, [activeTab]);

  // Dirty dot detection for tab chips (D2)
  const isDirtyTab = useCallback(
    (tabId: AdminNavTab): boolean => {
      if (tabId === 'FIRE_EQUIPMENT') {
        return (
          equipSearch.trim() !== '' ||
          equipFilterBuilding !== 'ALL' ||
          minimizedModals.includes('EDIT_EQUIPMENT') ||
          minimizedModals.includes('ADD_SINGLE_EQUIP')
        );
      }
      if (tabId === 'CLIENTS_SITES') {
        return (
          clientsSitesSubTab !== 'BUILDINGS' ||
          minimizedModals.includes('EDIT_BUILDING') ||
          minimizedModals.includes('ADD_BUILDING')
        );
      }
      if (tabId === 'INSPECTIONS_WORK') {
        return inspectionsWorkSubTab !== 'INSPECTIONS';
      }
      return false;
    },
    [equipSearch, equipFilterBuilding, clientsSitesSubTab, inspectionsWorkSubTab, minimizedModals]
  );

  // Modal minimize and close handlers
  const handleMinimizeModal = (modalKey: string) => {
    setMinimizedModals((prev) => (prev.includes(modalKey) ? prev : [...prev, modalKey]));
  };

  const handleCloseModal = (modalKey: string) => {
    if (modalKey === 'EDIT_EQUIPMENT') {
      const isDirty = Boolean(
        editEquipmentModal &&
          initialEquipmentRef.current &&
          (editEquipmentModal.location !== initialEquipmentRef.current.location ||
            editEquipmentModal.qrCode !== initialEquipmentRef.current.qrCode ||
            editEquipmentModal.type !== initialEquipmentRef.current.type ||
            editEquipmentModal.capacity !== initialEquipmentRef.current.capacity ||
            assignTaskForm.notes !== '' ||
            assignTaskForm.technicianId !== '')
      );
      if (isDirty) {
        if (
          !window.confirm(
            "You have unsaved changes in this equipment draft. Discard them? (You can use 'Minimize' to keep your work.)"
          )
        ) {
          return;
        }
      }
      setEditEquipmentModal(null);
      setAssignTaskOpen(false);
      setMinimizedModals((prev) => prev.filter((m) => m !== 'EDIT_EQUIPMENT'));
    } else if (modalKey === 'EDIT_BUILDING') {
      const isDirty = Boolean(
        editBuildingModal &&
          initialBuildingRef.current &&
          (editBuildingModal.name !== initialBuildingRef.current.name ||
            editBuildingModal.address !== initialBuildingRef.current.address)
      );
      if (isDirty) {
        if (
          !window.confirm(
            "You have unsaved changes in this building draft. Discard them? (You can use 'Minimize' to keep your work.)"
          )
        ) {
          return;
        }
      }
      setEditBuildingModal(null);
      setMinimizedModals((prev) => prev.filter((m) => m !== 'EDIT_BUILDING'));
    } else if (modalKey === 'ADD_SINGLE_EQUIP') {
      const isDirty = Boolean(singleEquipForm.qrCode || singleEquipForm.location);
      if (isDirty) {
        if (
          !window.confirm(
            "You have unsaved equipment details. Discard them? (You can use 'Minimize' to keep your work.)"
          )
        ) {
          return;
        }
      }
      setSingleAddEquipModalOpen(null);
      setSingleEquipForm({
        qrCode: '',
        type: 'Fire Extinguisher',
        capacity: 'ABC Dry Powder 6kg',
        location: '',
        serviceIntervalMonths: 12,
        lastServiceDate: toDateInputString(new Date()),
        nextDueDate: addCalendarMonths(toDateInputString(new Date()), 12),
        photoUrl: '',
      });
      setMinimizedModals((prev) => prev.filter((m) => m !== 'ADD_SINGLE_EQUIP'));
    } else if (modalKey === 'ADD_BUILDING') {
      const isDirty = Boolean(buildingForm.clientName || buildingForm.buildingName);
      if (isDirty) {
        if (
          !window.confirm(
            "You have unsaved registration details. Discard them? (You can use 'Minimize' to keep your work.)"
          )
        ) {
          return;
        }
      }
      setAddBuildingModalOpen(false);
      setMinimizedModals((prev) => prev.filter((m) => m !== 'ADD_BUILDING'));
    } else if (modalKey === 'BULK_ADD') {
      setBulkAddModalOpen(null);
      setMinimizedModals((prev) => prev.filter((m) => m !== 'BULK_ADD'));
    } else if (modalKey === 'IMPORT') {
      setImportModalOpen(false);
      setMinimizedModals((prev) => prev.filter((m) => m !== 'IMPORT'));
    } else if (modalKey === 'EXPORT') {
      setExportModalOpen(false);
      setMinimizedModals((prev) => prev.filter((m) => m !== 'EXPORT'));
    } else if (modalKey === 'EDIT_CLIENT') {
      setEditClientModal(null);
      setMinimizedModals((prev) => prev.filter((m) => m !== 'EDIT_CLIENT'));
    }
  };

  // Minimized tray items aggregation
  const minimizedTrayItems: MinimizedItem[] = useMemo(() => {
    const list: MinimizedItem[] = [];

    // Minimized tabs
    openTabs
      .filter((t) => t.minimized)
      .forEach((t) => {
        const cfg = TAB_CONFIG[t.id];
        if (cfg) {
          list.push({
            id: `tab-${t.id}`,
            type: 'TAB',
            tabId: t.id,
            label: cfg.label,
            icon: cfg.icon,
            badge: cfg.badge,
          });
        }
      });

    // Minimized modals
    if (minimizedModals.includes('EDIT_EQUIPMENT') && editEquipmentModal) {
      list.push({
        id: 'modal-edit-equipment',
        type: 'MODAL',
        modalKey: 'EDIT_EQUIPMENT',
        label: `Edit ${editEquipmentModal.qrCode || 'Asset'}`,
        icon: Flame,
      });
    }
    if (minimizedModals.includes('EDIT_BUILDING') && editBuildingModal) {
      list.push({
        id: 'modal-edit-building',
        type: 'MODAL',
        modalKey: 'EDIT_BUILDING',
        label: `Edit ${editBuildingModal.name || 'Building'}`,
        icon: Building2,
      });
    }
    if (minimizedModals.includes('ADD_SINGLE_EQUIP') && singleAddEquipModalOpen) {
      list.push({
        id: 'modal-add-single-equip',
        type: 'MODAL',
        modalKey: 'ADD_SINGLE_EQUIP',
        label: `Add ${singleEquipForm.qrCode || 'Equipment'}`,
        icon: Plus,
      });
    }
    if (minimizedModals.includes('IMPORT') && importModalOpen) {
      list.push({
        id: 'modal-import',
        type: 'MODAL',
        modalKey: 'IMPORT',
        label: 'Import Excel',
        icon: FileSpreadsheet,
      });
    }
    if (minimizedModals.includes('EXPORT') && exportModalOpen) {
      list.push({
        id: 'modal-export',
        type: 'MODAL',
        modalKey: 'EXPORT',
        label: 'Export Excel',
        icon: FileSpreadsheet,
      });
    }
    if (minimizedModals.includes('ADD_BUILDING') && addBuildingModalOpen) {
      list.push({
        id: 'modal-add-building',
        type: 'MODAL',
        modalKey: 'ADD_BUILDING',
        label: 'Register Building',
        icon: Building2,
      });
    }
    if (minimizedModals.includes('BULK_ADD') && bulkAddModalOpen) {
      list.push({
        id: 'modal-bulk-add',
        type: 'MODAL',
        modalKey: 'BULK_ADD',
        label: 'Bulk Add Equipment',
        icon: Plus,
      });
    }

    return list;
  }, [
    openTabs,
    minimizedModals,
    editEquipmentModal,
    editBuildingModal,
    singleAddEquipModalOpen,
    singleEquipForm.qrCode,
    importModalOpen,
    exportModalOpen,
    addBuildingModalOpen,
    bulkAddModalOpen,
    TAB_CONFIG,
  ]);

  const handleRestoreMinimizedItem = (item: MinimizedItem) => {
    if (item.type === 'TAB' && item.tabId) {
      handleOpenTab(item.tabId);
    } else if (item.type === 'MODAL' && item.modalKey) {
      setMinimizedModals((prev) => prev.filter((m) => m !== item.modalKey));
    }
  };

  const handleCloseMinimizedItem = (item: MinimizedItem) => {
    if (item.type === 'TAB' && item.tabId) {
      handleCloseTab(item.tabId);
    } else if (item.type === 'MODAL' && item.modalKey) {
      handleCloseModal(item.modalKey);
    }
  };

  return (
    <div className="relative h-screen lg:h-dvh overflow-hidden bg-[#FFF8F2] flex flex-col lg:flex-row text-[#1C1917] selection:bg-[#FFF0E6] selection:text-[#C2410C]" style={{ backgroundImage: "radial-gradient(circle at 12% 8%, rgba(232, 89, 12, 0.18) 0%, rgba(255, 140, 66, 0.12) 28%, rgba(255, 248, 242, 0) 60%), radial-gradient(circle at 86% 24%, rgba(255, 140, 66, 0.16) 0%, rgba(255, 248, 242, 0) 55%)" }}>
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1C1917] border-2 border-[#EA580C] text-[#FAFAF9] px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Sidebar permanently mounted */}
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          handleOpenTab(tab);
          setMobileSidebarOpen(false);
        }}
        isMobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        company={company}
        userEmail={data?.user?.email}
        userProfile={data?.profile}
        onLogout={handleLogout}
        openRepairsCount={liveOpenRepairsCount}
        t={t}
      />

      {/* Main Content Area */}
      <main ref={mainRef} className="flex-1 min-w-0 h-full p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
        
        {/* Top Header Bar permanently mounted */}
        <div data-testid="dashboard-glass-topbar" className="glass-panel-dense rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#C2410C]">VigilAMC</span>
                <span className="text-slate-400">/</span>
                <h1 className="text-lg sm:text-xl font-black text-[#1C1917] tracking-tight">
                  {(activeTab === 'OVERVIEW' || activeTab === 'HOME') && (t.navOverview || 'Home')}
                  {(activeTab === 'CLIENTS_SITES' || activeTab === 'SITES' || activeTab === 'BUILDINGS') && (t.navClients || 'Buildings')}
                  {(activeTab === 'FIRE_EQUIPMENT' || activeTab === 'EQUIPMENT') && (t.navEquipment || 'Equipment')}
                  {(activeTab === 'INSPECTIONS_WORK' || activeTab === 'INSPECTIONS' || activeTab === 'REPAIRS') && (t.navInspections || 'Inspections & Repairs')}
                  {(activeTab === 'FIELD_TEAM' || activeTab === 'TECHNICIANS') && (t.navFieldTeam || 'Technicians')}
                  {activeTab === 'REPORTS' && (t.navReports || 'Reports')}
                  {(activeTab === 'CLIENT_PORTAL' || activeTab === 'CLIENT_LOGIN') && (t.portalNavTab || 'Client Login')}
                  {activeTab === 'SETTINGS' && (t.navSettings || 'Settings')}
                </h1>
                {isRevalidating && (
                  <span title="Syncing latest data..." className="inline-flex items-center ml-1">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-400" />
                  </span>
                )}
              </div>
              <p className="text-xs text-[#64748B] mt-0.5">
                Managing operations for <strong className="text-slate-800 font-semibold">{agencyName}</strong>
                {licenseNo && <> &bull; License: <strong className="text-slate-800 font-semibold">{licenseNo}</strong></>}
              </p>
            </div>
          </div>

          {/* Top Bar Controls: Sync, Notifications, Help Menu, Logout */}
          <div className="flex items-center gap-2.5 flex-wrap self-end md:self-auto">
            {/* Sync chip */}
            <button
              type="button"
              data-testid="topbar-sync-btn"
              onClick={() => refreshDashboard({ silent: true })}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all shadow-xs text-xs font-semibold cursor-pointer"
              title="Sync latest records"
              aria-label="Sync latest records"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRevalidating ? 'animate-spin text-[#C2410C]' : 'text-slate-500'}`} />
              <span className="hidden sm:inline">Sync</span>
            </button>

            {/* Notifications Bell */}
            <button
              type="button"
              data-testid="topbar-notifications-btn"
              onClick={() => {
                setActiveTab('OVERVIEW');
                const alertEl = document.getElementById('attention-digest-panel');
                if (alertEl) alertEl.scrollIntoView({ behavior: 'smooth' });
              }}
              className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all shadow-xs cursor-pointer"
              title={`${liveAttentionDigest.length} items requiring attention`}
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 text-slate-600" />
              {liveAttentionDigest.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-[#EA580C] text-[10px] font-bold text-white ring-2 ring-white">
                  {liveAttentionDigest.length}
                </span>
              )}
            </button>

            {/* "?" Help Menu dropdown */}
            <div className="relative">
              <button
                type="button"
                data-testid="topbar-help-menu-btn"
                onClick={() => setHelpMenuOpen(!helpMenuOpen)}
                className="p-2 rounded-xl bg-white hover:bg-[#FFF0E6] text-slate-700 hover:text-[#C2410C] border border-[#FED7AA] transition-all shadow-xs flex items-center justify-center cursor-pointer"
                title="Help &amp; Resources"
                aria-label="Help &amp; Resources"
              >
                <HelpCircle className="w-4 h-4 text-[#C2410C]" />
              </button>
              {helpMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setHelpMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-1 w-56 bg-white border border-[#FED7AA] rounded-2xl shadow-xl z-40 py-1.5 text-xs text-slate-700">
                    <button
                      type="button"
                      data-testid="help-menu-guide"
                      onClick={() => {
                        setHelpMenuOpen(false);
                        setGuideModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-[#FFF0E6] hover:text-[#C2410C] font-semibold text-left transition-colors cursor-pointer"
                    >
                      <HelpCircle className="w-4 h-4 text-[#EA580C]" />
                      <div>
                        <div className="font-bold text-slate-900">Getting Started Guide</div>
                        <div className="text-[10px] text-slate-500 font-normal">Step-by-step checklist &amp; tours</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      data-testid="help-menu-welcome"
                      onClick={() => {
                        setHelpMenuOpen(false);
                        setWelcomeModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-[#FFF0E6] hover:text-[#C2410C] font-semibold text-left transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-[#EA580C]" />
                      <div>
                        <div className="font-bold text-slate-900">Product Tour &amp; Welcome</div>
                        <div className="text-[10px] text-slate-500 font-normal">Interactive feature walkthrough</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      data-testid="help-menu-feedback"
                      onClick={() => {
                        setHelpMenuOpen(false);
                        setFeedbackModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-[#FFF0E6] hover:text-[#C2410C] font-semibold text-left transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4 text-[#EA580C]" />
                      <div>
                        <div className="font-bold text-slate-900">Give Feedback</div>
                        <div className="text-[10px] text-slate-500 font-normal">Report bug or request feature</div>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FFF0E6] hover:bg-[#FED7AA]/70 text-[#C2410C] border border-[#FED7AA] text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4 text-[#C2410C]" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Workspace Tab Strip */}
        <WorkspaceTabs
          openTabs={openTabs}
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          onCloseTab={handleCloseTab}
          onMinimizeTab={handleMinimizeTab}
          onCloseOtherTabs={handleCloseOtherTabs}
          onCloseAllTabs={handleCloseAllTabs}
          onResetWorkspace={handleResetWorkspace}
          tabConfig={TAB_CONFIG}
          isDirtyTab={isDirtyTab}
        />

        {/* Skeleton placeholders ONLY on the very first cold visit when data === null */}
        {loading && !data ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="h-28 rounded-2xl bg-white border border-[#FED7AA] p-5 space-y-3"
                >
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-7 w-16" />
                  <Skeleton className="h-2.5 w-32" />
                </div>
              ))}
            </div>
            <div className="rounded-2xl bg-white border border-[#FED7AA] p-6 space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {openTabs.map((tab) => {
              const isCurrentActive = tab.id === activeTab && !tab.minimized;
              return (
                <div
                  key={tab.id}
                  id={`workspace-view-${tab.id}`}
                  data-testid={`workspace-view-${tab.id}`}
                  className={`space-y-6 ${isCurrentActive ? 'block' : 'hidden'}`}
                  aria-hidden={!isCurrentActive}
                >
            {/* =========================================================================
                GROUP 1: OVERVIEW SCREEN
            ========================================================================= */}
            {tab.id === 'OVERVIEW' && (
              <DashboardOverview
                kpis={{
                  totalClients: clientsList.length || kpis.totalClients || 0,
                  overdueCount:
                    equipmentsList.length > 0
                      ? liveEquipmentMetrics.overdue
                      : summary?.overdueEquipments ?? kpis.overdueInspections ?? 0,
                  dueSoonCount:
                    equipmentsList.length > 0
                      ? liveEquipmentMetrics.dueSoon
                      : summary?.dueSoonEquipments ?? kpis.dueInspections ?? 0,
                  openRepairsCount: liveOpenRepairsCount,
                  inspectionsThisWeek: liveInspectionsThisWeek,
                  totalInspections: inspectionsList.length || (kpis as any).totalInspections || 0,
                  totalEquipments:
                    equipmentsList.length > 0
                      ? liveEquipmentMetrics.total
                      : summary?.totalEquipments || kpis.totalEquipments,
                  totalBuildings: buildings.length || summary?.totalBuildings || kpis.totalBuildings,
                  activeTechnicians: techniciansList.length || kpis.activeTechnicians,
                }}
                company={company}
                buildings={buildings}
                attentionDigest={data?.attentionDigest || []}
                analytics={data?.analytics}
                t={t}
                onNavigateTab={handleOpenTab}
                onAddEquipment={() => {
                  if (buildings.length > 0) {
                    setSingleAddEquipModalOpen(buildings[0]);
                  } else {
                    setAddBuildingModalOpen(true);
                  }
                }}
                onCreateRepairJob={() => handleOpenTab('REPAIRS')}
                onOpenFeedback={() => setFeedbackModalOpen(true)}
                onOpenImport={() => handleOpenImport('FIRE_ASSETS')}
                onOpenRegisterModal={() => setAddBuildingModalOpen(true)}
                onOpenGuide={() => setGuideModalOpen(true)}
                onOpenRadar={() => {
                  handleOpenTab('INSPECTIONS_WORK');
                  setInspectionsMainTab('INSPECTIONS');
                  setInspectionsWorkSubTab('RADAR');
                }}
              />
            )}

            {/* =========================================================================
                GROUP 2: CLIENTS & SITES
            ========================================================================= */}
            {tab.id === 'CLIENTS_SITES' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#FED7AA] shadow-xs">
                  <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
                    <button
                      onClick={() => setClientsSitesSubTab('BUILDINGS')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                        clientsSitesSubTab === 'BUILDINGS'
                          ? 'bg-[#C2410C] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Buildings ({buildings.length})
                    </button>
                    <button
                      onClick={() => setClientsSitesSubTab('CLIENTS')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                        clientsSitesSubTab === 'CLIENTS'
                          ? 'bg-[#C2410C] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Clients ({clientsList.length})
                    </button>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleOpenImport(clientsSitesSubTab === 'BUILDINGS' ? 'BUILDINGS' : 'CLIENTS')}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FFF0E6] hover:bg-[#FED7AA]/60 text-[#C2410C] border border-[#C2410C]/20 text-xs font-bold transition-all shadow-xs"
                      title="Import from Excel (.xlsx)"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>Import Excel</span>
                    </button>

                    <button
                      onClick={() => handleOpenExport(clientsSitesSubTab === 'BUILDINGS' ? 'BUILDINGS' : 'CLIENTS')}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold transition-all shadow-xs"
                      title="Export to Excel (.xlsx)"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>Export Excel</span>
                    </button>

                    <button
                      onClick={() => setAddBuildingModalOpen(true)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white text-xs font-bold shadow-xs transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{clientsSitesSubTab === 'BUILDINGS' ? 'Add Building' : 'Add Client'}</span>
                    </button>
                  </div>
                </div>

                {clientsSitesSubTab === 'BUILDINGS' ? (
                  <BuildingsView
                    buildings={
                      clientFilter
                        ? buildings.filter(
                            (b: any) =>
                              b.clientId === clientFilter.id ||
                              b.client?.id === clientFilter.id ||
                              b.client?.name === clientFilter.name
                          )
                        : buildings
                    }
                    summary={summary}
                    expandedBuildingId={expandedBuildingId}
                    setExpandedBuildingId={setExpandedBuildingId}
                    onAddBuilding={() => setAddBuildingModalOpen(true)}
                    onEditBuilding={(b) => {
                      initialBuildingRef.current = { ...b };
                      setEditBuildingModal(b);
                      setMinimizedModals((prev) => prev.filter((m) => m !== 'EDIT_BUILDING'));
                    }}
                    onDeleteBuilding={handleDeleteBuilding}
                    onBulkAdd={(b) => setBulkAddModalOpen(b)}
                    onSingleAdd={(b) => setSingleAddEquipModalOpen(b)}
                    onOpenExport={() => handleOpenExport('BUILDINGS')}
                    onOpenImport={() => handleOpenImport('BUILDINGS')}
                    onOpenFloorPlans={(b) => setFloorPlansBuilding(b)}
                    clientFilterName={clientFilter?.name || null}
                    onClearClientFilter={() => setClientFilter(null)}
                    t={t}
                    onEditEquipment={(eq) => {
                      ensureTechniciansLoaded();
                      setAssignTaskOpen(false);
                      setAssignTaskForm({
                        technicianId: '',
                        type: 'Routine Inspection',
                        dueDate: addCalendarDays(todayCalendarDateString(), 7),
                        notes: '',
                      });
                      const interval = Number(eq.serviceIntervalMonths) || 12;
                      const normalizedLast = toDateInputString(eq.lastServiceDate);
                      const normalizedNext = toDateInputString(eq.nextDueDate);
                      const autoNext = addCalendarMonths(normalizedLast, interval);
                      const isAuto = !eq.nextDueDate || normalizedNext === autoNext;
                      setEditEquipDueDateMode(isAuto ? 'auto' : 'manual');
                      const normalizedEq = {
                        ...eq,
                        serviceIntervalMonths: interval,
                        lastServiceDate: normalizedLast,
                        nextDueDate: normalizedNext,
                        hydroDueDate: eq.hydroDueDate ? toDateInputString(eq.hydroDueDate) : '',
                      };
                      initialEquipmentRef.current = { ...normalizedEq };
                      setEditEquipmentModal(normalizedEq);
                      setMinimizedModals((prev) => prev.filter((m) => m !== 'EDIT_EQUIPMENT'));
                    }}
                  />
                ) : (
                  <ClientsView
                    clientsList={clientsList}
                    onAddClient={() => setAddBuildingModalOpen(true)}
                    onEditClient={(c) => setEditClientModal(c)}
                    onDeleteClient={handleDeleteClient}
                    onOpenExport={() => handleOpenExport('CLIENTS')}
                    onOpenImport={() => handleOpenImport('CLIENTS')}
                    onSelectClientSites={(clientId, clientName) => {
                      setClientFilter({ id: clientId, name: clientName });
                      setClientsSitesSubTab('BUILDINGS');
                    }}
                    onOpenClientPortal={(clientId) => handleOpenTab('CLIENT_PORTAL')}
                    t={t}
                  />
                )}
              </div>
            )}

            {/* =========================================================================
                GROUP 3: FIRE EQUIPMENT
            ========================================================================= */}
            {tab.id === 'FIRE_EQUIPMENT' && (
              <div className="space-y-6">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      if (buildings.length > 0) setSingleAddEquipModalOpen(buildings[0]);
                      else setAddBuildingModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white text-xs font-bold shadow-xs transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Fire Equipment</span>
                  </button>
                </div>
                <FireAssetsView
                  equipmentsList={filteredEquipmentsList}
                  buildings={buildings}
                  equipFilterBuilding={equipFilterBuilding}
                  setEquipFilterBuilding={setEquipFilterBuilding}
                  equipSearch={equipSearch}
                  setEquipSearch={setEquipSearch}
                  onEditEquipment={(eq) => {
                      ensureTechniciansLoaded();
                      setAssignTaskOpen(false);
                      setAssignTaskForm({
                        technicianId: '',
                        type: 'Routine Inspection',
                        dueDate: addCalendarDays(todayCalendarDateString(), 7),
                        notes: '',
                      });
                      const interval = Number(eq.serviceIntervalMonths) || 12;
                      const normalizedLast = toDateInputString(eq.lastServiceDate);
                      const normalizedNext = toDateInputString(eq.nextDueDate);
                      const autoNext = addCalendarMonths(normalizedLast, interval);
                      const isAuto = !eq.nextDueDate || normalizedNext === autoNext;
                      setEditEquipDueDateMode(isAuto ? 'auto' : 'manual');
                      const normalizedEq = {
                        ...eq,
                        serviceIntervalMonths: interval,
                        lastServiceDate: normalizedLast,
                        nextDueDate: normalizedNext,
                        hydroDueDate: eq.hydroDueDate ? toDateInputString(eq.hydroDueDate) : '',
                      };
                      initialEquipmentRef.current = { ...normalizedEq };
                      setEditEquipmentModal(normalizedEq);
                      setMinimizedModals((prev) => prev.filter((m) => m !== 'EDIT_EQUIPMENT'));
                    }}
                  onDeleteEquipment={handleDeleteEquipment}
                  onOpenExport={() => handleOpenExport('FIRE_ASSETS')}
                  onOpenImport={() => handleOpenImport('FIRE_ASSETS')}
                  t={t}
                />
              </div>
            )}

            {/* =========================================================================
                GROUP 4: INSPECTIONS & WORK
            ========================================================================= */}
            {tab.id === 'INSPECTIONS_WORK' && (
              <div className="space-y-6">
                <div className="flex flex-col gap-3 bg-white p-4 rounded-2xl border border-[#FED7AA] shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Primary Sub-Tabs: Inspections | Repairs */}
                    <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
                      <button
                        onClick={() => {
                          setInspectionsMainTab('INSPECTIONS');
                          if (inspectionsWorkSubTab === 'REPAIRS' || inspectionsWorkSubTab === 'FINDINGS') {
                            setInspectionsWorkSubTab('INSPECTIONS');
                          }
                        }}
                        className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                          inspectionsMainTab === 'INSPECTIONS'
                            ? 'bg-[#C2410C] text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Inspections
                      </button>
                      <button
                        onClick={() => {
                          setInspectionsMainTab('REPAIRS');
                          if (inspectionsWorkSubTab !== 'REPAIRS' && inspectionsWorkSubTab !== 'FINDINGS') {
                            setInspectionsWorkSubTab('REPAIRS');
                          }
                        }}
                        className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                          inspectionsMainTab === 'REPAIRS'
                            ? 'bg-[#C2410C] text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <span>Repairs</span>
                        {liveOpenRepairsCount > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-bold">
                            {liveOpenRepairsCount}
                          </span>
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleOpenExport(
                            inspectionsMainTab === 'INSPECTIONS'
                              ? 'INSPECTIONS'
                              : 'WORK_ORDERS'
                          )
                        }
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold transition-all shadow-xs"
                        title="Export to Excel (.xlsx)"
                      >
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                        <span>Export Excel</span>
                      </button>
                    </div>
                  </div>

                  {/* Secondary Navigation Pills */}
                  <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 text-xs flex-wrap">
                    {inspectionsMainTab === 'INSPECTIONS' ? (
                      <>
                        <button
                          data-testid="subtab-inspections"
                          onClick={() => setInspectionsWorkSubTab('INSPECTIONS')}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                            inspectionsWorkSubTab === 'INSPECTIONS'
                              ? 'bg-[#FFF0E6] text-[#C2410C] border border-[#EA580C]/30 font-bold'
                              : 'text-slate-600 hover:text-slate-900 bg-slate-50'
                          }`}
                        >
                          Field Inspections ({inspectionsList.length})
                        </button>
                        <button
                          data-testid="subtab-approvals"
                          onClick={() => setInspectionsWorkSubTab('APPROVALS')}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                            inspectionsWorkSubTab === 'APPROVALS'
                              ? 'bg-[#FFF0E6] text-[#C2410C] border border-[#EA580C]/30 font-bold'
                              : 'text-slate-600 hover:text-slate-900 bg-slate-50'
                          }`}
                        >
                          <span>Approvals</span>
                          {inspectionsList.filter((i) => i.approvalStatus === 'PENDING').length > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#EA580C] text-white font-bold">
                              {inspectionsList.filter((i) => i.approvalStatus === 'PENDING').length}
                            </span>
                          )}
                        </button>
                        <button
                          data-testid="subtab-radar"
                          onClick={() => setInspectionsWorkSubTab('RADAR')}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                            inspectionsWorkSubTab === 'RADAR'
                              ? 'bg-[#FFF0E6] text-[#C2410C] border border-[#EA580C]/30 font-bold'
                              : 'text-slate-600 hover:text-slate-900 bg-slate-50'
                          }`}
                        >
                          Expiry Radar
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          data-testid="subtab-repairs"
                          onClick={() => setInspectionsWorkSubTab('REPAIRS')}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                            inspectionsWorkSubTab === 'REPAIRS'
                              ? 'bg-[#FFF0E6] text-[#C2410C] border border-[#EA580C]/30 font-bold'
                              : 'text-slate-600 hover:text-slate-900 bg-slate-50'
                          }`}
                        >
                          <span>Repairs &amp; Work Orders</span>
                          {liveOpenRepairsCount > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-bold">
                              {liveOpenRepairsCount}
                            </span>
                          )}
                        </button>
                        <button
                          data-testid="subtab-findings"
                          onClick={() => setInspectionsWorkSubTab('FINDINGS')}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                            inspectionsWorkSubTab === 'FINDINGS'
                              ? 'bg-[#FFF0E6] text-[#C2410C] border border-[#EA580C]/30 font-bold'
                              : 'text-slate-600 hover:text-slate-900 bg-slate-50'
                          }`}
                        >
                          <span>Corrective Actions</span>
                          {correctiveActionsList.filter((c) => c.status !== 'CLOSED').length > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#D97706] text-white font-bold">
                              {correctiveActionsList.filter((c) => c.status !== 'CLOSED').length}
                            </span>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {inspectionsWorkSubTab === 'INSPECTIONS' && (
                  <InspectionsView
                    showToast={showToast}
                    onOpenImport={() => handleOpenImport('INSPECTIONS')}
                    initialInspections={inspectionsList}
                    initialTechnicians={techniciansList}
                    buildings={data?.buildings || []}
                    equipments={equipmentsList}
                    onRefreshDashboard={() => refreshDashboard({ silent: true })}
                    t={t}
                  />
                )}

                {inspectionsWorkSubTab === 'APPROVALS' && (
                  <ApprovalsQueueView
                    inspections={inspectionsList}
                    onRefreshDashboard={() => refreshDashboard({ silent: true })}
                    showToast={showToast}
                    onFlagFinding={(prefill) => {
                      setPrefillFinding(prefill);
                      setInspectionsWorkSubTab('FINDINGS');
                    }}
                    t={t}
                  />
                )}

                {inspectionsWorkSubTab === 'FINDINGS' && (
                  <CorrectiveActionsBoard
                    initialActions={correctiveActionsList}
                    buildings={buildings}
                    equipments={equipmentsList}
                    technicians={techniciansList}
                    showToast={showToast}
                    onRefreshDashboard={() => refreshDashboard({ silent: true })}
                    prefillFinding={prefillFinding}
                    onClearPrefill={() => setPrefillFinding(null)}
                    t={t}
                  />
                )}

                {inspectionsWorkSubTab === 'RADAR' && (
                  <ExpiryRadarView
                    equipments={equipmentsList}
                    workOrders={workOrdersList}
                    showToast={showToast}
                    onRefreshDashboard={() => refreshDashboard({ silent: true })}
                    onNavigateToWorkOrders={() => setInspectionsWorkSubTab('REPAIRS')}
                    t={t}
                  />
                )}

                {inspectionsWorkSubTab === 'REPAIRS' && (
                  <div className="space-y-6">
                    {/* Folded Top Section: Needs Repair */}
                    {(() => {
                      const openActions = correctiveActionsList.filter((c) => c.status !== 'CLOSED');
                      const critCount = openActions.filter((c) => c.priority === 'CRITICAL' || c.severity === 'CRITICAL').length;
                      const hiCount = openActions.filter((c) => c.priority === 'HIGH' || c.severity === 'HIGH').length;
                      const medCount = openActions.filter((c) => c.priority === 'MEDIUM' || c.severity === 'MEDIUM').length;
                      const loCount = openActions.filter((c) => c.priority === 'LOW' || c.severity === 'LOW').length;

                      return (
                        <div className="glass-panel-dense rounded-2xl p-4 sm:p-5 border border-[#FED7AA] bg-white shadow-xs space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <div className="p-2 rounded-xl bg-rose-50 text-[#DC2626] border border-rose-200">
                                <AlertTriangle className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-bold text-[#1C1917] text-sm sm:text-base">Needs Repair</h3>
                                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-[#DC2626] border border-rose-200">
                                    {openActions.length} Pending
                                  </span>
                                </div>
                                <div className="text-xs text-[#44403C] mt-0.5 flex items-center gap-2 flex-wrap">
                                  {critCount > 0 && <span className="text-[#DC2626] font-bold">• {critCount} Critical</span>}
                                  {hiCount > 0 && <span className="text-[#EA580C] font-semibold">• {hiCount} High</span>}
                                  {medCount > 0 && <span className="text-amber-600 font-semibold">• {medCount} Medium</span>}
                                  {loCount > 0 && <span className="text-slate-500">• {loCount} Low</span>}
                                  {openActions.length === 0 && <span className="text-emerald-600 font-medium">All inspection findings resolved ✓</span>}
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => setShowCorrectiveBoard(!showCorrectiveBoard)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFF0E6] hover:bg-[#FED7AA] text-[#C2410C] border border-[#FED7AA] text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto"
                            >
                              <Wrench className="w-3.5 h-3.5" />
                              <span>{showCorrectiveBoard ? 'Hide Action Board' : 'View Corrective Actions'}</span>
                            </button>
                          </div>

                          {showCorrectiveBoard && (
                            <div className="pt-3 border-t border-[#FED7AA]/60">
                              <CorrectiveActionsBoard
                                initialActions={correctiveActionsList}
                                buildings={buildings}
                                equipments={equipmentsList}
                                technicians={techniciansList}
                                showToast={showToast}
                                onRefreshDashboard={() => refreshDashboard({ silent: true })}
                                prefillFinding={prefillFinding}
                                onClearPrefill={() => setPrefillFinding(null)}
                                t={t}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    <WorkOrdersView
                      showToast={showToast}
                      onOpenImport={() => handleOpenImport('WORK_ORDERS')}
                      initialWorkOrders={workOrdersList}
                      initialTechnicians={techniciansList}
                      initialBuildings={buildings}
                      onRefreshDashboard={() => refreshDashboard({ silent: true })}
                    />
                  </div>
                )}
              </div>
            )}

            {/* =========================================================================
                GROUP 4B: FIELD TEAM & TECHNICIAN MANAGEMENT
            ========================================================================= */}
            {tab.id === 'FIELD_TEAM' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#FED7AA] shadow-xs">
                  <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
                    <button
                      data-testid="subtab-technicians-team"
                      onClick={() => setTechniciansSubTab('TEAM')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                        techniciansSubTab === 'TEAM'
                          ? 'bg-[#C2410C] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Team ({techniciansList.length})
                    </button>
                    <button
                      data-testid="subtab-technicians-assignments"
                      onClick={() => setTechniciansSubTab('ASSIGNMENTS')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                        techniciansSubTab === 'ASSIGNMENTS'
                          ? 'bg-[#C2410C] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Assignments
                    </button>
                    <button
                      data-testid="subtab-technicians-activity"
                      onClick={() => setTechniciansSubTab('ACTIVITY')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                        techniciansSubTab === 'ACTIVITY'
                          ? 'bg-[#C2410C] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Activity
                    </button>
                  </div>
                </div>

                {techniciansSubTab === 'TEAM' && (
                  <TechnicianManagement
                    showToast={showToast}
                    onOpenImport={() => handleOpenImport('TECHNICIANS')}
                    initialTechnicians={techniciansList}
                    initialBuildings={buildings}
                    initialSeatUsage={subscriptionData?.usage?.technicians}
                    initialPlan={subscriptionData?.plan}
                    agencyName={company?.name}
                    onRefreshDashboard={() => refreshDashboard({ silent: true })}
                    t={t}
                  />
                )}

                {techniciansSubTab === 'ASSIGNMENTS' && (
                  <TechnicianAssignments showToast={showToast} />
                )}

                {techniciansSubTab === 'ACTIVITY' && (
                  <TechnicianActivityLog />
                )}
              </div>
            )}

            {/* =========================================================================
                GROUP 5: COMPLIANCE REPORTS
            ========================================================================= */}
            {tab.id === 'REPORTS' && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <button
                    onClick={() => handleOpenExport('REPORTS')}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold transition-all shadow-xs"
                    title="Export Report Data to Excel (.xlsx)"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>Export Excel</span>
                  </button>
                </div>
                <ReportsView
                  buildings={buildings}
                  clients={clientsList}
                  summary={summary}
                  company={company}
                  equipments={equipmentsList}
                  inspections={inspectionsList}
                  onOpenApprovalsQueue={() => {
                    handleOpenTab('INSPECTIONS_WORK');
                    setInspectionsWorkSubTab('APPROVALS');
                  }}
                />
              </div>
            )}

            {/* =========================================================================
                GROUP 5.5: CLIENT PORTAL & RECEIPTS
            ========================================================================= */}
            {tab.id === 'CLIENT_PORTAL' && (
              <div className="space-y-4">
                <ClientPortalAdminPanel
                  clients={clientsList}
                  buildings={buildings}
                />
              </div>
            )}

            {/* =========================================================================
                GROUP 6: SETTINGS
            ========================================================================= */}
            {tab.id === 'SETTINGS' && (
              <SettingsView
                companyForm={companyForm}
                setCompanyForm={setCompanyForm}
                handleSaveCompany={handleSaveCompany}
                currentUser={data?.user}
                userProfile={data?.profile}
                company={company}
                showToast={showToast}
                onOpenImport={(type) => handleOpenImport(type || 'CLIENTS')}
                onOpenExport={(type) => handleOpenExport(type || 'CLIENTS')}
                initialTechnicians={techniciansList}
                initialBuildings={buildings}
                initialSeatUsage={subscriptionData?.usage?.technicians}
                initialPlan={subscriptionData?.plan}
                onRefreshDashboard={() => refreshDashboard({ silent: true })}
                onNavigateTab={handleOpenTab}
                currentLanguage={currentLanguage}
                onLanguageChange={handleLanguageChange}
                t={t}
              />
            )}
                </div>
              );
            })}
          </div>
        )}

        {/* Section Guide Modal */}
        <GuideModal
          isOpen={guideModalOpen}
          onClose={() => setGuideModalOpen(false)}
          onNavigateTab={(tab) => handleOpenTab(tab)}
          t={t}
        />

        {/* Excel Export Dialog */}
        <ExportModal
          isOpen={exportModalOpen}
          onClose={() => setExportModalOpen(false)}
          initialDataType={exportConfigKey}
          dataMap={exportDataMap}
          showToast={showToast}
        />

        {/* Excel Import Dialog */}
        <ImportModal
          isOpen={importModalOpen}
          initialType={importDataType}
          onClose={() => setImportModalOpen(false)}
          onSuccess={() => {
            refreshDashboard({ silent: true });
          }}
          t={t}
        />

      {/* =========================================================================
          MODAL 1: ADD CLIENT & BUILDING
      ========================================================================= */}
      <AnimatePresence>
        {addBuildingModalOpen && !minimizedModals.includes('ADD_BUILDING') && (
          <motion.div
            key="modal-add-building"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.05 : 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          >
            <motion.div
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
              transition={prefersReducedMotion ? { duration: 0.1 } : { type: 'spring', stiffness: 300, damping: 28 }}
              className="glass-dialog rounded-2xl max-w-4xl w-full p-6 sm:p-7 space-y-5 max-h-[92vh] overflow-y-auto text-slate-900 my-auto shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#FED7AA] pb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#FFF0E6] text-[#C2410C] border border-[#FED7AA]">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1C1917] text-base sm:text-lg">Register Client &amp; Building</h3>
                    <p className="text-xs text-[#44403C]">Add client society details and premises wing information side-by-side</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleMinimizeModal('ADD_BUILDING')}
                    className="p-1 rounded-lg text-slate-400 hover:text-[#C2410C] hover:bg-[#FFF0E6] transition-colors"
                    title="Minimize (keep my work)"
                    aria-label="Minimize (keep my work)"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCloseModal('ADD_BUILDING')}
                    className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Close"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleCreateBuilding} className="space-y-5 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                  {/* Left Column: Client & Society Details */}
                  <div className="p-4 sm:p-5 bg-[#FFF8F2] rounded-2xl space-y-3 border border-[#FED7AA] flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 pb-2 border-b border-[#FED7AA]/60">
                        <Users className="w-4 h-4 text-[#C2410C]" />
                        <h4 className="font-bold text-[#C2410C] uppercase text-[11px] tracking-wider">1. Client / Society Details</h4>
                      </div>
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">Client / Society Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Horizon Co-op Housing Society"
                          value={buildingForm.clientName}
                          onChange={(e) => setBuildingForm({ ...buildingForm, clientName: e.target.value })}
                          className="w-full bg-white border border-[#FED7AA] rounded-lg p-2.5 text-slate-900 placeholder-slate-400 focus:border-[#C2410C] focus:outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-700 font-semibold mb-1">Contact Person</label>
                          <input
                            type="text"
                            placeholder="Secretary / Facility Manager"
                            value={buildingForm.contactPerson}
                            onChange={(e) => setBuildingForm({ ...buildingForm, contactPerson: e.target.value })}
                            className="w-full bg-white border border-[#FED7AA] rounded-lg p-2.5 text-slate-900 placeholder-slate-400 focus:border-[#C2410C] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 font-semibold mb-1">Phone Number *</label>
                          <input
                            type="text"
                            required
                            placeholder="+91 98765 43210"
                            value={buildingForm.phone}
                            onChange={(e) => setBuildingForm({ ...buildingForm, phone: e.target.value })}
                            className="w-full bg-white border border-[#FED7AA] rounded-lg p-2.5 text-slate-900 placeholder-slate-400 focus:border-[#C2410C] focus:outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">Billing / Official Email</label>
                        <input
                          type="email"
                          placeholder="accounts@society.com"
                          value={buildingForm.email}
                          onChange={(e) => setBuildingForm({ ...buildingForm, email: e.target.value })}
                          className="w-full bg-white border border-[#FED7AA] rounded-lg p-2.5 text-slate-900 placeholder-slate-400 focus:border-[#C2410C] focus:outline-none"
                        />
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 pt-1">
                      Billing receipts &amp; AMC certificates will reference this society name.
                    </p>
                  </div>

                  {/* Right Column: Building Premises Info */}
                  <div className="p-4 sm:p-5 bg-white/90 rounded-2xl space-y-3 border border-[#FED7AA] flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 pb-2 border-b border-[#FED7AA]/60">
                        <Building2 className="w-4 h-4 text-[#C2410C]" />
                        <h4 className="font-bold text-[#C2410C] uppercase text-[11px] tracking-wider">2. Building &amp; Premises Info</h4>
                      </div>
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">Premises / Wing Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Tower A &amp; Clubhouse"
                          value={buildingForm.buildingName}
                          onChange={(e) => setBuildingForm({ ...buildingForm, buildingName: e.target.value })}
                          className="w-full bg-white border border-[#FED7AA] rounded-lg p-2.5 text-slate-900 placeholder-slate-400 focus:border-[#C2410C] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">Premises Address *</label>
                        <input
                          type="text"
                          required
                          placeholder="Plot No., Road, Sector / Area"
                          value={buildingForm.address}
                          onChange={(e) => setBuildingForm({ ...buildingForm, address: e.target.value })}
                          className="w-full bg-white border border-[#FED7AA] rounded-lg p-2.5 text-slate-900 placeholder-slate-400 focus:border-[#C2410C] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">State / UT *</label>
                        <select
                          value={buildingForm.state}
                          onChange={(e) => setBuildingForm({ ...buildingForm, state: e.target.value })}
                          className="w-full bg-white border border-[#FED7AA] rounded-lg p-2.5 text-slate-900 focus:border-[#C2410C] focus:outline-none"
                        >
                          {INDIAN_STATES_AND_UTS.map((st) => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-700 font-semibold mb-1">Reporting Cycle</label>
                          <select
                            value={buildingForm.reportingCycle}
                            onChange={(e) => setBuildingForm({ ...buildingForm, reportingCycle: e.target.value })}
                            className="w-full bg-white border border-[#FED7AA] rounded-lg p-2.5 text-slate-900 focus:border-[#C2410C] focus:outline-none"
                          >
                            {REPORTING_CYCLES.map((rc) => (
                              <option key={rc.value} value={rc.value}>{rc.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-slate-700 font-semibold mb-1">Local Rule (Optional)</label>
                          <input
                            type="text"
                            placeholder="e.g. Rule 33 / Form-B"
                            value={buildingForm.complianceRuleName}
                            onChange={(e) => setBuildingForm({ ...buildingForm, complianceRuleName: e.target.value })}
                            className="w-full bg-white border border-[#FED7AA] rounded-lg p-2.5 text-slate-900 placeholder-slate-400 focus:border-[#C2410C] focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 pt-1">
                      Field technicians use GPS geofencing &amp; floor checklists at this premises.
                    </p>
                  </div>
                </div>

                <div className="pt-2 sm:pt-3 border-t border-[#FED7AA]/70 flex items-center justify-between gap-3 flex-wrap">
                  <div className="text-[11px] text-[#44403C]">
                    Both client society and initial premises wing will be activated immediately.
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isSubmittingBuilding}
                      onClick={() => handleCloseModal('ADD_BUILDING')}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingBuilding}
                      className="px-6 py-2.5 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold shadow-sm transition-all flex items-center gap-2 active:scale-[0.98]"
                    >
                      {isSubmittingBuilding && <RefreshCw className="w-4 h-4 animate-spin" />}
                      <span>{isSubmittingBuilding ? 'Registering...' : 'Register Client & Building'}</span>
                    </button>
                  </div>
                </div>              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          MODAL 2: BULK ADD EQUIPMENT
      ========================================================================= */}
      <AnimatePresence>
        {bulkAddModalOpen && !minimizedModals.includes('BULK_ADD') && (
          <motion.div
            key="modal-bulk-add"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.05 : 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          >
            <motion.div
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
              transition={prefersReducedMotion ? { duration: 0.1 } : { type: 'spring', stiffness: 300, damping: 28 }}
              className="glass-dialog rounded-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto text-slate-900 my-auto shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#FED7AA] pb-3">
                <div>
                  <h3 className="font-bold text-[#1C1917] text-base">Bulk Add Equipment</h3>
                  <p className="text-xs text-[#C2410C] font-semibold mt-0.5">{bulkAddModalOpen.name}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleMinimizeModal('BULK_ADD')}
                    className="p-1 rounded-lg text-slate-400 hover:text-[#C2410C] hover:bg-[#FFF0E6] transition-colors"
                    title="Minimize (keep my work)"
                    aria-label="Minimize (keep my work)"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCloseModal('BULK_ADD')}
                    className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Close"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleBulkAddEquipment} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Equipment Type</label>
                    <select
                      value={equipmentForm.type}
                      onChange={(e) => setEquipmentForm({ ...equipmentForm, type: e.target.value })}
                      className="w-full bg-white border border-[#FED7AA] rounded-lg p-2.5 text-slate-900 focus:border-[#C2410C] focus:outline-none"
                    >
                      <option value="Fire Extinguisher">Fire Extinguisher</option>
                      <option value="Hydrant Valve">Hydrant Valve</option>
                      <option value="Hose Reel">Hose Reel</option>
                      <option value="Alarm Panel">Alarm Panel</option>
                      <option value="Smoke Detector">Smoke Detector</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Prefix / Code Format</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. EXT-ABC"
                      value={equipmentForm.prefix}
                      onChange={(e) => setEquipmentForm({ ...equipmentForm, prefix: e.target.value.toUpperCase() })}
                      className="w-full bg-white border border-[#FED7AA] rounded-lg p-2.5 text-slate-900 font-mono uppercase focus:border-[#C2410C] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Capacity / Specification</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 6 Kg ABC Powder"
                      value={equipmentForm.capacity}
                      onChange={(e) => setEquipmentForm({ ...equipmentForm, capacity: e.target.value })}
                      className="w-full bg-white border border-[#FED7AA] rounded-lg p-2.5 text-slate-900 focus:border-[#C2410C] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Quantity (1 - 50)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={50}
                      value={equipmentForm.count}
                      onChange={(e) => setEquipmentForm({ ...equipmentForm, count: Number(e.target.value) })}
                      className="w-full bg-white border border-[#FED7AA] rounded-lg p-2.5 text-slate-900 focus:border-[#C2410C] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Location Blueprint / Prefix</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tower Floor Corridor"
                    value={equipmentForm.locationBase}
                    onChange={(e) => setEquipmentForm({ ...equipmentForm, locationBase: e.target.value })}
                    className="w-full bg-white border border-[#FED7AA] rounded-lg p-2.5 text-slate-900 focus:border-[#C2410C] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 bg-slate-50 rounded-xl border border-[#FED7AA]">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Last Service / Refill Date
                    </label>
                    <input
                      type="date"
                      value={equipmentForm.lastServiceDate}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEquipmentForm({
                          ...equipmentForm,
                          lastServiceDate: val,
                          nextDueDate: addCalendarMonths(val, equipmentForm.serviceIntervalMonths),
                        });
                      }}
                      className="w-full bg-white border border-[#FED7AA] rounded-lg p-2 text-slate-900 focus:border-[#C2410C] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Next Service Due Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={equipmentForm.nextDueDate}
                      onChange={(e) => setEquipmentForm({ ...equipmentForm, nextDueDate: e.target.value })}
                      className="w-full bg-white border border-[#FED7AA] rounded-lg p-2 text-slate-900 focus:border-[#C2410C] focus:outline-none"
                    />
                  </div>
                  {(() => {
                    const baseDate = equipmentForm.lastServiceDate || toDateInputString(new Date());
                    const p1 = addCalendarMonths(baseDate, 12);
                    const p2 = addCalendarMonths(baseDate, 6);
                    const p3 = addCalendarDays(todayCalendarDateString(), 15);
                    const p4 = addCalendarDays(todayCalendarDateString(), -5);

                    return (
                      <div className="sm:col-span-2 flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] font-bold uppercase text-slate-400 mr-1">Quick Presets:</span>
                        <button
                          type="button"
                          onClick={() => setEquipmentForm({ ...equipmentForm, nextDueDate: p1 })}
                          className="group px-2 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-bold transition-colors inline-flex items-center gap-1"
                        >
                          <span>+1 Year (Standard)</span>
                          <span className="font-mono text-[9px] opacity-75">({p1})</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEquipmentForm({ ...equipmentForm, nextDueDate: p2 })}
                          className="group px-2 py-0.5 rounded-md bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-[10px] font-bold transition-colors inline-flex items-center gap-1"
                        >
                          <span>+6 Months</span>
                          <span className="font-mono text-[9px] opacity-75">({p2})</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEquipmentForm({ ...equipmentForm, nextDueDate: p3 })}
                          className="group px-2 py-0.5 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-[10px] font-bold transition-colors inline-flex items-center gap-1"
                        >
                          <span>Due in 15 Days</span>
                          <span className="font-mono text-[9px] opacity-75">({p3})</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEquipmentForm({ ...equipmentForm, nextDueDate: p4 })}
                          className="group px-2 py-0.5 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-bold transition-colors inline-flex items-center gap-1"
                        >
                          <span>Overdue (-5 Days)</span>
                          <span className="font-mono text-[9px] opacity-75">({p4})</span>
                        </button>
                      </div>
                    );
                  })()}
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleCloseModal('BULK_ADD')}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold shadow-xs transition-all"
                  >
                    Generate {equipmentForm.count} Assets
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          MODAL 3: SINGLE ADD EQUIPMENT (WIDE 2-COLUMN HORIZONTAL)
      ========================================================================= */}
      <AnimatePresence>
        {singleAddEquipModalOpen && !minimizedModals.includes('ADD_SINGLE_EQUIP') && (
          <motion.div
            key="modal-single-add"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.05 : 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          >
            <motion.div
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
              transition={prefersReducedMotion ? { duration: 0.1 } : { type: 'spring', stiffness: 300, damping: 28 }}
              className="glass-dialog rounded-2xl max-w-4xl w-full p-5 sm:p-6 text-slate-900 text-xs shadow-2xl my-auto max-h-[95vh] flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-[#FED7AA] pb-3 shrink-0">
                <div className="flex items-center gap-2.5">
                  <Flame className="w-5 h-5 text-[#C2410C]" />
                  <div>
                    <h3 className="font-bold text-[#1C1917] text-base">Add Single Fire Equipment</h3>
                    <p className="text-xs text-[#C2410C] font-semibold mt-0.5">{singleAddEquipModalOpen.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleMinimizeModal('ADD_SINGLE_EQUIP')}
                    className="p-1 rounded-lg text-slate-400 hover:text-[#C2410C] hover:bg-[#FFF0E6] transition-colors"
                    title="Minimize (keep my work)"
                    aria-label="Minimize (keep my work)"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCloseModal('ADD_SINGLE_EQUIP')}
                    className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Close"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSingleAddEquipment} className="space-y-4 pt-4 flex-1 flex flex-col">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 flex-1">
                  {/* Left Column: Core Specs */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Asset ID / Serial Number *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. HTP-EXT-05"
                        value={singleEquipForm.qrCode}
                        onChange={(e) => setSingleEquipForm({ ...singleEquipForm, qrCode: e.target.value.toUpperCase() })}
                        className="w-full bg-white border border-[#FED7AA] rounded-lg p-2.5 text-slate-900 font-mono uppercase focus:border-[#C2410C] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Equipment Type</label>
                      <select
                        value={singleEquipForm.type}
                        onChange={(e) => setSingleEquipForm({ ...singleEquipForm, type: e.target.value })}
                        className="w-full bg-white border border-[#FED7AA] rounded-lg p-2.5 text-slate-900 focus:border-[#C2410C] focus:outline-none"
                      >
                        <option value="Fire Extinguisher">Fire Extinguisher</option>
                        <option value="Hydrant Valve">Hydrant Valve</option>
                        <option value="Hose Reel">Hose Reel</option>
                        <option value="Alarm Panel">Alarm Panel</option>
                        <option value="Smoke Detector">Smoke Detector</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Capacity / Specification</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 6 Kg ABC Powder"
                        value={singleEquipForm.capacity}
                        onChange={(e) => setSingleEquipForm({ ...singleEquipForm, capacity: e.target.value })}
                        className="w-full bg-white border border-[#FED7AA] rounded-lg p-2.5 text-slate-900 focus:border-[#C2410C] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Specific Location in Building *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Basement 1 - Electric Meter Room"
                        value={singleEquipForm.location}
                        onChange={(e) => setSingleEquipForm({ ...singleEquipForm, location: e.target.value })}
                        className="w-full bg-white border border-[#FED7AA] rounded-lg p-2.5 text-slate-900 focus:border-[#C2410C] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Right Column: Service Dates & Photo */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 bg-slate-50 rounded-xl border border-[#FED7AA]">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Last Service / Refill Date</label>
                        <input
                          type="date"
                          value={singleEquipForm.lastServiceDate}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSingleEquipForm({
                              ...singleEquipForm,
                              lastServiceDate: val,
                              nextDueDate: addCalendarMonths(val, singleEquipForm.serviceIntervalMonths),
                            });
                          }}
                          className="w-full bg-white border border-[#FED7AA] rounded-lg p-2 text-slate-900 focus:border-[#C2410C] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Next Service Due Date *</label>
                        <input
                          type="date"
                          required
                          value={singleEquipForm.nextDueDate}
                          onChange={(e) => setSingleEquipForm({ ...singleEquipForm, nextDueDate: e.target.value })}
                          className="w-full bg-white border border-[#FED7AA] rounded-lg p-2 text-slate-900 focus:border-[#C2410C] focus:outline-none"
                        />
                      </div>
                      {(() => {
                        const baseDate = singleEquipForm.lastServiceDate || toDateInputString(new Date());
                        const p1 = addCalendarMonths(baseDate, 12);
                        const p2 = addCalendarMonths(baseDate, 6);
                        const p3 = addCalendarDays(todayCalendarDateString(), 15);
                        const p4 = addCalendarDays(todayCalendarDateString(), -5);

                        return (
                          <div className="sm:col-span-2 flex flex-wrap items-center gap-1.5 pt-1">
                            <span className="text-[10px] font-bold uppercase text-slate-400 mr-1">Quick Presets:</span>
                            <button
                              type="button"
                              onClick={() => setSingleEquipForm({ ...singleEquipForm, nextDueDate: p1 })}
                              className="group px-2 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-bold transition-colors inline-flex items-center gap-1"
                            >
                              <span>+1 Year (Standard)</span>
                              <span className="font-mono text-[9px] opacity-75">({p1})</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setSingleEquipForm({ ...singleEquipForm, nextDueDate: p2 })}
                              className="group px-2 py-0.5 rounded-md bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-[10px] font-bold transition-colors inline-flex items-center gap-1"
                            >
                              <span>+6 Months</span>
                              <span className="font-mono text-[9px] opacity-75">({p2})</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setSingleEquipForm({ ...singleEquipForm, nextDueDate: p3 })}
                              className="group px-2 py-0.5 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-[10px] font-bold transition-colors inline-flex items-center gap-1"
                            >
                              <span>Due in 15 Days</span>
                              <span className="font-mono text-[9px] opacity-75">({p3})</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setSingleEquipForm({ ...singleEquipForm, nextDueDate: p4 })}
                              className="group px-2 py-0.5 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-bold transition-colors inline-flex items-center gap-1"
                            >
                              <span>Overdue (-5 Days)</span>
                              <span className="font-mono text-[9px] opacity-75">({p4})</span>
                            </button>
                          </div>
                        );
                      })()}
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        Equipment Photo
                      </label>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer border border-slate-200 transition-colors">
                          <Camera className="w-3.5 h-3.5 text-[#C2410C]" />
                          <span>{compressingPhoto ? 'Uploading photo...' : 'Select Photo'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handlePhotoFileChange(e, 'SINGLE_ADD')}
                            className="hidden"
                          />
                        </label>
                        {singleEquipForm.photoUrl && (
                          <div className="flex items-center gap-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={singleEquipForm.photoUrl}
                              alt="Equipment preview"
                              className="w-9 h-9 rounded-lg object-cover border border-slate-300 shadow-xs"
                            />
                            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> {compressingPhoto ? 'Uploading...' : 'Photo Uploaded'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#FED7AA] flex justify-end gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCloseModal('ADD_SINGLE_EQUIP')}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={compressingPhoto}
                    className="px-5 py-2 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] disabled:opacity-50 text-white font-bold shadow-xs transition-all"
                  >
                    Add Equipment
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          MODAL 4: EDIT CLIENT
      ========================================================================= */}
      <AnimatePresence>
        {editClientModal && !minimizedModals.includes('EDIT_CLIENT') && (
          <motion.div
            key="modal-edit-client"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.05 : 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          >
            <motion.div
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
              transition={prefersReducedMotion ? { duration: 0.1 } : { type: 'spring', stiffness: 300, damping: 28 }}
              className="glass-dialog rounded-2xl max-w-md w-full p-6 space-y-4 text-slate-900 text-xs my-auto shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#FED7AA] pb-3">
                <h3 className="font-bold text-[#1C1917] text-base">Edit Client</h3>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleMinimizeModal('EDIT_CLIENT')}
                    className="p-1 rounded-lg text-slate-400 hover:text-[#C2410C] hover:bg-[#FFF0E6] transition-colors"
                    title="Minimize (keep my work)"
                    aria-label="Minimize (keep my work)"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCloseModal('EDIT_CLIENT')}
                    className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Close"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleUpdateClient} className="space-y-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Client Name *</label>
                  <input
                    type="text"
                    required
                    value={editClientModal.name}
                    onChange={(e) => setEditClientModal({ ...editClientModal, name: e.target.value })}
                    className="w-full bg-white border border-[#FED7AA] rounded-lg p-2.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={editClientModal.contactPerson || ''}
                    onChange={(e) => setEditClientModal({ ...editClientModal, contactPerson: e.target.value })}
                    className="w-full bg-white border border-[#FED7AA] rounded-lg p-2.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={editClientModal.phone}
                    onChange={(e) => setEditClientModal({ ...editClientModal, phone: e.target.value })}
                    className="w-full bg-white border border-[#FED7AA] rounded-lg p-2.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editClientModal.email || ''}
                    onChange={(e) => setEditClientModal({ ...editClientModal, email: e.target.value })}
                    className="w-full bg-white border border-[#FED7AA] rounded-lg p-2.5 text-slate-900"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleCloseModal('EDIT_CLIENT')}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold shadow-xs transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          MODAL 5: EDIT BUILDING (WIDE 2-COLUMN HORIZONTAL)
      ========================================================================= */}
      <AnimatePresence>
        {editBuildingModal && !minimizedModals.includes('EDIT_BUILDING') && (
          <motion.div
            key="modal-edit-building"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.05 : 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          >
            <motion.div
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
              transition={prefersReducedMotion ? { duration: 0.1 } : { type: 'spring', stiffness: 300, damping: 28 }}
              className="glass-dialog rounded-2xl max-w-3xl w-full p-5 sm:p-6 text-slate-900 text-xs shadow-2xl my-auto max-h-[95vh] flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-[#FED7AA] pb-3 shrink-0">
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-5 h-5 text-[#C2410C]" />
                  <h3 className="font-bold text-[#1C1917] text-base">Edit Building</h3>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleMinimizeModal('EDIT_BUILDING')}
                    className="p-1 rounded-lg text-slate-400 hover:text-[#C2410C] hover:bg-[#FFF0E6] transition-colors"
                    title="Minimize (keep my work)"
                    aria-label="Minimize (keep my work)"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCloseModal('EDIT_BUILDING')}
                    className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Close"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleUpdateBuilding} className="space-y-4 pt-4 flex-1 flex flex-col">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                  {/* Left Column: Name & Address */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Building Name *</label>
                      <input
                        type="text"
                        required
                        value={editBuildingModal.name}
                        onChange={(e) => setEditBuildingModal({ ...editBuildingModal, name: e.target.value })}
                        className="w-full bg-white border border-[#FED7AA] rounded-lg p-2.5 text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Premises Address *</label>
                      <input
                        type="text"
                        required
                        value={editBuildingModal.address}
                        onChange={(e) => setEditBuildingModal({ ...editBuildingModal, address: e.target.value })}
                        className="w-full bg-white border border-[#FED7AA] rounded-lg p-2.5 text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Right Column: Jurisdiction & Reporting */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">State / UT</label>
                        <select
                          value={editBuildingModal.state || 'Delhi'}
                          onChange={(e) => setEditBuildingModal({ ...editBuildingModal, state: e.target.value })}
                          className="w-full bg-white border border-[#FED7AA] rounded-lg p-2.5 text-slate-900"
                        >
                          {INDIAN_STATES_AND_UTS.map((st) => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Reporting Cycle</label>
                        <select
                          value={editBuildingModal.reportingCycle || 'Quarterly'}
                          onChange={(e) => setEditBuildingModal({ ...editBuildingModal, reportingCycle: e.target.value, complianceCycle: e.target.value })}
                          className="w-full bg-white border border-[#FED7AA] rounded-lg p-2.5 text-slate-900"
                        >
                          {REPORTING_CYCLES.map((rc) => (
                            <option key={rc.value} value={rc.value}>{rc.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Local Fire Rule / Format (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Rule 33, Form-B, NBC 2016"
                        value={editBuildingModal.complianceRuleName || ''}
                        onChange={(e) => setEditBuildingModal({ ...editBuildingModal, complianceRuleName: e.target.value })}
                        className="w-full bg-white border border-[#FED7AA] rounded-lg p-2.5 text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#FED7AA] flex justify-end gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCloseModal('EDIT_BUILDING')}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold shadow-xs transition-all"
                  >
                    Save Building
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          MODAL 6: EDIT EQUIPMENT (WIDE HORIZONTAL + ASSIGN TASK TO TECHNICIAN)
      ========================================================================= */}
      <AnimatePresence>
        {editEquipmentModal && !minimizedModals.includes('EDIT_EQUIPMENT') && (() => {
          const liveStatus = getEquipmentLiveStatus(editEquipmentModal);

          return (
            <motion.div
              key="modal-edit-equipment"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0.05 : 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
            >
              <motion.div
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
                transition={prefersReducedMotion ? { duration: 0.1 } : { type: 'spring', stiffness: 300, damping: 28 }}
                className="glass-dialog rounded-2xl max-w-5xl 2xl:max-w-6xl w-full p-5 sm:p-6 text-slate-900 text-xs shadow-2xl relative my-auto max-h-[95vh] flex flex-col"
              >
                {/* HEADER ROW: Title + Live Status Pill + Asset ID Badge + Close Button */}
                <div className="flex items-center justify-between border-b border-[#FED7AA] pb-3 shrink-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Flame className="w-5 h-5 text-[#C2410C]" />
                      <h3 className="font-bold text-[#1C1917] text-base">Edit Equipment Asset</h3>
                    </div>

                    {/* Live Status Pill */}
                    <span
                      data-testid="equipment-modal-status-pill"
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${liveStatus.cls}`}
                    >
                      {liveStatus.text}
                    </span>

                    {/* Asset ID in Mono Font */}
                    <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded-md bg-white border border-[#FED7AA] text-[#1C1917]">
                      {editEquipmentModal.qrCode || 'NO-ID'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleMinimizeModal('EDIT_EQUIPMENT')}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-[#C2410C] hover:bg-[#FFF0E6] transition-colors"
                      title="Minimize (keep my work)"
                      aria-label="Minimize (keep my work)"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCloseModal('EDIT_EQUIPMENT')}
                      className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Close"
                      aria-label="Close modal"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* FORM BODY: Wide 2-Zone Horizontal Grid */}
                <form onSubmit={handleUpdateEquipment} className="space-y-4 pt-3.5 flex-1 flex flex-col overflow-y-auto pr-1">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                    {/* LEFT ZONE: Asset ID, Capacity, Location, Refill Interval */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Asset ID / Serial Number *</label>
                        <input
                          type="text"
                          required
                          value={editEquipmentModal.qrCode}
                          onChange={(e) => setEditEquipmentModal({ ...editEquipmentModal, qrCode: e.target.value.toUpperCase() })}
                          className="w-full bg-white border border-[#FED7AA] rounded-lg p-2.5 text-slate-900 font-mono uppercase focus:border-[#C2410C] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Capacity / Specification *</label>
                        <input
                          type="text"
                          required
                          value={editEquipmentModal.capacity}
                          onChange={(e) => setEditEquipmentModal({ ...editEquipmentModal, capacity: e.target.value })}
                          className="w-full bg-white border border-[#FED7AA] rounded-lg p-2.5 text-slate-900 focus:border-[#C2410C] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Location Details *</label>
                        <input
                          type="text"
                          required
                          value={editEquipmentModal.location}
                          onChange={(e) => setEditEquipmentModal({ ...editEquipmentModal, location: e.target.value })}
                          className="w-full bg-white border border-[#FED7AA] rounded-lg p-2.5 text-slate-900 focus:border-[#C2410C] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Refill / Service Interval (Months)</label>
                        <input
                          type="number"
                          min={1}
                          max={120}
                          value={editEquipmentModal.serviceIntervalMonths || 12}
                          onChange={(e) => {
                            const mos = Number(e.target.value) || 1;
                            const nextDue =
                              editEquipDueDateMode === 'auto'
                                ? addCalendarMonths(
                                    editEquipmentModal.lastServiceDate || toDateInputString(new Date()),
                                    mos
                                  )
                                : editEquipmentModal.nextDueDate;
                            setEditEquipmentModal({
                              ...editEquipmentModal,
                              serviceIntervalMonths: mos,
                              nextDueDate: nextDue,
                            });
                          }}
                          className="w-full bg-white border border-[#FED7AA] rounded-lg p-2.5 text-slate-900 focus:border-[#C2410C] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* RIGHT ZONE: Service Dates side-by-side + Quick Presets + Equipment Photo */}
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 bg-slate-50 rounded-xl border border-[#FED7AA]">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Last Service / Refill Date</label>
                          <input
                            type="date"
                            value={editEquipmentModal.lastServiceDate || toDateInputString(new Date())}
                            onChange={(e) => {
                              const val = e.target.value;
                              const interval = Number(editEquipmentModal.serviceIntervalMonths) || 12;
                              const nextDue =
                                editEquipDueDateMode === 'auto'
                                  ? addCalendarMonths(val, interval)
                                  : editEquipmentModal.nextDueDate;
                              setEditEquipmentModal({
                                ...editEquipmentModal,
                                lastServiceDate: val,
                                nextDueDate: nextDue,
                              });
                            }}
                            className="w-full bg-white border border-[#FED7AA] rounded-lg p-2 text-slate-900 focus:border-[#C2410C] focus:outline-none"
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-slate-700 font-bold">Next Service Due Date *</label>
                            {editEquipDueDateMode === 'auto' ? (
                              <span
                                data-testid="badge-due-date-auto"
                                className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 select-none"
                                title="Auto-calculated from Last Service Date + Refill Interval"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Auto
                              </span>
                            ) : (
                              <button
                                type="button"
                                data-testid="badge-due-date-manual"
                                onClick={() => {
                                  setEditEquipDueDateMode('auto');
                                  const interval = Number(editEquipmentModal.serviceIntervalMonths) || 12;
                                  const recomputed = addCalendarMonths(
                                    editEquipmentModal.lastServiceDate || toDateInputString(new Date()),
                                    interval
                                  );
                                  setEditEquipmentModal({
                                    ...editEquipmentModal,
                                    nextDueDate: recomputed,
                                  });
                                }}
                                className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FFF0E6] text-[#C2410C] border border-[#FED7AA] hover:bg-[#FED7AA] transition-colors flex items-center gap-1 cursor-pointer"
                                title="Manual date set. Click to switch back to Auto calculation."
                              >
                                <span>Manual</span>
                                <span className="underline font-normal text-[9px]">(Reset to Auto)</span>
                              </button>
                            )}
                          </div>
                          <input
                            type="date"
                            required
                            value={editEquipmentModal.nextDueDate || toDateInputString(new Date())}
                            onChange={(e) => {
                              setEditEquipDueDateMode('manual');
                              setEditEquipmentModal({ ...editEquipmentModal, nextDueDate: e.target.value });
                            }}
                            className="w-full bg-white border border-[#FED7AA] rounded-lg p-2 text-slate-900 focus:border-[#C2410C] focus:outline-none"
                          />
                        </div>

                        {/* Quick Presets Row */}
                        {(() => {
                          const baseServiceDate = editEquipmentModal.lastServiceDate || toDateInputString(new Date());
                          const preset1Year = addCalendarMonths(baseServiceDate, 12);
                          const preset6Mos = addCalendarMonths(baseServiceDate, 6);
                          const preset15Days = addCalendarDays(todayCalendarDateString(), 15);
                          const presetOverdue5 = addCalendarDays(todayCalendarDateString(), -5);

                          return (
                            <div className="sm:col-span-2 flex flex-wrap items-center gap-1.5 pt-1">
                              <span className="text-[10px] font-bold uppercase text-slate-400 mr-1">Quick Presets:</span>
                              <button
                                type="button"
                                title={`Set Next Service Due Date to ${preset1Year} (Last Service + 12 calendar months)`}
                                onClick={() => {
                                  setEditEquipDueDateMode('manual');
                                  setEditEquipmentModal({
                                    ...editEquipmentModal,
                                    nextDueDate: preset1Year,
                                  });
                                }}
                                className="group px-2 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-bold transition-colors inline-flex items-center gap-1 cursor-pointer active:scale-95"
                              >
                                <span>+1 Year (Standard)</span>
                                <span className="font-mono text-[9px] text-emerald-600/80 group-hover:text-emerald-800">
                                  ({preset1Year})
                                </span>
                              </button>
                              <button
                                type="button"
                                title={`Set Next Service Due Date to ${preset6Mos} (Last Service + 6 calendar months)`}
                                onClick={() => {
                                  setEditEquipDueDateMode('manual');
                                  setEditEquipmentModal({
                                    ...editEquipmentModal,
                                    nextDueDate: preset6Mos,
                                  });
                                }}
                                className="group px-2 py-0.5 rounded-md bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-[10px] font-bold transition-colors inline-flex items-center gap-1 cursor-pointer active:scale-95"
                              >
                                <span>+6 Months</span>
                                <span className="font-mono text-[9px] text-sky-600/80 group-hover:text-sky-800">
                                  ({preset6Mos})
                                </span>
                              </button>
                              <button
                                type="button"
                                title={`Set Next Service Due Date to ${preset15Days} (Today + 15 calendar days)`}
                                onClick={() => {
                                  setEditEquipDueDateMode('manual');
                                  setEditEquipmentModal({
                                    ...editEquipmentModal,
                                    nextDueDate: preset15Days,
                                  });
                                }}
                                className="group px-2 py-0.5 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-[10px] font-bold transition-colors inline-flex items-center gap-1 cursor-pointer active:scale-95"
                              >
                                <span>Due in 15 Days</span>
                                <span className="font-mono text-[9px] text-amber-600/80 group-hover:text-amber-800">
                                  ({preset15Days})
                                </span>
                              </button>
                              <button
                                type="button"
                                title={`Set Next Service Due Date to ${presetOverdue5} (Today - 5 calendar days)`}
                                onClick={() => {
                                  setEditEquipDueDateMode('manual');
                                  setEditEquipmentModal({
                                    ...editEquipmentModal,
                                    nextDueDate: presetOverdue5,
                                  });
                                }}
                                className="group px-2 py-0.5 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-bold transition-colors inline-flex items-center gap-1 cursor-pointer active:scale-95"
                              >
                                <span>Overdue (-5 Days)</span>
                                <span className="font-mono text-[9px] text-rose-600/80 group-hover:text-rose-800">
                                  ({presetOverdue5})
                                </span>
                              </button>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Equipment Photo Block */}
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">
                          Equipment Photo
                        </label>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer border border-slate-200 transition-colors">
                            <Camera className="w-3.5 h-3.5 text-[#C2410C]" />
                            <span>{compressingPhoto ? 'Uploading photo...' : 'Update Photo'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handlePhotoFileChange(e, 'EDIT')}
                              className="hidden"
                            />
                          </label>
                          {editEquipmentModal.photoUrl && (
                            <div className="flex items-center gap-2">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={editEquipmentModal.photoUrl}
                                alt="Equipment preview"
                                className="w-9 h-9 rounded-lg object-cover border border-slate-300 shadow-xs"
                              />
                              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> {compressingPhoto ? 'Uploading...' : 'Photo attached'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Collapsible More Options: Next Hydro-Test Due Date */}
                      <details className="sm:col-span-2 group pt-2 border-t border-[#FED7AA]/60">
                        <summary className="cursor-pointer text-xs font-bold text-[#C2410C] hover:text-[#9A3412] flex items-center justify-between py-1.5 select-none">
                          <span>More options (Hydro-Test Due Date)</span>
                          <span className="text-[10px] text-slate-500 font-normal">Optional</span>
                        </summary>
                        <div className="pt-2 pb-1 space-y-2">
                          <div>
                            <label className="block text-slate-700 font-bold mb-1 text-xs">
                              Next Hydro-Test Due Date
                            </label>
                            <input
                              type="date"
                              data-testid="equipment-modal-hydro-due"
                              value={editEquipmentModal.hydroDueDate || ''}
                              onChange={(e) =>
                                setEditEquipmentModal({
                                  ...editEquipmentModal,
                                  hydroDueDate: e.target.value,
                                })
                              }
                              className="w-full bg-white border border-[#FED7AA] rounded-lg p-2 text-slate-900 focus:border-[#C2410C] focus:outline-none text-xs"
                            />
                          </div>
                        </div>
                      </details>
                    </div>
                  </div>

                  {/* PART C: EXPANDABLE ASSIGN TASK TO TECHNICIAN SECTION */}
                  <AnimatePresence>
                    {assignTaskOpen && (
                      <motion.div
                        key="assign-task-panel"
                        initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                        animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, height: 'auto' }}
                        exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden border-t border-[#FED7AA] pt-3 mt-1"
                      >
                        <div className="glass-panel-dense rounded-xl p-4 border border-[#FED7AA] border-l-4 border-l-[#EA580C] space-y-3 shadow-xs">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[#C2410C]">
                              <ClipboardList className="w-4 h-4" />
                              <h4 className="font-bold text-sm text-[#1C1917]">Create Repair Task</h4>
                            </div>
                            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold uppercase border border-emerald-200">Status: ASSIGNED</span>
                          </div>

                          {techniciansList.length === 0 ? (
                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs flex items-center justify-between">
                              <span>No technicians yet — add one in Technicians</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditEquipmentModal(null);
                                  setAssignTaskOpen(false);
                                  setActiveTab('FIELD_TEAM');
                                }}
                                className="text-[#C2410C] font-bold underline hover:text-[#9A3412]"
                              >
                                Go to Technicians &rarr;
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                                {/* Technician select */}
                                <div>
                                  <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1.5">
                                    <Users className="w-3.5 h-3.5 text-[#C2410C]" /> Technician *
                                  </label>
                                  <select
                                    value={assignTaskForm.technicianId}
                                    onChange={(e) => setAssignTaskForm({ ...assignTaskForm, technicianId: e.target.value })}
                                    className="w-full bg-white border border-[#FED7AA] rounded-lg p-2 text-slate-900 focus:border-[#C2410C] focus:outline-none"
                                  >
                                    <option value="">Choose technician...</option>
                                    {techniciansList.map((t) => (
                                      <option key={t.id} value={t.id}>
                                        {t.employeeId ? `${t.employeeId} · ` : ''}{t.fullName || t.email}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {/* Task type select */}
                                <div>
                                  <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1.5">
                                    <ClipboardList className="w-3.5 h-3.5 text-[#C2410C]" /> Task Type *
                                  </label>
                                  <select
                                    value={assignTaskForm.type}
                                    onChange={(e) => setAssignTaskForm({ ...assignTaskForm, type: e.target.value })}
                                    className="w-full bg-white border border-[#FED7AA] rounded-lg p-2 text-slate-900 focus:border-[#C2410C] focus:outline-none"
                                  >
                                    <option value="Routine Inspection">Routine Inspection</option>
                                    <option value="Refill / Service">Refill / Service</option>
                                    <option value="Repair Check">Repair Check</option>
                                    <option value="Compliance Audit">Compliance Audit</option>
                                  </select>
                                </div>

                                {/* Due Date input */}
                                <div>
                                  <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-[#C2410C]" /> Due Date *
                                  </label>
                                  <input
                                    type="date"
                                    required
                                    value={assignTaskForm.dueDate}
                                    onChange={(e) => setAssignTaskForm({ ...assignTaskForm, dueDate: e.target.value })}
                                    className="w-full bg-white border border-[#FED7AA] rounded-lg p-2 text-slate-900 focus:border-[#C2410C] focus:outline-none"
                                  />
                                </div>

                                {/* Notes input */}
                                <div>
                                  <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5 text-[#C2410C]" /> Notes (Optional)
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="e.g. Carry 6kg ABC refills"
                                    value={assignTaskForm.notes}
                                    onChange={(e) => setAssignTaskForm({ ...assignTaskForm, notes: e.target.value })}
                                    className="w-full bg-white border border-[#FED7AA] rounded-lg p-2 text-slate-900 focus:border-[#C2410C] focus:outline-none"
                                  />
                                </div>
                              </div>

                              <div className="flex justify-end pt-1">
                                <button
                                  type="button"
                                  onClick={handleAssignTaskInsideModal}
                                  disabled={assigningTask || !assignTaskForm.technicianId}
                                  className="px-4 py-2 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] disabled:opacity-50 text-white font-bold shadow-xs transition-all text-xs flex items-center gap-1.5"
                                >
                                  <UserCheck className="w-3.5 h-3.5" />
                                  <span>{assigningTask ? 'Creating...' : 'Create Task'}</span>
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Recent tasks for this asset list */}
                          {recentTasksForAsset.length > 0 && (
                            <div className="pt-2 border-t border-[#FED7AA]/60 space-y-1.5">
                              <div className="text-[10px] font-bold uppercase text-slate-400">
                                Recent Tasks for this Asset ({recentTasksForAsset.length})
                              </div>
                              <div className="space-y-1">
                                {recentTasksForAsset.map((wo) => {
                                  const chip = getTaskStatusChip(wo.status);
                                  return (
                                    <div
                                      key={wo.id}
                                      className="flex items-center justify-between p-2 rounded-lg bg-white/70 border border-[#FED7AA]/50 text-[11px]"
                                    >
                                      <div className="flex items-center gap-2 truncate">
                                        <span className="font-semibold text-[#1C1917] truncate">{wo.title}</span>
                                        <span className="text-slate-400">·</span>
                                        <span className="text-slate-600 truncate">{wo.assignedTo?.fullName || 'Technician'}</span>
                                        <span className="text-slate-400">·</span>
                                        <span className="text-slate-500 font-mono text-[10px]">
                                          {wo.dueDate ? toDateInputString(wo.dueDate) : 'No due date'}
                                        </span>
                                      </div>
                                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${chip.cls}`}>
                                        {chip.label}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* STICKY FOOTER BAR: Cancel | Assign Task to Technician toggle | Save Equipment */}
                  <div className="pt-3 border-t border-[#FED7AA] flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCloseModal('EDIT_EQUIPMENT')}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors font-semibold"
                    >
                      Cancel
                    </button>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <button
                        type="button"
                        onClick={() => setAssignTaskOpen((prev) => !prev)}
                        className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                          assignTaskOpen
                            ? 'bg-[#FFF0E6] text-[#C2410C] border-[#C2410C]/40 shadow-xs'
                            : 'bg-white text-slate-700 border-[#FED7AA] hover:bg-[#FFF8F2] hover:text-[#C2410C]'
                        }`}
                      >
                        <Users className="w-3.5 h-3.5 text-[#EA580C]" />
                        <span>{assignTaskOpen ? 'Hide Task' : 'Create Repair Task'}</span>
                      </button>

                      <button
                        type="submit"
                        disabled={compressingPhoto}
                        className="w-full sm:w-auto px-5 py-2 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] disabled:opacity-50 text-white font-bold shadow-xs transition-all"
                      >
                        Save Equipment
                      </button>
                    </div>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* =========================================================================
          MODAL 8: FLOOR-PLAN PINS (MODULE H)
      ========================================================================= */}
      {floorPlansBuilding && (
        <FloorPlansModal
          building={floorPlansBuilding}
          onClose={() => setFloorPlansBuilding(null)}
          onViewAsset={(eq) => {
            setFloorPlansBuilding(null);
            ensureTechniciansLoaded();
            const interval = Number(eq.serviceIntervalMonths) || 12;
            const normalizedLast = toDateInputString(eq.lastServiceDate);
            const normalizedNext = toDateInputString(eq.nextDueDate);
            const autoNext = addCalendarMonths(normalizedLast, interval);
            const isAuto = !eq.nextDueDate || normalizedNext === autoNext;
            setEditEquipDueDateMode(isAuto ? 'auto' : 'manual');
            const normalizedEq = {
              ...eq,
              serviceIntervalMonths: interval,
              lastServiceDate: normalizedLast,
              nextDueDate: normalizedNext,
              hydroDueDate: eq.hydroDueDate ? toDateInputString(eq.hydroDueDate) : '',
            };
            initialEquipmentRef.current = { ...normalizedEq };
            setEditEquipmentModal(normalizedEq);
          }}
          showToast={showToast}
          t={t}
        />
      )}

      {/* =========================================================================
          MODAL 7: FEEDBACK
      ========================================================================= */}
      <AnimatePresence>
        {feedbackModalOpen && (
          <FeedbackModal
            isOpen={feedbackModalOpen}
            onClose={() => setFeedbackModalOpen(false)}
            userEmail={data?.user?.email}
          />
        )}
      </AnimatePresence>

      </main>

      {/* Minimized Items Floating Tray (bottom-4 right-4 z-40) */}
      <MinimizeTray
        items={minimizedTrayItems}
        onRestore={handleRestoreMinimizedItem}
        onClose={handleCloseMinimizedItem}
      />

      {/* =========================================================================
          WELCOME TESTING MODAL (New Signups Only — Root Dashboard Layout)
      ========================================================================= */}
      <WelcomeTestingModal
        isOpen={welcomeModalOpen}
        fullName={data?.profile?.fullName}
        agencyName={data?.company?.name}
        preferredLanguage={data?.profile?.preferredLanguage || 'en'}
        onDismissed={handleDismissWelcome}
      />
    </div>
  );
}
