'use client';

import React from 'react';
import { Layers, Search, Edit, Trash2, MapPin, FileSpreadsheet } from 'lucide-react';

interface FireAssetsViewProps {
  equipmentsList: any[];
  buildings: any[];
  equipFilterBuilding: string;
  setEquipFilterBuilding: (val: string) => void;
  equipSearch: string;
  setEquipSearch: (val: string) => void;
  onEditEquipment: (eq: any) => void;
  onDeleteEquipment: (id: string, qrCode: string) => void;
  onOpenExport: () => void;
  onOpenImport?: () => void;
}

export function FireAssetsView({
  equipmentsList,
  buildings,
  equipFilterBuilding,
  setEquipFilterBuilding,
  equipSearch,
  setEquipSearch,
  onEditEquipment,
  onDeleteEquipment,
  onOpenExport,
  onOpenImport,
}: FireAssetsViewProps) {
  return (
    <div className="rounded-2xl bg-white border border-[#DCE7F2] shadow-sm p-5 sm:p-6 space-y-6 text-slate-800 dark:bg-slate-900/90 dark:border-slate-800 dark:shadow-xl dark:text-slate-100">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DCE7F2] pb-4 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EAF6FF] border border-[#007DB8]/30 flex items-center justify-center text-[#007DB8] dark:bg-purple-500/10 dark:border-purple-500/30 dark:text-purple-400">
              <Layers className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[#023E8A] dark:text-white tracking-tight">
              Fire Equipment Schedule &amp; Inventory
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#EAF6FF] text-[#007DB8] border border-[#007DB8]/30 text-xs font-semibold dark:bg-slate-800 dark:text-slate-300">
              {equipmentsList.length} Units
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Search, filter, and audit individual fire extinguishers, hydrants, hose reels, and alarm panels.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Building Filter */}
          <select
            value={equipFilterBuilding}
            onChange={(e) => setEquipFilterBuilding(e.target.value)}
            className="bg-white border border-[#DCE7F2] rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#007DB8] shadow-sm dark:bg-slate-950 dark:border-slate-700 dark:text-white"
          >
            <option value="ALL">All Buildings</option>
            {buildings.map((b: any) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Asset ID or location..."
              value={equipSearch}
              onChange={(e) => setEquipSearch(e.target.value)}
              className="bg-white border border-[#DCE7F2] rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#007DB8] shadow-sm dark:bg-slate-950 dark:border-slate-700 dark:text-white dark:placeholder-slate-500"
            />
          </div>

          {/* Excel Import & Export */}
          {onOpenImport && (
            <button
              onClick={onOpenImport}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#EAF6FF] hover:bg-[#D5EEFF] text-[#007DB8] border border-[#007DB8]/30 text-xs font-bold transition-all shadow-sm dark:bg-amber-500/10 dark:hover:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30"
              title="Import Fire Equipment from Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Import Equipment</span>
            </button>
          )}

          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 border border-emerald-300 text-xs font-bold transition-all shadow-sm dark:bg-emerald-600/20 dark:hover:bg-emerald-600/30 dark:text-emerald-300 dark:border-emerald-500/30"
            title="Export Fire Equipment to Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Equipment</span>
          </button>
        </div>
      </div>

      {/* Equipment Table */}
      {equipmentsList.length === 0 ? (
        <div className="py-16 text-center text-slate-500 dark:text-slate-400 space-y-3">
          <Layers className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No equipment assets found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Try adjusting your search query or filter, or navigate to Buildings to add assets to your schedule.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#DCE7F2] overflow-x-auto shadow-sm dark:bg-slate-950/80 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-[#DCE7F2] dark:bg-slate-900/90 dark:text-slate-400 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Asset ID / Serial</th>
                <th className="py-3 px-4">Building</th>
                <th className="py-3 px-4">Type &amp; Capacity</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Last Serviced</th>
                <th className="py-3 px-4">Next Due Date</th>
                <th className="py-3 px-4 text-center">Live Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {equipmentsList.map((eq) => {
                const hasDue = Boolean(
                  eq.nextDueDate && !isNaN(new Date(eq.nextDueDate).getTime())
                );
                const diffDays = hasDue
                  ? Math.ceil(
                      (new Date(eq.nextDueDate).getTime() - new Date().getTime()) /
                        (1000 * 60 * 60 * 24)
                    )
                  : null;
                const isOverdue =
                  (diffDays !== null && diffDays < 0) ||
                  eq.status === 'OVERDUE' ||
                  eq.liveStatus === 'OVERDUE';
                const isDueSoon =
                  !isOverdue &&
                  ((diffDays !== null && diffDays <= 30) ||
                    eq.status === 'DUE_SOON' ||
                    eq.liveStatus === 'DUE_SOON');
                const isVerified =
                  !isOverdue &&
                  !isDueSoon &&
                  (eq.status === 'VERIFIED' ||
                    eq.status === 'COMPLIANT' ||
                    eq.liveStatus === 'COMPLIANT' ||
                    eq.liveStatus === 'VERIFIED');

                return (
                  <tr key={eq.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-850/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold">
                      <button
                        type="button"
                        onClick={() => onEditEquipment(eq)}
                        className="text-[#2563EB] hover:underline bg-[#EFF6FF] px-2 py-0.5 rounded border border-[#2563EB]/30 dark:text-[#60A5FA] dark:bg-blue-500/10 dark:border-blue-500/20 cursor-pointer"
                        title="Open Asset Details & Service Schedule"
                      >
                        {eq.qrCode}
                      </button>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-600 dark:text-slate-300">{eq.building?.name || '—'}</td>
                    <td className="py-3 px-4 text-slate-900 font-semibold dark:text-white">
                      {eq.capacity} ({eq.type})
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{eq.location}</td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {eq.lastServiceDate && !isNaN(new Date(eq.lastServiceDate).getTime())
                        ? new Date(eq.lastServiceDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                      {hasDue
                        ? new Date(eq.nextDueDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                      <span
                        className={`block text-[10px] font-normal ${
                          isOverdue
                            ? 'text-rose-600 dark:text-red-400 font-bold'
                            : isDueSoon
                            ? 'text-amber-600 dark:text-amber-400 font-bold'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {diffDays === null
                          ? 'No due date set'
                          : isOverdue
                          ? `Overdue by ${Math.abs(diffDays)}d`
                          : isDueSoon
                          ? `Due in ${diffDays}d`
                          : `${Math.max(1, Math.round(diffDays / 30))} mos left`}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isOverdue
                            ? 'bg-rose-100 text-rose-800 border border-rose-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30'
                            : isDueSoon
                            ? 'bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30'
                            : isVerified
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30'
                            : 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {isOverdue
                          ? 'OVERDUE'
                          : isDueSoon
                          ? 'DUE SOON (<30d)'
                          : isVerified
                          ? 'Verified'
                          : 'Not Inspected'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onEditEquipment(eq)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                        title="Inspect / Edit Asset & Service Dates"
                      >
                        <MapPin className="w-3 h-3 stroke-[2.5]" />
                        <span>Inspect / Edit</span>
                      </button>
                      <button
                        onClick={() => onEditEquipment(eq)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-white"
                        title="Edit Equipment Details"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteEquipment(eq.id, eq.qrCode)}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors dark:bg-red-950/40 dark:hover:bg-red-900/60 dark:text-red-400 dark:border-red-500/30"
                        title="Delete Equipment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
