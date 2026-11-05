'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  ShieldCheck,
  Building2,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  Sparkles,
  ArrowRight,
  Eye,
  Check,
  Wrench,
  Search,
  Filter,
  FileSpreadsheet,
  Layers,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

// CLEARLY FICTIONAL DEMO SEED DATA (ZERO live API calls, ZERO real client data)
const DEMO_AGENCY = {
  name: 'Apex Shield Fire AMC (Demo Agency)',
  phone: '+91 98000 00000',
  email: 'demo@apexshield.in',
  city: 'New Delhi',
  signatoryName: 'Capt. Rajesh Varma (Retd.)',
  signatoryDesignation: 'Lead Fire Auditor (IS 2190 / NBC 2016)',
};

const DEMO_PORTFOLIO_CLIENTS = [
  {
    id: 'demo-c1',
    name: 'Horizon Heights Tech Park (Demo Client)',
    siteCount: 3,
    assetCount: 48,
    compliancePercent: 94,
    expiring30dCount: 2,
    overdueCount: 1,
    statusOk: 45,
    statusDue: 2,
    statusOverdue: 1,
    lastInspection: '02 Nov 2026',
  },
  {
    id: 'demo-c2',
    name: 'Cyber Residency Welfare Association (Demo Client)',
    siteCount: 2,
    assetCount: 36,
    compliancePercent: 100,
    expiring30dCount: 0,
    overdueCount: 0,
    statusOk: 36,
    statusDue: 0,
    statusOverdue: 0,
    lastInspection: '28 Oct 2026',
  },
  {
    id: 'demo-c3',
    name: 'Grand Central Commercial Plaza (Demo Client)',
    siteCount: 4,
    assetCount: 64,
    compliancePercent: 88,
    expiring30dCount: 5,
    overdueCount: 3,
    statusOk: 56,
    statusDue: 5,
    statusOverdue: 3,
    lastInspection: '15 Oct 2026',
  },
];

const DEMO_APPROVALS = [
  {
    id: 'demo-app-1',
    buildingName: 'Horizon Tower Alpha (Sample Tower)',
    assetTag: 'EXT-01',
    type: 'ABC Dry Powder 6kg',
    technicianName: 'Arun Kumar (Demo Technician)',
    date: '03 Nov 2026',
    status: 'PASSED',
    pressureGauge: 'NORMAL',
    photoCount: 3,
    remarks: 'Pressure gauge at 15 bar; safety pin and tamper seal verified intact.',
  },
  {
    id: 'demo-app-2',
    buildingName: 'Cyber Residency Tower B (Sample Tower)',
    assetTag: 'HYD-04',
    type: 'Single Head Hydrant Valve 63mm',
    technicianName: 'Vijay Singh (Demo Technician)',
    date: '02 Nov 2026',
    status: 'PASSED',
    pressureGauge: 'NORMAL',
    photoCount: 2,
    remarks: 'Flushing tested at 7 bar, lug washer replaced.',
  },
];

const DEMO_FINDINGS = [
  {
    id: 'demo-f1',
    assetTag: 'EXT-09',
    building: 'Horizon Tower Alpha',
    title: 'Discharge horn cracked and gauge needle in red zone',
    severity: 'HIGH',
    status: 'DISPATCHED',
    ageDays: 18,
    workshopNote: 'Cylinder dispatched to authorized Okhla workshop for hydraulic pressure testing & refill.',
  },
  {
    id: 'demo-f2',
    assetTag: 'HR-02',
    building: 'Grand Central Plaza',
    title: 'Hose reel drum rubber nozzle missing safety clip',
    severity: 'MEDIUM',
    status: 'REPAIRED',
    ageDays: 9,
    workshopNote: 'Fitted new brass shut-off branch nozzle.',
  },
  {
    id: 'demo-f3',
    assetTag: 'ALM-01',
    building: 'Cyber Residency Tower B',
    title: 'Zone 4 repeater panel showing intermittent battery fault',
    severity: 'LOW',
    status: 'OPEN',
    ageDays: 3,
    workshopNote: null,
  },
];

