'use client';

import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Share2,
  Building2,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Sliders,
  X,
  FileCheck2,
} from 'lucide-react';
import Link from 'next/link';
import { formatStandardDate } from '@/lib/constants/india';

interface ReportsViewProps {
  buildings: any[];
  summary: any;
  company?: any;
}

export function ReportsView({ buildings, summary, company }: ReportsViewProps) {
  const [selectedStateFilter, setSelectedStateFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [designerOpen, setDesignerOpen] = useState<boolean>(false);
  const [designerConfig, setDesignerConfig] = useState({
    buildingId: buildings[0]?.id || 'sample',
    format: 'NBC 2016 · IS 2190 Annex B',
    period: 'Quarterly Audit (Current Cycle)',
    includePhotos: true,
    includeGpsWatermark: true,
    includeDualSignature: true,
  });

  const handleShareWhatsApp = (b: any) => {
    const reportUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}/report/${b.id}`
        : `https://vigilamc.vercel.app/report/${b.id}`;
    const message = encodeURIComponent(
      `*Fire Safety Inspection Report*\n\n` +
        `Building: *${b.name}*\n` +
        `Client: ${b.client?.name || 'Registered Premises'}\n` +
        `Rule / Standard: ${b.complianceRuleName || 'IS 2190:2010 / NBC 2016'}\n` +
        `Date: ${formatStandardDate(new Date())}\n\n` +
        `View & Download Official Certificate:\n${reportUrl}`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  const states = Array.from(new Set(buildings.map((b) => b.state || 'Delhi')));

  const filteredBuildings = buildings.filter((b) => {
    const matchesState = selectedStateFilter === 'ALL' || (b.state || 'Delhi') === selectedStateFilter;
    const matchesSearch =
      !searchQuery ||
      b.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.client?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.address?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesState && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel-dense p-5 sm:p-6 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF0E6] border border-[#FED7AA] text-[#C2410C] text-xs font-bold">
            <FileText className="w-3.5 h-3.5" />
            <span>Compliance Certificates &amp; Audit Reports</span>
          </div>
          <h2 className="font-display text-lg sm:text-xl font-black text-[#1C1917]">
            Download or Share Fire Safety Reports
          </h2>
          <p className="text-xs text-[#44403C] max-w-2xl">
            Generate print-ready A4 certificates for your clients, housing societies, or fire safety inspections.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            data-testid="build-report-btn"
            onClick={() => setDesignerOpen(true)}
            className="btn-flame inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-xs font-bold shadow-sm"
          >
            <Sliders className="w-4 h-4" />
            <span>Build Report</span>
          </button>

          <div className="px-4 py-2.5 rounded-xl bg-white/75 border border-[#FED7AA] text-center">
            <div className="text-[10px] font-bold uppercase text-[#44403C]">Ready Reports</div>
            <div className="text-lg font-black text-[#1C1917] tabular-nums">{buildings.length}</div>
          </div>
          <div className="px-4 py-2.5 rounded-xl bg-emerald-50/90 border border-emerald-200 text-center">
            <div className="text-[10px] font-bold uppercase text-[#059669]">Compliance Rate</div>
            <div className="text-lg font-black text-[#059669] tabular-nums">
              {summary?.complianceRate ?? 100}%
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel-dense flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search building, client or address..."
          className="glass-input flex-1 rounded-xl px-3.5 py-2 text-xs text-[#1C1917] placeholder-[#44403C]/60"
        />

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#44403C] font-semibold">State:</span>
          <select
            value={selectedStateFilter}
            onChange={(e) => setSelectedStateFilter(e.target.value)}
            className="glass-input rounded-xl px-3 py-2 text-xs text-[#1C1917]"
          >
            <option value="ALL">All States ({buildings.length})</option>
            {states.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Building Report Cards */}
      {filteredBuildings.length === 0 ? (
        <div className="glass-panel-dense p-12 rounded-2xl border border-dashed border-[#FED7AA] text-center space-y-3">
          <Building2 className="w-10 h-10 text-[#C2410C] mx-auto" />
          <h3 className="text-sm font-bold text-[#1C1917]">No buildings found</h3>
          <p className="text-xs text-[#44403C] max-w-md mx-auto">
            Add a client and building from the Clients &amp; Sites tab, or open the Build Report designer to preview a sample certificate.
          </p>
          <button
            type="button"
            onClick={() => setDesignerOpen(true)}
            className="btn-flame inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-bold"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Build Report</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBuildings.map((b) => {
            const equipments = b.equipments || [];
            const totalEq = equipments.length;
            const now = new Date();
            const overdueEq = equipments.filter((e: any) => {
              const hasDue = Boolean(e.nextDueDate && !isNaN(new Date(e.nextDueDate).getTime()));
              const diffDays = hasDue
                ? Math.ceil((new Date(e.nextDueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                : null;
              return (diffDays !== null && diffDays < 0) || e.status === 'OVERDUE' || e.liveStatus === 'OVERDUE';
            }).length;
            const verifiedEq = Math.max(0, totalEq - overdueEq);
            const isCompliant = overdueEq === 0 && totalEq > 0;

            return (
              <div
                key={b.id}
                className="glass-panel-dense p-5 rounded-2xl hover:border-[#EA580C]/45 transition-all flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#FFF0E6] text-[#C2410C] border border-[#FED7AA]">
                        {b.state || 'Delhi'} &bull; {b.reportingCycle || 'Quarterly'}
                      </span>
                      <h3 className="text-base font-bold text-[#1C1917] mt-1.5">{b.name}</h3>
                      <p className="text-xs text-[#44403C]">
                        {b.client?.name ? `${b.client.name} — ` : ''}
                        {b.address}
                      </p>
                    </div>

                    {isCompliant ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-[#059669] border border-emerald-200 shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" /> Ready
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-[#D97706] border border-amber-200 shrink-0">
                        <AlertTriangle className="w-3.5 h-3.5 text-[#D97706]" />{' '}
                        {overdueEq > 0 ? `${overdueEq} Overdue` : 'Pending'}
                      </span>
                    )}
                  </div>

                  {/* Equipment breakdown */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#1C1917]/10 text-center">
                    <div className="p-2 rounded-xl bg-white/75 border border-[#FED7AA]/60">
                      <div className="text-[10px] text-[#44403C]">Total Units</div>
                      <div className="text-sm font-bold text-[#1C1917] tabular-nums">{totalEq}</div>
                    </div>
                    <div className="p-2 rounded-xl bg-emerald-50/80 border border-emerald-200/60">
                      <div className="text-[10px] text-[#059669]">Safe / Valid</div>
                      <div className="text-sm font-bold text-[#059669] tabular-nums">{verifiedEq}</div>
                    </div>
                    <div className="p-2 rounded-xl bg-rose-50/80 border border-rose-200/60">
                      <div className="text-[10px] text-[#DC2626]">Overdue</div>
                      <div className="text-sm font-bold text-[#DC2626] tabular-nums">{overdueEq}</div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#1C1917]/10">
                  <Link
                    href={`/report/${b.id}`}
                    target="_blank"
                    className="btn-flame flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-white text-xs font-bold shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Open &amp; Print PDF</span>
                    <ExternalLink className="w-3 h-3 opacity-80" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setDesignerConfig((prev) => ({ ...prev, buildingId: b.id }));
                      setDesignerOpen(true);
                    }}
                    className="btn-ghost-flame inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Build Report</span>
                  </button>

                  <button
                    onClick={() => handleShareWhatsApp(b)}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#059669] border border-emerald-200 text-xs font-bold transition-all"
                    title="Send report link on WhatsApp"
                  >
                    <Share2 className="w-3.5 h-3.5 text-[#059669]" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* "Build Report" Designer Sheet / Drawer */}
      {designerOpen && (
        <div
          data-testid="build-report-designer-sheet"
          className="fixed inset-0 z-50 bg-[#1C1917]/50 backdrop-blur-xs flex justify-end"
        >
          <div className="glass-dialog w-full max-w-md h-full p-6 overflow-y-auto flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-[#1C1917]/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#FFF0E6] border border-[#FED7AA] flex items-center justify-center text-[#C2410C]">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-[#1C1917]">
                      Build Report Designer
                    </h3>
                    <p className="text-xs text-[#44403C]">
                      Customize statutory layout &amp; audit proof attachments
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDesignerOpen(false)}
                  className="p-1.5 rounded-lg text-[#44403C] hover:text-[#1C1917] hover:bg-[#FFF0E6]"
                  aria-label="Close Build Report Designer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-[#1C1917] mb-1.5">
                    Select Facility / Building
                  </label>
                  <select
                    value={designerConfig.buildingId}
                    onChange={(e) =>
                      setDesignerConfig({ ...designerConfig, buildingId: e.target.value })
                    }
                    className="glass-input w-full rounded-xl p-2.5 text-xs font-semibold text-[#1C1917]"
                  >
                    {buildings.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.state || 'Delhi'})
                      </option>
                    ))}
                    <option value="sample">Sample Commercial Tower (Demo)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#1C1917] mb-1.5">
                    Statutory Certificate Template
                  </label>
                  <select
                    value={designerConfig.format}
                    onChange={(e) =>
                      setDesignerConfig({ ...designerConfig, format: e.target.value })
                    }
                    className="glass-input w-full rounded-xl p-2.5 text-xs font-semibold text-[#1C1917]"
                  >
                    <option value="NBC 2016 · IS 2190 Annex B">
                      NBC 2016 · IS 2190:2010 Annex B (Pan-India Standard)
                    </option>
                    <option value="Form-B Fire Safety Certificate">
                      Form-B Bi-Annual Fire Safety Certificate
                    </option>
                    <option value="Insurance Risk Audit Pack">
                      Insurance Underwriter Photo &amp; Hydro-Test Pack
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#1C1917] mb-1.5">
                    Audit Window / Cycle
                  </label>
                  <select
                    value={designerConfig.period}
                    onChange={(e) =>
                      setDesignerConfig({ ...designerConfig, period: e.target.value })
                    }
                    className="glass-input w-full rounded-xl p-2.5 text-xs font-semibold text-[#1C1917]"
                  >
                    <option value="Quarterly Audit (Current Cycle)">
                      Quarterly Audit (Current Cycle)
                    </option>
                    <option value="Half-Yearly Statutory Filing">
                      Half-Yearly Statutory Filing
                    </option>
                    <option value="Annual Fire NOC Renewal">Annual Fire NOC Renewal</option>
                  </select>
                </div>

                <div className="space-y-2.5 pt-2">
                  <div className="font-bold text-[#1C1917]">Included Proof Sections</div>
                  {[
                    {
                      key: 'includePhotos',
                      label: 'Live Camera Gauge Photos (R2 Signed Proof)',
                    },
                    {
                      key: 'includeGpsWatermark',
                      label: '20m GPS Coordinates & Timestamp Watermark',
                    },
                    {
                      key: 'includeDualSignature',
                      label: 'Technician + Building Manager Dual Signatures',
                    },
                  ].map((opt) => (
                    <label
                      key={opt.key}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/80 border border-[#FED7AA] cursor-pointer"
                    >
                      <span className="font-medium text-[#1C1917]">{opt.label}</span>
                      <input
                        type="checkbox"
                        checked={(designerConfig as any)[opt.key]}
                        onChange={(e) =>
                          setDesignerConfig({
                            ...designerConfig,
                            [opt.key]: e.target.checked,
                          })
                        }
                        className="accent-[#C2410C] w-4 h-4"
                      />
                    </label>
                  ))}
                </div>

                <div className="p-3.5 rounded-xl bg-[#FFF0E6] border border-[#FED7AA] text-[#44403C]">
                  <div className="font-bold text-[#C2410C] mb-0.5">
                    Agency Header: {company?.name || 'VigilAMC Fire Safety Agency'}
                  </div>
                  <div>
                    Template: <strong className="text-[#1C1917]">{designerConfig.format}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#1C1917]/10 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setDesignerOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-white/80 border border-[#FED7AA] text-xs font-bold text-[#44403C] hover:text-[#1C1917]"
              >
                Cancel
              </button>
              <Link
                href={
                  designerConfig.buildingId && designerConfig.buildingId !== 'sample'
                    ? `/report/${designerConfig.buildingId}`
                    : '/sample-report'
                }
                onClick={() => setDesignerOpen(false)}
                className="btn-flame flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-xs font-bold shadow-sm"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>Generate &amp; Open Report</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
