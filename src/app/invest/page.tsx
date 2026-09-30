import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ShieldCheck,
  TrendingUp,
  Layers,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
  FileSpreadsheet,
  AlertTriangle,
  Repeat,
  Users,
  Smartphone,
  FileCheck2,
  Award,
  Sparkles,
  QrCode,
  Building2,
  Briefcase,
  ChevronRight,
  Mail,
  Phone,
  Linkedin,
  ShieldAlert,
  ArrowDown,
} from 'lucide-react';
import { InvestorForm } from '@/components/InvestorForm';

export const metadata: Metadata = {
  title: 'Invest in VigilAMC | SaaS for AMC & Recurring Service Operations',
  description:
    'VigilAMC is building the modern operating system for Annual Maintenance Contracts (AMC), service workflows, QR-verified audits, and compliance management.',
  keywords: [
    'Invest in VigilAMC',
    'B2B SaaS India',
    'AMC Management Software',
    'Fire Safety Tech',
    'PropTech India',
    'Field Service Operations',
    'VigilAMC Fundraising',
  ],
  openGraph: {
    title: 'Invest in VigilAMC — Modern B2B SaaS for AMC Management',
    description:
      'Digitizing India’s multi-billion rupee AMC & recurring service industry with verified QR tracking, automated renewal schedules, and client compliance.',
    url: 'https://vigilamc.vercel.app/invest',
    images: [
      {
        url: '/brag.jpg',
        width: 1200,
        height: 630,
        alt: 'Invest in VigilAMC',
      },
    ],
  },
};

