'use client';

import React from 'react';
import Link from 'next/link';
import {
  Building2,
  Plus,
  ChevronDown,
  ChevronRight,
  FileText,
  Scan,
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
}: BuildingsViewProps) {
  return (
    <div className="space-y-6 text-slate-100">
      {/* 4 Status Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Buildings
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white">{summary.totalBuildings}</span>
            <span className="text-xs text-slate-400 font-medium">({summary.totalEquipments} assets)</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1">
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            All Current
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400">{summary.compliantBuildings}</span>
            <span className="text-xs text-emerald-300/80 font-medium">100% Compliant</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-1">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            Due Soon (&lt;30d)
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-400">{summary.dueSoonBuildings}</span>
            <span className="text-xs text-amber-300/80 font-medium">Action Pending</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30 space-y-1">
          <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            Overdue
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-red-400">{summary.overdueBuildings}</span>
            <span className="text-xs text-red-300/80 font-medium">Non-Compliant</span>
          </div>
        </div>
      </div>

      {/* Buildings List Card */}
      <div className="tactile-card rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl overflow-hidden">
        {/* List Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Managed Buildings &amp; Societies
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold">
              {buildings.length} Registered
            </span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={onOpenExport}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all shadow-sm"
              title="Export Buildings to Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Export Excel</span>
            </button>

            <button
              onClick={onAddBuilding}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black shadow hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Client &amp; Building</span>
            </button>
          </div>
        </div>

        {/* Building List Rows */}
        {buildings.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <Building2 className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-white">No buildings registered yet</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Add your first building society to start tracking asset lifecycles and Form-B filings.
            </p>
            <button
              onClick={onAddBuilding}
              className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
            >
              + Register First Building
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {buildings.map((b: any) => {
              const isExpanded = expandedBuildingId === b.id;

              return (
                <div key={b.id} className="transition-colors hover:bg-slate-850/40">
                  {/* Building Header Row */}
                  <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => setExpandedBuildingId(isExpanded ? null : b.id)}
                        className="p-1 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white mt-0.5 transition-colors shrink-0"
                        aria-label="Toggle building equipment"
                      >
                        {isExpanded ? <ChevronDown className="w-5 h-5 text-amber-400" /> : <ChevronRight className="w-5 h-5" />}
                      </button>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="text-base font-bold text-white tracking-tight">{b.name}</span>

                          {/* Status Badge */}
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                              b.overallStatus === 'COMPLIANT'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : b.overallStatus === 'DUE_SOON'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                : 'bg-red-500/10 text-red-400 border border-red-500/30'
                            }`}
                          >
                            {b.overallStatus === 'COMPLIANT'
                              ? '✓ 100% Compliant'
                              : b.overallStatus === 'DUE_SOON'
                              ? '⚠ Due Soon (30d)'
                              : '✕ Action Needed (Overdue)'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-400">
                          Client: <strong className="text-slate-200 font-semibold">{b.client?.name || 'Standard Account'}</strong> • {b.address}
                        </p>

                        <div className="flex items-center gap-3 text-xs text-slate-400 pt-0.5">
                          <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300">
                            {b.complianceCycle}
                          </span>
                          <span>•</span>
                          <span>
                            Filing Due:{' '}
                            <strong className={b.filingDaysRemaining <= 30 ? 'text-amber-400 font-bold' : 'text-slate-200'}>
                              {new Date(b.nextFilingDueDate).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}{' '}
                              ({b.filingDaysRemaining > 0 ? `${b.filingDaysRemaining}d left` : `${Math.abs(b.filingDaysRemaining)}d overdue`})
                            </strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions & Equipment Breakdown Pill */}
                    <div className="flex items-center gap-2 self-end md:self-auto flex-wrap">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium">
                        <span className="text-white font-bold">{b.totalEquipments} Units:</span>
                        <span className="text-emerald-400 font-semibold">{b.compliantCount} Fit</span>
                        {b.dueCount > 0 && <span className="text-amber-400 font-semibold">• {b.dueCount} Due</span>}
                        {b.overdueCount > 0 && <span className="text-red-400 font-bold">• {b.overdueCount} Overdue</span>}
                      </div>

                      <button
                        onClick={() => onBulkAdd(b)}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-amber-500/40 text-xs font-bold transition-all"
                      >
                        + Bulk Add
                      </button>

                      <button
                        onClick={() => onSingleAdd(b)}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-amber-500/40 text-xs font-bold transition-all"
                      >
                        + Single Tag
                      </button>

                      <Link
                        href={`/report/${b.id}`}
                        className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 text-xs font-bold transition-all hover:scale-[1.02]"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Form-B</span>
                      </Link>

                      <button
                        onClick={() => onEditBuilding(b)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Edit Building Details"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onDeleteBuilding(b.id, b.name)}
                        className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-500/30 transition-colors"
                        title="Delete Building"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Equipment Breakdown Table */}
                  {isExpanded && (
                    <div className="bg-slate-950/90 border-t border-slate-800 p-4 sm:p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                          <Layers className="w-4 h-4" />
                          <span>Equipment Registry ({b.equipments?.length || 0} Assets)</span>
                        </h3>
                      </div>

                      {!b.equipments || b.equipments.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
                          <p>No equipment registered for this building yet.</p>
                          <button
                            onClick={() => onBulkAdd(b)}
                            className="px-3.5 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs"
                          >
                            + Bulk Generate QR Tags
                          </button>
                        </div>
                      ) : (
                        <div className="bg-slate-900/80 rounded-xl border border-slate-800 overflow-x-auto shadow-md">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-950/90 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                              <tr>
                                <th className="py-3 px-4">QR Tag</th>
                                <th className="py-3 px-4">Type &amp; Spec</th>
                                <th className="py-3 px-4">Location</th>
                                <th className="py-3 px-4">Last Service</th>
                                <th className="py-3 px-4">Next Due Date</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4 text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                              {b.equipments.map((eq: any) => {
                                const diffDays = Math.ceil(
                                  (new Date(eq.nextDueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                                );
                                const status = diffDays < 0 ? 'OVERDUE' : diffDays <= 30 ? 'DUE_SOON' : 'COMPLIANT';

                                return (
                                  <tr key={eq.id} className="hover:bg-slate-850/50 transition-colors">
                                    <td className="py-3 px-4 font-mono font-bold">
                                      <Link
                                        href={`/scan/${eq.qrCode}`}
                                        className="text-amber-400 hover:underline bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20"
                                      >
                                        {eq.qrCode}
                                      </Link>
                                    </td>
                                    <td className="py-3 px-4 font-semibold text-white">
                                      {eq.capacity} ({eq.type})
                                    </td>
                                    <td className="py-3 px-4 text-slate-300">{eq.location}</td>
                                    <td className="py-3 px-4 text-slate-400">
                                      {new Date(eq.lastServiceDate).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                      })}
                                    </td>
                                    <td className="py-3 px-4 font-semibold text-slate-200">
                                      {new Date(eq.nextDueDate).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                      })}
                                      <span
                                        className={`block text-[10px] font-normal ${
                                          diffDays < 0
                                            ? 'text-red-400 font-bold'
                                            : diffDays <= 30
                                            ? 'text-amber-400 font-bold'
                                            : 'text-slate-400'
                                        }`}
                                      >
                                        {diffDays < 0
                                          ? `${Math.abs(diffDays)}d overdue`
                                          : diffDays <= 30
                                          ? `Due in ${diffDays}d`
                                          : `${Math.round(diffDays / 30)} mos left`}
                                      </span>
                                    </td>
                                    <td className="py-3 px-4">
                                      <span
                                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                          status === 'COMPLIANT'
                                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                            : status === 'DUE_SOON'
                                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                            : 'bg-red-500/10 text-red-400 border border-red-500/30'
                                        }`}
                                      >
                                        {status === 'COMPLIANT' ? 'Current' : status === 'DUE_SOON' ? 'Due Soon' : 'Overdue'}
                                      </span>
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                      <Link
                                        href={`/scan/${eq.qrCode}`}
                                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow transition-all hover:scale-105"
                                      >
                                        <Scan className="w-3 h-3 stroke-[2.5]" />
                                        <span>Service</span>
                                      </Link>
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
