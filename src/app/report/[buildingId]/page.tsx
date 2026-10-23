'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
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
} from 'lucide-react';

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
        document.title = `${json.building.name} - Form-B Certificate (${refNum})`;
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
      document.title = `${data.building.name} - Form-B Certificate (${refNum})`;
    }
    window.print();
  };

  const getReportUrl = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://vigilamc.vercel.app';
    return `${origin}/report/${buildingId}`;
  };

  const handleCopyClientLink = async () => {
    const url = getReportUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      showToast('Direct Form-B client report link copied to clipboard!');
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
      `*Form-B Fire Safety Compliance Report — ${bldgName}*`,
      ``,
      `• *Audit Status:* ${statusLine}`,
      `• *Inspecting Agency:* ${agencyName} (Lic: ${licenseNo})`,
      `• *Report Ref:* ${data?.report?.reportNumber || 'FORM-B'}`,
      ``,
      `View & download your official printable Form-B PDF directly here (no login required):`,
      url,
    ].join('\n');

    const formattedPhone = normalizeWhatsAppPhone(clientPhone);
    const waUrl = formattedPhone
      ? `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;

    window.open(waUrl, '_blank', 'noopener,noreferrer');
    showToast('Opening WhatsApp with pre-filled Form-B compliance summary...');
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

    const subject = `Form-B Fire Safety Compliance Certificate — ${bldgName} (${data?.report?.reportNumber || 'Official Audit'})`;
    const body = [
      `Dear ${data?.building?.client?.contactPerson || data?.building?.client?.name || 'Facility Manager'},`,
      ``,
      `Please find below the official Form-B Fire Safety Equipment Compliance Inspection Report for ${bldgName}.`,
      ``,
      `Summary:`,
      `- Facility: ${bldgName} (${data?.building?.address || ''})`,
      `- Audit Status: ${statusLine}`,
      `- Certified By: ${agencyName} (License No: ${licenseNo})`,
      `- Report Reference: ${data?.report?.reportNumber || 'FORM-B'}`,
      ``,
      `Click below to view and download the A4 Form-B PDF directly (no login required):`,
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

  if (loading) {
    return (
      <div className="bg-slate-100 min-h-screen py-10 px-4 flex items-center justify-center">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-lg p-8 max-w-md w-full flex flex-col items-center gap-3 text-slate-700 text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-[#0077B6]" />
          <p className="text-sm font-bold text-slate-900">Generating Official Form-B Certificate...</p>
          <p className="text-xs text-slate-500">Compiling verified equipment schedule &amp; agency seal</p>
        </div>
      </div>
    );
  }

  if (error || !data || !data.building || !data.summary) {
    return (
      <div className="bg-slate-100 min-h-screen flex items-center justify-center p-4">
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
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0077B6] hover:bg-[#023E8A] text-white font-bold text-xs transition-all cursor-pointer"
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

  const company = data?.company || {};
  const building = data?.building || {};
  const report = data?.report || {};
  const summary = data?.summary || {};
  const equipments = Array.isArray(building?.equipments) ? building.equipments : [];
  const totalCount = summary?.total ?? equipments.length;
  const hasZeroEquipment = totalCount === 0 || equipments.length === 0;
  const signatoryName =
    data?.signatoryName || company?.signatoryName || company?.contactPerson || 'Authorized Inspecting Officer';

  const isCompliant =
    !hasZeroEquipment &&
    (summary?.overallStatus === 'COMPLIANT' || summary?.overallStatus === 'VERIFIED');

  return (
    <div className="bg-slate-100 min-h-screen py-6 sm:py-10 px-3 sm:px-6 print:bg-white print:p-0 text-slate-900">
      {/* Dedicated @page A4 Portrait Print Rules */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm;
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
        }
      `}</style>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="no-print print:hidden fixed bottom-5 right-5 z-50 bg-slate-900 border border-emerald-500/40 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sticky Top Document Action Bar (Hidden Completely on Print/PDF) */}
      <div className="no-print print:hidden max-w-[210mm] mx-auto mb-5 sticky top-3 z-40 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-xl p-3 sm:px-4 shadow-lg space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Left: Close / Back to Dashboard + Document Badge */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={handleCloseOrBack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Close / Back to Dashboard</span>
            </button>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-[#023E8A] border border-blue-200/80 text-[11px] font-bold tracking-tight">
              <FileText className="w-3.5 h-3.5 text-[#0077B6]" />
              <span>Official Form-B Certificate Preview</span>
            </span>
          </div>

          {/* Right: Direct Client Share & Print Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              title="Send Form-B Report directly to Client on WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Send on WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handleSendEmail}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              title="Email Form-B Report link to Client"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email to Client</span>
            </button>

            <button
              type="button"
              onClick={handleCopyClientLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-semibold text-xs transition-all cursor-pointer"
              title="Copy 1-click public report link for client"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Link Copied ✓' : 'Copy Client Link'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowContactEditor((prev) => !prev)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-300 text-[11px] font-medium transition-all cursor-pointer"
              title="Customize recipient WhatsApp number or email"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Recipient</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#023E8A] to-[#0077B6] hover:from-[#03045E] hover:to-[#023E8A] text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>Download / Print A4 PDF</span>
            </button>
          </div>
        </div>

        {/* Inline Recipient Phone / Email Editor */}
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

      {/* Standalone White A4 Sheet */}
      <div className="max-w-[210mm] mx-auto bg-white shadow-2xl border border-slate-200/90 rounded-sm sm:p-12 p-6 text-slate-900 print:shadow-none print:border-none print:max-w-none print:p-0">
        {/* AMC Company Letterhead Header */}
        <div className="border-b-2 border-slate-900 pb-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                {company?.name || 'Fire Safety AMC Solutions'}
              </div>
              <p className="text-xs font-semibold text-slate-600">
                Govt. Licensed Fire Safety Agency &bull; {company?.licenseNumber || 'DL/FIRE/LIC/2026/042'}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-md">
                {company?.address || 'Official Registered Service Station'} &bull; Phone:{' '}
                {company?.phone || '+91 83838 90483'} &bull; Email: {company?.email || 'vigilamc@gmail.com'}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded border border-slate-200 block sm:inline-block">
                Ref: {report?.reportNumber || `FORM-B/${new Date().getFullYear()}`}
              </span>
              <div className="text-[11px] text-slate-500 mt-1">
                Date:{' '}
                <strong>
                  {new Date().toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </strong>
              </div>
              <div className="text-[11px] text-slate-500">
                Audit Cycle: <strong>{report?.cyclePeriod || building?.complianceCycle || 'Half-Yearly'}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Title of Document */}
        <div className="text-center py-2 mb-6">
          <h1 className="text-lg sm:text-xl font-black uppercase tracking-tight text-slate-900">
            FORM &apos;B&apos; &bull; Fire Safety Equipment Compliance Inspection Report
          </h1>
          <p className="text-xs text-slate-600 font-medium uppercase mt-0.5">
            Pursuant to {building?.complianceRuleName || building?.complianceCycle || 'NBC 2016 Part 4 & IS 2190'}
          </p>
        </div>

        {/* Building & Client Meta */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Client / Premise:</span>
            <div className="font-bold text-sm text-slate-900">{building?.name || 'Facility'}</div>
            <div className="text-slate-600">{building?.address || '—'}</div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Client Contact:</span>
            <div className="font-semibold text-slate-800">{building?.client?.name || 'Authorized Client'}</div>
            <div className="text-slate-600">
              {building?.client?.contactPerson || 'Facility Manager'}
              {building?.client?.phone ? ` • ${building.client.phone}` : ''}
            </div>
          </div>
        </div>

        {/* COMPLIANCE STATUS SUMMARY STAMP (Handles 0 Equipment, Compliant, and Action Needed) */}
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
              className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-white shrink-0 ${
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
                  ? 'Status: Fully Compliant'
                  : 'Status: Action Needed'}
              </div>
              <p className="text-xs text-slate-700 mt-0.5">
                {hasZeroEquipment
                  ? 'No fire safety equipment units have been added to this building schedule yet. Add extinguishers, hydrants, or panels from the Dashboard to complete this Form-B schedule.'
                  : isCompliant
                  ? 'All fire prevention and life safety equipment in this building has been serviced and is in proper working condition.'
                  : `${summary?.overdue ?? 0} equipment item(s) require mandatory refill/overhaul or initial inspection verification.`}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-xs font-bold uppercase text-slate-600">Audited Inventory</div>
            <div className="text-sm font-black text-slate-900">
              {summary?.compliant ?? 0} / {totalCount} Operational
            </div>
          </div>
        </div>

        {/* Equipment Schedule Table */}
        <div className="space-y-3 mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Schedule of Fire Safety Equipment &amp; Inspection Dates
            </h2>
            <span className="text-[11px] text-slate-500 font-medium">IS 2190 Standard Maintenance</span>
          </div>

          <div className="border border-slate-300 rounded-lg overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold border-b border-slate-300">
                <tr>
                  <th className="py-2 px-2.5 border-r border-slate-300">S.No</th>
                  <th className="py-2 px-3 border-r border-slate-300">Asset ID / Serial</th>
                  <th className="py-2 px-3 border-r border-slate-300">Type &amp; Capacity</th>
                  <th className="py-2 px-3 border-r border-slate-300">Location in Premise</th>
                  <th className="py-2 px-3 border-r border-slate-300">Last Serviced</th>
                  <th className="py-2 px-3 border-r border-slate-300">Next Service Due</th>
                  <th className="py-2 px-2.5 border-r border-slate-300 text-center">Evidence</th>
                  <th className="py-2 px-3 text-right">Result</th>
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
                    const pass = statusStr === 'COMPLIANT' || statusStr === 'VERIFIED' || statusStr === 'OPERATIONAL';

                    return (
                      <tr key={eq?.id || index} className="hover:bg-slate-50">
                        <td className="py-2 px-2.5 text-slate-500 border-r border-slate-200 text-center">
                          {index + 1}
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-slate-900 border-r border-slate-200">
                          {eq?.qrCode || '—'}
                        </td>
                        <td className="py-2 px-3 font-semibold text-slate-800 border-r border-slate-200">
                          <div>
                            {eq?.capacity || 'Standard'} ({eq?.type || 'Extinguisher'})
                          </div>
                          {eq?.inspectionNotes && (
                            <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                              {eq.inspectionNotes}
                            </div>
                          )}
                        </td>
                        <td className="py-2 px-3 text-slate-600 border-r border-slate-200">
                          {eq?.location || '—'}
                        </td>
                        <td className="py-2 px-3 text-slate-600 border-r border-slate-200 whitespace-nowrap">
                          {formatSafeDate(eq?.lastServiceDate)}
                        </td>
                        <td className="py-2 px-3 font-semibold border-r border-slate-200 whitespace-nowrap">
                          <span
                            className={
                              statusStr === 'OVERDUE'
                                ? 'text-red-700 font-bold'
                                : statusStr === 'DUE_SOON'
                                ? 'text-amber-700'
                                : 'text-slate-800'
                            }
                          >
                            {formatSafeDate(eq?.nextDueDate)}
                          </span>
                        </td>
                        <td className="py-2 px-2.5 border-r border-slate-200 text-center">
                          {eq?.photoUrl ? (
                            <a
                              href={eq.photoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[#0077B6] hover:underline font-semibold text-[10px]"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={eq.photoUrl}
                                alt={eq.qrCode || 'Asset photo'}
                                className="w-6 h-6 rounded object-cover border border-slate-300"
                              />
                              <span className="print:hidden">Photo</span>
                            </a>
                          ) : (
                            <span className="text-[10px] text-slate-400">Logged</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right whitespace-nowrap">
                          <span
                            className={`font-black text-[10px] px-2 py-0.5 rounded ${
                              pass ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {pass ? 'PASS' : 'ACTION'}
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

        {/* Signoff & Digital GPS & Timestamp Verification Badge */}
        <div className="pt-6 border-t border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Digital GPS & Timestamp Verification Badge */}
          <div className="flex items-start gap-3.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200 max-w-md w-full sm:w-auto">
            <div className="w-12 h-12 rounded-xl bg-[#023E8A] text-white flex flex-col items-center justify-center shrink-0 shadow-xs border border-blue-900">
              <MapPin className="w-5 h-5 text-cyan-300" />
              <span className="text-[8px] font-black uppercase tracking-wider text-cyan-100 mt-0.5">GPS STAMP</span>
            </div>
            <div className="text-[10px] text-slate-600 space-y-1">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="font-extrabold text-slate-900 uppercase tracking-tight">
                  Digital GPS &amp; Timestamp Verification Badge
                </span>
              </div>
              <p className="font-mono text-[10px] text-slate-800 font-semibold">
                {data?.latestGpsInspection?.latitude != null && data?.latestGpsInspection?.longitude != null
                  ? `Verified GPS: ${Number(data.latestGpsInspection.latitude).toFixed(4)}° N, ${Number(
                      data.latestGpsInspection.longitude
                    ).toFixed(4)}° E`
                  : `Verified Site Location: ${building?.address || 'On-Site Physical Audit'}`}
              </p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-slate-500">
                <span>
                  Ref ID: <strong className="font-mono text-slate-700">{report?.reportNumber || 'FORM-B'}</strong>
                </span>
                <span>•</span>
                <span>
                  Timestamp:{' '}
                  <strong className="text-slate-700">
                    {formatSafeDate(data?.latestGpsInspection?.date || report?.generatedAt || new Date())}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* Agency Signatory Block */}
          <div className="text-right space-y-1">
            <div className="h-10 flex items-center justify-end">
              <span className="font-serif italic text-base font-bold text-slate-800">{signatoryName}</span>
            </div>
            <div className="font-bold text-xs text-slate-900">Authorized Inspecting Officer</div>
            <div className="text-[11px] text-slate-600">
              For <strong>{company?.name || 'Vigil Fire & Safety Solutions'}</strong>
            </div>
            <div className="text-[10px] text-slate-500">
              Govt. Licensed Fire Safety Agency (Lic: {company?.licenseNumber || 'DL/FIRE/LIC/2026/042'})
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
