'use client';

import React from 'react';
import Link from 'next/link';
import { Building2, CheckCircle2, FileCheck2, ArrowRight, ShieldCheck, MailCheck } from 'lucide-react';
import { AppleReveal } from './AppleReveal';
import { LightBrowserFrame } from './DeviceFrames';

export function ClientPortalSection({ showDemoCta = false }: { showDemoCta?: boolean }) {
  return (
    <section
      id="client-portal"
      aria-labelledby="client-portal-heading"
      className="py-20 sm:py-28 bg-[#FFF8F2] border-t border-[#FED7AA]/70"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Copy */}
          <AppleReveal className="lg:col-span-5 space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#FED7AA] text-xs font-bold text-[#C2410C]">
              <Building2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Client Portal</span>
            </div>

            <h2
              id="client-portal-heading"
              className="font-sans font-bold text-[32px] sm:text-[42px] lg:text-[44px] leading-[1.1] tracking-[-0.03em] text-[#1C1917]"
            >
              Your clients see you as the most professional agency in town.
            </h2>

            <p className="text-[17px] text-[#44403C] leading-relaxed">
              Clients log in and see their buildings&apos; live compliance status, verified assets, and Form B receipts — no more digging through lost WhatsApp PDFs.
            </p>

            <ul className="space-y-3 pt-1 text-[15px] text-[#1C1917]">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#047857] shrink-0 mt-1" aria-hidden="true" />
                <span>
                  <strong>Invite clients in one click</strong> — passwordless magic-link login for RWA secretaries &amp; facility heads
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#047857] shrink-0 mt-1" aria-hidden="true" />
                <span>
                  <strong>Form B delivery receipts</strong> — timestamped client acknowledgment when reports are received
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#047857] shrink-0 mt-1" aria-hidden="true" />
                <span>
                  <strong>White-label experience</strong> — branded with your agency name, logo, and contact details
                </span>
              </li>
            </ul>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              {showDemoCta && (
                <Link
                  href="/contact"
                  className="btn-flame min-h-[48px] px-7 py-3 rounded-2xl text-white font-bold text-[15px] inline-flex items-center justify-center gap-2 shadow-[0_12px_28px_-8px_rgba(194,65,12,0.45)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EA580C]"
                >
                  <span>Book a Free Demo</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              )}
              <Link
                href="/portal/login"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#C2410C] hover:text-[#9A3412] underline underline-offset-4"
              >
                <span>See Client Portal login</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </AppleReveal>

          {/* Right Portal Visual */}
          <AppleReveal delayMs={80} className="lg:col-span-7">
            <LightBrowserFrame url="vigilamc.com/portal · Client Compliance View">
              <div className="p-5 sm:p-7 bg-[#FFFDFB] space-y-5">
                {/* Portal Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E7E5E4]">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-[#FFF0E6] border border-[#FED7AA] flex items-center justify-center text-[#C2410C]">
                      <ShieldCheck className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <div>
                      <div className="text-sm font-bold text-[#1C1917]">Grandview Residency RWA</div>
                      <div className="text-xs text-[#44403C]">Managed by Your Fire Safety Agency</div>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#D1FAE5] text-[#065F46] border border-[#059669]/30 text-xs font-bold">
                    Audit-Ready · 98% Verified
                  </span>
                </div>

                {/* Building Compliance Rows */}
                <div className="space-y-3">
                  <div className="rounded-2xl bg-white border border-[#E7E5E4] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-bold text-[#1C1917]">Tower A &amp; B — Main Complex</div>
                      <div className="text-xs text-[#44403C] mt-0.5">
                        96 verified assets · Last inspection GPS-logged on site
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2.5 py-1 rounded-lg bg-[#D1FAE5] text-[#065F46] text-[11px] font-bold">
                        94 OK
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-[#FEF3C7] text-[#92400E] text-[11px] font-bold">
                        2 Due Soon
                      </span>
                    </div>
                  </div>

                  {/* Form B Delivery Receipt Row */}
                  <div className="rounded-2xl bg-[#FFF8F2] border border-[#FED7AA] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="w-9 h-9 rounded-xl bg-white border border-[#FED7AA] flex items-center justify-center text-[#C2410C] shrink-0">
                        <FileCheck2 className="w-4 h-4" aria-hidden="true" />
                      </span>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-[#1C1917]">
                          Form B Certificate · Ref #FORM-B/2026
                        </div>
                        <div className="text-xs text-[#44403C] mt-0.5 flex items-center gap-1.5">
                          <MailCheck className="w-3.5 h-3.5 text-[#047857]" aria-hidden="true" />
                          <span>Delivered &amp; receipt acknowledged by Facility Manager</span>
                        </div>
                      </div>
                    </div>
                    <span className="px-3 py-1.5 rounded-lg bg-[#C2410C] text-white text-xs font-bold shrink-0 text-center">
                      Download 5-Page PDF
                    </span>
                  </div>
                </div>
              </div>
            </LightBrowserFrame>
          </AppleReveal>
        </div>
      </div>
    </section>
  );
}

export default ClientPortalSection;
