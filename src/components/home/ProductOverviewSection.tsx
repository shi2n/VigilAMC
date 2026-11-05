'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { GooglePlayBadge } from '@/components/GooglePlayBadge';
import { AppStoreBadge } from '@/components/AppStoreBadge';
import {
  LayoutDashboard,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Calendar,
  Building2,
  FileSpreadsheet,
  FileCheck2,
  WifiOff,
  MapPin,
  Bell,
  Languages,
  Menu,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export function ProductOverviewSection() {
  return (
    <section
      id="platform-overview"
      data-testid="product-overview-section"
      className="relative py-16 sm:py-24 bg-[#FFF8F2] border-t border-[#FED7AA]/60 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#FED7AA] shadow-[0_2px_8px_rgba(234,88,12,0.08)] mb-4">
            <span className="w-2 h-2 rounded-full bg-[#EA580C]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#C2410C]">
              Complete Fire Safety Operations Suite
            </span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-[#1C1917] leading-tight">
            See the Whole Platform in Action
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#44403C] leading-relaxed">
            One connected operating system built specifically for Indian fire-safety AMC contractors — connecting your
            back-office management desk directly with field technicians and client facilities.
          </p>
        </div>

        {/* =================================================================== */}
        {/* PANEL 1: ADMIN DASHBOARD (Laptop Frame + Real Screenshot)          */}
        {/* =================================================================== */}
        <div
          data-testid="overview-admin-panel"
          className="mb-16 sm:mb-24 glass-panel rounded-3xl p-6 sm:p-10 lg:p-12 border border-[#FED7AA]/80 shadow-[0_24px_60px_-24px_rgba(28,25,23,0.14)]"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Callout Bullets */}
            <div className="lg:col-span-5 space-y-6 order-2 lg:order-1">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#FFF0E6] text-[#C2410C] font-bold text-xs uppercase tracking-wide border border-[#FED7AA]">
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Central Operations Control</span>
                </div>
                <h3 className="font-display font-bold text-2xl sm:text-3xl text-[#1C1917] tracking-tight mt-2.5">
                  Admin Dashboard Suite
                </h3>
                <p className="text-sm sm:text-base text-[#44403C] mt-2 leading-relaxed">
                  Everything agency owners and operations managers need to oversee thousands of fire assets, coordinate
                  teams, and verify statutory compliance across all client premises.
                </p>
              </div>

              {/* 6 Key Capabilities */}
              <div className="space-y-3.5 pt-1">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#FFF0E6] border border-[#FED7AA] flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-[#C2410C]" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#1C1917]">Live KPIs &amp; Compliance %</h4>
                    <p className="text-xs text-[#44403C] mt-0.5 leading-snug">
                      Real-time calculations across all facilities, buildings, and asset types with zero stale data.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#FFF0E6] border border-[#FED7AA] flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4 text-[#C2410C]" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#1C1917]">Inspection Approvals Queue</h4>
                    <p className="text-xs text-[#44403C] mt-0.5 leading-snug">
                      One-click review desk verifying technician GPS accuracy, inspection checklists, and live photo evidence.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#FFF0E6] border border-[#FED7AA] flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-4 h-4 text-[#C2410C]" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#1C1917]">Corrective Actions with Aging</h4>
                    <p className="text-xs text-[#44403C] mt-0.5 leading-snug">
                      Track open equipment defects from field discovery to workshop repairs, hydro-testing, and client signoff.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#FFF0E6] border border-[#FED7AA] flex items-center justify-center shrink-0 mt-0.5">
                    <Calendar className="w-4 h-4 text-[#C2410C]" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#1C1917]">Auto-Scheduled Tasks &amp; Expiry Radar</h4>
                    <p className="text-xs text-[#44403C] mt-0.5 leading-snug">
                      Proactive 30/60/90-day radar detecting expiring cylinders and auto-generating field technician work orders.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#FFF0E6] border border-[#FED7AA] flex items-center justify-center shrink-0 mt-0.5">
                    <Building2 className="w-4 h-4 text-[#C2410C]" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#1C1917]">Client Portfolio Management</h4>
                    <p className="text-xs text-[#44403C] mt-0.5 leading-snug">
                      Multi-building client accounts, facility manager contacts, and full historical audit logs in one place.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#FFF0E6] border border-[#FED7AA] flex items-center justify-center shrink-0 mt-0.5">
                    <FileSpreadsheet className="w-4 h-4 text-[#C2410C]" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#1C1917]">Reports &amp; Register Exports</h4>
                    <p className="text-xs text-[#44403C] mt-0.5 leading-snug">
                      One-click statutory Form-B PDF certificates and monthly Excel register exports formatted for audits.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/demo"
                  className="btn-flame inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-md"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Try Dashboard in Live Demo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Right Column: Laptop Device Frame with Real Product Screenshot */}
            <div className="lg:col-span-7 order-1 lg:order-2">
              <div className="relative mx-auto max-w-full">
                {/* Glow behind laptop */}
                <div
                  aria-hidden="true"
                  className="absolute -inset-4 bg-gradient-to-tr from-[#EA580C]/15 to-[#FF8C42]/20 rounded-3xl blur-2xl"
                />

                {/* Laptop Top Bezel & Screen Frame */}
                <div className="relative rounded-2xl bg-[#1C1917] p-2.5 sm:p-3 shadow-[0_30px_70px_-20px_rgba(28,25,23,0.35)] border border-slate-800">
                  {/* Laptop Web Camera Dot */}
                  <div className="w-2 h-2 rounded-full bg-slate-700 mx-auto mb-2 opacity-80" />

                  {/* Reserved 16:10 Aspect-Ratio Box to Guarantee Zero CLS */}
                  <div className="relative aspect-[16/10] w-full rounded-lg overflow-hidden bg-white border border-slate-200">
                    <Image
                      src="/screenshots/dashboard-fire-1440x900.png"
                      alt="VigilAMC Admin Dashboard showing real-time fire compliance KPIs, overdue equipment radar, and active work orders"
                      fill
                      sizes="(min-width: 1024px) 58vw, 100vw"
                      className="object-cover object-top"
                    />
                  </div>

                  {/* Laptop Base Bottom Lip */}
                  <div className="h-2.5 w-24 bg-slate-700/60 rounded-b-md mx-auto mt-1" />
                </div>
                {/* Laptop Stand Base Plate */}
                <div className="h-3 w-4/5 mx-auto bg-gradient-to-b from-slate-300 to-slate-400 rounded-b-xl shadow-lg border-t border-slate-200/40" />
              </div>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* PANEL 2: FIELD TECHNICIAN APP (Phone Frame + Real Screenshot)       */}
        {/* =================================================================== */}
        <div
          data-testid="overview-technician-panel"
          className="glass-panel rounded-3xl p-6 sm:p-10 lg:p-12 border border-[#FED7AA]/80 shadow-[0_24px_60px_-24px_rgba(28,25,23,0.14)]"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Phone Frame with Real App Screenshot */}
            <div className="lg:col-span-5 flex justify-center order-1">
              <div className="relative w-full max-w-[290px] sm:max-w-[320px]">
                {/* Glow behind phone */}
                <div
                  aria-hidden="true"
                  className="absolute -inset-4 bg-gradient-to-tr from-[#EA580C]/20 to-[#059669]/15 rounded-[48px] blur-2xl"
                />

                {/* Smartphone Device Frame */}
                <div className="relative rounded-[42px] bg-[#1C1917] p-3 shadow-[0_30px_70px_-15px_rgba(28,25,23,0.40)] border-4 border-slate-800">
                  {/* Dynamic Island / Earpiece speaker */}
                  <div className="w-20 h-4 bg-black rounded-full mx-auto mb-2 flex items-center justify-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-800" />
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-900/60" />
                  </div>

                  {/* Reserved 9:19 Aspect-Ratio Box to Guarantee Zero CLS */}
                  <div className="relative aspect-[9/19] w-full rounded-[30px] overflow-hidden bg-white border border-slate-200">
                    <Image
                      src="/screenshots/tech-home.png"
                      alt="VigilAMC Field Technician App home screen showing scheduled tasks, offline sync indicator, and GPS photo inspection workflow"
                      fill
                      sizes="(min-width: 1024px) 25vw, 80vw"
                      className="object-cover object-top"
                    />
                  </div>

                  {/* Bottom Home Indicator Bar */}
                  <div className="w-24 h-1 bg-white/60 rounded-full mx-auto mt-2" />
                </div>
              </div>
            </div>

            {/* Right Column: Callout Bullets */}
            <div className="lg:col-span-7 space-y-6 order-2">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-xs uppercase tracking-wide border border-emerald-200">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Field Operations App · Android Live · iOS App Store Soon</span>
                </div>
                <h3 className="font-display font-bold text-2xl sm:text-3xl text-[#1C1917] tracking-tight mt-2.5">
                  Field Technician Mobile App
                </h3>
                <p className="text-sm sm:text-base text-[#44403C] mt-2 leading-relaxed">
                  Engineered specifically for technicians working in basement parking, deep electrical shafts, and remote
                  industrial floors across India where connectivity is unpredictable.
                </p>
              </div>

              {/* 5 Key Field Capabilities */}
              <div className="space-y-4 pt-1">
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
                    <WifiOff className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#1C1917]">Works 100% Offline with Auto-Sync</h4>
                    <p className="text-xs text-[#44403C] mt-0.5 leading-snug">
                      Inspect, photograph, and sign off equipment in dead zones. Data queues locally and silently uploads
                      the moment internet reconnects.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-[#FFF0E6] border border-[#FED7AA] flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4 text-[#C2410C]" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#1C1917]">GPS-Stamped Live Photo Evidence</h4>
                    <p className="text-xs text-[#44403C] mt-0.5 leading-snug">
                      Burned-in GPS coordinates and timestamp watermarks on every photo. Camera-only capture stops gallery
                      spoofing and fake audits.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 mt-0.5">
                    <Bell className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#1C1917]">Push Task Alerts &amp; Daily Routing</h4>
                    <p className="text-xs text-[#44403C] mt-0.5 leading-snug">
                      Instant notifications for newly assigned buildings, scheduled AMC rounds, and urgent corrective repairs
                      with map routing.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0 mt-0.5">
                    <Languages className="w-4 h-4 text-blue-700" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#1C1917]">10 Indian Languages + Voice Notes</h4>
                    <p className="text-xs text-[#44403C] mt-0.5 leading-snug">
                      Native Hindi, Marathi, Tamil, Telugu, Gujarati, and Bengali interfaces plus browser voice-to-text mic
                      for fast spoken remarks.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center shrink-0 mt-0.5">
                    <Menu className="w-4 h-4 text-purple-700" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#1C1917]">Left-Side Fast Navigation Drawer</h4>
                    <p className="text-xs text-[#44403C] mt-0.5 leading-snug">
                      Rapid one-thumb navigation between active task queues, checklist history, offline sync diagnostics,
                      and language selection.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <GooglePlayBadge size="sm" theme="light" />
                <AppStoreBadge size="sm" theme="light" comingSoon />
                <Link
                  href="/login"
                  className="btn-flame inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-md"
                >
                  <span>Equip Your Technicians</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/sample-report"
                  className="btn-ghost-flame inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs"
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>See Verified Output</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
