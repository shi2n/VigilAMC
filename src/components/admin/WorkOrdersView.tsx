'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { toast } from 'sonner';
import {
  Wrench,
  Plus,
  Search,
  RefreshCw,
  Building2,
  Calendar,
  User,
  X,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Ripple } from '@/components/ui/ripple';

interface WorkOrdersViewProps {
  showToast: (msg: string) => void;
  onOpenImport?: () => void;
  initialWorkOrders?: any[];
  initialTechnicians?: any[];
  initialBuildings?: any[];
  onRefreshDashboard?: () => Promise<void> | void;
}

function getStatusPillStyle(status: string) {
  switch (status) {
    case 'COMPLETED':
      return 'bg-emerald-50 text-[#0E9F6E] border-[#0E9F6E]/30';
    case 'IN_PROGRESS':
      return 'bg-[#FFF0E6] text-[#C2410C] border-[#C2410C]/30';
    case 'ASSIGNED':
      return 'bg-[#FFF0E6] text-[#1C1917] border-[#1C1917]/25';
    case 'CANCELLED':
      return 'bg-slate-100 text-slate-600 border-slate-300';
    default:
      return 'bg-amber-50 text-amber-800 border-amber-300';
  }
}

export function WorkOrdersView({
  showToast,
  onOpenImport,
  initialWorkOrders,
  initialTechnicians,
  initialBuildings,
  onRefreshDashboard,
}: WorkOrdersViewProps) {
  const prefersReducedMotion = useReducedMotion();
  const [workOrders, setWorkOrders] = useState<any[]>(initialWorkOrders || []);
  const [technicians, setTechnicians] = useState<any[]>(initialTechnicians || []);
  const [buildings, setBuildings] = useState<any[]>(initialBuildings || []);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<
    'ALL' | 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED'
  >('ALL');
  const [search, setSearch] = useState('');
  const [rippleRowId, setRippleRowId] = useState<string | null>(null);

  // Add work order modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    buildingId: '',
    assignedToId: '',
    priority: 'MEDIUM',
    dueDate: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Sync instantly from parent bootstrap cache
  useEffect(() => {
    if (Array.isArray(initialWorkOrders)) setWorkOrders(initialWorkOrders);
  }, [initialWorkOrders]);

  useEffect(() => {
    if (Array.isArray(initialTechnicians)) setTechnicians(initialTechnicians);
  }, [initialTechnicians]);

  useEffect(() => {
    if (Array.isArray(initialBuildings)) setBuildings(initialBuildings);
  }, [initialBuildings]);

  const fetchWorkOrders = async () => {
    try {
      setLoading(true);
      if (onRefreshDashboard) {
        const [woRes] = await Promise.all([
          fetch('/api/work-orders', { cache: 'no-store' }),
          onRefreshDashboard(),
        ]);
        if (woRes.ok) {
          const woJson = await woRes.json().catch(() => ({}));
          if (Array.isArray(woJson.workOrders)) {
            setWorkOrders(woJson.workOrders);
          }
        }
      } else {
        const [woRes, techRes, bldRes] = await Promise.all([
          fetch('/api/work-orders', { cache: 'no-store' }),
          fetch('/api/admin/technicians', { cache: 'no-store' }),
          fetch('/api/admin/buildings', { cache: 'no-store' }),
        ]);

        const woJson = await woRes.json().catch(() => ({}));
        const techJson = await techRes.json().catch(() => ({}));
        const bldJson = await bldRes.json().catch(() => ({}));

        if (Array.isArray(woJson.workOrders)) setWorkOrders(woJson.workOrders);
        if (Array.isArray(techJson.technicians)) setTechnicians(techJson.technicians);
        if (Array.isArray(bldJson.buildings)) setBuildings(bldJson.buildings);
      }
    } catch (e: any) {
      console.error(e);
      const errMsg = e?.message || 'Failed to refresh work orders';
      toast.error(errMsg, { duration: 5500 });
      showToast(errMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialWorkOrders) {
      fetchWorkOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateWorkOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.buildingId) {
      toast.error('Please select a facility for this work order', { duration: 5500 });
      showToast('Please select a facility for this work order');
      return;
    }
    setSubmitting(true);

    try {
      const payload = {
        ...form,
        assignedToId:
          form.assignedToId && form.assignedToId.trim() !== ''
            ? form.assignedToId.trim()
            : null,
        dueDate:
          form.dueDate && form.dueDate.trim() !== '' ? form.dueDate.trim() : null,
      };

      const res = await fetch('/api/work-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Failed to create work order');

      if (json.workOrder) {
        const matchedBuilding = buildings.find((b) => b.id === form.buildingId);
        const matchedTech = technicians.find((t) => t.id === form.assignedToId);
        setWorkOrders((prev) => [
          {
            ...json.workOrder,
            building:
              json.workOrder.building ||
              (matchedBuilding
                ? { id: matchedBuilding.id, name: matchedBuilding.name }
                : undefined),
            assignedTo:
              json.workOrder.assignedTo ||
              (matchedTech
                ? { id: matchedTech.id, fullName: matchedTech.fullName }
                : undefined),
          },
          ...prev,
        ]);
      }

      setCreateModalOpen(false);
      setForm({
        title: '',
        description: '',
        buildingId: '',
        assignedToId: '',
        priority: 'MEDIUM',
        dueDate: '',
      });
      toast.success('Work order created and assigned successfully');
      showToast('Work order created and assigned successfully');
      await fetchWorkOrders();
    } catch (err: any) {
      const msg = err?.message || 'Error creating work order';
      toast.error(msg, { duration: 5500 });
      showToast(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const previousOrders = workOrders;
    // Optimistic update
    setWorkOrders((prev) =>
      prev.map((wo) => (wo.id === id ? { ...wo, status: newStatus } : wo))
    );
    try {
      const res = await fetch('/api/work-orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setWorkOrders(previousOrders);
        const errMsg = data?.error || 'Failed to update status';
        toast.error(errMsg, { duration: 5500 });
        showToast(errMsg);
        await fetchWorkOrders();
        return;
      }
      setRippleRowId(id);
      window.setTimeout(() => {
        setRippleRowId((curr) => (curr === id ? null : curr));
      }, 650);
      toast.success(`Work order status updated to ${newStatus}`);
      showToast(`Work order status updated to ${newStatus}`);
      await fetchWorkOrders();
    } catch (e: any) {
      console.error(e);
      setWorkOrders(previousOrders);
      const errMsg = e?.message || 'Failed to update status';
      toast.error(errMsg, { duration: 5500 });
      showToast(errMsg);
      await fetchWorkOrders();
    }
  };

  const filteredOrders = workOrders.filter((wo) => {
    const matchesSearch =
      (wo.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (wo.description || '').toLowerCase().includes(search.toLowerCase()) ||
      (wo.building?.name && wo.building.name.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || wo.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Filter & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass-panel-dense p-4 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2.5 flex-1 flex-wrap">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search work orders..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-[#FED7AA] rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#C2410C] focus:ring-2 focus:ring-[#C2410C]/20 shadow-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-[#FFF8F2] rounded-xl border border-[#FED7AA] text-xs flex-wrap">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                statusFilter === 'ALL'
                  ? 'bg-[#C2410C] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#1C1917]'
              }`}
            >
              All ({workOrders.length})
            </button>
            <button
              onClick={() => setStatusFilter('OPEN')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                statusFilter === 'OPEN'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#1C1917]'
              }`}
            >
              Open ({workOrders.filter((w) => w.status === 'OPEN').length})
            </button>
            <button
              onClick={() => setStatusFilter('ASSIGNED')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                statusFilter === 'ASSIGNED'
                  ? 'bg-[#1C1917] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#1C1917]'
              }`}
            >
              Assigned ({workOrders.filter((w) => w.status === 'ASSIGNED').length})
            </button>
            <button
              onClick={() => setStatusFilter('IN_PROGRESS')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                statusFilter === 'IN_PROGRESS'
                  ? 'bg-[#C2410C] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#1C1917]'
              }`}
            >
              In Progress ({workOrders.filter((w) => w.status === 'IN_PROGRESS').length})
            </button>
            <button
              onClick={() => setStatusFilter('COMPLETED')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                statusFilter === 'COMPLETED'
                  ? 'bg-[#0E9F6E] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#1C1917]'
              }`}
            >
              Completed ({workOrders.filter((w) => w.status === 'COMPLETED').length})
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onOpenImport && (
            <button
              onClick={onOpenImport}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#C2410C] bg-[#FFF0E6] hover:bg-[#FED7AA] border border-[#C2410C]/30 transition-all"
              title="Import Work Orders from Excel (.xlsx)"
            >
              <span>Import Orders</span>
            </button>
          )}

          <button
            onClick={fetchWorkOrders}
            className="p-2 rounded-xl bg-[#FFF8F2] border border-[#FED7AA] hover:bg-[#FFF0E6] text-slate-600 hover:text-[#C2410C] transition-colors"
            title="Refresh Orders"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#C2410C]' : ''}`} />
          </button>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#EA580C] to-[#C2410C] hover:from-[#C2410C] hover:to-[#9A3412] shadow-sm transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Create Work Order</span>
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white border border-[#FED7AA] rounded-2xl overflow-hidden shadow-xs">
        {loading && workOrders.length === 0 ? (
          <div className="p-5 space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center space-y-3 bg-[#FFF8F2]/50">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF0E6] border border-[#C2410C]/20 flex items-center justify-center text-[#C2410C] mx-auto">
              <Wrench className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#1C1917]">No Work Orders</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {search || statusFilter !== 'ALL'
                ? 'No work orders match your search filters.'
                : 'Dispatch defect repairs and maintenance tasks to your active technicians.'}
            </p>
            {!search && statusFilter === 'ALL' && (
              <button
                onClick={() => setCreateModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#C2410C] hover:bg-[#1C1917] shadow-xs transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create First Work Order</span>
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[#FED7AA]/60">
            {filteredOrders.map((wo, idx) => {
              const isOverdue =
                ['OPEN', 'ASSIGNED', 'IN_PROGRESS'].includes(wo.status) &&
                wo.dueDate &&
                new Date(wo.dueDate) < new Date();
              const isUnassigned = !wo.assignedToId && !wo.assignedTo;

              return (
                <motion.div
                  key={wo.id}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.18,
                    delay: prefersReducedMotion ? 0 : Math.min(idx, 7) * 0.025,
                    ease: 'easeOut',
                  }}
                  className={`relative p-4 sm:p-5 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isOverdue
                      ? 'bg-rose-50/50 border-l-4 border-l-[#B91C1C]'
                      : 'hover:bg-[#FFF0E6]/35'
                  }`}
                >
                  {rippleRowId === wo.id && (
                    <Ripple color="rgba(14, 159, 110, 0.18)" />
                  )}

                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                          wo.priority === 'URGENT'
                            ? 'bg-rose-50 text-[#B91C1C] border-[#B91C1C]/30'
                            : wo.priority === 'HIGH'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-[#FFF8F2] text-[#1C1917] border-[#FED7AA]'
                        }`}
                      >
                        {wo.priority}
                      </span>
                      <motion.span
                        key={`${wo.id}-${wo.status}`}
                        initial={prefersReducedMotion ? false : { scale: 0.92, opacity: 0.7 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${getStatusPillStyle(
                          wo.status || 'OPEN'
                        )}`}
                      >
                        {wo.status || 'OPEN'}
                      </motion.span>
                      {isOverdue && (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-rose-50 text-[#B91C1C] border border-[#B91C1C]/30">
                          ✕ Overdue
                        </span>
                      )}
                      <h4 className="text-sm font-bold text-[#1C1917]">{wo.title}</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{wo.description}</p>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                      <span className="flex items-center gap-1 text-slate-600">
                        <Building2 className="w-3.5 h-3.5 text-[#C2410C]" />
                        {wo.building?.name || 'Facility'}
                      </span>
                      <span>&bull;</span>
                      <span
                        className={`flex items-center gap-1 ${
                          isUnassigned ? 'text-[#B91C1C] font-bold' : 'text-slate-600'
                        }`}
                      >
                        <User className="w-3.5 h-3.5 text-[#C2410C]" />
                        Assigned:{' '}
                        <strong className="font-semibold">
                          {wo.assignedTo?.fullName || '⚠ Unassigned'}
                        </strong>
                      </span>
                      {wo.dueDate && (
                        <>
                          <span>&bull;</span>
                          <span
                            className={`flex items-center gap-1 ${
                              isOverdue ? 'text-[#B91C1C] font-bold' : 'text-slate-600'
                            }`}
                          >
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            Due: {new Date(wo.dueDate).toLocaleDateString('en-IN')}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <select
                      value={wo.status || 'OPEN'}
                      onChange={(e) => handleUpdateStatus(wo.id, e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-[#FED7AA] text-xs font-bold text-[#1C1917] shadow-xs focus:outline-none focus:border-[#C2410C] focus:ring-2 focus:ring-[#C2410C]/20"
                    >
                      <option value="OPEN">OPEN</option>
                      <option value="ASSIGNED">ASSIGNED</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Work Order Modal (Spring scale-in 0.98 -> 1, 200ms) */}
      <AnimatePresence>
        {createModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-white border border-[#FED7AA] rounded-2xl max-w-lg w-full p-6 shadow-[0_16px_48px_rgba(28, 25, 23,0.16)] space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#FED7AA]">
                <div className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-[#C2410C]" />
                  <h3 className="text-base font-bold text-[#1C1917]">Create Work Order</h3>
                </div>
                <button
                  onClick={() => setCreateModalOpen(false)}
                  className="text-slate-400 hover:text-[#1C1917] rounded-lg p-1 hover:bg-[#FFF0E6]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateWorkOrder} className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-700 font-bold">Title *</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Hydro-test pressure check on 3rd floor riser"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#FED7AA] text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#C2410C] shadow-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-700 font-bold">Description / Work Scope</label>
                  <textarea
                    rows={2}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Details of defects, corrective maintenance required..."
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#FED7AA] text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#C2410C] shadow-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-700 font-bold">Target Facility *</label>
                    <select
                      required
                      value={form.buildingId}
                      onChange={(e) => setForm({ ...form, buildingId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#FED7AA] text-slate-900 focus:outline-none focus:border-[#C2410C] shadow-xs"
                    >
                      <option value="">Select Facility...</option>
                      {buildings.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 font-bold">Assign Technician</label>
                    <select
                      value={form.assignedToId}
                      onChange={(e) => setForm({ ...form, assignedToId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#FED7AA] text-slate-900 focus:outline-none focus:border-[#C2410C] shadow-xs"
                    >
                      <option value="">Unassigned</option>
                      {technicians.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.fullName} ({t.status})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-700 font-bold">Priority</label>
                    <select
                      value={form.priority}
                      onChange={(e) => setForm({ ...form, priority: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#FED7AA] text-slate-900 focus:outline-none focus:border-[#C2410C] shadow-xs"
                    >
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                      <option value="URGENT">URGENT</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 font-bold">Due Date</label>
                    <input
                      type="date"
                      value={form.dueDate}
                      onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#FED7AA] text-slate-900 focus:outline-none focus:border-[#C2410C] shadow-xs"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-[#FED7AA] flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:text-[#1C1917] font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl font-bold bg-gradient-to-r from-[#EA580C] to-[#C2410C] hover:from-[#C2410C] hover:to-[#9A3412] text-white disabled:opacity-50 shadow-sm"
                  >
                    {submitting ? 'Creating...' : 'Create & Assign'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
