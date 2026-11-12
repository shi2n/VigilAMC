'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Plus,
  Building2,
  Clock,
  Wrench,
  CheckCircle2,
  X,
  ArrowRight,
  Layers,
} from 'lucide-react';
import type { AdminDictionary } from '@/lib/i18n/admin';
import { calendarDayDiff, fromDbDate, todayCalendarDateString } from '@/lib/dates';
import { formatBuildingPickerLabel } from '@/lib/buildingUtils';

const STATUS_STEPS = ['OPEN', 'DISPATCHED', 'REPAIRED', 'VERIFIED', 'CLOSED'] as const;
type CorrectiveStatus = (typeof STATUS_STEPS)[number];

interface CorrectiveActionsBoardProps {
  initialActions: any[];
  buildings: any[];
  equipments: any[];
  technicians: any[];
  showToast: (msg: string) => void;
  onRefreshDashboard: () => Promise<void> | void;
  prefillFinding?: {
    buildingId: string;
    equipmentId?: string;
    inspectionId?: string;
    assetRef?: string;
    title: string;
    description: string;
  } | null;
  onClearPrefill?: () => void;
  t: AdminDictionary;
}

function computeAgeDays(openedAt: string | Date, closedAt?: string | Date | null): number {
  if (!openedAt) return 0;
  const startStr = fromDbDate(openedAt);
  const endStr = closedAt ? fromDbDate(closedAt) : todayCalendarDateString();
  const diff = calendarDayDiff(endStr, startStr);
  return Math.max(0, diff);
}

