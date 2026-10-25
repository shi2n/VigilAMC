'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  RefreshCw,
  Search,
  Users,
  ShieldCheck,
  Building2,
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
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
          <CheckCircle2 className="w-3 h-3" />
          {action}
        </span>
      );
    }
    if (action.includes('PASSWORD') || action.includes('AUTH') || action.includes('LOGIN')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold">
          <KeyRound className="w-3 h-3" />
          {action}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FFF0E6] text-[#C2410C] border border-[#C2410C]/30 text-[10px] font-bold">
        <Clock className="w-3 h-3" />
        {action}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filter header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass-panel-dense p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3 flex-1 flex-wrap">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search audit trail by keyword, asset, or technician..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-[#FED7AA] rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#C2410C] shadow-sm"
            />
          </div>

          <select
            value={selectedTech}
            onChange={(e) => setSelectedTech(e.target.value)}
            className="px-3 py-2 bg-white border border-[#FED7AA] rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#C2410C] shadow-sm"
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
          className="p-2 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors self-end sm:self-auto"
          title="Refresh Log"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#C2410C]' : ''}`} />
        </button>
      </div>

      {/* Activity Timeline List */}
      <div className="bg-white border border-[#FED7AA] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#FED7AA] bg-slate-50/80 flex items-center justify-between ">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#C2410C]" />
            <span>Field Activity &amp; Compliance Audit Feed</span>
          </h3>
          <span className="text-[11px] text-slate-500">
            {filteredActivities.length} event{filteredActivities.length === 1 ? '' : 's'} recorded
          </span>
        </div>

        {loading && activities.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-[#C2410C] mx-auto" />
            <p className="text-sm font-semibold">Loading activity logs...</p>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Clock className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-900">No activity events recorded yet.</p>
            <p className="text-xs text-slate-500">
              When technicians record inspections or complete work orders, audit records will stream here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredActivities.map((act) => (
              <div key={act.id} className="p-4 sm:p-5 hover:bg-[#FFF0E6]/80 transition-colors space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2.5">
                    {getActionBadge(act.action)}
                    <span className="text-xs font-bold text-slate-900">
                      {act.technician?.name || act.userEmail || 'System Agent'}
                    </span>
                    {act.entityType && (
                      <span className="text-[10px] text-slate-400 font-mono">[{act.entityType}]</span>
                    )}
                  </div>

                  <span className="text-[11px] text-slate-500 tabular-nums flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
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

                <p className="text-xs text-slate-600 pl-1 leading-relaxed">
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
