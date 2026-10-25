'use client';

import React from 'react';
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
} from 'lucide-react';

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
}: BuildingsViewProps) {
  return (
    <div className="space-y-6">
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
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
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
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
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
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#C2410C] to-[#1C1917] hover:from-[#C2410C] hover:to-[#9A3412] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
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
                              ? '✓ Verified'
                              : b.overallStatus === 'DUE_SOON'
                              ? '⚠ Due Soon (30d)'
                              : b.overallStatus === 'OVERDUE'
                              ? '✕ Overdue'
                              : '○ Not Yet Inspected'}
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
                            {b.nextFilingDueDate && !isNaN(new Date(b.nextFilingDueDate).getTime()) ? (
                              <strong
                                className={
                                  b.filingDaysRemaining !== null && b.filingDaysRemaining <= 30
                                    ? 'text-amber-600 font-bold'
                                    : 'text-slate-800'
                                }
                              >
                                {new Date(b.nextFilingDueDate).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}{' '}
                                {b.filingDaysRemaining !== null &&
                                  `(${b.filingDaysRemaining > 0 ? `${b.filingDaysRemaining}d left` : `${Math.abs(b.filingDaysRemaining)}d overdue`})`}
                              </strong>
                            ) : (
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
                        <span className="text-emerald-600 font-semibold">{b.verifiedCount ?? b.compliantCount ?? 0} Fit</span>
                        {b.dueCount > 0 && <span className="text-amber-600 font-semibold">• {b.dueCount} Due</span>}
                        {b.overdueCount > 0 && <span className="text-rose-600 font-bold">• {b.overdueCount} Overdue</span>}
                      </div>

                      <button
                        onClick={() => onBulkAdd(b)}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#FFF0E6] text-slate-700 border border-slate-200 hover:border-[#C2410C]/30 text-xs font-bold transition-all shadow-sm"
                      >
                        + Bulk Add
                      </button>

                      <button
                        onClick={() => onSingleAdd(b)}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#FFF0E6] text-slate-700 border border-slate-200 hover:border-[#C2410C]/30 text-xs font-bold transition-all shadow-sm"
                      >
                        + Single Item
                      </button>

                      <Link
                        href={`/report/${b.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-[#FFF0E6] hover:bg-[#FED7AA] text-[#C2410C] border border-[#C2410C]/30 text-xs font-bold transition-all hover:scale-[1.02] shadow-sm"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Form-B</span>
                      </Link>

                      <button
                        onClick={() => onEditBuilding(b)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                        title="Edit Building Details"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onDeleteBuilding(b.id, b.name)}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors"
                        title="Delete Building"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-[#FED7AA]">
                              <tr>
                                <th className="py-3 px-4">Asset ID / Serial</th>
                                <th className="py-3 px-4">Type &amp; Spec</th>
                                <th className="py-3 px-4">Location</th>
                                <th className="py-3 px-4">Last Service</th>
                                <th className="py-3 px-4">Next Due Date</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4 text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {(b.equipments ?? []).map((eq: any) => {
                                const hasDue = Boolean(
                                  eq.nextDueDate && !isNaN(new Date(eq.nextDueDate).getTime())
                                );
                                const diffDays = hasDue
                                  ? Math.ceil(
                                      (new Date(eq.nextDueDate).getTime() - new Date().getTime()) /
                                        (1000 * 60 * 60 * 24)
                                    )
                                  : null;
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
                                      {eq.lastServiceDate && !isNaN(new Date(eq.lastServiceDate).getTime())
                                        ? new Date(eq.lastServiceDate).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                          })
                                        : '—'}
                                    </td>
                                    <td className="py-3 px-4 font-semibold text-slate-800">
                                      {hasDue
                                        ? new Date(eq.nextDueDate).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                          })
                                        : '—'}
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
                                          : diffDays < 0
                                          ? `${Math.abs(diffDays)}d overdue`
                                          : diffDays <= 30
                                          ? `Due in ${diffDays}d`
                                          : `${Math.round(diffDays / 30)} mos left`}
                                      </span>
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
    </div>
  );
}
