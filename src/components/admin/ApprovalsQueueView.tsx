'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  RotateCcw,
  AlertTriangle,
  Building2,
  User,
  Camera,
  Calendar,
  Flag,
  X,
  ShieldCheck,
} from 'lucide-react';
import type { AdminDictionary } from '@/lib/i18n/admin';

interface ApprovalsQueueViewProps {
  inspections: any[];
  onRefreshDashboard: () => Promise<void> | void;
  showToast: (msg: string) => void;
  /** Optional: Corrective Action flagging (hidden in UI when omitted). */
  onFlagFinding?: (prefill: {
    buildingId: string;
    equipmentId?: string;
    inspectionId?: string;
    assetRef?: string;
    title: string;
    description: string;
  }) => void;
  t: AdminDictionary;
}

function getAllPhotoUrls(ins: any): string[] {
  const urls: string[] = [];
  if (Array.isArray(ins?.inspectionPhotos)) {
    for (const p of ins.inspectionPhotos) {
      if (p?.photoUrl && !urls.includes(p.photoUrl)) urls.push(p.photoUrl);
    }
  }
  if (ins?.photos) {
    if (Array.isArray(ins.photos)) {
      for (const u of ins.photos) {
        if (typeof u === 'string' && !urls.includes(u)) urls.push(u);
      }
    } else if (typeof ins.photos === 'string') {
      try {
        const parsed = JSON.parse(ins.photos);
        if (Array.isArray(parsed)) {
          for (const u of parsed) {
            if (typeof u === 'string' && !urls.includes(u)) urls.push(u);
          }
        }
      } catch {
        if (
          (ins.photos.startsWith('http') || ins.photos.startsWith('data:image/')) &&
          !urls.includes(ins.photos)
        ) {
          urls.push(ins.photos);
        }
      }
    }
  }
  return urls;
}

