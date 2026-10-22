'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  RefreshCw,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';

interface InspectionsViewProps {
  showToast: (msg: string) => void;
  onOpenImport?: () => void;
  initialInspections?: any[];
  onRefreshDashboard?: () => Promise<void> | void;
}

export function InspectionsView({
  showToast,
  onOpenImport,
  initialInspections,
  onRefreshDashboard,
}: InspectionsViewProps) {
  const [inspections, setInspections] = useState<any[]>(initialInspections || []);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PASSED' | 'FAILED' | 'SERVICE_REQUIRED'>('ALL');
  const [search, setSearch] = useState('');

  // Keep in sync with parent bootstrap state immediately
  useEffect(() => {
    if (Array.isArray(initialInspections)) {
      setInspections(initialInspections);
    }
  }, [initialInspections]);

  const fetchInspections = async () => {
    try {
      setLoading(true);
      if (onRefreshDashboard) {
        await onRefreshDashboard();
      } else {
        const res = await fetch('/api/inspections');
        const json = await res.json();
        if (res.ok) {
          setInspections(json.inspections || []);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialInspections) {
      fetchInspections();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredInspections = inspections.filter((ins) => {
    const matchesSearch =
      (ins.building?.name && ins.building.name.toLowerCase().includes(search.toLowerCase())) ||
      (ins.technicianName && ins.technicianName.toLowerCase().includes(search.toLowerCase())) ||
      (ins.equipment?.qrCode && ins.equipment.qrCode.toLowerCase().includes(search.toLowerCase())) ||
      (ins.equipment?.type && ins.equipment.type.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || ins.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#DCE7F2] shadow-sm dark:bg-slate-900/60 dark:border-slate-800">
        <div className="flex items-center gap-2.5 flex-1 flex-wrap">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by facility, equipment ID, technician..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-[#DCE7F2] rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#007DB8] shadow-sm dark:bg-slate-950 dark:border-slate-800 dark:text-white dark:placeholder-slate-500"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs dark:bg-slate-950 dark:border-slate-800">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                statusFilter === 'ALL'
                  ? 'bg-[#007DB8] text-white shadow-sm dark:bg-amber-500 dark:text-slate-950'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              All ({inspections.length})
            </button>
            <button
              onClick={() => setStatusFilter('PASSED')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                statusFilter === 'PASSED'
                  ? 'bg-emerald-600 text-white shadow-sm dark:bg-emerald-500 dark:text-slate-950'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Passed ({inspections.filter((i) => i.status === 'PASSED').length})
            </button>
            <button
              onClick={() => setStatusFilter('SERVICE_REQUIRED')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                statusFilter === 'SERVICE_REQUIRED'
                  ? 'bg-amber-500 text-white shadow-sm dark:bg-amber-500 dark:text-slate-950'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Action Needed ({inspections.filter((i) => i.status === 'SERVICE_REQUIRED' || i.status === 'FAILED').length})
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenImport && (
            <button
              onClick={onOpenImport}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#007DB8] bg-[#EAF6FF] hover:bg-[#D5EEFF] border border-[#007DB8]/30 transition-all dark:text-amber-300 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 dark:border-amber-500/30"
              title="Import Inspections from Excel (.xlsx)"
            >
              <span>Import Inspections</span>
            </button>
          )}

          <button
            onClick={fetchInspections}
            className="p-2 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors dark:bg-slate-950 dark:border-slate-800 dark:hover:border-slate-700 dark:text-slate-400 dark:hover:text-white"
            title="Refresh Inspections"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#007DB8]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Inspections Table / List */}
      <div className="bg-white border border-[#DCE7F2] rounded-2xl overflow-hidden shadow-sm dark:bg-slate-900/80 dark:border-slate-800 dark:shadow-xl">
        {filteredInspections.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <ShieldCheck className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No Inspections Recorded</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Field inspections logged via the Technician Mobile Form will automatically synchronize here with timestamp, photo evidence, and GPS coordinates.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#DCE7F2] bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-400">
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Facility</th>
                  <th className="py-3.5 px-4">Equipment ID</th>
                  <th className="py-3.5 px-4">Technician</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Condition</th>
                  <th className="py-3.5 px-4 text-right">Certificate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 dark:divide-slate-800/60 dark:text-slate-300">
                {filteredInspections.map((ins) => (
                  <tr key={ins.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 tabular-nums">
                      {new Date(ins.date || ins.createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {ins.building?.name || 'Facility'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[#007DB8] dark:text-cyan-300 font-bold">{ins.equipment?.qrCode || 'Asset'}</span>
                        <span className="text-[10px] text-slate-400">({ins.equipment?.type || 'Extinguisher'})</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                      {ins.technicianName || ins.technician?.fullName || 'Field Technician'}
                    </td>
                    <td className="py-3.5 px-4">
                      {ins.status === 'PASSED' ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold uppercase dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30">
                          PASSED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold uppercase dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30">
                          {ins.status}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                      {ins.overallCondition || 'GOOD'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {ins.building?.id && (
                        <Link
                          href={`/report/${ins.building.id}`}
                          className="text-[#007DB8] hover:underline dark:text-amber-400 dark:hover:text-amber-300 font-bold inline-flex items-center gap-1"
                        >
                          <span>Form-B</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
