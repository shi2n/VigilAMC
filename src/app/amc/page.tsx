'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BadgeIndianRupee,
  Plus,
  TrendingUp,
  Calendar,
  Building2,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck2,
  Calculator,
  RefreshCw
} from 'lucide-react';

export default function AmcPage() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newModalOpen, setNewModalOpen] = useState(false);

  // New contract form
  const [form, setForm] = useState({
    buildingId: '',
    contractNumber: '',
    annualValue: 60000,
    totalVisitsPerYear: 4,
    paymentStatus: 'PAID',
    status: 'ACTIVE',
    scopeSummary: 'Comprehensive Extinguisher Maintenance, Hydrant Testing, and Bi-Annual Form-B Filing',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [amcRes, bldRes] = await Promise.all([
        fetch('/api/amc'),
        fetch('/api/buildings'),
      ]);
      const amcData = await amcRes.json();
      const bldData = await bldRes.json();

      setContracts(amcData.contracts || []);
      setAnalytics(amcData.analytics);
      const blds = bldData.buildings || [];
      setBuildings(blds);
      if (blds.length > 0 && !form.buildingId) {
        setForm((prev) => ({ ...prev, buildingId: blds[0].id }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/amc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setNewModalOpen(false);
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              AMC Contracts & Recurring Revenue
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
              ₹5k–₹10k/mo B2B Model
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Track annual maintenance contracts, quarterly visit schedules, and predictable recurring revenue.
          </p>
        </div>

        <button
          onClick={() => setNewModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-sm shadow-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New AMC Contract</span>
        </button>
      </div>

      {/* Revenue Metrics Row */}
      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
              <span>Projected Monthly MRR</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">₹{analytics.projectedMRR.toLocaleString('en-IN')}</span>
              <span className="text-xs text-emerald-400 font-medium">/mo</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Based on active annualized maintenance contracts
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
              <span>Annual Contract Book</span>
              <BadgeIndianRupee className="w-4 h-4 text-red-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">
                ₹{(analytics.totalActiveValue / 100000).toFixed(2)} Lakhs
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              {analytics.totalActiveContracts} active maintenance agreements
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
              <span>Renewals in Pipeline</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-400">{analytics.pendingRenewals}</span>
              <span className="text-xs text-slate-400">Contracts</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Form-B and Fire NOC renewal alerts active
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-red-950/40 to-slate-900 border border-red-900/60">
            <div className="flex items-center justify-between text-xs font-semibold text-red-300 mb-2">
              <span>SaaS Growth Goal</span>
              <Calculator className="w-4 h-4 text-red-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">30 Clients</span>
              <span className="text-xs text-emerald-400 font-bold">≈ ₹2L/mo</span>
            </div>
            <p className="text-[11px] text-red-300/80 mt-2">
              Mandatory legal compliance drives 95%+ AMC retention
            </p>
          </div>
        </div>
      )}

      {/* Contracts Table */}
      <div className="bg-[#0d1322] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BadgeIndianRupee className="w-5 h-5 text-emerald-400" />
            <h2 className="font-bold text-white text-base">Active AMC Agreements ({contracts.length})</h2>
          </div>
          <span className="text-xs text-slate-400">
            Includes Quarterly Inspections & Form-B Filing
          </span>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-red-500" />
          </div>
        ) : contracts.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <BadgeIndianRupee className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white">No AMC contracts logged</h3>
            <p className="text-xs text-slate-500 mt-1">Create an AMC contract to start tracking recurring revenue.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Contract Ref</th>
                  <th className="py-3 px-4">Client Building</th>
                  <th className="py-3 px-4">Annual Value</th>
                  <th className="py-3 px-4">Visits Progress</th>
                  <th className="py-3 px-4">Validity Period</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {contracts.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      {c.contractNumber}
                    </td>
                    <td className="py-3 px-4">
                      <Link href={`/buildings/${c.building?.id}`} className="font-semibold text-slate-100 hover:text-red-400">
                        {c.building?.name}
                      </Link>
                      <div className="text-[11px] text-slate-400">
                        {c.building?._count?.assets || 0} Extinguishers • {c.building?.contactPerson}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-white text-sm">₹{c.annualValue.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] text-slate-400 block">₹{Math.round(c.annualValue / 12)}/mo</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200">
                        {c.visitsCompleted} of {c.totalVisitsPerYear} Completed
                      </div>
                      <div className="w-24 bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full"
                          style={{ width: `${Math.round((c.visitsCompleted / c.totalVisitsPerYear) * 100)}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <div>{new Date(c.startDate).toLocaleDateString()} – {new Date(c.endDate).toLocaleDateString()}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.paymentStatus === 'PAID'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {c.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.status === 'ACTIVE'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/buildings/${c.building?.id}`}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition-colors"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New AMC Modal */}
      {newModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BadgeIndianRupee className="w-5 h-5 text-red-500" />
                <h3 className="font-bold text-white text-base">Create Fire Safety AMC Agreement</h3>
              </div>
              <button onClick={() => setNewModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateContract} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Client Building *</label>
                <select
                  required
                  value={form.buildingId}
                  onChange={(e) => setForm({ ...form, buildingId: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white"
                >
                  {buildings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.assets?.length || 0} Extinguishers)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Contract Number</label>
                  <input
                    type="text"
                    placeholder="e.g. AMC/2026/054"
                    value={form.contractNumber}
                    onChange={(e) => setForm({ ...form, contractNumber: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Annual Contract Value (₹) *</label>
                  <input
                    type="number"
                    required
                    value={form.annualValue}
                    onChange={(e) => setForm({ ...form, annualValue: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Visits Included per Year</label>
                  <select
                    value={form.totalVisitsPerYear}
                    onChange={(e) => setForm({ ...form, totalVisitsPerYear: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white"
                  >
                    <option value={4}>4 Quarterly Visits</option>
                    <option value={2}>2 Bi-Annual Visits</option>
                    <option value={12}>12 Monthly Inspections</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Payment Status</label>
                  <select
                    value={form.paymentStatus}
                    onChange={(e) => setForm({ ...form, paymentStatus: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white"
                  >
                    <option value="PAID">Paid in Full</option>
                    <option value="PARTIAL">Partial Payment</option>
                    <option value="PENDING">Pending Invoice</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Contract Scope Summary</label>
                <textarea
                  rows={2}
                  value={form.scopeSummary}
                  onChange={(e) => setForm({ ...form, scopeSummary: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setNewModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold shadow-md"
                >
                  Activate AMC Contract
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
