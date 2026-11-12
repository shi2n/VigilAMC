'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Wrench, X } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { formatBuildingPickerLabel } from '@/lib/buildingUtils';

export interface WorkOrderPrefillData {
  title?: string;
  description?: string;
  buildingId?: string;
  assignedToId?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string;
}

interface CreateWorkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  buildings: any[];
  technicians: any[];
  initialData?: WorkOrderPrefillData | null;
  onCreated: (workOrder: any) => void;
  showToast?: (message: string) => void;
}

export function CreateWorkOrderModal({
  isOpen,
  onClose,
  buildings = [],
  technicians = [],
  initialData = null,
  onCreated,
  showToast,
}: CreateWorkOrderModalProps) {
  const prefersReducedMotion = useReducedMotion();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    buildingId: '',
    assignedToId: '',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
    dueDate: '',
  });

  // Re-populate when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      setForm({
        title: initialData?.title || '',
        description: initialData?.description || '',
        buildingId: initialData?.buildingId || (buildings.length > 0 ? buildings[0].id : ''),
        assignedToId: initialData?.assignedToId || '',
        priority: initialData?.priority || 'MEDIUM',
        dueDate: initialData?.dueDate || '',
      });
    }
  }, [isOpen, initialData, buildings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.buildingId) {
      const msg = 'Please select a facility for this work order';
      toast.error(msg, { duration: 5500 });
      if (showToast) showToast(msg);
      return;
    }

    setSubmitting(true);
    try {
      // Get auth token if available
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession().catch(() => ({ data: { session: null } }));

      const authHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (session?.access_token) {
        authHeaders['Authorization'] = `Bearer ${session.access_token}`;
      }

      const payload = {
        title: form.title.trim(),
        description: form.description ? form.description.trim() : null,
        buildingId: form.buildingId.trim(),
        assignedToId: form.assignedToId && form.assignedToId.trim() !== '' ? form.assignedToId.trim() : null,
        priority: form.priority,
        dueDate: form.dueDate && form.dueDate.trim() !== '' ? form.dueDate.trim() : null,
      };

      const res = await fetch('/api/work-orders', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error || `Failed to create work order (HTTP ${res.status})`);
      }

      if (json.workOrder) {
        const matchedBuilding = buildings.find((b) => b.id === payload.buildingId);
        const matchedTech = technicians.find((t) => t.id === payload.assignedToId);
        const populatedWO = {
          ...json.workOrder,
          building:
            json.workOrder.building ||
            (matchedBuilding ? { id: matchedBuilding.id, name: matchedBuilding.name } : undefined),
          assignedTo:
            json.workOrder.assignedTo ||
            (matchedTech ? { id: matchedTech.id, fullName: matchedTech.fullName } : undefined),
        };
        onCreated(populatedWO);
      }

      const successMsg = `Work order "${form.title}" created successfully`;
      toast.success(successMsg);
      if (showToast) showToast(successMsg);
      onClose();
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to create work order';
      toast.error(errorMsg, { duration: 5500 });
      if (showToast) showToast(errorMsg);
      // Stay OPEN on failure as required by error handling guidelines
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget && !submitting) onClose();
        }}
      >
        <motion.div
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="bg-white border border-[#FED7AA] rounded-2xl max-w-lg w-full p-6 shadow-[0_16px_48px_rgba(28,25,23,0.16)] space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#FED7AA]">
            <div className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-[#C2410C]" />
              <h3 className="text-base font-bold text-[#1C1917]">Create Work Order</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="text-slate-400 hover:text-[#1C1917] rounded-lg p-1 hover:bg-[#FFF0E6] transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <label className="text-slate-700 font-bold">Title *</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Overdue refill on 3rd floor extinguisher"
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
                      {formatBuildingPickerLabel(b, buildings)}
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
                      {t.fullName || t.email}
                      {t.employeeId && t.employeeId !== '—' ? ` · ${t.employeeId}` : ''} ({t.status || 'ACTIVE'})
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
                  onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
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
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 rounded-xl text-slate-600 hover:text-[#1C1917] font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl font-bold bg-gradient-to-r from-[#EA580C] to-[#C2410C] hover:from-[#C2410C] hover:to-[#9A3412] text-white disabled:opacity-50 shadow-sm transition-all"
              >
                {submitting ? 'Creating...' : 'Create & Assign'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
