'use client';

import React from 'react';
import Link from 'next/link';
import { Layers, Search, Edit, Trash2, Scan, FileSpreadsheet } from 'lucide-react';

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
}: FireAssetsViewProps) {
  return (
    <div className="tactile-card rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl p-5 sm:p-6 space-y-6 text-slate-100">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Layers className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Fire Asset Inventory &amp; QR Tag Registry
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold">
              {equipmentsList.length} Units
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Search, filter, and audit individual fire extinguishers, hydrants, hose reels, and alarm panels.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Building Filter */}
          <select
            value={equipFilterBuilding}
            onChange={(e) => setEquipFilterBuilding(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
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
              placeholder="Search QR or location..."
              value={equipSearch}
              onChange={(e) => setEquipSearch(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Excel Export */}
          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all shadow-sm"
            title="Export Assets to Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Equipment Table */}
      {equipmentsList.length === 0 ? (
        <div className="py-16 text-center text-slate-400 space-y-3">
          <Layers className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No equipment assets found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search query or filter, or navigate to Buildings to add assets with QR codes.
          </p>
        </div>
      ) : (
        <div className="bg-slate-950/80 rounded-xl border border-slate-800 overflow-x-auto shadow">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">QR Code Tag</th>
                <th className="py-3 px-4">Building</th>
                <th className="py-3 px-4">Type &amp; Capacity</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Next Due Date</th>
                <th className="py-3 px-4 text-center">Live Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {equipmentsList.map((eq) => (
                <tr key={eq.id} className="hover:bg-slate-850/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold">
                    <Link
                      href={`/scan/${eq.qrCode}`}
                      className="text-amber-400 hover:underline bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20"
                    >
                      {eq.qrCode}
                    </Link>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-300">{eq.building?.name || '—'}</td>
                  <td className="py-3 px-4 text-white font-semibold">
                    {eq.capacity} ({eq.type})
                  </td>
                  <td className="py-3 px-4 text-slate-400">{eq.location}</td>
                  <td className="py-3 px-4 font-semibold text-slate-200">
                    {new Date(eq.nextDueDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        eq.liveStatus === 'COMPLIANT'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : eq.liveStatus === 'DUE_SOON'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : 'bg-red-500/10 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {eq.liveStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                    <Link
                      href={`/scan/${eq.qrCode}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow transition-all"
                      title="Service / Log Inspection"
                    >
                      <Scan className="w-3 h-3 stroke-[2.5]" />
                      <span>Service</span>
                    </Link>
                    <button
                      onClick={() => onEditEquipment(eq)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Edit Equipment Details"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteEquipment(eq.id, eq.qrCode)}
                      className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-500/30 transition-colors"
                      title="Delete Equipment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
