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
  onOpenImport?: (type?: any) => void;
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
  onOpenImport,
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
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <h2 className="text-base sm:text-lg font-black text-[#023E8A] dark:text-white tracking-tight flex items-center gap-2">
              <span>Operational Performance Radar</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#EAF6FF] text-[#007DB8] border border-[#007DB8]/30 text-[10px] font-extrabold uppercase dark:bg-blue-950/60 dark:text-blue-300">
                Real-Time Telemetry
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live aggregated metrics across your contracted facilities and technician workforce.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onOpenImport && (
              <button
                onClick={() => onOpenImport('FIRE_ASSETS')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-[#007DB8] border border-[#DCE7F2] hover:border-[#007DB8]/40 text-xs font-bold transition-all shadow-sm dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-amber-400 dark:border-amber-500/30"
                title="Import Data from Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Import Excel</span>
              </button>
            )}

            <button
              onClick={() => onOpenExport('FIRE_ASSETS')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 border border-emerald-200 text-xs font-bold transition-all shadow-sm dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-emerald-400 dark:border-emerald-500/30"
              title="Export Current View Data to Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export Excel</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          
          {/* 1. Total Clients */}
          <div
            onClick={() => navigate('CLIENTS')}
            className="p-4 rounded-2xl bg-white border border-[#DCE7F2] hover:border-[#007DB8]/50 cursor-pointer transition-all shadow-sm hover:shadow-md group space-y-1.5 dark:bg-slate-900/90 dark:border-slate-800 dark:hover:border-blue-500/40"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total Clients
              </span>
              <div className="p-1.5 rounded-lg bg-blue-50 text-[#007DB8] group-hover:scale-110 transition-transform dark:bg-blue-500/10 dark:text-blue-400">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#023E8A] dark:text-white">
              {kpis.totalClients}
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block group-hover:text-[#007DB8] dark:group-hover:text-blue-400 font-semibold transition-colors">
              Managed Societies →
            </span>
          </div>

          {/* 2. Total Buildings */}
          <div
            onClick={() => navigate('BUILDINGS')}
            className="p-4 rounded-2xl bg-white border border-[#DCE7F2] hover:border-[#007DB8]/50 cursor-pointer transition-all shadow-sm hover:shadow-md group space-y-1.5 dark:bg-slate-900/90 dark:border-slate-800 dark:hover:border-blue-500/40"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Buildings / Towers
              </span>
              <div className="p-1.5 rounded-lg bg-indigo-50 text-[#023E8A] group-hover:scale-110 transition-transform dark:bg-indigo-500/10 dark:text-indigo-400">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#023E8A] dark:text-white">
              {kpis.totalBuildings}
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block group-hover:text-[#007DB8] dark:group-hover:text-blue-400 font-semibold transition-colors">
              Premises Roster →
            </span>
          </div>

          {/* 3. Total Fire Assets */}
          <div
            onClick={() => navigate('FIRE_ASSETS')}
            className="p-4 rounded-2xl bg-white border border-[#DCE7F2] hover:border-rose-400 cursor-pointer transition-all shadow-sm hover:shadow-md group space-y-1.5 dark:bg-slate-900/90 dark:border-slate-800 dark:hover:border-rose-500/40"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Fire Assets
              </span>
              <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600 group-hover:scale-110 transition-transform dark:bg-red-500/10 dark:text-red-400">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {kpis.totalEquipments}
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block group-hover:text-rose-600 dark:group-hover:text-rose-400 font-semibold transition-colors">
              Tagged Equipment →
            </span>
          </div>

          {/* 4. Active Technicians */}
          <div
            onClick={() => navigate('TECHNICIANS')}
            className="p-4 rounded-2xl bg-white border border-[#DCE7F2] hover:border-sky-400 cursor-pointer transition-all shadow-sm hover:shadow-md group space-y-1.5 dark:bg-slate-900/90 dark:border-slate-800 dark:hover:border-cyan-500/40"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Active Techs
              </span>
              <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600 group-hover:scale-110 transition-transform dark:bg-cyan-500/10 dark:text-cyan-400">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {kpis.activeTechnicians}
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block group-hover:text-sky-600 dark:group-hover:text-cyan-400 font-semibold transition-colors">
              Assigned Field Staff →
            </span>
          </div>

          {/* 5. Open Work Orders */}
          <div
            onClick={() => navigate('WORK_ORDERS')}
            className="p-4 rounded-2xl bg-white border border-[#DCE7F2] hover:border-amber-400 cursor-pointer transition-all shadow-sm hover:shadow-md group space-y-1.5 dark:bg-slate-900/90 dark:border-slate-800 dark:hover:border-amber-500/40"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Open Work Orders
              </span>
              <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform dark:bg-purple-500/10 dark:text-purple-400">
                <Wrench className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {kpis.openWorkOrders}
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block group-hover:text-amber-600 dark:group-hover:text-amber-400 font-semibold transition-colors">
              Dispatch Board →
            </span>
          </div>

          {/* 6. Due Inspections (<30d) */}
          <div
            onClick={() => navigate('INSPECTIONS')}
            className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 hover:border-amber-400 cursor-pointer transition-all shadow-sm hover:shadow-md group space-y-1.5 dark:bg-amber-950/20 dark:border-amber-500/30 dark:hover:border-amber-500/60"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                Due Soon (&lt;30d)
              </span>
              <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700 group-hover:scale-110 transition-transform dark:bg-amber-500/10 dark:text-amber-400">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-900 dark:text-amber-400">
              {kpis.dueInspections}
            </div>
            <span className="text-[10px] text-amber-700 dark:text-amber-300/80 block group-hover:underline font-semibold transition-colors">
              Action Pending →
            </span>
          </div>

          {/* 7. Overdue Inspections */}
          <div
            onClick={() => navigate('INSPECTIONS')}
            className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 hover:border-rose-400 cursor-pointer transition-all shadow-sm hover:shadow-md group space-y-1.5 dark:bg-red-950/20 dark:border-red-500/30 dark:hover:border-red-500/60"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-rose-800 dark:text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                Overdue
              </span>
              <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700 group-hover:scale-110 transition-transform dark:bg-red-500/10 dark:text-red-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-rose-900 dark:text-red-400">
              {kpis.overdueInspections}
            </div>
            <span className="text-[10px] text-rose-700 dark:text-red-300/80 block group-hover:underline font-semibold transition-colors">
              Statutory Non-Compliance →
            </span>
          </div>

          {/* 8. Compliance Rate (%) */}
          <div
            onClick={() => navigate('REPORTS')}
            className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 hover:border-emerald-400 cursor-pointer transition-all shadow-sm hover:shadow-md group space-y-1.5 dark:bg-emerald-950/20 dark:border-emerald-500/30 dark:hover:border-emerald-500/60"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Compliance Rate
              </span>
              <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 group-hover:scale-110 transition-transform dark:bg-emerald-500/10 dark:text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-900 dark:text-emerald-400">
              {kpis.complianceRate}%
            </div>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-300/80 block group-hover:underline font-semibold transition-colors">
              Form-B Audit Ready →
            </span>
          </div>

        </div>
      </div>

      {/* =========================================================================
          2. SUBSCRIPTION QUOTA & CAPACITY CARD
      ========================================================================= */}
      {currentSub && (
        <div className="rounded-2xl bg-gradient-to-r from-blue-50/80 via-white to-sky-50/50 border border-[#DCE7F2] p-5 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5 dark:bg-slate-900/90 dark:border-slate-800 dark:from-slate-900 dark:to-slate-900 dark:shadow-xl">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#007DB8]/15 to-[#073F8F]/15 border border-[#007DB8]/30 flex items-center justify-center text-[#007DB8] shrink-0 dark:from-amber-500/20 dark:to-orange-500/20 dark:border-amber-500/30 dark:text-amber-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#023E8A] dark:text-white">
                  {currentSub.plan?.name || 'Basic AMC'}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30">
                  {currentSub.subscription?.billingCycle || 'ANNUAL'} (Active)
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Multi-tenant capacity limits actively guarded across technicians, buildings, and fire equipment.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap text-xs">
            {/* Tech Seats */}
            <div className="space-y-1 min-w-[140px]">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">Tech Seats:</span>
                <span className="text-slate-900 dark:text-white font-bold">
                  {currentSub.usage?.technicians?.active} / {currentSub.usage?.technicians?.maxNumeric >= 999999 ? '∞' : currentSub.usage?.technicians?.max}
                </span>
              </div>
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    currentSub.usage?.technicians?.isAtLimit ? 'bg-amber-500' : 'bg-[#007DB8]'
                  }`}
                  style={{ width: `${Math.min(100, currentSub.usage?.technicians?.percentUsed || 0)}%` }}
                />
              </div>
            </div>

            {/* Towers */}
            <div className="space-y-1 min-w-[140px]">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">Buildings:</span>
                <span className="text-slate-900 dark:text-white font-bold">
                  {currentSub.usage?.towers?.count} / {currentSub.usage?.towers?.maxNumeric >= 999999 ? '∞' : currentSub.usage?.towers?.max}
                </span>
              </div>
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
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
                <span className="text-slate-500 dark:text-slate-400 font-semibold">Equipment Assets:</span>
                <span className="text-slate-900 dark:text-white font-bold">
                  {currentSub.usage?.assets?.count} / {currentSub.usage?.assets?.maxNumeric >= 999999 ? '∞' : currentSub.usage?.assets?.max}
                </span>
              </div>
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
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
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-[#007DB8] border border-[#DCE7F2] text-xs font-bold transition-colors ml-auto shadow-sm dark:bg-amber-500/10 dark:hover:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30"
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
        <div className="lg:col-span-2 rounded-2xl bg-white border border-[#DCE7F2] p-5 shadow-sm space-y-4 dark:bg-slate-900/90 dark:border-slate-800 dark:shadow-xl">
          <div className="flex items-center justify-between border-b border-[#DCE7F2] dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-[#023E8A] dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Facilities Requiring Statutory Attention</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Premises with overdue inspections or half-yearly filing dates approaching.
              </p>
            </div>
            <button
              onClick={() => navigate('BUILDINGS')}
              className="text-xs text-[#007DB8] dark:text-amber-400 hover:underline font-bold"
            >
              View All ({buildings.length}) →
            </button>
          </div>

          {overdueBuildings.length === 0 && dueSoonBuildings.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="text-sm font-bold text-slate-900 dark:text-white">All Contracted Facilities Compliant</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                No facilities have overdue services. All inspection logs are up to date under NBC 2016 regulations and state fire safety rules.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {[...overdueBuildings, ...dueSoonBuildings].slice(0, 5).map((b) => (
                <div key={b.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 dark:text-white text-xs truncate">
                        {b.name}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          b.overallStatus === 'OVERDUE'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/40'
                            : 'bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40'
                        }`}
                      >
                        {b.overallStatus === 'OVERDUE' ? 'OVERDUE' : 'DUE SOON'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {b.client?.name || 'Direct Client'} • {b.totalEquipments} assets • Next filing: {b.nextFilingDueDate ? new Date(b.nextFilingDueDate).toLocaleDateString('en-IN') : 'Bi-Annual'}
                    </p>
                  </div>

                  <button
                    onClick={() => navigate('BUILDINGS')}
                    className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold shrink-0 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200"
                  >
                    Inspect
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Quick Operational Actions */}
        <div className="rounded-2xl bg-white border border-[#DCE7F2] p-5 shadow-sm space-y-4 dark:bg-slate-900/90 dark:border-slate-800 dark:shadow-xl">
          <div className="border-b border-[#DCE7F2] dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-[#023E8A] dark:text-white">Quick Actions</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Fast workflows for day-to-day operations.</p>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={onAddBuilding}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-[#EAF6FF] border border-slate-200/80 hover:border-[#007DB8]/40 text-left transition-all group dark:bg-slate-950 dark:hover:bg-slate-800 dark:border-slate-800"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-50 text-[#023E8A] group-hover:scale-110 transition-transform dark:bg-amber-500/10 dark:text-amber-400">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-xs">Add Client &amp; Building</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Register new society or premises</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#007DB8] dark:group-hover:text-amber-400 transition-colors" />
            </button>

            <button
              onClick={() => navigate('TECHNICIANS')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-[#EAF6FF] border border-slate-200/80 hover:border-[#007DB8]/40 text-left transition-all group dark:bg-slate-950 dark:hover:bg-slate-800 dark:border-slate-800"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-sky-50 text-sky-600 group-hover:scale-110 transition-transform dark:bg-cyan-500/10 dark:text-cyan-400">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-xs">Manage Technicians</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Roster, seats, and assignments</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#007DB8] dark:group-hover:text-amber-400 transition-colors" />
            </button>

            <button
              onClick={() => navigate('WORK_ORDERS')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-[#EAF6FF] border border-slate-200/80 hover:border-[#007DB8]/40 text-left transition-all group dark:bg-slate-950 dark:hover:bg-slate-800 dark:border-slate-800"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform dark:bg-purple-500/10 dark:text-purple-400">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-xs">Create Work Order</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Dispatch repair or refill job</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#007DB8] dark:group-hover:text-amber-400 transition-colors" />
            </button>

            <Link
              href="/assets/print-qr"
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-[#EAF6FF] border border-slate-200/80 hover:border-[#007DB8]/40 text-left transition-all group dark:bg-slate-950 dark:hover:bg-slate-800 dark:border-slate-800"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform dark:bg-emerald-500/10 dark:text-emerald-400">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-xs">Equipment Schedule</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Generate printable asset schedules</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#007DB8] dark:group-hover:text-amber-400 transition-colors" />
            </Link>

            <button
              onClick={() => onOpenExport('FIRE_ASSETS')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200 text-left transition-all group dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 dark:border-emerald-500/30"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 group-hover:scale-110 transition-transform dark:bg-emerald-500/10 dark:text-emerald-400">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-emerald-800 dark:text-emerald-400 text-xs">Export to Excel (.xlsx)</div>
                  <div className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80">Clients, Buildings, Assets, Reports</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
