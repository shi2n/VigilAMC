'use client';

import React, { useState, useMemo } from 'react';
import {
  CalendarClock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  ExternalLink,
  Clock,
} from 'lucide-react';
import type { AdminDictionary } from '@/lib/i18n/admin';
import { calendarDayDiff, fromDbDate, todayCalendarDateString, parseCalendarDate } from '@/lib/dates';

interface ExpiryRadarViewProps {
  equipments: any[];
  workOrders: any[];
  showToast: (msg: string) => void;
  onRefreshDashboard: () => Promise<void> | void;
  onNavigateToWorkOrders: () => void;
  t: AdminDictionary;
}

export function ExpiryRadarView({
  equipments,
  workOrders,
  showToast,
  onRefreshDashboard,
  onNavigateToWorkOrders,
  t,
}: ExpiryRadarViewProps) {
  const [windowDays, setWindowDays] = useState<30 | 60 | 90>(90);
  const [segmentFilter, setSegmentFilter] = useState<'ALL_WINDOW' | 'DUE_30' | 'DUE_90' | 'OVERDUE'>('ALL_WINDOW');
  const [schedulingId, setSchedulingId] = useState<string | null>(null);
  const [locallyScheduledIds, setLocallyScheduledIds] = useState<string[]>([]);

  const openTaskEquipmentIds = useMemo(() => {
    const set = new Set<string>(locallyScheduledIds);
    for (const wo of workOrders || []) {
      if (
        wo?.equipmentId &&
        ['OPEN', 'ASSIGNED', 'IN_PROGRESS'].includes(String(wo.status || 'OPEN'))
      ) {
        set.add(wo.equipmentId);
      }
    }
    return set;
  }, [workOrders, locallyScheduledIds]);

  const evaluatedRows = useMemo(() => {
    const todayStr = todayCalendarDateString();
    return (equipments || [])
      .map((eq: any) => {
        const dueRaw = eq.nextDueDate || eq.refillDueDate || eq.hydroDueDate;
        const dueCalStr = dueRaw ? fromDbDate(dueRaw) : null;
        const diffDays = dueCalStr
          ? calendarDayDiff(dueCalStr, todayStr)
          : null;
        const monthKey = dueCalStr
          ? (() => {
              const cal = parseCalendarDate(dueCalStr);
              if (!cal) return 'Unscheduled Due Date';
              const mNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
              return `${mNames[cal.month - 1]} ${cal.year}`;
            })()
          : 'Unscheduled Due Date';
        return {
          ...eq,
          parsedDueDate: dueRaw ? new Date(dueRaw) : null,
          diffDays,
          monthKey,
        };
      })
      .sort((a, b) => {
        const da = a.diffDays ?? 999999;
        const db = b.diffDays ?? 999999;
        return da - db;
      });
  }, [equipments]);

  const counts = useMemo(() => {
    let overdue = 0;
    let due30 = 0;
    let due60 = 0;
    let due90 = 0;

    for (const r of evaluatedRows) {
      if (r.diffDays === null) continue;
      if (r.diffDays < 0) overdue++;
      if (r.diffDays >= 0 && r.diffDays <= 30) due30++;
      if (r.diffDays >= 0 && r.diffDays <= 60) due60++;
      if (r.diffDays >= 0 && r.diffDays <= 90) due90++;
    }
    return { overdue, due30, due60, due90 };
  }, [evaluatedRows]);

  const filteredRows = useMemo(() => {
    return evaluatedRows.filter((r) => {
      if (r.diffDays === null) return false;
      if (segmentFilter === 'OVERDUE') return r.diffDays < 0;
      if (segmentFilter === 'DUE_30') return r.diffDays >= 0 && r.diffDays <= 30;
      if (segmentFilter === 'DUE_90') return r.diffDays >= 0 && r.diffDays <= 90;
      // Default: show overdue + items within selected windowDays (30 / 60 / 90)
      return r.diffDays <= windowDays;
    });
  }, [evaluatedRows, segmentFilter, windowDays]);

  const groupedByMonth = useMemo(() => {
    const groups: Array<{ month: string; rows: any[] }> = [];
    const map = new Map<string, any[]>();
    for (const row of filteredRows) {
      const key = row.diffDays < 0 ? `Overdue (${row.monthKey})` : row.monthKey;
      if (!map.has(key)) {
        const arr: any[] = [];
        map.set(key, arr);
        groups.push({ month: key, rows: arr });
      }
      map.get(key)!.push(row);
    }
    return groups;
  }, [filteredRows]);

  const handleScheduleVisit = async (eq: any) => {
    if (openTaskEquipmentIds.has(eq.id)) return;
    setSchedulingId(eq.id);
    setLocallyScheduledIds((prev) => [...prev, eq.id]);

    try {
      const res = await fetch('/api/admin/compliance-cycles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ equipmentId: eq.id }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setLocallyScheduledIds((prev) => prev.filter((id) => id !== eq.id));
        showToast(json.error || 'Failed to schedule visit');
        return;
      }
      showToast(`Visit scheduled (OPEN) for ${eq.qrCode}!`);
      await onRefreshDashboard();
    } catch (err: any) {
      setLocallyScheduledIds((prev) => prev.filter((id) => id !== eq.id));
      showToast(err?.message || 'Network error scheduling visit');
    } finally {
      setSchedulingId(null);
    }
  };

  return (
    <div className="space-y-5" data-testid="module-d-expiry-radar">
      {/* Header & 30 / 60 / 90 Day Horizon Toggle */}
      <div className="glass-panel-dense p-5 rounded-2xl border border-[#FED7AA] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[#1C1917] flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-[#C2410C]" />
            <span>{t.radarTitle}</span>
          </h2>
          <p className="text-xs text-[#44403C] mt-0.5">{t.radarSubtitle}</p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-[#FFF8F2] rounded-xl border border-[#FED7AA] text-xs self-start lg:self-auto">
          {([30, 60, 90] as const).map((days) => (
            <button
              key={days}
              type="button"
              data-testid={`radar-window-${days}`}
              onClick={() => {
                setWindowDays(days);
                setSegmentFilter('ALL_WINDOW');
              }}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                windowDays === days && segmentFilter === 'ALL_WINDOW'
                  ? 'bg-[#C2410C] text-white shadow-xs'
                  : 'text-[#44403C] hover:text-[#1C1917]'
              }`}
            >
              {days} Days
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Summary Strip (Module D3) */}
      <div
        data-testid="radar-summary-strip"
        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
      >
        <button
          type="button"
          data-testid="radar-segment-30d"
          onClick={() => setSegmentFilter(segmentFilter === 'DUE_30' ? 'ALL_WINDOW' : 'DUE_30')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            segmentFilter === 'DUE_30'
              ? 'bg-amber-50 border-[#D97706] ring-2 ring-[#D97706]/25'
              : 'bg-white border-[#FED7AA] hover:border-[#D97706]'
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#D97706]">
            Due in 30 Days
          </div>
          <div className="text-2xl font-black text-[#1C1917] tabular-nums mt-1">
            {counts.due30} <span className="text-xs font-semibold text-[#44403C]">due in 30 days</span>
          </div>
        </button>

        <button
          type="button"
          data-testid="radar-segment-90d"
          onClick={() => setSegmentFilter(segmentFilter === 'DUE_90' ? 'ALL_WINDOW' : 'DUE_90')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            segmentFilter === 'DUE_90'
              ? 'bg-[#FFF0E6] border-[#C2410C] ring-2 ring-[#C2410C]/25'
              : 'bg-white border-[#FED7AA] hover:border-[#C2410C]'
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#C2410C]">
            Due in 90 Days
          </div>
          <div className="text-2xl font-black text-[#1C1917] tabular-nums mt-1">
            {counts.due90} <span className="text-xs font-semibold text-[#44403C]">due in 90 days</span>
          </div>
        </button>

        <button
          type="button"
          data-testid="radar-segment-overdue"
          onClick={() => setSegmentFilter(segmentFilter === 'OVERDUE' ? 'ALL_WINDOW' : 'OVERDUE')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            segmentFilter === 'OVERDUE'
              ? 'bg-rose-50 border-[#DC2626] ring-2 ring-[#DC2626]/25'
              : 'bg-white border-[#FED7AA] hover:border-[#DC2626]'
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#DC2626]">
            Overdue Now
          </div>
          <div className="text-2xl font-black text-[#DC2626] tabular-nums mt-1">
            {counts.overdue} <span className="text-xs font-semibold text-[#44403C]">overdue</span>
          </div>
        </button>
      </div>

      {/* Grouped by Month List */}
      {groupedByMonth.length === 0 ? (
        <div className="bg-white border border-[#FED7AA] rounded-2xl p-12 text-center space-y-2">
          <CheckCircle2 className="w-10 h-10 text-[#059669] mx-auto" />
          <h3 className="text-sm font-bold text-[#1C1917]">No assets expiring in this window</h3>
          <p className="text-xs text-[#44403C]">
            All equipment schedules are clear for the selected horizon.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedByMonth.map((group) => (
            <div
              key={group.month}
              className="bg-white border border-[#FED7AA] rounded-2xl overflow-hidden shadow-xs"
            >
              <div className="px-4 py-3 bg-[#FFF8F2] border-b border-[#FED7AA] flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xs text-[#1C1917]">
                  <Calendar className="w-4 h-4 text-[#C2410C]" />
                  <span>{group.month}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-white border border-[#FED7AA] text-[11px] font-bold text-[#1C1917]">
                  {group.rows.length} asset{group.rows.length === 1 ? '' : 's'}
                </span>
              </div>

              <div className="divide-y divide-[#FED7AA]/60">
                {group.rows.map((eq) => {
                  const isScheduled = openTaskEquipmentIds.has(eq.id);
                  const diff = eq.diffDays ?? 0;
                  const isOverdue = diff < 0;
                  const isUrgent48h = diff >= 0 && diff <= 2;
                  const isWithin30d = diff >= 0 && diff <= 30;

                  const chipCls = isOverdue
                    ? 'bg-rose-50 text-[#DC2626] border-rose-200 font-extrabold'
                    : isUrgent48h || isWithin30d
                    ? 'bg-amber-50 text-[#D97706] border-amber-300 font-bold'
                    : 'bg-[#FFF8F2] text-[#44403C] border-[#FED7AA] font-semibold';

                  const chipLabel = isOverdue
                    ? `${Math.abs(diff)}d overdue`
                    : diff === 0
                    ? 'Due today (≤48h)'
                    : diff <= 2
                    ? `${diff}d left (≤48h DUE SOON)`
                    : `${diff}d left`;

                  return (
                    <div
                      key={eq.id}
                      data-testid={`radar-row-${eq.id}`}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FFF0E6]/35 transition-colors text-xs text-[#1C1917]"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-[#C2410C] bg-[#FFF0E6] px-2 py-0.5 rounded border border-[#FED7AA]">
                            {eq.qrCode}
                          </span>
                          <span className="font-bold text-[#1C1917]">
                            {eq.type} ({eq.capacity})
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] border ${chipCls}`}>
                            {isOverdue ? (
                              <AlertTriangle className="w-3 h-3" />
                            ) : (
                              <Clock className="w-3 h-3" />
                            )}
                            <span>{chipLabel}</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-[#44403C] flex-wrap">
                          <span className="inline-flex items-center gap-1 font-semibold text-[#1C1917]">
                            <Building2 className="w-3.5 h-3.5 text-[#C2410C]" />
                            {eq.building?.name || 'Building'}
                          </span>
                          <span>&bull;</span>
                          <span>Location: {eq.location || 'Main Zone'}</span>
                          <span>&bull;</span>
                          <span>
                            Service Due:{' '}
                            <strong className="text-[#1C1917]">
                              {eq.parsedDueDate
                                ? eq.parsedDueDate.toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })
                                : '—'}
                            </strong>
                          </span>
                          {eq.hydroDueDate && (
                            <>
                              <span>&bull;</span>
                              <span>
                                Next Hydro:{' '}
                                <strong className="text-[#1C1917]">
                                  {new Date(eq.hydroDueDate).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })}
                                </strong>
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {isScheduled ? (
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              disabled
                              data-testid={`radar-scheduled-${eq.id}`}
                              className="px-3 py-1.5 rounded-xl bg-emerald-50 text-[#059669] border border-emerald-200 text-xs font-bold cursor-not-allowed"
                            >
                              {t.radarScheduledBadge}
                            </button>
                            <button
                              type="button"
                              onClick={onNavigateToWorkOrders}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#C2410C] hover:underline cursor-pointer"
                            >
                              <span>View task</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            disabled={schedulingId === eq.id}
                            data-testid={`radar-schedule-btn-${eq.id}`}
                            onClick={() => handleScheduleVisit(eq)}
                            className="px-3.5 py-1.5 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
                          >
                            {schedulingId === eq.id ? 'Scheduling...' : t.radarScheduleVisitBtn}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
