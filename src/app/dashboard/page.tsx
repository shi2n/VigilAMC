'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { createClient } from '@/lib/supabase/client';
import {
  Building2,
  Plus,
  CheckCircle2,
  RefreshCw,
  LogOut,
  Menu,
  FileSpreadsheet,
  Sun,
  Moon,
  MessageSquare,
  Camera,
} from 'lucide-react';
import { AdminSidebar, AdminNavTab } from '@/components/admin/AdminSidebar';
import { DashboardOverview } from '@/components/admin/DashboardOverview';
import { ExportModal } from '@/components/admin/ExportModal';
import { ImportModal } from '@/components/admin/ImportModal';
import { FeedbackModal } from '@/components/admin/FeedbackModal';
import { ImportType } from '@/lib/excelImport';
import { INDIAN_STATES_AND_UTS, REPORTING_CYCLES } from '@/lib/constants/india';
import { WorkOrdersView } from '@/components/admin/WorkOrdersView';
import { InspectionsView } from '@/components/admin/InspectionsView';
import { ReportsView } from '@/components/admin/ReportsView';
import { ClientsView } from '@/components/admin/ClientsView';
import { BuildingsView } from '@/components/admin/BuildingsView';
import { FireAssetsView } from '@/components/admin/FireAssetsView';
import { SettingsView } from '@/components/admin/SettingsView';
import { TechnicianManagement } from '@/components/admin/TechnicianManagement';
import { compressImageToDataUrl, uploadCompressedPhoto } from '@/lib/compressImage';

const LAST_ORG_CACHE_KEY = 'vigilamc_dash_last_org';