export function CorrectiveActionsBoard({
  initialActions,
  buildings,
  equipments,
  technicians,
  showToast,
  onRefreshDashboard,
  prefillFinding,
  onClearPrefill,
  t,
}: CorrectiveActionsBoardProps) {
  const [actions, setActions] = useState<any[]>(initialActions || []);
  const [statusFilter, setStatusFilter] = useState<'ALL' | CorrectiveStatus>('ALL');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    buildingId: '',
    equipmentId: '',
    inspectionId: '',
    assetRef: '',
    title: '',
    description: '',
    severity: 'HIGH',
    assignedToUserId: '',
  });

  // Workshop dispatch modal
  const [dispatchTarget, setDispatchTarget] = useState<any | null>(null);
  const [workshopNote, setWorkshopNote] = useState('');

  // Close confirmation modal (CLOSED requires confirm + note per B2)
  const [closeTarget, setCloseTarget] = useState<any | null>(null);
  const [closeNote, setCloseNote] = useState('');
  const [closeError, setCloseError] = useState('');

  useEffect(() => {
    if (Array.isArray(initialActions)) {
      setActions(initialActions);
    }
  }, [initialActions]);

  // Open pre-filled modal when "Flag finding" is clicked from Approvals Queue (Module B4)
  useEffect(() => {
    if (prefillFinding) {
      setForm({
        buildingId: prefillFinding.buildingId || buildings[0]?.id || '',
        equipmentId: prefillFinding.equipmentId || '',
        inspectionId: prefillFinding.inspectionId || '',
        assetRef: prefillFinding.assetRef || '',
        title: prefillFinding.title || '',
        description: prefillFinding.description || '',
        severity: 'HIGH',
        assignedToUserId: '',
      });
      setCreateModalOpen(true);
      if (onClearPrefill) onClearPrefill();
    }
  }, [prefillFinding, buildings, onClearPrefill]);

  const handleCreateFinding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.buildingId || !form.title.trim()) {
      showToast('Building and Title are required');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/admin/corrective-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(json.error || 'Failed to create corrective action');
        return;
      }
      setActions((prev) => [json.correctiveAction, ...prev]);
      setCreateModalOpen(false);
      setForm({
        buildingId: '',
        equipmentId: '',
        inspectionId: '',
        assetRef: '',
        title: '',
        description: '',
        severity: 'HIGH',
        assignedToUserId: '',
      });
      showToast('Corrective action created on Findings board!');
      await onRefreshDashboard();
    } catch (err: any) {
      showToast(err?.message || 'Network error creating finding');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTransitionStatus = async (
    item: any,
    nextStatus: CorrectiveStatus,
    extra: { workshopNote?: string; closeNote?: string } = {}
  ) => {
    if (nextStatus === 'CLOSED' && !extra.closeNote) {
      setCloseTarget(item);
      setCloseNote('');
      setCloseError('');
      return;
    }

    if (nextStatus === 'DISPATCHED' && extra.workshopNote === undefined && !dispatchTarget) {
      setDispatchTarget(item);
      setWorkshopNote(item.workshopNote || 'Sent cylinder / assembly to central workshop for hydro-test & refill');
      return;
    }

    const snapshot = [...actions];
    setActions((prev) =>
      prev.map((a) =>
        a.id === item.id
          ? {
              ...a,
              status: nextStatus,
              ...(extra.workshopNote ? { workshopNote: extra.workshopNote } : {}),
              ...(extra.closeNote ? { closeNote: extra.closeNote } : {}),
            }
          : a
      )
    );

    try {
      setSubmitting(true);
      const res = await fetch('/api/admin/corrective-actions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          status: nextStatus,
          ...extra,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setActions(snapshot);
        showToast(json.error || 'Failed to update status');
        return;
      }
      setActions((prev) => prev.map((a) => (a.id === item.id ? json.correctiveAction : a)));
      showToast(`Corrective action moved to ${nextStatus}`);
      setDispatchTarget(null);
      setCloseTarget(null);
      await onRefreshDashboard();
    } catch (err: any) {
      setActions(snapshot);
      showToast(err?.message || 'Network error updating status');
    } finally {
      setSubmitting(false);
    }
  };

  const getNextAllowedStatuses = (current: CorrectiveStatus): CorrectiveStatus[] => {
    const idx = STATUS_STEPS.indexOf(current);
    if (idx === -1) return ['OPEN'];
    if (idx >= STATUS_STEPS.length - 1) return [current];
    return [current, STATUS_STEPS[idx + 1]];
  };

  const getAgeBadgeStyle = (days: number, status: string) => {
    if (status === 'CLOSED') {
      return {
        cls: 'bg-emerald-50 text-[#059669] border-emerald-200',
        label: `Closed (${days}d)`,
      };
    }
    if (days >= 15) {
      return {
        cls: 'bg-rose-50 text-[#DC2626] border-[#DC2626]/40 font-extrabold',
        label: `${days}d open`,
      };
    }
    if (days >= 7) {
      return {
        cls: 'bg-amber-50 text-[#D97706] border-[#D97706]/40 font-bold',
        label: `${days}d open`,
      };
    }
    return {
      cls: 'bg-[#FFF8F2] text-[#44403C] border-[#FED7AA] font-semibold',
      label: `${days}d open`,
    };
  };

  const getSeverityBadge = (severity: string) => {
    const s = String(severity || 'MEDIUM').toUpperCase();
    if (s === 'HIGH') {
      return 'bg-rose-50 text-[#DC2626] border-rose-200';
    }
    if (s === 'MEDIUM') {
      return 'bg-amber-50 text-[#D97706] border-amber-300';
    }
    return 'bg-[#FFF8F2] text-[#44403C] border-[#FED7AA]';
  };

  const columnsToRender =
    statusFilter === 'ALL' ? STATUS_STEPS : ([statusFilter] as readonly CorrectiveStatus[]);

  const matchingBuildingEquipments = form.buildingId
    ? equipments.filter((e: any) => e.buildingId === form.buildingId)
    : equipments;

  return (
    <div className="space-y-5" data-testid="module-b-corrective-actions-board">
      {/* Header Bar */}
      <div className="glass-panel-dense p-5 rounded-2xl border border-[#FED7AA] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[#1C1917]">{t.findingsBoardTitle}</h2>
          <p className="text-xs text-[#44403C] mt-0.5">{t.findingsBoardSubtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-[#FFF8F2] rounded-xl border border-[#FED7AA] text-xs overflow-x-auto">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                statusFilter === 'ALL'
                  ? 'bg-[#C2410C] text-white shadow-xs'
                  : 'text-[#44403C] hover:text-[#1C1917]'
              }`}
            >
              All ({actions.length})
            </button>
            {STATUS_STEPS.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-[#1C1917] text-white shadow-xs'
                    : 'text-[#44403C] hover:text-[#1C1917]'
                }`}
              >
                {st} ({actions.filter((a) => a.status === st).length})
              </button>
            ))}
          </div>

          <button
            type="button"
            data-testid="new-finding-btn"
            onClick={() => {
              setForm({
                buildingId: buildings[0]?.id || '',
                equipmentId: '',
                inspectionId: '',
                assetRef: '',
                title: '',
                description: '',
                severity: 'HIGH',
                assignedToUserId: '',
              });
              setCreateModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t.findingsNewBtn}</span>
          </button>
        </div>
      </div>

      {/* Kanban Board Grid */}
      <div
        className={`grid gap-4 ${
          columnsToRender.length === 1
            ? 'grid-cols-1'
            : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-5'
        }`}
      >
        {columnsToRender.map((colStatus) => {
          const colItems = actions.filter((a) => (a.status || 'OPEN') === colStatus);
          return (
            <div
              key={colStatus}
              data-testid={`kanban-col-${colStatus}`}
              className="bg-white/90 border border-[#FED7AA] rounded-2xl p-3.5 flex flex-col gap-3 min-h-[260px] shadow-xs"
            >
              <div className="flex items-center justify-between pb-2.5 border-b border-[#FED7AA]">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      colStatus === 'CLOSED'
                        ? 'bg-[#059669]'
                        : colStatus === 'VERIFIED'
                        ? 'bg-emerald-500'
                        : colStatus === 'REPAIRED'
                        ? 'bg-amber-500'
                        : colStatus === 'DISPATCHED'
                        ? 'bg-[#EA580C]'
                        : 'bg-[#DC2626]'
                    }`}
                  />
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#1C1917]">
                    {colStatus}
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#FFF8F2] border border-[#FED7AA] text-[11px] font-bold text-[#1C1917] tabular-nums">
                  {colItems.length}
                </span>
              </div>

              {colItems.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-8 px-2 text-[#44403C]">
                  <p className="text-[11px] font-medium">No items in {colStatus}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {colItems.map((item) => {
                    const ageDays = computeAgeDays(item.openedAt, item.closedAt);
                    const ageBadge = getAgeBadgeStyle(ageDays, item.status);
                    const allowedOptions = getNextAllowedStatuses(item.status as CorrectiveStatus);

                    return (
                      <div
                        key={item.id}
                        data-testid={`finding-card-${item.id}`}
                        className="p-3.5 rounded-xl bg-[#FFF8F2] border border-[#FED7AA] hover:border-[#C2410C]/50 transition-all space-y-2.5 shadow-2xs text-xs text-[#1C1917]"
                      >
                        {/* Top row: Severity + Age Badge */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span
                            className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${getSeverityBadge(
                              item.severity
                            )}`}
                          >
                            {item.severity}
                          </span>
                          <span
                            data-testid={`finding-age-badge-${item.id}`}
                            className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border ${ageBadge.cls}`}
                          >
                            <Clock className="w-3 h-3" />
                            <span>{ageBadge.label}</span>
                          </span>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h4 className="font-bold text-xs text-[#1C1917] leading-snug">
                            {item.title}
                          </h4>
                          {item.description && (
                            <p className="text-[11px] text-[#44403C] mt-1 line-clamp-2">
                              {item.description}
                            </p>
                          )}
                        </div>

                        {/* Building & Asset Ref */}
                        <div className="text-[11px] text-[#44403C] space-y-1 pt-1 border-t border-[#FED7AA]/60">
                          <div className="flex items-center gap-1.5 font-semibold text-[#1C1917]">
                            <Building2 className="w-3.5 h-3.5 text-[#C2410C] shrink-0" />
                            <span className="truncate">{item.building?.name || 'Facility'}</span>
                          </div>
                          {(item.assetRef || item.equipment?.qrCode) && (
                            <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#C2410C] font-bold">
                              <Layers className="w-3 h-3 shrink-0" />
                              <span>{item.assetRef || item.equipment?.qrCode}</span>
                            </div>
                          )}
                          {item.workshopNote && (
                            <div className="p-2 rounded-lg bg-white border border-[#FED7AA] text-[10px] text-[#1C1917]">
                              <strong className="text-[#C2410C]">Workshop:</strong>{' '}
                              {item.workshopNote}
                            </div>
                          )}
                          {item.closeNote && (
                            <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-[10px] text-[#059669]">
                              <strong>Verified Closure:</strong> {item.closeNote}
                            </div>
                          )}
                        </div>

                        {/* Status Transition Controls */}
                        <div className="pt-2 border-t border-[#FED7AA]/60 flex items-center justify-between gap-2">
                          {item.status === 'OPEN' && (
                            <button
                              type="button"
                              onClick={() => {
                                setDispatchTarget(item);
                                setWorkshopNote(
                                  item.workshopNote ||
                                    'Dispatched cylinder to central workshop for hydro-test & refill'
                                );
                              }}
                              data-testid={`send-workshop-btn-${item.id}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#FFF0E6] hover:bg-[#FED7AA] text-[#C2410C] border border-[#FED7AA] text-[10px] font-bold transition-all cursor-pointer"
                            >
                              <Wrench className="w-3 h-3" />
                              <span>{t.findingsSendWorkshopBtn}</span>
                            </button>
                          )}

                          <select
                            aria-label={`Transition status for ${item.title}`}
                            data-testid={`finding-status-select-${item.id}`}
                            value={item.status}
                            disabled={item.status === 'CLOSED' || submitting}
                            onChange={(e) =>
                              handleTransitionStatus(
                                item,
                                e.target.value as CorrectiveStatus
                              )
                            }
                            className="ml-auto px-2.5 py-1.5 rounded-lg bg-white border border-[#FED7AA] text-[11px] font-bold text-[#1C1917] focus:outline-none focus:border-[#C2410C]"
                          >
                            {allowedOptions.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt === item.status ? `${opt} (Current)` : `Advance → ${opt}`}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Create Corrective Action Modal */}
      {createModalOpen && (
        <div
          data-testid="create-finding-modal"
          className="fixed inset-0 z-50 bg-[#1C1917]/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white border border-[#FED7AA] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs text-[#1C1917]">
            <div className="flex items-center justify-between pb-3 border-b border-[#FED7AA]">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#C2410C]" />
                <h3 className="text-base font-bold text-[#1C1917]">Log Corrective Action Finding</h3>
              </div>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded-lg text-[#44403C] hover:text-[#1C1917] hover:bg-[#FFF0E6]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFinding} className="space-y-3">
              <div>
                <label className="block font-bold text-[#1C1917] mb-1">Building / Site *</label>
                <select
                  required
                  value={form.buildingId}
                  onChange={(e) => {
                    setForm({ ...form, buildingId: e.target.value, equipmentId: '' });
                  }}
                  className="w-full rounded-xl bg-white border border-[#FED7AA] p-2.5 text-[#1C1917]"
                >
                  <option value="">Select Building...</option>
                  {buildings.map((b: any) => (
                    <option key={b.id} value={b.id}>
                      {formatBuildingPickerLabel(b, buildings)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-[#1C1917] mb-1">Asset Reference</label>
                  <select
                    value={form.equipmentId}
                    onChange={(e) => {
                      const eq = matchingBuildingEquipments.find(
                        (x: any) => x.id === e.target.value
                      );
                      setForm({
                        ...form,
                        equipmentId: e.target.value,
                        assetRef: eq ? eq.qrCode : form.assetRef,
                      });
                    }}
                    className="w-full rounded-xl bg-white border border-[#FED7AA] p-2.5 text-[#1C1917]"
                  >
                    <option value="">Select Asset (Optional)...</option>
                    {matchingBuildingEquipments.map((eq: any) => (
                      <option key={eq.id} value={eq.id}>
                        {eq.qrCode} — {eq.type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#1C1917] mb-1">Severity *</label>
                  <select
                    value={form.severity}
                    onChange={(e) => setForm({ ...form, severity: e.target.value })}
                    className="w-full rounded-xl bg-white border border-[#FED7AA] p-2.5 text-[#1C1917]"
                  >
                    <option value="HIGH">HIGH (Critical)</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#1C1917] mb-1">Finding Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Corroded discharge hose & low gauge pressure on FE-104"
                  className="w-full rounded-xl bg-white border border-[#FED7AA] p-2.5 text-[#1C1917]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1C1917] mb-1">Description / Defect Details</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Observations, location details, and recommended corrective action..."
                  className="w-full rounded-xl bg-white border border-[#FED7AA] p-2.5 text-[#1C1917]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1C1917] mb-1">Assign Technician (Optional)</label>
                <select
                  value={form.assignedToUserId}
                  onChange={(e) => setForm({ ...form, assignedToUserId: e.target.value })}
                  className="w-full rounded-xl bg-white border border-[#FED7AA] p-2.5 text-[#1C1917]"
                >
                  <option value="">Unassigned</option>
                  {technicians.map((tech: any) => (
                    <option key={tech.id} value={tech.id}>
                      {tech.fullName || tech.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#FED7AA]">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#FFF8F2] text-[#44403C] hover:text-[#1C1917] font-bold border border-[#FED7AA]"
                >
                  {t.actionCancel}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  data-testid="submit-finding-btn"
                  className="px-4 py-2 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold shadow-xs"
                >
                  {submitting ? 'Creating...' : 'Create Finding'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Send to Workshop (DISPATCHED) Modal */}
      {dispatchTarget && (
        <div
          data-testid="send-workshop-modal"
          className="fixed inset-0 z-50 bg-[#1C1917]/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white border border-[#FED7AA] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs text-[#1C1917]">
            <div className="flex items-center justify-between pb-3 border-b border-[#FED7AA]">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-[#C2410C]" />
                <h3 className="text-base font-bold text-[#1C1917]">Dispatch to Workshop</h3>
              </div>
              <button
                type="button"
                onClick={() => setDispatchTarget(null)}
                className="p-1 rounded-lg text-[#44403C] hover:text-[#1C1917]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block font-bold text-[#1C1917]">Workshop Dispatch Note *</label>
              <textarea
                rows={3}
                value={workshopNote}
                onChange={(e) => setWorkshopNote(e.target.value)}
                placeholder="e.g. Picked up cylinder for 6kg ABC powder refill and gauge replacement at Okhla Workshop"
                className="w-full rounded-xl bg-white border border-[#FED7AA] p-3 text-[#1C1917]"
              />
              <div className="flex justify-end gap-2 pt-2 border-t border-[#FED7AA]">
                <button
                  type="button"
                  onClick={() => setDispatchTarget(null)}
                  className="px-4 py-2 rounded-xl bg-[#FFF8F2] text-[#44403C] font-bold border border-[#FED7AA]"
                >
                  {t.actionCancel}
                </button>
                <button
                  type="button"
                  data-testid="confirm-dispatch-btn"
                  disabled={submitting || !workshopNote.trim()}
                  onClick={() =>
                    handleTransitionStatus(dispatchTarget, 'DISPATCHED', {
                      workshopNote: workshopNote.trim(),
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold shadow-xs"
                >
                  <span>Dispatch Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Close Confirmation Modal (CLOSED requires confirm + note per B2) */}
      {closeTarget && (
        <div
          data-testid="close-finding-modal"
          className="fixed inset-0 z-50 bg-[#1C1917]/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white border border-[#FED7AA] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs text-[#1C1917]">
            <div className="flex items-center justify-between pb-3 border-b border-[#FED7AA]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#059669]" />
                <h3 className="text-base font-bold text-[#1C1917]">{t.findingsCloseConfirmTitle}</h3>
              </div>
              <button
                type="button"
                onClick={() => setCloseTarget(null)}
                className="p-1 rounded-lg text-[#44403C] hover:text-[#1C1917]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block font-bold text-[#1C1917]">{t.findingsCloseNoteLabel} *</label>
              <textarea
                rows={3}
                value={closeNote}
                onChange={(e) => {
                  setCloseNote(e.target.value);
                  if (closeError) setCloseError('');
                }}
                placeholder="e.g. Re-installed refilled extinguisher at site, pressure verified at 14.5 bar green zone."
                className="w-full rounded-xl bg-white border border-[#FED7AA] p-3 text-[#1C1917]"
              />
              {closeError && <p className="text-[11px] font-bold text-[#DC2626]">{closeError}</p>}

              <div className="flex justify-end gap-2 pt-2 border-t border-[#FED7AA]">
                <button
                  type="button"
                  onClick={() => setCloseTarget(null)}
                  className="px-4 py-2 rounded-xl bg-[#FFF8F2] text-[#44403C] font-bold border border-[#FED7AA]"
                >
                  {t.actionCancel}
                </button>
                <button
                  type="button"
                  data-testid="confirm-close-finding-btn"
                  disabled={submitting}
                  onClick={() => {
                    if (!closeNote.trim()) {
                      setCloseError('Verification note is required to close this corrective action.');
                      return;
                    }
                    handleTransitionStatus(closeTarget, 'CLOSED', {
                      closeNote: closeNote.trim(),
                    });
                  }}
                  className="px-4 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold shadow-xs"
                >
                  Confirm &amp; Close Finding
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
