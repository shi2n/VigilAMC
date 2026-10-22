'use client';

import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Plus,
  Search,
  RefreshCw,
  Building2,
  Calendar,
  User,
  X
} from 'lucide-react';

interface WorkOrdersViewProps {
  showToast: (msg: string) => void;
  onOpenImport?: () => void;
  initialWorkOrders?: any[];
  initialTechnicians?: any[];
  initialBuildings?: any[];
  onRefreshDashboard?: () => Promise<void> | void;
}

export function WorkOrdersView({
  showToast,
  onOpenImport,
  initialWorkOrders,
  initialTechnicians,
  initialBuildings,
  onRefreshDashboard,
}: WorkOrdersViewProps) {
  const [workOrders, setWorkOrders] = useState<any[]>(initialWorkOrders || []);
  const [technicians, setTechnicians] = useState<any[]>(initialTechnicians || []);
  const [buildings, setBuildings] = useState<any[]>(initialBuildings || []);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');
  const [search, setSearch] = useState('');

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
        await onRefreshDashboard();
      } else {
        const [woRes, techRes, bldRes] = await Promise.all([
          fetch('/api/work-orders'),
          fetch('/api/admin/technicians'),
          fetch('/api/admin/buildings'),
        ]);

        const woJson = await woRes.json();
        const techJson = await techRes.json();
        const bldJson = await bldRes.json();

        setWorkOrders(woJson.workOrders || []);
        setTechnicians(techJson.technicians || []);
        setBuildings(bldJson.buildings || []);
      }
    } catch (e) {
      console.error(e);
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
      showToast('Please select a facility for this work order');
      return;
    }
    setSubmitting(true);

    try {
      const res = await fetch('/api/work-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to create work order');

      // Optimistic local insert
      if (json.workOrder) {
        const matchedBuilding = buildings.find((b) => b.id === form.buildingId);
        const matchedTech = technicians.find((t) => t.id === form.assignedToId);
        setWorkOrders((prev) => [
          {
            ...json.workOrder,
            building: matchedBuilding ? { id: matchedBuilding.id, name: matchedBuilding.name } : undefined,
            assignedTo: matchedTech ? { id: matchedTech.id, fullName: matchedTech.fullName } : undefined,
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
      showToast('Work order created and assigned successfully');
      fetchWorkOrders();
    } catch (err: any) {
      showToast(err.message || 'Error creating work order');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    // Optimistic update
    setWorkOrders((prev) =>
      prev.map((wo) => (wo.id === id ? { ...wo, status: newStatus } : wo))
    );
    try {
      const res = await fetch(`/api/work-orders`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        showToast(`Work order status updated to ${newStatus}`);
        fetchWorkOrders();
      }
    } catch (e) {
      console.error(e);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#DCE7F2] shadow-sm dark:bg-slate-900/60 dark:border-slate-800">
        <div className="flex items-center gap-2.5 flex-1 flex-wrap">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search work orders..."
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
              All ({workOrders.length})
            </button>
            <button
              onClick={() => setStatusFilter('OPEN')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                statusFilter === 'OPEN'
                  ? 'bg-amber-500 text-white shadow-sm dark:bg-amber-500 dark:text-slate-950'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Open ({workOrders.filter((w) => w.status === 'OPEN').length})
            </button>
            <button
              onClick={() => setStatusFilter('IN_PROGRESS')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                statusFilter === 'IN_PROGRESS'
                  ? 'bg-sky-600 text-white shadow-sm dark:bg-cyan-500 dark:text-slate-950'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              In Progress ({workOrders.filter((w) => w.status === 'IN_PROGRESS').length})
            </button>
            <button
              onClick={() => setStatusFilter('COMPLETED')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                statusFilter === 'COMPLETED'
                  ? 'bg-emerald-600 text-white shadow-sm dark:bg-emerald-500 dark:text-slate-950'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
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
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#007DB8] bg-[#EAF6FF] hover:bg-[#D5EEFF] border border-[#007DB8]/30 transition-all dark:text-amber-300 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 dark:border-amber-500/30"
              title="Import Work Orders from Excel (.xlsx)"
            >
              <span>Import Orders</span>
            </button>
          )}

          <button
            onClick={fetchWorkOrders}
            className="p-2 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors dark:bg-slate-950 dark:border-slate-800 dark:hover:border-slate-700 dark:text-slate-400 dark:hover:text-white"
            title="Refresh Orders"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#007DB8]' : ''}`} />
          </button>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#007DB8] to-[#073F8F] hover:from-[#006494] hover:to-[#011F48] shadow-md transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Create Work Order</span>
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white border border-[#DCE7F2] rounded-2xl overflow-hidden shadow-sm dark:bg-slate-900/80 dark:border-slate-800 dark:shadow-xl">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Wrench className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No Work Orders</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {search || statusFilter !== 'ALL'
                ? 'No work orders match your search filters.'
                : 'Dispatch defect repairs and maintenance tasks to your active technicians.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredOrders.map((wo) => {
              const isOverdue = wo.status !== 'COMPLETED' && wo.dueDate && new Date(wo.dueDate) < new Date();
              const isUnassigned = !wo.assignedToId && !wo.assignedTo;

              return (
                <div
                  key={wo.id}
                  className={`p-4 sm:p-5 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isOverdue
                      ? 'bg-rose-50/60 dark:bg-red-950/20 border-l-4 border-l-red-500'
                      : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/30'
                  }`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          wo.priority === 'URGENT'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/40'
                            : wo.priority === 'HIGH'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/40'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {wo.priority}
                      </span>
                      {isOverdue && (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-300 dark:bg-red-950 dark:text-red-400">
                          ✕ Overdue
                        </span>
                      )}
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{wo.title}</h4>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{wo.description}</p>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                      <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {wo.building?.name || 'Facility'}
                      </span>
                      <span>&bull;</span>
                      <span className={`flex items-center gap-1 ${isUnassigned ? 'text-rose-600 dark:text-red-400 font-bold' : 'text-slate-600 dark:text-slate-400'}`}>
                        <User className="w-3.5 h-3.5 text-[#007DB8]" />
                        Assigned: <strong className="font-semibold">{wo.assignedTo?.fullName || '⚠ Unassigned'}</strong>
                      </span>
                      {wo.dueDate && (
                        <>
                          <span>&bull;</span>
                          <span className={`flex items-center gap-1 ${isOverdue ? 'text-rose-600 dark:text-red-400 font-bold' : 'text-slate-600 dark:text-slate-400'}`}>
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            Due: {new Date(wo.dueDate).toLocaleDateString('en-IN')}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <select
                      value={wo.status}
                      onChange={(e) => handleUpdateStatus(wo.id, e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-[#DCE7F2] text-xs font-bold text-slate-700 shadow-sm focus:outline-none focus:border-[#007DB8] dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300"
                    >
                      <option value="OPEN">OPEN</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Work Order Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#DCE7F2] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 dark:bg-slate-900 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE7F2] dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-[#007DB8] dark:text-amber-400" />
                <h3 className="text-base font-bold text-[#023E8A] dark:text-white">Create Work Order</h3>
              </div>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWorkOrder} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-slate-700 dark:text-slate-300 font-bold">Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Hydro-test pressure check on 3rd floor riser"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#DCE7F2] text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#007DB8] shadow-sm dark:bg-slate-950 dark:border-slate-800 dark:text-white dark:placeholder-slate-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 dark:text-slate-300 font-bold">Description / Work Scope</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Details of defects, corrective maintenance required..."
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#DCE7F2] text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#007DB8] shadow-sm dark:bg-slate-950 dark:border-slate-800 dark:text-white dark:placeholder-slate-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 font-bold">Target Facility *</label>
                  <select
                    required
                    value={form.buildingId}
                    onChange={(e) => setForm({ ...form, buildingId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#DCE7F2] text-slate-900 focus:outline-none focus:border-[#007DB8] shadow-sm dark:bg-slate-950 dark:border-slate-800 dark:text-white"
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
                  <label className="text-slate-700 dark:text-slate-300 font-bold">Assign Technician</label>
                  <select
                    value={form.assignedToId}
                    onChange={(e) => setForm({ ...form, assignedToId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#DCE7F2] text-slate-900 focus:outline-none focus:border-[#007DB8] shadow-sm dark:bg-slate-950 dark:border-slate-800 dark:text-white"
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
                  <label className="text-slate-700 dark:text-slate-300 font-bold">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#DCE7F2] text-slate-900 focus:outline-none focus:border-[#007DB8] shadow-sm dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 font-bold">Due Date</label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#DCE7F2] text-slate-900 focus:outline-none focus:border-[#007DB8] shadow-sm dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#DCE7F2] dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 font-bold dark:text-slate-400 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl font-bold bg-gradient-to-r from-[#007DB8] to-[#073F8F] hover:from-[#006494] hover:to-[#011F48] text-white disabled:opacity-50 shadow-md"
                >
                  {submitting ? 'Creating...' : 'Create & Assign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
