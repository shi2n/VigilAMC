'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ShieldCheck,
  ShieldAlert,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  Clock,
  ArrowRight,
  ExternalLink,
  Loader2,
  Sparkles,
  Search
} from 'lucide-react';

export default function PublicVerifyAssetPage() {
  const params = useParams();
  const rawTag = (params?.qrCode as string) || '';
  const assetTag = decodeURIComponent(rawTag);

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchRecord() {
      if (!assetTag) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await fetch(`/api/verify/${encodeURIComponent(assetTag)}`);
        if (!res.ok) {
          setNotFound(true);
        } else {
          const json = await res.json();
          setData(json);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    fetchRecord();
  }, [assetTag]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF8F2] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#EA580C]" />
          <p className="text-sm font-semibold text-[#1C1917]">Verifying Equipment Status...</p>
        </div>
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div
        className="min-h-screen bg-[#FFF8F2] flex items-center justify-center p-4"
        style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #FFF8F2 45%, #FFE8D6 100%)' }}
      >
        <div
          data-testid="verify-not-found-card"
          className="max-w-md w-full bg-white p-7 rounded-3xl border border-[#FFE4D6] shadow-xl text-center space-y-4"
        >
          <div className="w-12 h-12 bg-amber-50 text-[#D97706] rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[#1C1917]">Record Not Available</h2>
          <p className="text-xs sm:text-sm text-[#44403C] leading-relaxed">
            No active public compliance record is available for asset tag{' '}
            <strong className="font-mono text-[#1C1917]">{assetTag}</strong>.
          </p>
          <p className="text-[11px] text-[#78716C]">
            Publishing is controlled by the servicing agency. The record may be restricted, or the asset tag may have been entered incorrectly.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
            <Link
              href="/verify"
              className="px-4 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold rounded-xl transition-colors"
            >
              Search Another Tag
            </Link>
            <Link
              href="/"
              className="px-4 py-2.5 bg-white hover:bg-orange-50 border border-[#FED7AA] text-[#1C1917] text-xs font-bold rounded-xl transition-colors"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const {
    assetTag: tagId,
    type,
    capacity,
    buildingName,
    city,
    status,
    lastApprovedInspectionDate,
    nextServiceDue,
    agencyName,
    agencyLogoUrl,
    recordId,
    isDemo,
  } = data;

  const isOk = status === 'OK' || status === 'COMPLIANT' || status === 'VERIFIED';
  const isDueSoon = status === 'DUE_SOON';
  const isExpired = status === 'EXPIRED' || status === 'OVERDUE';

  const statusLabel = isOk ? 'VERIFIED · OK' : isDueSoon ? 'DUE SOON' : 'EXPIRED / OVERDUE';
  const statusColor = isOk
    ? 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]'
    : isDueSoon
    ? 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]'
    : 'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]';

  return (
    <div
      className="min-h-screen bg-[#FFF8F2] text-[#1C1917] flex flex-col selection:bg-orange-100 selection:text-orange-900"
      style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #FFF8F2 45%, #FFE8D6 100%)' }}
    >
      {/* Top Header */}
      <header className="border-b border-[#F0E4D8] bg-white/80 backdrop-blur-md px-4 sm:px-8 py-3.5 sticky top-0 z-30 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
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
              VigilAMC Verify
            </span>
          </Link>

          <Link
            href="/verify"
            className="text-xs font-bold text-[#EA580C] hover:underline flex items-center gap-1"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Lookup Another Tag</span>
          </Link>
        </div>
      </header>

      {/* Main Verification Card */}
      <main className="flex-1 max-w-xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">
        <div
          data-testid="public-verification-card"
          className="bg-white rounded-3xl p-6 sm:p-8 border border-[#F0E4D8] shadow-xl space-y-6"
        >
          {/* Servicing Agency Header */}
          <div className="flex items-center justify-between border-b border-[#F0E4D8] pb-4">
            <div className="flex items-center gap-3">
              {agencyLogoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={agencyLogoUrl}
                  alt={agencyName}
                  width={40}
                  height={40}
                  data-testid="verify-agency-logo"
                  className="w-10 h-10 object-contain rounded-lg border border-[#F0E4D8] bg-white p-0.5"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-orange-100 text-[#EA580C] flex items-center justify-center font-bold text-sm border border-orange-200">
                  {agencyName?.charAt(0) || 'V'}
                </div>
              )}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#EA580C] block">
                  Servicing Fire Agency
                </span>
                <h3 data-testid="verify-agency-name" className="text-sm font-bold text-[#1C1917]">
                  {agencyName}
                </h3>
              </div>
            </div>

            {isDemo && (
              <span className="px-2 py-0.5 bg-orange-100 text-[#EA580C] text-[10px] font-bold rounded-full border border-orange-200">
                Sample Demonstration
              </span>
            )}
          </div>

          {/* Primary Asset Headline */}
          <div className="space-y-2 text-center py-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#78716C] block">
              Asset Tag ID
            </span>
            <div data-testid="verify-asset-tag" className="text-3xl font-extrabold text-[#1C1917] font-mono tracking-tight">
              {tagId}
            </div>
            <div data-testid="verify-equipment-type" className="text-sm font-semibold text-[#44403C]">
              {type} · {capacity}
            </div>
          </div>

          {/* Status Chip (Computed from real due dates) */}
          <div className="flex justify-center">
            <div
              data-testid="verify-status-chip"
              className={`px-4 py-2 rounded-2xl border text-sm font-bold flex items-center gap-2 shadow-xs ${statusColor}`}
            >
              {isOk ? (
                <CheckCircle2 className="w-4 h-4 text-[#059669]" />
              ) : isDueSoon ? (
                <Clock className="w-4 h-4 text-[#D97706]" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-[#DC2626]" />
              )}
              <span>{statusLabel}</span>
            </div>
          </div>

          {/* Minimal Privacy-Guaranteed Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Building Name + City only */}
            <div className="p-3.5 bg-[#FFF8F2] border border-[#E7D6C7] rounded-2xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#78716C] flex items-center gap-1">
                <Building2 className="w-3 h-3 text-[#EA580C]" /> Facility / Site
              </span>
              <div data-testid="verify-building-name" className="text-xs font-bold text-[#1C1917]">
                {buildingName}
              </div>
              <span data-testid="verify-city" className="text-[11px] text-[#44403C] block font-medium">
                {city}
              </span>
            </div>

            {/* Last Approved Inspection */}
            <div className="p-3.5 bg-[#FFF8F2] border border-[#E7D6C7] rounded-2xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#78716C] flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#059669]" /> Last Certified Check
              </span>
              <div data-testid="verify-last-inspection" className="text-xs font-bold text-[#1C1917]">
                {lastApprovedInspectionDate
                  ? new Date(lastApprovedInspectionDate).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'Pending Inspection'}
              </div>
              <span className="text-[11px] text-[#059669] block font-medium">
                IS 2190 Auditor Approved
              </span>
            </div>

            {/* Next Service Due */}
            <div className="p-3.5 bg-[#FFF8F2] border border-[#E7D6C7] rounded-2xl space-y-1 sm:col-span-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#78716C] flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#EA580C]" /> Next Service / Hydro Due
              </span>
              <div data-testid="verify-next-due" className="text-xs font-bold text-[#1C1917]">
                {nextServiceDue
                  ? new Date(nextServiceDue).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })
                  : 'On regular maintenance cycle'}
              </div>
            </div>
          </div>

          {/* Record ID line */}
          <div className="text-center pt-2 border-t border-[#F0E4D8]">
            <p data-testid="verify-record-id" className="text-[11px] font-mono text-[#78716C]">
              Record ID: {recordId}
            </p>
          </div>

          {/* VigilAMC Platform CTA */}
          <div className="p-4 bg-orange-50/60 border border-orange-200 rounded-2xl text-center space-y-2">
            <span className="text-xs font-bold text-[#1C1917] block">
              This record is maintained on VigilAMC
            </span>
            <p className="text-[11px] text-[#44403C]">
              India&apos;s digital fire safety AMC operating infrastructure. Eliminate paper inspection cards with digital audit trails.
            </p>
            <div className="pt-1">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
              >
                <span>Agency Sign Up — Free Testing</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Mandatory Privacy Footer Note (H2) */}
          <div className="text-center text-[11px] text-[#78716C]">
            <span>Publishing controlled by the servicing agency. Detailed technical addresses and technician identities are protected.</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#F0E4D8] bg-white py-4 px-4 text-center text-xs text-[#78716C]">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>VigilAMC Public Safety Infrastructure</span>
          <Link href="/privacy" className="hover:text-[#EA580C] underline">
            Privacy Policy
          </Link>
        </div>
      </footer>
    </div>
  );
}
