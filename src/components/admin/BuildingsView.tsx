'use client';

import React from 'react';
import { formatCalendarDate, getCalendarDayDiff, getCalendarMonthDiff } from '@/lib/dateUtils';
import Link from 'next/link';
import {
  Building2,
  Plus,
  ChevronDown,
  ChevronRight,
  FileText,
  MapPin,
  Edit,
  Trash2,
  FileSpreadsheet,
  Layers,
  Mail,
  MoreHorizontal,
} from 'lucide-react';
import { EmailOverdueModal } from './EmailOverdueModal';

interface BuildingsViewProps {
  buildings: any[];
  summary: {
    totalBuildings: number;
    totalEquipments: number;
    compliantBuildings: number;
    dueSoonBuildings: number;
    overdueBuildings: number;
  };
  expandedBuildingId: string | null;
  setExpandedBuildingId: (id: string | null) => void;
  onAddBuilding: () => void;
  onEditBuilding: (b: any) => void;
  onDeleteBuilding: (id: string, name: string) => void;
  onBulkAdd: (b: any) => void;
  onSingleAdd: (b: any) => void;
  onOpenExport: () => void;
  onOpenImport?: () => void;
  onEditEquipment?: (eq: any) => void;
  onOpenFloorPlans?: (b: any) => void;
  clientFilterName?: string | null;
  onClearClientFilter?: () => void;
}

