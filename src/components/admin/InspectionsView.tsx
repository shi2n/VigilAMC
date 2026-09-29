'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  RefreshCw,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  Scan,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

interface InspectionsViewProps {
  showToast: (msg: string) => void;
  onOpenImport?: () => void;
}

export function InspectionsView({ showToast, onOpenImport }: InspectionsViewProps) {
  const [inspections, setInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PASSED' | 'FAILED' | 'SERVICE_REQUIRED'>('ALL');
  const [search, setSearch] = useState('');

  const fetchInspections = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/inspections');
      const json = await res.json();
      if (res.ok) {
        setInspections(json.inspections || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspections();
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2.5 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by facility, equipment QR, technician..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                statusFilter === 'ALL' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({inspections.length})
            </button>
            <button
              onClick={() => setStatusFilter('PASSED')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                statusFilter === 'PASSED' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Passed ({inspections.filter((i) => i.status === 'PASSED').length})
            </button>
            <button
              onClick={() => setStatusFilter('SERVICE_REQUIRED')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                statusFilter === 'SERVICE_REQUIRED' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
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
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all"
              title="Import Inspections from Excel (.xlsx)"
            >
              <span>Import Inspections</span>
            </button>
          )}

          <button
            onClick={fetchInspections}
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Refresh Inspections"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Inspections Table / List */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {loading && inspections.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-amber-500 mx-auto" />
            <p className="text-sm font-semibold">Loading inspection audit trail...</p>
          </div>
        ) : filteredInspections.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <ShieldCheck className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No Inspections Recorded</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Field inspections logged via the Technician Mobile Scanner will automatically synchronize here with timestamp, photo evidence, and digital verification.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Facility</th>
                  <th className="py-3.5 px-4">Equipment Tag</th>
                  <th className="py-3.5 px-4">Technician</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Condition</th>
                  <th className="py-3.5 px-4 text-right">Certificate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredInspections.map((ins) => (
                  <tr key={ins.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 text-slate-400 tabular-nums">
                      {new Date(ins.date || ins.createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      {ins.building?.name || 'Facility'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-cyan-300 font-bold">{ins.equipment?.qrCode || 'Asset'}</span>
                        <span className="text-[10px] text-slate-500">({ins.equipment?.type || 'Extinguisher'})</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {ins.technicianName || ins.technician?.fullName || 'Field Technician'}
                    </td>
                    <td className="py-3.5 px-4">
                      {ins.status === 'PASSED' ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase">
                          PASSED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold uppercase">
                          {ins.status}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {ins.overallCondition || 'GOOD'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {ins.building?.id && (
                        <Link
                          href={`/report/${ins.building.id}`}
                          className="text-amber-400 hover:text-amber-300 font-bold inline-flex items-center gap-1"
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
