'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  Building2,
  Plus,
  FileText,
  Printer,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Scan,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Layers,
  Sparkles,
  Phone,
  LogOut,
  Calendar,
  Check,
  Flame,
  ArrowRight,
  Database,
  Trash2,
  Edit,
  Settings,
  UserCheck,
  Search,
  Sliders,
  MapPin,
  Mail,
  Wrench,
  Users,
  CreditCard,
  Zap,
  LayoutDashboard,
  Menu,
  FileSpreadsheet,
  Sun,
  Moon
} from 'lucide-react';
import { AdminSidebar, AdminNavTab } from '@/components/admin/AdminSidebar';
import { DashboardOverview } from '@/components/admin/DashboardOverview';
import { ExportModal } from '@/components/admin/ExportModal';
import { ImportModal } from '@/components/admin/ImportModal';
import { ImportType } from '@/lib/excelImport';
import { TechnicianManagement } from '@/components/admin/TechnicianManagement';
import { TechnicianAssignments } from '@/components/admin/TechnicianAssignments';
import { TechnicianActivityLog } from '@/components/admin/TechnicianActivityLog';
import { SubscriptionManager } from '@/components/admin/SubscriptionManager';
import { AdminUsersView } from '@/components/admin/AdminUsersView';
import { WorkOrdersView } from '@/components/admin/WorkOrdersView';
import { InspectionsView } from '@/components/admin/InspectionsView';
import { ReportsView } from '@/components/admin/ReportsView';
import { ClientsView } from '@/components/admin/ClientsView';
import { BuildingsView } from '@/components/admin/BuildingsView';
import { FireAssetsView } from '@/components/admin/FireAssetsView';
import { SettingsView } from '@/components/admin/SettingsView';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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

  // Authenticated Admin OS Navigation Tab
  const [activeTab, setActiveTab] = useState<AdminNavTab>('DASHBOARD');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [techSubTab, setTechSubTab] = useState<'ROSTER' | 'ASSIGNMENTS' | 'AUDIT_LOG'>('ROSTER');
  const [settingsSubTab, setSettingsSubTab] = useState<'LEADS' | 'TOOLS' | 'AGENCY' | 'INVESTORS'>('LEADS');
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

  // Cached collections for Excel export
  const [techniciansList, setTechniciansList] = useState<any[]>([]);
  const [workOrdersList, setWorkOrdersList] = useState<any[]>([]);
  const [inspectionsList, setInspectionsList] = useState<any[]>([]);
  const [dataSubTab, setDataSubTab] = useState<'COMPANY' | 'CLIENTS' | 'BUILDINGS' | 'EQUIPMENT' | 'RESET'>('COMPANY');

  // Modals
  const [addBuildingModalOpen, setAddBuildingModalOpen] = useState(false);
  const [bulkAddModalOpen, setBulkAddModalOpen] = useState<any>(null);
  const [singleAddEquipModalOpen, setSingleAddEquipModalOpen] = useState<any>(null);
  const [editClientModal, setEditClientModal] = useState<any>(null);
  const [editBuildingModal, setEditBuildingModal] = useState<any>(null);
  const [editEquipmentModal, setEditEquipmentModal] = useState<any>(null);

  // Notification / Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Add building form state
  const [buildingForm, setBuildingForm] = useState({
    clientName: '',
    contactPerson: '',
    phone: '',
    email: '',
    buildingName: '',
    address: '',
    complianceCycle: 'Delhi NCR Statutory Form-B (Half-Yearly)',
    cycleIntervalMos: 6,
  });

  // Bulk add equipment form state
  const [equipmentForm, setEquipmentForm] = useState({
    type: 'Fire Extinguisher',
    capacity: 'ABC Dry Powder 6kg',
    prefix: '',
    count: 10,
    locationBase: 'Floor Landing Corridor',
    serviceIntervalMonths: 12,
  });

  // Single add equipment form state
  const [singleEquipForm, setSingleEquipForm] = useState({
    qrCode: '',
    type: 'Fire Extinguisher',
    capacity: 'ABC Dry Powder 6kg',
    location: '',
    serviceIntervalMonths: 12,
  });

  // Company profile form state
  const [companyForm, setCompanyForm] = useState({
    name: '',
    licenseNumber: '',
    phone: '',
    email: '',
    address: '',
  });

  // Clients state for data manage tab
  const [clientsList, setClientsList] = useState<any[]>([]);
  const [equipmentsList, setEquipmentsList] = useState<any[]>([]);
  const [equipSearch, setEquipSearch] = useState('');
  const [equipFilterBuilding, setEquipFilterBuilding] = useState('ALL');

  // Enquiries & Leads state
  const [enquiriesList, setEnquiriesList] = useState<any[]>([]);
  const [enquiryStatusFilter, setEnquiryStatusFilter] = useState('ALL');
  const [loadingEnquiries, setLoadingEnquiries] = useState(false);

  const fetchSubscription = async () => {
    try {
      const res = await fetch('/api/admin/subscription');
      const json = await res.json();
      if (res.ok) {
        setSubscriptionData(json);
      }
    } catch (e) {
      console.error('Failed to fetch subscription:', e);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/buildings');
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

      setData(json);
      if (json.company) {
        setCompanyForm({
          name: json.company.name || '',
          licenseNumber: json.company.licenseNumber || '',
          phone: json.company.phone || '',
          email: json.company.email || '',
          address: json.company.address || '',
        });
      }
      if (!expandedBuildingId && json.buildings?.length > 0) {
        setExpandedBuildingId(json.buildings[0].id);
      }
      fetchClients();
      fetchSubscription();
      fetchKpis();
      fetchEquipments();
      fetchTechnicians();
      fetchWorkOrders();
      fetchInspections();
      fetchEnquiries();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchKpis = async () => {
    try {
      const res = await fetch('/api/dashboard');
      const json = await res.json();
      if (json.kpis) {
        setKpis(json.kpis);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const res = await fetch('/api/admin/technicians');
      const json = await res.json();
      if (json.technicians) setTechniciansList(json.technicians);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchWorkOrders = async () => {
    try {
      const res = await fetch('/api/work-orders');
      const json = await res.json();
      if (json.workOrders) setWorkOrdersList(json.workOrders);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchInspections = async () => {
    try {
      const res = await fetch('/api/inspections');
      const json = await res.json();
      if (json.inspections) setInspectionsList(json.inspections);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/admin/clients');
      const json = await res.json();
      if (json.clients) {
        setClientsList(json.clients);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchEquipments = async () => {
    try {
      const query = new URLSearchParams();
      if (equipFilterBuilding !== 'ALL') query.set('buildingId', equipFilterBuilding);
      if (equipSearch.trim()) query.set('search', equipSearch.trim());
      const res = await fetch(`/api/admin/equipment?${query.toString()}`);
      const json = await res.json();
      if (json.equipments) {
        setEquipmentsList(json.equipments);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchEnquiries = async () => {
    try {
      setLoadingEnquiries(true);
      const query = new URLSearchParams();
      if (enquiryStatusFilter !== 'ALL') query.set('status', enquiryStatusFilter);
      const res = await fetch(`/api/enquiries?${query.toString()}`);
      const json = await res.json();
      if (json.enquiries) {
        setEnquiriesList(json.enquiries);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingEnquiries(false);
    }
  };

  const handleOpenExport = (key?: string) => {
    if (key) {
      setExportConfigKey(key);
    } else {
      const tabMap: Record<string, string> = {
        CLIENTS: 'CLIENTS',
        BUILDINGS: 'BUILDINGS',
        FIRE_ASSETS: 'FIRE_ASSETS',
        TECHNICIANS: 'TECHNICIANS',
        INSPECTIONS: 'INSPECTIONS',
        WORK_ORDERS: 'WORK_ORDERS',
        REPORTS: 'FIRE_ASSETS',
      };
      setExportConfigKey(tabMap[activeTab] || 'FIRE_ASSETS');
    }
    setExportModalOpen(true);
  };

  const handleUpdateEnquiryStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/enquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(`Lead status updated to ${newStatus}`);
        fetchEnquiries();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = '/login';
    } catch (e) {
      console.error(e);
      window.location.href = '/login';
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === 'CLIENTS') {
      fetchClients();
    } else if (activeTab === 'FIRE_ASSETS') {
      fetchEquipments();
    } else if (activeTab === 'SETTINGS') {
      fetchEnquiries();
    } else if (activeTab === 'DASHBOARD') {
      fetchKpis();
    } else if (activeTab === 'TECHNICIANS') {
      fetchTechnicians();
    } else if (activeTab === 'WORK_ORDERS') {
      fetchWorkOrders();
    } else if (activeTab === 'INSPECTIONS') {
      fetchInspections();
    }
  }, [activeTab, equipFilterBuilding, equipSearch, enquiryStatusFilter]);

  // Company Profile Update
  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/company', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyForm),
      });
      const resData = await res.json();
      if (resData.success) {
        showToast('AMC Company Profile saved successfully!');
        fetchData();
      } else {
        alert(resData.error || 'Failed to update company');
      }
    } catch (e) {
      console.error(e);
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
      const resData = await res.json();
      if (resData.success) {
        setAddBuildingModalOpen(false);
        showToast(`Building '${buildingForm.buildingName}' created successfully.`);
        setBuildingForm({
          clientName: '',
          contactPerson: '',
          phone: '',
          email: '',
          buildingName: '',
          address: '',
          complianceCycle: 'Delhi NCR Statutory Form-B (Half-Yearly)',
          cycleIntervalMos: 6,
        });
        fetchData();
      }
    } catch (e) {
      console.error(e);
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
      const resData = await res.json();
      if (resData.success) {
        setBulkAddModalOpen(null);
        showToast(`Generated ${resData.count} equipment QR units for ${bulkAddModalOpen.name}`);
        fetchData();
        fetchEquipments();
      }
    } catch (e) {
      console.error(e);
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
      const resData = await res.json();
      if (resData.success) {
        setSingleAddEquipModalOpen(null);
        showToast(`Added equipment ${singleEquipForm.qrCode}`);
        setSingleEquipForm({
          qrCode: '',
          type: 'Fire Extinguisher',
          capacity: 'ABC Dry Powder 6kg',
          location: '',
          serviceIntervalMonths: 12,
        });
        fetchData();
        fetchEquipments();
      } else {
        alert(resData.error || 'Failed to add equipment');
      }
    } catch (e) {
      console.error(e);
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
      const json = await res.json();
      if (json.success) {
        setEditClientModal(null);
        showToast('Client details updated');
        fetchClients();
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Delete Client
  const handleDeleteClient = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete client '${name}'? This will also delete their buildings and equipment.`)) return;
    try {
      const res = await fetch(`/api/admin/clients/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        showToast(`Deleted client '${name}'`);
        fetchClients();
        fetchData();
      }
    } catch (e) {
      console.error(e);
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
      const json = await res.json();
      if (json.success) {
        setEditBuildingModal(null);
        showToast('Building updated successfully');
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Delete Building
  const handleDeleteBuilding = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete building '${name}' and all its equipment?`)) return;
    try {
      const res = await fetch(`/api/admin/buildings/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        showToast(`Deleted building '${name}'`);
        fetchData();
      }
    } catch (e) {
      console.error(e);
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
      const json = await res.json();
      if (json.success) {
        setEditEquipmentModal(null);
        showToast(`Updated equipment ${editEquipmentModal.qrCode}`);
        fetchEquipments();
        fetchData();
      } else {
        alert(json.error || 'Failed to update equipment');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Delete Equipment
  const handleDeleteEquipment = async (id: string, qrCode: string) => {
    if (!confirm(`Are you sure you want to delete equipment '${qrCode}'?`)) return;
    try {
      const res = await fetch(`/api/admin/equipment/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        showToast(`Deleted equipment '${qrCode}'`);
        fetchEquipments();
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Data Manage: Wipe All Demo Data
  const handleWipeAllDemo = async () => {
    if (!confirm('CAUTION: This will delete ALL clients, buildings, and equipment from the database so you can start with a 100% clean slate. Continue?')) return;
    try {
      setLoading(true);
      const res = await fetch('/api/admin/data-manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'WIPE_ALL_DEMO' }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(json.message);
        fetchData();
        fetchClients();
        fetchEquipments();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Data Manage: Seed Clean Template
  const handleSeedCleanData = async () => {
    if (!confirm('This will load clean, non-trademarked operational sample data (Cyber Park IT & Emerald Heights) for testing. Continue?')) return;
    try {
      setLoading(true);
      const res = await fetch('/api/admin/data-manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SEED_CLEAN' }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(json.message);
        fetchData();
        fetchClients();
        fetchEquipments();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center min-h-screen bg-[#F8FAFC] dark:bg-[#080d1a]">
        <div className="flex flex-col items-center gap-3 text-slate-500 dark:text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-[#007DB8] dark:text-amber-500" />
          <p className="text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-300">Loading building compliance matrix...</p>
        </div>
      </div>
    );
  }

  const { summary, buildings, company } = data;
  const userFirstName = data?.profile?.fullName?.trim() ? data.profile.fullName.split(' ')[0] : (data?.user?.email ? data.user.email.split('@')[0] : 'Admin');
  const agencyName = company?.name || 'VigilAMC Operating System';
  const licenseNo = company?.licenseNumber || 'DL/FIRE/LIC/2026';

  const exportDataMap: Record<string, any[]> = {
    CLIENTS: clientsList,
    BUILDINGS: buildings || [],
    FIRE_ASSETS: equipmentsList,
    TECHNICIANS: techniciansList,
    WORK_ORDERS: workOrdersList,
    INSPECTIONS: inspectionsList,
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''} bg-[#F8FAFC] flex flex-col lg:flex-row text-slate-900 dark:bg-[#080d1a] dark:text-slate-100 selection:bg-[#EAF6FF] selection:text-[#073F8F] dark:selection:bg-amber-500 dark:selection:text-slate-950`}>
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border-2 border-[#007DB8] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Admin OS Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setMobileSidebarOpen(false);
        }}
        onOpenExport={() => handleOpenExport()}
        onOpenImport={() => handleOpenImport()}
        unreadLeadsCount={enquiriesList.filter((e) => e.status === 'NEW').length}
        subscription={subscriptionData}
        isMobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onLogout={handleLogout}
        company={company}
        userEmail={data?.user?.email}
        userProfile={data?.profile}
      />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
        
        {/* Top Header Bar */}
        <div className="rounded-2xl bg-white border border-[#DCE7F2] p-4 sm:p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 dark:bg-slate-900/90 dark:border-slate-800 dark:shadow-2xl">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300 dark:hover:text-white"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#007DB8] dark:text-slate-400">Admin OS</span>
                <span className="text-slate-400 dark:text-slate-600">/</span>
                <h1 className="text-lg sm:text-xl font-black text-[#073F8F] dark:text-white tracking-tight">
                  {activeTab === 'DASHBOARD' && 'Executive Overview'}
                  {activeTab === 'AGENCY' && 'Agency Profile & Subscription'}
                  {activeTab === 'ADMIN_USERS' && 'Admin Users & Roles'}
                  {activeTab === 'TECHNICIANS' && 'Technician Workforce'}
                  {activeTab === 'CLIENTS' && 'Client Societies & Accounts'}
                  {activeTab === 'BUILDINGS' && 'Buildings & Towers'}
                  {activeTab === 'FIRE_ASSETS' && 'Fire Assets & Inventory'}
                  {activeTab === 'INSPECTIONS' && 'Inspection Logs & Compliance'}
                  {activeTab === 'WORK_ORDERS' && 'Work Orders & Dispatch'}
                  {activeTab === 'REPORTS' && 'Statutory Reports & Form-B'}
                  {activeTab === 'SETTINGS' && 'System Settings & Inquiries'}
                </h1>
              </div>
              <p className="text-xs text-[#475569] dark:text-slate-400 mt-0.5">
                Welcome back, <strong className="text-slate-800 dark:text-slate-200 font-semibold">{userFirstName}</strong>! • Managing compliance for <strong className="text-slate-800 dark:text-slate-200 font-semibold">{agencyName}</strong> • License:{' '}
                <strong className="text-slate-800 dark:text-slate-300 font-semibold">{licenseNo}</strong>
              </p>
            </div>
          </div>

          {/* Quick Actions & Theme Switcher */}
          <div className="flex items-center gap-2.5 flex-wrap self-end md:self-auto">
            {/* Theme Toggle (Light / Dark Mode) */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-amber-400 dark:border-slate-700 transition-all shadow-sm"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            <button
              onClick={() => handleOpenImport('FIRE_ASSETS')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#EAF6FF] hover:bg-[#d0ebff] text-[#073F8F] border border-[#007DB8]/30 text-xs font-bold transition-all shadow-sm dark:bg-amber-500/10 dark:hover:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40"
              title="Import Existing Data from Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#007DB8] dark:text-amber-400" />
              <span>Import Excel</span>
            </button>

            <button
              onClick={() => handleOpenExport()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold transition-all shadow-sm dark:bg-emerald-600/20 dark:hover:bg-emerald-600/30 dark:text-emerald-300 dark:border-emerald-500/40"
              title="Export Current View Data to Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Export Excel</span>
            </button>

            <Link
              href="/assets/print-qr"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-[#DCE7F2] text-xs font-bold transition-all shadow-sm dark:bg-slate-950 dark:hover:bg-slate-800 dark:text-slate-200 dark:border-slate-800 hover:border-[#007DB8]/40"
            >
              <Printer className="w-4 h-4 text-[#007DB8] dark:text-amber-400" />
              <span className="hidden sm:inline">Print QR Labels</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition-all shadow-sm dark:bg-red-950/40 dark:hover:bg-red-900/60 dark:text-red-300 dark:border-red-800/50"
              title="Sign Out of Admin OS"
            >
              <LogOut className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            VIEW: DASHBOARD (EXECUTIVE OVERVIEW WITH 8 REAL DB KPIS)
        ========================================================================= */}
        {activeTab === 'DASHBOARD' && (
          <DashboardOverview
            kpis={kpis}
            subscription={subscriptionData}
            buildings={buildings}
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenExport={() => handleOpenExport('FIRE_ASSETS')}
            onOpenImport={() => handleOpenImport('FIRE_ASSETS')}
          />
        )}

        {/* =========================================================================
            VIEW: AGENCY & SUBSCRIPTION PLAN TIER
        ========================================================================= */}
        {activeTab === 'AGENCY' && (
          <div className="space-y-8">
            <div className="rounded-2xl bg-white border border-[#DCE7F2] shadow-sm p-5 sm:p-6 space-y-4 dark:bg-slate-900/90 dark:border-slate-800 dark:shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#DCE7F2] pb-3 dark:border-slate-800">
                <div>
                  <h2 className="text-base font-bold text-[#073F8F] flex items-center gap-2 dark:text-white">
                    <Building2 className="w-5 h-5 text-[#007DB8] dark:text-amber-400" />
                    <span>Agency Organization Profile</span>
                  </h2>
                  <p className="text-xs text-[#475569] mt-0.5 dark:text-slate-400">
                    Official statutory credentials printed on Delhi Fire Service &amp; NBC inspection certificates.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveCompany} className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#DCE7F2] space-y-4 text-xs dark:bg-slate-950/80 dark:border-slate-800">
                <div>
                  <label className="block text-slate-700 font-bold mb-1 dark:text-slate-300">Company / Agency Name *</label>
                  <input
                    type="text"
                    required
                    value={companyForm.name}
                    onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                    placeholder="e.g. National Fire Safety & AMC Services"
                    className="w-full bg-white border border-[#DCE7F2] rounded-xl p-3 text-slate-900 focus:outline-none focus:border-[#007DB8] font-medium shadow-sm dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1 dark:text-slate-300">Govt. Fire License Number *</label>
                    <input
                      type="text"
                      required
                      value={companyForm.licenseNumber}
                      onChange={(e) => setCompanyForm({ ...companyForm, licenseNumber: e.target.value })}
                      placeholder="e.g. DL/FIRE/LIC/2026/042"
                      className="w-full bg-white border border-[#DCE7F2] rounded-xl p-3 text-slate-900 focus:outline-none focus:border-[#007DB8] font-medium shadow-sm dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1 dark:text-slate-300">Emergency Dispatch Phone *</label>
                    <input
                      type="text"
                      required
                      value={companyForm.phone}
                      onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                      placeholder="e.g. +91 98200 11223"
                      className="w-full bg-white border border-[#DCE7F2] rounded-xl p-3 text-slate-900 focus:outline-none focus:border-[#007DB8] font-medium shadow-sm dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1 dark:text-slate-300">Official Service Email *</label>
                    <input
                      type="email"
                      required
                      value={companyForm.email}
                      onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                      placeholder="e.g. service@nationalfireamc.in"
                      className="w-full bg-white border border-[#DCE7F2] rounded-xl p-3 text-slate-900 focus:outline-none focus:border-[#007DB8] font-medium shadow-sm dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1 dark:text-slate-300">Registered Service Office Address</label>
                    <input
                      type="text"
                      value={companyForm.address}
                      onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                      placeholder="e.g. Plot 24, Okhla Industrial Area Phase III, New Delhi 110020"
                      className="w-full bg-white border border-[#DCE7F2] rounded-xl p-3 text-slate-900 focus:outline-none focus:border-[#007DB8] font-medium shadow-sm dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:focus:border-amber-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#007DB8] hover:bg-[#073F8F] text-white font-bold text-xs shadow transition-all hover:scale-[1.01] dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-slate-950 dark:font-black"
                >
                  Save Agency Profile
                </button>
              </form>
            </div>

            <SubscriptionManager
              showToast={showToast}
              onPlanChanged={() => {
                fetchSubscription();
                fetchData();
              }}
            />
          </div>
        )}

        {/* =========================================================================
            VIEW: ADMIN USERS & RBAC PERMISSIONS
        ========================================================================= */}
        {activeTab === 'ADMIN_USERS' && (
          <AdminUsersView currentUser={data?.user} company={company} />
        )}

        {/* =========================================================================
            VIEW: TECHNICIAN MANAGEMENT (ROSTER, SEATS, ASSIGNMENTS, AUDIT)
        ========================================================================= */}
        {activeTab === 'TECHNICIANS' && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-white border border-[#DCE7F2] p-4 shadow-sm flex items-center justify-between flex-wrap gap-3 dark:bg-slate-900/90 dark:border-slate-800 dark:shadow-xl">
              <div className="flex items-center gap-2 overflow-x-auto">
                {[
                  { id: 'ROSTER', label: 'Technician Roster & Seats', icon: Users },
                  { id: 'ASSIGNMENTS', label: 'Facility Assignments', icon: Building2 },
                  { id: 'AUDIT_LOG', label: 'Compliance Audit Trail', icon: Clock },
                ].map((sub) => {
                  const Icon = sub.icon;
                  const active = techSubTab === sub.id;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => setTechSubTab(sub.id as any)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                        active
                          ? 'bg-[#EAF6FF] text-[#073F8F] border border-[#007DB8]/30 font-bold shadow-sm dark:bg-amber-500 dark:text-slate-950 dark:font-black'
                          : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-[#DCE7F2] dark:bg-slate-950 dark:text-slate-400 dark:hover:text-white dark:border-slate-800'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 text-[#007DB8] dark:text-inherit" />
                      <span>{sub.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenExport('TECHNICIANS')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold transition-all shadow-sm dark:bg-emerald-600/20 dark:hover:bg-emerald-600/30 dark:text-emerald-300 dark:border-emerald-500/30"
                  title="Export Technicians to Excel (.xlsx)"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Export Excel</span>
                </button>

                <button
                  onClick={() => {
                    fetchData();
                    fetchSubscription();
                  }}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-[#DCE7F2] dark:bg-slate-950 dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-white dark:border-slate-800"
                  title="Refresh Technicians"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {techSubTab === 'ROSTER' && (
              <TechnicianManagement
                onNavigateToSubscription={() => setActiveTab('AGENCY')}
                showToast={showToast}
                onOpenImport={() => handleOpenImport('TECHNICIANS')}
              />
            )}

            {techSubTab === 'ASSIGNMENTS' && (
              <TechnicianAssignments showToast={showToast} />
            )}

            {techSubTab === 'AUDIT_LOG' && (
              <TechnicianActivityLog />
            )}
          </div>
        )}

        {/* =========================================================================
            VIEW: CLIENT SOCIETIES & ACCOUNTS
        ========================================================================= */}
        {activeTab === 'CLIENTS' && (
          <ClientsView
            clientsList={clientsList}
            onAddClient={() => setAddBuildingModalOpen(true)}
            onEditClient={(c) => setEditClientModal(c)}
            onDeleteClient={handleDeleteClient}
            onOpenExport={() => handleOpenExport('CLIENTS')}
            onOpenImport={() => handleOpenImport('CLIENTS')}
          />
        )}

        {/* =========================================================================
            VIEW: BUILDINGS & TOWERS
        ========================================================================= */}
        {activeTab === 'BUILDINGS' && (
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
          />
        )}

        {/* =========================================================================
            VIEW: FIRE ASSETS & QR INVENTORY
        ========================================================================= */}
        {activeTab === 'FIRE_ASSETS' && (
          <FireAssetsView
            equipmentsList={equipmentsList}
            buildings={buildings}
            equipFilterBuilding={equipFilterBuilding}
            setEquipFilterBuilding={setEquipFilterBuilding}
            equipSearch={equipSearch}
            setEquipSearch={setEquipSearch}
            onEditEquipment={(eq) => setEditEquipmentModal(eq)}
            onDeleteEquipment={handleDeleteEquipment}
            onOpenExport={() => handleOpenExport('FIRE_ASSETS')}
            onOpenImport={() => handleOpenImport('FIRE_ASSETS')}
          />
        )}

        {/* =========================================================================
            VIEW: INSPECTION LOGS & COMPLIANCE
        ========================================================================= */}
        {activeTab === 'INSPECTIONS' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => handleOpenExport('INSPECTIONS')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold transition-all shadow-sm dark:bg-emerald-600/20 dark:hover:bg-emerald-600/30 dark:text-emerald-300 dark:border-emerald-500/30"
                title="Export Inspections to Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Export Excel</span>
              </button>
            </div>
            <InspectionsView
              showToast={showToast}
              onOpenImport={() => handleOpenImport('INSPECTIONS')}
            />
          </div>
        )}

        {/* =========================================================================
            VIEW: WORK ORDERS & DISPATCH
        ========================================================================= */}
        {activeTab === 'WORK_ORDERS' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => handleOpenExport('WORK_ORDERS')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold transition-all shadow-sm dark:bg-emerald-600/20 dark:hover:bg-emerald-600/30 dark:text-emerald-300 dark:border-emerald-500/30"
                title="Export Work Orders to Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Export Excel</span>
              </button>
            </div>
            <WorkOrdersView
              showToast={showToast}
              onOpenImport={() => handleOpenImport('WORK_ORDERS')}
            />
          </div>
        )}

        {/* =========================================================================
            VIEW: STATUTORY REPORTS & FORM-B
        ========================================================================= */}
        {activeTab === 'REPORTS' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => handleOpenExport('REPORTS')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold transition-all shadow-sm dark:bg-emerald-600/20 dark:hover:bg-emerald-600/30 dark:text-emerald-300 dark:border-emerald-500/30"
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
            VIEW: SETTINGS (LEADS, TOOLS & AGENCY PROFILE)
        ========================================================================= */}
        {activeTab === 'SETTINGS' && (
          <SettingsView
            subTab={settingsSubTab}
            setSubTab={setSettingsSubTab}
            enquiriesList={enquiriesList}
            enquiryStatusFilter={enquiryStatusFilter}
            setEnquiryStatusFilter={setEnquiryStatusFilter}
            loadingEnquiries={loadingEnquiries}
            onRefreshEnquiries={fetchEnquiries}
            onUpdateEnquiryStatus={handleUpdateEnquiryStatus}
            onWipeAllDemo={handleWipeAllDemo}
            onSeedCleanData={handleSeedCleanData}
            companyForm={companyForm}
            setCompanyForm={setCompanyForm}
            handleSaveCompany={handleSaveCompany}
            onOpenImport={(type) => handleOpenImport(type || 'CLIENTS')}
          />
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
            fetchData();
            fetchSubscription();
          }}
        />

      {/* =========================================================================
          MODAL 1: ADD CLIENT & BUILDING
      ========================================================================= */}
      {addBuildingModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-[#DCE7F2] max-h-[90vh] overflow-y-auto text-slate-900 dark:bg-[#0d1424] dark:border-slate-700/80 dark:text-white">
            
            <div className="flex items-center justify-between border-b border-[#DCE7F2] pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-[#007DB8] dark:text-amber-400" />
                <h3 className="font-bold text-[#073F8F] text-base dark:text-white">Register Client &amp; Building</h3>
              </div>
              <button
                onClick={() => setAddBuildingModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBuilding} className="space-y-4 text-xs">
              <div className="p-3.5 bg-[#F8FAFC] rounded-xl space-y-2.5 border border-[#DCE7F2] dark:bg-slate-950/80 dark:border-slate-800">
                <h4 className="font-bold text-[#007DB8] uppercase text-[10px] tracking-wider dark:text-amber-400">Client &amp; Society Details</h4>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 dark:text-slate-300">Client / Society Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Horizon Co-op Housing Society"
                    value={buildingForm.clientName}
                    onChange={(e) => setBuildingForm({ ...buildingForm, clientName: e.target.value })}
                    className="w-full bg-white border border-[#DCE7F2] rounded-lg p-2.5 text-slate-900 placeholder-slate-400 focus:border-[#007DB8] focus:outline-none dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 dark:focus:border-amber-500"
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
                      className="w-full bg-white border border-[#DCE7F2] rounded-lg p-2.5 text-slate-900 placeholder-slate-400 focus:border-[#007DB8] focus:outline-none dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 dark:focus:border-amber-500"
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
                      className="w-full bg-white border border-[#DCE7F2] rounded-lg p-2.5 text-slate-900 placeholder-slate-400 focus:border-[#007DB8] focus:outline-none dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 dark:focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-[#F8FAFC] rounded-xl space-y-2.5 border border-[#DCE7F2] dark:bg-slate-950/80 dark:border-slate-800">
                <h4 className="font-bold text-[#007DB8] uppercase text-[10px] tracking-wider dark:text-amber-400">Building &amp; Compliance Cycle</h4>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 dark:text-slate-300">Building / Tower Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Horizon Heights Tower C"
                    value={buildingForm.buildingName}
                    onChange={(e) => setBuildingForm({ ...buildingForm, buildingName: e.target.value })}
                    className="w-full bg-white border border-[#DCE7F2] rounded-lg p-2.5 text-slate-900 placeholder-slate-400 focus:border-[#007DB8] focus:outline-none dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 dark:focus:border-amber-500"
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
                    className="w-full bg-white border border-[#DCE7F2] rounded-lg p-2.5 text-slate-900 placeholder-slate-400 focus:border-[#007DB8] focus:outline-none dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 dark:focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 dark:text-slate-300">Statutory Compliance Cycle</label>
                  <select
                    value={buildingForm.complianceCycle}
                    onChange={(e) => setBuildingForm({ ...buildingForm, complianceCycle: e.target.value })}
                    className="w-full bg-white border border-[#DCE7F2] rounded-lg p-2.5 text-slate-900 focus:border-[#007DB8] focus:outline-none dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:focus:border-amber-500"
                  >
                    <option value="Delhi NCR Statutory Form-B (Half-Yearly)">Delhi NCR Statutory Form-B (DFS / NBC 2016)</option>
                    <option value="Delhi Fire NOC Rule 33 (Annual)">Delhi Fire NOC Rule 33 (Annual)</option>
                    <option value="Haryana Fire Safety Rules (Annual)">Haryana Fire Safety Rules (Annual)</option>
                    <option value="National Building Code Part 4 (Annual)">National Building Code Part 4 (Annual)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddBuildingModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#007DB8] hover:bg-[#073F8F] text-white font-bold shadow-md hover:scale-[1.02] transition-all dark:bg-gradient-to-r dark:from-amber-500 dark:to-orange-500 dark:text-slate-950 dark:font-black"
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
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-[#DCE7F2] max-h-[90vh] overflow-y-auto text-slate-900 dark:bg-[#0d1424] dark:border-slate-700/80 dark:text-white">
            
            <div className="flex items-center justify-between border-b border-[#DCE7F2] pb-3 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-[#073F8F] text-base dark:text-white">Bulk Add Equipment</h3>
                <p className="text-xs text-[#007DB8] font-semibold mt-0.5 dark:text-amber-400">{bulkAddModalOpen.name}</p>
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
                    className="w-full bg-white border border-[#DCE7F2] rounded-lg p-2.5 text-slate-900 focus:border-[#007DB8] focus:outline-none dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:focus:border-amber-500"
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
                    className="w-full bg-white border border-[#DCE7F2] rounded-lg p-2.5 text-slate-900 placeholder-slate-400 focus:border-[#007DB8] focus:outline-none dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 dark:focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 dark:text-slate-300">QR Code Prefix</label>
                  <input
                    type="text"
                    value={equipmentForm.prefix}
                    onChange={(e) => setEquipmentForm({ ...equipmentForm, prefix: e.target.value.toUpperCase() })}
                    placeholder="e.g. EXT or TWR"
                    className="w-full bg-white border border-[#DCE7F2] rounded-lg p-2.5 text-slate-900 font-mono uppercase focus:border-[#007DB8] focus:outline-none dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:focus:border-amber-500"
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
                    className="w-full bg-white border border-[#DCE7F2] rounded-lg p-2.5 text-slate-900 focus:border-[#007DB8] focus:outline-none dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:focus:border-amber-500"
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
                  className="w-full bg-white border border-[#DCE7F2] rounded-lg p-2.5 text-slate-900 placeholder-slate-400 focus:border-[#007DB8] focus:outline-none dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 dark:focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 dark:text-slate-300">Refill / Service Interval</label>
                <select
                  value={equipmentForm.serviceIntervalMonths}
                  onChange={(e) => setEquipmentForm({ ...equipmentForm, serviceIntervalMonths: Number(e.target.value) })}
                  className="w-full bg-white border border-[#DCE7F2] rounded-lg p-2.5 text-slate-900 focus:border-[#007DB8] focus:outline-none dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:focus:border-amber-500"
                >
                  <option value={12}>12 Months (Annual Extinguisher Refill - IS 2190)</option>
                  <option value={6}>6 Months (Half-Yearly Hydrant &amp; Pump Check)</option>
                  <option value={3}>3 Months (Quarterly Fire Alarm &amp; Smoke Check)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBulkAddModalOpen(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#007DB8] hover:bg-[#073F8F] text-white font-bold shadow-md hover:scale-[1.02] transition-all dark:bg-gradient-to-r dark:from-amber-500 dark:to-orange-500 dark:text-slate-950 dark:font-black"
                >
                  Generate {equipmentForm.count} QR Tags
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: SINGLE ADD EQUIPMENT
      ========================================================================= */}
      {singleAddEquipModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#DCE7F2] text-slate-900 dark:bg-[#0d1424] dark:border-slate-700/80 dark:text-white">
            <div className="flex items-center justify-between border-b border-[#DCE7F2] pb-3 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-[#073F8F] text-base dark:text-white">Add Single Equipment Tag</h3>
                <p className="text-xs text-[#007DB8] font-semibold mt-0.5 dark:text-amber-400">{singleAddEquipModalOpen.name}</p>
              </div>
              <button onClick={() => setSingleAddEquipModalOpen(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSingleAddEquipment} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1 dark:text-slate-300">Custom QR Code ID *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HTP-EXT-05"
                  value={singleEquipForm.qrCode}
                  onChange={(e) => setSingleEquipForm({ ...singleEquipForm, qrCode: e.target.value.toUpperCase() })}
                  className="w-full bg-white border border-[#DCE7F2] rounded-lg p-2.5 text-slate-900 font-mono uppercase focus:border-[#007DB8] dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 dark:text-slate-300">Equipment Type</label>
                <select
                  value={singleEquipForm.type}
                  onChange={(e) => setSingleEquipForm({ ...singleEquipForm, type: e.target.value })}
                  className="w-full bg-white border border-[#DCE7F2] rounded-lg p-2.5 text-slate-900 focus:border-[#007DB8] dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:focus:border-amber-500"
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
                  className="w-full bg-white border border-[#DCE7F2] rounded-lg p-2.5 text-slate-900 focus:border-[#007DB8] dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:focus:border-amber-500"
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
                  className="w-full bg-white border border-[#DCE7F2] rounded-lg p-2.5 text-slate-900 focus:border-[#007DB8] dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSingleAddEquipModalOpen(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#007DB8] hover:bg-[#073F8F] text-white font-bold shadow-md dark:bg-gradient-to-r dark:from-amber-500 dark:to-orange-500 dark:text-slate-950 dark:font-black"
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
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#DCE7F2] text-slate-900 text-xs dark:bg-[#0d1424] dark:border-slate-700 dark:text-white">
            <div className="flex items-center justify-between border-b border-[#DCE7F2] pb-3 dark:border-slate-800">
              <h3 className="font-bold text-[#073F8F] text-base dark:text-white">Edit Client</h3>
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
                  className="w-full bg-white border border-[#DCE7F2] rounded-lg p-2.5 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1 dark:text-slate-300">Contact Person</label>
                <input
                  type="text"
                  value={editClientModal.contactPerson}
                  onChange={(e) => setEditClientModal({ ...editClientModal, contactPerson: e.target.value })}
                  className="w-full bg-white border border-[#DCE7F2] rounded-lg p-2.5 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1 dark:text-slate-300">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={editClientModal.phone}
                  onChange={(e) => setEditClientModal({ ...editClientModal, phone: e.target.value })}
                  className="w-full bg-white border border-[#DCE7F2] rounded-lg p-2.5 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1 dark:text-slate-300">Email Address</label>
                <input
                  type="email"
                  value={editClientModal.email || ''}
                  onChange={(e) => setEditClientModal({ ...editClientModal, email: e.target.value })}
                  className="w-full bg-white border border-[#DCE7F2] rounded-lg p-2.5 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditClientModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#007DB8] hover:bg-[#073F8F] text-white font-bold dark:bg-amber-500 dark:text-slate-950 dark:font-black"
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
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#DCE7F2] text-slate-900 text-xs dark:bg-[#0d1424] dark:border-slate-700 dark:text-white">
            <div className="flex items-center justify-between border-b border-[#DCE7F2] pb-3 dark:border-slate-800">
              <h3 className="font-bold text-[#073F8F] text-base dark:text-white">Edit Building</h3>
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
                  className="w-full bg-white border border-[#DCE7F2] rounded-lg p-2.5 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1 dark:text-slate-300">Premises Address *</label>
                <input
                  type="text"
                  required
                  value={editBuildingModal.address}
                  onChange={(e) => setEditBuildingModal({ ...editBuildingModal, address: e.target.value })}
                  className="w-full bg-white border border-[#DCE7F2] rounded-lg p-2.5 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1 dark:text-slate-300">Compliance Cycle</label>
                <select
                  value={editBuildingModal.complianceCycle}
                  onChange={(e) => setEditBuildingModal({ ...editBuildingModal, complianceCycle: e.target.value })}
                  className="w-full bg-white border border-[#DCE7F2] rounded-lg p-2.5 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                >
                  <option value="Delhi NCR Statutory Form-B (Half-Yearly)">Delhi NCR Statutory Form-B (Half-Yearly)</option>
                  <option value="Delhi Fire NOC Rule 33 (Annual)">Delhi Fire NOC Rule 33 (Annual)</option>
                  <option value="Haryana Fire Safety Rules (Annual)">Haryana Fire Safety Rules (Annual)</option>
                  <option value="National Building Code Part 4 (Annual)">National Building Code Part 4 (Annual)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditBuildingModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#007DB8] hover:bg-[#073F8F] text-white font-bold dark:bg-amber-500 dark:text-slate-950 dark:font-black"
                >
                  Save Building
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 6: EDIT EQUIPMENT
      ========================================================================= */}
      {editEquipmentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#DCE7F2] text-slate-900 text-xs dark:bg-[#0d1424] dark:border-slate-700 dark:text-white">
            <div className="flex items-center justify-between border-b border-[#DCE7F2] pb-3 dark:border-slate-800">
              <h3 className="font-bold text-[#073F8F] text-base dark:text-white">Edit Equipment Asset</h3>
              <button onClick={() => setEditEquipmentModal(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">✕</button>
            </div>

            <form onSubmit={handleUpdateEquipment} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1 dark:text-slate-300">QR Code Tag *</label>
                <input
                  type="text"
                  required
                  value={editEquipmentModal.qrCode}
                  onChange={(e) => setEditEquipmentModal({ ...editEquipmentModal, qrCode: e.target.value.toUpperCase() })}
                  className="w-full bg-white border border-[#DCE7F2] rounded-lg p-2.5 text-slate-900 font-mono uppercase dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1 dark:text-slate-300">Capacity / Specification *</label>
                <input
                  type="text"
                  required
                  value={editEquipmentModal.capacity}
                  onChange={(e) => setEditEquipmentModal({ ...editEquipmentModal, capacity: e.target.value })}
                  className="w-full bg-white border border-[#DCE7F2] rounded-lg p-2.5 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1 dark:text-slate-300">Location Details *</label>
                <input
                  type="text"
                  required
                  value={editEquipmentModal.location}
                  onChange={(e) => setEditEquipmentModal({ ...editEquipmentModal, location: e.target.value })}
                  className="w-full bg-white border border-[#DCE7F2] rounded-lg p-2.5 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1 dark:text-slate-300">Refill / Service Interval (Months)</label>
                <input
                  type="number"
                  value={editEquipmentModal.serviceIntervalMonths}
                  onChange={(e) => setEditEquipmentModal({ ...editEquipmentModal, serviceIntervalMonths: Number(e.target.value) })}
                  className="w-full bg-white border border-[#DCE7F2] rounded-lg p-2.5 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditEquipmentModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#007DB8] hover:bg-[#073F8F] text-white font-bold dark:bg-amber-500 dark:text-slate-950 dark:font-black"
                >
                  Save Equipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      </main>
    </div>
  );
}
