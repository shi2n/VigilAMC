'use client';

import React from 'react';
import {
  Users,
  Building2,
  Flame,
  Wrench,
  Clock,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Plus,
  FileSpreadsheet,
  Printer,
  Sparkles,
  TrendingUp,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

interface DashboardOverviewProps {
  kpis: {
    totalClients: number;
    totalBuildings: number;
    totalEquipments: number;
    activeTechnicians: number;
    openWorkOrders: number;
    dueInspections: number;
    overdueInspections: number;
    complianceRate: number;
  };
  subscriptionData?: any;
  subscription?: any;
  company?: any;
  buildings?: any[];
  onNavigateTab?: (tab: string) => void;
  onNavigate?: (tab: any) => void;
  onOpenExport?: (type?: string) => void;
  onAddBuilding?: () => void;
}

export function DashboardOverview({
  kpis,
  subscriptionData,
  subscription,
  company,
  buildings = [],
  onNavigateTab,
  onNavigate,
  onOpenExport = () => {},
  onAddBuilding,
}: DashboardOverviewProps) {
  const currentSub = subscription ?? subscriptionData;
  const navigate = (tab: string) => {
    if (onNavigate) onNavigate(tab);
    else if (onNavigateTab) onNavigateTab(tab);
  };
  const overdueBuildings = buildings.filter((b) => b.overallStatus === 'OVERDUE');
  const dueSoonBuildings = buildings.filter((b) => b.overallStatus === 'DUE_SOON');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* =========================================================================
          1. TOP 8 OPERATIONAL KPI CARDS
      ========================================================================= */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
              <span>Operational Performance Radar</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-extrabold uppercase">
                Real-Time Telemetry
              </span>
            </h2>
            <p className="text-xs text-slate-400">Live aggregated metrics across your contracted facilities and workforce.</p>
          </div>

          <button
            onClick={() => onOpenExport('FIRE_ASSETS')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export Excel</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          
          {/* 1. Total Clients */}
          <div
            onClick={() => navigate('CLIENTS')}
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 cursor-pointer transition-all shadow-xl group space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Clients</span>
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              {kpis.totalClients}
            </div>
            <span className="text-[10px] text-slate-400 block group-hover:text-amber-400 transition-colors">
              Managed Societies →
            </span>
          </div>

          {/* 2. Total Buildings */}
          <div
            onClick={() => navigate('BUILDINGS')}
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 cursor-pointer transition-all shadow-xl group space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Buildings / Towers</span>
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              {kpis.totalBuildings}
            </div>
            <span className="text-[10px] text-slate-400 block group-hover:text-amber-400 transition-colors">
              Premises Roster →
            </span>
          </div>

          {/* 3. Total Fire Assets */}
          <div
            onClick={() => navigate('FIRE_ASSETS')}
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 cursor-pointer transition-all shadow-xl group space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Fire Assets</span>
              <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400 group-hover:scale-110 transition-transform">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              {kpis.totalEquipments}
            </div>
            <span className="text-[10px] text-slate-400 block group-hover:text-amber-400 transition-colors">
              Tagged Equipment →
            </span>
          </div>

          {/* 4. Active Technicians */}
          <div
            onClick={() => navigate('TECHNICIANS')}
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 cursor-pointer transition-all shadow-xl group space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Technicians</span>
              <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              {kpis.activeTechnicians}
            </div>
            <span className="text-[10px] text-slate-400 block group-hover:text-amber-400 transition-colors">
              Assigned Field Staff →
            </span>
          </div>

          {/* 5. Open Work Orders */}
          <div
            onClick={() => navigate('WORK_ORDERS')}
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 cursor-pointer transition-all shadow-xl group space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Open Work Orders</span>
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                <Wrench className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              {kpis.openWorkOrders}
            </div>
            <span className="text-[10px] text-slate-400 block group-hover:text-amber-400 transition-colors">
              Dispatch Board →
            </span>
          </div>

          {/* 6. Due Inspections (<30d) */}
          <div
            onClick={() => navigate('INSPECTIONS')}
            className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 hover:border-amber-500/60 cursor-pointer transition-all shadow-xl group space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                Due Soon (&lt;30d)
              </span>
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400">
              {kpis.dueInspections}
            </div>
            <span className="text-[10px] text-amber-300/80 block group-hover:text-white transition-colors">
              Action Pending →
            </span>
          </div>

          {/* 7. Overdue Inspections */}
          <div
            onClick={() => navigate('INSPECTIONS')}
            className="p-4 rounded-2xl bg-red-950/20 border border-red-500/30 hover:border-red-500/60 cursor-pointer transition-all shadow-xl group space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                Overdue
              </span>
              <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400 group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-red-400">
              {kpis.overdueInspections}
            </div>
            <span className="text-[10px] text-red-300/80 block group-hover:text-white transition-colors">
              Statutory Non-Compliance →
            </span>
          </div>

          {/* 8. Compliance Rate (%) */}
          <div
            onClick={() => navigate('REPORTS')}
            className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 hover:border-emerald-500/60 cursor-pointer transition-all shadow-xl group space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Compliance Rate
              </span>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">
              {kpis.complianceRate}%
            </div>
            <span className="text-[10px] text-emerald-300/80 block group-hover:text-white transition-colors">
              Form-B Audit Ready →
            </span>
          </div>

        </div>
      </div>

      {/* =========================================================================
          2. SUBSCRIPTION QUOTA & CAPACITY CARD
      ========================================================================= */}
      {currentSub && (
        <div className="tactile-card rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{currentSub.plan?.name || 'Basic AMC'}</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                  {currentSub.subscription?.billingCycle || 'ANNUAL'} (Active)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Multi-tenant capacity limits actively guarded across technicians, buildings, and fire equipment.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap text-xs">
            {/* Tech Seats */}
            <div className="space-y-1 min-w-[140px]">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400 font-semibold">Tech Seats:</span>
                <span className="text-white font-bold">
                  {currentSub.usage?.technicians?.active} / {currentSub.usage?.technicians?.maxNumeric >= 999999 ? '∞' : currentSub.usage?.technicians?.max}
                </span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    currentSub.usage?.technicians?.isAtLimit ? 'bg-amber-500' : 'bg-cyan-500'
                  }`}
                  style={{ width: `${Math.min(100, currentSub.usage?.technicians?.percentUsed || 0)}%` }}
                />
              </div>
            </div>

            {/* Towers */}
            <div className="space-y-1 min-w-[140px]">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400 font-semibold">Buildings / Towers:</span>
                <span className="text-white font-bold">
                  {currentSub.usage?.towers?.count} / {currentSub.usage?.towers?.maxNumeric >= 999999 ? '∞' : currentSub.usage?.towers?.max}
                </span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    currentSub.usage?.towers?.isAtLimit ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, currentSub.usage?.towers?.percentUsed || 0)}%` }}
                />
              </div>
            </div>

            {/* Assets */}
            <div className="space-y-1 min-w-[140px]">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400 font-semibold">Equipment QRs:</span>
                <span className="text-white font-bold">
                  {currentSub.usage?.assets?.count} / {currentSub.usage?.assets?.maxNumeric >= 999999 ? '∞' : currentSub.usage?.assets?.max}
                </span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    currentSub.usage?.assets?.isAtLimit ? 'bg-amber-500' : 'bg-purple-500'
                  }`}
                  style={{ width: `${Math.min(100, currentSub.usage?.assets?.percentUsed || 0)}%` }}
                />
              </div>
            </div>

            <button
              onClick={() => navigate('AGENCY')}
              className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold transition-colors ml-auto"
            >
              Subscription Details →
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          3. COMPLIANCE ALERTS & QUICK ACTION WORKFLOWS
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Buildings Requiring Attention */}
        <div className="lg:col-span-2 tactile-card rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Facilities Requiring Statutory Attention</span>
              </h3>
              <p className="text-xs text-slate-400">Premises with overdue inspections or half-yearly filing dates approaching.</p>
            </div>
            <button
              onClick={() => navigate('BUILDINGS')}
              className="text-xs text-amber-400 hover:underline font-bold"
            >
              View All ({buildings.length}) →
            </button>
          </div>

          {overdueBuildings.length === 0 && dueSoonBuildings.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <p className="text-sm font-bold text-white">All Contracted Facilities Compliant</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No facilities have overdue services. All inspection logs are up to date under Maharashtra Fire Prevention regulations.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {[...overdueBuildings, ...dueSoonBuildings].slice(0, 5).map((b) => (
                <div key={b.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">{b.name}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          b.overallStatus === 'OVERDUE'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {b.overallStatus === 'OVERDUE' ? 'OVERDUE' : 'DUE SOON'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {b.client?.name || 'Direct Client'} • {b.totalEquipments} assets • Next filing: {b.nextFilingDueDate ? new Date(b.nextFilingDueDate).toLocaleDateString('en-IN') : 'Bi-Annual'}
                    </p>
                  </div>

                  <button
                    onClick={() => navigate('BUILDINGS')}
                    className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold shrink-0"
                  >
                    Inspect
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Quick Operational Actions */}
        <div className="tactile-card rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-2xl space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white">Quick Actions</h3>
            <p className="text-xs text-slate-400">Fast workflows for day-to-day operations.</p>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={onAddBuilding}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white text-xs">Add Client &amp; Building</div>
                  <div className="text-[11px] text-slate-400">Register new society or premises</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
            </button>

            <button
              onClick={() => navigate('TECHNICIANS')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white text-xs">Manage Technicians</div>
                  <div className="text-[11px] text-slate-400">Roster, seats, and assignments</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
            </button>

            <button
              onClick={() => navigate('WORK_ORDERS')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white text-xs">Create Work Order</div>
                  <div className="text-[11px] text-slate-400">Dispatch repair or refill job</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
            </button>

            <Link
              href="/assets/print-qr"
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white text-xs">Print QR Labels</div>
                  <div className="text-[11px] text-slate-400">Generate weatherproof asset tags</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
            </Link>

            <button
              onClick={() => onOpenExport('FIRE_ASSETS')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-500/30 text-left transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-emerald-400 text-xs">Export to Excel (.xlsx)</div>
                  <div className="text-[11px] text-emerald-300/80">Clients, Buildings, Assets, Reports</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
