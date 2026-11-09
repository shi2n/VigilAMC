'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import EmberLine from '@/components/home/EmberLine';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  Printer,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  MessageCircle,
  Mail,
  Copy,
  Check,
  SlidersHorizontal,
  FileText,
  Clock,
  MapPin,
  Calendar,
  Camera,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Scale,
  Building2,
  Save,
} from 'lucide-react';
import { SITE_CONFIG } from '@/lib/siteConfig';
import { EmailReportModal } from '@/components/admin/EmailReportModal';
import {
  REPORT_TYPES,
  ReportTypeCode,
  JURISDICTIONS,
  JurisdictionCode,
  PERMANENT_LEGAL_DISCLAIMER_PARAGRAPHS,
  ZERO_ASSET_MESSAGE,
  INCOMPLETE_INSPECTION_MESSAGE,
} from '@/lib/compliance-engine';

function formatSafeDate(dateVal: any): string {
  if (!dateVal) return '—';
  const parsed = new Date(dateVal);
  if (isNaN(parsed.getTime())) return '—';
  return parsed.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatSafeDateTime(dateVal: any): string {
  if (!dateVal) return '—';
  const parsed = new Date(dateVal);
  if (isNaN(parsed.getTime())) return '—';
  return `${parsed.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })}, ${parsed.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

function normalizeWhatsAppPhone(rawPhone: string): string {
  const digits = (rawPhone || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith('0')) return `91${digits.slice(1)}`;
  return digits;
}

function calculateAgeDays(dateVal: any): number {
  if (!dateVal) return 0;
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return 0;
  const diffMs = Date.now() - d.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

export default function ComplianceReportPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const buildingId = (params?.buildingId as string) || '';

  const [selectedReportType, setSelectedReportType] = useState<ReportTypeCode>(
    ((searchParams?.get('reportType') as ReportTypeCode) || 'FIRE_SAFETY_INSPECTION_REPORT')
  );
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<JurisdictionCode | ''>(
    ((searchParams?.get('jurisdiction') as JurisdictionCode) || '')
  );

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Client delivery & Jurisdiction Reference Editor state
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [showContactEditor, setShowContactEditor] = useState(false);
  const [showJurisdictionEditor, setShowJurisdictionEditor] = useState(false);
  const [savingBuildingFields, setSavingBuildingFields] = useState(false);

  const [occupancyType, setOccupancyType] = useState('');
  const [buildingHeight, setBuildingHeight] = useState('');
  const [localAuthority, setLocalAuthority] = useState('');
  const [fscNumber, setFscNumber] = useState('');
  const [fscValidityDate, setFscValidityDate] = useState('');
  const [fireNocNumber, setFireNocNumber] = useState('');
  const [fireNocIssueDate, setFireNocIssueDate] = useState('');
  const [fireNocExpiryDate, setFireNocExpiryDate] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastTone, setToastTone] = useState<'success' | 'error'>('success');
  const [copiedLink, setCopiedLink] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);

  const showToast = (msg: string, tone: 'success' | 'error' = 'success') => {
    setToastTone(tone);
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  const fetchReport = useCallback(
    async (overrideType?: ReportTypeCode, overrideJurisdiction?: JurisdictionCode | '') => {
      if (!buildingId) return;
      try {
        setLoading(true);
        setError(null);
        const rType = overrideType || selectedReportType;
        const jur = overrideJurisdiction !== undefined ? overrideJurisdiction : selectedJurisdiction;
        const qs = new URLSearchParams();
        if (rType) qs.set('reportType', rType);
        if (jur) qs.set('jurisdiction', jur);

        const res = await fetch(`/api/report/${encodeURIComponent(buildingId)}?${qs.toString()}`);
        const json = await res.json().catch(() => ({}));

        if (!res.ok || json.error || !json.building || !json.summary) {
          setError(json.error || `Could not load inspection report (HTTP ${res.status})`);
          setData(null);
          return;
        }

        setData(json);
        setClientPhone(json.building?.client?.phone || '');
        setClientEmail(json.building?.client?.email || '');

        if (!jur && json.reportMetadata?.jurisdictionCode) {
          setSelectedJurisdiction(json.reportMetadata.jurisdictionCode);
        }

        setOccupancyType(json.building?.occupancyType || '');
        setBuildingHeight(json.building?.buildingHeight || '');
        setLocalAuthority(json.building?.localAuthority || '');
        setFscNumber(json.building?.fscNumber || '');
        setFscValidityDate(
          json.building?.fscValidityDate ? new Date(json.building.fscValidityDate).toISOString().slice(0, 10) : ''
        );
        setFireNocNumber(json.building?.fireNocNumber || '');
        setFireNocIssueDate(
          json.building?.fireNocIssueDate ? new Date(json.building.fireNocIssueDate).toISOString().slice(0, 10) : ''
        );
        setFireNocExpiryDate(
          json.building?.fireNocExpiryDate ? new Date(json.building.fireNocExpiryDate).toISOString().slice(0, 10) : ''
        );

        if (typeof document !== 'undefined' && json.building?.name) {
          const refNum = json.report?.reportNumber || 'VAMC-RPT';
          const titleName = json.reportMetadata?.reportTypeName || 'Fire Safety Inspection & Maintenance Report';
          document.title = `${json.building.name} - ${titleName} (${refNum})`;
        }
      } catch (e: any) {
        setError(e?.message || 'Unexpected network error while generating report.');
        setData(null);
      } finally {
        setLoading(false);
      }
    },
    [buildingId, selectedReportType, selectedJurisdiction]
  );

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleSaveJurisdictionFields = async () => {
    try {
      setSavingBuildingFields(true);
      const res = await fetch(`/api/report/${encodeURIComponent(buildingId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_BUILDING_COMPLIANCE_FIELDS',
          jurisdictionCode: selectedJurisdiction || null,
          occupancyType: occupancyType.trim() || null,
          buildingHeight: buildingHeight.trim() || null,
          localAuthority: localAuthority.trim() || null,
          fscNumber: fscNumber.trim() || null,
          fscValidityDate: fscValidityDate || null,
          fireNocNumber: fireNocNumber.trim() || null,
          fireNocIssueDate: fireNocIssueDate || null,
          fireNocExpiryDate: fireNocExpiryDate || null,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.error) {
        showToast(json.error || 'Failed to save building compliance reference details', 'error');
        return;
      }
      showToast('Premises jurisdiction & FSC / Fire NOC reference details updated');
      setShowJurisdictionEditor(false);
      await fetchReport(selectedReportType, selectedJurisdiction);
    } catch (err: any) {
      showToast(err?.message || 'Network error while saving reference details', 'error');
    } finally {
      setSavingBuildingFields(false);
    }
  };

  const handleCloseOrBack = () => {
    if (typeof window !== 'undefined') {
      if (window.history.length <= 1) {
        window.close();
        setTimeout(() => {
          router.push('/dashboard');
        }, 150);
        return;
      }
    }
    router.push('/dashboard');
  };

  const handlePrint = () => {
    if (typeof document !== 'undefined' && data?.building?.name) {
      const refNum = data?.report?.reportNumber || 'VAMC-RPT';
      const titleName = data?.reportMetadata?.reportTypeName || 'Fire Safety Inspection & Maintenance Report';
      document.title = `${data.building.name} - ${titleName} (${refNum})`;
    }
    window.print();
  };

  const getReportUrl = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : SITE_CONFIG.SITE_URL;
    const qs = new URLSearchParams();
    if (selectedReportType) qs.set('reportType', selectedReportType);
    if (selectedJurisdiction) qs.set('jurisdiction', selectedJurisdiction);
    return `${origin}/report/${buildingId}${qs.toString() ? `?${qs.toString()}` : ''}`;
  };

  const getVerifyUrl = () => {
    const refId = data?.report?.reportNumber || buildingId;
    return `${SITE_CONFIG.SITE_URL}/verify/${encodeURIComponent(refId)}`;
  };

  const handleCopyClientLink = async () => {
    const url = getReportUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      showToast('Inspection report link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      showToast(`Report Link: ${url}`);
    }
  };

  const handleSendWhatsApp = () => {
    const url = getReportUrl();
    const bldgName = data?.building?.name || 'Client Facility';
    const agencyName = data?.company?.name || 'Fire Safety Service Agency';
    const reportTitle = data?.reportMetadata?.reportTypeName || 'Fire Safety Inspection & Maintenance Report';
    const reportStatus = data?.compliance?.reportStatus || data?.summary?.overallStatus || 'INSUFFICIENT DATA';
    const opCount = data?.summary?.operational ?? 0;
    const totalCount = data?.summary?.total ?? 0;

    const statusLine =
      totalCount === 0
        ? 'INSUFFICIENT DATA (0 Registered Assets)'
        : `${reportStatus} (${opCount} of ${totalCount} Operational)`;

    const message = [
      `*${reportTitle} — ${bldgName}*`,
      ``,
      `• *Inspection Status:* ${statusLine}`,
      `• *Servicing Agency:* ${agencyName}`,
      `• *Report Reference:* ${data?.report?.reportNumber || 'VAMC-RPT'}`,
      ``,
      `View & download the 5-page A4 inspection and maintenance report directly:`,
      url,
    ].join('\n');

    const formattedPhone = normalizeWhatsAppPhone(clientPhone);
    const waUrl = formattedPhone
      ? `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;

    window.open(waUrl, '_blank', 'noopener,noreferrer');
    showToast('Opening WhatsApp with inspection report summary...');
  };

  const handleSendEmail = async () => {
    const url = getReportUrl();
    const bldgName = data?.building?.name || 'Client Facility';
    const agencyName = data?.company?.name || 'Fire Safety Service Agency';
    const reportTitle = data?.reportMetadata?.reportTypeName || 'Fire Safety Inspection & Maintenance Report';
    const reportStatus = data?.compliance?.reportStatus || data?.summary?.overallStatus || 'INSUFFICIENT DATA';
    const opCount = data?.summary?.operational ?? 0;
    const totalCount = data?.summary?.total ?? 0;

    try {
      await navigator.clipboard.writeText(url);
    } catch {}

    const statusLine =
      totalCount === 0
        ? 'INSUFFICIENT DATA (0 Registered Assets)'
        : `${reportStatus} (${opCount} / ${totalCount} Operational)`;

    const subject = `${reportTitle} — ${bldgName} (${data?.report?.reportNumber || 'VAMC-RPT'})`;
    const body = [
      `Dear ${data?.building?.client?.contactPerson || data?.building?.client?.name || 'Facility Manager'},`,
      ``,
      `Please find below the ${reportTitle} for ${bldgName}.`,
      ``,
      `Summary:`,
      `- Facility: ${bldgName} (${data?.building?.address || ''})`,
      `- Report Status: ${statusLine}`,
      `- Servicing Agency: ${agencyName}`,
      `- Report Reference ID: ${data?.report?.reportNumber || 'VAMC-RPT'}`,
      ``,
      `Click below to view and print the 5-page A4 report:`,
      url,
      ``,
      `Note: This document is an equipment inspection and maintenance report only and does not constitute a government-issued Fire NOC or Fire Safety Certificate.`,
      ``,
      `Regards,`,
      `${data?.signatoryName || data?.company?.contactPerson || 'Authorized Agency Representative'}`,
      `${agencyName}`,
    ].join('\n');

    const mailto = `mailto:${encodeURIComponent(clientEmail.trim())}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
    showToast('Report link copied & email draft opened!');
  };

  const company = data?.company || {};
  const building = data?.building || {};
  const report = data?.report || {};
  const reportMetadata = data?.reportMetadata || {};
  const compliance = data?.compliance || {};
  const summary = data?.summary || {};
  const equipments = Array.isArray(building?.equipments) ? building.equipments : [];
  const inspections = Array.isArray(building?.inspections) ? building.inspections : [];
  const correctiveActions = Array.isArray(building?.correctiveActions) ? building.correctiveActions : [];
  const defects = Array.isArray(building?.defects) ? building.defects : [];
  const applicableStandardsDetailed = Array.isArray(data?.applicableStandardsDetailed)
    ? data.applicableStandardsDetailed
    : [];
  const legalReferences = Array.isArray(data?.legalReferences) ? data.legalReferences : [];
  const disclaimerParagraphs: string[] =
    data?.legalDisclaimer?.paragraphs || PERMANENT_LEGAL_DISCLAIMER_PARAGRAPHS;

  const activeJurisdictionCode: JurisdictionCode =
    (reportMetadata?.jurisdictionCode as JurisdictionCode) || 'GENERAL';
  const jurisdictionConfig = JURISDICTIONS[activeJurisdictionCode] || JURISDICTIONS.GENERAL;
  const activeReportType =
    REPORT_TYPES[(reportMetadata?.reportType as ReportTypeCode) || selectedReportType] ||
    REPORT_TYPES.FIRE_SAFETY_INSPECTION_REPORT;

  const totalCount = compliance?.counts?.totalRegistered ?? summary?.total ?? equipments.length;
  const inspectedCount = compliance?.counts?.inspectedCount ?? summary?.inspected ?? 0;
  const operationalCount = compliance?.counts?.operationalCount ?? summary?.operational ?? 0;
  const nonOperationalCount = compliance?.counts?.nonOperationalCount ?? summary?.nonOperational ?? 0;
  const maintenanceDueCount = compliance?.counts?.maintenanceDueCount ?? summary?.dueSoon ?? 0;
  const overdueCount = compliance?.counts?.overdueCount ?? summary?.overdue ?? 0;
  const notInspectedCount = compliance?.counts?.notInspectedCount ?? summary?.notInspected ?? 0;
  const openFindingsCount = compliance?.counts?.openDefectsCount ?? summary?.openFindings ?? 0;
  const resolvedFindingsCount = compliance?.counts?.resolvedDefectsCount ?? summary?.resolvedFindings ?? 0;
  const compliancePercentage: number | null =
    compliance?.compliancePercentage !== undefined ? compliance.compliancePercentage : null;

  const reportStatus: string =
    compliance?.reportStatus || summary?.overallStatus || (totalCount === 0 ? 'INSUFFICIENT DATA' : 'NOT INSPECTED');
  const statusBadgeColor: 'green' | 'orange' | 'red' | 'grey' =
    compliance?.statusBadgeColor ||
    (reportStatus === 'INSPECTION COMPLETED' || reportStatus === 'CORRECTIVE ACTION COMPLETED'
      ? 'green'
      : reportStatus === 'INSPECTION IN PROGRESS'
      ? 'orange'
      : reportStatus === 'INSUFFICIENT DATA' || reportStatus === 'NOT INSPECTED'
      ? 'grey'
      : 'red');

  const statusBannerMessage: string =
    compliance?.statusBannerMessage ||
    (totalCount === 0 ? ZERO_ASSET_MESSAGE : INCOMPLETE_INSPECTION_MESSAGE);

  const signatoryName =
    data?.signatoryName || company?.signatoryName || company?.contactPerson || 'Authorized Agency Representative';

  // Next-due schedule: sorted by nextDueDate ascending
  const nextDueSchedule = useMemo(() => {
    return [...equipments]
      .filter((eq: any) => eq.nextDueDate)
      .sort((a: any, b: any) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime())
      .slice(0, 10);
  }, [equipments]);

  // Combined Findings & Defects list for Page 2 & Page 5
  const combinedFindings = useMemo(() => {
    const list: any[] = [];
    for (const ca of correctiveActions) {
      list.push({
        id: ca.id,
        assetRef: ca.assetRef || ca.equipment?.qrCode || 'Premises',
        title: ca.title,
        description: ca.description,
        severity: ca.severity || 'MEDIUM',
        status: ca.status || 'OPEN',
        openedAt: ca.openedAt || ca.createdAt,
        closeNote: ca.closeNote,
        workshopNote: ca.workshopNote,
      });
    }
    for (const def of defects) {
      if (!list.some((item) => item.id === def.id)) {
        list.push({
          id: def.id,
          assetRef: def.equipmentId ? 'Equipment Defect' : 'Premises',
          title: def.description,
          description: 'Recorded during equipment inspection.',
          severity: def.severity || 'MEDIUM',
          status: def.status || 'OPEN',
          openedAt: def.reportedAt,
          closeNote: def.resolvedAt ? `Resolved on ${formatSafeDate(def.resolvedAt)}` : null,
          workshopNote: null,
        });
      }
    }
    for (const eq of equipments) {
      if (
        (eq.inspectionStatus === 'NON_OPERATIONAL' || eq.inspectionStatus === 'OVERDUE') &&
        !list.some((item) => item.assetRef === eq.qrCode)
      ) {
        list.push({
          id: `eq-finding-${eq.id}`,
          assetRef: eq.qrCode || 'Equipment',
          title: `${eq.type} (${eq.capacity || 'Standard'}) — ${eq.statusLabel}`,
          description: `Located at ${eq.location || 'Premises'}. ${eq.inspectionNotes || ''}`,
          severity: eq.inspectionStatus === 'NON_OPERATIONAL' ? 'HIGH' : 'MEDIUM',
          status: 'OPEN',
          openedAt: eq.latestInspectionDate || eq.createdAt,
          closeNote: null,
          workshopNote: null,
        });
      }
    }
    return list;
  }, [correctiveActions, defects, equipments]);

  const reportDateFormatted = formatSafeDate(reportMetadata?.generatedAt || report?.generatedAt || new Date());
  const auditCycleDisplay = reportMetadata?.reportingPeriod || report?.cyclePeriod || building?.complianceCycle || 'Half-Yearly';
  const totalPages = 5;

  // Status badge helper (Strictly adheres to Step 9: Green / Orange / Red / Grey)
  const getReportStatusBadgeStyle = (color: 'green' | 'orange' | 'red' | 'grey') => {
    switch (color) {
      case 'green':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'orange':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'red':
        return 'bg-rose-50 text-rose-800 border-rose-300';
      case 'grey':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  // Common footer component across all 5 pages
  const ReportPageFooter = ({ pageNumber }: { pageNumber: number }) => (
    <div className="report-footer mt-auto pt-3 border-t border-slate-300 text-[10px] text-slate-600 space-y-1">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[10px] font-semibold text-slate-800">
        <span>
          Generated on VigilAMC Platform &bull; {jurisdictionConfig.reportTemplateName} (v{reportMetadata?.templateVersion || '2.0.0'}) &bull; {reportDateFormatted}
        </span>
        <span className="font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
          Page {pageNumber} of {totalPages}
        </span>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[9.5px]">
        <div className="text-slate-700">
          <span className="font-bold">Report Authenticity Verification URL:</span>{' '}
          <span className="font-mono font-bold text-[#C2410C] underline">{getVerifyUrl()}</span>
        </div>
        <div className="text-slate-500 font-mono text-[9px]">
          Ref: {report?.reportNumber || 'VAMC-RPT'} &bull; Integrity Hash: {reportMetadata?.integrityHash || 'VERIFIED'}
        </div>
      </div>
      <div className="text-[8.5px] text-slate-500 border-t border-slate-200 pt-1 leading-snug">
        <span className="font-bold text-slate-700">NON-STATUTORY NOTICE:</span> This document is an equipment inspection and
        maintenance report only. It does NOT constitute a government-issued Fire Safety Certificate (Form-H), Stand-by Duty
        Application (Form-B), or Fire NOC.
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="bg-[#FFF8F2] min-h-screen py-10 px-4 flex items-center justify-center">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-lg p-8 max-w-md w-full flex flex-col items-center gap-3 text-slate-700 text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-[#C2410C]" />
          <p className="text-sm font-bold text-slate-900">
            Generating Fire Safety Inspection &amp; Maintenance Report...
          </p>
          <p className="text-xs text-slate-500">
            Evaluating registered assets, field inspection records, jurisdiction framework &amp; BIS standards
          </p>
        </div>
      </div>
    );
  }

  if (error || !data || !data.building || !data.summary) {
    return (
      <div className="bg-[#FFF8F2] min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-6 text-center space-y-4 shadow-xl text-slate-900">
          <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto text-red-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-extrabold text-slate-900">Unable to Load Inspection Report</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            {error || 'This building report could not be found or generated right now.'}
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <button
              onClick={() => fetchReport()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#C2410C] hover:bg-[#1C1917] text-white font-bold text-xs transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-[#FFF8F2] min-h-screen py-6 sm:py-10 px-3 sm:px-6 print:bg-white print:p-0 text-[#1C1917]">
      <EmberLine />

      {/* Dedicated @page A4 Portrait Print Rules */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          html,
          body {
            background: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          .print-page-break {
            page-break-before: always !important;
            break-before: page !important;
          }
          .print-avoid-break {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`no-print print:hidden fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold border ${
            toastTone === 'error'
              ? 'bg-rose-950 border-rose-500/40 text-white'
              : 'bg-slate-900 border-emerald-500/40 text-white'
          }`}
        >
          {toastTone === 'error' ? (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sticky Top Action & Template Selector Bar (Screen Only) */}
      <div
        data-testid="report-glass-action-bar"
        className="no-print print:hidden max-w-[210mm] mx-auto mb-6 sticky top-3 z-40 glass-panel-dense rounded-xl p-3 sm:px-4 space-y-3"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Left: Back + Selectors (Step 2 & Step 12) */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleCloseOrBack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

            {/* Step 12: State-Wise Jurisdiction Template Selector */}
            <div className="flex items-center gap-1.5">
              <label htmlFor="jurisdiction-select" className="text-[10px] font-bold uppercase text-slate-500">
                Jurisdiction:
              </label>
              <select
                id="jurisdiction-select"
                data-testid="report-jurisdiction-select"
                value={selectedJurisdiction || activeJurisdictionCode}
                onChange={(e) => {
                  const val = e.target.value as JurisdictionCode;
                  setSelectedJurisdiction(val);
                  fetchReport(selectedReportType, val);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs font-bold focus:outline-none focus:border-[#EA580C]"
              >
                <option value="DELHI">1. Delhi (Delhi AMC Inspection Report)</option>
                <option value="UP_NOIDA">2. Uttar Pradesh – Noida (Noida Report)</option>
                <option value="HR_GURUGRAM">3. Haryana – Gurugram (Gurugram Report)</option>
                <option value="GENERAL">General Inspection Report</option>
              </select>
            </div>

            {/* Step 2: 6 Report Types Selector */}
            <div className="flex items-center gap-1.5">
              <label htmlFor="report-type-select" className="text-[10px] font-bold uppercase text-slate-500">
                Report Type:
              </label>
              <select
                id="report-type-select"
                data-testid="report-type-select"
                value={selectedReportType}
                onChange={(e) => {
                  const val = e.target.value as ReportTypeCode;
                  setSelectedReportType(val);
                  fetchReport(val, selectedJurisdiction);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs font-bold focus:outline-none focus:border-[#EA580C]"
              >
                {Object.values(REPORT_TYPES).map((rt) => (
                  <option key={rt.code} value={rt.code}>
                    {rt.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowJurisdictionEditor((prev) => !prev)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-[11px] font-bold transition-all cursor-pointer"
              title="Edit FSC / Fire NOC reference & occupancy details"
            >
              <Building2 className="w-3.5 h-3.5 text-[#C2410C]" />
              <span>FSC / NOC Ref</span>
            </button>

            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              title="Send report link on WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handleSendEmail}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              title="Email report to client"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email</span>
            </button>

            <button
              type="button"
              onClick={handleCopyClientLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-semibold text-xs transition-all cursor-pointer"
              title="Copy direct report link"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied ✓' : 'Copy Link'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowContactEditor((prev) => !prev)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-300 text-[11px] font-medium transition-all cursor-pointer"
              title="Customize recipient contact"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setEmailModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#EA580C] to-[#C2410C] hover:from-[#C2410C] hover:to-[#9A3412] text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
              title="Email Form B report directly to client"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email to Client</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#1C1917] to-[#C2410C] hover:from-[#1C1917] hover:to-[#1C1917] text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>Print / Save 5-Page PDF</span>
            </button>
          </div>
        </div>

        {/* Inline Jurisdiction & FSC / Fire NOC Reference Editor (Step 3) */}
        {showJurisdictionEditor && (
          <div className="pt-3 border-t border-slate-200 bg-white/90 rounded-lg p-3 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div className="font-bold text-slate-900">
                Premises Occupancy &amp; Client-Supplied Statutory Reference ({jurisdictionConfig.label})
              </div>
              <span className="text-[10px] text-slate-500">
                Optional fields — only displayed as client-supplied reference, never auto-certified.
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">
                  Building Occupancy Classification
                </label>
                <input
                  type="text"
                  value={occupancyType}
                  onChange={(e) => setOccupancyType(e.target.value)}
                  placeholder="e.g. Mercantile / Business / Residential / Industrial"
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">
                  Building Height / Covered Area
                </label>
                <input
                  type="text"
                  value={buildingHeight}
                  onChange={(e) => setBuildingHeight(e.target.value)}
                  placeholder="e.g. 24m (G+7 Floors)"
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">
                  District / Local Authority
                </label>
                <input
                  type="text"
                  value={localAuthority}
                  onChange={(e) => setLocalAuthority(e.target.value)}
                  placeholder={jurisdictionConfig.referenceFields.localAuthorityDefault}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-xs"
                />
              </div>
              {activeJurisdictionCode === 'DELHI' ? (
                <>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">
                      Existing Delhi FSC (Form-H) Number (If Supplied)
                    </label>
                    <input
                      type="text"
                      value={fscNumber}
                      onChange={(e) => setFscNumber(e.target.value)}
                      placeholder="Client-supplied FSC number"
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">
                      FSC Validity Date (If Supplied)
                    </label>
                    <input
                      type="date"
                      value={fscValidityDate}
                      onChange={(e) => setFscValidityDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-xs"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">
                      Existing Fire NOC Ref. Number (If Supplied)
                    </label>
                    <input
                      type="text"
                      value={fireNocNumber}
                      onChange={(e) => setFireNocNumber(e.target.value)}
                      placeholder="Client-supplied Fire NOC reference"
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">
                      Fire NOC Issue Date (If Supplied)
                    </label>
                    <input
                      type="date"
                      value={fireNocIssueDate}
                      onChange={(e) => setFireNocIssueDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">
                      Fire NOC Expiry / Validity Date (If Supplied)
                    </label>
                    <input
                      type="date"
                      value={fireNocExpiryDate}
                      onChange={(e) => setFireNocExpiryDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-xs"
                    />
                  </div>
                </>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowJurisdictionEditor(false)}
                className="px-3 py-1 rounded border border-slate-300 text-slate-600 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingBuildingFields}
                onClick={handleSaveJurisdictionFields}
                className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingBuildingFields ? 'Saving...' : 'Save Reference Details'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Inline Recipient Contact Drawer */}
        {showContactEditor && (
          <div className="pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[11px] text-slate-600 font-semibold mb-1">
                Client WhatsApp / Mobile Number
              </label>
              <input
                type="text"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="e.g. +91 98200 45678"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-emerald-600"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-600 font-semibold mb-1">
                Client Email Address
              </label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="e.g. facility.manager@client.com"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-[#EA580C]"
              />
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* PAGE 1: REPORT COVER & INSPECTION SUMMARY (Steps 2, 3, 6, 7, 9)           */}
      {/* ========================================================================= */}
      <div
        data-testid="report-page-1-cover"
        className="max-w-[210mm] mx-auto bg-white shadow-2xl border border-slate-200 rounded-sm sm:p-10 p-6 text-slate-900 print:shadow-none print:border-none print:max-w-none print:p-0 mb-8 flex flex-col justify-between min-h-[275mm]"
      >
        <div>
          {/* Servicing Agency Header (Step 7: Verified / Unverified Credential Display) */}
          <div className="border-b-2 border-slate-900 pb-4 mb-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                {company?.brandLogoUrl && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={company.brandLogoUrl}
                    alt={company?.name || 'Agency Logo'}
                    data-testid="report-brand-logo"
                    className="h-14 w-auto max-w-[140px] object-contain rounded border border-slate-200 p-1 bg-white shrink-0"
                  />
                )}
                <div>
                  <div className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 uppercase">
                    {company?.name || 'Service Agency'}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-700 mt-0.5 flex flex-wrap items-center gap-1.5">
                    <span>Fire Safety Inspection &amp; Maintenance Servicing Agency</span>
                    {company?.licenseNumber ? (
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          company.isLicenseVerified
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-amber-50 text-amber-800 border-amber-300'
                        }`}
                      >
                        License Ref: {company.licenseNumber} ({company.licenseVerificationLabel})
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-300">
                        Agency License: Not Provided
                      </span>
                    )}
                    {company?.gstin ? (
                      <span className="font-mono text-[10px] text-slate-600">&bull; GSTIN: {company.gstin}</span>
                    ) : null}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 max-w-lg leading-relaxed">
                    {company?.address || 'Address Not Provided'} &bull; Phone: {company?.phone || 'Not Provided'} &bull;
                    Email: {company?.email || 'Not Provided'}
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-3 py-1 rounded border border-slate-300 block sm:inline-block">
                  Ref: {report?.reportNumber || 'VAMC-RPT'}
                </span>
                <div className="text-[11px] text-slate-600 mt-1 font-medium">
                  Report Date: <strong className="text-slate-900">{reportDateFormatted}</strong>
                </div>
                <div className="text-[11px] text-slate-600 font-medium">
                  Reporting Period: <strong className="text-slate-900">{auditCycleDisplay}</strong>
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  Template: {jurisdictionConfig.reportTemplateName}
                </div>
              </div>
            </div>
          </div>

          {/* Document Title Block (Step 2: Default Title & Subtitle, Never "Official Form-B Certificate") */}
          <div className="text-center py-4 px-4 bg-[#FFF8F2] border border-[#FED7AA] rounded-xl mb-5">
            <div className="flex items-center justify-center gap-2 flex-wrap mb-1.5">
              <span className="inline-block text-[10px] font-black tracking-wider uppercase bg-[#1C1917] text-white px-3 py-0.5 rounded-full">
                {activeReportType.name}
              </span>
              <span className="inline-block text-[10px] font-bold tracking-wide uppercase bg-white text-[#C2410C] border border-[#FED7AA] px-2.5 py-0.5 rounded-full">
                Jurisdiction: {jurisdictionConfig.state} ({jurisdictionConfig.cityOrRegion})
              </span>
            </div>
            <h1
              data-testid="report-main-title"
              className="text-lg sm:text-2xl font-black uppercase tracking-tight text-slate-900"
            >
              {activeReportType.title}
            </h1>
            <p
              data-testid="report-main-subtitle"
              className="text-xs text-slate-700 font-semibold mt-1"
            >
              {activeReportType.subtitle}
            </p>
          </div>

          {/* Premise, Client & Jurisdiction Statutory Reference Details (Step 3) */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                1. Inspected Premises &amp; Building Details
              </span>
              <div className="font-black text-sm text-slate-900">{building?.name || 'Registered Premises'}</div>
              <div className="text-slate-700 leading-snug flex items-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                <span>
                  {building?.address || '—'}
                  {building?.city ? `, ${building.city}` : ''}
                  {building?.state ? `, ${building.state}` : ''}
                </span>
              </div>
              <div className="text-[11px] text-slate-600 pt-0.5">
                Occupancy Classification:{' '}
                <strong className="text-slate-900">{building?.occupancyType || 'Not Specified'}</strong>
                {building?.buildingHeight ? (
                  <>
                    {' '}
                    &bull; Height: <strong className="text-slate-900">{building.buildingHeight}</strong>
                  </>
                ) : null}
              </div>
              <div className="text-[11px] text-slate-600">
                District / Local Authority:{' '}
                <strong className="text-slate-900">
                  {building?.localAuthority || jurisdictionConfig.referenceFields.localAuthorityDefault}
                </strong>
              </div>
            </div>

            <div className="space-y-1 sm:border-l sm:border-slate-200 sm:pl-4">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                2. Client Details &amp; Supplied Statutory Reference
              </span>
              <div className="font-bold text-sm text-slate-900">{building?.client?.name || 'Premises Management'}</div>
              <div className="text-slate-700">
                Contact Representative: <strong>{building?.client?.contactPerson || 'Not Specified'}</strong>
              </div>
              {activeJurisdictionCode === 'DELHI' ? (
                <div className="pt-1 border-t border-slate-200 mt-1 text-[11px] space-y-0.5">
                  <div>
                    <span className="text-slate-600">{jurisdictionConfig.referenceFields.numberFieldLabel}:</span>{' '}
                    <strong className="font-mono text-slate-900">
                      {building?.fscNumber || 'Not Supplied by Client'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-600">{jurisdictionConfig.referenceFields.validityDateLabel}:</span>{' '}
                    <strong className="text-slate-900">
                      {building?.fscValidityDate ? formatSafeDate(building.fscValidityDate) : 'Not Supplied'}
                    </strong>
                  </div>
                </div>
              ) : (
                <div className="pt-1 border-t border-slate-200 mt-1 text-[11px] space-y-0.5">
                  <div>
                    <span className="text-slate-600">{jurisdictionConfig.referenceFields.numberFieldLabel}:</span>{' '}
                    <strong className="font-mono text-slate-900">
                      {building?.fireNocNumber || 'Not Supplied by Client'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-600">Issue / Expiry Date (As Supplied):</span>{' '}
                    <strong className="text-slate-900">
                      {building?.fireNocIssueDate ? formatSafeDate(building.fireNocIssueDate) : '—'} /{' '}
                      {building?.fireNocExpiryDate ? formatSafeDate(building.fireNocExpiryDate) : 'Not Supplied'}
                    </strong>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Step 6: Overall Inspection Status & Summary of Actual Inspection Data */}
          <div className="mb-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-600">
                3. Inspection Status &amp; Actual Equipment Summary
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase text-slate-500">Report Status:</span>
                <span
                  data-testid="report-status-badge"
                  className={`px-3 py-0.5 rounded-full text-xs font-black uppercase border ${getReportStatusBadgeStyle(
                    statusBadgeColor
                  )}`}
                >
                  {reportStatus}
                </span>
              </div>
            </div>

            {/* Status Banner (Enforces Zero Asset Rule & Incomplete Inspection Rule) */}
            <div
              data-testid="report-status-banner"
              className={`p-3.5 rounded-xl border mb-3 flex items-start gap-3 ${getReportStatusBadgeStyle(
                statusBadgeColor
              )}`}
            >
              <div className="shrink-0 mt-0.5">
                {statusBadgeColor === 'green' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                ) : statusBadgeColor === 'orange' ? (
                  <Clock className="w-5 h-5 text-amber-700" />
                ) : statusBadgeColor === 'red' ? (
                  <AlertTriangle className="w-5 h-5 text-rose-700" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-slate-600" />
                )}
              </div>
              <div className="text-xs leading-relaxed">
                <div className="font-black uppercase tracking-wide">{reportStatus}</div>
                <p className="mt-0.5 font-medium">{statusBannerMessage}</p>
              </div>
            </div>

            {/* 6-Column Metric Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5 text-center">
              <div className="p-2.5 bg-slate-50 border border-slate-300 rounded-lg">
                <div className="text-[9px] font-bold text-slate-500 uppercase">Registered</div>
                <div className="text-lg font-black text-slate-900 tabular-nums">{totalCount}</div>
                <div className="text-[9px] text-slate-500">Total Assets</div>
              </div>
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="text-[9px] font-bold text-emerald-800 uppercase">Operational</div>
                <div className="text-lg font-black text-emerald-700 tabular-nums">{operationalCount}</div>
                <div className="text-[9px] text-emerald-700">Inspected OK</div>
              </div>
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg">
                <div className="text-[9px] font-bold text-rose-800 uppercase">Non-Operational</div>
                <div className="text-lg font-black text-rose-700 tabular-nums">{nonOperationalCount}</div>
                <div className="text-[9px] text-rose-700">Defective</div>
              </div>
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="text-[9px] font-bold text-amber-800 uppercase">Due Soon</div>
                <div className="text-lg font-black text-amber-700 tabular-nums">{maintenanceDueCount}</div>
                <div className="text-[9px] text-amber-700">&le; 30 Days</div>
              </div>
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg">
                <div className="text-[9px] font-bold text-rose-800 uppercase">Overdue</div>
                <div className="text-lg font-black text-rose-700 tabular-nums">{overdueCount}</div>
                <div className="text-[9px] text-rose-700">Past Due Date</div>
              </div>
              <div className="p-2.5 bg-slate-100 border border-slate-300 rounded-lg">
                <div className="text-[9px] font-bold text-slate-700 uppercase">Not Inspected</div>
                <div className="text-lg font-black text-slate-800 tabular-nums">{notInspectedCount}</div>
                <div className="text-[9px] text-slate-600">
                  {compliancePercentage !== null ? `Readiness: ${compliancePercentage}%` : 'Pending Audit'}
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 & 4: Jurisdiction Legal Framework & Official Sources Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-5 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-[#C2410C]" />
                <span>4. Applicable Jurisdiction Reference Framework ({jurisdictionConfig.label})</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-500">{jurisdictionConfig.department}</span>
            </div>
            <ul className="list-disc list-inside text-[11px] text-slate-700 space-y-0.5">
              {jurisdictionConfig.legalFramework.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <div className="p-2.5 rounded-lg bg-amber-50/80 border border-amber-200 text-[10.5px] text-amber-950 leading-relaxed">
              {jurisdictionConfig.statutoryFormDistinction}
            </div>
            <div className="text-[10px] text-slate-600 flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
              <span className="font-bold text-slate-700">Official Government Reference Portals:</span>
              {jurisdictionConfig.primaryOfficialSources.map((src, idx) => (
                <a
                  key={idx}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#C2410C] underline font-mono"
                >
                  <span>{src.label}</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Field GPS Telemetry & Agency Representative Verification Block */}
          <div className="pt-3 border-t border-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Step 9 Page 4 Rule: Only display GPS Verified when actual coordinates exist */}
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-300 max-w-sm w-full">
              <div className="w-9 h-9 rounded-lg bg-[#1C1917] text-white flex flex-col items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-[10px] text-slate-700 space-y-0.5">
                {data?.latestGpsInspection?.latitude != null && data?.latestGpsInspection?.longitude != null ? (
                  <>
                    <div className="font-black text-emerald-800 uppercase">GPS Coordinates Recorded</div>
                    <p className="font-mono text-slate-800 font-bold">
                      {Number(data.latestGpsInspection.latitude).toFixed(4)}° N,{' '}
                      {Number(data.latestGpsInspection.longitude).toFixed(4)}° E
                    </p>
                    <div className="text-slate-500 text-[9px]">
                      Recorded by: <strong>{data.latestGpsInspection.technicianName || 'Field Service Technician'}</strong>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="font-black text-slate-700 uppercase">GPS Telemetry Not Recorded</div>
                    <p className="text-slate-600">
                      No GPS coordinates were captured for this building’s current inspection cycle.
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Agency Signatory Block */}
            <div className="text-right space-y-0.5 ml-auto" data-testid="report-signatory-block">
              {company?.signatorySignatureUrl && (
                <div className="flex justify-end mb-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={company.signatorySignatureUrl}
                    alt="Authorized Representative Signature"
                    data-testid="report-signatory-signature"
                    className="h-9 w-auto max-w-[150px] object-contain"
                  />
                </div>
              )}
              <div className="font-serif italic text-sm font-bold text-slate-900">{signatoryName}</div>
              <div className="font-bold text-[11px] text-slate-900">
                {company?.signatoryDesignation || 'Authorized Agency Representative'}
              </div>
              <div className="text-[10.5px] text-slate-600">
                For <strong>{company?.name || 'Service Agency'}</strong>
              </div>
              <div className="text-[9.5px] text-slate-500">
                {company?.licenseNumber
                  ? `Submitted Agency License Ref: ${company.licenseNumber} (${company.licenseVerificationLabel})`
                  : 'Private Fire Safety AMC Inspection & Maintenance Record'}
              </div>
            </div>
          </div>
        </div>

        {/* Page 1 Footer */}
        <ReportPageFooter pageNumber={1} />
      </div>

      {/* ========================================================================= */}
      {/* PAGE 2: FIRE SAFETY EQUIPMENT SUMMARY & APPLICABLE STANDARDS (Step 5 & 9)  */}
      {/* ========================================================================= */}
      <div
        data-testid="report-page-2-summary"
        className="max-w-[210mm] mx-auto bg-white shadow-2xl border border-slate-200 rounded-sm sm:p-10 p-6 text-slate-900 print:shadow-none print:border-none print:max-w-none print:p-0 mb-8 print-page-break flex flex-col justify-between min-h-[275mm]"
      >
        <div>
          <div className="border-b-2 border-slate-900 pb-3 mb-5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#C2410C]">Page 2 &bull; Section 01</span>
              <h2 className="text-lg sm:text-xl font-black uppercase text-slate-900">
                Fire Safety Equipment Summary &amp; Applicable Standards
              </h2>
            </div>
            <div className="text-right text-[11px] text-slate-500 font-mono">
              Ref: {report?.reportNumber || 'VAMC-RPT'}
            </div>
          </div>

          {/* Equipment Breakdown Table */}
          <div className="mb-5">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2">
              1. Equipment Operational &amp; Inspection Status Breakdown
            </h3>
            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-800 uppercase text-[10px] font-bold border-b border-slate-300">
                  <tr>
                    <th className="py-2 px-3 border-r border-slate-300">Metric Category</th>
                    <th className="py-2 px-3 border-r border-slate-300 text-center">Count</th>
                    <th className="py-2 px-3 border-r border-slate-300">Status Classification</th>
                    <th className="py-2 px-3">Definition &amp; Verification Basis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="py-2 px-3 font-bold text-slate-900 border-r border-slate-200">Total Registered Equipment</td>
                    <td className="py-2 px-3 text-center font-mono font-bold border-r border-slate-200">{totalCount}</td>
                    <td className="py-2 px-3 border-r border-slate-200">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">Inventory Base</span>
                    </td>
                    <td className="py-2 px-3 text-slate-600 text-[11px]">
                      Total fire protection units registered in the VigilAMC asset register for this premises.
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold text-emerald-800 border-r border-slate-200">Operational Equipment</td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-emerald-700 border-r border-slate-200">
                      {operationalCount}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                        GREEN &bull; Operational
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-600 text-[11px]">
                      Equipment with a documented inspection record, satisfactory condition, and valid service window.
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold text-rose-800 border-r border-slate-200">Non-Operational Equipment</td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-rose-700 border-r border-slate-200">
                      {nonOperationalCount}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-300">
                        RED &bull; Defect / Action Required
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-600 text-[11px]">
                      Equipment with physical damage, low/abnormal pressure, failed inspection, or pending replacement/repair.
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold text-amber-800 border-r border-slate-200">Maintenance Due Equipment</td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-amber-700 border-r border-slate-200">
                      {maintenanceDueCount}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                        ORANGE &bull; Due Soon (&le;30d)
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-600 text-[11px]">
                      Equipment scheduled for periodic maintenance, refill, or testing within the next 30 calendar days.
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold text-rose-800 border-r border-slate-200">Overdue Equipment</td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-rose-700 border-r border-slate-200">
                      {overdueCount}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-300">
                        RED &bull; Overdue
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-600 text-[11px]">
                      Equipment whose scheduled next service or hydro-testing due date has elapsed.
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold text-slate-700 border-r border-slate-200">Not Inspected Equipment</td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-slate-700 border-r border-slate-200">
                      {notInspectedCount}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                        GREY &bull; Not Inspected
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-600 text-[11px]">
                      Registered equipment with no documented field inspection record in the current cycle.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-slate-500 mt-1.5 italic">{compliance?.formulaDescription}</p>
          </div>

          {/* Step 5: Applicable Indian Standards (BIS) Per Registered Equipment Category */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                2. Applicable Indian Standards (BIS) By Registered Equipment Category
              </h3>
              <a
                href="https://standards.bis.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-mono text-[#C2410C] underline"
              >
                Source: https://standards.bis.gov.in/
              </a>
            </div>

            {applicableStandardsDetailed.length === 0 ? (
              <div className="p-3.5 rounded-lg border border-slate-300 bg-slate-50 text-xs text-slate-600">
                No equipment categories are currently registered for this premises. Applicable BIS technical standards
                (such as <strong>IS 2190:2024</strong> for portable/mobile first-aid fire extinguishers) are displayed only
                when matching equipment categories are registered.
              </div>
            ) : (
              <div className="border border-slate-300 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-800 uppercase text-[10px] font-bold border-b border-slate-300">
                    <tr>
                      <th className="py-2 px-3 border-r border-slate-300">Equipment Category</th>
                      <th className="py-2 px-3 border-r border-slate-300">BIS Standard &amp; Revision</th>
                      <th className="py-2 px-3">Verified Scope of Applicability</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {applicableStandardsDetailed.map((std: any, idx: number) => (
                      <tr key={std.categoryCode || idx}>
                        <td className="py-2 px-3 font-bold text-slate-900 border-r border-slate-200 whitespace-nowrap">
                          {std.categoryLabel}
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-[#C2410C] border-r border-slate-200 whitespace-nowrap">
                          <div>{std.standardCode}</div>
                          <div className="text-[9.5px] text-slate-500 font-sans font-normal">{std.revisionOrVersion}</div>
                        </td>
                        <td className="py-2 px-3 text-[11px] text-slate-600 leading-snug">
                          <div className="font-semibold text-slate-800">{std.title}</div>
                          <div>{std.scopeDescription}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Next Service Dates Schedule */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#C2410C]" />
                <span>3. Upcoming &amp; Next Service Due Dates (Top 10 Registered Units)</span>
              </h3>
            </div>

            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold border-b border-slate-300">
                  <tr>
                    <th className="py-2 px-2.5 border-r border-slate-300 text-center">S.No</th>
                    <th className="py-2 px-3 border-r border-slate-300">Equipment ID</th>
                    <th className="py-2 px-3 border-r border-slate-300">Type &amp; Capacity</th>
                    <th className="py-2 px-3 border-r border-slate-300">Floor &amp; Location</th>
                    <th className="py-2 px-3 border-r border-slate-300">Last Service Date</th>
                    <th className="py-2 px-3 border-r border-slate-300">Next Due Date</th>
                    <th className="py-2 px-3 text-center">Inspection Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {nextDueSchedule.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-4 px-3 text-center text-slate-500">
                        No equipment service due dates recorded for this premises.
                      </td>
                    </tr>
                  ) : (
                    nextDueSchedule.map((eq, idx) => (
                      <tr key={eq.id || idx} className="hover:bg-slate-50">
                        <td className="py-2 px-2.5 text-center text-slate-500 border-r border-slate-200">{idx + 1}</td>
                        <td className="py-2 px-3 font-mono font-bold text-slate-900 border-r border-slate-200">
                          {eq.qrCode || '—'}
                        </td>
                        <td className="py-2 px-3 font-semibold text-slate-800 border-r border-slate-200">
                          {eq.type} {eq.capacity ? `(${eq.capacity})` : ''}
                        </td>
                        <td className="py-2 px-3 text-slate-600 border-r border-slate-200">
                          {eq.floor ? `${eq.floor} • ` : ''}
                          {eq.location || '—'}
                        </td>
                        <td className="py-2 px-3 text-slate-600 border-r border-slate-200 whitespace-nowrap">
                          {eq.hasActualInspectionRecord ? formatSafeDate(eq.latestInspectionDate || eq.lastServiceDate) : 'Not Inspected'}
                        </td>
                        <td className="py-2 px-3 font-semibold border-r border-slate-200 whitespace-nowrap">
                          {formatSafeDate(eq.nextDueDate)}
                        </td>
                        <td className="py-2 px-3 text-center whitespace-nowrap">
                          <span
                            className={`text-[9.5px] font-bold px-2 py-0.5 rounded border ${getReportStatusBadgeStyle(
                              eq.badgeColor || 'grey'
                            )}`}
                          >
                            {eq.statusLabel || eq.inspectionStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Page 2 Footer */}
        <ReportPageFooter pageNumber={2} />
      </div>

      {/* ========================================================================= */}
      {/* PAGE 3: EQUIPMENT REGISTER (Step 9 Page 3)                                */}
      {/* ========================================================================= */}
      <div
        data-testid="report-page-3-register"
        className="max-w-[210mm] mx-auto bg-white shadow-2xl border border-slate-200 rounded-sm sm:p-10 p-6 text-slate-900 print:shadow-none print:border-none print:max-w-none print:p-0 mb-8 print-page-break flex flex-col justify-between min-h-[275mm]"
      >
        <div>
          <div className="border-b-2 border-slate-900 pb-3 mb-5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#C2410C]">Page 3 &bull; Section 02</span>
              <h2 className="text-lg sm:text-xl font-black uppercase text-slate-900">
                Fire Safety Equipment Register
              </h2>
            </div>
            <div className="text-right text-[11px] text-slate-500 font-mono">
              Total Registered Units: {equipments.length}
            </div>
          </div>

          <p className="text-xs text-slate-600 mb-4 leading-relaxed">
            Complete register of fire safety equipment logged for <strong>{building?.name || 'this premises'}</strong>,
            recording Equipment ID, Type, Make, Model, Capacity, Serial Number, Floor, Location, Last Service Date, Next Due
            Date, and Actual Inspection Status.
          </p>

          <div className="border border-slate-300 rounded-lg overflow-x-auto mb-6">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-slate-100 text-slate-800 uppercase text-[9.5px] font-bold border-b border-slate-300">
                <tr>
                  <th className="py-2 px-2 border-r border-slate-300 text-center">S.No</th>
                  <th className="py-2 px-2.5 border-r border-slate-300">Equipment ID</th>
                  <th className="py-2 px-2.5 border-r border-slate-300">Type &amp; Capacity</th>
                  <th className="py-2 px-2.5 border-r border-slate-300">Make / Model / Serial No.</th>
                  <th className="py-2 px-2.5 border-r border-slate-300">Floor &amp; Location</th>
                  <th className="py-2 px-2 border-r border-slate-300 whitespace-nowrap">Last Service</th>
                  <th className="py-2 px-2 border-r border-slate-300 whitespace-nowrap">Next Due</th>
                  <th className="py-2 px-2.5 text-center">Actual Inspection Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {equipments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 px-4 text-center text-slate-600 bg-slate-50">
                      <p className="font-bold text-slate-800 text-xs mb-1">INSUFFICIENT DATA — 0 Registered Assets</p>
                      <p className="text-[11px] text-slate-600 max-w-lg mx-auto">{ZERO_ASSET_MESSAGE}</p>
                    </td>
                  </tr>
                ) : (
                  equipments.map((eq: any, index: number) => {
                    const isEven = index % 2 === 0;
                    return (
                      <tr
                        key={eq?.id || index}
                        className={isEven ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/70 hover:bg-slate-100/70'}
                      >
                        <td className="py-2 px-2 text-slate-500 border-r border-slate-200 text-center font-mono">
                          {index + 1}
                        </td>
                        <td className="py-2 px-2.5 font-mono font-bold text-slate-900 border-r border-slate-200 whitespace-nowrap">
                          <div>{eq?.qrCode || '—'}</div>
                          <div className="text-[9px] text-slate-500 font-sans font-normal">{eq?.applicableStandard || ''}</div>
                        </td>
                        <td className="py-2 px-2.5 font-semibold text-slate-800 border-r border-slate-200">
                          <div>{eq?.type || 'Unspecified'}</div>
                          <div className="text-[10px] text-slate-500 font-normal">
                            Capacity: {eq?.capacity || 'Not Specified'}
                          </div>
                        </td>
                        <td className="py-2 px-2.5 text-slate-700 border-r border-slate-200 text-[10px]">
                          <div>
                            <strong>Make:</strong> {eq?.manufacturer || 'Not Specified'}
                          </div>
                          <div>
                            <strong>Model:</strong> {eq?.model || 'Not Specified'}
                          </div>
                          <div className="font-mono text-[9.5px] text-slate-500">
                            S/N: {eq?.serialNumber || 'Not Specified'}
                          </div>
                        </td>
                        <td className="py-2 px-2.5 text-slate-700 border-r border-slate-200">
                          <div className="font-semibold">{eq?.floor || 'Floor Not Specified'}</div>
                          <div className="text-[10px] text-slate-600">{eq?.location || 'Location Not Specified'}</div>
                        </td>
                        <td className="py-2 px-2 text-slate-700 border-r border-slate-200 whitespace-nowrap text-[10px]">
                          {eq?.hasActualInspectionRecord
                            ? formatSafeDate(eq?.latestInspectionDate || eq?.lastServiceDate)
                            : 'Not Inspected'}
                        </td>
                        <td className="py-2 px-2 font-semibold border-r border-slate-200 whitespace-nowrap text-[10px]">
                          {formatSafeDate(eq?.nextDueDate)}
                        </td>
                        <td className="py-2 px-2.5 text-center whitespace-nowrap">
                          <span
                            className={`font-black text-[9.5px] px-2 py-0.5 rounded border inline-block ${getReportStatusBadgeStyle(
                              eq?.badgeColor || 'grey'
                            )}`}
                          >
                            {eq?.statusLabel || eq?.inspectionStatus || 'Not Inspected'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Page 3 Footer */}
        <ReportPageFooter pageNumber={3} />
      </div>

      {/* ========================================================================= */}
      {/* PAGE 4: FIELD INSPECTION EVIDENCE (Step 8 & Step 9 Page 4)                */}
      {/* ========================================================================= */}
      <div
        data-testid="report-page-4-evidence"
        className="max-w-[210mm] mx-auto bg-white shadow-2xl border border-slate-200 rounded-sm sm:p-10 p-6 text-slate-900 print:shadow-none print:border-none print:max-w-none print:p-0 mb-8 print-page-break flex flex-col justify-between min-h-[275mm]"
      >
        <div>
          <div className="border-b-2 border-slate-900 pb-3 mb-5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#C2410C]">Page 4 &bull; Section 03</span>
              <h2 className="text-lg sm:text-xl font-black uppercase text-slate-900">
                Field Inspection Evidence &amp; Technician Verification Records
              </h2>
            </div>
            <div className="text-right text-[11px] text-slate-500 font-mono">
              Recorded Inspections: {inspections.length}
            </div>
          </div>

          <p className="text-xs text-slate-600 mb-4 leading-relaxed">
            Documented field inspection logs showing actual uploaded photographs, capture timestamps, GPS verification status
            (marked GPS Verified strictly when valid coordinates exist), assigned technician details, checklist parameters,
            and field observations.
          </p>

          {inspections.length === 0 ? (
            <div className="p-8 border border-slate-200 rounded-xl bg-slate-50 text-center text-slate-600 text-xs mb-6">
              <Camera className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="font-bold text-slate-800">No Field Inspection Evidence Recorded</p>
              <p className="text-[11px] text-slate-500 mt-1">
                No field inspection records or photographs have been submitted for this premises during the current reporting period.
              </p>
            </div>
          ) : (
            <div className="space-y-4 mb-6">
              {inspections.slice(0, 5).map((insp: any, idx: number) => {
                const inspPhotos =
                  Array.isArray(insp.inspectionPhotos) && insp.inspectionPhotos.length > 0
                    ? insp.inspectionPhotos
                    : insp.photos
                    ? [
                        {
                          photoUrl:
                            typeof insp.photos === 'string' && insp.photos.startsWith('[')
                              ? (() => {
                                  try {
                                    return JSON.parse(insp.photos)[0];
                                  } catch {
                                    return null;
                                  }
                                })()
                              : insp.photos,
                          category: 'EVIDENCE',
                        },
                      ].filter((p) => Boolean(p.photoUrl))
                    : [];

                const hasGPS = Boolean(insp.gpsVerified);

                return (
                  <div
                    key={insp.id || idx}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 print-avoid-break space-y-2.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2.5 py-0.5 rounded border border-slate-300">
                          {insp.equipment?.qrCode ? `Equipment Ref: ${insp.equipment.qrCode}` : `Inspection Log #${idx + 1}`}
                        </span>
                        <span className="text-xs text-slate-700">
                          Technician: <strong>{insp.technicianName || 'Field Service Technician'}</strong>{' '}
                          <span className="text-[10px] text-slate-500">
                            ({insp.technicianDesignation || 'Field Service Technician'}
                            {insp.technicianEmployeeId ? ` • ID: ${insp.technicianEmployeeId}` : ''})
                          </span>
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-600 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatSafeDateTime(insp.date || insp.createdAt)}</span>
                        <span
                          className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded border ${
                            insp.status === 'PASSED'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-rose-50 text-rose-800 border-rose-300'
                          }`}
                        >
                          {insp.status || 'RECORDED'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="flex items-start gap-1.5 text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-[#C2410C] shrink-0 mt-0.5" />
                        {hasGPS ? (
                          <span>
                            <strong className="text-emerald-800">GPS Verified:</strong>{' '}
                            <span className="font-mono">
                              {Number(insp.latitude).toFixed(4)}° N, {Number(insp.longitude).toFixed(4)}° E
                            </span>
                            {insp.gpsAccuracy ? ` (±${insp.gpsAccuracy}m)` : ''}
                          </span>
                        ) : (
                          <span className="text-slate-600">
                            <strong>GPS Status:</strong> Coordinates Not Recorded
                          </span>
                        )}
                      </div>
                      <div className="text-slate-700 sm:text-right">
                        <span>Checklist Summary: </span>
                        <strong className="text-slate-900">
                          Pressure Gauge: {insp.pressureGauge || 'Not Recorded'} &bull; Condition:{' '}
                          {insp.overallCondition || 'Not Recorded'}
                        </strong>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-700 bg-white p-2 rounded border border-slate-200">
                      <strong>Technician Observations:</strong>{' '}
                      {insp.remarks ? insp.remarks : 'No adverse remarks recorded during this inspection.'}
                    </div>

                    {inspPhotos.length > 0 && (
                      <div className="pt-1">
                        <div className="text-[10px] font-bold uppercase text-slate-500 mb-1.5">
                          Uploaded Field Photographs ({inspPhotos.length})
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          {inspPhotos.slice(0, 4).map((ph: any, pIdx: number) => (
                            <div
                              key={ph.id || pIdx}
                              className="rounded-lg border border-slate-300 bg-white p-1 overflow-hidden"
                            >
                              <div className="relative aspect-4/3 bg-slate-100 rounded overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={ph.photoUrl}
                                  alt={ph.caption || 'Inspection Evidence'}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-0 inset-x-0 bg-black/75 text-white text-[8px] font-mono px-1 py-0.5 truncate">
                                  {hasGPS
                                    ? `GPS: ${Number(insp.latitude).toFixed(3)}°N, ${Number(insp.longitude).toFixed(3)}°E`
                                    : 'No GPS Coordinates'}
                                </div>
                              </div>
                              <div className="text-[9px] text-slate-600 pt-1 flex items-center justify-between">
                                <span className="font-semibold uppercase truncate">{ph.category || 'PHOTO'}</span>
                                <span className="text-slate-500 font-mono text-[8px]">
                                  {formatSafeDate(ph.capturedAt || insp.date)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Page 4 Footer */}
        <ReportPageFooter pageNumber={4} />
      </div>

      {/* ========================================================================= */}
      {/* PAGE 5: FINDINGS, CORRECTIVE ACTIONS, SIGNATURES & LEGAL DISCLAIMER       */}
      {/* ========================================================================= */}
      <div
        data-testid="report-page-5-findings"
        className="max-w-[210mm] mx-auto bg-white shadow-2xl border border-slate-200 rounded-sm sm:p-10 p-6 text-slate-900 print:shadow-none print:border-none print:max-w-none print:p-0 mb-8 print-page-break flex flex-col justify-between min-h-[275mm]"
      >
        <div>
          <div className="border-b-2 border-slate-900 pb-3 mb-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#C2410C]">Page 5 &bull; Section 04</span>
              <h2 className="text-lg sm:text-xl font-black uppercase text-slate-900">
                Findings, Corrective Actions, Signatures &amp; Legal Disclaimer
              </h2>
            </div>
            <div className="text-right text-[11px] text-slate-500 font-mono">
              Open Defects: {openFindingsCount} &bull; Resolved: {resolvedFindingsCount}
            </div>
          </div>

          {/* Corrective Actions & Defects Table */}
          <div className="mb-5">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2">
              1. Observed Defects, Severity, Corrective Actions &amp; Target Resolution Status
            </h3>
            <div className="border border-slate-300 rounded-lg overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-800 uppercase text-[10px] font-bold border-b border-slate-300">
                  <tr>
                    <th className="py-2 px-2 border-r border-slate-300 text-center">S.No</th>
                    <th className="py-2 px-2.5 border-r border-slate-300">Equipment Ref</th>
                    <th className="py-2 px-3 border-r border-slate-300">Observed Defect &amp; Recommended Action</th>
                    <th className="py-2 px-2 border-r border-slate-300 text-center">Severity</th>
                    <th className="py-2 px-2.5 border-r border-slate-300">Rectification / Workshop Note</th>
                    <th className="py-2 px-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {totalCount === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-5 px-4 text-center text-slate-600 bg-slate-50">
                        <p className="font-bold text-slate-800 text-xs">INSUFFICIENT DATA — No Equipment Registered</p>
                        <p className="text-[11px] text-slate-600 mt-0.5">{ZERO_ASSET_MESSAGE}</p>
                      </td>
                    </tr>
                  ) : notInspectedCount === totalCount ? (
                    <tr>
                      <td colSpan={6} className="py-5 px-4 text-center text-slate-600 bg-slate-50">
                        <p className="font-bold text-slate-800 text-xs">{INCOMPLETE_INSPECTION_MESSAGE}</p>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          Registered assets have not yet been inspected. Defect status cannot be determined until field inspections are completed.
                        </p>
                      </td>
                    </tr>
                  ) : combinedFindings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-5 px-4 text-center text-slate-600 bg-slate-50">
                        <p className="font-bold text-slate-800 text-xs">
                          No Open Defects Recorded Across Inspected Equipment ({inspectedCount} of {totalCount} Inspected)
                        </p>
                        {notInspectedCount > 0 && (
                          <p className="text-[11px] text-amber-800 font-semibold mt-0.5">
                            Note: {notInspectedCount} registered equipment unit(s) remain uninspected ({INCOMPLETE_INSPECTION_MESSAGE}).
                          </p>
                        )}
                      </td>
                    </tr>
                  ) : (
                    combinedFindings.map((ca: any, idx: number) => {
                      const isClosed = ca.status === 'CLOSED' || ca.status === 'RESOLVED' || ca.status === 'VERIFIED';
                      const isHigh = ca.severity === 'HIGH' || ca.severity === 'CRITICAL';
                      return (
                        <tr key={ca.id || idx} className="bg-white">
                          <td className="py-2 px-2 text-center text-slate-500 border-r border-slate-200 font-mono">
                            {idx + 1}
                          </td>
                          <td className="py-2 px-2.5 font-mono font-bold text-slate-900 border-r border-slate-200 whitespace-nowrap">
                            <div>{ca.assetRef}</div>
                            <div className="text-[9px] text-slate-500 font-normal">
                              Logged: {formatSafeDate(ca.openedAt)} ({calculateAgeDays(ca.openedAt)}d)
                            </div>
                          </td>
                          <td className="py-2 px-3 text-slate-800 border-r border-slate-200">
                            <div className="font-bold text-slate-900">{ca.title}</div>
                            {ca.description && <div className="text-[10.5px] text-slate-600 mt-0.5">{ca.description}</div>}
                          </td>
                          <td className="py-2 px-2 border-r border-slate-200 text-center">
                            <span
                              className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                                isHigh
                                  ? 'bg-rose-50 text-rose-800 border-rose-300'
                                  : 'bg-amber-50 text-amber-800 border-amber-300'
                              }`}
                            >
                              {ca.severity || 'MEDIUM'}
                            </span>
                          </td>
                          <td className="py-2 px-2.5 text-slate-700 border-r border-slate-200 text-[10.5px]">
                            {ca.closeNote ? (
                              <span className="text-emerald-800 font-medium">{ca.closeNote}</span>
                            ) : ca.workshopNote ? (
                              <span>{ca.workshopNote}</span>
                            ) : (
                              <span className="text-slate-500 italic">Rectification action pending</span>
                            )}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <span
                              className={`font-black text-[9px] px-2 py-0.5 rounded border ${
                                isClosed
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : 'bg-rose-50 text-rose-800 border-rose-300'
                              }`}
                            >
                              {ca.status || 'OPEN'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3-Party Signatures Block (Step 9 Page 5: Technician, Agency Representative, Client Acknowledgement) */}
          <div className="mb-5">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2">
              2. Verification &amp; Acknowledgement Signatures
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-slate-300 bg-slate-50 flex flex-col justify-between min-h-[90px]">
                <div className="text-[10px] font-black uppercase text-slate-500">1. Field Service Technician</div>
                <div className="pt-3">
                  <div className="font-bold text-slate-900">
                    {inspections[0]?.technicianName || 'Assigned Field Service Technician'}
                  </div>
                  <div className="text-[10px] text-slate-600">
                    {inspections[0]?.technicianDesignation || 'Field Service Technician'}
                  </div>
                </div>
              </div>

              <div
                className="p-3 rounded-lg border border-slate-300 bg-slate-50 flex flex-col justify-between min-h-[90px]"
                data-testid="report-final-signatory"
              >
                <div className="text-[10px] font-black uppercase text-slate-500">2. Authorized Agency Representative</div>
                {company?.signatorySignatureUrl && (
                  <div className="my-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={company.signatorySignatureUrl}
                      alt="Agency Representative Signature"
                      className="h-8 w-auto max-w-[130px] object-contain"
                    />
                  </div>
                )}
                <div className="pt-1">
                  <div className="font-bold text-slate-900">{signatoryName}</div>
                  <div className="text-[10px] text-slate-600">
                    {company?.signatoryDesignation || 'Authorized Agency Representative'} &bull; {company?.name}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-slate-300 bg-slate-50 flex flex-col justify-between min-h-[90px]">
                <div className="text-[10px] font-black uppercase text-slate-500">
                  3. Client / Facility Representative Acknowledgement
                </div>
                <div className="pt-3">
                  <div className="font-bold text-slate-900">
                    {inspections[0]?.customerName || building?.client?.contactPerson || 'Premises Representative'}
                  </div>
                  <div className="text-[10px] text-slate-600">
                    For {building?.client?.name || building?.name || 'Client Premises'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 10: PERMANENT LEGAL DISCLAIMER (Verbatim 6-Paragraph Box) */}
          <div
            data-testid="report-legal-disclaimer"
            className="p-4 rounded-xl border-2 border-slate-800 bg-slate-50 text-[10.5px] text-slate-800 space-y-1.5 leading-relaxed"
          >
            <div className="font-black text-xs uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-1">
              IMPORTANT LEGAL &amp; COMPLIANCE DISCLAIMER
            </div>
            {disclaimerParagraphs.map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>
        </div>

        {/* Page 5 Footer */}
        <ReportPageFooter pageNumber={5} />
      </div>

      {emailModalOpen && building && (
        <EmailReportModal
          isOpen={emailModalOpen}
          onClose={() => setEmailModalOpen(false)}
          buildingId={building.id}
          buildingName={building.name}
          clientEmail={clientEmail || building.client?.email || null}
          clientName={building.client?.name || null}
          onSuccess={() => {
            showToast('Form B Report PDF successfully emailed to client!');
          }}
        />
      )}
    </div>
  );
}
