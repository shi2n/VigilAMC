'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  Trash2,
  Edit,
  Eye,
  Phone,
  Mail,
  ShieldCheck,
  UserCheck,
  UserX,
  X,
  Check,
  Sparkles,
  Copy,
  MessageCircle,
  Smartphone,
} from 'lucide-react';
import { SeatCounter, SeatUsage } from './SeatCounter';
import { AdminDictionary, adminDictEnglish } from '@/lib/i18n/admin';

interface TechnicianManagementProps {
  onNavigateToSubscription?: () => void;
  showToast: (msg: string) => void;
  onOpenImport?: () => void;
  initialTechnicians?: any[];
  initialBuildings?: any[];
  initialSeatUsage?: SeatUsage;
  initialPlan?: any;
  agencyName?: string;
  onRefreshDashboard?: () => Promise<void> | void;
  t?: AdminDictionary;
}


function slugify(text: string): string {
  return (text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function computeSystematicTechId(companyName: string, techName: string, existingList: any[] = []): string {
  const compSlug = slugify(companyName || 'agency') || 'tech';
  const nameSlug = slugify(techName || 'member') || 'user';
  const base = `${compSlug}-${nameSlug}`;
  
  const existingSlugs = new Set(
    existingList.map((t) => (t.employeeId || '').toLowerCase().trim())
  );
  if (!existingSlugs.has(base)) return base;
  let counter = 2;
  while (existingSlugs.has(`${base}-${counter}`)) {
    counter++;
  }
  return `${base}-${counter}`;
}

function normalizeWhatsAppPhone(rawPhone: string): string {
  const digits = (rawPhone || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith('0')) return `91${digits.slice(1)}`;
  return digits;
}

export function TechnicianManagement({
  showToast,
  onOpenImport,
  initialTechnicians,
  initialBuildings,
  initialSeatUsage,
  initialPlan,
  agencyName = 'Fire Safety AMC Agency',
  onRefreshDashboard,
  t = adminDictEnglish,
}: TechnicianManagementProps) {
  const [technicians, setTechnicians] = useState<any[]>(initialTechnicians || []);
  const [buildings, setBuildings] = useState<any[]>(initialBuildings || []);
  const [seatUsage, setSeatUsage] = useState<SeatUsage | undefined>(initialSeatUsage);
  const [plan, setPlan] = useState<any>(initialPlan || null);
  const [loading, setLoading] = useState(false);

  // Account Deletion Requests (DPDP Right-to-Erasure)
  const [deletionRequests, setDeletionRequests] = useState<any[]>([]);
  const [deletionLoading, setDeletionLoading] = useState(false);
  const [confirmApproveModal, setConfirmApproveModal] = useState<any | null>(null);
  const [approveSubmitting, setApproveSubmitting] = useState(false);

  const loadDeletionRequests = async () => {
    try {
      setDeletionLoading(true);
      const res = await fetch('/api/admin/deletion-requests');
      if (res.ok) {
        const data = await res.json();
        setDeletionRequests(data.requests || []);
      }
    } catch (e) {
      // ignore
    } finally {
      setDeletionLoading(false);
    }
  };

  useEffect(() => {
    loadDeletionRequests();
  }, []);

  const handleApproveDeletion = async (request: any) => {
    setApproveSubmitting(true);
    try {
      const res = await fetch(`/api/admin/deletion-requests/${request.id}/approve`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to approve account deletion');
        return;
      }
      showToast(t.deletionApprovedSuccess || 'Staff account successfully anonymized');
      setConfirmApproveModal(null);
      await loadDeletionRequests();
      // Update local technician status
      setTechnicians((prev) =>
        prev.map((tech) =>
          tech.id === request.userProfileId
            ? { ...tech, fullName: 'Deleted user', status: 'INACTIVE', phone: '-', email: 'deleted@anonymized.vigilamc.app', hasPendingDeletion: false }
            : tech
        )
      );
      if (onRefreshDashboard) {
        await onRefreshDashboard();
      }
    } catch (err: any) {
      showToast(err.message || 'Error processing deletion approval');
    } finally {
      setApproveSubmitting(false);
    }
  };

  // Store recently created or reset PINs in localStorage so WhatsApp & Copy buttons always know the PIN
  const [pinMap, setPinMap] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const savedPins = localStorage.getItem('vigilamc_tech_pins');
      if (savedPins) setPinMap(JSON.parse(savedPins));
    } catch {
      // Ignore storage error
    }
  }, []);

  const saveTechPin = (techId: string, pin: string) => {
    setPinMap((prev) => {
      const next = { ...prev, [techId]: pin };
      try {
        localStorage.setItem('vigilamc_tech_pins', JSON.stringify(next));
      } catch {
        // Ignore storage error
      }
      return next;
    });
  };

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalTech, setEditModalTech] = useState<any | null>(null);
  const [resetPasswordTech, setResetPasswordTech] = useState<any | null>(null);
  const [viewDetailTech, setViewDetailTech] = useState<any | null>(null);
  const [deleteConfirmTech, setDeleteConfirmTech] = useState<any | null>(null);
  const [createdSuccessTech, setCreatedSuccessTech] = useState<any | null>(null);
  const [selectedTechIds, setSelectedTechIds] = useState<string[]>([]);
  const [statusConfirmTech, setStatusConfirmTech] = useState<{ tech: any; nextStatus: 'ACTIVE' | 'INACTIVE'; isBulk?: boolean } | null>(null);
  const [activityDrawerTech, setActivityDrawerTech] = useState<any | null>(null);
  const [activityMetrics, setActivityMetrics] = useState<any | null>(null);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityDateRange, setActivityDateRange] = useState({ startDate: '', endDate: '' });

  // Add Form State
  const [addForm, setAddForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    employeeId: '',
    password: '',
    assignedBuildingIds: [] as string[],
    status: 'ACTIVE',
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Edit Form State
  const [editForm, setEditForm] = useState({
    fullName: '',
    phone: '',
    employeeId: '',
    status: 'ACTIVE',
    assignedBuildingIds: [] as string[],
  });

  // Password Reset State
  const [newPassword, setNewPassword] = useState('');
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  // Keep in sync with parent bootstrap cache
  useEffect(() => {
    if (Array.isArray(initialTechnicians)) setTechnicians(initialTechnicians);
  }, [initialTechnicians]);

  useEffect(() => {
    if (Array.isArray(initialBuildings)) setBuildings(initialBuildings);
  }, [initialBuildings]);

  useEffect(() => {
    if (initialSeatUsage) setSeatUsage(initialSeatUsage);
  }, [initialSeatUsage]);

  useEffect(() => {
    if (initialPlan) setPlan(initialPlan);
  }, [initialPlan]);

  const computeNextTechId = () => {
    let maxNum = 100;
    for (const t of technicians) {
      const match = String(t.employeeId || '').match(/(\d+)/);
      if (match) {
        const n = parseInt(match[1], 10);
        if (!isNaN(n) && n >= 100 && n < 99999 && n > maxNum) {
          maxNum = n;
        }
      }
    }
    return `TECH-${maxNum + 1}`;
  };

  const generateSixDigitPin = () => {
    return String(Math.floor(100000 + Math.random() * 900000));
  };

  const handleOpenAddModal = () => {
    setFormError(null);
    setAddForm({
      fullName: '',
      email: '',
      phone: '',
      employeeId: computeSystematicTechId(agencyName, '', technicians),
      password: generateSixDigitPin(),
      assignedBuildingIds: [],
      status: 'ACTIVE',
    });
    setAddModalOpen(true);
  };

  const handleGeneratePinAndId = () => {
    const pin = generateSixDigitPin();
    const empId = addForm.employeeId.trim() || computeSystematicTechId(agencyName, addForm.fullName, technicians);
    setAddForm((prev) => ({
      ...prev,
      password: pin,
      employeeId: empId,
    }));
  };

  const buildCredentialsText = (tech: any, customPin?: string) => {
    const appUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}/technician`
        : 'https://vigilamc.vercel.app/technician';
    const pin = customPin || tech.tempPassword || pinMap[tech.id] || '(Use your assigned 6-digit PIN)';
    const cleanMobile = tech.phone && tech.phone !== '—' ? tech.phone : '—';
    const staffId = tech.employeeId && tech.employeeId !== '—' ? tech.employeeId : '—';

    return [
      `🔥 *${agencyName} — Field Technician App Login*`,
      ``,
      `Namaste *${tech.fullName}*, your VigilAMC Field App account is active!`,
      ``,
      `📲 *1. Open & Install Mobile App:*`,
      `${appUrl}`,
      ``,
      `🔑 *2. Your Login Details:*`,
      `• *Mobile Number:* ${cleanMobile}`,
      `• *Technician ID (Username):* ${staffId}`,
      `• *Login PIN / Password:* ${pin}`,
      ``,
      `📍 Tap the link above on your phone, tap *"Install App"*, and sign in with your Mobile Number or Staff ID + PIN.`,
    ].join('\n');
  };

  const handleSendWhatsAppCredentials = (tech: any, customPin?: string) => {
    const message = buildCredentialsText(tech, customPin);
    const cleanPhone = normalizeWhatsAppPhone(tech.phone !== '—' ? tech.phone : '');
    const waUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    showToast(`Opening WhatsApp with login details for ${tech.fullName}...`);
  };

  const handleCopyCredentials = async (tech: any, customPin?: string) => {
    const text = buildCredentialsText(tech, customPin);
    try {
      await navigator.clipboard.writeText(text);
      showToast(`Login credentials copied for ${tech.fullName}!`);
    } catch {
      showToast('Could not copy automatically.');
    }
  };

  const fetchTechnicians = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/technicians');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch technicians');

      setTechnicians(json.technicians || []);
      setSeatUsage(json.seatUsage);
      setPlan(json.plan);
      setBuildings(json.buildings || []);
      if (onRefreshDashboard) onRefreshDashboard();
    } catch (err: any) {
      console.error('Error loading technicians:', err);
      showToast(err.message || 'Error loading technicians');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialTechnicians) {
      fetchTechnicians();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle Add Technician
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSubmitting(true);

    try {
      const res = await fetch('/api/admin/technicians', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      });

      const json = await res.json();

      if (!res.ok) {
        if (json.code === 'PLAN_LIMIT_EXCEEDED') {
          setFormError(json.error);
          return;
        }
        throw new Error(json.error || 'Failed to create technician account');
      }

      if (json.technician?.id && addForm.password) {
        saveTechPin(json.technician.id, addForm.password);
      }

      setAddModalOpen(false);
      setCreatedSuccessTech({
        ...json.technician,
        tempPassword: addForm.password,
      });

      if (json.technician) {
        setTechnicians((prev) => [json.technician, ...prev.filter((t: any) => t.id !== json.technician.id)]);
      }
      if (json.seatUsage) {
        setSeatUsage(json.seatUsage);
      }

      setAddForm({
        fullName: '',
        email: '',
        phone: '',
        employeeId: '',
        password: '',
        assignedBuildingIds: [],
        status: 'ACTIVE',
      });

      showToast(`Technician account created for ${json.technician.fullName}`);
      fetchTechnicians();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (tech: any) => {
    setEditModalTech(tech);
    setEditForm({
      fullName: tech.fullName || '',
      phone: tech.phone === '—' ? '' : tech.phone || '',
      employeeId: tech.employeeId === '—' ? '' : tech.employeeId || '',
      status: tech.status || 'ACTIVE',
      assignedBuildingIds: (tech.assignedBuildings || []).map((b: any) => b.id),
    });
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalTech) return;
    setFormSubmitting(true);
    setFormError(null);

    try {
      const res = await fetch(`/api/admin/technicians/${editModalTech.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update technician');

      setEditModalTech(null);
      showToast(`Updated technician details for ${editForm.fullName}`);
      fetchTechnicians();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Toggle Active / Inactive Status
  const handleToggleStatus = async (tech: any) => {
    const nextStatus = tech.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await fetch(`/api/admin/technicians/${tech.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      const json = await res.json();
      if (!res.ok) {
        showToast(json.error || `Unable to change status to ${nextStatus}`);
        return;
      }

      showToast(
        nextStatus === 'ACTIVE'
          ? `Technician ${tech.fullName} activated.`
          : `Technician ${tech.fullName} blocked / deactivated. Seat is now free.`
      );
      fetchTechnicians();
    } catch (err: any) {
      showToast(err.message || 'Failed to update status');
    }
  };

  // Handle Password Reset
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPasswordTech) return;
    setResetSubmitting(true);
    setResetError(null);

    try {
      const res = await fetch(`/api/admin/technicians/${resetPasswordTech.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to reset password');

      saveTechPin(resetPasswordTech.id, newPassword);
      setResetPasswordTech(null);
      setNewPassword('');
      showToast(`PIN / Password updated for ${resetPasswordTech.fullName}`);
    } catch (err: any) {
      setResetError(err.message);
    } finally {
      setResetSubmitting(false);
    }
  };

  // Handle Delete / Safe Archive
  const handleDeleteTechnician = async () => {
    if (!deleteConfirmTech) return;
    try {
      const res = await fetch(`/api/admin/technicians/${deleteConfirmTech.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to remove technician');

      setDeleteConfirmTech(null);
      showToast(json.message || 'Technician account removed.');
      fetchTechnicians();
    } catch (err: any) {
      showToast(err.message || 'Failed to remove technician');
    }
  };

  // Open View Details
  const handleOpenDetails = async (tech: any) => {
    setViewDetailTech(tech);
    try {
      const res = await fetch(`/api/admin/technicians/${tech.id}`);
      const json = await res.json();
      if (res.ok && json.technician) {
        setViewDetailTech(json.technician);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Filtered List
  const filteredTechnicians = technicians.filter((tech) => {
    const matchesSearch =
      tech.fullName.toLowerCase().includes(search.toLowerCase()) ||
      tech.email.toLowerCase().includes(search.toLowerCase()) ||
      tech.phone.includes(search) ||
      tech.employeeId.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || tech.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const isInternalTechEmail = (emailStr?: string) =>
    Boolean(emailStr && emailStr.endsWith('@tech.vigilamc.app'));

  return (
    <div className="space-y-6">
      {/* 1. Seat Counter Bar */}
      <SeatCounter usage={seatUsage} />

      {/* 2. Action & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass-panel-dense p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2.5 flex-1 flex-wrap">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, mobile number, Staff ID..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-[#FED7AA] rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#C2410C] shadow-sm"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                statusFilter === 'ALL'
                  ? 'bg-[#C2410C] text-white shadow-sm '
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({technicians.length})
            </button>
            <button
              onClick={() => setStatusFilter('ACTIVE')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                statusFilter === 'ACTIVE'
                  ? 'bg-emerald-600 text-white shadow-sm '
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active ({technicians.filter((t) => t.status === 'ACTIVE').length})
            </button>
            <button
              onClick={() => setStatusFilter('INACTIVE')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                statusFilter === 'INACTIVE'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Blocked ({technicians.filter((t) => t.status === 'INACTIVE').length})
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {onOpenImport && (
            <button
              onClick={onOpenImport}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#C2410C] bg-[#FFF0E6] hover:bg-[#FED7AA] border border-[#C2410C]/30 transition-all"
              title="Import Technicians from Excel (.xlsx)"
            >
              <span>Import Technicians</span>
            </button>
          )}

          <button
            onClick={fetchTechnicians}
            className="p-2 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#C2410C]' : ''}`} />
          </button>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#C2410C] to-[#1C1917] hover:from-[#C2410C] hover:to-[#9A3412] shadow-md transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Field Technician</span>
          </button>
        </div>
      </div>

      {/* Bulk Action Bar (§8.1) */}
      {selectedTechIds.length > 0 && (
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FFF0E6] border border-[#FED7AA] text-xs font-bold text-[#1C1917] shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EA580C] animate-pulse" />
            <span>{selectedTechIds.length} technician(s) selected</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStatusConfirmTech({ tech: null, nextStatus: 'ACTIVE', isBulk: true })}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-all"
            >
              Set Active
            </button>
            <button
              type="button"
              onClick={() => setStatusConfirmTech({ tech: null, nextStatus: 'INACTIVE', isBulk: true })}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-xs transition-all"
            >
              Set Blocked
            </button>
            <button
              type="button"
              onClick={() => setSelectedTechIds([])}
              className="px-2.5 py-1.5 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* DPDP Account Deletion Requests Panel */}
      {deletionRequests.filter((r) => r.status === 'PENDING').length > 0 && (
        <div className="bg-rose-50/60 border-2 border-rose-200 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-100 text-[#DC2626] flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-black text-sm text-slate-900 flex items-center gap-2">
                  <span>{t.deletionRequestsPanelTitle || 'Account Deletion Requests'}</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#DC2626] text-white text-[10px] font-bold">
                    {deletionRequests.filter((r) => r.status === 'PENDING').length}
                  </span>
                </h3>
                <p className="text-xs text-slate-600">
                  {t.deletionRequestsPanelSubtitle || 'Field staff deletion requests under DPDP Act 2023 (7-day compliance window)'}
                </p>
              </div>
            </div>
            <button
              onClick={loadDeletionRequests}
              className="text-xs text-rose-700 hover:text-rose-900 font-semibold underline"
            >
              Refresh
            </button>
          </div>

          <div className="overflow-x-auto bg-white rounded-xl border border-rose-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-rose-100 bg-rose-50/40 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3.5">{t.deletionColStaff || 'Staff Member'}</th>
                  <th className="py-2.5 px-3.5">Mobile / Staff ID</th>
                  <th className="py-2.5 px-3.5">{t.deletionColRequested || 'Requested On'}</th>
                  <th className="py-2.5 px-3.5">{t.deletionColRecords || 'Statutory Records'}</th>
                  <th className="py-2.5 px-3.5 text-right">{t.deletionColActions || 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-100 text-slate-700">
                {deletionRequests
                  .filter((r) => r.status === 'PENDING')
                  .map((req) => (
                    <tr key={req.id} className="hover:bg-rose-50/50 transition-colors">
                      <td className="py-3 px-3.5 font-bold text-slate-900">
                        {req.staffName}
                      </td>
                      <td className="py-3 px-3.5 font-mono text-[11px]">
                        {req.phone !== '-' ? req.phone : req.employeeId}
                      </td>
                      <td className="py-3 px-3.5 text-slate-500 text-[11px]">
                        {new Date(req.requestedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">
                          {req.inspectionCount} inspections (preserved)
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => setConfirmApproveModal(req)}
                          className="px-3 py-1.5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold shadow-xs transition-all active:scale-95"
                        >
                          {t.btnApproveDeletion || 'Approve & Anonymize'}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Technicians Table */}
      <div className="bg-white border border-[#FED7AA] rounded-2xl overflow-hidden shadow-sm">
        {loading && technicians.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-[#C2410C] mx-auto" />
            <p className="text-sm font-semibold">Loading technician records...</p>
          </div>
        ) : filteredTechnicians.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">No Technicians Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {search || statusFilter !== 'ALL'
                  ? 'No technicians match your search filters.'
                  : 'Create your first field technician account with a 10-digit Mobile Number & 6-digit PIN and share it in 1 click on WhatsApp.'}
              </p>
            </div>
            {!search && statusFilter === 'ALL' && (
              <button
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#C2410C] to-[#1C1917] hover:from-[#C2410C] hover:to-[#9A3412] transition-all shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Add Your First Technician</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#FED7AA] bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                  <th className="py-3.5 px-4">Technician &amp; Staff ID</th>
                  <th className="py-3.5 px-4">Mobile / Login ID</th>
                  <th className="py-3.5 px-4">Access Status</th>
                  <th className="py-3.5 px-4">Assigned Buildings</th>
                  <th className="py-3.5 px-4">Completed</th>
                  <th className="py-3.5 px-4 text-right">WhatsApp Onboarding &amp; Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredTechnicians.map((tech) => (
                  <tr
                    key={tech.id}
                    className="hover:bg-[#FFF0E6]/80 transition-colors group"
                  >
                    {/* Name & ID */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C2410C]/20 to-[#1C1917]/30 text-[#C2410C] border border-[#C2410C]/30 flex items-center justify-center font-bold text-xs shrink-0">
                          {tech.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="font-bold text-slate-900 group-hover:text-[#C2410C] transition-colors">
                              {tech.fullName}
                            </div>
                            {tech.hasPendingDeletion && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                <AlertTriangle className="w-3 h-3 text-rose-600" />
                                {t.deletionRequestedBadge || 'Deletion requested'}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="px-1.5 py-0.5 rounded bg-[#FFF0E6] text-[#1C1917] border border-[#FED7AA] font-mono text-[10px] font-bold">
                              {tech.employeeId !== '—' ? tech.employeeId : 'TECH'}
                            </span>
                            {pinMap[tech.id] && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-mono text-[10px] font-bold">
                                PIN: {pinMap[tech.id]}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Mobile / Login ID */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <div className="text-slate-900 font-bold flex items-center gap-1">
                          <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>{tech.phone !== '—' ? tech.phone : 'No Mobile Set'}</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {isInternalTechEmail(tech.email)
                            ? 'Logs in via Mobile / Staff ID'
                            : tech.email}
                        </div>
                      </div>
                    </td>

                    {/* Status & Instant Active / Block Toggle */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(tech)}
                        title={
                          tech.status === 'ACTIVE'
                            ? 'Click to Block / Revoke Access'
                            : 'Click to Activate Staff Account'
                        }
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                          tech.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                            : 'bg-rose-100 text-rose-800 border-rose-300 hover:bg-rose-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            tech.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                          }`}
                        />
                        <span>{tech.status === 'ACTIVE' ? 'Active (Tap to Block)' : 'Blocked (Tap to Unblock)'}</span>
                      </button>
                    </td>

                    {/* Assigned Buildings */}
                    <td className="py-3.5 px-4">
                      {tech.assignedBuildings?.length > 0 ? (
                        <div className="flex items-center gap-1 flex-wrap max-w-xs">
                          {tech.assignedBuildings.slice(0, 2).map((b: any) => (
                            <span
                              key={b.id}
                              className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium truncate max-w-[120px]"
                              title={b.name}
                            >
                              {b.name}
                            </span>
                          ))}
                          {tech.assignedBuildings.length > 2 && (
                            <span className="px-1.5 py-0.5 rounded-md bg-[#FFF0E6] text-[#C2410C] text-[10px] font-bold">
                              +{tech.assignedBuildings.length - 2} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">All Agency Sites</span>
                      )}
                    </td>

                    {/* Completed Jobs */}
                    <td className="py-3.5 px-4 font-bold text-slate-800 tabular-nums">
                      {tech.completedJobs}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end flex-wrap">
                        <button
                          onClick={() => handleSendWhatsAppCredentials(tech)}
                          title="Send App Link & Login ID on WhatsApp"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-xs transition-all"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>📲 Send on WhatsApp</span>
                        </button>

                        <button
                          onClick={() => handleCopyCredentials(tech)}
                          title="Copy Login Details"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleOpenDetails(tech)}
                          title="View Profile & Activity"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => openEditModal(tech)}
                          title="Edit Details / Assign Buildings"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            setResetPasswordTech(tech);
                            setNewPassword(generateSixDigitPin());
                            setResetError(null);
                          }}
                          title="Reset PIN / Password"
                          className="p-1.5 rounded-lg bg-[#FFF0E6] hover:bg-[#FED7AA] text-[#C2410C] transition-colors"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setDeleteConfirmTech(tech)}
                          title="Remove Account"
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =========================================================================
          MODAL: ADD TECHNICIAN (INDIAN MOBILE + 1-CLICK PIN + OPTIONAL EMAIL)
      ========================================================================= */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#FED7AA] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 my-8 text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Add New Field Technician</h3>
                  <p className="text-xs text-slate-400">
                    Create Mobile / Staff ID login &amp; share instantly via WhatsApp
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-500/50 text-red-200 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="font-semibold">{formError}</p>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-slate-700 font-bold">Technician Full Name *</label>
                  <input
                    type="text"
                    required
                    value={addForm.fullName}
                    onChange={(e) => { const val = e.target.value; setAddForm((prev) => ({ ...prev, fullName: val, employeeId: computeSystematicTechId(agencyName, val, technicians) })); }}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-3 py-2.5 rounded-xl bg-white  border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C2410C]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-700 font-bold">Mobile Number (WhatsApp) *</label>
                  <input
                    type="tel"
                    required={!addForm.email}
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2.5 rounded-xl bg-white  border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C2410C] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <div className="flex items-center justify-between"><label className="text-slate-700 font-bold">Technician ID (Username) *</label><button type="button" onClick={() => setAddForm((prev) => ({ ...prev, employeeId: computeSystematicTechId(agencyName, prev.fullName || 'tech', technicians) }))} className="text-[11px] font-bold text-[#C2410C] hover:text-[#9A3412] flex items-center gap-1"><RefreshCw className="w-3 h-3" /><span>Regenerate</span></button></div>
                  <input
                    type="text"
                    value={addForm.employeeId}
                    onChange={(e) => setAddForm({ ...addForm, employeeId: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    placeholder="e.g. agency-ramesh"
                    className="w-full px-3 py-2.5 rounded-xl bg-[#FFF8F2] border border-slate-800 text-cyan-300 font-mono placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 uppercase"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-700 font-bold">6-Digit Login PIN / Password *</label>
                    <button
                      type="button"
                      onClick={handleGeneratePinAndId}
                      className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Generate PIN</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    minLength={6}
                    value={addForm.password}
                    onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                    placeholder="e.g. 482915"
                    className="w-full px-3 py-2.5 rounded-xl bg-white  border border-slate-300 text-amber-700 font-mono font-bold tracking-wider placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">
                  Login Email <span className="text-slate-500 font-normal">(Optional — leave blank to log in with Mobile No / Staff ID)</span>
                </label>
                <input
                  type="email"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  placeholder="Optional — leave blank for field staff without email"
                  className="w-full px-3 py-2 rounded-xl bg-[#FFF8F2] border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Assigned Buildings Checklist */}
              <div className="space-y-1.5 pt-1">
                <label className="text-slate-700 font-bold flex items-center justify-between">
                  <span>Assigned Facilities / Buildings</span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    {addForm.assignedBuildingIds.length === 0
                      ? 'All agency buildings (default)'
                      : `${addForm.assignedBuildingIds.length} selected`}
                  </span>
                </label>
                <div className="max-h-36 overflow-y-auto p-2 bg-[#F8FAFC]  border border-[#FED7AA] rounded-xl space-y-1">
                  {buildings.length === 0 ? (
                    <p className="text-slate-500 p-2 text-center text-xs">No facilities added yet.</p>
                  ) : (
                    buildings.map((b) => (
                      <label
                        key={b.id}
                        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer text-slate-700 hover:text-slate-900"
                      >
                        <input
                          type="checkbox"
                          checked={addForm.assignedBuildingIds.includes(b.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAddForm({
                                ...addForm,
                                assignedBuildingIds: [...addForm.assignedBuildingIds, b.id],
                              });
                            } else {
                              setAddForm({
                                ...addForm,
                                assignedBuildingIds: addForm.assignedBuildingIds.filter((id) => id !== b.id),
                              });
                            }
                          }}
                          className="rounded text-emerald-500 focus:ring-emerald-500 border-slate-700 bg-slate-900"
                        />
                        <span className="font-medium truncate">{b.name}</span>
                        {b.city && <span className="text-[10px] text-slate-500">({b.city})</span>}
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2.5 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-900 shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {formSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Create Technician &amp; Get WhatsApp Link</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CREATED SUCCESS SCREEN (WITH 1-CLICK WHATSAPP ONBOARDING)
      ========================================================================= */}
      {createdSuccessTech && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#FED7AA] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 text-center text-slate-900">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400">
                Ready for Field Dispatch
              </span>
              <h3 className="text-xl font-black text-slate-900">Technician Created Successfully</h3>
              <p className="text-xs text-slate-400">
                Send the installable mobile app link and login PIN directly to their WhatsApp in 1 click.
              </p>
            </div>

            {/* Credentials Card */}
            <div className="bg-[#FFF8F2]  p-4 rounded-xl border border-[#FED7AA] text-left text-xs space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Technician Name:</span>
                <strong className="text-slate-900 text-sm">{createdSuccessTech.fullName}</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Mobile Login No:</span>
                <strong className="text-emerald-600 font-mono text-sm">
                  {createdSuccessTech.phone || '—'}
                </strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Staff ID:</span>
                <strong className="text-[#C2410C] font-mono text-sm">
                  {createdSuccessTech.employeeId || '—'}
                </strong>
              </div>
              {createdSuccessTech.tempPassword && (
                <div className="flex justify-between items-center pt-1 border-t border-[#FED7AA]">
                  <span className="text-slate-400">6-Digit Login PIN:</span>
                  <strong className="text-amber-600 font-mono text-base tracking-widest">
                    {createdSuccessTech.tempPassword}
                  </strong>
                </div>
              )}
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() =>
                  handleSendWhatsAppCredentials(createdSuccessTech, createdSuccessTech.tempPassword)
                }
                className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 fill-slate-900" />
                <span>📲 Send App &amp; Login ID on WhatsApp</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleCopyCredentials(createdSuccessTech, createdSuccessTech.tempPassword)
                  }
                  className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 border border-[#FED7AA]"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Login Details</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCreatedSuccessTech(null)}
                  className="py-2.5 px-4 rounded-xl border border-[#FED7AA] hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: EDIT TECHNICIAN
      ========================================================================= */}
      {editModalTech && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#FED7AA] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 my-8 text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <Edit className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Edit Technician Details</h3>
                  <p className="text-xs text-slate-400">{editModalTech.employeeId || editModalTech.phone}</p>
                </div>
              </div>
              <button
                onClick={() => setEditModalTech(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/50 text-red-200 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-slate-700 font-bold">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FFF8F2] border border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-700 font-bold">Staff / Employee ID</label>
                  <input
                    type="text"
                    value={editForm.employeeId}
                    onChange={(e) => setEditForm({ ...editForm, employeeId: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FFF8F2] border border-slate-800 text-white font-mono uppercase focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-slate-700 font-bold">Mobile Phone</label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FFF8F2] border border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-700 font-bold">Account Access</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FFF8F2] border border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="ACTIVE">Active (Can Sign In)</option>
                    <option value="INACTIVE">Blocked / Inactive (Access Revoked)</option>
                  </select>
                </div>
              </div>

              {/* Building Assignments */}
              <div className="space-y-1.5 pt-1">
                <label className="text-slate-700 font-bold flex items-center justify-between">
                  <span>Assigned Facilities</span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    {editForm.assignedBuildingIds.length} selected
                  </span>
                </label>
                <div className="max-h-36 overflow-y-auto p-2 bg-[#F8FAFC]  border border-[#FED7AA] rounded-xl space-y-1">
                  {buildings.map((b) => (
                    <label
                      key={b.id}
                      className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer text-slate-700 hover:text-slate-900"
                    >
                      <input
                        type="checkbox"
                        checked={editForm.assignedBuildingIds.includes(b.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditForm({
                              ...editForm,
                              assignedBuildingIds: [...editForm.assignedBuildingIds, b.id],
                            });
                          } else {
                            setEditForm({
                              ...editForm,
                              assignedBuildingIds: editForm.assignedBuildingIds.filter((id) => id !== b.id),
                            });
                          }
                        }}
                        className="rounded text-amber-500 focus:ring-amber-500 border-slate-700 bg-slate-900"
                      />
                      <span className="font-medium truncate">{b.name}</span>
                      {b.city && <span className="text-[10px] text-slate-500">({b.city})</span>}
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditModalTech(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2.5 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-slate-900 shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {formSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: RESET PASSWORD / PIN
      ========================================================================= */}
      {resetPasswordTech && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#FED7AA] rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-slate-900">Reset 6-Digit PIN / Password</h3>
              </div>
              <button
                onClick={() => setResetPasswordTech(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Set a new login PIN for <strong className="text-slate-900">{resetPasswordTech.fullName}</strong> (
              {resetPasswordTech.employeeId !== '—' ? resetPasswordTech.employeeId : resetPasswordTech.phone}).
            </p>

            {resetError && (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/50 text-red-200 text-xs">
                {resetError}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-slate-700 font-bold">New 6-Digit PIN / Password</label>
                  <button
                    type="button"
                    onClick={() => setNewPassword(generateSixDigitPin())}
                    className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Generate PIN</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full px-3 py-2.5 rounded-xl bg-white  border border-slate-300 text-amber-700 font-mono font-bold tracking-wider placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResetPasswordTech(null)}
                  className="px-3.5 py-2 rounded-xl text-slate-400 hover:text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetSubmitting}
                  className="px-4 py-2 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-slate-900 transition-all disabled:opacity-50"
                >
                  {resetSubmitting ? 'Updating...' : 'Save New PIN'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: VIEW TECHNICIAN DETAILS & ACTIVITY
      ========================================================================= */}
      {viewDetailTech && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#FED7AA] rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8 text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#EA580C] to-[#C2410C] text-white flex items-center justify-center font-bold text-base shadow-md">
                  {viewDetailTech.fullName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{viewDetailTech.fullName}</h3>
                  <p className="text-xs text-slate-400">
                    {viewDetailTech.employeeId !== '—' ? `Staff ID: ${viewDetailTech.employeeId}` : viewDetailTech.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewDetailTech(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-[#FFF8F2]  p-4 rounded-xl border border-[#FED7AA]">
              <div>
                <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold block">Status</span>
                <span className={viewDetailTech.status === 'ACTIVE' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {viewDetailTech.status}
                </span>
              </div>
              <div>
                <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold block">Mobile No</span>
                <span className="text-slate-200 font-mono">{viewDetailTech.phone || '—'}</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold block">Staff ID</span>
                <span className="text-cyan-300 font-mono font-bold">{viewDetailTech.employeeId || '—'}</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold block">Last Login</span>
                <span className="text-slate-200">
                  {viewDetailTech.lastLoginAt ? new Date(viewDetailTech.lastLoginAt).toLocaleDateString('en-IN') : 'Never'}
                </span>
              </div>
            </div>

            {/* Assigned Buildings */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Assigned Facilities ({viewDetailTech.assignedBuildings?.length || 0})
              </h4>
              <div className="flex flex-wrap gap-2">
                {viewDetailTech.assignedBuildings?.length > 0 ? (
                  viewDetailTech.assignedBuildings.map((b: any) => (
                    <span
                      key={b.id}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 text-xs font-medium border border-slate-700"
                    >
                      {b.name}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">Access to all agency facilities.</span>
                )}
              </div>
            </div>

            {/* Recent Activity Log & Visit Stamps */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Recent Activity Trail &amp; Visit Stamps</h4>
              <div className="max-h-56 overflow-y-auto bg-white p-3 rounded-xl border border-slate-200 space-y-2.5 text-xs">
                {viewDetailTech.activity?.length > 0 ? (
                  viewDetailTech.activity.map((act: any) => {
                    let parsed: any = null;
                    if (typeof act.details === 'string' && act.details.trim().startsWith('{')) {
                      try {
                        parsed = JSON.parse(act.details);
                      } catch {
                        parsed = null;
                      }
                    }

                    const isVisit = act.action === 'VISIT_STAMP';

                    return (
                      <div
                        key={act.id}
                        className="flex items-start justify-between text-slate-800 pb-2 border-b border-slate-100 last:border-b-0"
                      >
                        <div className="flex-1 pr-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                                isVisit
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : 'bg-amber-100 text-amber-900 border border-amber-200'
                              }`}
                            >
                              {isVisit ? '📍 VISIT STAMP' : act.action}
                            </span>
                            {isVisit && parsed?.buildingName && (
                              <span className="font-bold text-slate-900 text-xs">
                                {parsed.buildingName}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-600 mt-1">
                            {isVisit && parsed
                              ? `Arrived • GPS (±${parsed.accuracy ?? 8}m)${
                                  parsed.latitude && parsed.longitude
                                    ? ` [${Number(parsed.latitude).toFixed(4)}, ${Number(parsed.longitude).toFixed(4)}]`
                                    : ''
                                }`
                              : (typeof act.details === 'string' ? act.details : JSON.stringify(act.details))}
                          </p>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                          {new Date(act.createdAt).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-slate-500 text-center py-2 text-xs">No activity logged yet.</p>
                )}
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <button
                type="button"
                onClick={() => handleSendWhatsAppCredentials(viewDetailTech)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>📲 Send App &amp; Login ID on WhatsApp</span>
              </button>
              <button
                onClick={() => setViewDetailTech(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CONFIRM DELETION / SAFE DEACTIVATION
      ========================================================================= */}
      {deleteConfirmTech && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#FED7AA] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-slate-900">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-slate-900">Remove Technician Account?</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to remove <strong className="text-slate-900">{deleteConfirmTech.fullName}</strong>?
            </p>

            <div className="p-3 rounded-xl bg-[#F8FAFC]  border border-[#FED7AA] text-[11px] text-slate-600 space-y-1">
              <p className="font-semibold text-amber-300 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Audit Trail Protection
              </p>
              <p>
                If this technician has completed historical inspections or work orders, their account will be deactivated rather than purged. Historical compliance records and service logs remain permanently intact.
              </p>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmTech(null)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTechnician}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white transition-colors"
              >
                Confirm Removal
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Permanent Anonymization Confirmation Modal (Danger #DC2626) */}
      {confirmApproveModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-rose-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-[#DC2626]">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-[#DC2626]" />
              </div>
              <div>
                <h3 className="font-display font-black text-base text-slate-900">
                  {t.confirmDeletionTitle || 'Permanently Anonymize Staff Account?'}
                </h3>
                <p className="text-xs text-rose-600 font-semibold">DPDP Act 2023 • Irreversible Action</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-slate-700 space-y-2 leading-relaxed">
              <p className="font-medium">
                {t.confirmDeletionMessage || 'This action is PERMANENT and cannot be undone. The technician\'s login access, mobile number, and personal details will be irreversibly anonymized. Statutory fire safety inspection records and photos are preserved per Indian compliance.'}
              </p>
              <div className="pt-2 border-t border-rose-200/60 font-semibold text-slate-900">
                Target Staff: <span className="font-mono text-rose-800">{confirmApproveModal.staffName}</span> ({confirmApproveModal.employeeId || confirmApproveModal.phone})
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmApproveModal(null)}
                className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={approveSubmitting}
                onClick={() => handleApproveDeletion(confirmApproveModal)}
                className="w-full py-2.5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs transition-colors shadow-xs active:scale-95 disabled:opacity-50"
              >
                {approveSubmitting ? 'Processing...' : (t.btnApproveDeletion || 'Approve & Anonymize')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