const DEMO_RADAR = [
  {
    assetTag: 'EXT-04',
    type: 'CO₂ Gas 4.5kg',
    building: 'Horizon Tower Alpha',
    location: 'Server Room Hub 2nd Floor',
    dueDays: -4,
    status: 'OVERDUE',
    scheduled: true,
  },
  {
    assetTag: 'EXT-18',
    type: 'ABC Dry Powder 6kg',
    building: 'Cyber Residency Tower A',
    location: 'Lift Lobby 5th Floor',
    dueDays: 12,
    status: 'DUE_SOON',
    scheduled: false,
  },
  {
    assetTag: 'HYD-02',
    type: 'Landing Valve 63mm',
    building: 'Grand Central Plaza',
    location: 'North Staircase 3rd Floor',
    dueDays: 28,
    status: 'DUE_SOON',
    scheduled: false,
  },
];

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'APPROVALS' | 'RADAR' | 'REPORTS'>('OVERVIEW');
  const [selectedHotspot, setSelectedHotspot] = useState<number | null>(1);

  return (
    <div
      data-testid="demo-container"
      className="min-h-screen bg-[#FFF8F2] text-[#1C1917] flex flex-col selection:bg-orange-100 selection:text-orange-900"
    >
      {/* Sticky Top Interactive Tour Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#F0E4D8] px-4 sm:px-8 py-3.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Link href="/" className="inline-flex items-center gap-2 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/logo-tile-192.png"
                alt="VigilAMC Logo"
                width={32}
                height={32}
                className="w-8 h-8 object-cover rounded-lg shadow-xs"
              />
              <span className="font-extrabold text-sm sm:text-base text-[#1C1917] tracking-tight">
                VigilAMC Product Tour
              </span>
            </Link>
            <span className="px-2 py-0.5 bg-orange-100 text-[#EA580C] text-[10px] font-bold rounded-full uppercase tracking-wider border border-orange-200">
              Interactive Live Demo (Read-Only)
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/verify"
              className="text-xs font-semibold text-[#44403C] hover:text-[#EA580C] hidden md:inline-block px-3 py-1.5"
            >
              Public Verify
            </Link>
            <Link
              href="/tools/extinguisher-calculator"
              className="text-xs font-semibold text-[#44403C] hover:text-[#EA580C] hidden md:inline-block px-3 py-1.5"
            >
              IS 2190 Calculator
            </Link>
            <Link
              href="/login"
              data-testid="demo-create-account-btn"
              className="px-4 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold rounded-xl shadow-sm shadow-orange-500/25 flex items-center gap-1.5 transition-colors"
            >
              <span>Create Account — Free Testing</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-6">
        {/* Hotspots Guide Ribbon */}
        <div className="glass-panel p-5 rounded-3xl border border-white/70 shadow-sm bg-gradient-to-r from-orange-50/70 via-white to-orange-50/70 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#EA580C] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#EA580C]" /> Feature Hotspots (Click to explore)
            </span>
            <span className="text-[11px] text-[#78716C]">Static seed data · Zero live API calls</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 1, label: '1. Client Portfolio Rollup', tab: 'OVERVIEW' as const },
              { id: 2, label: '2. Inspection Approval Queue', tab: 'APPROVALS' as const },
              { id: 3, label: '3. Corrective Actions Board', tab: 'APPROVALS' as const },
              { id: 4, label: '4. Expiry Radar & Service', tab: 'RADAR' as const },
            ].map((spot) => (
              <button
                key={spot.id}
                type="button"
                data-testid={`demo-hotspot-${spot.id}`}
                onClick={() => {
                  setSelectedHotspot(spot.id);
                  setActiveTab(spot.tab);
                }}
                className={`p-2.5 rounded-xl text-xs font-bold text-left transition-all ${
                  selectedHotspot === spot.id
                    ? 'bg-[#EA580C] text-white shadow-sm shadow-orange-500/20'
                    : 'bg-white text-[#44403C] hover:bg-orange-50 border border-[#F0E4D8]'
                }`}
              >
                {spot.label}
              </button>
            ))}
          </div>
        </div>

        {/* Demo Sub-Tabs */}
        <div className="flex items-center gap-2 border-b border-[#F0E4D8] pb-1 overflow-x-auto">
          {[
            { id: 'OVERVIEW', label: 'Overview & Portfolio', icon: Building2 },
            { id: 'APPROVALS', label: 'Approvals & Corrective Actions', icon: CheckCircle2 },
            { id: 'RADAR', label: 'Expiry Radar', icon: Clock },
            { id: 'REPORTS', label: 'Reports & Register', icon: FileText },
          ].map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                data-testid={`demo-tab-${t.id.toLowerCase()}`}
                onClick={() => setActiveTab(t.id as any)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                  active
                    ? 'bg-[#EA580C] text-white shadow-xs'
                    : 'bg-white text-[#44403C] hover:bg-orange-50 border border-[#F0E4D8]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW & PORTFOLIO */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-[#F0E4D8] shadow-sm space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#78716C]">
                  Client Societies
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#1C1917]">3</div>
                <span className="text-[11px] text-[#78716C]">9 total buildings</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-[#F0E4D8] shadow-sm space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#78716C]">
                  Fire Equipment
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#1C1917]">148</div>
                <span className="text-[11px] text-[#78716C]">All assets IS 2190 tagged</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-[#F0E4D8] shadow-sm space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#78716C]">
                  Overall Compliance
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#059669]">94%</div>
                <span className="text-[11px] text-[#059669] font-semibold">Ready for audit</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-[#F0E4D8] shadow-sm space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#78716C]">
                  Expiring in ≤30d
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#D97706]">7</div>
                <span className="text-[11px] text-[#DC2626] font-semibold">4 overdue checks</span>
              </div>
            </div>

            {/* Client Portfolio Rollup Cards (Module E) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#1C1917]">Client Portfolio Rollup</h3>
                  <p className="text-xs text-[#78716C]">
                    Single pane compliance view for multi-building society accounts.
                  </p>
                </div>
                <span className="text-xs text-[#78716C]">3 accounts monitored</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {DEMO_PORTFOLIO_CLIENTS.map((c) => (
                  <div
                    key={c.id}
                    className="bg-white p-5 rounded-2xl border border-[#F0E4D8] shadow-sm space-y-4 hover:border-orange-200 transition-colors"
                  >
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-[#1C1917] tracking-tight">{c.name}</h4>
                      <p className="text-xs text-[#78716C]">
                        {c.siteCount} Sites · {c.assetCount} Assets · Last check: {c.lastInspection}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#44403C]">Compliance Score</span>
                        <span className="font-extrabold text-[#059669]">{c.compliancePercent}%</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#059669] h-2 rounded-full"
                          style={{ width: `${c.compliancePercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#F0E4D8] text-xs">
                      <span className="text-[11px] text-[#78716C]">
                        {c.statusOk} OK · {c.statusDue} Due
                      </span>
                      {c.expiring30dCount > 0 && (
                        <span className="px-2 py-0.5 bg-amber-50 text-[#D97706] border border-amber-200 text-[10px] font-bold rounded-full">
                          {c.expiring30dCount} expiring ≤30d
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: APPROVALS & CORRECTIVE ACTIONS */}
        {activeTab === 'APPROVALS' && (
          <div className="space-y-6">
            {/* Approvals Queue (Module A) */}
            <div className="bg-white p-6 rounded-2xl border border-[#F0E4D8] shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0E4D8]">
                <div>
                  <h3 className="text-sm font-bold text-[#1C1917] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#EA580C]" />
                    Inspection Approval Queue
                  </h3>
                  <p className="text-xs text-[#78716C]">
                    Submitted by field technicians on mobile (Android &amp; iOS) — review proof photos before statutory Form-B release.
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-amber-50 text-[#D97706] border border-amber-200 text-xs font-bold rounded-lg">
                  2 Pending Review
                </span>
              </div>

              <div className="space-y-3">
                {DEMO_APPROVALS.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-[#F0E4D8] bg-[#FFFBF8] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#1C1917]">{item.buildingName}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-[#EA580C]">
                          {item.assetTag}
                        </span>
                      </div>
                      <p className="text-xs text-[#44403C]">
                        {item.type} · Tech: <strong>{item.technicianName}</strong> on {item.date}
                      </p>
                      <p className="text-[11px] text-[#78716C] italic">{item.remarks}</p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => toast.success('Demo: Inspection approved!')}
                        className="px-3.5 py-1.5 bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold rounded-lg shadow-2xs"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => toast.info('Demo: Return with note requested')}
                        className="px-3 py-1.5 bg-white hover:bg-red-50 border border-red-200 text-[#DC2626] text-xs font-semibold rounded-lg"
                      >
                        Return with note
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Corrective Actions Board (Module B) */}
            <div className="bg-white p-6 rounded-2xl border border-[#F0E4D8] shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0E4D8]">
                <div>
                  <h3 className="text-sm font-bold text-[#1C1917] flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-[#EA580C]" />
                    Corrective Action (Findings) Board
                  </h3>
                  <p className="text-xs text-[#78716C]">
                    Tracks defective or failed units through workshop repair and verification.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {DEMO_FINDINGS.map((f) => (
                  <div
                    key={f.id}
                    className="p-4 rounded-xl border border-[#F0E4D8] bg-[#FFF8F2] space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#1C1917]">{f.assetTag}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          f.ageDays >= 15
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : f.ageDays >= 7
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {f.ageDays}d open
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-[#1C1917] leading-snug">{f.title}</p>
                    <span className="text-[11px] text-[#78716C] block">{f.building}</span>

                    {f.workshopNote && (
                      <div className="p-2 bg-white rounded-lg border border-[#FED7AA] text-[11px] text-[#44403C]">
                        {f.workshopNote}
                      </div>
                    )}

                    <div className="pt-2 flex items-center justify-between border-t border-[#F0E4D8]">
                      <span className="px-2 py-0.5 bg-orange-100 text-[#EA580C] text-[10px] font-bold rounded">
                        {f.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => toast.success(`Demo: status transition for ${f.assetTag}`)}
                        className="text-xs font-semibold text-[#EA580C] hover:underline"
                      >
                        Advance →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: RADAR */}
        {activeTab === 'RADAR' && (
          <div className="bg-white p-6 rounded-2xl border border-[#F0E4D8] shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F0E4D8]">
              <div>
                <h3 className="text-base font-bold text-[#1C1917] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#EA580C]" />
                  Compliance Expiry Radar
                </h3>
                <p className="text-xs text-[#78716C]">
                  Predictive timeline grouping upcoming refills, quarterly checks, and hydrostatic pressure tests.
                </p>
              </div>

              {/* Summary Strip (Module D) */}
              <div className="px-3.5 py-1.5 bg-[#FFF8F2] border border-[#FED7AA] rounded-xl text-xs font-semibold text-[#1C1917]">
                <strong className="text-[#059669]">2 due in 30 days</strong> ·{' '}
                <strong className="text-[#D97706]">3 due in 90 days</strong> ·{' '}
                <strong className="text-[#DC2626]">1 overdue</strong>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FFF8F2] border-b border-[#F0E4D8] text-[#44403C] font-bold text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-4">Asset Tag</th>
                    <th className="py-2.5 px-4">Equipment Type</th>
                    <th className="py-2.5 px-4">Building &amp; Zone</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Schedule Visit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0E4D8]">
                  {DEMO_RADAR.map((item, idx) => (
                    <tr key={idx} className="hover:bg-orange-50/20 transition-colors">
                      <td className="py-3 px-4 font-bold text-[#1C1917]">{item.assetTag}</td>
                      <td className="py-3 px-4 text-[#44403C]">{item.type}</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-[#1C1917]">{item.building}</span>
                        <span className="text-[11px] text-[#78716C] block">{item.location}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.status === 'OVERDUE'
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {item.status} ({Math.abs(item.dueDays)}d {item.dueDays < 0 ? 'ago' : 'left'})
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {item.scheduled ? (
                          <span className="px-3 py-1 bg-emerald-50 text-[#059669] border border-emerald-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1">
                            <Check className="w-3 h-3" /> Scheduled ✓
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => toast.success(`Scheduled visit for ${item.assetTag} (Demo)`)}
                            className="px-3 py-1 bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-lg text-xs font-bold shadow-2xs"
                          >
                            Schedule visit
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: REPORTS */}
        {activeTab === 'REPORTS' && (
          <div className="bg-white p-6 rounded-2xl border border-[#F0E4D8] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0E4D8]">
              <div>
                <h3 className="text-base font-bold text-[#1C1917]">Compliance Reports &amp; Monthly Register</h3>
                <p className="text-xs text-[#78716C]">
                  One-click Form-B PDF generation and Excel register export with verifiable inspection links.
                </p>
              </div>

              <Link
                href="/sample-report"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-[#EA580C] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Open Sample Form-B Certificate</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            <div className="p-4 bg-[#FFF8F2] border border-[#FED7AA] rounded-2xl text-xs space-y-2">
              <span className="font-bold text-[#9A3412] flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-[#EA580C]" /> Monthly Register (.xlsx) Structure Preview:
              </span>
              <p className="text-[#44403C] leading-relaxed">
                Exports frozen bold headers: <code>Asset Tag</code> | <code>Type</code> | <code>Building</code> | <code>Floor/Zone</code> | <code>Last Service</code> | <code>Next Service Due</code> | <code>Next Hydro Due</code> | <code>Status</code> | <code>Last Inspection</code> | <code>Inspection Link</code>.
              </p>
            </div>
          </div>
        )}

        {/* Sticky Bottom Free Testing CTA Bar (G2) */}
        <div className="sticky bottom-4 z-30 p-4 sm:p-5 rounded-2xl bg-[#1C1917] text-white shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-white/10">
          <div className="space-y-0.5 text-center sm:text-left">
            <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Ready to eliminate paper AMC checklists and Excel chaos?
            </h4>
            <p className="text-xs text-[#D6D3D1]">
              Full access included during public beta — invite unlimited technicians and clients.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/login"
              className="px-5 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-500/25 flex items-center gap-1.5 transition-colors"
            >
              <span>Create your account — free testing access</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