export function ApprovalsQueueView({
  inspections: initialInspections,
  onRefreshDashboard,
  showToast,
  onFlagFinding,
  t,
}: ApprovalsQueueViewProps) {
  const [items, setItems] = useState<any[]>(initialInspections || []);
  const [filter, setFilter] = useState<'PENDING' | 'APPROVED' | 'RETURNED' | 'ALL'>('PENDING');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Return-with-note modal state
  const [returnTarget, setReturnTarget] = useState<any | null>(null);
  const [returnNote, setReturnNote] = useState('');
  const [returnError, setReturnError] = useState('');

  useEffect(() => {
    if (Array.isArray(initialInspections)) {
      setItems(initialInspections);
    }
  }, [initialInspections]);

  const pendingItems = items.filter((i) => (i.approvalStatus || 'PENDING') === 'PENDING');
  const approvedItems = items.filter((i) => i.approvalStatus === 'APPROVED');
  const returnedItems = items.filter((i) => i.approvalStatus === 'RETURNED');

  const visibleItems = items.filter((i) => {
    const st = i.approvalStatus || 'PENDING';
    if (filter === 'ALL') return true;
    return st === filter;
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAllPending = () => {
    const visiblePendingIds = visibleItems
      .filter((i) => (i.approvalStatus || 'PENDING') === 'PENDING')
      .map((i) => i.id);
    if (visiblePendingIds.length === 0) return;
    const allSelected = visiblePendingIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !visiblePendingIds.includes(id)));
    } else {
      setSelectedIds(Array.from(new Set([...selectedIds, ...visiblePendingIds])));
    }
  };

  const handleApprove = async (idsToApprove: string[]) => {
    if (idsToApprove.length === 0) return;
    const snapshot = [...items];
    // Optimistic update
    setItems((prev) =>
      prev.map((row) =>
        idsToApprove.includes(row.id)
          ? { ...row, approvalStatus: 'APPROVED', approvedAt: new Date().toISOString() }
          : row
      )
    );
    setSelectedIds((prev) => prev.filter((id) => !idsToApprove.includes(id)));

    try {
      setSubmitting(true);
      const res = await fetch('/api/admin/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'APPROVE',
          inspectionIds: idsToApprove,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setItems(snapshot);
        showToast(json.error || 'Failed to approve inspection(s)');
        return;
      }
      showToast(
        idsToApprove.length === 1
          ? 'Inspection approved for Form-B report!'
          : `${idsToApprove.length} inspections approved!`
      );
      await onRefreshDashboard();
    } catch (err: any) {
      setItems(snapshot);
      showToast(err?.message || 'Network error while approving inspection');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnTarget) return;
    const cleanNote = returnNote.trim();
    if (!cleanNote) {
      setReturnError('Please enter a note explaining why this inspection is being returned.');
      return;
    }

    const snapshot = [...items];
    setItems((prev) =>
      prev.map((row) =>
        row.id === returnTarget.id
          ? { ...row, approvalStatus: 'RETURNED', approvalNote: cleanNote }
          : row
      )
    );

    try {
      setSubmitting(true);
      const res = await fetch('/api/admin/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'RETURN',
          inspectionId: returnTarget.id,
          note: cleanNote,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setItems(snapshot);
        setReturnError(json.error || 'Failed to return inspection');
        showToast(json.error || 'Failed to return inspection');
        return;
      }
      showToast('Inspection returned & technician notified!');
      setReturnTarget(null);
      setReturnNote('');
      setReturnError('');
      await onRefreshDashboard();
    } catch (err: any) {
      setItems(snapshot);
      setReturnError(err?.message || 'Network error');
      showToast(err?.message || 'Network error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5" data-testid="module-a-approvals-queue">
      {/* Header & Filter Bar */}
      <div className="glass-panel-dense p-5 rounded-2xl border border-[#FED7AA] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[#1C1917]">{t.approvalsQueueTitle}</h2>
          <p className="text-xs text-[#44403C] mt-0.5">{t.approvalsQueueSubtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-[#FFF8F2] rounded-xl border border-[#FED7AA] text-xs">
            <button
              type="button"
              onClick={() => setFilter('PENDING')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                filter === 'PENDING'
                  ? 'bg-[#C2410C] text-white shadow-xs'
                  : 'text-[#44403C] hover:text-[#1C1917]'
              }`}
            >
              Pending ({pendingItems.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('APPROVED')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                filter === 'APPROVED'
                  ? 'bg-[#059669] text-white shadow-xs'
                  : 'text-[#44403C] hover:text-[#1C1917]'
              }`}
            >
              Approved ({approvedItems.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('RETURNED')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                filter === 'RETURNED'
                  ? 'bg-[#DC2626] text-white shadow-xs'
                  : 'text-[#44403C] hover:text-[#1C1917]'
              }`}
            >
              Returned ({returnedItems.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                filter === 'ALL'
                  ? 'bg-[#1C1917] text-white shadow-xs'
                  : 'text-[#44403C] hover:text-[#1C1917]'
              }`}
            >
              {t.filterAll} ({items.length})
            </button>
          </div>

          {selectedIds.length > 0 && (
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleApprove(selectedIds)}
              data-testid="bulk-approve-btn"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold shadow-xs transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>
                {t.approvalsBulkApproveBtn} ({selectedIds.length})
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Queue List */}
      <div className="bg-white border border-[#FED7AA] rounded-2xl overflow-hidden shadow-xs">
        {visibleItems.length === 0 ? (
          <div className="p-12 text-center space-y-3 bg-[#FFF8F2]/60" data-testid="approvals-empty-state">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#059669] mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#1C1917]">{t.approvalsEmptyTitle}</h3>
            <p className="text-xs text-[#44403C] max-w-md mx-auto">{t.approvalsEmptyDesc}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[850px]">
              <thead>
                <tr className="bg-[#FFF8F2] border-b border-[#FED7AA] text-[#1C1917] uppercase tracking-wider text-[10px] font-bold">
                  <th className="py-3.5 px-3 w-8 text-center">
                    <input
                      type="checkbox"
                      aria-label="Select all pending inspections"
                      checked={
                        visibleItems.some((i) => (i.approvalStatus || 'PENDING') === 'PENDING') &&
                        visibleItems
                          .filter((i) => (i.approvalStatus || 'PENDING') === 'PENDING')
                          .every((i) => selectedIds.includes(i.id))
                      }
                      onChange={toggleSelectAllPending}
                      className="rounded border-[#FED7AA] text-[#C2410C] focus:ring-[#C2410C]"
                    />
                  </th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Building &amp; Asset</th>
                  <th className="py-3.5 px-4">Technician</th>
                  <th className="py-3.5 px-4">Photos &amp; Evidence</th>
                  <th className="py-3.5 px-4">Approval Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FED7AA]/60 text-[#1C1917]">
                {visibleItems.map((ins) => {
                  const photos = getAllPhotoUrls(ins);
                  const thumb = photos[0] || null;
                  const approvalSt = ins.approvalStatus || 'PENDING';
                  const isPending = approvalSt === 'PENDING';

                  return (
                    <tr
                      key={ins.id}
                      data-testid={`approval-row-${ins.id}`}
                      className="hover:bg-[#FFF0E6]/50 transition-colors"
                    >
                      <td className="py-3.5 px-3 text-center">
                        {isPending && (
                          <input
                            type="checkbox"
                            aria-label={`Select inspection ${ins.id}`}
                            checked={selectedIds.includes(ins.id)}
                            onChange={() => toggleSelect(ins.id)}
                            className="rounded border-[#FED7AA] text-[#C2410C] focus:ring-[#C2410C]"
                          />
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-[#44403C] whitespace-nowrap tabular-nums">
                        <div className="flex items-center gap-1.5 font-semibold text-[#1C1917]">
                          <Calendar className="w-3.5 h-3.5 text-[#C2410C]" />
                          <span>
                            {new Date(ins.date || ins.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#1C1917] flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-[#C2410C]" />
                          <span>{ins.building?.name || 'Registered Facility'}</span>
                        </div>
                        <div className="text-[11px] text-[#44403C] mt-0.5">
                          <span className="font-mono font-bold text-[#C2410C]">
                            {ins.equipment?.qrCode || 'General Site Check'}
                          </span>
                          {ins.equipment?.type ? ` • ${ins.equipment.type}` : ''}
                          {ins.remarks ? ` — "${ins.remarks}"` : ''}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1.5 font-semibold text-[#1C1917]">
                          <User className="w-3.5 h-3.5 text-[#C2410C]" />
                          <span>{ins.technicianName || ins.technician?.fullName || 'Field Technician'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          {thumb ? (
                            <a
                              href={thumb}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-[#C2410C] hover:underline font-bold"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={thumb}
                                alt="Inspection proof"
                                className="w-9 h-9 rounded-lg object-cover border border-[#FED7AA]"
                              />
                              <span className="text-[11px]">
                                {photos.length} photo{photos.length === 1 ? '' : 's'}
                              </span>
                            </a>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-[#44403C]">
                              <Camera className="w-3.5 h-3.5 text-[#44403C]" />0 photos
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {approvalSt === 'APPROVED' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#059669] border border-emerald-200 text-[10px] font-bold uppercase">
                            ✓ APPROVED
                          </span>
                        ) : approvalSt === 'RETURNED' ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-[#DC2626] border border-rose-200 text-[10px] font-bold uppercase">
                              ↺ RETURNED
                            </span>
                            {ins.approvalNote && (
                              <div className="text-[10px] text-[#DC2626] font-medium max-w-[180px] truncate" title={ins.approvalNote}>
                                Note: {ins.approvalNote}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-[#D97706] border border-amber-300 text-[10px] font-bold uppercase">
                            ● PENDING REVIEW
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          {approvalSt !== 'APPROVED' && (
                            <button
                              type="button"
                              disabled={submitting}
                              onClick={() => handleApprove([ins.id])}
                              data-testid={`approve-btn-${ins.id}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#059669] hover:bg-[#047857] text-white text-[11px] font-bold shadow-xs transition-all cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{t.approvalsApproveBtn}</span>
                            </button>
                          )}

                          {approvalSt !== 'RETURNED' && (
                            <button
                              type="button"
                              disabled={submitting}
                              onClick={() => {
                                setReturnTarget(ins);
                                setReturnNote('');
                                setReturnError('');
                              }}
                              data-testid={`return-btn-${ins.id}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-[#DC2626] border border-rose-200 text-[11px] font-bold transition-all cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>{t.approvalsReturnBtn}</span>
                            </button>
                          )}

                          {onFlagFinding && (
                          <button
                            type="button"
                            onClick={() =>
                              onFlagFinding({
                                buildingId: ins.buildingId,
                                equipmentId: ins.equipmentId || undefined,
                                inspectionId: ins.id,
                                assetRef: ins.equipment?.qrCode || '',
                                title: `${ins.equipment?.qrCode || 'Asset'} — Field Inspection Finding`,
                                description: `Flagged from inspection on ${new Date(
                                  ins.date || ins.createdAt
                                ).toLocaleDateString('en-IN')} by ${
                                  ins.technicianName || 'Field Technician'
                                }${ins.remarks ? `: ${ins.remarks}` : ''}`,
                              })
                            }
                            data-testid={`flag-finding-btn-${ins.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#FFF0E6] hover:bg-[#FED7AA] text-[#C2410C] border border-[#FED7AA] text-[11px] font-bold transition-all cursor-pointer"
                            title="Create a Corrective Action from this inspection"
                          >
                            <Flag className="w-3.5 h-3.5" />
                            <span>{t.approvalsFlagFindingBtn}</span>
                          </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Return with Note Modal (#DC2626 confirm button per A2) */}
      {returnTarget && (
        <div
          data-testid="return-inspection-modal"
          className="fixed inset-0 z-50 bg-[#1C1917]/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white border border-[#FED7AA] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs text-[#1C1917]">
            <div className="flex items-center justify-between pb-3 border-b border-[#FED7AA]">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#DC2626]" />
                <h3 className="text-base font-bold text-[#1C1917]">{t.approvalsReturnModalTitle}</h3>
              </div>
              <button
                type="button"
                onClick={() => setReturnTarget(null)}
                className="p-1 rounded-lg text-[#44403C] hover:text-[#1C1917] hover:bg-[#FFF0E6]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[#FFF8F2] border border-[#FED7AA] space-y-1">
              <div className="font-bold text-[#1C1917]">
                {returnTarget.building?.name || 'Facility'} —{' '}
                <span className="font-mono text-[#C2410C]">
                  {returnTarget.equipment?.qrCode || 'Site Check'}
                </span>
              </div>
              <div className="text-[#44403C]">
                Technician: <strong>{returnTarget.technicianName || 'Field Technician'}</strong>
              </div>
            </div>

            <form onSubmit={handleConfirmReturn} className="space-y-3">
              <div>
                <label className="block font-bold text-[#1C1917] mb-1">
                  {t.approvalsReturnNoteLabel} *
                </label>
                <textarea
                  rows={3}
                  required
                  value={returnNote}
                  onChange={(e) => {
                    setReturnNote(e.target.value);
                    if (returnError) setReturnError('');
                  }}
                  placeholder="e.g. Pressure gauge photo is blurry — please re-capture clear gauge reading and seal."
                  className="w-full rounded-xl bg-white border border-[#FED7AA] p-3 text-[#1C1917] placeholder-[#44403C]/60 focus:outline-none focus:border-[#C2410C]"
                />
                {returnError && (
                  <p className="text-[11px] font-bold text-[#DC2626] mt-1">{returnError}</p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#FED7AA]">
                <button
                  type="button"
                  onClick={() => setReturnTarget(null)}
                  className="px-4 py-2 rounded-xl bg-[#FFF8F2] text-[#44403C] hover:text-[#1C1917] font-bold border border-[#FED7AA]"
                >
                  {t.actionCancel}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  data-testid="confirm-return-btn"
                  className="px-4 py-2 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold shadow-xs disabled:opacity-50 transition-all"
                >
                  {submitting ? 'Returning...' : t.approvalsReturnConfirmBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
