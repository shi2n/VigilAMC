'use client';

import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Layers, Search, Edit, Trash2, MapPin, FileSpreadsheet, Plus } from 'lucide-react';

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
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="rounded-2xl bg-white border border-[#DCE7F2] shadow-xs p-5 sm:p-6 space-y-6 text-slate-800">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DCE7F2] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EAF6FF] border border-[#0077B6]/30 flex items-center justify-center text-[#0077B6]">
              <Layers className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[#023E8A] tracking-tight">
              Fire Equipment Schedule &amp; Inventory
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#EAF6FF] text-[#0077B6] border border-[#0077B6]/30 text-xs font-semibold">
              {equipmentsList.length} Units
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Search, filter, and audit individual fire extinguishers, hydrants, hose reels, and alarm panels.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Building Filter */}
          <select
            value={equipFilterBuilding}
            onChange={(e) => setEquipFilterBuilding(e.target.value)}
            className="bg-white border border-[#DCE7F2] rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#0077B6] shadow-xs"
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
              className="bg-white border border-[#DCE7F2] rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0077B6] shadow-xs"
            />
          </div>

          {/* Excel Import & Export */}
          {onOpenImport && (
            <button
              onClick={onOpenImport}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#EAF6FF] hover:bg-[#D5EEFF] text-[#0077B6] border border-[#0077B6]/30 text-xs font-bold transition-all shadow-xs"
              title="Import Fire Equipment from Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Import Equipment</span>
            </button>
          )}

          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-[#0E9F6E] border border-[#0E9F6E]/30 text-xs font-bold transition-all shadow-xs"
            title="Export Fire Equipment to Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Equipment</span>
          </button>
        </div>
      </div>

      {/* Equipment Table */}
      {equipmentsList.length === 0 ? (
        <div className="py-16 text-center text-slate-500 space-y-3 bg-[#F4F8FB]/50 rounded-xl border border-dashed border-[#DCE7F2]">
          <div className="w-12 h-12 rounded-2xl bg-[#EAF6FF] border border-[#0077B6]/20 flex items-center justify-center text-[#0077B6] mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[#023E8A]">No equipment assets found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query or filter, or import your fire equipment register via Excel.
          </p>
          {onOpenImport && (
            <button
              onClick={onOpenImport}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0077B6] hover:bg-[#023E8A] text-white text-xs font-bold shadow-xs transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Import Equipment Register</span>
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#DCE7F2] overflow-x-auto shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F4F8FB] text-[#023E8A] uppercase text-[10px] font-bold tracking-wider border-b border-[#DCE7F2]">
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
            <tbody className="divide-y divide-[#DCE7F2]/60">
              {equipmentsList.map((eq, idx) => {
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

                const statusKey = isOverdue
                  ? 'OVERDUE'
                  : isDueSoon
                  ? 'DUE_SOON'
                  : isVerified
                  ? 'VERIFIED'
                  : 'PENDING';

                return (
                  <motion.tr
                    key={eq.id}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.18,
                      delay: prefersReducedMotion ? 0 : Math.min(idx, 7) * 0.025,
                      ease: 'easeOut',
                    }}
                    className="hover:bg-[#EAF6FF]/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold">
                      <button
                        type="button"
                        onClick={() => onEditEquipment(eq)}
                        className="text-[#0077B6] hover:underline bg-[#EAF6FF] px-2 py-0.5 rounded border border-[#0077B6]/30 cursor-pointer"
                        title="Open Asset Details & Service Schedule"
                      >
                        {eq.qrCode}
                      </button>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-600">{eq.building?.name || '—'}</td>
                    <td className="py-3 px-4 text-[#023E8A] font-semibold">
                      {eq.capacity} ({eq.type})
                    </td>
                    <td className="py-3 px-4 text-slate-500">{eq.location}</td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {eq.lastServiceDate && !isNaN(new Date(eq.lastServiceDate).getTime())
                        ? new Date(eq.lastServiceDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800 whitespace-nowrap">
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
                            ? 'text-[#B91C1C] font-bold'
                            : isDueSoon
                            ? 'text-amber-700 font-bold'
                            : 'text-slate-500'
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
                      <motion.span
                        key={`${eq.id}-${statusKey}`}
                        initial={prefersReducedMotion ? false : { scale: 0.92, opacity: 0.7 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.16, ease: 'easeOut' }}
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          isOverdue
                            ? 'bg-rose-50 text-[#B91C1C] border border-[#B91C1C]/30'
                            : isDueSoon
                            ? 'bg-amber-50 text-amber-800 border border-amber-300'
                            : isVerified
                            ? 'bg-emerald-50 text-[#0E9F6E] border border-[#0E9F6E]/30'
                            : 'bg-[#F4F8FB] text-slate-700 border border-[#DCE7F2]'
                        }`}
                      >
                        {isOverdue
                          ? 'OVERDUE'
                          : isDueSoon
                          ? 'DUE SOON (<30d)'
                          : isVerified
                          ? 'Verified'
                          : 'Not Inspected'}
                      </motion.span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onEditEquipment(eq)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0077B6] hover:bg-[#023E8A] text-white text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95"
                        title="Inspect / Edit Asset & Service Dates"
                      >
                        <MapPin className="w-3 h-3 stroke-[2.5]" />
                        <span>Inspect / Edit</span>
                      </button>
                      <button
                        onClick={() => onEditEquipment(eq)}
                        className="p-1.5 rounded-lg bg-[#F4F8FB] hover:bg-[#EAF6FF] text-slate-600 hover:text-[#0077B6] border border-[#DCE7F2] transition-colors"
                        title="Edit Equipment Details"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteEquipment(eq.id, eq.qrCode)}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-[#B91C1C] border border-[#B91C1C]/20 transition-colors"
                        title="Delete Equipment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
