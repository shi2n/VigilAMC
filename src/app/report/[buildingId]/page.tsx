'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import QRCode from 'qrcode';
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
  Camera,
  SlidersHorizontal,
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
  const buildingId = (params?.buildingId as string) || '';

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState('');

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

      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://vigilamc.vercel.app';
      const qr = await QRCode.toDataURL(`${origin}/report/${buildingId}`, {
        width: 130,
        margin: 1,
        color: { dark: '#000000', light: '#ffffff' },
      });
      setQrDataUrl(qr);
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

  const handlePrint = () => {
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
      data?.summary?.overallStatus === 'COMPLIANT' || data?.summary?.overallStatus === 'VERIFIED';

    const message = [
      `*Form-B Fire Safety Compliance Report — ${bldgName}*`,
      ``,
      `• *Audit Status:* ${isOk ? 'FULLY COMPLIANT' : 'ACTION REQUIRED'} (${compCount}/${totalCount} Assets Operational)`,
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
      data?.summary?.overallStatus === 'COMPLIANT' || data?.summary?.overallStatus === 'VERIFIED';

    try {
      await navigator.clipboard.writeText(url);
    } catch {}

    const subject = `Form-B Fire Safety Compliance Certificate — ${bldgName} (${data?.report?.reportNumber || 'Official Audit'})`;
    const body = [
      `Dear ${data?.building?.client?.contactPerson || data?.building?.client?.name || 'Facility Manager'},`,
      ``,
      `Please find below the official Form-B Fire Safety Equipment Compliance Inspection Report for ${bldgName}.`,
      ``,
      `Summary:`,
      `- Facility: ${bldgName} (${data?.building?.address || ''})`,
      `- Audit Status: ${isOk ? 'Fully Compliant' : 'Action Needed'} (${compCount} / ${totalCount} Operational)`,
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
      <div className="flex-1 p-8 flex items-center justify-center min-h-[70vh] bg-[#080d1a]">
        <div className="flex flex-col items-center gap-3 text-slate-300">
          <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-sm font-bold">Generating client-ready Form-B compliance report...</p>
          <p className="text-xs text-slate-500">Compiling verified equipment schedule &amp; agency seal</p>
        </div>
      </div>
    );
  }

  if (error || !data || !data.building || !data.summary) {
    return (
      <div className="min-h-[75vh] bg-[#080d1a] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-4 shadow-xl text-white">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-extrabold">Unable to Load Compliance Report</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            {error || 'This building report could not be found or generated right now.'}
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <button
              onClick={fetchReport}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all"
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
  const signatoryName =
    data?.signatoryName || company?.signatoryName || company?.contactPerson || 'Authorized Inspecting Officer';

  const isCompliant =
    summary?.overallStatus === 'COMPLIANT' || summary?.overallStatus === 'VERIFIED';

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-5 text-slate-100">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="no-print fixed bottom-5 right-5 z-50 bg-slate-900 border border-emerald-500/40 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Controls & Direct Client Delivery Bar (Hidden in Print) */}
      <div className="no-print bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-amber-400 font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Compliance Dashboard</span>
          </Link>

          {/* Direct Client Share & Print Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
              title="Send Form-B Report directly to Client on WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Send via WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handleSendEmail}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
              title="Email Form-B Report link to Client"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Send via Email</span>
            </button>

            <button
              type="button"
              onClick={handleCopyClientLink}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-all cursor-pointer"
              title="Copy 1-click public report link for client"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Link Copied!' : 'Copy Client Link'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowContactEditor((prev) => !prev)}
              className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-medium transition-all cursor-pointer"
              title="Customize recipient WhatsApp number or email"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Recipient</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
            >
              <Printer className="w-4 h-4 stroke-[2.5]" />
              <span>Print / Save Form-B PDF</span>
            </button>
          </div>
        </div>

        {/* Inline Recipient Phone / Email Editor */}
        {showContactEditor && (
          <div className="pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[11px] text-slate-400 font-semibold mb-1">
                Client WhatsApp / Mobile Number
              </label>
              <input
                type="text"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="e.g. +91 98200 45678"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 font-semibold mb-1">
                Client Email Address
              </label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="e.g. facility.manager@client.com"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Official Printable Compliance Document Layout */}
      <div className="bg-white border border-slate-300 rounded-2xl shadow-xl p-6 sm:p-10 lg:p-12 text-slate-900 print:border-none print:shadow-none print:p-0 print:m-0">
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

        {/* COMPLIANCE STATUS SUMMARY STAMP */}
        <div
          className={`p-4 rounded-xl border mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 ${
            isCompliant
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : 'bg-red-50 border-red-300 text-red-950'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-white shrink-0 ${
                isCompliant ? 'bg-emerald-600' : 'bg-red-600'
              }`}
            >
              {isCompliant ? <ShieldCheck className="w-7 h-7" /> : <AlertTriangle className="w-7 h-7" />}
            </div>
            <div>
              <div className="text-base font-black uppercase tracking-wide">
                {isCompliant ? 'Status: Fully Compliant' : 'Status: Action Needed'}
              </div>
              <p className="text-xs text-slate-700 mt-0.5">
                {isCompliant
                  ? 'All fire prevention and life safety equipment in this building has been serviced and is in proper working condition.'
                  : `${summary?.overdue ?? 0} equipment item(s) require mandatory refill/overhaul or initial inspection verification.`}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-xs font-bold uppercase text-slate-600">Audited Inventory</div>
            <div className="text-sm font-black text-slate-900">
              {summary?.compliant ?? 0} / {summary?.total ?? equipments.length} Operational
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
                    <td colSpan={8} className="py-6 text-center text-slate-500">
                      No fire safety equipment registered for this building yet.
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

        {/* Signoff & Municipal Authenticator */}
        <div className="pt-6 border-t border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Municipal Authenticator */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            {qrDataUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrDataUrl} alt="Report Verification" className="w-16 h-16 object-contain" />
            )}
            <div className="text-[10px] text-slate-500 space-y-0.5">
              <span className="font-bold text-slate-800 uppercase block">
                Equipment Schedule with Locations &amp; Photos
              </span>
              <p>Verified service records on VigilAMC compliance platform.</p>
              <p className="font-mono font-semibold text-slate-600">{report?.reportNumber || 'FORM-B'}</p>
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
