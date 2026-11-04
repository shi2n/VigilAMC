'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Building2,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  LogOut,
  Calendar,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  Flame,
  Check,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { getPortalDictionary } from '@/lib/i18n/portal';

export default function ClientPortalPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [expandedBuildingId, setExpandedBuildingId] = useState<string | null>(null);
  const [acknowledgingRef, setAcknowledgingRef] = useState<string | null>(null);
  const [lang, setLang] = useState<'en' | 'hi'>('en');

  const dict = getPortalDictionary(lang);

  const loadData = async () => {
    try {
      const res = await fetch('/api/portal/bootstrap');
      if (res.status === 401) {
        router.push('/portal/login');
        return;
      }
      if (!res.ok) {
        throw new Error('Failed to load portal data');
      }
      const json = await res.json();
      setData(json);
      if (json.buildings?.length > 0 && !expandedBuildingId) {
        setExpandedBuildingId(json.buildings[0].id);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error connecting to portal');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSignOut = async () => {
    try {
      await fetch('/api/portal/auth/logout', { method: 'POST' });
    } finally {
      router.push('/portal/login');
    }
  };

  const handleAcknowledge = async (buildingId: string, reportRef: string) => {
    setAcknowledgingRef(reportRef);
    try {
      const res = await fetch('/api/portal/acknowledge-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buildingId, reportRef }),
      });
      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Failed to acknowledge receipt');
      }
      // Refresh data
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Error recording receipt');
    } finally {
      setAcknowledgingRef(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF8F2] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#EA580C]" />
          <p className="text-sm font-semibold text-[#1C1917]">Loading Client Portal...</p>
        </div>
      </div>
    );
  }

  if (errorMsg || !data) {
    return (
      <div className="min-h-screen bg-[#FFF8F2] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-6 rounded-2xl border border-[#FFE4D6] shadow-xl text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-[#DC2626] mx-auto" />
          <h2 className="text-lg font-bold text-[#1C1917]">Portal Access Issue</h2>
          <p className="text-sm text-[#44403C]">{errorMsg || 'Unable to open your client portal.'}</p>
          <button
            onClick={() => router.push('/portal/login')}
            className="px-4 py-2 bg-[#EA580C] text-white rounded-xl text-sm font-semibold"
          >
            Return to Sign-In
          </button>
        </div>
      </div>
    );
  }

  const { portalUser, client, agency, portfolio, buildings } = data;

  return (
    <div className="min-h-screen bg-[#FFF8F2] text-[#1C1917] flex flex-col selection:bg-orange-100 selection:text-orange-900">
      {/* Top White-Label Bar */}
      <header
        data-testid="portal-header"
        className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-[#F0E4D8] px-4 sm:px-8 py-3.5 shadow-sm"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Agency White-Label Branding */}
          <div className="flex items-center gap-3">
            {agency.brandLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={agency.brandLogoUrl}
                alt={`${agency.name} Logo`}
                width={40}
                height={40}
                data-testid="portal-agency-logo"
                className="w-10 h-10 object-contain rounded-lg border border-[#F0E4D8] bg-white p-0.5 shadow-sm"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-orange-100 text-[#EA580C] flex items-center justify-center font-bold text-base border border-orange-200">
                {agency.name?.charAt(0) || 'V'}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-bold text-[#1C1917] tracking-tight">{agency.name}</span>
                <span className="px-2 py-0.5 bg-orange-50 border border-orange-200 text-[#EA580C] text-[10px] font-bold rounded-full uppercase tracking-wider">
                  Verified Servicing Agency
                </span>
              </div>
              <p className="text-xs text-[#78716C]">{dict.portalSubtitle}</p>
            </div>
          </div>

          {/* User Badge & Language Toggle */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-[#FFF8F2] p-1 rounded-lg border border-[#FFE4D6]">
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-2 py-0.5 text-xs font-semibold rounded ${
                  lang === 'en' ? 'bg-[#EA580C] text-white' : 'text-[#44403C] hover:text-[#1C1917]'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang('hi')}
                className={`px-2 py-0.5 text-xs font-semibold rounded ${
                  lang === 'hi' ? 'bg-[#EA580C] text-white' : 'text-[#44403C] hover:text-[#1C1917]'
                }`}
              >
                हिन्दी
              </button>
            </div>

            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-bold text-[#1C1917]">{portalUser.name}</span>
              <span className="text-[11px] text-[#78716C]">{client.name}</span>
            </div>

            <button
              onClick={handleSignOut}
              title={dict.signOutBtn}
              className="p-2 rounded-xl text-[#78716C] hover:text-[#DC2626] hover:bg-red-50 border border-[#F0E4D8] transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-6">
        {/* Welcome Client Banner */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/70 shadow-sm space-y-2 bg-gradient-to-r from-white/90 via-orange-50/40 to-white/90">
          <span className="text-xs font-bold uppercase tracking-wider text-[#EA580C]">
            Client Organization
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C1917] tracking-tight">
            {client.name}
          </h1>
          <p className="text-sm text-[#44403C] max-w-3xl leading-relaxed">
            Welcome to your certified fire safety and statutory compliance dashboard. Here you can verify on-site inspection certificates, audit equipment readiness, download official Form-B reports, and sign digital delivery receipts.
          </p>
        </div>

        {/* Portfolio Summary Strip */}
        <div data-testid="portal-portfolio-strip" className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#F0E4D8] shadow-sm space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#78716C] flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#EA580C]" /> {dict.portfolioBuildings}
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#1C1917]">
              {portfolio.buildingCount}
            </div>
            <span className="text-[11px] text-[#78716C]">Active client sites</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#F0E4D8] shadow-sm space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#78716C] flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-[#EA580C]" /> {dict.portfolioAssets}
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#1C1917]">
              {portfolio.totalAssets}
            </div>
            <span className="text-[11px] text-[#78716C]">Extinguishers, hydrants & panels</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#F0E4D8] shadow-sm space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#78716C] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#059669]" /> {dict.portfolioCompliance}
            </span>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#059669]">
                {portfolio.compliancePercent}%
              </div>
              <span className="text-xs text-[#059669] font-semibold">Ready</span>
            </div>
            <div className="w-full bg-[#E5E7EB] rounded-full h-1.5 mt-1 overflow-hidden">
              <div
                className="bg-[#059669] h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${portfolio.compliancePercent}%` }}
              />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#F0E4D8] shadow-sm space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#78716C] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#D97706]" /> {dict.portfolioExpiring}
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#1C1917]">
              {portfolio.expiring30dCount}
            </div>
            <span className="text-[11px] text-[#78716C]">
              {portfolio.overdueAssets > 0 ? (
                <span className="text-[#DC2626] font-semibold">{portfolio.overdueAssets} overdue</span>
              ) : (
                'All renewals on track'
              )}
            </span>
          </div>
        </div>

        {/* Buildings and Approved Inspection Records */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#1C1917] tracking-tight">{dict.buildingsListTitle}</h2>
            <span className="text-xs text-[#78716C]">{buildings.length} sites monitored</span>
          </div>

          {buildings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#F0E4D8] p-8 text-center space-y-3">
              <Building2 className="w-10 h-10 text-[#78716C] mx-auto opacity-40" />
              <h3 className="text-sm font-bold text-[#1C1917]">{dict.emptyInspections}</h3>
              <p className="text-xs text-[#44403C] max-w-md mx-auto">{dict.contactAgencyPrompt}</p>
              <div className="pt-2 flex justify-center gap-4 text-xs font-medium text-[#EA580C]">
                {agency.phone && (
                  <a href={`tel:${agency.phone}`} className="flex items-center gap-1 hover:underline">
                    <Phone className="w-3.5 h-3.5" /> {agency.phone}
                  </a>
                )}
                {agency.email && (
                  <a href={`mailto:${agency.email}`} className="flex items-center gap-1 hover:underline">
                    <Mail className="w-3.5 h-3.5" /> {agency.email}
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {buildings.map((b: any) => {
                const isExpanded = expandedBuildingId === b.id;
                const latestDate = b.lastApprovedInspectionDate
                  ? new Date(b.lastApprovedInspectionDate).toLocaleDateString('en-IN')
                  : 'Pending First Inspection';

                const reportRef = `REPORT-${b.id}`;
                const ack = (b.reportAcks || []).find((a: any) => a.reportRef === reportRef);

                return (
                  <div
                    key={b.id}
                    className="bg-white rounded-2xl border border-[#F0E4D8] shadow-sm overflow-hidden transition-all"
                  >
                    {/* Building Summary Header */}
                    <div
                      onClick={() => setExpandedBuildingId(isExpanded ? null : b.id)}
                      className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-orange-50/20 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <h3 className="text-base font-bold text-[#1C1917] tracking-tight">{b.name}</h3>
                          <span
                            className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                              b.status === 'OK'
                                ? 'bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]'
                                : b.status === 'DUE_SOON'
                                ? 'bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A]'
                                : 'bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]'
                            }`}
                          >
                            {b.status === 'OK'
                              ? dict.statusOk
                              : b.status === 'DUE_SOON'
                              ? dict.statusDueSoon
                              : dict.statusOverdue}
                          </span>
                        </div>
                        <p className="text-xs text-[#44403C]">
                          {b.address}{b.city ? `, ${b.city}` : ''} · Cycle: <strong className="font-semibold text-[#1C1917]">{b.complianceCycle}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-4 sm:gap-6 text-xs text-[#78716C]">
                        <div>
                          <span className="block text-[10px] font-bold uppercase text-[#78716C] tracking-wider">
                            {dict.colLastInspection}
                          </span>
                          <span className="font-medium text-[#1C1917]">{latestDate}</span>
                        </div>

                        <div>
                          <span className="block text-[10px] font-bold uppercase text-[#78716C] tracking-wider">
                            Assets
                          </span>
                          <span className="font-medium text-[#1C1917]">{b.assetCount} units</span>
                        </div>

                        <button
                          type="button"
                          aria-label={isExpanded ? 'Collapse' : 'Expand'}
                          className="p-1 rounded-lg hover:bg-gray-100 text-[#44403C]"
                        >
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Section: Inspections History & Report Action */}
                    {isExpanded && (
                      <div className="border-t border-[#F0E4D8] bg-[#FFFBF8] p-5 sm:p-6 space-y-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F0E4D8]">
                          <div>
                            <h4 className="text-sm font-bold text-[#1C1917]">{dict.inspectionsHistoryTitle}</h4>
                            <p className="text-xs text-[#78716C]">
                              Showing only auditor-approved field inspections and certified reports.
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {/* View / Download Report Button */}
                            <Link
                              href={`/report/${b.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3.5 py-2 bg-white hover:bg-orange-50 border border-[#FFE4D6] text-[#EA580C] text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>{dict.btnViewReport}</span>
                              <ExternalLink className="w-3 h-3 text-[#78716C]" />
                            </Link>

                            {/* Acknowledge Receipt Button */}
                            {ack ? (
                              <div
                                data-testid={`portal-ack-badge-${b.id}`}
                                className="px-3 py-1.5 bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] text-xs font-semibold rounded-xl flex items-center gap-1.5"
                              >
                                <Check className="w-3.5 h-3.5 text-[#059669]" />
                                <span>
                                  {dict.badgeAcknowledged} · {ack.portalUser?.name || portalUser.name} ·{' '}
                                  {new Date(ack.acknowledgedAt).toLocaleDateString('en-IN')}
                                </span>
                              </div>
                            ) : (
                              <button
                                type="button"
                                data-testid={`portal-ack-btn-${b.id}`}
                                disabled={acknowledgingRef === reportRef}
                                onClick={() => handleAcknowledge(b.id, reportRef)}
                                className="px-3.5 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold rounded-xl shadow-sm shadow-orange-500/20 flex items-center gap-1.5 transition-colors disabled:opacity-60"
                              >
                                {acknowledgingRef === reportRef ? (
                                  <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                                    <span>{dict.acknowledging}</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>{dict.btnAcknowledge}</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Inspections Table */}
                        {b.inspections?.length === 0 ? (
                          <p className="text-xs text-[#78716C] italic py-2">{dict.emptyInspections}</p>
                        ) : (
                          <div className="overflow-x-auto rounded-xl border border-[#F0E4D8] bg-white">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="bg-[#FFF8F2] border-b border-[#F0E4D8] text-[#44403C] font-bold uppercase tracking-wider text-[11px]">
                                  <th className="py-2.5 px-3.5">{dict.colDate}</th>
                                  <th className="py-2.5 px-3.5">{dict.colTech}</th>
                                  <th className="py-2.5 px-3.5">{dict.colGauge}</th>
                                  <th className="py-2.5 px-3.5">{dict.colStatus}</th>
                                  <th className="py-2.5 px-3.5">{dict.colSummary}</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#F0E4D8]">
                                {b.inspections.map((insp: any) => (
                                  <tr key={insp.id} className="hover:bg-orange-50/20 transition-colors">
                                    <td className="py-2.5 px-3.5 font-semibold text-[#1C1917] whitespace-nowrap">
                                      {new Date(insp.date).toLocaleDateString('en-IN', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                      })}
                                    </td>
                                    <td className="py-2.5 px-3.5 text-[#44403C]">{insp.technicianName}</td>
                                    <td className="py-2.5 px-3.5 text-[#44403C]">
                                      <span
                                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                          insp.pressureGauge === 'LOW'
                                            ? 'bg-amber-100 text-amber-800'
                                            : 'bg-emerald-100 text-emerald-800'
                                        }`}
                                      >
                                        {insp.pressureGauge || 'NORMAL'}
                                      </span>
                                    </td>
                                    <td className="py-2.5 px-3.5">
                                      <span
                                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                          insp.status === 'PASSED'
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                            : 'bg-red-50 text-red-700 border border-red-200'
                                        }`}
                                      >
                                        {insp.status}
                                      </span>
                                    </td>
                                    <td className="py-2.5 px-3.5 text-[#44403C] max-w-xs truncate">
                                      {insp.remarks || insp.overallCondition || 'Compliant with IS 2190 standards'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
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

        {/* Servicing Agency Contact Card */}
        <div className="bg-white p-6 rounded-2xl border border-[#F0E4D8] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#EA580C]">
              Authorized Servicing Agency
            </span>
            <h4 className="text-base font-bold text-[#1C1917]">{agency.name}</h4>
            <p className="text-xs text-[#78716C]">
              {agency.address || 'Fire Safety & NBC AMC Services'}
              {agency.signatoryName ? ` · Lead Auditor: ${agency.signatoryName}` : ''}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
            {agency.phone && (
              <a
                href={`tel:${agency.phone}`}
                className="px-3.5 py-2 rounded-xl bg-[#FFF8F2] border border-[#FFE4D6] text-[#EA580C] hover:bg-orange-100 transition-colors flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{agency.phone}</span>
              </a>
            )}
            {agency.email && (
              <a
                href={`mailto:${agency.email}`}
                className="px-3.5 py-2 rounded-xl bg-[#EA580C] text-white hover:bg-[#C2410C] transition-colors flex items-center gap-1.5 shadow-sm shadow-orange-500/20"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email Agency</span>
              </a>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#F0E4D8] bg-white py-4 px-4 text-center text-xs text-[#78716C]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>{dict.footerLogged}</span>
          <Link href="/privacy" className="hover:text-[#EA580C] underline transition-colors">
            Privacy Policy
          </Link>
        </div>
      </footer>
    </div>
  );
}
