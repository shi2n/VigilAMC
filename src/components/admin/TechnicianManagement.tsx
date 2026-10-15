'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  RefreshCw,
  MoreVertical,
  CheckCircle2,
  AlertTriangle,
  Lock,
  KeyRound,
  Trash2,
  Edit,
  Eye,
  Building2,
  Phone,
  Mail,
  Calendar,
  Clock,
  ShieldCheck,
  UserCheck,
  UserX,
  X,
  Check,
  Sparkles,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { SeatCounter, SeatUsage } from './SeatCounter';

interface TechnicianManagementProps {
  onNavigateToSubscription?: () => void;
  showToast: (msg: string) => void;
  onOpenImport?: () => void;
}

export function TechnicianManagement({
  onNavigateToSubscription,
  showToast,
  onOpenImport,
}: TechnicianManagementProps) {
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [seatUsage, setSeatUsage] = useState<SeatUsage | undefined>(undefined);
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
    } catch (err: any) {
      console.error('Error loading technicians:', err);
      showToast(err.message || 'Error loading technicians');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechnicians();
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

      setAddModalOpen(false);
      setCreatedSuccessTech({
        ...json.technician,
        tempPassword: addForm.password,
      });

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
          : `Technician ${tech.fullName} deactivated. Seat is now available.`
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

      setResetPasswordTech(null);
      setNewPassword('');
      showToast(`Password updated for ${resetPasswordTech.fullName}`);
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

    const matchesStatus =
      statusFilter === 'ALL' || tech.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* 1. Seat Counter Bar */}
      <SeatCounter usage={seatUsage} />

      {/* 2. Action & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#DCE7F2] shadow-sm dark:bg-slate-900/60 dark:border-slate-800">
        <div className="flex items-center gap-2.5 flex-1 flex-wrap">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, phone, ID..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-[#DCE7F2] rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#007DB8] shadow-sm dark:bg-slate-950 dark:border-slate-800 dark:text-white dark:placeholder-slate-500"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs dark:bg-slate-950 dark:border-slate-800">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                statusFilter === 'ALL'
                  ? 'bg-[#007DB8] text-white shadow-sm dark:bg-amber-500 dark:text-slate-950'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              All ({technicians.length})
            </button>
            <button
              onClick={() => setStatusFilter('ACTIVE')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                statusFilter === 'ACTIVE'
                  ? 'bg-emerald-600 text-white shadow-sm dark:bg-emerald-500 dark:text-slate-950'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Active ({technicians.filter((t) => t.status === 'ACTIVE').length})
            </button>
            <button
              onClick={() => setStatusFilter('INACTIVE')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                statusFilter === 'INACTIVE'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Inactive ({technicians.filter((t) => t.status === 'INACTIVE').length})
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onOpenImport && (
            <button
              onClick={onOpenImport}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#007DB8] bg-[#EAF6FF] hover:bg-[#D5EEFF] border border-[#007DB8]/30 transition-all dark:text-amber-300 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 dark:border-amber-500/30"
              title="Import Technicians from Excel (.xlsx)"
            >
              <span>Import Technicians</span>
            </button>
          )}

          <button
            onClick={fetchTechnicians}
            className="p-2 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors dark:bg-slate-950 dark:border-slate-800 dark:hover:border-slate-700 dark:text-slate-400 dark:hover:text-white"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#007DB8]' : ''}`} />
          </button>

          <button
            onClick={() => {
              setFormError(null);
              setAddModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#007DB8] to-[#073F8F] hover:from-[#006494] hover:to-[#011F48] shadow-md transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Technician</span>
          </button>
        </div>
      </div>

      {/* 3. Technicians Table */}
      <div className="bg-white border border-[#DCE7F2] rounded-2xl overflow-hidden shadow-sm dark:bg-slate-900/80 dark:border-slate-800 dark:shadow-xl">
        {loading && technicians.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3 dark:text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-[#007DB8] mx-auto" />
            <p className="text-sm font-semibold">Loading technician records...</p>
          </div>
        ) : filteredTechnicians.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto dark:bg-slate-800 dark:text-slate-500">
              <Users className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No Technicians Found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {search || statusFilter !== 'ALL'
                  ? 'No technicians match your search filters.'
                  : 'Create your first field technician account to assign inspections, work orders, and facilities.'}
              </p>
            </div>
            {!search && statusFilter === 'ALL' && (
              <button
                onClick={() => setAddModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#007DB8] to-[#073F8F] hover:from-[#006494] hover:to-[#011F48] transition-all shadow-md"
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
                <tr className="border-b border-[#DCE7F2] bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-400">
                  <th className="py-3.5 px-4">Technician</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Assigned Buildings</th>
                  <th className="py-3.5 px-4">Completed Jobs</th>
                  <th className="py-3.5 px-4">Last Login</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 dark:divide-slate-800/60 dark:text-slate-300">
                {filteredTechnicians.map((tech) => (
                  <tr key={tech.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group">
                    {/* Name & ID */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#007DB8]/20 to-[#023E8A]/30 text-[#007DB8] border border-[#007DB8]/30 flex items-center justify-center font-bold text-xs shrink-0 dark:from-[#0077B6]/30 dark:to-[#023E8A]/40 dark:text-cyan-300 dark:border-cyan-500/20">
                          {tech.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-[#007DB8] transition-colors dark:text-white dark:group-hover:text-amber-400">
                            {tech.fullName}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {tech.employeeId !== '—' ? `ID: ${tech.employeeId}` : tech.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <div className="text-slate-700 dark:text-slate-300 font-medium">{tech.email}</div>
                        <div className="text-[11px] text-slate-500">{tech.phone}</div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {tech.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold uppercase tracking-wider dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* Assigned Buildings */}
                    <td className="py-3.5 px-4">
                      {tech.assignedBuildings?.length > 0 ? (
                        <div className="flex items-center gap-1 flex-wrap max-w-xs">
                          {tech.assignedBuildings.slice(0, 2).map((b: any) => (
                            <span
                              key={b.id}
                              className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium truncate max-w-[120px] dark:bg-slate-800 dark:text-slate-300"
                              title={b.name}
                            >
                              {b.name}
                            </span>
                          ))}
                          {tech.assignedBuildings.length > 2 && (
                            <span className="px-1.5 py-0.5 rounded-md bg-[#EAF6FF] text-[#007DB8] text-[10px] font-bold dark:bg-slate-800 dark:text-cyan-400">
                              +{tech.assignedBuildings.length - 2} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">All Agency Sites</span>
                      )}
                    </td>

                    {/* Completed Jobs */}
                    <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                      {tech.completedJobs}
                    </td>

                    {/* Last Login */}
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                      {tech.lastLoginAt ? (
                        <span>{new Date(tech.lastLoginAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      ) : (
                        <span className="text-slate-400">Never</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <button
                          onClick={() => handleOpenDetails(tech)}
                          title="View Profile & Activity"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-white"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => openEditModal(tech)}
                          title="Edit Details / Assign Buildings"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-white"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            setResetPasswordTech(tech);
                            setNewPassword('');
                            setResetError(null);
                          }}
                          title="Reset Password"
                          className="p-1.5 rounded-lg bg-[#EAF6FF] hover:bg-[#D5EEFF] text-[#007DB8] transition-colors dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-amber-400 dark:hover:text-amber-300"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleToggleStatus(tech)}
                          title={tech.status === 'ACTIVE' ? 'Deactivate Technician' : 'Activate Technician'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            tech.status === 'ACTIVE'
                              ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 dark:text-amber-400'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 dark:text-emerald-400'
                          }`}
                        >
                          {tech.status === 'ACTIVE' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => setDeleteConfirmTech(tech)}
                          title="Remove Account"
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors dark:bg-red-950/40 dark:hover:bg-red-900/60 dark:text-red-400"
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
          MODAL: ADD TECHNICIAN
      ========================================================================= */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Add New Technician</h3>
                  <p className="text-xs text-slate-400">
                    Field technician account with mobile portal access
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
                  <label className="text-slate-300 font-bold">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={addForm.fullName}
                    onChange={(e) => setAddForm({ ...addForm, fullName: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Employee ID (Optional)</label>
                  <input
                    type="text"
                    value={addForm.employeeId}
                    onChange={(e) => setAddForm({ ...addForm, employeeId: e.target.value })}
                    placeholder="e.g. TECH-104"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Login Email *</label>
                  <input
                    type="email"
                    required
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    placeholder="rahul@agency.com"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Mobile Phone</label>
                  <input
                    type="tel"
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Temporary Password *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    minLength={6}
                    value={addForm.password}
                    onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                    placeholder="Min 6 characters (e.g. FieldPass@2026)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Technician can use this password to sign into the Technician App at /login.
                </p>
              </div>

              {/* Assigned Buildings Checklist */}
              <div className="space-y-1.5 pt-1">
                <label className="text-slate-300 font-bold flex items-center justify-between">
                  <span>Assigned Facilities / Buildings</span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    {addForm.assignedBuildingIds.length} selected
                  </span>
                </label>
                <div className="max-h-36 overflow-y-auto p-2 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  {buildings.length === 0 ? (
                    <p className="text-slate-500 p-2 text-center text-xs">No facilities added yet.</p>
                  ) : (
                    buildings.map((b) => (
                      <label
                        key={b.id}
                        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-900 cursor-pointer text-slate-300 hover:text-white"
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
                          className="rounded text-amber-500 focus:ring-amber-500 border-slate-700 bg-slate-900"
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
                  className="px-5 py-2.5 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {formSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Create Technician</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CREATED SUCCESS SCREEN
      ========================================================================= */}
      {createdSuccessTech && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-emerald-500/60 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400">
                Setup Complete
              </span>
              <h3 className="text-xl font-black text-white">Technician Created Successfully</h3>
              <p className="text-xs text-slate-400">
                The account is active and ready to log into the VigilAMC Technician App.
              </p>
            </div>

            {/* Credentials Card */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Name:</span>
                <strong className="text-white">{createdSuccessTech.fullName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Login Email:</span>
                <strong className="text-cyan-300 font-mono">{createdSuccessTech.email}</strong>
              </div>
              {createdSuccessTech.tempPassword && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Password:</span>
                  <strong className="text-amber-400 font-mono">{createdSuccessTech.tempPassword}</strong>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Assigned Sites:</span>
                <span className="text-slate-300">
                  {createdSuccessTech.assignedBuildings?.length || 0} Facilities
                </span>
              </div>
            </div>

            <button
              onClick={() => setCreatedSuccessTech(null)}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-colors"
            >
              Done & Return to List
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: EDIT TECHNICIAN
      ========================================================================= */}
      {editModalTech && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <Edit className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Edit Technician Details</h3>
                  <p className="text-xs text-slate-400">{editModalTech.email}</p>
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
                  <label className="text-slate-300 font-bold">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Employee ID</label>
                  <input
                    type="text"
                    value={editForm.employeeId}
                    onChange={(e) => setEditForm({ ...editForm, employeeId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Mobile Phone</label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Account Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Building Assignments */}
              <div className="space-y-1.5 pt-1">
                <label className="text-slate-300 font-bold flex items-center justify-between">
                  <span>Assigned Facilities</span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    {editForm.assignedBuildingIds.length} selected
                  </span>
                </label>
                <div className="max-h-36 overflow-y-auto p-2 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  {buildings.map((b) => (
                    <label
                      key={b.id}
                      className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-900 cursor-pointer text-slate-300 hover:text-white"
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
                  className="px-5 py-2.5 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
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
          MODAL: RESET PASSWORD
      ========================================================================= */}
      {resetPasswordTech && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Reset Password</h3>
              </div>
              <button
                onClick={() => setResetPasswordTech(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Set a new login password for <strong className="text-white">{resetPasswordTech.fullName}</strong> ({resetPasswordTech.email}).
            </p>

            {resetError && (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/50 text-red-200 text-xs">
                {resetError}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">New Password</label>
                <input
                  type="text"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500"
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
                  className="px-4 py-2 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all disabled:opacity-50"
                >
                  {resetSubmitting ? 'Updating...' : 'Update Password'}
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
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0077B6] to-[#023E8A] text-white flex items-center justify-center font-bold text-base shadow-md">
                  {viewDetailTech.fullName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{viewDetailTech.fullName}</h3>
                  <p className="text-xs text-slate-400">{viewDetailTech.email}</p>
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold block">Status</span>
                <span className={viewDetailTech.status === 'ACTIVE' ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                  {viewDetailTech.status}
                </span>
              </div>
              <div>
                <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold block">Phone</span>
                <span className="text-slate-200">{viewDetailTech.phone || '—'}</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold block">Employee ID</span>
                <span className="text-slate-200">{viewDetailTech.employeeId || '—'}</span>
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
                    <span key={b.id} className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 text-xs font-medium border border-slate-700">
                      {b.name}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">Access to all agency facilities.</span>
                )}
              </div>
            </div>

            {/* Recent Activity Log */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Recent Activity Trail</h4>
              <div className="max-h-48 overflow-y-auto bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
                {viewDetailTech.activity?.length > 0 ? (
                  viewDetailTech.activity.map((act: any) => (
                    <div key={act.id} className="flex items-start justify-between text-slate-300 pb-1.5 border-b border-slate-900/80">
                      <div>
                        <span className="font-semibold text-amber-400">{act.action}</span>
                        <p className="text-[11px] text-slate-400">{act.details}</p>
                      </div>
                      <span className="text-[10px] text-slate-500 shrink-0">
                        {new Date(act.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-center py-2 text-xs">No activity logged yet.</p>
                )}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
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
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-white">Remove Technician Account?</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to remove <strong className="text-white">{deleteConfirmTech.fullName}</strong>?
            </p>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
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
    </div>
  );
}