function toDateInputString(d?: Date | string | null): string {
  const dt = d ? new Date(d) : new Date();
  if (isNaN(dt.getTime())) {
    return new Date().toISOString().split('T')[0];
  }
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function addMonthsToDateString(dateStr: string, months: number): string {
  const base = dateStr ? new Date(dateStr) : new Date();
  const dt = isNaN(base.getTime()) ? new Date() : new Date(base.getTime());
  dt.setMonth(dt.getMonth() + (Number(months) || 12));
  return toDateInputString(dt);
}

function addDaysToTodayString(days: number): string {
  const dt = new Date();
  dt.setDate(dt.getDate() + days);
  return toDateInputString(dt);
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRevalidating, setIsRevalidating] = useState(false);
  const [expandedBuildingId, setExpandedBuildingId] = useState<string | null>(null);

  // Theme Mode: Light theme by default, persistent in localStorage
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const saved = localStorage.getItem('vigil_dashboard_theme') as 'light' | 'dark' | null;
    const initialTheme = saved || 'light';
    setTheme(initialTheme);
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('vigil_dashboard_theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Authenticated Admin Navigation Tab (6 Core Groups)
  const [activeTab, setActiveTab] = useState<AdminNavTab>('OVERVIEW');
  const [clientsSitesSubTab, setClientsSitesSubTab] = useState<'BUILDINGS' | 'CLIENTS'>('BUILDINGS');
  const [inspectionsWorkSubTab, setInspectionsWorkSubTab] = useState<'INSPECTIONS' | 'REPAIRS'>('INSPECTIONS');
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
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
  const [compressingPhoto, setCompressingPhoto] = useState(false);

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
    nextDueDate: addMonthsToDateString(toDateInputString(new Date()), 12),
  });

  // Single add equipment form state
  const [singleEquipForm, setSingleEquipForm] = useState({
    qrCode: '',
    type: 'Fire Extinguisher',
    capacity: 'ABC Dry Powder 6kg',
    location: '',
    serviceIntervalMonths: 12,
    lastServiceDate: toDateInputString(new Date()),
    nextDueDate: addMonthsToDateString(toDateInputString(new Date()), 12),
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
  });

  const applyBootstrapPayload = useCallback(
    (json: any) => {
      setData(json);
      if (json.kpis) setKpis(json.kpis);
      if (Array.isArray(json.clients)) setClientsList(json.clients);
      if (Array.isArray(json.equipments)) setEquipmentsList(json.equipments);
      if (Array.isArray(json.inspections)) setInspectionsList(json.inspections);
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

        const res = await fetch('/api/dashboard/bootstrap', {
          cache: 'no-store',
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

        // If user is a TECHNICIAN, redirect to dedicated technician portal
        if (json.profile?.role === 'TECHNICIAN') {
          window.location.href = '/technician';
          return;
        }

        applyBootstrapPayload(json);

        // Cache snapshot in sessionStorage keyed by organization/user ID
        try {
          const orgKey = json.company?.id || json.user?.id || 'default';
          sessionStorage.setItem(LAST_ORG_CACHE_KEY, orgKey);
          sessionStorage.setItem(`vigilamc_dash_cache_${orgKey}`, JSON.stringify(json));
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
    try {
      const lastOrg = sessionStorage.getItem(LAST_ORG_CACHE_KEY);
      if (lastOrg) {
        const cachedRaw = sessionStorage.getItem(`vigilamc_dash_cache_${lastOrg}`);
        if (cachedRaw) {
          const cachedJson = JSON.parse(cachedRaw);
          if (cachedJson && cachedJson.authenticated) {
            applyBootstrapPayload(cachedJson);
            setLoading(false);
            hydratedFromCache = true;
          }
        }
      }
    } catch {
      // Ignore cache read error
    }

    refreshDashboard({ silent: hydratedFromCache });
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
      showToast(`Photo compressed (${Math.round(uploaded.sizeBytes / 1024)} KB WebP) & uploaded to R2 CDN!`);
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

  // Create Client & Building
  const handleCreateBuilding = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
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
        showToast(resData.error || 'Failed to create building');
      }
    } catch (e: any) {
      console.error(e);
      showToast(e?.message || 'Failed to create building');
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

  // Single Add Equipment
  const handleSingleAddEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleAddEquipModalOpen) return;
    try {
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
          nextDueDate: addMonthsToDateString(toDateInputString(new Date()), 12),
          photoUrl: '',
        });
        await refreshDashboard({ silent: true });
      } else {
        showToast(resData.error || 'Failed to add equipment');
      }
    } catch (e: any) {
      console.error(e);
      showToast(e?.message || 'Failed to add equipment');
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
  const licenseNo = company?.licenseNumber || 'DL/FIRE/LIC/2026';

  // Live reactive KPI computations so any mutation updates Overview & Sidebar in 0ms
  const liveEquipmentMetrics = useMemo(() => {
    const now = new Date();
    let overdue = 0;
    let dueSoon = 0;
    for (const eq of equipmentsList) {
      const hasDueDate = Boolean(eq.nextDueDate && !isNaN(new Date(eq.nextDueDate).getTime()));
      const diffDays = hasDueDate
        ? Math.ceil((new Date(eq.nextDueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : null;
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

  return (
    <div className="min-h-screen bg-[#F4F8FB] flex flex-col lg:flex-row text-slate-900 selection:bg-[#EAF6FF] selection:text-[#073F8F]">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border-2 border-[#007DB8] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Sidebar permanently mounted */}
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setMobileSidebarOpen(false);
        }}
        isMobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        company={company}
        userEmail={data?.user?.email}
        userProfile={data?.profile}
        onLogout={handleLogout}
        openRepairsCount={liveOpenRepairsCount}
        isDarkMode={theme === 'dark'}
        onToggleDarkMode={toggleTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
        
        {/* Top Header Bar permanently mounted */}
        <div className="rounded-2xl bg-white border border-[#E2E8F0] p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 dark:bg-[#111827] dark:border-[#293548]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 dark:bg-[#172033] dark:border-[#293548] dark:text-slate-300 dark:hover:text-white"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#2563EB] dark:text-[#60A5FA]">VigilAMC</span>
                <span className="text-slate-400 dark:text-slate-600">/</span>
                <h1 className="text-lg sm:text-xl font-black text-[#0F172A] dark:text-white tracking-tight">
                  {(activeTab === 'OVERVIEW' || activeTab === 'HOME') && 'Overview'}
                  {(activeTab === 'CLIENTS_SITES' || activeTab === 'SITES') && 'Clients & Sites'}
                  {activeTab === 'FIRE_EQUIPMENT' && 'Fire Equipment'}
                  {(activeTab === 'INSPECTIONS_WORK' || activeTab === 'INSPECTIONS' || activeTab === 'REPAIRS') && 'Inspections & Work'}
                  {activeTab === 'FIELD_TEAM' && 'Field Team & Technicians'}
                  {activeTab === 'REPORTS' && 'Compliance Reports'}
                  {activeTab === 'SETTINGS' && 'Agency Settings'}
                </h1>
                {isRevalidating && (
                  <span title="Syncing latest data..." className="inline-flex items-center ml-1">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-400" />
                  </span>
                )}
              </div>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                Managing operations for <strong className="text-slate-800 dark:text-slate-200 font-semibold">{agencyName}</strong>
                {licenseNo && <> &bull; License: <strong className="text-slate-800 dark:text-slate-300 font-semibold">{licenseNo}</strong></>}
              </p>
            </div>
          </div>

          {/* Quick Actions, Theme Switcher & Feedback */}
          <div className="flex items-center gap-2.5 flex-wrap self-end md:self-auto">
            <button
              onClick={() => refreshDashboard({ silent: true })}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-[#172033] dark:hover:bg-slate-700 dark:text-slate-200 dark:border-[#293548] transition-all shadow-xs"
              title="Sync latest records"
              aria-label="Sync latest records"
            >
              <RefreshCw className={`w-4 h-4 ${isRevalidating ? 'animate-spin text-[#2563EB]' : ''}`} />
            </button>

            <button
              onClick={() => setFeedbackModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#EFF6FF] hover:bg-blue-100 text-[#2563EB] border border-[#2563EB]/20 text-xs font-bold transition-all shadow-xs dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:text-[#60A5FA] dark:border-blue-500/30"
              title="Give product feedback"
            >
              <MessageSquare className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA]" />
              <span>Give Feedback</span>
            </button>

            {/* Theme Toggle (Light / Dark Mode) */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-[#172033] dark:hover:bg-slate-700 dark:text-slate-200 dark:border-[#293548] transition-all shadow-xs"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all shadow-xs dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:text-rose-300 dark:border-rose-800/50"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Skeleton placeholders ONLY on the very first cold visit when data === null */}
        {loading && !data ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="h-28 rounded-2xl bg-white border border-[#DCE7F2] p-5 space-y-3"
                >
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-7 w-16" />
                  <Skeleton className="h-2.5 w-32" />
                </div>
              ))}
            </div>
            <div className="rounded-2xl bg-white border border-[#DCE7F2] p-6 space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 2 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -2 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="space-y-6"
            >
            {/* =========================================================================
                GROUP 1: OVERVIEW SCREEN
            ========================================================================= */}
            {(activeTab === 'OVERVIEW' || activeTab === 'HOME') && (
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
                onNavigateTab={(tab: any) => {
                  if (tab === 'OVERVIEW' || tab === 'HOME') setActiveTab('OVERVIEW');
                  else if (tab === 'CLIENTS_SITES' || tab === 'SITES') setActiveTab('CLIENTS_SITES');
                  else if (tab === 'FIRE_EQUIPMENT') setActiveTab('FIRE_EQUIPMENT');
                  else if (tab === 'INSPECTIONS_WORK' || tab === 'INSPECTIONS') {
                    setActiveTab('INSPECTIONS_WORK');
                    setInspectionsWorkSubTab('INSPECTIONS');
                  } else if (tab === 'REPAIRS') {
                    setActiveTab('INSPECTIONS_WORK');
                    setInspectionsWorkSubTab('REPAIRS');
                  } else if (tab === 'FIELD_TEAM') setActiveTab('FIELD_TEAM');
                  else if (tab === 'REPORTS') setActiveTab('REPORTS');
                  else if (tab === 'SETTINGS') setActiveTab('SETTINGS');
                }}
                onAddEquipment={() => {
                  if (buildings.length > 0) {
                    setSingleAddEquipModalOpen(buildings[0]);
                  } else {
                    setAddBuildingModalOpen(true);
                  }
                }}
                onCreateRepairJob={() => {
                  setActiveTab('INSPECTIONS_WORK');
                  setInspectionsWorkSubTab('REPAIRS');
                }}
                onOpenFeedback={() => setFeedbackModalOpen(true)}
                onOpenImport={() => handleOpenImport('FIRE_ASSETS')}
              />
            )}

            {/* =========================================================================
                GROUP 2: CLIENTS & SITES
            ========================================================================= */}
            {(activeTab === 'CLIENTS_SITES' || activeTab === 'SITES') && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-xs dark:bg-[#111827] dark:border-[#293548]">
                  <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs dark:bg-[#0B1220] dark:border-[#293548]">
                    <button
                      onClick={() => setClientsSitesSubTab('BUILDINGS')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                        clientsSitesSubTab === 'BUILDINGS'
                          ? 'bg-[#2563EB] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                      }`}
                    >
                      Buildings &amp; Towers ({buildings.length})
                    </button>
                    <button
                      onClick={() => setClientsSitesSubTab('CLIENTS')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                        clientsSitesSubTab === 'CLIENTS'
                          ? 'bg-[#2563EB] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                      }`}
                    >
                      Client Societies ({clientsList.length})
                    </button>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleOpenImport(clientsSitesSubTab === 'BUILDINGS' ? 'BUILDINGS' : 'CLIENTS')}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#EFF6FF] hover:bg-blue-100 text-[#2563EB] border border-[#2563EB]/20 text-xs font-bold transition-all shadow-xs dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:text-[#60A5FA] dark:border-blue-500/30"
                      title="Import from Excel (.xlsx)"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>Import Excel</span>
                    </button>

                    <button
                      onClick={() => handleOpenExport(clientsSitesSubTab === 'BUILDINGS' ? 'BUILDINGS' : 'CLIENTS')}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold transition-all shadow-xs dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 dark:text-emerald-300 dark:border-emerald-800"
                      title="Export to Excel (.xlsx)"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>Export Excel</span>
                    </button>

                    <button
                      onClick={() => setAddBuildingModalOpen(true)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-xs transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{clientsSitesSubTab === 'BUILDINGS' ? 'Add Building' : 'Add Client'}</span>
                    </button>
                  </div>
                </div>

                {clientsSitesSubTab === 'BUILDINGS' ? (
                  <BuildingsView
                    buildings={buildings}
                    summary={summary}
                    expandedBuildingId={expandedBuildingId}
                    setExpandedBuildingId={setExpandedBuildingId}
                    onAddBuilding={() => setAddBuildingModalOpen(true)}
                    onEditBuilding={(b) => setEditBuildingModal(b)}
                    onDeleteBuilding={handleDeleteBuilding}
                    onBulkAdd={(b) => setBulkAddModalOpen(b)}
                    onSingleAdd={(b) => setSingleAddEquipModalOpen(b)}
                    onOpenExport={() => handleOpenExport('BUILDINGS')}
                    onOpenImport={() => handleOpenImport('BUILDINGS')}
                    onEditEquipment={(eq) =>
                      setEditEquipmentModal({
                        ...eq,
                        lastServiceDate: toDateInputString(eq.lastServiceDate),
                        nextDueDate: toDateInputString(eq.nextDueDate),
                      })
                    }
                  />
                ) : (
                  <ClientsView
                    clientsList={clientsList}
                    onAddClient={() => setAddBuildingModalOpen(true)}
                    onEditClient={(c) => setEditClientModal(c)}
                    onDeleteClient={handleDeleteClient}
                    onOpenExport={() => handleOpenExport('CLIENTS')}
                    onOpenImport={() => handleOpenImport('CLIENTS')}
                  />
                )}
              </div>
            )}

            {/* =========================================================================
                GROUP 3: FIRE EQUIPMENT
            ========================================================================= */}
            {activeTab === 'FIRE_EQUIPMENT' && (
              <div className="space-y-6">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      if (buildings.length > 0) setSingleAddEquipModalOpen(buildings[0]);
                      else setAddBuildingModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-xs transition-all"
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
                  onEditEquipment={(eq) =>
                    setEditEquipmentModal({
                      ...eq,
                      lastServiceDate: toDateInputString(eq.lastServiceDate),
                      nextDueDate: toDateInputString(eq.nextDueDate),
                    })
                  }
                  onDeleteEquipment={handleDeleteEquipment}
                  onOpenExport={() => handleOpenExport('FIRE_ASSETS')}
                  onOpenImport={() => handleOpenImport('FIRE_ASSETS')}
                />
              </div>
            )}

            {/* =========================================================================
                GROUP 4: INSPECTIONS & WORK
            ========================================================================= */}
            {(activeTab === 'INSPECTIONS_WORK' || activeTab === 'INSPECTIONS' || activeTab === 'REPAIRS') && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-xs dark:bg-[#111827] dark:border-[#293548]">
                  <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs dark:bg-[#0B1220] dark:border-[#293548]">
                    <button
                      onClick={() => setInspectionsWorkSubTab('INSPECTIONS')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                        inspectionsWorkSubTab === 'INSPECTIONS'
                          ? 'bg-[#2563EB] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                      }`}
                    >
                      Field Inspections ({inspectionsList.length})
                    </button>
                    <button
                      onClick={() => setInspectionsWorkSubTab('REPAIRS')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                        inspectionsWorkSubTab === 'REPAIRS'
                          ? 'bg-[#2563EB] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                      }`}
                    >
                      <span>Repairs &amp; Work Orders</span>
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
                          inspectionsWorkSubTab === 'INSPECTIONS' ? 'INSPECTIONS' : 'WORK_ORDERS'
                        )
                      }
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold transition-all shadow-xs dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 dark:text-emerald-300 dark:border-emerald-800"
                      title="Export to Excel (.xlsx)"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Export Excel</span>
                    </button>
                  </div>
                </div>

                {inspectionsWorkSubTab === 'INSPECTIONS' ? (
                  <InspectionsView
                    showToast={showToast}
                    onOpenImport={() => handleOpenImport('INSPECTIONS')}
                    initialInspections={inspectionsList}
                    buildings={data?.buildings || []}
                    equipments={equipmentsList}
                    onRefreshDashboard={() => refreshDashboard({ silent: true })}
                  />
                ) : (
                  <WorkOrdersView
                    showToast={showToast}
                    onOpenImport={() => handleOpenImport('WORK_ORDERS')}
                    initialWorkOrders={workOrdersList}
                    initialTechnicians={techniciansList}
                    initialBuildings={buildings}
                    onRefreshDashboard={() => refreshDashboard({ silent: true })}
                  />
                )}
              </div>
            )}

            {/* =========================================================================
                GROUP 4B: FIELD TEAM & TECHNICIAN MANAGEMENT
            ========================================================================= */}
            {activeTab === 'FIELD_TEAM' && (
              <TechnicianManagement
                showToast={showToast}
                onOpenImport={() => handleOpenImport('TECHNICIANS')}
                initialTechnicians={techniciansList}
                initialBuildings={buildings}
                initialSeatUsage={subscriptionData?.usage?.technicians}
                initialPlan={subscriptionData?.plan}
                agencyName={company?.name}
                onRefreshDashboard={() => refreshDashboard({ silent: true })}
              />
            )}

            {/* =========================================================================
                GROUP 5: COMPLIANCE REPORTS
            ========================================================================= */}
            {activeTab === 'REPORTS' && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <button
                    onClick={() => handleOpenExport('REPORTS')}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold transition-all shadow-xs dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 dark:text-emerald-300 dark:border-emerald-800"
                    title="Export Report Data to Excel (.xlsx)"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Export Excel</span>
                  </button>
                </div>
                <ReportsView buildings={buildings} summary={summary} company={company} />
              </div>
            )}

            {/* =========================================================================
                GROUP 6: SETTINGS
            ========================================================================= */}
            {activeTab === 'SETTINGS' && (
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
              />
            )}
            </motion.div>
          </AnimatePresence>
        )}

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
        />

      {/* =========================================================================
          MODAL 1: ADD CLIENT & BUILDING
      ========================================================================= */}
      {addBuildingModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-[#E2E8F0] max-h-[90vh] overflow-y-auto text-slate-900 dark:bg-[#172033] dark:border-[#293548] dark:text-white">
            
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 dark:border-[#293548]">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-[#2563EB] dark:text-[#60A5FA]" />
                <h3 className="font-bold text-[#0F172A] text-base dark:text-white">Register Client &amp; Building</h3>
              </div>
              <button
                onClick={() => setAddBuildingModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBuilding} className="space-y-4 text-xs">
              <div className="p-3.5 bg-[#F8FAFC] rounded-xl space-y-2.5 border border-[#E2E8F0] dark:bg-[#0B1220] dark:border-[#293548]">
                <h4 className="font-bold text-[#2563EB] uppercase text-[10px] tracking-wider dark:text-[#60A5FA]">Client &amp; Society Details</h4>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 dark:text-slate-300">Client / Society Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Horizon Co-op Housing Society"
                    value={buildingForm.clientName}
                    onChange={(e) => setBuildingForm({ ...buildingForm, clientName: e.target.value })}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg p-2.5 text-slate-900 placeholder-slate-400 focus:border-[#2563EB] focus:outline-none dark:bg-[#111827] dark:border-[#293548] dark:text-white dark:placeholder-slate-500 dark:focus:border-[#60A5FA]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 dark:text-slate-300">Contact Person</label>
                    <input
                      type="text"
                      placeholder="Secretary / Facility Manager"
                      value={buildingForm.contactPerson}
                      onChange={(e) => setBuildingForm({ ...buildingForm, contactPerson: e.target.value })}
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg p-2.5 text-slate-900 placeholder-slate-400 focus:border-[#2563EB] focus:outline-none dark:bg-[#111827] dark:border-[#293548] dark:text-white dark:placeholder-slate-500 dark:focus:border-[#60A5FA]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 dark:text-slate-300">Phone Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="+91 98XXX XXXXX"
                      value={buildingForm.phone}
                      onChange={(e) => setBuildingForm({ ...buildingForm, phone: e.target.value })}
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg p-2.5 text-slate-900 placeholder-slate-400 focus:border-[#2563EB] focus:outline-none dark:bg-[#111827] dark:border-[#293548] dark:text-white dark:placeholder-slate-500 dark:focus:border-[#60A5FA]"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-[#F8FAFC] rounded-xl space-y-2.5 border border-[#E2E8F0] dark:bg-[#0B1220] dark:border-[#293548]">
                <h4 className="font-bold text-[#2563EB] uppercase text-[10px] tracking-wider dark:text-[#60A5FA]">Building &amp; Compliance Cycle</h4>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 dark:text-slate-300">Building / Tower Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Horizon Heights Tower C"
                    value={buildingForm.buildingName}
                    onChange={(e) => setBuildingForm({ ...buildingForm, buildingName: e.target.value })}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg p-2.5 text-slate-900 placeholder-slate-400 focus:border-[#2563EB] focus:outline-none dark:bg-[#111827] dark:border-[#293548] dark:text-white dark:placeholder-slate-500 dark:focus:border-[#60A5FA]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 dark:text-slate-300">Premises Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="Street, Area, City, Pin Code"
                    value={buildingForm.address}
                    onChange={(e) => setBuildingForm({ ...buildingForm, address: e.target.value })}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg p-2.5 text-slate-900 placeholder-slate-400 focus:border-[#2563EB] focus:outline-none dark:bg-[#111827] dark:border-[#293548] dark:text-white dark:placeholder-slate-500 dark:focus:border-[#60A5FA]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 dark:text-slate-300">State / Union Territory *</label>
                    <select
                      value={buildingForm.state}
                      onChange={(e) => setBuildingForm({ ...buildingForm, state: e.target.value })}
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg p-2.5 text-slate-900 focus:border-[#2563EB] focus:outline-none dark:bg-[#111827] dark:border-[#293548] dark:text-white dark:focus:border-[#60A5FA]"
                    >
                      {INDIAN_STATES_AND_UTS.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 dark:text-slate-300">Reporting Cycle *</label>
                    <select
                      value={buildingForm.reportingCycle}
                      onChange={(e) => {
                        const val = e.target.value;
                        const mos = val === 'Monthly' ? 1 : val === 'Quarterly' ? 3 : val === 'Half-Yearly' ? 6 : 12;
                        setBuildingForm({ ...buildingForm, reportingCycle: val, complianceCycle: val, cycleIntervalMos: mos });
                      }}
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg p-2.5 text-slate-900 focus:border-[#2563EB] focus:outline-none dark:bg-[#111827] dark:border-[#293548] dark:text-white dark:focus:border-[#60A5FA]"
                    >
                      {REPORTING_CYCLES.map((rc) => (
                        <option key={rc.value} value={rc.value}>{rc.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1 dark:text-slate-300">Local Fire Rule / Format (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Rule 33, Form-B, NBC 2016, or state mandate"
                    value={buildingForm.complianceRuleName}
                    onChange={(e) => setBuildingForm({ ...buildingForm, complianceRuleName: e.target.value })}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg p-2.5 text-slate-900 placeholder-slate-400 focus:border-[#2563EB] focus:outline-none dark:bg-[#111827] dark:border-[#293548] dark:text-white dark:placeholder-slate-500 dark:focus:border-[#60A5FA]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddBuildingModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-[#111827] dark:text-slate-300 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold shadow-xs transition-all"
                >
                  Create Building
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: BULK ADD EQUIPMENT
      ========================================================================= */}
      {bulkAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-[#E2E8F0] max-h-[90vh] overflow-y-auto text-slate-900 dark:bg-[#172033] dark:border-[#293548] dark:text-white">
            
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 dark:border-[#293548]">
              <div>
                <h3 className="font-bold text-[#0F172A] text-base dark:text-white">Bulk Add Equipment</h3>
                <p className="text-xs text-[#2563EB] font-semibold mt-0.5 dark:text-[#60A5FA]">{bulkAddModalOpen.name}</p>
              </div>
              <button
                onClick={() => setBulkAddModalOpen(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBulkAddEquipment} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 dark:text-slate-300">Equipment Type</label>
                  <select
                    value={equipmentForm.type}
                    onChange={(e) => setEquipmentForm({ ...equipmentForm, type: e.target.value })}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg p-2.5 text-slate-900 focus:border-[#2563EB] focus:outline-none dark:bg-[#111827] dark:border-[#293548] dark:text-white dark:focus:border-[#60A5FA]"
                  >
                    <option value="Fire Extinguisher">Fire Extinguisher</option>
                    <option value="Hydrant Valve">Hydrant Valve</option>
                    <option value="Hose Reel">Hose Reel</option>
                    <option value="Alarm Panel">Alarm Panel</option>
                    <option value="Smoke Detector">Smoke Detector</option>
                    <option value="Sprinkler Control Valve">Sprinkler Control Valve</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 dark:text-slate-300">Capacity / Specification</label>
                  <input
                    type="text"
                    value={equipmentForm.capacity}
                    onChange={(e) => setEquipmentForm({ ...equipmentForm, capacity: e.target.value })}
                    placeholder="e.g. ABC Dry Powder 6kg"
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg p-2.5 text-slate-900 placeholder-slate-400 focus:border-[#2563EB] focus:outline-none dark:bg-[#111827] dark:border-[#293548] dark:text-white dark:placeholder-slate-500 dark:focus:border-[#60A5FA]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 dark:text-slate-300">Asset ID / Tag Prefix</label>
                  <input
                    type="text"
                    value={equipmentForm.prefix}
                    onChange={(e) => setEquipmentForm({ ...equipmentForm, prefix: e.target.value.toUpperCase() })}
                    placeholder="e.g. EXT or TWR"
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg p-2.5 text-slate-900 font-mono uppercase focus:border-[#2563EB] focus:outline-none dark:bg-[#111827] dark:border-[#293548] dark:text-white dark:focus:border-[#60A5FA]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 dark:text-slate-300">Quantity to Auto-Generate</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={equipmentForm.count}
                    onChange={(e) => setEquipmentForm({ ...equipmentForm, count: Number(e.target.value) })}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg p-2.5 text-slate-900 focus:border-[#2563EB] focus:outline-none dark:bg-[#111827] dark:border-[#293548] dark:text-white dark:focus:border-[#60A5FA]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 dark:text-slate-300">Location Pattern</label>
                <input
                  type="text"
                  value={equipmentForm.locationBase}
                  onChange={(e) => setEquipmentForm({ ...equipmentForm, locationBase: e.target.value })}
                  placeholder="e.g. Floor Landing Lift Lobby"
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg p-2.5 text-slate-900 placeholder-slate-400 focus:border-[#2563EB] focus:outline-none dark:bg-[#111827] dark:border-[#293548] dark:text-white dark:placeholder-slate-500 dark:focus:border-[#60A5FA]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 dark:text-slate-300">Refill / Service Interval</label>
                <select
                  value={equipmentForm.serviceIntervalMonths}
                  onChange={(e) => {
                    const mos = Number(e.target.value);
                    setEquipmentForm({
                      ...equipmentForm,
                      serviceIntervalMonths: mos,
                      nextDueDate: addMonthsToDateString(equipmentForm.lastServiceDate, mos),
                    });
                  }}
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg p-2.5 text-slate-900 focus:border-[#2563EB] focus:outline-none dark:bg-[#111827] dark:border-[#293548] dark:text-white dark:focus:border-[#60A5FA]"
                >
                  <option value={12}>12 Months (Annual Extinguisher Refill - IS 2190)</option>
                  <option value={6}>6 Months (Half-Yearly Hydrant &amp; Pump Check)</option>
                  <option value={3}>3 Months (Quarterly Fire Alarm &amp; Smoke Check)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-[#E2E8F0] dark:bg-[#0B1220] dark:border-[#293548]">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 dark:text-slate-300">
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
                        nextDueDate: addMonthsToDateString(val, equipmentForm.serviceIntervalMonths),
                      });
                    }}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg p-2 text-slate-900 focus:border-[#2563EB] focus:outline-none dark:bg-[#111827] dark:border-[#293548] dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 dark:text-slate-300">
                    Next Service Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={equipmentForm.nextDueDate}
                    onChange={(e) => setEquipmentForm({ ...equipmentForm, nextDueDate: e.target.value })}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg p-2 text-slate-900 focus:border-[#2563EB] focus:outline-none dark:bg-[#111827] dark:border-[#293548] dark:text-white"
                  />
                </div>
                <div className="sm:col-span-2 flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 mr-1">Quick Presets:</span>
                  <button
                    type="button"
                    onClick={() =>
                      setEquipmentForm({
                        ...equipmentForm,
                        nextDueDate: addMonthsToDateString(equipmentForm.lastServiceDate, 12),
                      })
                    }
                    className="px-2 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-bold transition-colors dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                  >
                    +1 Year (Standard)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setEquipmentForm({
                        ...equipmentForm,
                        nextDueDate: addDaysToTodayString(15),
                      })
                    }
                    className="px-2 py-0.5 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-[10px] font-bold transition-colors dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                  >
                    Due in 15 Days
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setEquipmentForm({
                        ...equipmentForm,
                        nextDueDate: addDaysToTodayString(-5),
                      })
                    }
                    className="px-2 py-0.5 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-bold transition-colors dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
                  >
                    Overdue (-5 Days)
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBulkAddModalOpen(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-[#111827] dark:text-slate-300 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold shadow-xs transition-all"
                >
                  Create {equipmentForm.count} Equipment Records
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: SINGLE ADD EQUIPMENT (WITH AUTOMATIC WEBP PHOTO COMPRESSION)
      ========================================================================= */}
      {singleAddEquipModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#E2E8F0] text-slate-900 dark:bg-[#172033] dark:border-[#293548] dark:text-white">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 dark:border-[#293548]">
              <div>
                <h3 className="font-bold text-[#0F172A] text-base dark:text-white">Add Single Fire Equipment</h3>
                <p className="text-xs text-[#2563EB] font-semibold mt-0.5 dark:text-[#60A5FA]">{singleAddEquipModalOpen.name}</p>
              </div>
              <button onClick={() => setSingleAddEquipModalOpen(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSingleAddEquipment} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1 dark:text-slate-300">Asset ID / Serial Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HTP-EXT-05"
                  value={singleEquipForm.qrCode}
                  onChange={(e) => setSingleEquipForm({ ...singleEquipForm, qrCode: e.target.value.toUpperCase() })}
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg p-2.5 text-slate-900 font-mono uppercase focus:border-[#2563EB] dark:bg-[#111827] dark:border-[#293548] dark:text-white dark:focus:border-[#60A5FA]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 dark:text-slate-300">Equipment Type</label>
                <select
                  value={singleEquipForm.type}
                  onChange={(e) => setSingleEquipForm({ ...singleEquipForm, type: e.target.value })}
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg p-2.5 text-slate-900 focus:border-[#2563EB] dark:bg-[#111827] dark:border-[#293548] dark:text-white dark:focus:border-[#60A5FA]"
                >
                  <option value="Fire Extinguisher">Fire Extinguisher</option>
                  <option value="Hydrant Valve">Hydrant Valve</option>
                  <option value="Hose Reel">Hose Reel</option>
                  <option value="Alarm Panel">Alarm Panel</option>
                  <option value="Smoke Detector">Smoke Detector</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 dark:text-slate-300">Capacity / Specification</label>
                <input
                  type="text"
                  required
                  value={singleEquipForm.capacity}
                  onChange={(e) => setSingleEquipForm({ ...singleEquipForm, capacity: e.target.value })}
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg p-2.5 text-slate-900 focus:border-[#2563EB] dark:bg-[#111827] dark:border-[#293548] dark:text-white dark:focus:border-[#60A5FA]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 dark:text-slate-300">Specific Location in Building *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Basement 1 - Electric Meter Room"
                  value={singleEquipForm.location}
                  onChange={(e) => setSingleEquipForm({ ...singleEquipForm, location: e.target.value })}
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg p-2.5 text-slate-900 focus:border-[#2563EB] dark:bg-[#111827] dark:border-[#293548] dark:text-white dark:focus:border-[#60A5FA]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 bg-slate-50 rounded-xl border border-[#E2E8F0] dark:bg-[#0B1220] dark:border-[#293548]">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 dark:text-slate-300">
                    Last Service / Refill Date
                  </label>
                  <input
                    type="date"
                    value={singleEquipForm.lastServiceDate}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSingleEquipForm({
                        ...singleEquipForm,
                        lastServiceDate: val,
                        nextDueDate: addMonthsToDateString(val, singleEquipForm.serviceIntervalMonths),
                      });
                    }}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg p-2 text-slate-900 focus:border-[#2563EB] focus:outline-none dark:bg-[#111827] dark:border-[#293548] dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 dark:text-slate-300">
                    Next Service Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={singleEquipForm.nextDueDate}
                    onChange={(e) => setSingleEquipForm({ ...singleEquipForm, nextDueDate: e.target.value })}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg p-2 text-slate-900 focus:border-[#2563EB] focus:outline-none dark:bg-[#111827] dark:border-[#293548] dark:text-white"
                  />
                </div>
                <div className="sm:col-span-2 flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 mr-1">Quick Presets:</span>
                  <button
                    type="button"
                    onClick={() =>
                      setSingleEquipForm({
                        ...singleEquipForm,
                        nextDueDate: addMonthsToDateString(singleEquipForm.lastServiceDate, 12),
                      })
                    }
                    className="px-2 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-bold transition-colors dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                  >
                    +1 Year (Standard)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSingleEquipForm({
                        ...singleEquipForm,
                        nextDueDate: addDaysToTodayString(15),
                      })
                    }
                    className="px-2 py-0.5 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-[10px] font-bold transition-colors dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                  >
                    Due in 15 Days
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSingleEquipForm({
                        ...singleEquipForm,
                        nextDueDate: addDaysToTodayString(-5),
                      })
                    }
                    className="px-2 py-0.5 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-bold transition-colors dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
                  >
                    Overdue (-5 Days)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 dark:text-slate-300">
                  Equipment Photo (Auto-compressed WebP &rarr; Cloudflare R2)
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer border border-slate-200 dark:bg-[#111827] dark:border-[#293548] dark:text-slate-300">
                    <Camera className="w-3.5 h-3.5 text-[#2563EB]" />
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
                        <CheckCircle2 className="w-3.5 h-3.5" /> {compressingPhoto ? 'Uploading...' : 'R2 CDN Ready'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSingleAddEquipModalOpen(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-[#111827] dark:text-slate-300 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={compressingPhoto}
                  className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white font-bold shadow-xs transition-all"
                >
                  Add Equipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: EDIT CLIENT
      ========================================================================= */}
      {editClientModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#E2E8F0] text-slate-900 text-xs dark:bg-[#172033] dark:border-[#293548] dark:text-white">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 dark:border-[#293548]">
              <h3 className="font-bold text-[#0F172A] text-base dark:text-white">Edit Client</h3>
              <button onClick={() => setEditClientModal(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">✕</button>
            </div>

            <form onSubmit={handleUpdateClient} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1 dark:text-slate-300">Client Name *</label>
                <input
                  type="text"
                  required
                  value={editClientModal.name}
                  onChange={(e) => setEditClientModal({ ...editClientModal, name: e.target.value })}
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg p-2.5 text-slate-900 dark:bg-[#111827] dark:border-[#293548] dark:text-white"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1 dark:text-slate-300">Contact Person</label>
                <input
                  type="text"
                  value={editClientModal.contactPerson}
                  onChange={(e) => setEditClientModal({ ...editClientModal, contactPerson: e.target.value })}
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg p-2.5 text-slate-900 dark:bg-[#111827] dark:border-[#293548] dark:text-white"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1 dark:text-slate-300">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={editClientModal.phone}
                  onChange={(e) => setEditClientModal({ ...editClientModal, phone: e.target.value })}
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg p-2.5 text-slate-900 dark:bg-[#111827] dark:border-[#293548] dark:text-white"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1 dark:text-slate-300">Email Address</label>
                <input
                  type="email"
                  value={editClientModal.email || ''}
                  onChange={(e) => setEditClientModal({ ...editClientModal, email: e.target.value })}
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg p-2.5 text-slate-900 dark:bg-[#111827] dark:border-[#293548] dark:text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditClientModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-[#111827] dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold shadow-xs transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 5: EDIT BUILDING
      ========================================================================= */}
      {editBuildingModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#E2E8F0] text-slate-900 text-xs dark:bg-[#172033] dark:border-[#293548] dark:text-white">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 dark:border-[#293548]">
              <h3 className="font-bold text-[#0F172A] text-base dark:text-white">Edit Building</h3>
              <button onClick={() => setEditBuildingModal(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">✕</button>
            </div>

            <form onSubmit={handleUpdateBuilding} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1 dark:text-slate-300">Building Name *</label>
                <input
                  type="text"
                  required
                  value={editBuildingModal.name}
                  onChange={(e) => setEditBuildingModal({ ...editBuildingModal, name: e.target.value })}
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg p-2.5 text-slate-900 dark:bg-[#111827] dark:border-[#293548] dark:text-white"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1 dark:text-slate-300">Premises Address *</label>
                <input
                  type="text"
                  required
                  value={editBuildingModal.address}
                  onChange={(e) => setEditBuildingModal({ ...editBuildingModal, address: e.target.value })}
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg p-2.5 text-slate-900 dark:bg-[#111827] dark:border-[#293548] dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1 dark:text-slate-300">State / UT</label>
                  <select
                    value={editBuildingModal.state || 'Delhi'}
                    onChange={(e) => setEditBuildingModal({ ...editBuildingModal, state: e.target.value })}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg p-2.5 text-slate-900 dark:bg-[#111827] dark:border-[#293548] dark:text-white"
                  >
                    {INDIAN_STATES_AND_UTS.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1 dark:text-slate-300">Reporting Cycle</label>
                  <select
                    value={editBuildingModal.reportingCycle || 'Quarterly'}
                    onChange={(e) => setEditBuildingModal({ ...editBuildingModal, reportingCycle: e.target.value, complianceCycle: e.target.value })}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg p-2.5 text-slate-900 dark:bg-[#111827] dark:border-[#293548] dark:text-white"
                  >
                    {REPORTING_CYCLES.map((rc) => (
                      <option key={rc.value} value={rc.value}>{rc.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1 dark:text-slate-300">Local Fire Rule / Format (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Rule 33, Form-B, NBC 2016"
                  value={editBuildingModal.complianceRuleName || ''}
                  onChange={(e) => setEditBuildingModal({ ...editBuildingModal, complianceRuleName: e.target.value })}
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg p-2.5 text-slate-900 dark:bg-[#111827] dark:border-[#293548] dark:text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditBuildingModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-[#111827] dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold shadow-xs transition-all"
                >
                  Save Building
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 6: EDIT EQUIPMENT (WITH AUTOMATIC WEBP PHOTO COMPRESSION)
      ========================================================================= */}
      {editEquipmentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#E2E8F0] text-slate-900 text-xs dark:bg-[#172033] dark:border-[#293548] dark:text-white">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 dark:border-[#293548]">
              <h3 className="font-bold text-[#0F172A] text-base dark:text-white">Edit Equipment Asset</h3>
              <button onClick={() => setEditEquipmentModal(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">✕</button>
            </div>

            <form onSubmit={handleUpdateEquipment} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1 dark:text-slate-300">Asset ID / Serial Number *</label>
                <input
                  type="text"
                  required
                  value={editEquipmentModal.qrCode}
                  onChange={(e) => setEditEquipmentModal({ ...editEquipmentModal, qrCode: e.target.value.toUpperCase() })}
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg p-2.5 text-slate-900 font-mono uppercase dark:bg-[#111827] dark:border-[#293548] dark:text-white"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1 dark:text-slate-300">Capacity / Specification *</label>
                <input
                  type="text"
                  required
                  value={editEquipmentModal.capacity}
                  onChange={(e) => setEditEquipmentModal({ ...editEquipmentModal, capacity: e.target.value })}
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg p-2.5 text-slate-900 dark:bg-[#111827] dark:border-[#293548] dark:text-white"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1 dark:text-slate-300">Location Details *</label>
                <input
                  type="text"
                  required
                  value={editEquipmentModal.location}
                  onChange={(e) => setEditEquipmentModal({ ...editEquipmentModal, location: e.target.value })}
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg p-2.5 text-slate-900 dark:bg-[#111827] dark:border-[#293548] dark:text-white"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1 dark:text-slate-300">Refill / Service Interval (Months)</label>
                <input
                  type="number"
                  value={editEquipmentModal.serviceIntervalMonths}
                  onChange={(e) => {
                    const mos = Number(e.target.value);
                    setEditEquipmentModal({
                      ...editEquipmentModal,
                      serviceIntervalMonths: mos,
                      nextDueDate: addMonthsToDateString(
                        editEquipmentModal.lastServiceDate || toDateInputString(new Date()),
                        mos
                      ),
                    });
                  }}
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg p-2.5 text-slate-900 dark:bg-[#111827] dark:border-[#293548] dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 bg-slate-50 rounded-xl border border-[#E2E8F0] dark:bg-[#0B1220] dark:border-[#293548]">
                <div>
                  <label className="block text-slate-700 font-bold mb-1 dark:text-slate-300">
                    Last Service / Refill Date
                  </label>
                  <input
                    type="date"
                    value={editEquipmentModal.lastServiceDate || toDateInputString(new Date())}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditEquipmentModal({
                        ...editEquipmentModal,
                        lastServiceDate: val,
                        nextDueDate: addMonthsToDateString(val, editEquipmentModal.serviceIntervalMonths || 12),
                      });
                    }}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg p-2 text-slate-900 dark:bg-[#111827] dark:border-[#293548] dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1 dark:text-slate-300">
                    Next Service Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={editEquipmentModal.nextDueDate || toDateInputString(new Date())}
                    onChange={(e) =>
                      setEditEquipmentModal({ ...editEquipmentModal, nextDueDate: e.target.value })
                    }
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg p-2 text-slate-900 dark:bg-[#111827] dark:border-[#293548] dark:text-white"
                  />
                </div>
                <div className="sm:col-span-2 flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 mr-1">Quick Presets:</span>
                  <button
                    type="button"
                    onClick={() =>
                      setEditEquipmentModal({
                        ...editEquipmentModal,
                        nextDueDate: addMonthsToDateString(
                          editEquipmentModal.lastServiceDate || toDateInputString(new Date()),
                          12
                        ),
                      })
                    }
                    className="px-2 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-bold transition-colors dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                  >
                    +1 Year (Standard)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setEditEquipmentModal({
                        ...editEquipmentModal,
                        nextDueDate: addDaysToTodayString(15),
                      })
                    }
                    className="px-2 py-0.5 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-[10px] font-bold transition-colors dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                  >
                    Due in 15 Days
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setEditEquipmentModal({
                        ...editEquipmentModal,
                        nextDueDate: addDaysToTodayString(-5),
                      })
                    }
                    className="px-2 py-0.5 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-bold transition-colors dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
                  >
                    Overdue (-5 Days)
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1 dark:text-slate-300">
                  Equipment Photo (Auto-compressed WebP &rarr; Cloudflare R2)
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer border border-slate-200 dark:bg-[#111827] dark:border-[#293548] dark:text-slate-300">
                    <Camera className="w-3.5 h-3.5 text-[#2563EB]" />
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

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditEquipmentModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-[#111827] dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={compressingPhoto}
                  className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white font-bold shadow-xs transition-all"
                >
                  Save Equipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 7: FEEDBACK
      ========================================================================= */}
      {feedbackModalOpen && (
        <FeedbackModal
          isOpen={feedbackModalOpen}
          onClose={() => setFeedbackModalOpen(false)}
          userEmail={data?.user?.email}
        />
      )}

      </main>
    </div>
  );
}
