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
  FileSpreadsheet,
  Clock,
  Scale,
  Mail,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { formatStandardDate } from '@/lib/constants/india';
import { ClientPortalAdminPanel } from './ClientPortalAdminPanel';
import { ComplianceReportManagementView } from './ComplianceReportManagementView';
import { EmailReportModal } from './EmailReportModal';
import { SITE_CONFIG } from '@/lib/siteConfig';
import {
  REPORT_TYPES,
  ReportTypeCode,
  JurisdictionCode,
  detectJurisdictionFromBuilding,
} from '@/lib/compliance-engine';

interface ReportsViewProps {
  buildings: any[];
  clients?: any[];
  summary: any;
  company?: any;
  equipments?: any[];
  inspections?: any[];
  onOpenApprovalsQueue?: () => void;
}

export function ReportsView({
  buildings,
  clients = [],
  summary,
  company,
  equipments = [],
  inspections = [],
  onOpenApprovalsQueue,
}: ReportsViewProps) {
  const [mainReportTab, setMainReportTab] = useState<
    'CERTIFICATES' | 'COMPLIANCE_MANAGEMENT' | 'PORTAL'
  >('CERTIFICATES');
  const [selectedStateFilter, setSelectedStateFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [designerOpen, setDesignerOpen] = useState<boolean>(false);
  const [exportingRegister, setExportingRegister] = useState<boolean>(false);
  const [emailModalBuilding, setEmailModalBuilding] = useState<{
    id: string;
    name: string;
    clientEmail?: string | null;
    clientName?: string | null;
  } | null>(null);

  const handleExportMonthlyRegister = async () => {
    setExportingRegister(true);
    try {
      const XLSX = await import('xlsx');
      const now = new Date();
      const yyyyMm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const baseOrigin =
        typeof window !== 'undefined' ? window.location.origin : SITE_CONFIG.SITE_URL;

      const allAssets: any[] =
        Array.isArray(equipments) && equipments.length > 0
          ? equipments
          : buildings.flatMap((b) =>
              (b.equipments || []).map((eq: any) => ({
                ...eq,
                buildingId: eq.buildingId || b.id,
                building: eq.building || { id: b.id, name: b.name },
              }))
            );

      const approvedInspections = (inspections || []).filter(
        (insp: any) => !insp.approvalStatus || insp.approvalStatus === 'APPROVED'
      );

      const rows = allAssets.map((eq: any) => {
        const bId = eq.buildingId || eq.building?.id || '';
        const bName =
          eq.building?.name || buildings.find((b) => b.id === bId)?.name || 'Registered Building';
        const assetInspections = approvedInspections
          .filter((i: any) => i.equipmentId === eq.id || i.buildingId === bId)
          .sort(
            (a: any, b: any) =>
              new Date(b.timestamp || b.createdAt || 0).getTime() -
              new Date(a.timestamp || a.createdAt || 0).getTime()
          );
        const latestApproved = assetInspections[0] || null;
        const hasApprovedForAsset = approvedInspections.some(
          (i: any) => i.equipmentId === eq.id || i.buildingId === bId
        );

        const formatDt = (d: any) =>
          d && !isNaN(new Date(d).getTime())
            ? new Date(d).toISOString().split('T')[0]
            : '—';

        const lastInspectionStr = latestApproved
          ? `${formatDt(latestApproved.timestamp || latestApproved.createdAt)} (${
              latestApproved.inspectorName || 'Field Service Technician'
            })`
          : 'Not Inspected';

        const inspectionLink =
          hasApprovedForAsset && bId ? `${baseOrigin}/report/${bId}` : '—';

        return {
          'Asset Tag': eq.qrCode || eq.id,
          Type: `${eq.type || 'Extinguisher'}${eq.capacity ? ` (${eq.capacity})` : ''}`,
          Building: bName,
          'Floor/Zone': eq.location || 'Main Zone',
          'Last Service': formatDt(eq.lastServiceDate),
          'Next Service Due': formatDt(eq.nextDueDate),
          'Next Hydro Due': formatDt(eq.hydroDueDate),
          Status: eq.liveStatus || eq.status || 'NOT_INSPECTED',
          'Last Inspection': lastInspectionStr,
          'Inspection Link': inspectionLink,
        };
      });

      const ws = XLSX.utils.json_to_sheet(
        rows.length > 0
          ? rows
          : [
              {
                'Asset Tag': 'EXT-001',
                Type: 'ABC (6kg)',
                Building: 'Sample Building',
                'Floor/Zone': 'Ground Lobby',
                'Last Service': yyyyMm + '-01',
                'Next Service Due': yyyyMm + '-28',
                'Next Hydro Due': yyyyMm + '-28',
                Status: 'OPERATIONAL',
                'Last Inspection': `${yyyyMm}-01 (Field Service Technician)`,
                'Inspection Link': `${baseOrigin}/sample-report`,
              },
            ]
      );

      ws['!cols'] = [
        { wch: 18 },
        { wch: 20 },
        { wch: 26 },
        { wch: 22 },
        { wch: 15 },
        { wch: 16 },
        { wch: 16 },
        { wch: 14 },
        { wch: 30 },
        { wch: 46 },
      ];
      (ws as any)['!freeze'] = { xSplit: 0, ySplit: 1, topLeftCell: 'A2', activePane: 'bottomLeft' };

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Monthly Register');
      const fileName = `vigilamc-register-${yyyyMm}.xlsx`;
      XLSX.writeFile(wb, fileName);
      toast.success(`Exported ${fileName} (${rows.length} assets)`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to export monthly register');
    } finally {
      setExportingRegister(false);
    }
  };

  const initialBldg = buildings[0];
  const [designerConfig, setDesignerConfig] = useState<{
    buildingId: string;
    reportType: ReportTypeCode;
    jurisdiction: JurisdictionCode;
    period: string;
    includePhotos: boolean;
    includeGpsWatermark: boolean;
    includeDualSignature: boolean;
  }>({
    buildingId: initialBldg?.id || 'sample',
    reportType: 'FIRE_SAFETY_INSPECTION_REPORT',
    jurisdiction: initialBldg ? detectJurisdictionFromBuilding(initialBldg) : 'DELHI',
    period: 'Half-Yearly Inspection Cycle',
    includePhotos: true,
    includeGpsWatermark: true,
    includeDualSignature: true,
  });

  const handleShareWhatsApp = (b: any) => {
    const reportUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}/report/${b.id}`
        : `${SITE_CONFIG.SITE_URL}/report/${b.id}`;
    const message = encodeURIComponent(
      `*Fire Safety Inspection & Maintenance Report*\n\n` +
        `Building: *${b.name}*\n` +
        `Client: ${b.client?.name || 'Registered Premises'}\n` +
        `Standards Reference: ${b.complianceRuleName || 'IS 2190:2024 / NBC 2016 Part 4'}\n` +
        `Date: ${formatStandardDate(new Date())}\n\n` +
        `View & Print 5-Page Inspection Report:\n${reportUrl}`
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

  const totalAssetsAcrossAll = summary?.totalEquipments ?? equipments.length;
  const verifiedAssetsAcrossAll = summary?.verifiedEquipments ?? 0;
  const computedReadinessRate =
    totalAssetsAcrossAll > 0 ? Math.round((verifiedAssetsAcrossAll / totalAssetsAcrossAll) * 100) : null;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel-dense p-5 sm:p-6 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF0E6] border border-[#FED7AA] text-[#C2410C] text-xs font-bold">
            <FileText className="w-3.5 h-3.5" />
            <span>Fire Safety Inspection &amp; Maintenance Reports</span>
          </div>
          <h2 className="font-display text-lg sm:text-xl font-black text-[#1C1917]">
            Jurisdiction-Aware Fire Safety Inspection &amp; Maintenance Reporting
          </h2>
          <p className="text-xs text-[#44403C] max-w-2xl">
            Generate print-ready 5-page A4 inspection reports, equipment registers, and corrective action reports for
            Delhi, Noida (Uttar Pradesh), and Gurugram (Haryana).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            data-testid="export-monthly-register-btn"
            onClick={handleExportMonthlyRegister}
            disabled={exportingRegister}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-[#FFF0E6] text-[#1C1917] border border-[#FED7AA] text-xs font-bold shadow-xs transition-all disabled:opacity-50"
            title="Download Monthly Equipment Register (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#059669]" />
            <span>{exportingRegister ? 'Exporting...' : 'Monthly Register (.xlsx)'}</span>
          </button>

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
            <div className="text-[10px] font-bold uppercase text-[#44403C]">Premises</div>
            <div className="text-lg font-black text-[#1C1917] tabular-nums">{buildings.length}</div>
          </div>
          <div className="px-4 py-2.5 rounded-xl bg-emerald-50/90 border border-emerald-200 text-center">
            <div className="text-[10px] font-bold uppercase text-[#059669]">Readiness Rate</div>
            <div className="text-lg font-black text-[#059669] tabular-nums">
              {computedReadinessRate !== null ? `${computedReadinessRate}%` : 'N/A (0 Assets)'}
            </div>
          </div>
        </div>
      </div>

      {/* Reports Section Subtabs: Inspection Reports | Compliance & Report Management | Client Portal */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#F0E4D8] pb-1">
        <button
          type="button"
          data-testid="reports-tab-certificates"
          onClick={() => setMainReportTab('CERTIFICATES')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            mainReportTab === 'CERTIFICATES'
              ? 'bg-[#EA580C] text-white shadow-xs'
              : 'bg-white text-[#44403C] hover:bg-orange-50/50 border border-[#F0E4D8]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Inspection Reports &amp; Asset Register</span>
        </button>

        <button
          type="button"
          data-testid="reports-tab-compliance-management"
          onClick={() => setMainReportTab('COMPLIANCE_MANAGEMENT')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            mainReportTab === 'COMPLIANCE_MANAGEMENT'
              ? 'bg-[#EA580C] text-white shadow-xs'
              : 'bg-white text-[#44403C] hover:bg-orange-50/50 border border-[#F0E4D8]'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>COMPLIANCE &amp; REPORT MANAGEMENT</span>
        </button>

        <button
          type="button"
          data-testid="reports-tab-client-portal"
          onClick={() => setMainReportTab('PORTAL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            mainReportTab === 'PORTAL'
              ? 'bg-[#EA580C] text-white shadow-xs'
              : 'bg-white text-[#44403C] hover:bg-orange-50/50 border border-[#F0E4D8]'
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          <span>Client Portal &amp; Receipts</span>
        </button>
      </div>

      {mainReportTab === 'PORTAL' ? (
        <ClientPortalAdminPanel clients={clients} buildings={buildings} />
      ) : mainReportTab === 'COMPLIANCE_MANAGEMENT' ? (
        <ComplianceReportManagementView />
      ) : (
        <>
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
              <span className="text-xs text-[#44403C] font-semibold">State / Jurisdiction:</span>
              <select
                value={selectedStateFilter}
                onChange={(e) => setSelectedStateFilter(e.target.value)}
                className="glass-input rounded-xl px-3 py-2 text-xs text-[#1C1917]"
              >
                <option value="ALL">All Jurisdictions ({buildings.length})</option>
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
                Add a client and building from the Clients &amp; Sites tab, or open the Build Report designer to preview a
                sample inspection report.
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
                const bEquipments = b.equipments || [];
                const totalEq = bEquipments.length;
                const now = new Date();
                const overdueEq = bEquipments.filter((e: any) => {
                  const hasDue = Boolean(e.nextDueDate && !isNaN(new Date(e.nextDueDate).getTime()));
                  const diffDays = hasDue
                    ? Math.ceil((new Date(e.nextDueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                    : null;
                  return (
                    (diffDays !== null && diffDays < 0) ||
                    e.status === 'OVERDUE' ||
                    e.status === 'DEFECTIVE' ||
                    e.liveStatus === 'OVERDUE'
                  );
                }).length;
                const verifiedEq = b.verifiedCount !== undefined ? b.verifiedCount : Math.max(0, totalEq - overdueEq);
                const notInspectedEq =
                  b.notInspectedCount !== undefined ? b.notInspectedCount : Math.max(0, totalEq - verifiedEq - overdueEq);
                const isAllInspectedAndOk = totalEq > 0 && overdueEq === 0 && notInspectedEq === 0;
                const detectedJur = detectJurisdictionFromBuilding(b);

                return (
                  <div
                    key={b.id}
                    className="glass-panel-dense p-5 rounded-2xl hover:border-[#EA580C]/45 transition-all flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#FFF0E6] text-[#C2410C] border border-[#FED7AA]">
                            {detectedJur === 'DELHI'
                              ? 'Delhi AMC Template'
                              : detectedJur === 'UP_NOIDA'
                              ? 'UP – Noida Template'
                              : detectedJur === 'HR_GURUGRAM'
                              ? 'Haryana – Gurugram Template'
                              : b.state || 'General Template'}{' '}
                            &bull; {b.reportingCycle || 'Half-Yearly'}
                          </span>
                          <h3 className="text-base font-bold text-[#1C1917] mt-1.5">{b.name}</h3>
                          <p className="text-xs text-[#44403C]">
                            {b.client?.name ? `${b.client.name} — ` : ''}
                            {b.address}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          {totalEq === 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300 shrink-0">
                              Insufficient Data (0 Assets)
                            </span>
                          ) : isAllInspectedAndOk ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-[#059669] border border-emerald-200 shrink-0">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" /> Inspection Completed
                            </span>
                          ) : overdueEq > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-[#DC2626] border border-rose-200 shrink-0">
                              <AlertTriangle className="w-3.5 h-3.5 text-[#DC2626]" /> {overdueEq} Action Required
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-[#D97706] border border-amber-200 shrink-0">
                              <Clock className="w-3.5 h-3.5 text-[#D97706]" /> Inspection Pending
                            </span>
                          )}

                          {(b.pendingApprovalsCount ?? 0) > 0 && (
                            <button
                              type="button"
                              data-testid={`awaiting-approval-chip-${b.id}`}
                              onClick={() => onOpenApprovalsQueue?.()}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FFF0E6] hover:bg-[#FED7AA] text-[#C2410C] border border-[#FED7AA] transition-colors cursor-pointer"
                              title="Review pending inspections in Approval Queue"
                            >
                              <Clock className="w-3 h-3 text-[#EA580C]" />
                              <span>{b.pendingApprovalsCount} awaiting approval</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Equipment breakdown */}
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#1C1917]/10 text-center">
                        <div className="p-2 rounded-xl bg-white/75 border border-[#FED7AA]/60">
                          <div className="text-[10px] text-[#44403C]">Registered</div>
                          <div className="text-sm font-bold text-[#1C1917] tabular-nums">{totalEq}</div>
                        </div>
                        <div className="p-2 rounded-xl bg-emerald-50/80 border border-emerald-200/60">
                          <div className="text-[10px] text-[#059669]">Operational</div>
                          <div className="text-sm font-bold text-[#059669] tabular-nums">{verifiedEq}</div>
                        </div>
                        <div className="p-2 rounded-xl bg-rose-50/80 border border-rose-200/60">
                          <div className="text-[10px] text-[#DC2626]">Overdue / Defect</div>
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
                        <span>Open &amp; Print 5-Page PDF</span>
                        <ExternalLink className="w-3 h-3 opacity-80" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setEmailModalBuilding({
                            id: b.id,
                            name: b.name,
                            clientEmail: b.client?.email || null,
                            clientName: b.client?.name || null,
                          });
                        }}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#EA580C] to-[#C2410C] hover:from-[#C2410C] hover:to-[#9A3412] text-white text-xs font-bold transition-all shadow-xs"
                        title="Directly email Form B PDF report to client"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Email to Client</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setDesignerConfig((prev) => ({
                            ...prev,
                            buildingId: b.id,
                            jurisdiction: detectJurisdictionFromBuilding(b),
                          }));
                          setDesignerOpen(true);
                        }}
                        className="btn-ghost-flame inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>Configure</span>
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
        </>
      )}

      {/* "Build Report" Designer Sheet / Drawer (Steps 2 & 12) */}
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
                      Select Jurisdiction Template (Delhi / Noida / Gurugram) &amp; Report Type
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
                    onChange={(e) => {
                      const bId = e.target.value;
                      const found = buildings.find((x) => x.id === bId);
                      setDesignerConfig({
                        ...designerConfig,
                        buildingId: bId,
                        jurisdiction: found ? detectJurisdictionFromBuilding(found) : designerConfig.jurisdiction,
                      });
                    }}
                    className="glass-input w-full rounded-xl p-2.5 text-xs font-semibold text-[#1C1917]"
                  >
                    {buildings.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.city || b.state || 'Delhi NCR'})
                      </option>
                    ))}
                    <option value="sample">Sample Commercial Tower (Demo)</option>
                  </select>
                </div>

                {/* Step 12: State-Wise Jurisdiction Template Selection */}
                <div>
                  <label className="block font-bold text-[#1C1917] mb-1.5">
                    State / Jurisdiction Template (Auto-Selected by Building Location)
                  </label>
                  <select
                    value={designerConfig.jurisdiction}
                    onChange={(e) =>
                      setDesignerConfig({
                        ...designerConfig,
                        jurisdiction: e.target.value as JurisdictionCode,
                      })
                    }
                    className="glass-input w-full rounded-xl p-2.5 text-xs font-semibold text-[#1C1917]"
                  >
                    <option value="DELHI">1. Delhi — Delhi AMC Inspection Report</option>
                    <option value="UP_NOIDA">
                      2. Uttar Pradesh – Noida — Noida Inspection &amp; Maintenance Report
                    </option>
                    <option value="HR_GURUGRAM">
                      3. Haryana – Gurugram — Gurugram Inspection &amp; Maintenance Report
                    </option>
                    <option value="GENERAL">General Fire Safety Inspection Report</option>
                  </select>
                </div>

                {/* Step 2: 6 New Report Types */}
                <div>
                  <label className="block font-bold text-[#1C1917] mb-1.5">
                    Report Type (Step 2 Naming System)
                  </label>
                  <select
                    value={designerConfig.reportType}
                    onChange={(e) =>
                      setDesignerConfig({
                        ...designerConfig,
                        reportType: e.target.value as ReportTypeCode,
                      })
                    }
                    className="glass-input w-full rounded-xl p-2.5 text-xs font-semibold text-[#1C1917]"
                  >
                    {Object.values(REPORT_TYPES).map((rt) => (
                      <option key={rt.code} value={rt.code}>
                        {rt.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#1C1917] mb-1.5">
                    Reporting Period / Cycle
                  </label>
                  <select
                    value={designerConfig.period}
                    onChange={(e) =>
                      setDesignerConfig({ ...designerConfig, period: e.target.value })
                    }
                    className="glass-input w-full rounded-xl p-2.5 text-xs font-semibold text-[#1C1917]"
                  >
                    <option value="Quarterly Inspection Cycle">Quarterly Inspection Cycle</option>
                    <option value="Half-Yearly Inspection Cycle">Half-Yearly Inspection Cycle</option>
                    <option value="Annual AMC Maintenance Cycle">Annual AMC Maintenance Cycle</option>
                  </select>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FFF0E6] border border-[#FED7AA] text-[#44403C] space-y-1">
                  <div className="font-bold text-[#C2410C]">
                    Agency Header: {company?.name || 'Service Agency'}
                  </div>
                  <div>
                    Selected Report:{' '}
                    <strong className="text-[#1C1917]">
                      {REPORT_TYPES[designerConfig.reportType]?.name}
                    </strong>
                  </div>
                  <div className="text-[11px] text-[#1C1917] font-semibold">
                    ✓ Includes 5-page layout, BIS IS 2190:2024 equipment mapping, and mandatory legal disclaimer.
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
                    ? `/report/${designerConfig.buildingId}?reportType=${designerConfig.reportType}&jurisdiction=${designerConfig.jurisdiction}`
                    : '/sample-report'
                }
                onClick={() => setDesignerOpen(false)}
                className="btn-flame flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-xs font-bold shadow-sm"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>Generate &amp; Open 5-Page Report</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {emailModalBuilding && (
        <EmailReportModal
          isOpen={Boolean(emailModalBuilding)}
          onClose={() => setEmailModalBuilding(null)}
          buildingId={emailModalBuilding.id}
          buildingName={emailModalBuilding.name}
          clientEmail={emailModalBuilding.clientEmail}
          clientName={emailModalBuilding.clientName}
        />
      )}
    </div>
  );
}
