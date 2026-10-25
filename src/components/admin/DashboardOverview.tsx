'use client';

import React, { useState } from 'react';
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
  TrendingUp,
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

type RangeKey = '7D' | '30D' | '90D' | '12M';
type MetricKey = 'INSPECTIONS' | 'COMPLIANCE' | 'REPAIRS';

const CHART_SERIES: Record<
  MetricKey,
  Record<RangeKey, { labels: string[]; values: number[]; unit: string; delta: string; up: boolean }>
> = {
  INSPECTIONS: {
    '7D': {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      values: [14, 19, 17, 24, 28, 22, 31],
      unit: 'checks',
      delta: '+18.4% vs prior 7d',
      up: true,
    },
    '30D': {
      labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'],
      values: [68, 84, 92, 118],
      unit: 'checks',
      delta: '+24.1% vs prior 30d',
      up: true,
    },
    '90D': {
      labels: ['Month 1', 'Month 2', 'Month 3'],
      values: [240, 295, 348],
      unit: 'checks',
      delta: '+31.0% quarter-on-quarter',
      up: true,
    },
    '12M': {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      values: [780, 910, 1080, 1290],
      unit: 'checks',
      delta: '+42.6% year-on-year',
      up: true,
    },
  },
  COMPLIANCE: {
    '7D': {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      values: [94, 95, 95, 96, 97, 98, 98.4],
      unit: '% verified',
      delta: '+2.4% SLA adherence',
      up: true,
    },
    '30D': {
      labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'],
      values: [91, 94, 96, 98.4],
      unit: '% verified',
      delta: '+4.8% vs last month',
      up: true,
    },
    '90D': {
      labels: ['Month 1', 'Month 2', 'Month 3'],
      values: [88, 93, 98.4],
      unit: '% verified',
      delta: '+10.4% audit readiness',
      up: true,
    },
    '12M': {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      values: [84, 89, 95, 98.4],
      unit: '% verified',
      delta: '+14.4% annual lift',
      up: true,
    },
  },
  REPAIRS: {
    '7D': {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      values: [9, 8, 7, 6, 5, 4, 3],
      unit: 'open jobs',
      delta: '-66% backlog cleared',
      up: true,
    },
    '30D': {
      labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'],
      values: [18, 14, 9, 4],
      unit: 'open jobs',
      delta: '-77% faster closure',
      up: true,
    },
    '90D': {
      labels: ['Month 1', 'Month 2', 'Month 3'],
      values: [29, 16, 5],
      unit: 'open jobs',
      delta: 'Mean TAT 18 hrs',
      up: true,
    },
    '12M': {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      values: [42, 28, 14, 5],
      unit: 'open jobs',
      delta: '99.1% SLA met',
      up: true,
    },
  },
};

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
  const [selectedRange, setSelectedRange] = useState<RangeKey>('30D');
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('INSPECTIONS');
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const activeSeries = CHART_SERIES[selectedMetric][selectedRange];

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

  // Build SVG path coordinates for the flame-ember chart
  const maxVal = Math.max(...activeSeries.values, 1);
  const minVal = Math.min(...activeSeries.values, 0);
  const span = Math.max(1, maxVal - minVal * 0.85);
  const pts = activeSeries.values.map((v, i) => {
    const x =
      activeSeries.values.length === 1
        ? 300
        : 36 + (i / (activeSeries.values.length - 1)) * 528;
    const y = 136 - ((v - minVal * 0.85) / span) * 104;
    return { x, y, v, label: activeSeries.labels[i] };
  });
  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L${pts[pts.length - 1].x.toFixed(1)},148 L${pts[0].x.toFixed(1)},148 Z`;

  return (
    <div className="relative space-y-6">
      {/* Ambient Radial Ember Glow Planes behind KPI cards (Critical Glass Rule) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-8 left-[10%] w-[420px] h-[260px] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(232, 89, 12, 0.20) 0%, rgba(255, 140, 66, 0.14) 48%, rgba(255, 248, 242, 0) 74%)',
          filter: 'blur(85px)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[18%] right-[8%] w-[440px] h-[280px] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(255, 140, 66, 0.20) 0%, rgba(232, 89, 12, 0.12) 50%, rgba(255, 248, 242, 0) 75%)',
          filter: 'blur(90px)',
        }}
      />

      {/* Top Bar: Title, Badge, and Action Buttons */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#1C1917]/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-xl sm:text-2xl font-black text-[#1C1917] tracking-tight">
              Overview
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#FFF0E6] text-[#C2410C] border border-[#FED7AA] text-xs font-bold">
              Live AMC Workspace
            </span>
          </div>
          <p className="text-xs text-[#44403C]">
            {company?.name ? `${company.name} • Operational Summary` : 'Fire Safety Operations Dashboard'}
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onAddEquipment}
            className="btn-flame flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold shadow-sm active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add equipment</span>
          </button>

          <button
            onClick={onCreateRepairJob}
            className="btn-ghost-flame flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow-xs active:scale-[0.98]"
          >
            <Wrench className="w-3.5 h-3.5 text-[#C2410C]" />
            <span>Create repair job</span>
          </button>

          <button
            onClick={onOpenFeedback}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[#1C1917] bg-[#FFF0E6] hover:bg-[#FED7AA]/60 border border-[#FED7AA] text-xs font-semibold transition-all duration-150 active:scale-[0.98]"
            title="Give product feedback"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#C2410C]" />
            <span>Give feedback</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          OPERATIONAL SUMMARY METRIC CARDS (Glass Panels + Ember Glow Behind)
          ========================================================================= */}
      <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* 1. Overdue Equipment */}
        <div
          onClick={() => onNavigateTab('FIRE_EQUIPMENT')}
          data-testid="kpi-card-overdue"
          className={`glass-panel relative p-5 rounded-2xl transition-all duration-200 cursor-pointer group hover:-translate-y-0.5 ${
            kpis.overdueCount > 0
              ? 'border-[#DC2626]/60 ring-2 ring-[#DC2626]/15'
              : 'hover:border-[#EA580C]/45'
          }`}
        >
          <div className="flex items-center justify-between text-[#44403C] mb-2">
            <span className="text-xs font-semibold">Overdue equipment</span>
            <div
              className={`p-2 rounded-xl transition-transform duration-150 group-hover:scale-105 ${
                kpis.overdueCount > 0
                  ? 'bg-rose-50 text-[#DC2626] border border-[#DC2626]/20'
                  : 'bg-[#FFF0E6] text-[#C2410C] border border-[#FED7AA]'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`text-2xl sm:text-3xl font-black tracking-tight tabular-nums ${
              kpis.overdueCount > 0 ? 'text-[#DC2626]' : 'text-[#1C1917]'
            }`}
          >
            <NumberTicker value={kpis.overdueCount} />
          </div>
          <p className="text-[11px] text-[#44403C] mt-1">
            {kpis.overdueCount === 0 ? 'No overdue equipment' : 'Needs immediate inspection'}
          </p>
        </div>

        {/* 2. Due in 30 Days */}
        <div
          onClick={() => onNavigateTab('FIRE_EQUIPMENT')}
          data-testid="kpi-card-due-soon"
          className="glass-panel p-5 rounded-2xl hover:border-[#EA580C]/45 transition-all duration-200 cursor-pointer group hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between text-[#44403C] mb-2">
            <span className="text-xs font-semibold">Due in 30 days</span>
            <div className="p-2 rounded-xl bg-[#FFF0E6] text-[#D97706] border border-[#FED7AA] transition-transform duration-150 group-hover:scale-105">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#1C1917] tracking-tight tabular-nums">
            <NumberTicker value={kpis.dueSoonCount} />
          </div>
          <p className="text-[11px] text-[#44403C] mt-1">
            Upcoming scheduled services
          </p>
        </div>

        {/* 3. Open Repairs / Work Orders */}
        <div
          onClick={() => onNavigateTab('INSPECTIONS_WORK')}
          data-testid="kpi-card-open-repairs"
          className="glass-panel p-5 rounded-2xl hover:border-[#EA580C]/45 transition-all duration-200 cursor-pointer group hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between text-[#44403C] mb-2">
            <span className="text-xs font-semibold">Open repairs</span>
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#EA580C] to-[#C2410C] text-white shadow-xs transition-transform duration-150 group-hover:scale-105">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#1C1917] tracking-tight tabular-nums">
            <NumberTicker value={kpis.openRepairsCount} />
          </div>
          <p className="text-[11px] text-[#44403C] mt-1">
            Active repair jobs &amp; tasks
          </p>
        </div>

        {/* 4. Inspections Completed This Week */}
        <div
          onClick={() => onNavigateTab('INSPECTIONS_WORK')}
          data-testid="kpi-card-inspections-week"
          className="glass-panel p-5 rounded-2xl hover:border-[#EA580C]/45 transition-all duration-200 cursor-pointer group hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between text-[#44403C] mb-2">
            <span className="text-xs font-semibold">Inspections this week</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-[#059669] border border-[#059669]/20 transition-transform duration-150 group-hover:scale-105">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#059669] tracking-tight tabular-nums">
            <NumberTicker value={kpis.inspectionsThisWeek} />
          </div>
          <p className="text-[11px] text-[#44403C] mt-1">
            Completed field audits (7d)
          </p>
        </div>
      </div>

      {/* =========================================================================
          C3: INTERACTIVE KPI ANALYTICS & RANGE PICKER (Series 1 #EA580C -> #FF8C42)
          ========================================================================= */}
      <div
        data-testid="kpi-analytics-panel"
        className="relative z-10 glass-panel-dense rounded-2xl p-5 sm:p-6 space-y-4"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-sm sm:text-base font-bold text-[#1C1917]">
                Compliance &amp; Field Velocity Trend
              </h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#059669]/12 text-[#059669] border border-[#059669]/25">
                <TrendingUp className="w-3 h-3" />
                {activeSeries.delta}
              </span>
            </div>
            <p className="text-xs text-[#44403C] mt-0.5">
              Switch KPI series or time window to inspect agency audit throughput
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Metric Picker */}
            <select
              aria-label="Select KPI Metric"
              data-testid="kpi-metric-picker"
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as MetricKey)}
              className="glass-input rounded-xl px-3 py-1.5 text-xs font-bold text-[#1C1917]"
            >
              <option value="INSPECTIONS">Field Inspections</option>
              <option value="COMPLIANCE">Compliance Rate (%)</option>
              <option value="REPAIRS">Open Repair Backlog</option>
            </select>

            {/* Range Picker Buttons */}
            <div
              role="group"
              aria-label="Select KPI Time Range"
              className="inline-flex items-center gap-1 p-1 rounded-xl bg-white/70 border border-[#FED7AA]"
            >
              {(['7D', '30D', '90D', '12M'] as RangeKey[]).map((rk) => (
                <button
                  key={rk}
                  type="button"
                  data-testid={`kpi-range-${rk}`}
                  onClick={() => setSelectedRange(rk)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedRange === rk
                      ? 'bg-[#C2410C] text-white shadow-xs'
                      : 'text-[#44403C] hover:text-[#1C1917] hover:bg-[#FFF0E6]'
                  }`}
                >
                  {rk}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SVG Sparkline / Area Chart with #EA580C -> #FF8C42 gradient & rgba(28,25,23,0.08) gridlines */}
        <div className="relative pt-2">
          <svg
            viewBox="0 0 600 165"
            className="w-full h-40 overflow-visible"
            role="img"
            aria-label={`KPI trend chart for ${selectedMetric} over ${selectedRange}`}
          >
            <defs>
              <linearGradient id="flameSeriesStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#EA580C" />
                <stop offset="100%" stopColor="#FF8C42" />
              </linearGradient>
              <linearGradient id="flameSeriesFill" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#EA580C" stopOpacity="0.28" />
                <stop offset="65%" stopColor="#FF8C42" stopOpacity="0.10" />
                <stop offset="100%" stopColor="#FFF8F2" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Gridlines: rgba(28,25,23,0.08) per C3 */}
            {[32, 70, 108, 148].map((gy) => (
              <line
                key={gy}
                x1="28"
                y1={gy}
                x2="572"
                y2={gy}
                stroke="rgba(28, 25, 23, 0.08)"
                strokeWidth="1"
              />
            ))}

            {/* Area under curve */}
            <path d={areaPath} fill="url(#flameSeriesFill)" />

            {/* Main #EA580C -> #FF8C42 stroke */}
            <path
              d={linePath}
              fill="none"
              stroke="url(#flameSeriesStroke)"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points + labels */}
            {pts.map((p, idx) => (
              <g
                key={p.label}
                onMouseEnter={() => setHoverIdx(idx)}
                onMouseLeave={() => setHoverIdx(null)}
                className="cursor-pointer"
              >
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={hoverIdx === idx ? 6 : 4.5}
                  fill="#FFFFFF"
                  stroke="#EA580C"
                  strokeWidth="2.5"
                />
                <text
                  x={p.x}
                  y={162}
                  textAnchor="middle"
                  fill="#44403C"
                  fontSize="11"
                  fontWeight="600"
                >
                  {p.label}
                </text>
              </g>
            ))}
          </svg>

          {/* Glass Chart Tooltip */}
          {hoverIdx !== null && pts[hoverIdx] && (
            <div
              className="glass-panel-dense pointer-events-none absolute top-2 right-3 px-3 py-1.5 rounded-xl text-xs"
            >
              <span className="font-bold text-[#1C1917]">{pts[hoverIdx].label}: </span>
              <span className="font-extrabold text-[#C2410C] tabular-nums">
                {pts[hoverIdx].v} {activeSeries.unit}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Secondary Resource Totals Strip */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div
          onClick={() => onNavigateTab('FIRE_EQUIPMENT')}
          className="glass-panel-dense p-4 rounded-xl flex items-center justify-between cursor-pointer hover:border-[#EA580C]/45 transition-all duration-150 group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#FFF0E6] text-[#C2410C] border border-[#FED7AA]">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <div className="text-base font-bold text-[#1C1917] tabular-nums">
                <NumberTicker value={kpis.totalEquipments ?? 0} />
              </div>
              <div className="text-[11px] text-[#44403C]">Registered fire equipment</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#44403C] group-hover:text-[#C2410C] group-hover:translate-x-0.5 transition-all" />
        </div>

        <div
          onClick={() => onNavigateTab('CLIENTS_SITES')}
          className="glass-panel-dense p-4 rounded-xl flex items-center justify-between cursor-pointer hover:border-[#EA580C]/45 transition-all duration-150 group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#FFF0E6] text-[#C2410C] border border-[#FED7AA]">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-base font-bold text-[#1C1917] tabular-nums">
                <NumberTicker value={kpis.totalBuildings ?? buildings.length} />
              </div>
              <div className="text-[11px] text-[#44403C]">Facilities &amp; towers</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#44403C] group-hover:text-[#C2410C] group-hover:translate-x-0.5 transition-all" />
        </div>

        <div
          onClick={() => onNavigateTab('CLIENTS_SITES')}
          className="glass-panel-dense p-4 rounded-xl flex items-center justify-between cursor-pointer hover:border-[#EA580C]/45 transition-all duration-150 group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#FFF0E6] text-[#C2410C] border border-[#FED7AA]">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="text-base font-bold text-[#1C1917] tabular-nums">
                <NumberTicker value={kpis.totalClients ?? 0} />
              </div>
              <div className="text-[11px] text-[#44403C]">Client accounts &amp; RWAs</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#44403C] group-hover:text-[#C2410C] group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>

      {/* =========================================================================
          FIRST-TIME CHECKLIST (Shown until complete)
          ========================================================================= */}
      {!isChecklistComplete && (
        <div className="relative z-10 glass-panel-dense p-5 sm:p-6 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-[#1C1917] flex items-center gap-2">
                <span>Getting started with VigilAMC</span>
                <span className="text-xs font-normal text-[#44403C]">
                  ({completedCount} of 5 completed)
                </span>
              </h3>
              <p className="text-xs text-[#44403C] mt-0.5">
                Complete these 5 setup steps to bring your fire AMC operations online.
              </p>
            </div>
            <div className="text-xs font-bold text-[#C2410C]">
              {progressPercent}% ready
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 rounded-full bg-[#FED7AA]/50 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#EA580C] via-[#FF8C42] to-[#059669] rounded-full transition-all duration-500"
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
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                    : 'bg-white/80 border-[#FED7AA] text-[#1C1917]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#44403C]">
                      Step {item.id}
                    </span>
                    {item.done ? (
                      <span className="w-4 h-4 rounded-full bg-[#059669] text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-[#FED7AA]" />
                    )}
                  </div>
                  <h4 className="text-xs font-bold line-clamp-1">{item.title}</h4>
                  <p className="text-[11px] text-[#44403C] mt-1 line-clamp-2">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-3 mt-2 border-t border-[#1C1917]/10">
                  {item.done ? (
                    <span className="text-[11px] font-semibold text-[#059669] flex items-center gap-1">
                      <Check className="w-3 h-3" /> Done
                    </span>
                  ) : (
                    <button
                      onClick={item.action}
                      className="text-[11px] font-bold text-[#C2410C] hover:underline flex items-center gap-1"
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
          NEEDS ATTENTION LIST (Top 10 due or overdue items — Glass Table Wrapper)
          ========================================================================= */}
      <div className="relative z-10 glass-panel-dense rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#1C1917] flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#D97706]" />
              <span>Needs attention</span>
            </h3>
            <p className="text-xs text-[#44403C]">
              Next 10 fire equipment units due for service or overdue.
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('FIRE_EQUIPMENT')}
            className="text-xs font-semibold text-[#C2410C] hover:underline flex items-center gap-1"
          >
            <span>View all equipment</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {needsAttentionList.length === 0 ? (
          <div className="py-12 text-center space-y-3 border border-dashed border-[#FED7AA] rounded-xl bg-[#FFF8F2]/70">
            <CheckCircle2 className="w-8 h-8 text-[#059669] mx-auto" />
            <h4 className="text-sm font-bold text-[#1C1917]">All equipment is up to date</h4>
            <p className="text-xs text-[#44403C] max-w-sm mx-auto">
              No units are overdue or due within the next 30 days. When an inspection deadline approaches, it will appear here.
            </p>
            {hasEquipment ? null : (
              <button
                onClick={onAddEquipment}
                className="btn-flame inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Register your first equipment</span>
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[#1C1917]/10">
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
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FFF0E6] px-2.5 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        isOverdue ? 'bg-[#DC2626]' : 'bg-[#D97706]'
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-[#1C1917]">
                          {item.type} ({item.capacity})
                        </span>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#FFF0E6] text-[#C2410C] border border-[#FED7AA]">
                          {item.qrCode}
                        </span>
                      </div>
                      <p className="text-xs text-[#44403C] mt-0.5 truncate">
                        {item.buildingName} &bull; {item.location || 'Location not specified'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
                    <div className="text-right">
                      <div
                        className={`text-xs font-bold ${
                          isOverdue ? 'text-[#DC2626]' : 'text-[#D97706]'
                        }`}
                      >
                        {isOverdue
                          ? `Overdue by ${Math.abs(item.diffDays)} days`
                          : `Due in ${item.diffDays} days`}
                      </div>
                      <div className="text-[10px] text-[#44403C]">
                        Due: {formatStandardDate(item.nextDueDate)}
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigateTab('INSPECTIONS_WORK')}
                      className="px-3 py-1.5 rounded-lg bg-[#FFF0E6] hover:bg-[#C2410C] hover:text-white text-[#C2410C] border border-[#FED7AA] text-xs font-bold transition-all whitespace-nowrap active:scale-[0.98]"
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
