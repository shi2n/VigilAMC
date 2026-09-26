'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
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
  Mail
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedBuildingId, setExpandedBuildingId] = useState<string | null>(null);

  // Active view: RADAR (Compliance overview) or DATA_MANAGE (Backend data management)
  const [activeTab, setActiveTab] = useState<'RADAR' | 'DATA_MANAGE'>('RADAR');
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
    complianceCycle: 'Maharashtra Form-B (Half-Yearly)',
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

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/buildings');
      const json = await res.json();
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
      // Also fetch clients list for management
      fetchClients();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
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

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === 'DATA_MANAGE') {
      fetchClients();
      fetchEquipments();
    }
  }, [activeTab, equipFilterBuilding, equipSearch]);

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
          complianceCycle: 'Maharashtra Form-B (Half-Yearly)',
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
      <div className="flex-1 p-8 flex items-center justify-center min-h-[60vh] bg-[#080d1a]">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-sm font-semibold tracking-wide text-slate-300">Loading building compliance matrix...</p>
        </div>
      </div>
    );
  }

  const { summary, buildings, company } = data;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 text-slate-100">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border-2 border-amber-500 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* =========================================================================
          1. HEADER & MODE SWITCHER (Compliance Radar vs. Data Manager)
      ========================================================================= */}
      <div className="tactile-card rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 shadow-2xl space-y-5">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-black shadow-md">
                <ShieldCheck className="w-5 h-5 text-slate-950 stroke-[2.5]" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {company?.name || 'Fire Safety AMC Solutions'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-extrabold uppercase tracking-wider">
                Admin OS
              </span>
            </div>
            <p className="text-xs text-slate-400">
              License: <strong className="text-slate-300">{company?.licenseNumber || 'MH/FIRE/LIC/2024'}</strong> • {company?.address || 'Official Registered Service Center'}
            </p>
          </div>

          {/* Quick Action Navigation */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* View Mode Toggle Button */}
            <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTab('RADAR')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'RADAR'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Compliance Radar
              </button>
              <button
                onClick={() => setActiveTab('DATA_MANAGE')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'DATA_MANAGE'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>Data Manager</span>
              </button>
            </div>

            <Link
              href="/assets/print-qr"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-amber-500/40 text-xs font-bold transition-all"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Print QR Labels</span>
            </Link>

            <Link
              href="/scan"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-amber-500/40 text-xs font-bold transition-all"
            >
              <Scan className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Scan QR</span>
            </Link>
          </div>
        </div>

        {/* 4 Status Metrics Strip (Shown on Radar View) */}
        {activeTab === 'RADAR' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-4 border-t border-slate-800/80">
            {/* Total Buildings */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Buildings
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-white">{summary.totalBuildings}</span>
                <span className="text-xs text-slate-400 font-medium">({summary.totalEquipments} assets)</span>
              </div>
            </div>

            {/* Green Status: All Current */}
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                All Current
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-emerald-400">{summary.compliantBuildings}</span>
                <span className="text-xs text-emerald-300/80 font-medium">100% Compliant</span>
              </div>
            </div>

            {/* Amber Status: Due Within 30d */}
            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-1">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                Due Soon (&lt;30d)
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-amber-400">{summary.dueSoonBuildings}</span>
                <span className="text-xs text-amber-300/80 font-medium">Action Pending</span>
              </div>
            </div>

            {/* Red Status: Overdue */}
            <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30 space-y-1">
              <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                Overdue
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-red-400">{summary.overdueBuildings}</span>
                <span className="text-xs text-red-300/80 font-medium">Non-Compliant</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          VIEW 1: RADAR VIEW (Managed Buildings & Compliance Telemetry)
      ========================================================================= */}
      {activeTab === 'RADAR' && (
        <div className="tactile-card rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl overflow-hidden">
          
          {/* List Header */}
          <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2.5">
              <Building2 className="w-5 h-5 text-amber-400" />
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Managed Buildings &amp; Societies
              </h2>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAddBuildingModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs font-black shadow hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Add Client &amp; Building</span>
              </button>
            </div>
          </div>

          {/* Building List Rows */}
          {buildings.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-3">
              <Building2 className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-white">No buildings registered yet</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Add your first building society or load clean template data in the Data Manager.
              </p>
              <button
                onClick={() => setAddBuildingModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
              >
                + Register First Building
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {buildings.map((b: any) => {
                const isExpanded = expandedBuildingId === b.id;

                return (
                  <div key={b.id} className="transition-colors hover:bg-slate-850/40">
                    
                    {/* Building Header Row */}
                    <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => setExpandedBuildingId(isExpanded ? null : b.id)}
                          className="p-1 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white mt-0.5 transition-colors shrink-0"
                          aria-label="Toggle building equipment"
                        >
                          {isExpanded ? <ChevronDown className="w-5 h-5 text-amber-400" /> : <ChevronRight className="w-5 h-5" />}
                        </button>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="text-base font-bold text-white tracking-tight">{b.name}</span>
                            
                            {/* Status Badge */}
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                                b.overallStatus === 'COMPLIANT'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                  : b.overallStatus === 'DUE_SOON'
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                  : 'bg-red-500/10 text-red-400 border border-red-500/30'
                              }`}
                            >
                              {b.overallStatus === 'COMPLIANT'
                                ? '✓ 100% Compliant'
                                : b.overallStatus === 'DUE_SOON'
                                ? '⚠ Due Soon (30d)'
                                : '✕ Action Needed (Overdue)'}
                            </span>
                          </div>

                          <p className="text-xs text-slate-400">
                            Client: <strong className="text-slate-200 font-semibold">{b.client?.name}</strong> • {b.address}
                          </p>

                          <div className="flex items-center gap-3 text-xs text-slate-400 pt-0.5">
                            <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300">
                              {b.complianceCycle}
                            </span>
                            <span>•</span>
                            <span>
                              Filing Due:{' '}
                              <strong className={b.filingDaysRemaining <= 30 ? 'text-amber-400 font-bold' : 'text-slate-200'}>
                                {new Date(b.nextFilingDueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                {' '}({b.filingDaysRemaining > 0 ? `${b.filingDaysRemaining}d left` : `${Math.abs(b.filingDaysRemaining)}d overdue`})
                              </strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions & Equipment Breakdown Pill */}
                      <div className="flex items-center gap-2.5 self-end md:self-auto flex-wrap">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium">
                          <span className="text-white font-bold">{b.totalEquipments} Units:</span>
                          <span className="text-emerald-400 font-semibold">{b.compliantCount} Fit</span>
                          {b.dueCount > 0 && <span className="text-amber-400 font-semibold">• {b.dueCount} Due</span>}
                          {b.overdueCount > 0 && <span className="text-red-400 font-bold">• {b.overdueCount} Overdue</span>}
                        </div>

                        <button
                          onClick={() => setBulkAddModalOpen(b)}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-amber-500/40 text-xs font-bold transition-all"
                        >
                          + Bulk Add
                        </button>

                        <button
                          onClick={() => setSingleAddEquipModalOpen(b)}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-amber-500/40 text-xs font-bold transition-all"
                        >
                          + Single Tag
                        </button>

                        <Link
                          href={`/report/${b.id}`}
                          className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 text-xs font-bold transition-all hover:scale-[1.02]"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Form-B Report</span>
                        </Link>
                      </div>
                    </div>

                    {/* Expanded Equipment Breakdown Table */}
                    {isExpanded && (
                      <div className="bg-slate-950/90 border-t border-slate-800 p-4 sm:p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                            <Layers className="w-4 h-4" />
                            <span>Equipment Registry ({b.equipments.length} Assets)</span>
                          </h3>
                        </div>

                        {b.equipments.length === 0 ? (
                          <div className="p-8 text-center text-slate-400 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
                            <p>No equipment registered for this building yet.</p>
                            <button
                              onClick={() => setBulkAddModalOpen(b)}
                              className="px-3.5 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs"
                            >
                              + Bulk Generate QR Tags
                            </button>
                          </div>
                        ) : (
                          <div className="bg-slate-900/80 rounded-xl border border-slate-800 overflow-x-auto shadow-md">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-950/90 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                                <tr>
                                  <th className="py-3 px-4">QR Tag</th>
                                  <th className="py-3 px-4">Type &amp; Spec</th>
                                  <th className="py-3 px-4">Location</th>
                                  <th className="py-3 px-4">Last Service</th>
                                  <th className="py-3 px-4">Next Due Date</th>
                                  <th className="py-3 px-4">Status</th>
                                  <th className="py-3 px-4 text-right">Action</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-800/60">
                                {b.equipments.map((eq: any) => {
                                  const diffDays = Math.ceil((new Date(eq.nextDueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                                  const status = diffDays < 0 ? 'OVERDUE' : diffDays <= 30 ? 'DUE_SOON' : 'COMPLIANT';

                                  return (
                                    <tr key={eq.id} className="hover:bg-slate-850/50 transition-colors">
                                      <td className="py-3 px-4 font-mono font-bold">
                                        <Link href={`/scan/${eq.qrCode}`} className="text-amber-400 hover:underline bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                          {eq.qrCode}
                                        </Link>
                                      </td>
                                      <td className="py-3 px-4 font-semibold text-white">
                                        {eq.capacity} ({eq.type})
                                      </td>
                                      <td className="py-3 px-4 text-slate-300">{eq.location}</td>
                                      <td className="py-3 px-4 text-slate-400">
                                        {new Date(eq.lastServiceDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                      </td>
                                      <td className="py-3 px-4 font-semibold text-slate-200">
                                        {new Date(eq.nextDueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        <span className={`block text-[10px] font-normal ${diffDays < 0 ? 'text-red-400 font-bold' : diffDays <= 30 ? 'text-amber-400 font-bold' : 'text-slate-400'}`}>
                                          {diffDays < 0 ? `${Math.abs(diffDays)}d overdue` : diffDays <= 30 ? `Due in ${diffDays}d` : `${Math.round(diffDays / 30)} mos left`}
                                        </span>
                                      </td>
                                      <td className="py-3 px-4">
                                        <span
                                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                            status === 'COMPLIANT'
                                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                              : status === 'DUE_SOON'
                                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                              : 'bg-red-500/10 text-red-400 border border-red-500/30'
                                          }`}
                                        >
                                          {status === 'COMPLIANT' ? 'Current' : status === 'DUE_SOON' ? 'Due Soon' : 'Overdue'}
                                        </span>
                                      </td>
                                      <td className="py-3 px-4 text-right">
                                        <Link
                                          href={`/scan/${eq.qrCode}`}
                                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow transition-all hover:scale-105"
                                        >
                                          <Scan className="w-3 h-3 stroke-[2.5]" />
                                          <span>Service</span>
                                        </Link>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
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
          VIEW 2: DATA MANAGER & BACKEND SETTINGS
      ========================================================================= */}
      {activeTab === 'DATA_MANAGE' && (
        <div className="tactile-card rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl p-5 sm:p-6 space-y-6">
          
          {/* Sub Navigation Bar */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 flex-wrap gap-3">
            <div className="flex items-center gap-2 overflow-x-auto">
              {[
                { id: 'COMPANY', label: 'AMC Company Profile', icon: Settings },
                { id: 'CLIENTS', label: `Clients & Societies (${clientsList.length})`, icon: UserCheck },
                { id: 'BUILDINGS', label: `Buildings (${buildings.length})`, icon: Building2 },
                { id: 'EQUIPMENT', label: `Equipment Registry (${equipmentsList.length})`, icon: Layers },
                { id: 'RESET', label: 'Wipe & Reset Tools', icon: Trash2 },
              ].map((sub) => {
                const Icon = sub.icon;
                const active = dataSubTab === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setDataSubTab(sub.id as any)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      active
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{sub.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={fetchData}
              className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* SUB-PANEL 1: AMC COMPANY PROFILE SETTINGS */}
          {dataSubTab === 'COMPANY' && (
            <div className="space-y-4 max-w-2xl">
              <div>
                <h3 className="text-base font-bold text-white">AMC Company Profile</h3>
                <p className="text-xs text-slate-400">
                  Update your official company details. These details automatically brand all Form-B Compliance PDFs, Technician sticker sheets, and audit reports.
                </p>
              </div>

              <form onSubmit={handleSaveCompany} className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Company / Business Name *</label>
                  <input
                    type="text"
                    required
                    value={companyForm.name}
                    onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                    placeholder="e.g. National Fire Safety & AMC Services"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Govt. Fire License Number *</label>
                    <input
                      type="text"
                      required
                      value={companyForm.licenseNumber}
                      onChange={(e) => setCompanyForm({ ...companyForm, licenseNumber: e.target.value })}
                      placeholder="e.g. MH/FIRE/LIC/2024/098"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Emergency Dispatch Phone *</label>
                    <input
                      type="text"
                      required
                      value={companyForm.phone}
                      onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                      placeholder="e.g. +91 98200 11223"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Official Service Email *</label>
                  <input
                    type="email"
                    required
                    value={companyForm.email}
                    onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                    placeholder="e.g. service@nationalfireamc.in"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Registered Service Office Address *</label>
                  <textarea
                    rows={2}
                    required
                    value={companyForm.address}
                    onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                    placeholder="e.g. Plot 18, Commercial Zone, Navi Mumbai, Maharashtra - 400708"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02]"
                  >
                    Save Company Profile
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* SUB-PANEL 2: CLIENTS & SOCIETIES */}
          {dataSubTab === 'CLIENTS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="text-base font-bold text-white">Client Societies &amp; Corporate Accounts</h3>
                  <p className="text-xs text-slate-400">Manage real customer societies, contact persons, and building links.</p>
                </div>
                <button
                  onClick={() => setAddBuildingModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Add New Client</span>
                </button>
              </div>

              <div className="bg-slate-950/80 rounded-xl border border-slate-800 overflow-x-auto shadow">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Client / Society Name</th>
                      <th className="py-3 px-4">Contact Person</th>
                      <th className="py-3 px-4">Phone</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Buildings</th>
                      <th className="py-3 px-4">Total Assets</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {clientsList.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-850/40">
                        <td className="py-3 px-4 font-bold text-white">{c.name}</td>
                        <td className="py-3 px-4 text-slate-300">{c.contactPerson}</td>
                        <td className="py-3 px-4 text-amber-400 font-mono">{c.phone}</td>
                        <td className="py-3 px-4 text-slate-400">{c.email || '—'}</td>
                        <td className="py-3 px-4 font-bold text-white">{c.buildingCount}</td>
                        <td className="py-3 px-4 text-slate-300">{c.totalEquipments} units</td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => setEditClientModal(c)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                            title="Edit Client"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClient(c.id, c.name)}
                            className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-500/30"
                            title="Delete Client"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUB-PANEL 3: BUILDINGS & SITES */}
          {dataSubTab === 'BUILDINGS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="text-base font-bold text-white">Buildings &amp; Properties</h3>
                  <p className="text-xs text-slate-400">Configured premises under fire compliance contracts.</p>
                </div>
                <button
                  onClick={() => setAddBuildingModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Add Building</span>
                </button>
              </div>

              <div className="bg-slate-950/80 rounded-xl border border-slate-800 overflow-x-auto shadow">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Building Name</th>
                      <th className="py-3 px-4">Society / Client</th>
                      <th className="py-3 px-4">Address</th>
                      <th className="py-3 px-4">Compliance Cycle</th>
                      <th className="py-3 px-4">Next Filing Due</th>
                      <th className="py-3 px-4">Assets</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {buildings.map((b: any) => (
                      <tr key={b.id} className="hover:bg-slate-850/40">
                        <td className="py-3 px-4 font-bold text-white">{b.name}</td>
                        <td className="py-3 px-4 text-slate-300">{b.client?.name}</td>
                        <td className="py-3 px-4 text-slate-400 max-w-xs truncate">{b.address}</td>
                        <td className="py-3 px-4 font-mono text-[11px] text-amber-300">{b.complianceCycle}</td>
                        <td className="py-3 px-4 font-semibold text-slate-200">
                          {new Date(b.nextFilingDueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="py-3 px-4 font-bold text-white">{b.totalEquipments} units</td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => setEditBuildingModal(b)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                            title="Edit Building"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteBuilding(b.id, b.name)}
                            className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-500/30"
                            title="Delete Building"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUB-PANEL 4: EQUIPMENT REGISTRY */}
          {dataSubTab === 'EQUIPMENT' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white">Equipment QR Inventory</h3>
                  <p className="text-xs text-slate-400">Search and manage individual fire extinguishers, hydrants, and valves.</p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Building Filter */}
                  <select
                    value={equipFilterBuilding}
                    onChange={(e) => setEquipFilterBuilding(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="ALL">All Buildings</option>
                    {buildings.map((b: any) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>

                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search QR or location..."
                      value={equipSearch}
                      onChange={(e) => setEquipSearch(e.target.value)}
                      className="bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/80 rounded-xl border border-slate-800 overflow-x-auto shadow">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">QR Code Tag</th>
                      <th className="py-3 px-4">Building</th>
                      <th className="py-3 px-4">Type &amp; Capacity</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Next Due</th>
                      <th className="py-3 px-4">Live Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {equipmentsList.map((eq) => (
                      <tr key={eq.id} className="hover:bg-slate-850/40">
                        <td className="py-3 px-4 font-mono font-bold">
                          <Link href={`/scan/${eq.qrCode}`} className="text-amber-400 hover:underline bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            {eq.qrCode}
                          </Link>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-300">{eq.building?.name}</td>
                        <td className="py-3 px-4 text-white font-semibold">{eq.capacity} ({eq.type})</td>
                        <td className="py-3 px-4 text-slate-400">{eq.location}</td>
                        <td className="py-3 px-4 font-semibold text-slate-200">
                          {new Date(eq.nextDueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              eq.liveStatus === 'COMPLIANT'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : eq.liveStatus === 'DUE_SOON'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                : 'bg-red-500/10 text-red-400 border border-red-500/30'
                            }`}
                          >
                            {eq.liveStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => setEditEquipmentModal(eq)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                            title="Edit Equipment"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteEquipment(eq.id, eq.qrCode)}
                            className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-500/30"
                            title="Delete Equipment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUB-PANEL 5: WIPE ALL DEMO DATA & RESET */}
          {dataSubTab === 'RESET' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="text-base font-bold text-white">Database Reset &amp; Demo Data Removal</h3>
                <p className="text-xs text-slate-400">
                  Safely remove demo entities, wipe sample buildings, or restore clean starter templates.
                </p>
              </div>

              {/* Danger Zone: Wipe All Demo Data */}
              <div className="p-5 rounded-2xl bg-red-950/20 border-2 border-red-500/40 space-y-3">
                <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <span>Wipe All Demo Companies &amp; Data</span>
                </div>
                <p className="text-xs text-slate-300">
                  This permanently removes all existing demo client societies, demo buildings, demo equipment records, and test service logs. Your database will be completely empty and 100% clean so you can register your actual real-world AMC contracts.
                </p>
                <div className="pt-1">
                  <button
                    onClick={handleWipeAllDemo}
                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-md transition-all hover:scale-[1.02]"
                  >
                    Confirm: Wipe All Demo Records
                  </button>
                </div>
              </div>

              {/* Template Starter: Seed Clean Unbranded Data */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span>Load Clean Starter Template (No Brand Names)</span>
                </div>
                <p className="text-xs text-slate-400">
                  Seeds a clean, unbranded reference structure with generic facilities (Horizon Tech IT Tower &amp; Emerald Heights Society) to test QR code scanning, inspection logs, and Maharashtra Form-B PDF generation.
                </p>
                <div className="pt-1">
                  <button
                    onClick={handleSeedCleanData}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/40 font-bold text-xs transition-colors"
                  >
                    Load Clean Template Data
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* =========================================================================
          MODAL 1: ADD CLIENT & BUILDING
      ========================================================================= */}
      {addBuildingModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d1424] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-700/80 tactile-card max-h-[90vh] overflow-y-auto text-white">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">Register Client &amp; Building</h3>
              </div>
              <button
                onClick={() => setAddBuildingModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBuilding} className="space-y-4 text-xs">
              <div className="p-3.5 bg-slate-950/80 rounded-xl space-y-2.5 border border-slate-800">
                <h4 className="font-bold text-amber-400 uppercase text-[10px] tracking-wider">Client &amp; Society Details</h4>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Client / Society Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Horizon Co-op Housing Society"
                    value={buildingForm.clientName}
                    onChange={(e) => setBuildingForm({ ...buildingForm, clientName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Contact Person</label>
                    <input
                      type="text"
                      placeholder="Secretary / Facility Manager"
                      value={buildingForm.contactPerson}
                      onChange={(e) => setBuildingForm({ ...buildingForm, contactPerson: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Phone Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="+91 98XXX XXXXX"
                      value={buildingForm.phone}
                      onChange={(e) => setBuildingForm({ ...buildingForm, phone: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-950/80 rounded-xl space-y-2.5 border border-slate-800">
                <h4 className="font-bold text-amber-400 uppercase text-[10px] tracking-wider">Building &amp; Compliance Cycle</h4>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Building / Tower Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Horizon Heights Tower C"
                    value={buildingForm.buildingName}
                    onChange={(e) => setBuildingForm({ ...buildingForm, buildingName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Premises Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="Street, Area, City, Pin Code"
                    value={buildingForm.address}
                    onChange={(e) => setBuildingForm({ ...buildingForm, address: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Statutory Compliance Cycle</label>
                  <select
                    value={buildingForm.complianceCycle}
                    onChange={(e) => setBuildingForm({ ...buildingForm, complianceCycle: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Maharashtra Form-B (Half-Yearly)">Maharashtra Form-B (Half-Yearly · Jan &amp; Jul)</option>
                    <option value="Delhi Fire NOC Rule 33 (Annual)">Delhi Fire NOC Rule 33 (Annual)</option>
                    <option value="Karnataka Fire Safety Form-2 (Annual)">Karnataka Fire Safety Form-2 (Annual)</option>
                    <option value="National Building Code Part 4 (Annual)">National Building Code Part 4 (Annual)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddBuildingModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-md hover:scale-[1.02]"
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d1424] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-700/80 tactile-card max-h-[90vh] overflow-y-auto text-white">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-base">Bulk Add Equipment</h3>
                <p className="text-xs text-amber-400 font-semibold mt-0.5">{bulkAddModalOpen.name}</p>
              </div>
              <button
                onClick={() => setBulkAddModalOpen(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBulkAddEquipment} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Equipment Type</label>
                  <select
                    value={equipmentForm.type}
                    onChange={(e) => setEquipmentForm({ ...equipmentForm, type: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-amber-500 focus:outline-none"
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
                  <label className="block text-slate-300 font-semibold mb-1">Capacity / Specification</label>
                  <input
                    type="text"
                    value={equipmentForm.capacity}
                    onChange={(e) => setEquipmentForm({ ...equipmentForm, capacity: e.target.value })}
                    placeholder="e.g. ABC Dry Powder 6kg"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">QR Code Prefix</label>
                  <input
                    type="text"
                    value={equipmentForm.prefix}
                    onChange={(e) => setEquipmentForm({ ...equipmentForm, prefix: e.target.value.toUpperCase() })}
                    placeholder="e.g. EXT or TWR"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono uppercase focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Quantity to Auto-Generate</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={equipmentForm.count}
                    onChange={(e) => setEquipmentForm({ ...equipmentForm, count: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Location Pattern</label>
                <input
                  type="text"
                  value={equipmentForm.locationBase}
                  onChange={(e) => setEquipmentForm({ ...equipmentForm, locationBase: e.target.value })}
                  placeholder="e.g. Floor Landing Lift Lobby"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Refill / Service Interval</label>
                <select
                  value={equipmentForm.serviceIntervalMonths}
                  onChange={(e) => setEquipmentForm({ ...equipmentForm, serviceIntervalMonths: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-amber-500 focus:outline-none"
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
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-md hover:scale-[1.02]"
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d1424] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-700/80 tactile-card text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-base">Add Single Equipment Tag</h3>
                <p className="text-xs text-amber-400 font-semibold mt-0.5">{singleAddEquipModalOpen.name}</p>
              </div>
              <button onClick={() => setSingleAddEquipModalOpen(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSingleAddEquipment} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Custom QR Code ID *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HTP-EXT-05"
                  value={singleEquipForm.qrCode}
                  onChange={(e) => setSingleEquipForm({ ...singleEquipForm, qrCode: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono uppercase focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Equipment Type</label>
                <select
                  value={singleEquipForm.type}
                  onChange={(e) => setSingleEquipForm({ ...singleEquipForm, type: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-amber-500"
                >
                  <option value="Fire Extinguisher">Fire Extinguisher</option>
                  <option value="Hydrant Valve">Hydrant Valve</option>
                  <option value="Hose Reel">Hose Reel</option>
                  <option value="Alarm Panel">Alarm Panel</option>
                  <option value="Smoke Detector">Smoke Detector</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Capacity / Specification</label>
                <input
                  type="text"
                  required
                  value={singleEquipForm.capacity}
                  onChange={(e) => setSingleEquipForm({ ...singleEquipForm, capacity: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Specific Location in Building *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Basement 1 - Electric Meter Room"
                  value={singleEquipForm.location}
                  onChange={(e) => setSingleEquipForm({ ...singleEquipForm, location: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSingleAddEquipModalOpen(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-md"
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d1424] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-700 text-white text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Edit Client</h3>
              <button onClick={() => setEditClientModal(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleUpdateClient} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Client Name *</label>
                <input
                  type="text"
                  required
                  value={editClientModal.name}
                  onChange={(e) => setEditClientModal({ ...editClientModal, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Contact Person</label>
                <input
                  type="text"
                  value={editClientModal.contactPerson}
                  onChange={(e) => setEditClientModal({ ...editClientModal, contactPerson: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={editClientModal.phone}
                  onChange={(e) => setEditClientModal({ ...editClientModal, phone: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Email Address</label>
                <input
                  type="email"
                  value={editClientModal.email || ''}
                  onChange={(e) => setEditClientModal({ ...editClientModal, email: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditClientModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-black"
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d1424] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-700 text-white text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Edit Building</h3>
              <button onClick={() => setEditBuildingModal(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleUpdateBuilding} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Building Name *</label>
                <input
                  type="text"
                  required
                  value={editBuildingModal.name}
                  onChange={(e) => setEditBuildingModal({ ...editBuildingModal, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Premises Address *</label>
                <input
                  type="text"
                  required
                  value={editBuildingModal.address}
                  onChange={(e) => setEditBuildingModal({ ...editBuildingModal, address: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Compliance Cycle</label>
                <select
                  value={editBuildingModal.complianceCycle}
                  onChange={(e) => setEditBuildingModal({ ...editBuildingModal, complianceCycle: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
                >
                  <option value="Maharashtra Form-B (Half-Yearly)">Maharashtra Form-B (Half-Yearly)</option>
                  <option value="Delhi Fire NOC Rule 33 (Annual)">Delhi Fire NOC Rule 33 (Annual)</option>
                  <option value="Karnataka Fire Safety Form-2 (Annual)">Karnataka Fire Safety Form-2 (Annual)</option>
                  <option value="National Building Code Part 4 (Annual)">National Building Code Part 4 (Annual)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditBuildingModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-black"
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d1424] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-700 text-white text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Edit Equipment Asset</h3>
              <button onClick={() => setEditEquipmentModal(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleUpdateEquipment} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">QR Code Tag *</label>
                <input
                  type="text"
                  required
                  value={editEquipmentModal.qrCode}
                  onChange={(e) => setEditEquipmentModal({ ...editEquipmentModal, qrCode: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono uppercase"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Capacity / Specification *</label>
                <input
                  type="text"
                  required
                  value={editEquipmentModal.capacity}
                  onChange={(e) => setEditEquipmentModal({ ...editEquipmentModal, capacity: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Location Details *</label>
                <input
                  type="text"
                  required
                  value={editEquipmentModal.location}
                  onChange={(e) => setEditEquipmentModal({ ...editEquipmentModal, location: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Refill / Service Interval (Months)</label>
                <input
                  type="number"
                  value={editEquipmentModal.serviceIntervalMonths}
                  onChange={(e) => setEditEquipmentModal({ ...editEquipmentModal, serviceIntervalMonths: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditEquipmentModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-black"
                >
                  Save Equipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
