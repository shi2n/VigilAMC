'use client';

import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
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
  Flame,
  MessageSquare,
} from 'lucide-react';
import { formatStandardDate } from '@/lib/constants/india';
import { NumberTicker } from '@/components/ui/number-ticker';

interface DashboardOverviewProps {
  kpis: {
    totalClients?: number;
    totalBuildings?: number;
    totalEquipments?: number;
    overdueCount: number;
    dueSoonCount: number;
    openRepairsCount: number;
    inspectionsThisWeek: number;
    totalInspections?: number;
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
}: DashboardOverviewProps) {
  const prefersReducedMotion = useReducedMotion();

  // Compute First-Time Setup Checklist (1 to 5)
  const hasAgencyDetails = Boolean(
    company?.name &&
    company?.phone &&
    company.name !== 'Vigil Fire & Safety Solutions'
  );
  const hasClientAndBuilding = (kpis.totalBuildings || buildings.length) > 0;
  const hasEquipment = (kpis.totalEquipments || 0) > 0;
  const hasTechnician = (kpis.activeTechnicians || 0) > 0;
  const hasInspection = (kpis.totalInspections || kpis.inspectionsThisWeek || 0) > 0;

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
      desc: 'Add your first commercial tower or residential society',
      done: hasClientAndBuilding,
      action: () => onNavigateTab('CLIENTS_SITES'),
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
      action: () => onNavigateTab('INSPECTIONS_WORK'),
      btnText: 'Record inspection',
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
      const hasValidDue = Boolean(eq.nextDueDate && !isNaN(new Date(eq.nextDueDate).getTime()));
      const diffDays = hasValidDue
        ? Math.ceil((new Date(eq.nextDueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : 999999;
      return { ...eq, diffDays };
    })
    .filter((eq) => eq.diffDays <= 30)
    .sort((a, b) => a.diffDays - b.diffDays)
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Top Bar: Title, Badge, and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#DCE7F2]">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-[#023E8A] tracking-tight">
              Overview
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#EAF6FF] text-[#0077B6] border border-[#0077B6]/30 text-xs font-bold">
              Free testing access
            </span>
          </div>
          <p className="text-xs text-slate-600">
            {company?.name ? `${company.name} • Operational Summary` : 'Fire Safety Operations Dashboard'}
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onAddEquipment}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#0077B6] to-[#023E8A] hover:from-[#006494] hover:to-[#011F48] text-white text-xs font-bold shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,119,182,0.2)] active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add equipment</span>
          </button>

          <button
            onClick={onCreateRepairJob}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-[#EAF6FF] text-[#0077B6] border border-[#DCE7F2] hover:border-[#0077B6]/40 text-xs font-bold transition-all duration-150 shadow-xs active:scale-[0.98]"
          >
            <Wrench className="w-3.5 h-3.5 text-[#0077B6]" />
            <span>Create repair job</span>
          </button>

          <button
            onClick={onOpenFeedback}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[#023E8A] bg-[#EAF6FF] hover:bg-[#D5EEFF] border border-[#DCE7F2] text-xs font-semibold transition-all duration-150 active:scale-[0.98]"
            title="Give product feedback"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#0077B6]" />
            <span>Give feedback</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          OPERATIONAL SUMMARY METRIC CARDS (NumberTicker + Hover Lift + Overdue Pulse)
          ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* 1. Overdue Equipment */}
        <div
          onClick={() => onNavigateTab('FIRE_EQUIPMENT')}
          className={`relative p-5 rounded-2xl bg-white border transition-all duration-200 cursor-pointer group hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,119,182,0.12)] ${
            kpis.overdueCount > 0
              ? 'border-[#B91C1C]/60 ring-2 ring-[#B91C1C]/15 motion-safe:animate-pulse'
              : 'border-[#DCE7F2] hover:border-[#0077B6]/40'
          }`}
        >
          <div className="flex items-center justify-between text-slate-600 mb-2">
            <span className="text-xs font-semibold">Overdue equipment</span>
            <div
              className={`p-2 rounded-xl transition-transform duration-150 group-hover:scale-105 ${
                kpis.overdueCount > 0
                  ? 'bg-rose-50 text-[#B91C1C] border border-[#B91C1C]/20'
                  : 'bg-gradient-to-br from-[#EAF6FF] to-[#D5EEFF] text-[#0077B6] border border-[#0077B6]/20'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`text-2xl sm:text-3xl font-black tracking-tight tabular-nums ${
              kpis.overdueCount > 0 ? 'text-[#B91C1C]' : 'text-[#023E8A]'
            }`}
          >
            <NumberTicker value={kpis.overdueCount} />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {kpis.overdueCount === 0 ? 'No overdue equipment' : 'Needs immediate inspection'}
          </p>
        </div>

        {/* 2. Due in 30 Days */}
        <div
          onClick={() => onNavigateTab('FIRE_EQUIPMENT')}
          className="p-5 rounded-2xl bg-white border border-[#DCE7F2] hover:border-[#0077B6]/40 transition-all duration-200 cursor-pointer group hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,119,182,0.12)]"
        >
          <div className="flex items-center justify-between text-slate-600 mb-2">
            <span className="text-xs font-semibold">Due in 30 days</span>
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#EAF6FF] to-[#D5EEFF] text-[#0077B6] border border-[#0077B6]/20 transition-transform duration-150 group-hover:scale-105">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#023E8A] tracking-tight tabular-nums">
            <NumberTicker value={kpis.dueSoonCount} />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Upcoming scheduled services
          </p>
        </div>

        {/* 3. Open Repairs / Work Orders */}
        <div
          onClick={() => onNavigateTab('INSPECTIONS_WORK')}
          className="p-5 rounded-2xl bg-white border border-[#DCE7F2] hover:border-[#0077B6]/40 transition-all duration-200 cursor-pointer group hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,119,182,0.12)]"
        >
          <div className="flex items-center justify-between text-slate-600 mb-2">
            <span className="text-xs font-semibold">Open repairs</span>
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#0077B6] to-[#023E8A] text-white shadow-xs transition-transform duration-150 group-hover:scale-105">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#0077B6] tracking-tight tabular-nums">
            <NumberTicker value={kpis.openRepairsCount} />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Active repair jobs &amp; tasks
          </p>
        </div>

        {/* 4. Inspections Completed This Week */}
        <div
          onClick={() => onNavigateTab('INSPECTIONS_WORK')}
          className="p-5 rounded-2xl bg-white border border-[#DCE7F2] hover:border-[#0077B6]/40 transition-all duration-200 cursor-pointer group hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,119,182,0.12)]"
        >
          <div className="flex items-center justify-between text-slate-600 mb-2">
            <span className="text-xs font-semibold">Inspections this week</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-[#0E9F6E] border border-[#0E9F6E]/20 transition-transform duration-150 group-hover:scale-105">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#0E9F6E] tracking-tight tabular-nums">
            <NumberTicker value={kpis.inspectionsThisWeek} />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Completed field audits (7d)
          </p>
        </div>
      </div>

      {/* Secondary Resource Totals Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div
          onClick={() => onNavigateTab('FIRE_EQUIPMENT')}
          className="p-4 rounded-xl bg-white border border-[#DCE7F2] flex items-center justify-between cursor-pointer hover:border-[#0077B6]/40 hover:shadow-[0_8px_24px_rgba(0,119,182,0.08)] transition-all duration-150 group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#EAF6FF] text-[#0077B6] border border-[#0077B6]/20">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <div className="text-base font-bold text-[#023E8A] tabular-nums">
                <NumberTicker value={kpis.totalEquipments ?? 0} />
              </div>
              <div className="text-[11px] text-slate-500">Registered fire equipment</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#0077B6] group-hover:translate-x-0.5 transition-all" />
        </div>

        <div
          onClick={() => onNavigateTab('CLIENTS_SITES')}
          className="p-4 rounded-xl bg-white border border-[#DCE7F2] flex items-center justify-between cursor-pointer hover:border-[#0077B6]/40 hover:shadow-[0_8px_24px_rgba(0,119,182,0.08)] transition-all duration-150 group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#EAF6FF] text-[#0077B6] border border-[#0077B6]/20">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-base font-bold text-[#023E8A] tabular-nums">
                <NumberTicker value={kpis.totalBuildings ?? buildings.length} />
              </div>
              <div className="text-[11px] text-slate-500">Facilities &amp; towers</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#0077B6] group-hover:translate-x-0.5 transition-all" />
        </div>

        <div
          onClick={() => onNavigateTab('CLIENTS_SITES')}
          className="p-4 rounded-xl bg-white border border-[#DCE7F2] flex items-center justify-between cursor-pointer hover:border-[#0077B6]/40 hover:shadow-[0_8px_24px_rgba(0,119,182,0.08)] transition-all duration-150 group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#EAF6FF] text-[#0077B6] border border-[#0077B6]/20">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="text-base font-bold text-[#023E8A] tabular-nums">
                <NumberTicker value={kpis.totalClients ?? 0} />
              </div>
              <div className="text-[11px] text-slate-500">Client accounts &amp; RWAs</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#0077B6] group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>

      {/* =========================================================================
          FIRST-TIME CHECKLIST (Shown until complete)
          ========================================================================= */}
      {!isChecklistComplete && (
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#EAF6FF]/70 to-white border border-[#DCE7F2] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-[#023E8A] flex items-center gap-2">
                <span>Getting started with VigilAMC</span>
                <span className="text-xs font-normal text-slate-500">
                  ({completedCount} of 5 completed)
                </span>
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Complete these 5 setup steps to bring your fire AMC operations online.
              </p>
            </div>
            <div className="text-xs font-bold text-[#0077B6]">
              {progressPercent}% ready
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 rounded-full bg-[#DCE7F2] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#0077B6] to-[#0E9F6E] rounded-full transition-all duration-500"
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
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                    : 'bg-white border-[#DCE7F2] text-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Step {item.id}
                    </span>
                    {item.done ? (
                      <span className="w-4 h-4 rounded-full bg-[#0E9F6E] text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-[#DCE7F2]" />
                    )}
                  </div>
                  <h4 className="text-xs font-bold line-clamp-1">{item.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-3 mt-2 border-t border-slate-100">
                  {item.done ? (
                    <span className="text-[11px] font-semibold text-[#0E9F6E] flex items-center gap-1">
                      <Check className="w-3 h-3" /> Done
                    </span>
                  ) : (
                    <button
                      onClick={item.action}
                      className="text-[11px] font-bold text-[#0077B6] hover:underline flex items-center gap-1"
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
          NEEDS ATTENTION LIST (Top 10 due or overdue items — Row Stagger-In)
          ========================================================================= */}
      <div className="bg-white border border-[#DCE7F2] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#023E8A] flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <span>Needs attention</span>
            </h3>
            <p className="text-xs text-slate-500">
              Next 10 fire equipment units due for service or overdue.
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('FIRE_EQUIPMENT')}
            className="text-xs font-semibold text-[#0077B6] hover:underline flex items-center gap-1"
          >
            <span>View all equipment</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {needsAttentionList.length === 0 ? (
          <div className="py-12 text-center space-y-3 border border-dashed border-[#DCE7F2] rounded-xl bg-[#F4F8FB]/50">
            <CheckCircle2 className="w-8 h-8 text-[#0E9F6E] mx-auto" />
            <h4 className="text-sm font-bold text-[#023E8A]">All equipment is up to date</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No units are overdue or due within the next 30 days. When an inspection deadline approaches, it will appear here.
            </p>
            {hasEquipment ? null : (
              <button
                onClick={onAddEquipment}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0077B6] hover:bg-[#023E8A] text-white text-xs font-bold transition-all shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Register your first equipment</span>
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[#DCE7F2]/60">
            {needsAttentionList.map((item, idx) => {
              const isOverdue = item.diffDays < 0;
              return (
                <motion.div
                  key={item.id}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.18,
                    delay: prefersReducedMotion ? 0 : Math.min(idx, 7) * 0.025,
                    ease: 'easeOut',
                  }}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#EAF6FF]/40 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        isOverdue ? 'bg-[#B91C1C]' : 'bg-amber-500'
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-[#023E8A]">
                          {item.type} ({item.capacity})
                        </span>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#EAF6FF] text-[#0077B6] border border-[#0077B6]/20">
                          {item.qrCode}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        {item.buildingName} &bull; {item.location || 'Location not specified'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
                    <div className="text-right">
                      <div
                        className={`text-xs font-bold ${
                          isOverdue ? 'text-[#B91C1C]' : 'text-amber-700'
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
                      onClick={() => onNavigateTab('INSPECTIONS_WORK')}
                      className="px-3 py-1.5 rounded-lg bg-[#EAF6FF] hover:bg-[#0077B6] hover:text-white text-[#0077B6] border border-[#0077B6]/20 text-xs font-bold transition-all whitespace-nowrap active:scale-[0.98]"
                    >
                      Create repair job
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