export default function InvestPage() {
  return (
    <div className="w-full bg-[#080d1a] text-slate-100 selection:bg-[#0077B6] selection:text-white">
      {/* =========================================================================
          HERO SECTION: Premium SaaS Fundraising Style
          ========================================================================= */}
      <section className="relative pt-20 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-slate-800/80">
        {/* Ambient Gradient Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-[#0077B6]/15 via-[#023E8A]/10 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute -top-24 right-10 w-96 h-96 bg-[#0077B6]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-4 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Label Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-sm text-xs font-bold mb-8">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-amber-300 uppercase tracking-widest font-extrabold text-[10px] sm:text-xs">
              INVEST IN VIGILAMC
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-300 font-medium">B2B Vertical SaaS &bull; Seed Stage</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12] max-w-4xl mx-auto text-balance">
            Be Part of the Future of{' '}
            <span className="bg-gradient-to-r from-cyan-300 via-sky-200 to-amber-300 bg-clip-text text-transparent">
              AMC Management
            </span>
          </h1>

          {/* Supporting Copy */}
          <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal text-pretty">
            VigilAMC is building a smarter way for businesses to manage AMC operations, service workflows, customers and recurring maintenance relationships from one platform.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#investor-form"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#0077B6] to-[#023E8A] hover:from-[#006494] hover:to-[#011F48] text-white font-extrabold text-sm sm:text-base shadow-xl shadow-[#0077B6]/25 hover:shadow-2xl hover:shadow-[#0077B6]/40 transition-all transform hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>I’m Interested in Investing</span>
              <ArrowDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
            </a>

            <Link
              href="/"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-bold text-sm sm:text-base border border-slate-700/80 hover:border-slate-600 shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>Explore VigilAMC</span>
              <ArrowRight className="w-4 h-4 text-cyan-400" />
            </Link>
          </div>

          {/* Highlights ribbon */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Target Market</span>
              <p className="text-sm font-extrabold text-white mt-1">Commercial &amp; Facility AMC</p>
              <p className="text-[11px] text-cyan-300 mt-0.5">High-retention recurring contracts</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Geography</span>
              <p className="text-sm font-extrabold text-white mt-1">Delhi NCR (Delhi • Noida • Gurugram)</p>
              <p className="text-[11px] text-cyan-300 mt-0.5">Expanding across Indian metros</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Product Status</span>
              <p className="text-sm font-extrabold text-white mt-1">Live Product &amp; Active Pilots</p>
              <p className="text-[11px] text-cyan-300 mt-0.5">Multi-tenant Admin OS + Field App</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Round Status</span>
              <p className="text-sm font-extrabold text-white mt-1">Early-Stage Discussions</p>
              <p className="text-[11px] text-amber-300 mt-0.5">Strategic angels &amp; early funds</p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: WHY VIGILAMC? (5 Clean Cards)
          ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0077B6]/20 text-cyan-300 text-xs font-bold border border-[#0077B6]/40 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Investment Thesis</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-black text-white tracking-tight">
            Why VigilAMC?
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-400 leading-relaxed">
            Building software for the neglected operational backbone of real estate and industrial compliance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Real Business Problem */}
          <div className="p-7 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all hover:shadow-xl group">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-white mb-2">
              Real Business Problem
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              AMC and service businesses often manage hundreds of recurring contracts, critical equipment deadlines, technicians, and inspection logs through fragmented WhatsApp chats, notebooks, and fragile spreadsheets.
            </p>
          </div>

          {/* Card 2: SaaS Opportunity */}
          <div className="p-7 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all hover:shadow-xl group">
            <div className="w-12 h-12 rounded-2xl bg-[#0077B6]/20 border border-[#0077B6]/40 text-cyan-300 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-white mb-2">
              SaaS Opportunity
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              VigilAMC is positioned as an end-to-end cloud platform designed to digitize and simplify recurring AMC management, converting high-friction manual routines into predictable subscription software revenue.
            </p>
          </div>

          {/* Card 3: Scalable Platform */}
          <div className="p-7 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all hover:shadow-xl group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-white mb-2">
              Scalable Platform
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Engineered with multi-tenant agency isolation, QR-verified equipment logs, offline-first technician check-ins, automated deadline triggers, and one-click statutory Form-B PDF generation.
            </p>
          </div>

          {/* Card 4: Built for the Indian Market */}
          <div className="p-7 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all hover:shadow-xl group">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-white mb-2">
              Built for the Indian Market
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Tailored specifically to Indian regulatory workflows (NBC 2016, State Fire Acts, Delhi Fire Safety Rules) where compliance enforcement is accelerating and manual record-keeping is increasingly penalized.
            </p>
          </div>

          {/* Card 5: Long-Term Vision */}
          <div className="p-7 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all hover:shadow-xl group md:col-span-2 lg:col-span-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-white mb-2">
              Long-Term Vision
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Beginning with mission-critical life safety and expanding into comprehensive building maintenance contracts (HVAC, lifts, diesel generators, plumbing, electrical). VigilAMC aims to become the foundational operating system for commercial facility maintenance and asset lifecycle compliance across India.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: THE PROBLEM WE'RE SOLVING (7 Clear Pain Points)
          ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-950/60 border-y border-slate-800/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 text-rose-300 text-xs font-bold border border-rose-500/30 mb-3">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Current Industry Realities</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-black text-white tracking-tight">
              The Problem We&apos;re Solving
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-400 leading-relaxed">
              The traditional AMC ecosystem runs on paper memory and disjointed communications. Here is where agencies and facility managers struggle every single month:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* 1 */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/90 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-800 text-amber-400 flex items-center justify-center mb-4">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-white mb-1.5">Fragmented Records</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Asset histories and inspection registers scattered across disconnected Excel spreadsheets, WhatsApp chat threads, and physical site logbooks.
                </p>
              </div>
              <span className="mt-4 text-[10px] text-amber-400/80 font-mono font-semibold">High risk of lost data</span>
            </div>

            {/* 2 */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/90 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-800 text-rose-400 flex items-center justify-center mb-4">
                  <Clock className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-white mb-1.5">Untracked Expiry Dates</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  No automated visibility into when fire extinguishers need hydrostatic pressure tests, refills, or when annual maintenance agreements expire.
                </p>
              </div>
              <span className="mt-4 text-[10px] text-rose-400/80 font-mono font-semibold">Audit non-compliance</span>
            </div>

            {/* 3 */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/90 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-800 text-emerald-400 flex items-center justify-center mb-4">
                  <Repeat className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-white mb-1.5">Missed Contract Renewals</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Agencies leak significant recurring revenue simply because contracts lapse without timely renewal proposals sent to clients.
                </p>
              </div>
              <span className="mt-4 text-[10px] text-emerald-400/80 font-mono font-semibold">Direct revenue leakage</span>
            </div>

            {/* 4 */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/90 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-800 text-cyan-400 flex items-center justify-center mb-4">
                  <Phone className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-white mb-1.5">Manual Follow-ups</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Countless hours spent chasing building managers, sending repetitive WhatsApp messages, and requesting inspection clearances.
                </p>
              </div>
              <span className="mt-4 text-[10px] text-cyan-400/80 font-mono font-semibold">High administrative drag</span>
            </div>

            {/* 5 */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/90 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-800 text-amber-400 flex items-center justify-center mb-4">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-white mb-1.5">Untracked Service Requests</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Client complaints regarding leaking valves, low pressure gauges, or broken glass alarms go unresolved without clear defect ticketing.
                </p>
              </div>
              <span className="mt-4 text-[10px] text-amber-400/80 font-mono font-semibold">Client dissatisfaction</span>
            </div>

            {/* 6 */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/90 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-800 text-indigo-400 flex items-center justify-center mb-4">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-white mb-1.5">Zero Technician Accountability</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Agencies have no reliable way to verify whether field technicians physically visited every floor, basement pump room, or terrace header.
                </p>
              </div>
              <span className="mt-4 text-[10px] text-indigo-400/80 font-mono font-semibold">Verification gap</span>
            </div>

            {/* 7 */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/90 flex flex-col justify-between sm:col-span-2 lg:col-span-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-sm text-white mb-1">Repetitive Administrative Chaos</h4>
                  <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                    At the end of each quarter, managers spend days assembling Form-B compliance certificates, matching photos, and rebuilding inspection registers from scratch before municipal audits.
                  </p>
                </div>
                <span className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono font-bold shrink-0 self-start sm:self-auto">
                  Over 40+ hours wasted monthly per agency
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: THE SOLUTION (One Platform. Complete AMC Workflow.)
          ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0077B6]/20 text-cyan-300 text-xs font-bold border border-[#0077B6]/40 mb-3">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>The VigilAMC Operating System</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-black text-white tracking-tight">
            One Platform. Complete AMC Workflow.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-400 leading-relaxed">
            From client onboarding and asset tagging to field verification and automated statutory filings — every stage is linked.
          </p>
        </div>

        {/* Visual Workflow Steps */}
        <div className="relative mb-16">
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#0077B6]/50 to-transparent -translate-y-1/2 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 relative z-10">
            {/* Step 1 */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-center relative hover:border-[#0077B6] transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#0077B6]/20 text-cyan-300 border border-[#0077B6]/40 flex items-center justify-center mx-auto mb-3 font-mono font-bold text-sm">
                01
              </div>
              <h4 className="font-bold text-xs sm:text-sm text-white">Client &amp; Tower</h4>
              <p className="text-[11px] text-slate-400 mt-1">Multi-facility structure &amp; contacts</p>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-center relative hover:border-[#0077B6] transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#0077B6]/20 text-cyan-300 border border-[#0077B6]/40 flex items-center justify-center mx-auto mb-3 font-mono font-bold text-sm">
                02
              </div>
              <h4 className="font-bold text-xs sm:text-sm text-white">AMC Contract</h4>
              <p className="text-[11px] text-slate-400 mt-1">SLA terms, frequency &amp; milestones</p>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-center relative hover:border-[#0077B6] transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#0077B6]/20 text-cyan-300 border border-[#0077B6]/40 flex items-center justify-center mx-auto mb-3 font-mono font-bold text-sm">
                03
              </div>
              <h4 className="font-bold text-xs sm:text-sm text-white">Service Request</h4>
              <p className="text-[11px] text-slate-400 mt-1">Scheduled or emergency tickets</p>
            </div>

            {/* Step 4 */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-center relative hover:border-[#0077B6] transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#0077B6]/20 text-cyan-300 border border-[#0077B6]/40 flex items-center justify-center mx-auto mb-3 font-mono font-bold text-sm">
                04
              </div>
              <h4 className="font-bold text-xs sm:text-sm text-white">Technician App</h4>
              <p className="text-[11px] text-slate-400 mt-1">QR scan &amp; offline mobile audit</p>
            </div>

            {/* Step 5 */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-center relative hover:border-[#0077B6] transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#0077B6]/20 text-cyan-300 border border-[#0077B6]/40 flex items-center justify-center mx-auto mb-3 font-mono font-bold text-sm">
                05
              </div>
              <h4 className="font-bold text-xs sm:text-sm text-white">Follow-up &amp; Fix</h4>
              <p className="text-[11px] text-slate-400 mt-1">Defect quotes &amp; verified repairs</p>
            </div>

            {/* Step 6 */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-center relative hover:border-[#0077B6] transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center mx-auto mb-3 font-mono font-bold text-sm">
                06
              </div>
              <h4 className="font-bold text-xs sm:text-sm text-white">Renewal &amp; NOC</h4>
              <p className="text-[11px] text-slate-400 mt-1">Auto-renewals &amp; Form-B PDF</p>
            </div>
          </div>
        </div>

        {/* Highlight Box */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-[#023E8A]/40 via-navy-900/60 to-[#0077B6]/30 border border-[#0077B6]/40 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-display text-xl font-bold text-white">
              See what we are building for Indian AMC businesses.
            </h3>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Inspect our live architecture, field technician workflows, and data schema tailored for real-world facility operations.
            </p>
          </div>
          <a
            href="#investor-form"
            className="px-6 py-3 rounded-xl bg-[#0077B6] hover:bg-[#023E8A] text-white font-bold text-xs sm:text-sm shadow-md transition-all shrink-0 active:scale-95"
          >
            See What We&apos;re Building
          </a>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: INVESTOR OPPORTUNITY (3 Profiles)
          ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-950/70 border-y border-slate-800/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs font-bold border border-amber-500/30 mb-3">
              <Award className="w-3.5 h-3.5" />
              <span>Synergistic Partnerships</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-black text-white tracking-tight">
              Interested in Investing in VigilAMC?
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-400 leading-relaxed">
              We welcome conversations with forward-thinking investors who understand the compounding value of high-retention enterprise workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profile 1 */}
            <div className="p-7 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-cyan-300 block mb-2">
                  Institutional / Seed Funds
                </span>
                <h3 className="font-display text-lg font-bold text-white mb-3">
                  Early-Stage Investors
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Looking to back capital-efficient, high-retention vertical SaaS solving unsexy, mission-critical operational challenges in emerging enterprise markets.
                </p>
              </div>
              <div className="mt-6 pt-5 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Focus: Enterprise GTM &amp; Multi-city scale</span>
              </div>
            </div>

            {/* Profile 2 */}
            <div className="p-7 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-amber-300 block mb-2">
                  Domain &amp; Industry Veterans
                </span>
                <h3 className="font-display text-lg font-bold text-white mb-3">
                  Strategic Investors
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Leaders in facilities management, fire safety contracting, or commercial real estate who can open enterprise customer networks and calibrate vertical feature depth.
                </p>
              </div>
              <div className="mt-6 pt-5 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Focus: Direct industry pipeline &amp; advisory</span>
              </div>
            </div>

            {/* Profile 3 */}
            <div className="p-7 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-indigo-300 block mb-2">
                  Founders &amp; Operators
                </span>
                <h3 className="font-display text-lg font-bold text-white mb-3">
                  Angel Investors
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Tech founders, product leaders, and operators looking for high-conviction, early participation in a durable B2B workflow platform with tangible real-world impact.
                </p>
              </div>
              <div className="mt-6 pt-5 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Focus: Product mentoring &amp; SaaS architecture</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: MEET THE FOUNDER
          ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-cyan-300 text-xs font-bold border border-slate-700">
              <Users className="w-3.5 h-3.5" />
              <span>Founder Leadership</span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl font-black text-white tracking-tight">
              Meet the Founder
            </h2>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <h3 className="text-base font-bold text-white">Shaizan Siddiqui</h3>
              <p className="text-xs text-cyan-300 font-medium mt-0.5">
                Founder, VigilAMC &bull; New Delhi, India
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Building technology to bridge physical life safety operations and digital compliance verification across Indian facilities.
              </p>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              &quot;Having interacted closely with fire safety contractors, licensed agency operators, and building facility managers across Delhi NCR, one thing became crystal clear: life safety hardware is rigorously audited by state authorities, but the actual day-to-day inspection workflows run entirely on guesswork, brittle Excel sheets, and unverified paper logbooks.&quot;
            </p>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              &quot;We created VigilAMC to bring operational integrity to every asset. Durable QR codes on the physical equipment, offline-capable checklists on technician phones, and automated Form-B compliance documentation for building clients. We are committed to building a lasting, high-impact enterprise SaaS from India for the world.&quot;
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <a
                href="#investor-form"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#0077B6] to-[#023E8A] hover:from-[#006494] hover:to-[#011F48] text-white text-xs font-bold shadow-md transition-all active:scale-95 flex items-center gap-2"
              >
                <span>Connect With Our Team</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>

              <a
                href="mailto:vigilamc@gmail.com"
                className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold transition-colors flex items-center gap-2"
              >
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                <span>vigilamc@gmail.com</span>
              </a>

              <a
                href="https://www.linkedin.com/company/vigilamc/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors"
                aria-label="LinkedIn"
                title="LinkedIn"
              >
                <Linkedin className="w-4 h-4 text-cyan-400" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="p-7 rounded-3xl bg-gradient-to-br from-slate-900 via-navy-950 to-slate-900 border border-slate-800 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                  VigilAMC Grounding
                </span>
                <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Delhi NCR Active
                </span>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Focused initial rollouts in Delhi, Noida, and Gurugram facilities</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Working directly with registered fire maintenance agencies</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Full support for Delhi Fire Service Form-B statutory filing</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Live client portal, technician mobile PWA, and QR generator</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <p className="text-[11px] text-slate-400 italic">
                  &ldquo;A clean balance between regulatory accuracy and frictionless field technician execution.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: INVESTOR INTEREST FORM
          ========================================================================= */}
      <section id="investor-form" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto scroll-mt-24">
        <InvestorForm />
      </section>

      {/* =========================================================================
          SECTION 8: STATUTORY TRUST / LEGAL DISCLAIMER
          ========================================================================= */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 bg-slate-950/80">
        <div className="max-w-4xl mx-auto text-center space-y-3 text-[11px] text-slate-400 leading-relaxed">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Statutory Notice &amp; Expression of Interest Disclaimer</span>
          </div>
          <p>
            VigilAMC is a proprietary software platform operating in India. The materials, statements, and information presented on this page are provided solely for preliminary informational and exploratory discussion purposes and do not constitute an offer, invitation, solicitation, or recommendation to buy or subscribe to any securities, shares, or financial instruments in any jurisdiction.
          </p>
          <p>
            Any submission through this page constitutes a voluntary, non-binding expression of interest. VigilAMC does not engage in public fundraising, crowdfunding, or public solicitations of securities. All potential discussions, if any, will be conducted strictly on a private, confidential basis in full compliance with applicable corporate, legal, and financial regulatory frameworks.
          </p>
          <p className="text-slate-400 pt-2">
            &copy; {new Date().getFullYear()} VigilAMC. All rights reserved. Registered operations in New Delhi, India.
          </p>
        </div>
      </section>
    </div>
  );
}
