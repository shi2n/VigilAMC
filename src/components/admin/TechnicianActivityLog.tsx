'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  RefreshCw,
  Search,
  Users,
  ShieldCheck,
  Building2,
  Scan,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  FileText
} from 'lucide-react';

export function TechnicianActivityLog() {
  const [activities, setActivities] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTech, setSelectedTech] = useState('ALL');
  const [search, setSearch] = useState('');

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (selectedTech !== 'ALL') query.set('technicianId', selectedTech);

      const res = await fetch(`/api/admin/technicians/activity?${query.toString()}`);
      const json = await res.json();
      if (res.ok) {
        setActivities(json.activities || []);
        setTechnicians(json.technicians || []);
      }
    } catch (e) {
      console.error('Error fetching activities:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [selectedTech]);

  const filteredActivities = activities.filter((act) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      act.action.toLowerCase().includes(q) ||
      (act.details && act.details.toLowerCase().includes(q)) ||
      (act.technician?.name && act.technician.name.toLowerCase().includes(q)) ||
      (act.userEmail && act.userEmail.toLowerCase().includes(q))
    );
  });

  const getActionBadge = (action: string) => {
    if (action.includes('INSPECTION') || action.includes('SERVICE')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
          <CheckCircle2 className="w-3 h-3" />
          {action}
        </span>
      );
    }
    if (action.includes('SCAN')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold">
          <Scan className="w-3 h-3" />
          {action}
        </span>
      );
    }
    if (action.includes('PASSWORD') || action.includes('AUTH') || action.includes('LOGIN')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
          <KeyRound className="w-3 h-3" />
          {action}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold">
        <Clock className="w-3 h-3" />
        {action}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filter header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search audit trail by keyword, asset, or technician..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <select
            value={selectedTech}
            onChange={(e) => setSelectedTech(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="ALL">All Technicians ({technicians.length})</option>
            {technicians.map((t) => (
              <option key={t.id} value={t.id}>
                {t.fullName || t.email}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={fetchActivities}
          className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-colors self-end sm:self-auto"
          title="Refresh Log"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Activity Timeline List */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Field Activity & Compliance Audit Feed</span>
          </h3>
          <span className="text-[11px] text-slate-500">
            {filteredActivities.length} event{filteredActivities.length === 1 ? '' : 's'} recorded
          </span>
        </div>

        {loading && activities.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-amber-500 mx-auto" />
            <p className="text-sm font-semibold">Loading activity logs...</p>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Clock className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-slate-300">No activity events recorded yet.</p>
            <p className="text-xs text-slate-500">
              When technicians scan equipment, log inspections, or complete work orders, audit records will stream here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {filteredActivities.map((act) => (
              <div key={act.id} className="p-4 sm:p-5 hover:bg-slate-800/30 transition-colors space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2.5">
                    {getActionBadge(act.action)}
                    <span className="text-xs font-bold text-white">
                      {act.technician?.name || act.userEmail || 'System Agent'}
                    </span>
                    {act.entityType && (
                      <span className="text-[10px] text-slate-500 font-mono">[{act.entityType}]</span>
                    )}
                  </div>

                  <span className="text-[11px] text-slate-400 tabular-nums flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {new Date(act.createdAt).toLocaleString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                </div>

                <p className="text-xs text-slate-300 pl-1 leading-relaxed">
                  {act.details || 'Event logged successfully.'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
