'use client';

import React from 'react';
import {
  AlertTriangle,
  Clock,
  Wrench,
  CheckCircle2,
  Plus,
  ArrowRight,
  ShieldAlert,
  Building2,
  Users,
  Check,
  FileSpreadsheet,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { formatStandardDate } from '@/lib/constants/india';

interface DashboardOverviewProps {
  kpis: {
    overdueCount: number;
    dueSoonCount: number;
    openRepairsCount: number;
    inspectionsThisWeek: number;
    totalEquipments?: number;
    totalBuildings?: number;
    activeTechnicians?: number;
  };
  company?: any;
  buildings?: any[];
  onNavigateTab: (tab: string) => void;
  onAddEquipment: () => void;
  onCreateRepairJob: () => void;
  onOpenFeedback: () => void;
  onOpenImport?: () => void;
}

export function DashboardOverview({
  kpis,
  company,
  buildings = [],
  onNavigateTab,
  onAddEquipment,
  onCreateRepairJob,
  onOpenFeedback,
  onOpenImport,
}: DashboardOverviewProps) {
  // Compute First-Time Setup Checklist (1 to 5)
  const hasAgencyDetails = Boolean(
    company?.name &&
    company?.phone &&
    company.name !== 'Vigil Fire & Safety Solutions'
  );
  const hasClientAndBuilding = buildings.length > 0;
  const hasEquipment = (kpis.totalEquipments || 0) > 0;
  const hasTechnician = (kpis.activeTechnicians || 0) > 0;
  const hasInspection = (kpis.inspectionsThisWeek || 0) > 0;

  const checklistItems = [
    {
      id: 1,
      title: 'Add agency details',
      desc: 'Set your agency name, phone number, and address',
      done: hasAgencyDetails,
      action: () => onNavigateTab('SETTINGS'),
      btnText: 'Edit profile',
    },
    {
      id: 2,
      title: 'Add a client and building',
      desc: 'Add the first commercial tower or residential society',
      done: hasClientAndBuilding,
      action: () => onNavigateTab('SITES'),
      btnText: 'Add site',
    },
    {
      id: 3,
      title: 'Add equipment or import Excel',
      desc: 'Register fire extinguishers, hydrants, or upload spreadsheet',
      done: hasEquipment,
      action: () => onAddEquipment(),
      btnText: 'Add equipment',
    },
    {
      id: 4,
      title: 'Invite a technician',
      desc: 'Create login for a field technician to record site visits',
      done: hasTechnician,
      action: () => onNavigateTab('SETTINGS'),
      btnText: 'Add technician',
    },
    {
      id: 5,
      title: 'Record a test inspection',
      desc: 'Record a field check with GPS location and photo proof',
      done: hasInspection,
      action: () => onNavigateTab('INSPECTIONS'),
      btnText: 'Record test inspection',
    },
  ];

  const completedCount = checklistItems.filter((item) => item.done).length;
  const progressPercent = Math.round((completedCount / checklistItems.length) * 100);
  const isChecklistComplete = completedCount === checklistItems.length;

  // Build the "Needs attention" list of top 10 due or overdue items
  const allEquipments: any[] = [];
  buildings.forEach((b) => {
    (b.equipments || []).forEach((eq: any) => {
      allEquipments.push({
        ...eq,
        buildingName: b.name,
        buildingId: b.id,
        clientName: b.client?.name || 'Client',
      });
    });
  });

  const now = new Date();
  const needsAttentionList = allEquipments
    .map((eq) => {
      const diffDays = eq.nextDueDate
        ? Math.ceil((new Date(eq.nextDueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : 0;
      return { ...eq, diffDays };
    })
    .filter((eq) => eq.diffDays <= 30) // Overdue or due within 30 days
    .sort((a, b) => a.diffDays - b.diffDays)
    .slice(0, 10);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Bar: Title, Badge, and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-[#023E8A] dark:text-white tracking-tight">
              Home
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 text-xs font-bold dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800">
              Free testing access
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {company?.name || 'VigilAMC Agency Dashboard'}
          </p>
        </div>

        {/* The Two Primary Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onAddEquipment}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0077B6] hover:bg-[#023E8A] text-white text-xs font-bold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add equipment</span>
          </button>

          <button
            onClick={onCreateRepairJob}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-[#023E8A] border border-slate-200 text-xs font-bold transition-all shadow-sm dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-cyan-300 dark:border-slate-700"
          >
            <Wrench className="w-3.5 h-3.5 text-[#0077B6]" />
            <span>Create repair job</span>
          </button>

          <button
            onClick={onOpenFeedback}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 text-xs font-semibold transition-all dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            title="Tell us what is confusing or missing"
          >
            <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
            <span>Give feedback</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          FOUR NUMBERS ONLY
          ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* 1. Overdue */}
        <div
          onClick={() => onNavigateTab('SITES')}
          className="p-5 rounded-2xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-xs hover:border-rose-300 dark:hover:border-rose-800 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Overdue</span>
            <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
            {kpis.overdueCount}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {kpis.overdueCount === 0 ? 'No overdue equipment' : 'Equipment past due cycle'}
          </p>
        </div>

        {/* 2. Due in 30 days */}
        <div
          onClick={() => onNavigateTab('SITES')}
          className="p-5 rounded-2xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-xs hover:border-amber-300 dark:hover:border-amber-800 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Due in 30 days</span>
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
            {kpis.dueSoonCount}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Upcoming service due
          </p>
        </div>

        {/* 3. Open repairs */}
        <div
          onClick={() => onNavigateTab('REPAIRS')}
          className="p-5 rounded-2xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-xs hover:border-blue-300 dark:hover:border-blue-800 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Open repairs</span>
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-[#0077B6] dark:text-blue-400">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#023E8A] dark:text-blue-400 tracking-tight">
            {kpis.openRepairsCount}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Active repair jobs
          </p>
        </div>

        {/* 4. Inspections this week */}
        <div
          onClick={() => onNavigateTab('INSPECTIONS')}
          className="p-5 rounded-2xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-800 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Inspections this week</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
            {kpis.inspectionsThisWeek}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Completed site checks
          </p>
        </div>

      </div>

      {/* =========================================================================
          FIRST-TIME CHECKLIST (Shown until complete)
          ========================================================================= */}
      {!isChecklistComplete && (
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 dark:from-slate-900 dark:to-[#0a1426] border border-blue-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Getting started with VigilAMC</span>
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                  ({completedCount} of 5 completed)
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Complete these 5 simple steps to get your fire AMC operations fully online.
              </p>
            </div>
            <div className="text-xs font-bold text-[#0077B6] dark:text-cyan-400">
              {progressPercent}% ready
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#0077B6] to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Checklist items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
            {checklistItems.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                  item.done
                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950 dark:bg-emerald-950/20 dark:border-emerald-800/40 dark:text-emerald-300'
                    : 'bg-white border-slate-200 dark:bg-slate-950 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Step {item.id}
                    </span>
                    {item.done ? (
                      <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700" />
                    )}
                  </div>
                  <h4 className="text-xs font-bold line-clamp-1">{item.title}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800/60">
                  {item.done ? (
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Done
                    </span>
                  ) : (
                    <button
                      onClick={item.action}
                      className="text-[11px] font-bold text-[#0077B6] dark:text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <span>{item.btnText}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          NEEDS ATTENTION LIST (Top 10 due or overdue items)
          ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <span>Needs attention</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Next 10 equipment units overdue or due for service in the next 30 days.
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('SITES')}
            className="text-xs font-semibold text-[#0077B6] dark:text-cyan-400 hover:underline flex items-center gap-1"
          >
            <span>View all equipment</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {needsAttentionList.length === 0 ? (
          <div className="py-12 text-center space-y-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">All equipment is up to date</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              No units are overdue or due in the next 30 days. When an inspection deadline approaches, it will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {needsAttentionList.map((item) => {
              const isOverdue = item.diffDays < 0;
              return (
                <div
                  key={item.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        isOverdue ? 'bg-rose-500' : 'bg-amber-500'
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {item.type} ({item.capacity})
                        </span>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {item.qrCode}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {item.buildingName} &bull; {item.location || 'Location not specified'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
                    <div className="text-right">
                      <div
                        className={`text-xs font-bold ${
                          isOverdue
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {isOverdue
                          ? `Overdue by ${Math.abs(item.diffDays)} days`
                          : `Due in ${item.diffDays} days`}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Due: {formatStandardDate(item.nextDueDate)}
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigateTab('REPAIRS')}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#0077B6] hover:text-white text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-[#0077B6] text-xs font-bold transition-all whitespace-nowrap"
                    >
                      Create repair job
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
