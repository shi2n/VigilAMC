'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CheckCircle2, Smartphone, LayoutDashboard, Building2 } from 'lucide-react';
import { AppleReveal } from './AppleReveal';
import { LightBrowserFrame, LightPhoneFrame } from './DeviceFrames';

export function TrioOverviewSection() {
  return (
    <section
      id="products"
      aria-labelledby="trio-heading"
      className="py-16 sm:py-24 lg:py-28 bg-white border-t border-[#E7E5E4]"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <AppleReveal className="text-center max-w-[700px] mx-auto mb-12 sm:mb-16">
          <p className="text-xs sm:text-[13px] font-bold uppercase tracking-[0.12em] text-[#C2410C] mb-3">
            The complete suite
          </p>
          <h2
            id="trio-heading"
            className="font-sans font-bold text-[32px] sm:text-[42px] lg:text-[48px] leading-[1.1] tracking-[-0.03em] text-[#1C1917]"
          >
            Three products. One platform.
          </h2>
          <p className="mt-4 text-[17px] sm:text-[18px] text-[#44403C] max-w-[580px] mx-auto leading-relaxed">
            Your field technicians, office coordinators, and building clients all work from the same live compliance record.
          </p>
          <div className="mt-4">
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#C2410C] hover:text-[#9A3412] underline underline-offset-4"
            >
              <span>Explore all products</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </AppleReveal>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-7">
          {/* Card 1: Technician App */}
          <AppleReveal delayMs={0}>
            <a
              href="#technician-app"
              data-testid="trio-card-technician"
              className="group h-full rounded-3xl bg-[#FFF8F2] border border-[#FED7AA]/80 p-6 sm:p-7 flex flex-col hover:-translate-y-0.5 hover:border-[#EA580C]/50 shadow-[0_16px_40px_-24px_rgba(28,25,23,0.14)] transition-all duration-200"
            >
              <div>
                <div className="mb-6 flex justify-center bg-white rounded-2xl p-5 border border-[#FED7AA]/60">
                  <div className="w-[140px]">
                    <LightPhoneFrame>
                      <div className="relative aspect-[9/19] w-full bg-[#FFF8F2]">
                        <Image
                          src="/screenshots/tech-home.png"
                          alt="VigilAMC Technician App mobile interface"
                          fill
                          sizes="140px"
                          className="object-cover object-top"
                        />
                      </div>
                    </LightPhoneFrame>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#C2410C] mb-2">
                  <Smartphone className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>01 · Field Team</span>
                </div>
                <h3 className="font-sans font-bold text-2xl text-[#1C1917] tracking-tight">
                  Technician App
                </h3>
                <p className="mt-2 text-[15px] text-[#44403C] leading-relaxed">
                  Offline-first Android app built for basements, shafts, and industrial sites.
                </p>

                <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[#C2410C] group-hover:translate-x-1 transition-transform">
                  <span>See the Technician App</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </div>

                <ul className="mt-5 pt-4 border-t border-[#FED7AA]/60 space-y-2 text-[14px] text-[#1C1917]">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" aria-hidden="true" />
                    <span>Works offline with auto-sync outbox</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" aria-hidden="true" />
                    <span>GPS-stamped camera photo proof</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" aria-hidden="true" />
                    <span>10 Indian languages + voice remarks</span>
                  </li>
                </ul>
              </div>
            </a>
          </AppleReveal>

          {/* Card 2: Admin Dashboard */}
          <AppleReveal delayMs={70}>
            <a
              href="#admin-dashboard"
              data-testid="trio-card-dashboard"
              className="group h-full rounded-3xl bg-[#FFF8F2] border border-[#FED7AA]/80 p-6 sm:p-7 flex flex-col hover:-translate-y-0.5 hover:border-[#EA580C]/50 shadow-[0_16px_40px_-24px_rgba(28,25,23,0.14)] transition-all duration-200"
            >
              <div>
                <div className="mb-6 bg-white rounded-2xl p-4 border border-[#FED7AA]/60 flex items-center justify-center min-h-[270px]">
                  <LightBrowserFrame url="app.vigilamc.com/dashboard" className="w-full">
                    <div className="relative aspect-[16/10] w-full bg-[#FFF8F2]">
                      <Image
                        src="/screenshots/dashboard-fire-1440x900.png"
                        alt="VigilAMC Admin Dashboard browser interface"
                        fill
                        sizes="(min-width: 1024px) 340px, 90vw"
                        className="object-cover object-top"
                      />
                    </div>
                  </LightBrowserFrame>
                </div>

                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#C2410C] mb-2">
                  <LayoutDashboard className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>02 · Office Desk</span>
                </div>
                <h3 className="font-sans font-bold text-2xl text-[#1C1917] tracking-tight">
                  Admin Dashboard
                </h3>
                <p className="mt-2 text-[15px] text-[#44403C] leading-relaxed">
                  Command centre for AMC cycles, equipment, repairs, teams, and Form B.
                </p>

                <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[#C2410C] group-hover:translate-x-1 transition-transform">
                  <span>See the Admin Dashboard</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </div>

                <ul className="mt-5 pt-4 border-t border-[#FED7AA]/60 space-y-2 text-[14px] text-[#1C1917]">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" aria-hidden="true" />
                    <span>Auto AMC cycles &amp; Run scheduling now</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" aria-hidden="true" />
                    <span>Excel bulk import for whole registers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" aria-hidden="true" />
                    <span>5-page white-label Form B PDFs</span>
                  </li>
                </ul>
              </div>
            </a>
          </AppleReveal>

          {/* Card 3: Client Portal */}
          <AppleReveal delayMs={140}>
            <a
              href="#client-portal"
              data-testid="trio-card-portal"
              className="group h-full rounded-3xl bg-[#FFF8F2] border border-[#FED7AA]/80 p-6 sm:p-7 flex flex-col hover:-translate-y-0.5 hover:border-[#EA580C]/50 shadow-[0_16px_40px_-24px_rgba(28,25,23,0.14)] transition-all duration-200"
            >
              <div>
                <div className="mb-6 bg-white rounded-2xl p-4 border border-[#FED7AA]/60 flex items-center justify-center min-h-[270px]">
                  <LightBrowserFrame url="portal.vigilamc.com" className="w-full">
                    <div className="aspect-[16/10] w-full bg-[#FFF8F2] p-3.5 flex flex-col justify-between text-left">
                      <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#FED7AA]/70">
                        <div>
                          <div className="text-[11px] font-bold text-[#1C1917]">Horizon IT Park</div>
                          <div className="text-[10px] text-[#44403C]">Client Compliance Portal</div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-[#D1FAE5] text-[#065F46] text-[10px] font-bold">
                          98% OK
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 my-2">
                        <div className="rounded-lg bg-white p-2 border border-[#059669]/40">
                          <div className="text-[10px] font-semibold text-[#44403C]">OK</div>
                          <div className="text-xs font-bold text-[#047857]">142</div>
                        </div>
                        <div className="rounded-lg bg-white p-2 border border-[#D97706]/40">
                          <div className="text-[10px] font-semibold text-[#44403C]">Due</div>
                          <div className="text-xs font-bold text-[#B45309]">4</div>
                        </div>
                        <div className="rounded-lg bg-white p-2 border border-[#DC2626]/40">
                          <div className="text-[10px] font-semibold text-[#44403C]">Expired</div>
                          <div className="text-xs font-bold text-[#B91C1C]">0</div>
                        </div>
                      </div>
                      <div className="rounded-lg bg-white px-2.5 py-2 border border-[#E7E5E4] flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-[#1C1917]">Form B · Q3 Report</span>
                        <span className="text-[10px] font-bold text-[#C2410C]">Receipt Signed</span>
                      </div>
                    </div>
                  </LightBrowserFrame>
                </div>

                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#C2410C] mb-2">
                  <Building2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>03 · Building Clients</span>
                </div>
                <h3 className="font-sans font-bold text-2xl text-[#1C1917] tracking-tight">
                  Client Portal
                </h3>
                <p className="mt-2 text-[15px] text-[#44403C] leading-relaxed">
                  A shared login where society committees and facility heads check status and download reports themselves.
                </p>

                <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[#C2410C] group-hover:translate-x-1 transition-transform">
                  <span>See the Client Portal</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </div>

                <ul className="mt-5 pt-4 border-t border-[#FED7AA]/60 space-y-2 text-[14px] text-[#1C1917]">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" aria-hidden="true" />
                    <span>Live building compliance status</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" aria-hidden="true" />
                    <span>Verified Form B delivery receipts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" aria-hidden="true" />
                    <span>White-labelled under your agency</span>
                  </li>
                </ul>
              </div>
            </a>
          </AppleReveal>
        </div>
      </div>
    </section>
  );
}

export default TrioOverviewSection;
