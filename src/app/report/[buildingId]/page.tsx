'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import EmberLine from '@/components/home/EmberLine';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  calendarDayDiff,
  fromDbDate,
  todayCalendarDateString,
  toDateInputString,
  dueChip,
  tallyDueChips,
} from '@/lib/dates';
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
  X,
  Flame,
  Award,
} from 'lucide-react';
import { SITE_CONFIG } from '@/lib/siteConfig';
import { EmailReportModal } from '@/components/admin/EmailReportModal';
import {
  REPORT_TYPES,
  ReportTypeCode,
  JURISDICTIONS,
  JurisdictionCode,
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
  const [clipboardFallbackUrl, setClipboardFallbackUrl] = useState<string | null>(null);
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
          json.building?.fscValidityDate ? toDateInputString(json.building.fscValidityDate) : ''
        );
        setFireNocNumber(json.building?.fireNocNumber || '');
        setFireNocIssueDate(
          json.building?.fireNocIssueDate ? toDateInputString(json.building.fireNocIssueDate) : ''
        );
        setFireNocExpiryDate(
          json.building?.fireNocExpiryDate ? toDateInputString(json.building.fireNocExpiryDate) : ''
        );

        if (typeof document !== 'undefined' && json.building?.name) {
          const refNum = json.report?.reportNumber || 'VAMC-RPT';
          const titleName = json.reportMetadata?.reportTypeName || 'Form-B Fire Equipment Report';
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
      const titleName = data?.reportMetadata?.reportTypeName || 'Form-B Fire Equipment Report';
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

  // G2: Clipboard writeText with fallback selectable popover
  const handleCopyClientLink = async () => {
    const url = getReportUrl();
    try {
      if (!navigator?.clipboard?.writeText) {
        throw new Error('Clipboard API unavailable');
      }
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      showToast('Inspection report link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      setClipboardFallbackUrl(url);
      showToast('Clipboard access restricted — please copy the selected link in the dialog', 'error');
    }
  };

  const handleSendWhatsApp = () => {
    const url = getReportUrl();
    const bldgName = data?.building?.name || 'Client Facility';
    const agencyName = data?.company?.name || 'Fire Safety Service Agency';
    const reportTitle = data?.reportMetadata?.reportTypeName || 'Form-B Fire Safety Inspection Report';
    const totalCount = data?.summary?.total ?? 0;

    const message = [
      `*${reportTitle} — ${bldgName}*`,
      ``,
      `• *Servicing Agency:* ${agencyName}`,
      `• *Report Reference:* ${data?.report?.reportNumber || 'VAMC-RPT'}`,
      `• *Assets Audited:* ${totalCount}`,
      ``,
      `View & download the Form-B inspection and maintenance report:`,
      url,
    ].join('\n');

    const formattedPhone = normalizeWhatsAppPhone(clientPhone);
    const waUrl = formattedPhone
      ? `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;

    window.open(waUrl, '_blank', 'noopener,noreferrer');
    showToast('Opening WhatsApp with report summary...');
  };

  const handleSendEmail = async () => {
    const url = getReportUrl();
    const bldgName = data?.building?.name || 'Client Facility';
    const agencyName = data?.company?.name || 'Fire Safety Service Agency';
    const reportTitle = data?.reportMetadata?.reportTypeName || 'Form-B Fire Safety Inspection Report';

    const subject = `${reportTitle} — ${bldgName} (${data?.report?.reportNumber || 'VAMC-RPT'})`;
    const body = [
      `Dear ${data?.building?.client?.contactPerson || data?.building?.client?.name || 'Facility Manager'},`,
      ``,
      `Please find below the ${reportTitle} for ${bldgName}.`,
      ``,
      `Facility: ${bldgName} (${data?.building?.address || ''})`,
      `Servicing Agency: ${agencyName}`,
      `Report Reference ID: ${data?.report?.reportNumber || 'VAMC-RPT'}`,
      ``,
      `Click below to view and print the Form-B report:`,
      url,
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
  const equipments = Array.isArray(building?.equipments) ? building.equipments : [];
  const inspections = Array.isArray(building?.inspections) ? building.inspections : [];
  const defects = Array.isArray(building?.defects) ? building.defects : [];

  const activeJurisdictionCode: JurisdictionCode =
    (reportMetadata?.jurisdictionCode as JurisdictionCode) || 'GENERAL';
  const jurisdictionConfig = JURISDICTIONS[activeJurisdictionCode] || JURISDICTIONS.GENERAL;
  const activeReportType =
    REPORT_TYPES[(reportMetadata?.reportType as ReportTypeCode) || selectedReportType] ||
    REPORT_TYPES.FIRE_SAFETY_INSPECTION_REPORT;

  // Single live source of truth for due math across the report: dueChip / tallyDueChips
  const dueSummary = useMemo(() => {
    return tallyDueChips(equipments);
  }, [equipments]);

  // Overall status classification derived from live due counts
  const overallVerdict = useMemo(() => {
    if (dueSummary.total === 0) return { label: 'INSUFFICIENT DATA', color: 'grey', desc: 'No equipment registered' };
    if (dueSummary.expired > 0) {
      return {
        label: 'ATTENTION REQUIRED',
        color: 'red',
        desc: `${dueSummary.expired} equipment item(s) are overdue / expired for service`,
      };
    }
    if (dueSummary.dueSoon > 0) {
      return {
        label: 'SERVICE DUE SOON',
        color: 'orange',
        desc: `${dueSummary.dueSoon} equipment item(s) due for servicing within 30 days`,
      };
    }
    return {
      label: 'COMPLIANT & ACTIVE',
      color: 'green',
      desc: 'All registered equipment units have valid inspections and active service cycles',
    };
  }, [dueSummary]);

  const reportDateFormatted = formatSafeDate(reportMetadata?.generatedAt || report?.generatedAt || new Date());
  const auditCycleDisplay = reportMetadata?.reportingPeriod || report?.cyclePeriod || building?.complianceCycle || 'Half-Yearly';

  const signatoryName =
    data?.signatoryName || company?.signatoryName || company?.contactPerson || 'Authorized Agency Representative';

  // Gather labeled photo evidence across recent inspections
  const photoEvidence = useMemo(() => {
    const list: Array<{ photoUrl: string; assetTag: string; location: string; timestamp: string; gpsVerified: boolean }> = [];
    for (const insp of inspections) {
      if (Array.isArray(insp.inspectionPhotos)) {
        for (const p of insp.inspectionPhotos) {
          if (p.photoUrl && list.length < 12) {
            list.push({
              photoUrl: p.photoUrl,
              assetTag: insp.equipment?.qrCode || 'Asset',
              location: insp.equipment?.location || insp.location || 'Premises',
              timestamp: formatSafeDateTime(p.createdAt || insp.date),
              gpsVerified: Boolean(insp.latitude && insp.longitude),
            });
          }
        }
      }
    }
    return list;
  }, [inspections]);

  const hasPhotoAppendix = photoEvidence.length > 0;
  const totalContentPages = hasPhotoAppendix ? 4 : 3;

  // Common footer component across all pages (displays company.reportFooterText)
  const ReportPageFooter = ({ pageNumber }: { pageNumber: number }) => (
    <div className="report-footer mt-auto pt-3 border-t border-[#FED7AA] text-[10px] text-slate-600 space-y-1">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[10px] font-semibold text-slate-800">
        <span className="text-[#C2410C] font-bold">
          {company?.reportFooterText || 'VigilAMC Fire Compliance & Safety System — Certified AMC Record'}
        </span>
        <span className="font-mono text-slate-900 bg-[#FFF0E6] px-2 py-0.5 rounded border border-[#FED7AA]">
          Page {pageNumber} of {totalContentPages}
        </span>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[9px] text-slate-500">
        <div>
          Facility: <strong className="text-slate-800">{building?.name}</strong> &bull; Ref:{' '}
          <strong className="text-slate-800 font-mono">{report?.reportNumber || 'VAMC-RPT'}</strong> &bull; Period:{' '}
          {auditCycleDisplay} &bull; Date: {reportDateFormatted}
        </div>
        <div className="font-mono">
          Verification URL: <span className="text-[#C2410C] underline">{getVerifyUrl()}</span>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="bg-[#FFF8F2] min-h-screen py-10 px-4 flex items-center justify-center">
        <div className="bg-white border border-[#FED7AA] rounded-2xl shadow-lg p-8 max-w-md w-full flex flex-col items-center gap-3 text-slate-700 text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-[#C2410C]" />
          <p className="text-sm font-bold text-slate-900">
            Generating Form-B Fire Safety Inspection Report...
          </p>
          <p className="text-xs text-slate-500">
            Evaluating registered fire fighting equipment, service cycles, and technician audits
          </p>
        </div>
      </div>
    );
  }

  if (error || !data || !data.building || !data.summary) {
    return (
      <div className="bg-[#FFF8F2] min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-[#FED7AA] rounded-2xl p-6 text-center space-y-4 shadow-xl text-slate-900">
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
          {/* Left: Back + Selectors */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleCloseOrBack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

            {/* Jurisdiction Selector */}
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

            {/* Report Type Selector */}
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
              <span>Print / Save PDF (Form-B)</span>
            </button>
          </div>
        </div>

        {/* Inline Jurisdiction & FSC / Fire NOC Reference Editor */}
        {showJurisdictionEditor && (
          <div className="pt-3 border-t border-[#FED7AA] bg-white/95 rounded-lg p-3 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div className="font-bold text-slate-900">
                Premises Occupancy &amp; Client-Supplied Statutory Reference ({jurisdictionConfig.label})
              </div>
              <span className="text-[10px] text-slate-500">
                Optional reference details — displayed as client-supplied premises context.
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
                  placeholder="e.g. Commercial / Residential / Industrial"
                  className="w-full px-2.5 py-1.5 rounded border border-[#FED7AA] text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">
                  Building Height (Metres)
                </label>
                <input
                  type="text"
                  value={buildingHeight}
                  onChange={(e) => setBuildingHeight(e.target.value)}
                  placeholder="e.g. 24.5m"
                  className="w-full px-2.5 py-1.5 rounded border border-[#FED7AA] text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">
                  Local Municipal Authority
                </label>
                <input
                  type="text"
                  value={localAuthority}
                  onChange={(e) => setLocalAuthority(e.target.value)}
                  placeholder="e.g. Municipal Corporation"
                  className="w-full px-2.5 py-1.5 rounded border border-[#FED7AA] text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">
                  Fire Safety Certificate (FSC) Ref
                </label>
                <input
                  type="text"
                  value={fscNumber}
                  onChange={(e) => setFscNumber(e.target.value)}
                  placeholder="Client-supplied FSC number"
                  className="w-full px-2.5 py-1.5 rounded border border-[#FED7AA] text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">
                  FSC Validity Date
                </label>
                <input
                  type="date"
                  value={fscValidityDate}
                  onChange={(e) => setFscValidityDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-[#FED7AA] text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">
                  Fire NOC Number
                </label>
                <input
                  type="text"
                  value={fireNocNumber}
                  onChange={(e) => setFireNocNumber(e.target.value)}
                  placeholder="Client-supplied Fire NOC number"
                  className="w-full px-2.5 py-1.5 rounded border border-[#FED7AA] text-xs"
                />
              </div>
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
          <div className="pt-3 border-t border-[#FED7AA] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
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
      {/* PAGE 1: HEADER + STATUS-AT-A-GLANCE (Clean, Simplified, FIRE Brand)        */}
      {/* ========================================================================= */}
      <div
        data-testid="report-page-1-cover"
        className="max-w-[210mm] mx-auto bg-white shadow-2xl border border-[#FED7AA] rounded-sm sm:p-10 p-6 text-slate-900 print:shadow-none print:border-none print:max-w-none print:p-0 mb-8 flex flex-col justify-between min-h-[275mm]"
      >
        <div>
          {/* Servicing Agency Header */}
          <div className="border-b-2 border-[#1C1917] pb-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                {company?.brandLogoUrl && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={company.brandLogoUrl}
                    alt={company?.name || 'Agency Logo'}
                    data-testid="report-brand-logo"
                    className="h-16 w-auto max-w-[150px] object-contain rounded-lg border border-[#FED7AA] p-1.5 bg-white shrink-0"
                  />
                )}
                <div>
                  <div className="text-xl sm:text-2xl font-black tracking-tight text-[#1C1917] uppercase">
                    {company?.name || 'Fire Protection AMC Agency'}
                  </div>
                  <div className="text-xs font-semibold text-[#44403C] mt-0.5 flex flex-wrap items-center gap-1.5">
                    <span>Fire Safety Equipment Inspection &amp; Maintenance Agency</span>
                    {company?.licenseNumber && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFF0E6] text-[#9A3412] border border-[#FED7AA]">
                        License Ref: {company.licenseNumber}
                      </span>
                    )}
                    {company?.gstin && (
                      <span className="font-mono text-[10px] text-slate-600">&bull; GSTIN: {company.gstin}</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 max-w-lg leading-relaxed">
                    {company?.address || 'Service Headquarters'} &bull; Tel: {company?.phone || '—'} &bull; Email:{' '}
                    {company?.email || '—'}
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <span className="font-mono text-xs font-black text-[#1C1917] bg-[#FFF0E6] px-3 py-1 rounded-lg border border-[#FED7AA] block sm:inline-block">
                  Ref: {report?.reportNumber || 'VAMC-RPT'}
                </span>
                <div className="text-xs text-slate-600 mt-1 font-medium">
                  Report Date: <strong className="text-[#1C1917]">{reportDateFormatted}</strong>
                </div>
                <div className="text-xs text-slate-600 font-medium">
                  Reporting Period: <strong className="text-[#1C1917]">{auditCycleDisplay}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Document Title Banner */}
          <div className="text-center py-4 px-4 bg-[#FFF8F2] border border-[#FED7AA] rounded-2xl mb-6">
            <div className="flex items-center justify-center gap-2 flex-wrap mb-1.5">
              <span className="inline-block text-[10px] font-black tracking-wider uppercase bg-[#1C1917] text-white px-3 py-0.5 rounded-full">
                FORM-B
              </span>
              <span className="inline-block text-[10px] font-bold tracking-wide uppercase bg-white text-[#C2410C] border border-[#FED7AA] px-2.5 py-0.5 rounded-full">
                {jurisdictionConfig.label}
              </span>
            </div>
            <h1
              data-testid="report-main-title"
              className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#1C1917]"
            >
              {activeReportType.title}
            </h1>
            <p
              data-testid="report-main-subtitle"
              className="text-xs text-[#44403C] font-semibold mt-1"
            >
              {activeReportType.subtitle}
            </p>
          </div>

          {/* Inspected Facility & Client Context */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-[#FFF8F2] border border-[#FED7AA] rounded-2xl p-4 space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 text-[10px] font-black text-[#C2410C] uppercase tracking-wider">
                <Building2 className="w-3.5 h-3.5" />
                <span>Inspected Facility</span>
              </div>
              <div className="text-sm font-extrabold text-[#1C1917]">{building?.name}</div>
              <div className="text-slate-600 flex items-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  {building?.address || '—'}
                  {building?.city ? `, ${building.city}` : ''}
                  {building?.state ? `, ${building.state}` : ''}
                </span>
              </div>
              {occupancyType && (
                <div className="text-[11px] text-slate-500 pt-0.5">
                  Occupancy: <strong>{occupancyType}</strong>
                  {buildingHeight ? ` &bull; Height: ${buildingHeight}` : ''}
                </div>
              )}
            </div>

            <div className="bg-[#FFF8F2] border border-[#FED7AA] rounded-2xl p-4 space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 text-[10px] font-black text-[#C2410C] uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Client &amp; Statutory References</span>
              </div>
              <div className="text-sm font-extrabold text-[#1C1917]">
                {building?.client?.name || 'Facility Management Group'}
              </div>
              <div className="text-slate-600">
                SPOC: {building?.client?.contactPerson || 'Facility Manager'}
                {building?.client?.phone ? ` &bull; ${building.client.phone}` : ''}
              </div>
              <div className="text-[11px] text-slate-500 pt-0.5 flex flex-wrap gap-2">
                {fscNumber && <span>FSC Ref: <strong>{fscNumber}</strong></span>}
                {fireNocNumber && <span>Fire NOC: <strong>{fireNocNumber}</strong></span>}
              </div>
            </div>
          </div>

          {/* STATUS-AT-A-GLANCE (Big Compliance Summary with colored chips) */}
          <div className="mb-6 p-5 rounded-2xl border-2 border-[#FED7AA] bg-gradient-to-br from-[#FFF8F2] to-white space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#FED7AA] pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#C2410C] block">
                  Status at a Glance
                </span>
                <h3 className="text-base font-black text-[#1C1917]">
                  Equipment Compliance &amp; Service Readiness Summary
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-xl text-xs font-black uppercase border ${
                    overallVerdict.color === 'green'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : overallVerdict.color === 'orange'
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-rose-50 text-rose-800 border-rose-300'
                  }`}
                >
                  {overallVerdict.label}
                </span>
              </div>
            </div>

            {/* 3 Prominent Live Countdown Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wide block">
                    Active &amp; In-Date
                  </span>
                  <span className="text-2xl font-black text-emerald-800 font-mono">
                    {dueSummary.ok}
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-200/60 text-emerald-900 font-bold text-xs">
                  {dueSummary.ok} OK
                </span>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wide block">
                    Due Within 30 Days
                  </span>
                  <span className="text-2xl font-black text-amber-800 font-mono">
                    {dueSummary.dueSoon}
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-amber-200/60 text-amber-900 font-bold text-xs">
                  {dueSummary.dueSoon} Due Soon
                </span>
              </div>

              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-rose-900 uppercase tracking-wide block">
                    Service Overdue / Expired
                  </span>
                  <span className="text-2xl font-black text-rose-800 font-mono">
                    {dueSummary.expired}
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-rose-200/60 text-rose-900 font-bold text-xs">
                  {dueSummary.expired} Overdue
                </span>
              </div>
            </div>

            <div className="text-xs text-[#44403C] leading-relaxed pt-1">
              <strong>Audit Evaluation:</strong> {overallVerdict.desc}. Evaluated against live calendar service intervals across all {dueSummary.total} registered fire protection items.
            </div>
          </div>

          {/* Certificate Footer Save / Preview Line */}
          <div className="p-3.5 rounded-xl bg-[#FFF8F2] border border-[#FED7AA] flex items-center justify-between text-xs text-[#1C1917]">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#C2410C] shrink-0" />
              <span className="font-semibold text-[#44403C]">Authorized Agency Accreditation:</span>
              <span className="font-bold text-[#1C1917]">
                {company?.reportFooterText || 'VigilAMC Fire Compliance & Safety System — Certified AMC Record'}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Verified Digital Sign-Off</span>
          </div>
        </div>

        {/* Page 1 Footer */}
        <ReportPageFooter pageNumber={1} />
      </div>

      {/* ========================================================================= */}
      {/* PAGE 2: FINDINGS TABLE (One Clean Row Per Asset — No Dense Paragraphs)    */}
      {/* ========================================================================= */}
      <div
        data-testid="report-page-2-summary"
        className="max-w-[210mm] mx-auto bg-white shadow-2xl border border-[#FED7AA] rounded-sm sm:p-10 p-6 text-slate-900 print:shadow-none print:border-none print:max-w-none print:p-0 mb-8 print-page-break flex flex-col justify-between min-h-[275mm]"
      >
        <div>
          {/* Header */}
          <div className="border-b-2 border-[#1C1917] pb-3 mb-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#C2410C]">Page 2 &bull; Section 01</span>
              <h2 className="text-lg sm:text-xl font-black uppercase text-[#1C1917]">
                Fire Equipment Register &amp; Findings
              </h2>
            </div>
            <div className="text-right text-xs text-slate-500 font-mono">
              Total Assets: {dueSummary.total}
            </div>
          </div>

          <p className="text-xs text-[#44403C] mb-4 leading-relaxed">
            Detailed asset register and service findings for <strong>{building?.name || 'this premises'}</strong>.
            Status countdowns are computed LIVE against current calendar due dates.
          </p>

          {/* Clean Findings Table (No QR codes, no hydro-test row, no dense paragraphs) */}
          <div className="border border-[#FED7AA] rounded-xl overflow-hidden mb-4">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFF8F2] text-[#1C1917] uppercase text-[10px] font-bold border-b border-[#FED7AA]">
                <tr>
                  <th className="py-2.5 px-3 border-r border-[#FED7AA] text-center w-10">#</th>
                  <th className="py-2.5 px-3 border-r border-[#FED7AA]">Asset Tag</th>
                  <th className="py-2.5 px-3 border-r border-[#FED7AA]">Type &amp; Spec</th>
                  <th className="py-2.5 px-3 border-r border-[#FED7AA]">Location / Floor</th>
                  <th className="py-2.5 px-2.5 border-r border-[#FED7AA] text-center">Cycle</th>
                  <th className="py-2.5 px-3 border-r border-[#FED7AA] whitespace-nowrap">Last Service</th>
                  <th className="py-2.5 px-3 border-r border-[#FED7AA] whitespace-nowrap">Next Due</th>
                  <th className="py-2.5 px-3 text-right">Status Chip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {equipments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 px-4 text-center text-slate-500 bg-[#FFF8F2]">
                      <p className="font-bold text-slate-800 text-xs mb-1">No equipment registered yet</p>
                      <p className="text-[11px] text-slate-500">{ZERO_ASSET_MESSAGE}</p>
                    </td>
                  </tr>
                ) : (
                  equipments.map((eq: any, idx: number) => {
                    const chip = dueChip(eq.nextDueDate);
                    const isEven = idx % 2 === 0;

                    return (
                      <tr
                        key={eq.id || idx}
                        className={isEven ? 'bg-white' : 'bg-[#FFF8F2]/40'}
                      >
                        <td className="py-2 px-3 text-center text-slate-400 font-mono text-[11px] border-r border-slate-100">
                          {idx + 1}
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-[#1C1917] border-r border-slate-100 whitespace-nowrap">
                          {eq.qrCode || `EQ-${idx + 1}`}
                        </td>
                        <td className="py-2 px-3 text-[#1C1917] border-r border-slate-100">
                          <div className="font-semibold">{eq.type || 'Fire Extinguisher'}</div>
                          {eq.capacity && <div className="text-[10px] text-slate-500">{eq.capacity}</div>}
                        </td>
                        <td className="py-2 px-3 text-[#44403C] border-r border-slate-100">
                          {eq.location || 'Premises'}
                        </td>
                        <td className="py-2 px-2.5 text-center font-mono font-semibold text-slate-700 border-r border-slate-100">
                          {eq.serviceIntervalMonths || 12}M
                        </td>
                        <td className="py-2 px-3 text-slate-600 border-r border-slate-100 whitespace-nowrap text-[11px]">
                          {formatSafeDate(eq.lastServiceDate)}
                        </td>
                        <td className="py-2 px-3 text-slate-600 border-r border-slate-100 whitespace-nowrap text-[11px]">
                          {formatSafeDate(eq.nextDueDate)}
                        </td>
                        <td className="py-2 px-3 text-right whitespace-nowrap">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              chip.state === 'EXPIRED'
                                ? 'bg-rose-50 text-[#DC2626] border-rose-200'
                                : chip.state === 'DUE_SOON'
                                ? 'bg-amber-50 text-[#D97706] border-amber-200'
                                : 'bg-emerald-50 text-[#059669] border-emerald-200'
                            }`}
                          >
                            {chip.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Summary Strip */}
          <div className="p-3 bg-[#FFF8F2] border border-[#FED7AA] rounded-xl flex items-center justify-between text-xs text-[#44403C]">
            <div>
              <strong>Inventory Totals:</strong> {dueSummary.ok} OK &bull; {dueSummary.dueSoon} Due Soon &bull; {dueSummary.expired} Overdue
            </div>
            <div className="font-mono text-[11px] text-slate-500">
              Live dueChip Sync: Verified
            </div>
          </div>
        </div>

        {/* Page 2 Footer */}
        <ReportPageFooter pageNumber={2} />
      </div>

      {/* ========================================================================= */}
      {/* PAGE 3: ACTIONS, STATUTORY NOTICE & SIGN-OFF                              */}
      {/* ========================================================================= */}
      <div
        data-testid="report-page-3-register"
        className="max-w-[210mm] mx-auto bg-white shadow-2xl border border-[#FED7AA] rounded-sm sm:p-10 p-6 text-slate-900 print:shadow-none print:border-none print:max-w-none print:p-0 mb-8 print-page-break flex flex-col justify-between min-h-[275mm]"
      >
        <div>
          {/* Header */}
          <div className="border-b-2 border-[#1C1917] pb-3 mb-5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#C2410C]">Page 3 &bull; Section 02</span>
              <h2 className="text-lg sm:text-xl font-black uppercase text-[#1C1917]">
                Required Actions &amp; Regulatory Sign-off
              </h2>
            </div>
            <div className="text-right text-xs text-slate-500 font-mono">
              Ref: {report?.reportNumber || 'VAMC-RPT'}
            </div>
          </div>

          {/* Section 1: Required Actions (Short Bullets) */}
          <div className="mb-6 space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#1C1917] flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-[#C2410C]" />
              <span>Recommended AMC Service Actions</span>
            </h3>
            <div className="p-4 rounded-xl bg-[#FFF8F2] border border-[#FED7AA] space-y-2 text-xs text-[#1C1917]">
              <ul className="space-y-1.5 list-disc list-inside">
                {dueSummary.expired > 0 ? (
                  <li className="font-bold text-[#DC2626]">
                    Immediate priority: Schedule overhaul, pressure test, or cylinder refill for {dueSummary.expired} overdue equipment unit(s).
                  </li>
                ) : null}
                {dueSummary.dueSoon > 0 ? (
                  <li className="font-semibold text-[#D97706]">
                    Upcoming routine service: Plan preventive inspection for {dueSummary.dueSoon} equipment item(s) due within 30 days.
                  </li>
                ) : null}
                {defects.length > 0 ? (
                  <li className="font-semibold text-[#9A3412]">
                    Remediate {defects.length} physical defect(s) logged during field inspection visits.
                  </li>
                ) : null}
                {dueSummary.expired === 0 && dueSummary.dueSoon === 0 && defects.length === 0 ? (
                  <li className="font-semibold text-[#059669]">
                    All registered fire equipment units are currently within valid service intervals and fully operational.
                  </li>
                ) : null}
                <li>
                  Maintain uninhibited access and unobstructed clearance around all fire points, hose reels, and alarm panels.
                </li>
                <li>
                  Ensure tamper seals and pressure gauges remain intact between scheduled inspection cycles.
                </li>
              </ul>
            </div>
          </div>

          {/* Section 2: Statutory Notice (Kept Statutory Block - house rule) */}
          <div className="mb-6 p-4 rounded-xl border border-[#FED7AA] bg-white text-xs text-[#44403C] space-y-1.5">
            <div className="font-black text-[10px] uppercase tracking-wider text-[#C2410C]">
              [Statutory Compliance Notice: Required by Municipal Fire Safety Rules]
            </div>
            <p className="leading-relaxed text-[11px]">
              This report constitutes a documented equipment inspection and maintenance record maintained by an authorized fire protection servicing agency under applicable state and municipal fire prevention regulations. It reflects physical presence, operating pressure, and maintenance status as verified during the documented inspection period.
            </p>
          </div>

          {/* Section 3: 3-Party Sign-Off Block */}
          <div className="mb-6 space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#1C1917]">
              Inspection Verification &amp; Authorization Signatures
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {/* Field Technician */}
              <div className="p-3.5 rounded-xl border border-[#FED7AA] bg-[#FFF8F2] flex flex-col justify-between min-h-[110px]">
                <div className="text-[10px] font-black uppercase text-[#C2410C]">
                  1. Field Service Technician
                </div>
                <div className="pt-2">
                  <div className="font-bold text-[#1C1917]">
                    {inspections[0]?.technicianName || 'Assigned Field Technician'}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {inspections[0]?.technicianDesignation || 'Fire Safety Technician'}
                  </div>
                  <div className="text-[9px] text-slate-400 mt-1">
                    Inspected: {reportDateFormatted}
                  </div>
                </div>
              </div>

              {/* Agency Signatory */}
              <div
                className="p-3.5 rounded-xl border border-[#FED7AA] bg-[#FFF8F2] flex flex-col justify-between min-h-[110px]"
                data-testid="report-final-signatory"
              >
                <div className="text-[10px] font-black uppercase text-[#C2410C]">
                  2. Authorized Auditor / Signatory
                </div>
                {company?.signatorySignatureUrl && (
                  <div className="my-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={company.signatorySignatureUrl}
                      alt="Agency Representative Signature"
                      className="h-9 w-auto max-w-[130px] object-contain"
                    />
                  </div>
                )}
                <div className="pt-1">
                  <div className="font-bold text-[#1C1917]">{signatoryName}</div>
                  <div className="text-[10px] text-slate-500">
                    {company?.signatoryDesignation || 'Authorized Auditor'} &bull; {company?.name}
                  </div>
                  <div className="text-[9px] text-slate-400 mt-1">
                    Certified: {reportDateFormatted}
                  </div>
                </div>
              </div>

              {/* Client Representative */}
              <div className="p-3.5 rounded-xl border border-[#FED7AA] bg-[#FFF8F2] flex flex-col justify-between min-h-[110px]">
                <div className="text-[10px] font-black uppercase text-[#C2410C]">
                  3. Premises Representative
                </div>
                <div className="pt-2">
                  <div className="font-bold text-[#1C1917]">
                    {building?.client?.contactPerson || 'Facility Manager'}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    For {building?.client?.name || building?.name}
                  </div>
                  <div className="text-[9px] text-slate-400 mt-1">
                    Acknowledged On Site
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page 3 Footer */}
        <ReportPageFooter pageNumber={3} />
      </div>

      {/* ========================================================================= */}
      {/* APPENDIX: PHOTO EVIDENCE (Only if photos exist)                          */}
      {/* ========================================================================= */}
      {hasPhotoAppendix && (
        <div
          data-testid="report-page-4-evidence"
          className="max-w-[210mm] mx-auto bg-white shadow-2xl border border-[#FED7AA] rounded-sm sm:p-10 p-6 text-slate-900 print:shadow-none print:border-none print:max-w-none print:p-0 mb-8 print-page-break flex flex-col justify-between min-h-[275mm]"
        >
          <div>
            <div className="border-b-2 border-[#1C1917] pb-3 mb-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#C2410C]">
                  Appendix &bull; Photographic Proof
                </span>
                <h2 className="text-lg sm:text-xl font-black uppercase text-[#1C1917]">
                  Field Inspection Photo Evidence
                </h2>
              </div>
              <div className="text-right text-xs text-slate-500 font-mono">
                {photoEvidence.length} Photographs Documented
              </div>
            </div>

            <p className="text-xs text-[#44403C] mb-4 leading-relaxed">
              Photographs captured on site by assigned technicians during field servicing visits for <strong>{building?.name}</strong>.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              {photoEvidence.map((item, pIdx) => (
                <div
                  key={pIdx}
                  className="rounded-xl border border-[#FED7AA] overflow-hidden bg-[#FFF8F2] flex flex-col justify-between text-xs"
                >
                  <div className="aspect-video bg-slate-100 relative overflow-hidden flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.photoUrl}
                      alt={`Evidence for ${item.assetTag}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-2.5 space-y-1">
                    <div className="font-mono font-bold text-[#1C1917] text-[11px]">
                      {item.assetTag}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate" title={item.location}>
                      {item.location}
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-slate-400 pt-0.5">
                      <span>{item.timestamp}</span>
                      {item.gpsVerified && (
                        <span className="text-[#059669] font-bold">GPS Verified</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <ReportPageFooter pageNumber={4} />
        </div>
      )}

      {/* G2: Clipboard Fallback Modal (Popover) */}
      {clipboardFallbackUrl && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-2xl border border-[#FED7AA] p-5 max-w-md w-full shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#1C1917] flex items-center gap-2">
                <Copy className="w-4 h-4 text-[#C2410C]" />
                <span>Copy Inspection Report Link</span>
              </h3>
              <button
                onClick={() => setClipboardFallbackUrl(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-[#FFF0E6]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Direct clipboard write is restricted by your browser in this view. The link below is selected — press <strong>Ctrl+C</strong> (or <strong>Cmd+C</strong>) to copy:
            </p>
            <input
              type="text"
              readOnly
              value={clipboardFallbackUrl}
              onFocus={(e) => e.target.select()}
              autoFocus
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-[#FED7AA] text-xs font-mono text-slate-900 focus:outline-none focus:border-[#C2410C] select-all"
            />
            <div className="flex justify-end pt-1">
              <button
                onClick={() => setClipboardFallbackUrl(null)}
                className="px-4 py-1.5 rounded-xl bg-[#C2410C] text-white text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

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
