'use client';

import React from 'react';
import { formatCalendarDate, getCalendarDayDiff, getCalendarMonthDiff } from '@/lib/dateUtils';
import { motion, useReducedMotion } from 'motion/react';
import { Layers, Search, Edit, Trash2, MapPin, FileSpreadsheet, Plus } from 'lucide-react';
import { AdminDictionary } from '@/lib/i18n/admin';

interface FireAssetsViewProps {
  equipmentsList: any[];
  allEquipments?: any[];
  buildings: any[];
  equipFilterBuilding: string;
  setEquipFilterBuilding: (val: string) => void;
  equipSearch: string;
  setEquipSearch: (val: string) => void;
  equipStatusFilter?: 'ALL' | 'OVERDUE' | 'DUE_SOON' | 'VERIFIED';
  setEquipStatusFilter?: (val: 'ALL' | 'OVERDUE' | 'DUE_SOON' | 'VERIFIED') => void;
  onEditEquipment: (eq: any) => void;
  onDeleteEquipment: (id: string, qrCode: string) => void;
  onOpenExport: () => void;
  onOpenImport?: () => void;
  t?: AdminDictionary;
}

export function FireAssetsView({
  equipmentsList,
  allEquipments,
  buildings,
  equipFilterBuilding,
  setEquipFilterBuilding,
  equipSearch,
  setEquipSearch,
  equipStatusFilter = 'ALL',
  setEquipStatusFilter,
  onEditEquipment,
  onDeleteEquipment,
  onOpenExport,
  onOpenImport,
  t,
}: FireAssetsViewProps) {
  const prefersReducedMotion = useReducedMotion();

  // Dedupe building options by unique building ID (Map by id, first occurrence wins)
  const uniqueBuildings = React.useMemo(() => {
    const map = new Map<string, any>();
    for (const b of buildings || []) {
      if (b && b.id && !map.has(b.id)) {
        map.set(b.id, b);
      }
    }
    return Array.from(map.values());
  }, [buildings]);

  const statusCounts = React.useMemo(() => {
    const list = allEquipments || equipmentsList || [];
    let overdue = 0;
    let dueSoon = 0;
    let verified = 0;
    for (const eq of list) {
      const diffDays = getCalendarDayDiff(eq.nextDueDate);
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
      if (isOverdue) overdue++;
      else if (isDueSoon) dueSoon++;
      else if (isVerified) verified++;
    }
    return { all: list.length, overdue, dueSoon, verified };
  }, [allEquipments, equipmentsList]);

  return (
    <div className="glass-panel-dense rounded-2xl shadow-xs p-4 sm:p-6 space-y-6 text-slate-800 max-w-full overflow-hidden">
      {/* Header & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#FED7AA] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FFF0E6] border border-[#C2410C]/30 flex items-center justify-center text-[#C2410C]">
              <Layers className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[#1C1917] tracking-tight">
              {t?.navEquipment || 'Fire Equipment'} Schedule &amp; Inventory
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#FFF0E6] text-[#C2410C] border border-[#C2410C]/30 text-xs font-semibold">
              {equipmentsList.length} Units
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Search, filter, and audit individual fire extinguishers, hydrants, hose reels, and alarm panels.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap w-full lg:w-auto">
          {/* Building Filter */}
          <select
            value={equipFilterBuilding}
            onChange={(e) => setEquipFilterBuilding(e.target.value)}
            className="bg-white border border-[#FED7AA] rounded-xl px-3 py-2 text-xs text-[#1C1917] font-medium focus:outline-none focus:border-[#C2410C] shadow-xs w-full sm:w-auto"
          >
            <option value="ALL">{t?.filterAll || 'All'} Buildings</option>
            {uniqueBuildings.map((b: any) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          {/* Search */}
          <div className="relative w-full sm:w-auto min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Asset ID or location..."
              value={equipSearch}
              onChange={(e) => setEquipSearch(e.target.value)}
              className="w-full bg-white border border-[#FED7AA] rounded-xl pl-8 pr-3 py-2 text-xs text-[#1C1917] placeholder-[#78716C] focus:outline-none focus:border-[#C2410C] shadow-xs"
            />
          </div>

          {/* Excel Import & Export */}
          {onOpenImport && (
            <button
              onClick={onOpenImport}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFF0E6] hover:bg-[#FED7AA] text-[#C2410C] border border-[#C2410C]/30 text-xs font-bold transition-all shadow-xs"
              title="Import Fire Equipment from Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{t?.actionImport ? `${t.actionImport} (${t?.navEquipment || 'Equipment'})` : 'Import Equipment'}</span>
            </button>
          )}

          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-[#0E9F6E] border border-[#0E9F6E]/30 text-xs font-bold transition-all shadow-xs"
            title="Export Fire Equipment to Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{t?.actionExport || 'Export Equipment'}</span>
          </button>
        </div>
      </div>

      {/* Status Filter Chips Row */}
      {setEquipStatusFilter && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-[#44403C]">Status Filter:</span>
          <div className="flex items-center gap-1.5 p-1 bg-white border border-[#FED7AA] rounded-xl text-xs font-bold overflow-x-auto shadow-2xs">
            <button
              type="button"
              data-testid="equip-filter-all"
              onClick={() => setEquipStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                equipStatusFilter === 'ALL'
                  ? 'bg-[#1C1917] text-white shadow-xs'
                  : 'text-[#44403C] hover:text-[#1C1917] hover:bg-[#FFF0E6]'
              }`}
            >
              All ({statusCounts.all})
            </button>
            <button
              type="button"
              data-testid="equip-filter-overdue"
              onClick={() => setEquipStatusFilter('OVERDUE')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                equipStatusFilter === 'OVERDUE'
                  ? 'bg-[#DC2626] text-white shadow-xs'
                  : 'text-[#DC2626] hover:bg-rose-50'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${equipStatusFilter === 'OVERDUE' ? 'bg-white' : 'bg-[#DC2626]'}`} />
              Overdue ({statusCounts.overdue})
            </button>
            <button
              type="button"
              data-testid="equip-filter-due-soon"
              onClick={() => setEquipStatusFilter('DUE_SOON')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                equipStatusFilter === 'DUE_SOON'
                  ? 'bg-[#D97706] text-white shadow-xs'
                  : 'text-[#D97706] hover:bg-amber-50'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${equipStatusFilter === 'DUE_SOON' ? 'bg-white' : 'bg-[#D97706]'}`} />
              Due Soon ({statusCounts.dueSoon})
            </button>
            <button
              type="button"
              data-testid="equip-filter-verified"
              onClick={() => setEquipStatusFilter('VERIFIED')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                equipStatusFilter === 'VERIFIED'
                  ? 'bg-[#059669] text-white shadow-xs'
                  : 'text-[#059669] hover:bg-emerald-50'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${equipStatusFilter === 'VERIFIED' ? 'bg-white' : 'bg-[#059669]'}`} />
              OK / Verified ({statusCounts.verified})
            </button>
          </div>
        </div>
      )}

      {/* Equipment Table */}
      {equipmentsList.length === 0 ? (
        <div className="py-16 text-center text-slate-500 space-y-3 bg-[#FFF8F2]/50 rounded-xl border border-dashed border-[#FED7AA]">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF0E6] border border-[#C2410C]/20 flex items-center justify-center text-[#C2410C] mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[#1C1917]">No equipment assets found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query or filter, or import your fire equipment register via Excel.
          </p>
          {onOpenImport && (
            <button
              onClick={onOpenImport}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C2410C] hover:bg-[#1C1917] text-white text-xs font-bold shadow-xs transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Import Equipment Register</span>
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#FED7AA] overflow-x-auto shadow-xs relative max-w-full">
          <table className="w-full min-w-[1020px] text-left text-xs border-collapse">
            <thead className="bg-[#FFF8F2] text-[#1C1917] uppercase text-[10px] font-bold tracking-wider border-b border-[#FED7AA]">
              <tr>
                <th className="py-3 px-4 whitespace-nowrap">Asset ID / Serial</th>
                <th className="py-3 px-4 whitespace-nowrap">Building</th>
                <th className="py-3 px-4 whitespace-nowrap">Type &amp; Capacity</th>
                <th className="py-3 px-4 whitespace-nowrap">Location</th>
                <th className="py-3 px-4 whitespace-nowrap">Last Serviced</th>
                <th className="py-3 px-4 whitespace-nowrap">Next Service Due</th>
                <th className="py-3 px-4 whitespace-nowrap">Next Hydro Due</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Live Status</th>
                <th className="py-3 px-4 text-right whitespace-nowrap sticky right-0 bg-[#FFF8F2] z-20 shadow-[-6px_0_12px_-4px_rgba(28,25,23,0.08)] border-b border-[#FED7AA] min-w-[160px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FED7AA]/60">
              {equipmentsList.map((eq, idx) => {
                const diffDays = getCalendarDayDiff(eq.nextDueDate);
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
                    className="hover:bg-[#FFF0E6]/40 transition-colors group"
                  >
                    <td className="py-3 px-4 font-mono font-bold">
                      <button
                        type="button"
                        onClick={() => onEditEquipment(eq)}
                        className="text-[#C2410C] hover:underline bg-[#FFF0E6] px-2 py-0.5 rounded border border-[#C2410C]/30 cursor-pointer"
                        title="Open Asset Details & Service Schedule"
                      >
                        {eq.qrCode}
                      </button>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-600">{eq.building?.name || '—'}</td>
                    <td className="py-3 px-4 text-[#1C1917] font-semibold">
                      {eq.capacity} ({eq.type})
                    </td>
                    <td className="py-3 px-4 text-slate-500">{eq.location}</td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {formatCalendarDate(eq.lastServiceDate)}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800 whitespace-nowrap">
                      {eq.nextDueDate ? formatCalendarDate(eq.nextDueDate) : '—'}
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
                          : diffDays === 0
                          ? 'Due today'
                          : isOverdue
                          ? (diffDays === -1 ? '1d overdue' : `Overdue by ${Math.abs(diffDays)}d`)
                          : isDueSoon
                          ? `Due in ${diffDays}d`
                          : `${Math.max(1, getCalendarMonthDiff(eq.nextDueDate) ?? 1)} mos left`}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#1C1917] whitespace-nowrap">
                      {eq.hydroDueDate && !isNaN(new Date(eq.hydroDueDate).getTime()) ? (
                        (() => {
                          const hydroDiff = getCalendarDayDiff(eq.hydroDueDate);
                          return (
                            <>
                              {formatCalendarDate(eq.hydroDueDate)}
                              <span
                                className={`block text-[10px] font-bold ${
                                  hydroDiff !== null && hydroDiff < 0
                                    ? 'text-[#DC2626]'
                                    : hydroDiff !== null && hydroDiff <= 30
                                    ? 'text-[#D97706]'
                                    : 'text-[#059669]'
                                }`}
                              >
                                {hydroDiff === null
                                  ? 'No due date set'
                                  : hydroDiff === 0
                                  ? 'Hydro due today'
                                  : hydroDiff < 0
                                  ? `Hydro overdue (${Math.abs(hydroDiff)}d)`
                                  : hydroDiff <= 30
                                  ? `Hydro due (${hydroDiff}d)`
                                  : 'Hydro OK'}
                              </span>
                            </>
                          );
                        })()
                      ) : (
                        <span className="text-[#44403C]">—</span>
                      )}
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
                            : 'bg-[#FFF8F2] text-slate-700 border border-[#FED7AA]'
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
                    <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap sticky right-0 bg-white group-hover:bg-[#FFF6EF] z-10 shadow-[-6px_0_12px_-4px_rgba(28,25,23,0.08)] min-w-[160px]">
                      <button
                        type="button"
                        onClick={() => onEditEquipment(eq)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#C2410C] hover:bg-[#1C1917] text-white text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95"
                        title="Inspect / Edit Asset & Service Dates"
                      >
                        <MapPin className="w-3 h-3 stroke-[2.5]" />
                        <span>Inspect / Edit</span>
                      </button>
                      <button
                        onClick={() => onEditEquipment(eq)}
                        className="p-1.5 rounded-lg bg-[#FFF8F2] hover:bg-[#FFF0E6] text-slate-600 hover:text-[#C2410C] border border-[#FED7AA] transition-colors"
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