export function BuildingsView({
  buildings,
  summary,
  expandedBuildingId,
  setExpandedBuildingId,
  onAddBuilding,
  onEditBuilding,
  onDeleteBuilding,
  onBulkAdd,
  onSingleAdd,
  onOpenExport,
  onOpenImport,
  onEditEquipment,
  onOpenFloorPlans,
  clientFilterName,
  onClearClientFilter,
}: BuildingsViewProps) {
  const [overdueModalBuilding, setOverdueModalBuilding] = React.useState<{
    id: string;
    name: string;
    clientEmail?: string | null;
    clientName?: string | null;
  } | null>(null);
  const [openMoreMenuId, setOpenMoreMenuId] = React.useState<string | null>(null);

  return (
    <div className="space-y-6">
      {clientFilterName && (
        <div
          data-testid="building-client-filter-banner"
          className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#FFF0E6] border border-[#FED7AA] text-xs"
        >
          <span className="font-bold text-[#1C1917]">
            Filtered by Client Portfolio: <strong className="text-[#C2410C]">{clientFilterName}</strong> ({buildings.length} site{buildings.length === 1 ? '' : 's'})
          </span>
          {onClearClientFilter && (
            <button
              type="button"
              onClick={onClearClientFilter}
              className="px-3 py-1 rounded-lg bg-white border border-[#FED7AA] text-[#1C1917] font-bold hover:bg-[#FFF8F2]"
            >
              Show All Buildings
            </button>
          )}
        </div>
      )}
      {/* 4 Status Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 glass-panel-dense rounded-2xl shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Total Buildings
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-[#1C1917]">
              {summary.totalBuildings}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              ({summary.totalEquipments} assets)
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Verified
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-900">
              {(summary as any).verifiedBuildings || summary.compliantBuildings || 0}
            </span>
            <span className="text-xs text-emerald-700/80 font-medium">GPS Verified</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Due Soon (&lt;30d)
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-900">
              {summary.dueSoonBuildings || 0}
            </span>
            <span className="text-xs text-amber-700/80 font-medium">Visit Needed</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            Overdue
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-rose-900">
              {summary.overdueBuildings || 0}
            </span>
            <span className="text-xs text-rose-700/80 font-medium">Action Pending</span>
          </div>
        </div>
      </div>

      {/* Buildings List Card */}
      <div className="glass-panel-dense rounded-2xl shadow-sm overflow-hidden">
        {/* List Header */}
        <div className="p-4 sm:p-5 border-b border-[#FED7AA] bg-slate-50/80 flex items-center justify-between flex-wrap gap-3 ">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-[#C2410C]" />
            <h2 className="text-sm sm:text-base font-bold text-[#1C1917] tracking-tight">
              Managed Buildings &amp; Societies
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#FFF0E6] text-[#C2410C] border border-[#C2410C]/30 text-xs font-semibold">
              {buildings.length} Registered
            </span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {onOpenImport && (
              <button
                onClick={onOpenImport}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFF0E6] hover:bg-[#FED7AA] text-[#C2410C] border border-[#C2410C]/30 text-xs font-bold transition-all shadow-sm"
                title="Import Buildings from Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Import Buildings</span>
              </button>
            )}

            <button
              onClick={onOpenExport}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 border border-emerald-300 text-xs font-bold transition-all shadow-sm"
              title="Export Buildings to Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Excel</span>
            </button>

            <button
              onClick={onAddBuilding}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white text-xs font-bold shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Client &amp; Building</span>
            </button>
          </div>
        </div>

        {/* Building List Rows */}
        {buildings.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-900">No buildings registered yet</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Add your first building society to start tracking asset lifecycles and Form-B filings.
            </p>
            <button
              onClick={onAddBuilding}
              className="px-4 py-2 rounded-xl bg-[#C2410C] hover:bg-[#1C1917] text-white font-bold text-xs shadow"
            >
              + Register First Building
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {buildings.map((b: any) => {
              const isExpanded = expandedBuildingId === b.id;

              return (
                <div key={b.id} className="transition-colors hover:bg-[#FFF0E6]/80">
                  {/* Building Header Row */}
                  <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => setExpandedBuildingId(isExpanded ? null : b.id)}
                        className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 mt-0.5 transition-colors shrink-0"
                        aria-label="Toggle building equipment"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-[#C2410C]" />
                        ) : (
                          <ChevronRight className="w-5 h-5" />
                        )}
                      </button>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="text-base font-bold text-slate-900 tracking-tight">
                            {b.name}
                          </span>

                          {/* Status Badge */}
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                              b.overallStatus === 'VERIFIED' || b.overallStatus === 'COMPLIANT'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : b.overallStatus === 'DUE_SOON'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : b.overallStatus === 'OVERDUE'
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {b.overallStatus === 'VERIFIED' || b.overallStatus === 'COMPLIANT'
                              ? 'Verified'
                              : b.overallStatus === 'DUE_SOON'
                              ? 'Due soon (30d)'
                              : b.overallStatus === 'OVERDUE'
                              ? 'Overdue'
                              : 'Not inspected'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600">
                          Client:{' '}
                          <strong className="text-slate-900 font-semibold">
                            {b.client?.name || 'Standard Account'}
                          </strong>{' '}
                          • {b.address}
                        </p>

                        <div className="flex items-center gap-3 text-xs text-slate-500 pt-0.5">
                          <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[11px] text-slate-700">
                            {b.complianceCycle}
                          </span>
                          <span>•</span>
                          <span>
                            Filing Due:{' '}
                            {b.nextFilingDueDate ? (() => {
                              const diff = b.filingDaysRemaining !== undefined && b.filingDaysRemaining !== null
                                ? b.filingDaysRemaining
                                : getCalendarDayDiff(b.nextFilingDueDate);
                              const notice = diff === null
                                ? 'No due date set'
                                : diff === 0
                                ? 'Due today'
                                : diff === -1
                                ? '1d overdue'
                                : diff < -1
                                ? `${Math.abs(diff)}d overdue`
                                : `${diff}d left`;
                              const colorCls = diff !== null && diff < 0
                                ? 'text-rose-600 font-bold'
                                : diff !== null && diff <= 30
                                ? 'text-amber-600 font-bold'
                                : 'text-slate-800';

                              return (
                                <strong className={colorCls}>
                                  {formatCalendarDate(b.nextFilingDueDate)} ({notice})
                                </strong>
                              );
                            })() : (
                              <strong className="text-slate-500">No due date set</strong>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions & Equipment Breakdown Pill */}
                    <div className="flex items-center gap-2 self-end md:self-auto flex-wrap">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-medium">
                        <span className="text-slate-900 font-bold">{b.totalEquipments} Units:</span>
                        <span className="text-emerald-600 font-semibold">{b.verifiedCount ?? b.compliantCount ?? 0} OK</span>
                        {b.dueCount > 0 && <span className="text-amber-600 font-semibold">• {b.dueCount} Due</span>}
                        {b.overdueCount > 0 && <span className="text-rose-600 font-bold">• {b.overdueCount} Overdue</span>}
                      </div>

                      {/* Primary Button 1: Form B Report */}
                      <Link
                        href={`/report/${b.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-[#FFF0E6] hover:bg-[#FED7AA] text-[#C2410C] border border-[#C2410C]/30 text-xs font-bold transition-all hover:scale-[1.02] shadow-sm"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Form B Report</span>
                      </Link>

                      {/* Primary Button 2: + Add Equipment */}
                      <button
                        onClick={() => onSingleAdd(b)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-[#FFF0E6] text-slate-700 border border-slate-200 hover:border-[#C2410C]/30 text-xs font-bold transition-all shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#C2410C]" />
                        <span>+ Add Equipment</span>
                      </button>

                      {/* Dropdown ⋯ More */}
                      <div className="relative">
                        <button
                          type="button"
                          data-testid={`more-actions-btn-${b.id}`}
                          onClick={() => setOpenMoreMenuId(openMoreMenuId === b.id ? null : b.id)}
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors shadow-xs"
                          title="More Actions"
                          aria-label="More Actions"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {openMoreMenuId === b.id && (
                          <>
                            <div
                              className="fixed inset-0 z-20"
                              onClick={() => setOpenMoreMenuId(null)}
                            />
                            <div className="absolute right-0 mt-1 w-48 bg-white border border-[#FED7AA] rounded-2xl shadow-xl z-30 py-1.5 text-xs text-slate-700">
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMoreMenuId(null);
                                  onBulkAdd(b);
                                }}
                                className="w-full flex items-center gap-2 px-3.5 py-2 hover:bg-[#FFF0E6] hover:text-[#C2410C] font-semibold text-left transition-colors"
                              >
                                <FileSpreadsheet className="w-4 h-4 text-[#EA580C]" />
                                <span>Import from Excel</span>
                              </button>

                              {onOpenFloorPlans && (
                                <button
                                  type="button"
                                  data-testid={`open-floor-plans-${b.id}`}
                                  onClick={() => {
                                    setOpenMoreMenuId(null);
                                    onOpenFloorPlans(b);
                                  }}
                                  className="w-full flex items-center gap-2 px-3.5 py-2 hover:bg-[#FFF0E6] hover:text-[#C2410C] font-semibold text-left transition-colors"
                                >
                                  <MapPin className="w-4 h-4 text-[#EA580C]" />
                                  <span>Floor Plans</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMoreMenuId(null);
                                  setOverdueModalBuilding({
                                    id: b.id,
                                    name: b.name,
                                    clientEmail: b.client?.email || null,
                                    clientName: b.client?.name || b.name,
                                  });
                                }}
                                className="w-full flex items-center gap-2 px-3.5 py-2 hover:bg-rose-50 text-rose-600 font-semibold text-left transition-colors"
                                title={`Email due date & overdue alert for ${b.name}`}
                              >
                                <Mail className="w-4 h-4 text-rose-500" />
                                <span>Due Date Alert</span>
                              </button>

                              <div className="my-1 border-t border-slate-100" />

                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMoreMenuId(null);
                                  onEditBuilding(b);
                                }}
                                className="w-full flex items-center gap-2 px-3.5 py-2 hover:bg-slate-50 text-slate-700 font-semibold text-left transition-colors"
                              >
                                <Edit className="w-4 h-4 text-slate-500" />
                                <span>Edit Building</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMoreMenuId(null);
                                  onDeleteBuilding(b.id, b.name);
                                }}
                                className="w-full flex items-center gap-2 px-3.5 py-2 hover:bg-rose-50 text-rose-600 font-semibold text-left transition-colors"
                              >
                                <Trash2 className="w-4 h-4 text-rose-500" />
                                <span>Delete Building</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Equipment Breakdown Table */}
                  {isExpanded && (
                    <div className="bg-slate-50/70 border-t border-[#FED7AA] p-4 sm:p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black uppercase tracking-wider text-[#1C1917] flex items-center gap-2">
                          <Layers className="w-4 h-4 text-[#C2410C]" />
                          <span>Equipment Registry ({b.equipments?.length || 0} Assets)</span>
                        </h3>
                      </div>

                      {!b.equipments || b.equipments.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-[#FED7AA] space-y-2">
                          <p>No equipment registered for this building yet.</p>
                          <button
                            onClick={() => onBulkAdd(b)}
                            className="px-3.5 py-1.5 rounded-lg bg-[#C2410C] hover:bg-[#1C1917] text-white font-bold text-xs shadow"
                          >
                            + Equipment Schedule
                          </button>
                        </div>
                      ) : (
                        <div className="bg-white rounded-xl border border-[#FED7AA] overflow-x-auto shadow-sm">
                          <table className="w-full text-left text-xs min-w-[760px]">
                            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-[#FED7AA]">
                              <tr>
                                <th className="py-3 px-4">Asset ID / Serial</th>
                                <th className="py-3 px-4">Type &amp; Spec</th>
                                <th className="py-3 px-4">Location</th>
                                <th className="py-3 px-4">Last Service</th>
                                <th className="py-3 px-4">Next Service Due</th>
                                <th className="py-3 px-4">Next Hydro Due</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4 text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {(b.equipments ?? []).map((eq: any) => {
                                const diffDays = getCalendarDayDiff(eq.nextDueDate);
                                const status =
                                  diffDays !== null && diffDays < 0
                                    ? 'OVERDUE'
                                    : diffDays !== null && diffDays <= 30
                                    ? 'DUE_SOON'
                                    : eq.complianceStatus || eq.status || 'VERIFIED';

                                return (
                                  <tr key={eq.id} className="hover:bg-[#FFF0E6]/80 transition-colors">
                                    <td className="py-3 px-4 font-mono font-bold">
                                      <button
                                        type="button"
                                        onClick={() => onEditEquipment && onEditEquipment(eq)}
                                        className="text-[#C2410C] hover:underline bg-[#FFF0E6] px-2 py-0.5 rounded border border-[#C2410C]/30 cursor-pointer"
                                        title="Open Asset Details & Service Schedule"
                                      >
                                        {eq.qrCode}
                                      </button>
                                    </td>
                                    <td className="py-3 px-4 font-semibold text-slate-900">
                                      {eq.capacity} ({eq.type})
                                    </td>
                                    <td className="py-3 px-4 text-slate-600">{eq.location}</td>
                                    <td className="py-3 px-4 text-slate-500">
                                      {formatCalendarDate(eq.lastServiceDate)}
                                    </td>
                                    <td className="py-3 px-4 font-semibold text-slate-800">
                                      {eq.nextDueDate ? formatCalendarDate(eq.nextDueDate) : '—'}
                                      <span
                                        className={`block text-[10px] font-normal ${
                                          diffDays !== null && diffDays < 0
                                            ? 'text-rose-600 font-bold'
                                            : diffDays !== null && diffDays <= 30
                                            ? 'text-amber-600 font-bold'
                                            : 'text-slate-500'
                                        }`}
                                      >
                                        {diffDays === null
                                          ? 'No due date set'
                                          : diffDays === 0
                                          ? 'Due today'
                                          : diffDays === -1
                                          ? '1d overdue'
                                          : diffDays < -1
                                          ? `${Math.abs(diffDays)}d overdue`
                                          : diffDays <= 30
                                          ? `Due in ${diffDays}d`
                                          : `${Math.max(1, getCalendarMonthDiff(eq.nextDueDate) ?? 1)} mos left`}
                                      </span>
                                    </td>
                                    <td className="py-3 px-4 text-[#1C1917] font-semibold">
                                      {formatCalendarDate(eq.hydroDueDate)}
                                    </td>
                                    <td className="py-3 px-4">
                                      <span
                                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                          status === 'VERIFIED' || status === 'COMPLIANT'
                                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                            : status === 'DUE_SOON'
                                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                            : status === 'OVERDUE'
                                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                                        }`}
                                      >
                                        {status === 'VERIFIED' || status === 'COMPLIANT'
                                          ? 'Verified'
                                          : status === 'DUE_SOON'
                                          ? 'DUE SOON (<30d)'
                                          : status === 'OVERDUE'
                                          ? 'OVERDUE'
                                          : 'Not Inspected'}
                                      </span>
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                      {onEditEquipment && (
                                        <button
                                          type="button"
                                          onClick={() => onEditEquipment(eq)}
                                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#C2410C] hover:bg-[#9A3412] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                                          title="Inspect / Edit Equipment & Service Dates"
                                        >
                                          <MapPin className="w-3 h-3 stroke-[2.5]" />
                                          <span>Inspect / Edit</span>
                                        </button>
                                      )}
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

      {overdueModalBuilding && (
        <EmailOverdueModal
          isOpen={Boolean(overdueModalBuilding)}
          onClose={() => setOverdueModalBuilding(null)}
          buildingId={overdueModalBuilding.id}
          clientName={overdueModalBuilding.clientName}
          clientEmail={overdueModalBuilding.clientEmail}
        />
      )}
    </div>
  );
}
