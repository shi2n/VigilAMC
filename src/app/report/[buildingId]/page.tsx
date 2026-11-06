'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import EmberLine from '@/components/home/EmberLine';
import { useParams, useRouter } from 'next/navigation';
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
  Building2,
  Wrench,
  Camera,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserCheck,
  ExternalLink,
} from 'lucide-react';
import { SITE_CONFIG } from '@/lib/siteConfig';

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
  const buildingId = (params?.buildingId as string) || '';

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Client delivery state
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [showContactEditor, setShowContactEditor] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const fetchReport = useCallback(async () => {
    if (!buildingId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/report/${encodeURIComponent(buildingId)}`);
      const json = await res.json().catch(() => ({}));

      if (!res.ok || json.error || !json.building || !json.summary) {
        setError(json.error || `Could not load compliance report (HTTP ${res.status})`);
        setData(null);
        return;
      }

      setData(json);
      setClientPhone(json.building?.client?.phone || '');
      setClientEmail(json.building?.client?.email || '');

      if (typeof document !== 'undefined' && json.building?.name) {
        const refNum = json.report?.reportNumber || `FORM-B-${new Date().getFullYear()}`;
        document.title = `${json.building.name} - Fire Safety Compliance Report (${refNum})`;
      }
    } catch (e: any) {
      console.error('Error loading report:', e);
      setError(e?.message || 'Unexpected network error while generating report.');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [buildingId]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

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
      const refNum = data?.report?.reportNumber || `FORM-B-${new Date().getFullYear()}`;
      document.title = `${data.building.name} - Fire Safety Compliance Report (${refNum})`;
    }
    window.print();
  };

  const getReportUrl = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : SITE_CONFIG.SITE_URL;
    return `${origin}/report/${buildingId}`;
  };

  const getVerifyUrl = () => {
    return `${SITE_CONFIG.SITE_URL}/verify/${buildingId}`;
  };

  const handleCopyClientLink = async () => {
    const url = getReportUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      showToast('Official client report link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      showToast(`Report Link: ${url}`);
    }
  };

  const handleSendWhatsApp = () => {
    const url = getReportUrl();
    const bldgName = data?.building?.name || 'Client Facility';
    const agencyName = data?.company?.name || 'Fire Safety AMC Agency';
    const licenseNo = data?.company?.licenseNumber || 'DL/FIRE/LIC/2026';
    const compCount = data?.summary?.compliant ?? 0;
    const totalCount = data?.summary?.total ?? 0;
    const isOk =
      totalCount > 0 &&
      (data?.summary?.overallStatus === 'COMPLIANT' || data?.summary?.overallStatus === 'VERIFIED');

    const statusLine =
      totalCount === 0
        ? 'Pending Equipment Registration (0 Assets Logged)'
        : `${isOk ? 'FULLY COMPLIANT' : 'ACTION REQUIRED'} (${compCount}/${totalCount} Assets Operational)`;

    const message = [
      `*Fire Safety Compliance Report (Form-B) — ${bldgName}*`,
      ``,
      `• *Audit Status:* ${statusLine}`,
      `• *Inspecting Agency:* ${agencyName} (Lic: ${licenseNo})`,
      `• *Report Ref:* ${data?.report?.reportNumber || 'FORM-B'}`,
      ``,
      `View & download the official printable A4 compliance certificate directly (no login required):`,
      url,
    ].join('\n');

    const formattedPhone = normalizeWhatsAppPhone(clientPhone);
    const waUrl = formattedPhone
      ? `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;

    window.open(waUrl, '_blank', 'noopener,noreferrer');
    showToast('Opening WhatsApp with pre-filled compliance summary...');
  };

  const handleSendEmail = async () => {
    const url = getReportUrl();
    const bldgName = data?.building?.name || 'Client Facility';
    const agencyName = data?.company?.name || 'Fire Safety AMC Agency';
    const licenseNo = data?.company?.licenseNumber || 'DL/FIRE/LIC/2026';
    const compCount = data?.summary?.compliant ?? 0;
    const totalCount = data?.summary?.total ?? 0;
    const isOk =
      totalCount > 0 &&
      (data?.summary?.overallStatus === 'COMPLIANT' || data?.summary?.overallStatus === 'VERIFIED');

    try {
      await navigator.clipboard.writeText(url);
    } catch {}

    const statusLine =
      totalCount === 0
        ? 'Pending Equipment Registration (0 Assets Logged)'
        : `${isOk ? 'Fully Compliant' : 'Action Needed'} (${compCount} / ${totalCount} Operational)`;

    const subject = `Fire Safety Compliance Report — ${bldgName} (${data?.report?.reportNumber || 'Official Form-B'})`;
    const body = [
      `Dear ${data?.building?.client?.contactPerson || data?.building?.client?.name || 'Facility Manager'},`,
      ``,
      `Please find below the official Fire Safety Equipment Compliance Inspection Report (Form-B) for ${bldgName}.`,
      ``,
      `Summary:`,
      `- Facility: ${bldgName} (${data?.building?.address || ''})`,
      `- Audit Status: ${statusLine}`,
      `- Certified By: ${agencyName} (License No: ${licenseNo})`,
      `- Report Reference: ${data?.report?.reportNumber || 'FORM-B'}`,
      ``,
      `Click below to view and download the official A4 document:`,
      url,
      ``,
      `Regards,`,
      `${data?.signatoryName || data?.company?.contactPerson || 'Authorized Signatory'}`,
      `${agencyName}`,
    ].join('\n');

    const mailto = `mailto:${encodeURIComponent(clientEmail.trim())}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
    showToast('Report link copied & email draft opened!');
  };

  const company = data?.company || {};
  const building = data?.building || {};
  const report = data?.report || {};
  const summary = data?.summary || {};
  const equipments = Array.isArray(building?.equipments) ? building.equipments : [];
  const inspections = Array.isArray(building?.inspections) ? building.inspections : [];
  const correctiveActions = Array.isArray(building?.correctiveActions) ? building.correctiveActions : [];
  const applicableStandards = Array.isArray(data?.applicableStandards)
    ? data.applicableStandards
    : ['IS 2190:2010 — Maintenance of First-Aid Fire Extinguishers', 'NBC 2016 Part 4 — Fire and Life Safety'];

  const totalCount = summary?.total ?? equipments.length;
  const compliantCount = summary?.compliant ?? 0;
  const overdueCount = summary?.overdue ?? 0;
  const dueSoonCount = summary?.dueSoon ?? 0;
  const openFindingsCount =
    summary?.openFindings ??
    correctiveActions.filter((ca: any) => ca.status === 'OPEN' || ca.status === 'DISPATCHED' || ca.status === 'REPAIRED').length;
  const compliantPercent = summary?.compliantPercent ?? (totalCount > 0 ? Math.round((compliantCount / totalCount) * 100) : 0);

  const hasZeroEquipment = totalCount === 0 || equipments.length === 0;
  const signatoryName =
    data?.signatoryName || company?.signatoryName || company?.contactPerson || 'Authorized Inspecting Officer';

  const isCompliant =
    !hasZeroEquipment &&
    (summary?.overallStatus === 'COMPLIANT' || summary?.overallStatus === 'VERIFIED');

  // Next-due schedule: sorted by nextDueDate ascending
  const nextDueSchedule = useMemo(() => {
    return [...equipments]
      .filter((eq: any) => eq.nextDueDate)
      .sort((a: any, b: any) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime())
      .slice(0, 10);
  }, [equipments]);

  // Key findings from open corrective actions and inspections
  const keyFindings = useMemo(() => {
    if (correctiveActions.length > 0) {
      return correctiveActions.slice(0, 6);
    }
    // Fallback to equipment overdue or issues
    return equipments
      .filter((eq: any) => eq.currentStatus === 'OVERDUE' || eq.currentStatus === 'DUE_SOON')
      .map((eq: any) => ({
        id: eq.id,
        assetRef: eq.qrCode,
        title: `${eq.type} (${eq.capacity || 'Standard'}) requires service verification`,
        description: `Located at ${eq.location || 'Premise'}. Next service due was ${formatSafeDate(eq.nextDueDate)}.`,
        severity: eq.currentStatus === 'OVERDUE' ? 'HIGH' : 'MEDIUM',
        status: 'OPEN',
        openedAt: eq.lastServiceDate || eq.createdAt,
      }));
  }, [correctiveActions, equipments]);

  const reportDateFormatted = formatSafeDate(report?.generatedAt || new Date());
  const auditCycleDisplay = report?.cyclePeriod || building?.complianceCycle || 'Half-Yearly Mandatory Audit';

  // Common statutory footer component
  const StatutoryFooter = ({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => (
    <div className="report-footer mt-auto pt-4 border-t border-slate-300 text-[10px] text-slate-600 space-y-1.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] font-semibold text-slate-800">
        <span>Generated by VigilAMC &bull; {reportDateFormatted}</span>
        <span className="font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
          Page {pageNumber} of {totalPages}
        </span>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[10px]">
        <div className="text-slate-700">
          <span className="font-bold">Statutory Verification Line:</span> Verify this official record at{' '}
          <span className="font-mono font-bold text-[#C2410C] underline">{getVerifyUrl()}</span>
        </div>
        <div className="text-slate-500 font-mono text-[9px]">
          Ref: {report?.reportNumber || 'FORM-B'} &bull; Bldg ID: {buildingId.slice(0, 12)}
        </div>
      </div>
      <div className="text-[9px] text-slate-500 border-t border-slate-200 pt-1 leading-snug">
        <span className="font-bold uppercase tracking-wider text-slate-700">Applicable Standards:</span>{' '}
        {applicableStandards.join(' • ')}
      </div>
      {company?.reportFooterText && (
        <div data-testid="report-branding-footer" className="text-[9px] text-slate-500 italic text-center pt-0.5">
          {company.reportFooterText}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="bg-[#FFF8F2] min-h-screen py-10 px-4 flex items-center justify-center">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-lg p-8 max-w-md w-full flex flex-col items-center gap-3 text-slate-700 text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-[#C2410C]" />
          <p className="text-sm font-bold text-slate-900">Generating Official Form-B Compliance Report...</p>
          <p className="text-xs text-slate-500">Compiling verified equipment register, GPS audit &amp; agency seal</p>
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
          <h2 className="text-lg font-extrabold text-slate-900">Unable to Load Compliance Report</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            {error || 'This building report could not be found or generated right now.'}
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <button
              onClick={fetchReport}
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

  // Calculate total pages for footer (Cover = 1, Exec Summary = 2, Asset Register = 3, Evidence = 4, Findings = 5)
  const totalPages = 5;

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
        <div className="no-print print:hidden fixed bottom-5 right-5 z-50 bg-slate-900 border border-emerald-500/40 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sticky Top Action Bar (Screen Only) */}
      <div
        data-testid="report-glass-action-bar"
        className="no-print print:hidden max-w-[210mm] mx-auto mb-6 sticky top-3 z-40 glass-panel-dense rounded-xl p-3 sm:px-4 space-y-3"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Left: Close / Back + Title */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={handleCloseOrBack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </button>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FFF0E6] text-[#1C1917] border border-[#FED7AA] text-[11px] font-bold tracking-tight">
              <FileText className="w-3.5 h-3.5 text-[#C2410C]" />
              <span>Statutory Compliance Report (A4 5-Page Standard)</span>
            </span>
          </div>

          {/* Right: Actions */}
          <div className="flex flex-wrap items-center gap-2">
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
              title="Copy direct verification link"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Link Copied ✓' : 'Copy Link'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowContactEditor((prev) => !prev)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-300 text-[11px] font-medium transition-all cursor-pointer"
              title="Customize recipient contact"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Recipient</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#1C1917] to-[#C2410C] hover:from-[#1C1917] hover:to-[#1C1917] text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>Open &amp; Print PDF</span>
            </button>
          </div>
        </div>

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
                className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* PAGE 1: COVER PAGE                                                         */}
      {/* ========================================================================= */}
      <div
        data-testid="report-page-1-cover"
        className="max-w-[210mm] mx-auto bg-white shadow-2xl border border-slate-200 rounded-sm sm:p-12 p-6 text-slate-900 print:shadow-none print:border-none print:max-w-none print:p-0 mb-8 flex flex-col justify-between min-h-[275mm]"
      >
        <div>
          {/* AMC Company Letterhead */}
          <div className="border-b-2 border-slate-900 pb-5 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                {company?.brandLogoUrl && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={company.brandLogoUrl}
                    alt={company?.name || 'Agency Logo'}
                    data-testid="report-brand-logo"
                    className="h-14 w-auto max-w-[150px] object-contain rounded border border-slate-200 p-1 bg-white shrink-0"
                  />
                )}
                <div>
                  <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 uppercase">
                    {company?.name || 'Vigil Fire & Safety Solutions'}
                  </div>
                  <p className="text-xs font-bold text-[#C2410C] mt-0.5">
                    Govt. Licensed Fire Safety Agency &bull; Lic: {company?.licenseNumber || 'DL/FIRE/LIC/2026/042'}
                    {company?.gstin ? ` • GSTIN: ${company.gstin}` : ''}
                  </p>
                  <p className="text-[11px] text-slate-600 mt-1 max-w-lg leading-relaxed">
                    {company?.address || 'Official Registered Fire Equipment Service Station'} &bull; Phone:{' '}
                    {company?.phone || '+91 83838 90483'} &bull; Email: {company?.email || 'vigilamc@gmail.com'}
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-3 py-1.5 rounded border border-slate-300 block sm:inline-block">
                  Ref: {report?.reportNumber || `FORM-B/${new Date().getFullYear()}`}
                </span>
                <div className="text-[11px] text-slate-600 mt-1.5 font-medium">
                  Issue Date: <strong className="text-slate-900">{reportDateFormatted}</strong>
                </div>
                <div className="text-[11px] text-slate-600 font-medium">
                  Audit Cycle: <strong className="text-slate-900">{auditCycleDisplay}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Document Title Block */}
          <div className="text-center py-4 px-3 bg-gradient-to-r from-slate-50 via-[#FFF8F2] to-slate-50 border border-slate-200 rounded-xl mb-6">
            <span className="inline-block text-[10px] font-black tracking-wider uppercase bg-[#C2410C] text-white px-3 py-0.5 rounded-full mb-1">
              Official Statutory Form &apos;B&apos; Certificate
            </span>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900">
              Fire Safety Compliance &amp; Equipment Maintenance Report
            </h1>
            <p className="text-xs text-slate-700 font-semibold mt-1">
              Pursuant to {building?.complianceRuleName || building?.complianceCycle || 'NBC 2016 Part 4 & IS 2190:2010'}
            </p>
          </div>

          {/* Premise & Client Entity Details */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                Audited Facility / Premise:
              </span>
              <div className="font-black text-base text-slate-900">{building?.name || 'Commercial Facility'}</div>
              <div className="text-slate-700 leading-snug flex items-start gap-1 pt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                <span>
                  {building?.address || '—'}
                  {building?.city ? `, ${building.city}` : ''}
                  {building?.state ? `, ${building.state}` : ''}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 pt-1">
                Compliance Regime:{' '}
                <strong className="text-slate-800">
                  {building?.complianceCycle || 'Half-Yearly Mandatory Statutory Filing'}
                </strong>
              </div>
            </div>

            <div className="space-y-1 sm:border-l sm:border-slate-200 sm:pl-5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                Client / Facility Authority:
              </span>
              <div className="font-bold text-sm text-slate-900">{building?.client?.name || 'Registered Client'}</div>
              <div className="text-slate-700 leading-snug">
                Authorized Contact: <strong>{building?.client?.contactPerson || 'Facility Manager / Estate Officer'}</strong>
              </div>
              <div className="text-slate-600 pt-0.5">
                Phone: {building?.client?.phone || 'On Record'} &bull; Email: {building?.client?.email || 'On Record'}
              </div>
              <div className="text-[11px] text-slate-500 pt-1">
                Verification Route: <strong className="text-slate-800 font-mono">Asset Tag ID + Physical Audit</strong>
              </div>
            </div>
          </div>

          {/* SUMMARY STRIP (Mandatory: total assets · compliant % · overdue · open findings) */}
          <div className="mb-6">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2">
              Statutory Compliance Summary Strip (Real Data Audit)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-center">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Total Assets</div>
                <div className="text-2xl font-black text-slate-900 tabular-nums">{totalCount}</div>
                <div className="text-[10px] text-slate-500 font-medium">Logged in Schedule</div>
              </div>

              <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-center">
                <div className="text-[10px] font-bold text-emerald-800 uppercase">Compliant %</div>
                <div className="text-2xl font-black text-emerald-700 tabular-nums">{compliantPercent}%</div>
                <div className="text-[10px] text-emerald-700 font-semibold">{compliantCount} of {totalCount} Operational</div>
              </div>

              <div className={`p-3.5 rounded-xl border text-center ${overdueCount > 0 ? 'bg-rose-50 border-rose-300' : 'bg-slate-50 border-slate-200'}`}>
                <div className={`text-[10px] font-bold uppercase ${overdueCount > 0 ? 'text-rose-800' : 'text-slate-500'}`}>
                  Overdue
                </div>
                <div className={`text-2xl font-black tabular-nums ${overdueCount > 0 ? 'text-[#DC2626]' : 'text-slate-800'}`}>
                  {overdueCount}
                </div>
                <div className={`text-[10px] font-medium ${overdueCount > 0 ? 'text-rose-700 font-bold' : 'text-slate-500'}`}>
                  {overdueCount > 0 ? 'Requires Service' : 'Zero Overdue'}
                </div>
              </div>

              <div className={`p-3.5 rounded-xl border text-center ${openFindingsCount > 0 ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-200'}`}>
                <div className={`text-[10px] font-bold uppercase ${openFindingsCount > 0 ? 'text-amber-800' : 'text-slate-500'}`}>
                  Open Findings
                </div>
                <div className={`text-2xl font-black tabular-nums ${openFindingsCount > 0 ? 'text-[#D97706]' : 'text-slate-800'}`}>
                  {openFindingsCount}
                </div>
                <div className={`text-[10px] font-medium ${openFindingsCount > 0 ? 'text-amber-800 font-bold' : 'text-slate-500'}`}>
                  {openFindingsCount > 0 ? 'Corrective Actions' : 'All Rectified'}
                </div>
              </div>
            </div>
          </div>

          {/* Compliance Status Banner */}
          <div
            className={`p-4 rounded-xl border mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 ${
              hasZeroEquipment
                ? 'bg-amber-50 border-amber-300 text-amber-950'
                : isCompliant
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : 'bg-red-50 border-red-300 text-red-950'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-white shrink-0 shadow-xs ${
                  hasZeroEquipment ? 'bg-amber-600' : isCompliant ? 'bg-emerald-600' : 'bg-red-600'
                }`}
              >
                {hasZeroEquipment ? (
                  <Clock className="w-7 h-7" />
                ) : isCompliant ? (
                  <ShieldCheck className="w-7 h-7" />
                ) : (
                  <AlertTriangle className="w-7 h-7" />
                )}
              </div>
              <div>
                <div className="text-base font-black uppercase tracking-wide">
                  {hasZeroEquipment
                    ? 'Pending Equipment Registration (0 Assets Logged)'
                    : isCompliant
                    ? 'Audit Result: FULLY COMPLIANT'
                    : 'Audit Result: STATUTORY ACTION REQUIRED'}
                </div>
                <p className="text-xs text-slate-700 mt-0.5 leading-snug">
                  {hasZeroEquipment
                    ? 'No fire safety equipment units have been added to this building schedule yet. Add extinguishers, hydrants, or panels from the Dashboard.'
                    : isCompliant
                    ? 'All fire prevention and life safety installations in this building have undergone scheduled maintenance and are in proper working condition as per NBC 2016 Part 4.'
                    : `${overdueCount} equipment item(s) require mandatory refill/overhaul or corrective servicing to restore statutory certification.`}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-xs font-bold uppercase text-slate-600">Inventory Status</div>
              <div className="text-sm font-black text-slate-900">
                {compliantCount} / {totalCount} Operational
              </div>
            </div>
          </div>

          {/* Digital GPS Stamp & Agency Signatory Block */}
          <div className="pt-4 border-t border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* GPS verification badge */}
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-300 max-w-sm w-full">
              <div className="w-10 h-10 rounded-lg bg-[#1C1917] text-white flex flex-col items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-amber-400" />
              </div>
              <div className="text-[10px] text-slate-700 space-y-0.5">
                <div className="font-black text-slate-900 uppercase">GPS &amp; Timestamp Verified</div>
                <p className="font-mono text-slate-800 font-bold">
                  {data?.latestGpsInspection?.latitude != null && data?.latestGpsInspection?.longitude != null
                    ? `${Number(data.latestGpsInspection.latitude).toFixed(4)}° N, ${Number(
                        data.latestGpsInspection.longitude
                      ).toFixed(4)}° E`
                    : `Verified Facility: ${building?.address || 'On-Site Physical Audit'}`}
                </p>
                <div className="text-slate-500 text-[9px]">
                  Audited by: <strong>{data?.latestGpsInspection?.technicianName || 'Certified Technician'}</strong>
                </div>
              </div>
            </div>

            {/* Signatory block */}
            <div className="text-right space-y-1" data-testid="report-signatory-block">
              {company?.signatorySignatureUrl && (
                <div className="flex justify-end mb-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={company.signatorySignatureUrl}
                    alt="Authorized Signatory Signature"
                    data-testid="report-signatory-signature"
                    className="h-10 w-auto max-w-[160px] object-contain"
                  />
                </div>
              )}
              <div className="h-8 flex items-center justify-end">
                <span className="font-serif italic text-base font-bold text-slate-900">{signatoryName}</span>
              </div>
              <div className="font-bold text-xs text-slate-900">
                {company?.signatoryDesignation || 'Authorized Inspecting Officer'}
              </div>
              <div className="text-[11px] text-slate-600">
                For <strong>{company?.name || 'Vigil Fire & Safety Solutions'}</strong>
              </div>
              <div className="text-[10px] text-slate-500">
                Govt. Licensed Fire Safety Agency (Lic: {company?.licenseNumber || 'DL/FIRE/LIC/2026/042'})
              </div>
            </div>
          </div>
        </div>

        {/* Page 1 Footer */}
        <StatutoryFooter pageNumber={1} totalPages={totalPages} />
      </div>

      {/* ========================================================================= */}
      {/* PAGE 2: EXECUTIVE SUMMARY & NEXT-DUE SCHEDULE                             */}
      {/* ========================================================================= */}
      <div
        data-testid="report-page-2-summary"
        className="max-w-[210mm] mx-auto bg-white shadow-2xl border border-slate-200 rounded-sm sm:p-12 p-6 text-slate-900 print:shadow-none print:border-none print:max-w-none print:p-0 mb-8 print-page-break flex flex-col justify-between min-h-[275mm]"
      >
        <div>
          {/* Section Header */}
          <div className="border-b-2 border-slate-900 pb-3 mb-6 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#C2410C]">Section 01</span>
              <h2 className="text-lg sm:text-xl font-black uppercase text-slate-900">
                Executive Compliance Summary &amp; Maintenance Radar
              </h2>
            </div>
            <div className="text-right text-[11px] text-slate-500 font-mono">
              Ref: {report?.reportNumber || 'FORM-B'}
            </div>
          </div>

          {/* Status Legend */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2.5">
              Auditor Status Legend &amp; Compliance Thresholds
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-white border border-emerald-300 flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-full bg-[#059669] shrink-0 mt-0.5" />
                <div>
                  <div className="font-extrabold text-[#059669] text-xs">OK / VERIFIED (#059669)</div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                    Equipment tested, pressure gauge in normal zone, weight within permissible 10% limit, valid AMC.
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-white border border-amber-300 flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-full bg-[#D97706] shrink-0 mt-0.5" />
                <div>
                  <div className="font-extrabold text-[#D97706] text-xs">DUE SOON (#D97706)</div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                    Periodic inspection or annual refill due within next 30 days. Auto work order dispatched.
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-white border border-rose-300 flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-full bg-[#DC2626] shrink-0 mt-0.5" />
                <div>
                  <div className="font-extrabold text-[#DC2626] text-xs">EXPIRED / OVERDUE (#DC2626)</div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                    Mandatory service expired, hydro test overdue, or physical defect observed. Non-compliant for Form-B.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Findings Bullet List (from Corrective Actions & Observations) */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-[#C2410C]" />
                <span>Key Findings &amp; High-Priority Observations</span>
              </h3>
              <span className="text-[11px] font-semibold text-slate-500">
                {keyFindings.length} active findings recorded
              </span>
            </div>

            {keyFindings.length === 0 ? (
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/70 text-emerald-900 text-xs flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Nil Adverse Observations:</strong> All fire safety installations across this premise are currently in
                  sound operational condition with zero outstanding corrective actions.
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                {keyFindings.map((finding: any, idx: number) => {
                  const isHigh = finding.severity === 'HIGH' || finding.severity === 'CRITICAL';
                  const ageDays = calculateAgeDays(finding.openedAt);
                  return (
                    <div
                      key={finding.id || idx}
                      className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                              isHigh ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {finding.severity || 'MEDIUM'}
                          </span>
                          <span className="font-mono font-bold text-slate-900">
                            Asset: {finding.assetRef || 'Facility'}
                          </span>
                          <span className="text-slate-400">&bull;</span>
                          <span className="text-[11px] text-slate-500">Age: {ageDays} days open</span>
                        </div>
                        <div className="font-bold text-slate-900">{finding.title}</div>
                        {finding.description && (
                          <div className="text-[11px] text-slate-600 leading-snug">{finding.description}</div>
                        )}
                      </div>

                      <div className="shrink-0 text-left sm:text-right">
                        <span
                          className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md inline-block ${
                            finding.status === 'CLOSED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : finding.status === 'REPAIRED'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {finding.status || 'OPEN'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Next-Due Schedule Table */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#C2410C]" />
                <span>Next-Due Statutory Maintenance Radar (Next 10 Assets)</span>
              </h3>
              <span className="text-[11px] text-slate-500">IS 2190 &amp; IS 3844 Maintenance Schedule</span>
            </div>

            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold border-b border-slate-300">
                  <tr>
                    <th className="py-2 px-2.5 border-r border-slate-300 text-center">S.No</th>
                    <th className="py-2 px-3 border-r border-slate-300">Asset Tag ID</th>
                    <th className="py-2 px-3 border-r border-slate-300">Equipment Type</th>
                    <th className="py-2 px-3 border-r border-slate-300">Floor &amp; Premise Location</th>
                    <th className="py-2 px-3 border-r border-slate-300">Next Service Due</th>
                    <th className="py-2 px-3 border-r border-slate-300">Window</th>
                    <th className="py-2 px-3 text-right">Required Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {nextDueSchedule.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-4 px-3 text-center text-slate-500">
                        No equipment maintenance dates scheduled yet.
                      </td>
                    </tr>
                  ) : (
                    nextDueSchedule.map((eq, idx) => {
                      const isOverdue = eq.currentStatus === 'OVERDUE';
                      const isDueSoon = eq.currentStatus === 'DUE_SOON';
                      const windowLabel = isOverdue
                        ? 'OVERDUE'
                        : isDueSoon
                        ? 'Within 30 Days'
                        : 'Routine Cycle';

                      return (
                        <tr key={eq.id || idx} className="hover:bg-slate-50">
                          <td className="py-2 px-2.5 text-center text-slate-500 border-r border-slate-200">
                            {idx + 1}
                          </td>
                          <td className="py-2 px-3 font-mono font-bold text-slate-900 border-r border-slate-200">
                            {eq.qrCode || '—'}
                          </td>
                          <td className="py-2 px-3 font-semibold text-slate-800 border-r border-slate-200">
                            {eq.type} ({eq.capacity || 'Standard'})
                          </td>
                          <td className="py-2 px-3 text-slate-600 border-r border-slate-200">
                            {eq.location || '—'}
                          </td>
                          <td className="py-2 px-3 font-semibold border-r border-slate-200 whitespace-nowrap">
                            <span
                              className={
                                isOverdue ? 'text-red-700 font-bold' : isDueSoon ? 'text-amber-700 font-bold' : 'text-slate-800'
                              }
                            >
                              {formatSafeDate(eq.nextDueDate)}
                            </span>
                          </td>
                          <td className="py-2 px-3 border-r border-slate-200 whitespace-nowrap">
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                                isOverdue
                                  ? 'bg-red-100 text-red-800'
                                  : isDueSoon
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {windowLabel}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right font-medium text-slate-700 whitespace-nowrap">
                            {isOverdue ? 'Immediate Refill / Hydro Test' : isDueSoon ? 'Inspection & Weight Check' : 'Routine Quarterly Audit'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Page 2 Footer */}
        <StatutoryFooter pageNumber={2} totalPages={totalPages} />
      </div>

      {/* ========================================================================= */}
      {/* PAGE 3: FULL ASSET REGISTER                                               */}
      {/* ========================================================================= */}
      <div
        data-testid="report-page-3-register"
        className="max-w-[210mm] mx-auto bg-white shadow-2xl border border-slate-200 rounded-sm sm:p-12 p-6 text-slate-900 print:shadow-none print:border-none print:max-w-none print:p-0 mb-8 print-page-break flex flex-col justify-between min-h-[275mm]"
      >
        <div>
          {/* Section Header */}
          <div className="border-b-2 border-slate-900 pb-3 mb-6 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#C2410C]">Section 02</span>
              <h2 className="text-lg sm:text-xl font-black uppercase text-slate-900">
                Premise Fire Safety Asset Register &amp; Verification Schedule
              </h2>
            </div>
            <div className="text-right text-[11px] text-slate-500 font-mono">
              Total Assets: {equipments.length}
            </div>
          </div>

          <p className="text-xs text-slate-600 mb-4 leading-relaxed">
            Every fire safety apparatus installed within <strong>{building?.name || 'this facility'}</strong> is catalogued
            below with unique Asset Tag ID, capacity rating, physical floor/zone location, last certified servicing date, and
            next statutory due date.
          </p>

          {/* Full Asset Register Table */}
          <div className="border border-slate-300 rounded-lg overflow-x-auto mb-6">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-800 uppercase text-[10px] font-bold border-b border-slate-300">
                <tr>
                  <th className="py-2.5 px-2 border-r border-slate-300 text-center">S.No</th>
                  <th className="py-2.5 px-3 border-r border-slate-300">Asset Tag ID</th>
                  <th className="py-2.5 px-3 border-r border-slate-300">Type &amp; Capacity</th>
                  <th className="py-2.5 px-3 border-r border-slate-300">Floor / Premise Zone</th>
                  <th className="py-2.5 px-2.5 border-r border-slate-300">Make / Serial</th>
                  <th className="py-2.5 px-2.5 border-r border-slate-300 whitespace-nowrap">Last Serviced</th>
                  <th className="py-2.5 px-2.5 border-r border-slate-300 whitespace-nowrap">Next Due</th>
                  <th className="py-2.5 px-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {equipments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 px-4 text-center text-slate-500 bg-slate-50/60">
                      <p className="font-bold text-slate-700 text-xs mb-1">
                        Pending Equipment Registration (0 Assets Logged)
                      </p>
                      <p className="text-[11px] text-slate-500 max-w-lg mx-auto">
                        No fire safety equipment units have been added to this building schedule yet. Add extinguishers,
                        hydrants, or panels from the Dashboard to complete this Form-B schedule.
                      </p>
                    </td>
                  </tr>
                ) : (
                  equipments.map((eq: any, index: number) => {
                    const statusStr = String(eq?.currentStatus || eq?.status || 'COMPLIANT').toUpperCase();
                    const isPass = statusStr === 'COMPLIANT' || statusStr === 'VERIFIED' || statusStr === 'OPERATIONAL';
                    const isDue = statusStr === 'DUE_SOON';
                    const isOver = statusStr === 'OVERDUE' || statusStr === 'DEFECTIVE';
                    const isEven = index % 2 === 0;

                    return (
                      <tr key={eq?.id || index} className={isEven ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/70 hover:bg-slate-100/70'}>
                        <td className="py-2 px-2 text-slate-500 border-r border-slate-200 text-center font-mono text-[11px]">
                          {index + 1}
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-slate-900 border-r border-slate-200 whitespace-nowrap">
                          {eq?.qrCode || '—'}
                        </td>
                        <td className="py-2 px-3 font-semibold text-slate-800 border-r border-slate-200">
                          <div>
                            {eq?.type || 'Extinguisher'}
                            {eq?.capacity ? ` (${eq.capacity})` : ''}
                          </div>
                          {eq?.inspectionNotes && (
                            <div className="text-[10px] text-slate-500 font-normal mt-0.5 line-clamp-1">
                              {eq.inspectionNotes}
                            </div>
                          )}
                        </td>
                        <td className="py-2 px-3 text-slate-700 border-r border-slate-200">
                          <div className="font-medium">{eq?.location || '—'}</div>
                          {eq?.floor && <div className="text-[10px] text-slate-500">Floor: {eq.floor}</div>}
                        </td>
                        <td className="py-2 px-2.5 text-slate-600 border-r border-slate-200 text-[11px]">
                          <div>{eq?.manufacturer || eq?.model || 'ISI Mark'}</div>
                          {eq?.serialNumber && (
                            <div className="font-mono text-[9px] text-slate-400">S/N: {eq.serialNumber}</div>
                          )}
                        </td>
                        <td className="py-2 px-2.5 text-slate-600 border-r border-slate-200 whitespace-nowrap text-[11px]">
                          {formatSafeDate(eq?.lastServiceDate)}
                        </td>
                        <td className="py-2 px-2.5 font-semibold border-r border-slate-200 whitespace-nowrap text-[11px]">
                          <span
                            className={
                              isOver ? 'text-red-700 font-bold' : isDue ? 'text-amber-700 font-bold' : 'text-slate-800'
                            }
                          >
                            {formatSafeDate(eq?.nextDueDate)}
                          </span>
                          {eq?.hydroDueDate && (
                            <div className="text-[9px] text-slate-400 font-normal">
                              Hydro: {formatSafeDate(eq.hydroDueDate)}
                            </div>
                          )}
                        </td>
                        <td className="py-2 px-2 text-center whitespace-nowrap">
                          <span
                            className={`font-black text-[9px] px-2 py-0.5 rounded inline-block ${
                              isPass
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : isDue
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-red-100 text-red-800 border border-red-200'
                            }`}
                          >
                            {isPass ? 'OK' : isDue ? 'DUE SOON' : 'ACTION'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Statutory Asset Integrity Note:</strong> All equipment serials and physical locations have been verified
              on-site by licensed technicians. Asset verification and service history can be audited at{' '}
              <span className="font-mono font-bold text-slate-800">{getVerifyUrl()}</span>.
            </span>
          </div>
        </div>

        {/* Page 3 Footer */}
        <StatutoryFooter pageNumber={3} totalPages={totalPages} />
      </div>

      {/* ========================================================================= */}
      {/* PAGE 4: INSPECTION EVIDENCE & FIELD PROOF                                 */}
      {/* ========================================================================= */}
      <div
        data-testid="report-page-4-evidence"
        className="max-w-[210mm] mx-auto bg-white shadow-2xl border border-slate-200 rounded-sm sm:p-12 p-6 text-slate-900 print:shadow-none print:border-none print:max-w-none print:p-0 mb-8 print-page-break flex flex-col justify-between min-h-[275mm]"
      >
        <div>
          {/* Section Header */}
          <div className="border-b-2 border-slate-900 pb-3 mb-6 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#C2410C]">Section 03</span>
              <h2 className="text-lg sm:text-xl font-black uppercase text-slate-900">
                Field Inspection Evidence &amp; Verification Stamps
              </h2>
            </div>
            <div className="text-right text-[11px] text-slate-500 font-mono">
              Total Inspections: {inspections.length}
            </div>
          </div>

          <p className="text-xs text-slate-600 mb-4 leading-relaxed">
            Inspection logs recorded by certified field technicians with tamper-evident GPS coordinates, on-site photo
            thumbnails with burned-in stamps, checklist item outcomes, and digital signatory captures.
          </p>

          {/* Inspection Records Grid */}
          {inspections.length === 0 ? (
            <div className="p-8 border border-slate-200 rounded-xl bg-slate-50 text-center text-slate-500 text-xs mb-6">
              <Camera className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="font-bold text-slate-700">No field inspection photos recorded yet</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Technicians capture real-time photo proof and GPS stamps via the VigilAMC Field App during scheduled audits.
              </p>
            </div>
          ) : (
            <div className="space-y-4 mb-6">
              {inspections.slice(0, 4).map((insp: any, idx: number) => {
                const inspPhotos = Array.isArray(insp.inspectionPhotos) && insp.inspectionPhotos.length > 0
                  ? insp.inspectionPhotos
                  : insp.photos
                  ? [{ photoUrl: typeof insp.photos === 'string' && insp.photos.startsWith('[') ? JSON.parse(insp.photos)[0] : insp.photos, category: 'EVIDENCE' }]
                  : [];

                const hasGPS = insp.latitude != null && insp.longitude != null;

                return (
                  <div
                    key={insp.id || idx}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 print-avoid-break space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2.5 py-1 rounded border border-slate-300">
                          {insp.equipment?.qrCode ? `Asset: ${insp.equipment.qrCode}` : `Inspection #${idx + 1}`}
                        </span>
                        <span className="text-xs font-semibold text-slate-700">
                          Technician: <strong>{insp.technicianName || 'Certified Technician'}</strong>
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-500 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatSafeDateTime(insp.date || insp.createdAt)}</span>
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                            insp.status === 'PASSED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {insp.status || 'VERIFIED'}
                        </span>
                      </div>
                    </div>

                    {/* GPS & Checklist Summary Line */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="flex items-start gap-1.5 text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-[#C2410C] shrink-0 mt-0.5" />
                        <span>
                          {hasGPS
                            ? `GPS Coordinates: ${Number(insp.latitude).toFixed(4)}° N, ${Number(insp.longitude).toFixed(
                                4
                              )}° E (±${insp.gpsAccuracy || 10}m)`
                            : `Site Location: ${building?.name || 'On-site Premise'}`}
                        </span>
                      </div>
                      <div className="text-slate-600 text-right sm:text-left">
                        <span>Checklist: </span>
                        <strong className="text-slate-800">
                          Gauge: {insp.pressureGauge || 'NORMAL'} &bull; Condition: {insp.overallCondition || 'GOOD'}
                        </strong>
                      </div>
                    </div>

                    {insp.remarks && (
                      <div className="text-[11px] text-slate-600 italic bg-white p-2 rounded border border-slate-200">
                        &ldquo;{insp.remarks}&rdquo;
                      </div>
                    )}

                    {/* Photo Thumbnails with Burned-In Stamps */}
                    {inspPhotos.length > 0 && (
                      <div className="pt-1">
                        <div className="text-[10px] font-bold uppercase text-slate-500 mb-1.5">
                          Evidence Photo Proof (Compressed Thumbnails &bull; Full-Res in App)
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
                                  {hasGPS ? `${Number(insp.latitude).toFixed(3)}°N, ${Number(insp.longitude).toFixed(3)}°E` : 'GPS Verified'}
                                </div>
                              </div>
                              <div className="text-[9px] text-slate-600 pt-1 flex items-center justify-between">
                                <span className="font-semibold uppercase truncate">{ph.category || 'INSPECTION'}</span>
                                <span className="text-slate-400 font-mono text-[8px]">
                                  {formatSafeDate(ph.capturedAt || insp.date)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Guard & Technician Signatures where captured */}
                    {(insp.customerSignature || insp.technicianSignature) && (
                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                        {insp.technicianSignature && (
                          <div>
                            <div className="text-[9px] uppercase font-bold text-slate-500">Technician Signature:</div>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={insp.technicianSignature}
                              alt="Technician Signature"
                              className="h-8 w-auto max-w-[120px] object-contain"
                            />
                          </div>
                        )}
                        {insp.customerSignature && (
                          <div className="text-right">
                            <div className="text-[9px] uppercase font-bold text-slate-500">
                              Client / Guard Signoff ({insp.customerName || 'Authorized Signatory'}):
                            </div>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={insp.customerSignature}
                              alt="Client Signoff Signature"
                              className="h-8 w-auto max-w-[120px] object-contain ml-auto"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Page 4 Footer */}
        <StatutoryFooter pageNumber={4} totalPages={totalPages} />
      </div>

      {/* ========================================================================= */}
      {/* PAGE 5: FINDINGS & CORRECTIVE ACTIONS                                     */}
      {/* ========================================================================= */}
      <div
        data-testid="report-page-5-findings"
        className="max-w-[210mm] mx-auto bg-white shadow-2xl border border-slate-200 rounded-sm sm:p-12 p-6 text-slate-900 print:shadow-none print:border-none print:max-w-none print:p-0 mb-8 print-page-break flex flex-col justify-between min-h-[275mm]"
      >
        <div>
          {/* Section Header */}
          <div className="border-b-2 border-slate-900 pb-3 mb-6 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#C2410C]">Section 04</span>
              <h2 className="text-lg sm:text-xl font-black uppercase text-slate-900">
                Corrective Actions Register &amp; Statutory Rectification Log
              </h2>
            </div>
            <div className="text-right text-[11px] text-slate-500 font-mono">
              Open Findings: {openFindingsCount} &bull; Total: {correctiveActions.length}
            </div>
          </div>

          <p className="text-xs text-slate-600 mb-4 leading-relaxed">
            Statutory compliance requires documenting every defect, leakage, pressure drop, or missing component identified
            during inspections, together with corrective actions taken, workshop servicing records, and re-commissioning
            verifications.
          </p>

          {/* Corrective Actions Table */}
          <div className="border border-slate-300 rounded-lg overflow-x-auto mb-6">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-800 uppercase text-[10px] font-bold border-b border-slate-300">
                <tr>
                  <th className="py-2.5 px-2 border-r border-slate-300 text-center">S.No</th>
                  <th className="py-2.5 px-3 border-r border-slate-300">Action Ref / Asset</th>
                  <th className="py-2.5 px-3 border-r border-slate-300">Finding Description</th>
                  <th className="py-2.5 px-2.5 border-r border-slate-300 text-center">Severity</th>
                  <th className="py-2.5 px-2.5 border-r border-slate-300">Aging</th>
                  <th className="py-2.5 px-3 border-r border-slate-300">Workshop &amp; Rectification Note</th>
                  <th className="py-2.5 px-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {correctiveActions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 px-4 text-center text-slate-500 bg-slate-50/60">
                      <CheckCircle className="w-6 h-6 text-emerald-600 mx-auto mb-1.5" />
                      <p className="font-bold text-slate-800 text-xs">Zero Corrective Actions Outstanding</p>
                      <p className="text-[11px] text-slate-500 max-w-md mx-auto mt-0.5">
                        No open defects or repair items recorded for this premise. All fire safety systems meet operating standards.
                      </p>
                    </td>
                  </tr>
                ) : (
                  correctiveActions.map((ca: any, idx: number) => {
                    const isClosed = ca.status === 'CLOSED';
                    const isRepaired = ca.status === 'REPAIRED';
                    const ageDays = calculateAgeDays(ca.openedAt);
                    const isHigh = ca.severity === 'HIGH' || ca.severity === 'CRITICAL';
                    const isEven = idx % 2 === 0;

                    return (
                      <tr key={ca.id || idx} className={isEven ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/70 hover:bg-slate-100/70'}>
                        <td className="py-2.5 px-2 text-center text-slate-500 border-r border-slate-200 font-mono text-[11px]">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900 border-r border-slate-200 whitespace-nowrap">
                          <div>{ca.assetRef || ca.equipment?.qrCode || 'Facility'}</div>
                          <div className="text-[9px] text-slate-400 font-normal">
                            Opened: {formatSafeDate(ca.openedAt)}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-800 border-r border-slate-200">
                          <div className="font-bold text-slate-900">{ca.title}</div>
                          {ca.description && (
                            <div className="text-[11px] text-slate-600 mt-0.5 leading-snug">{ca.description}</div>
                          )}
                        </td>
                        <td className="py-2.5 px-2.5 border-r border-slate-200 text-center whitespace-nowrap">
                          <span
                            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                              isHigh
                                ? 'bg-red-100 text-red-800 border border-red-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {ca.severity || 'MEDIUM'}
                          </span>
                        </td>
                        <td className="py-2.5 px-2.5 text-slate-600 border-r border-slate-200 whitespace-nowrap text-[11px]">
                          {ageDays} days
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 border-r border-slate-200 text-[11px]">
                          {ca.closeNote ? (
                            <div className="text-emerald-800 font-medium">
                              <strong>Resolution:</strong> {ca.closeNote}
                            </div>
                          ) : ca.workshopNote ? (
                            <div>
                              <strong>Workshop:</strong> {ca.workshopNote}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Pending technician dispatch</span>
                          )}
                        </td>
                        <td className="py-2.5 px-2.5 text-center whitespace-nowrap">
                          <span
                            className={`font-black text-[9px] px-2 py-0.5 rounded inline-block ${
                              isClosed
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : isRepaired
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : 'bg-rose-100 text-rose-800 border border-rose-200'
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

          {/* Statutory Signoff Certification on Last Page */}
          <div className="pt-4 border-t border-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="font-extrabold text-slate-900 uppercase tracking-tight">
                Statutory Compliance Endorsement
              </div>
              <p className="text-[11px] leading-relaxed">
                Certified that the fire prevention and life safety measures in the aforesaid building have been inspected
                in accordance with statutory norms, and this document constitutes the official <strong>Form &apos;B&apos;</strong>{' '}
                inspection record for submission to local fire services and insurance authorities.
              </p>
              <div className="text-[10px] text-slate-500 font-mono pt-1">
                Verify Authenticity: <strong className="text-slate-800">{getVerifyUrl()}</strong>
              </div>
            </div>

            <div className="text-right space-y-1" data-testid="report-final-signatory">
              {company?.signatorySignatureUrl && (
                <div className="flex justify-end mb-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={company.signatorySignatureUrl}
                    alt="Authorized Signatory Signature"
                    className="h-10 w-auto max-w-[160px] object-contain"
                  />
                </div>
              )}
              <div className="h-6 flex items-center justify-end">
                <span className="font-serif italic text-base font-bold text-slate-900">{signatoryName}</span>
              </div>
              <div className="font-bold text-xs text-slate-900">
                {company?.signatoryDesignation || 'Authorized Inspecting Officer'}
              </div>
              <div className="text-[11px] text-slate-600">
                For <strong>{company?.name || 'Vigil Fire & Safety Solutions'}</strong>
              </div>
              <div className="text-[10px] text-slate-500">
                Govt. Licensed Fire Safety Agency (Lic: {company?.licenseNumber || 'DL/FIRE/LIC/2026/042'})
              </div>
            </div>
          </div>
        </div>

        {/* Page 5 Footer */}
        <StatutoryFooter pageNumber={5} totalPages={totalPages} />
      </div>
    </div>
  );
}
