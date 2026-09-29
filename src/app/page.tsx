'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  ShieldAlert,
  QrCode,
  FileCheck2,
  BellRing,
  Building2,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  Clock,
  Sparkles,
  Smartphone,
  Flame,
  Award,
  Users,
  BarChart3,
  Check,
  X,
  HelpCircle,
  ExternalLink,
  Play,
  Send,
  Sliders,
  DollarSign,
  Linkedin,
  Instagram,
  Youtube,
  FileText,
  Download,
  AlertTriangle
} from 'lucide-react';
import { CanvasHero } from '@/components/CanvasHero';
import { ImageLightbox, LightboxImage } from '@/components/ImageLightbox';
import { StatusBadge } from '@/components/StatusBadge';
import { ProductWorkflowSection } from '@/components/ProductWorkflowSection';
import { ProductInterfacePreview } from '@/components/ProductInterfacePreview';
import { FounderSection } from '@/components/FounderSection';
import { TrustTransparencySection } from '@/components/TrustTransparencySection';
import { FreePilotForm } from '@/components/FreePilotForm';
import { DemoModal } from '@/components/DemoModal';

export default function HomePage() {
  // Demo / Workflow review modal
  const [workflowModalOpen, setWorkflowModalOpen] = useState(false);

  // Billing cycle state for pricing section
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  // FAQ open state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Interactive ROI Calculator states
  const [calcBuildings, setCalcBuildings] = useState<number>(6);
  const [calcAssets, setCalcAssets] = useState<number>(450);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const galleryImages: LightboxImage[] = [
    {
      src: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80',
      title: 'Commercial Multi-Story Life Safety Infrastructure',
      category: 'Reference Inspection Scenario [Sample]',
      building: 'High-Rise Commercial Facility (Representative)',
      auditDate: 'Scheduled Inspection Protocol',
      description: 'Extinguishers, landing valves, and yard hydrants monitored with digital timestamping for statutory compliance workflows.',
    },
    {
      src: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80',
      title: 'Healthcare & Critical Infrastructure Safety Audit',
      category: 'Healthcare AMC Scenario [Sample]',
      building: 'Hospital & Healthcare Center (Representative)',
      auditDate: 'Compliance Logging Flow',
      description: 'Systematic safety tracking with logging of wet risers, clean-agent suppression, and verifiable digital records.',
    },
    {
      src: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=1200&q=80',
      title: 'Weatherproof Metal QR Tagging in Action',
      category: 'Field Equipment Tagging [Sample]',
      building: 'Industrial Logistics Warehouse (Representative)',
      auditDate: 'Field Tagging Standards',
      description: 'Anodized aluminum QR label installed on CO2 cylinder. Resistant to UV exposure, dust, and washdowns.',
    },
    {
      src: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
      title: 'Hydrant Flow & Pressure Gauge Verification',
      category: 'Wet Riser Testing [Sample]',
      building: 'Multi-Tenant Commercial Complex (Representative)',
      auditDate: 'Pressure Verification Flow',
      description: 'Technicians log dynamic pressure readings using digital checklists to keep Form-B certification schedules accurate.',
    },
  ];

  const handleOpenLightbox = (index: number) => {
    setActiveImageIndex(index);
    setLightboxOpen(true);
  };

  // ROI calculations
  const manualHoursSpentPerMonth = Math.round((calcAssets * 0.45) + (calcBuildings * 8));
  const vigilHoursSpentPerMonth = Math.round(manualHoursSpentPerMonth * 0.22);
  const hoursSavedPerYear = (manualHoursSpentPerMonth - vigilHoursSpentPerMonth) * 12;
  const costSavingsPerYear = (hoursSavedPerYear * 600).toLocaleString('en-IN');

  const faqs = [
    {
      q: 'How does VigilAMC help fire protection agencies avoid missed compliance deadlines?',
      a: 'VigilAMC tracks every statutory inspection cycle, refilling date, and hydrostatic pressure testing window in a centralised schedule. Automated reminders notify your operations team 60, 30, and 7 days prior to expiry so technician visits can be dispatched well in advance of audit deadlines.',
    },
    {
      q: 'Can technicians inspect assets offline in basements with poor mobile reception?',
      a: 'Yes. Our technician mobile field interface stores inspection checklists and QR data locally in the browser. When technicians work in underground pump rooms or shielded riser shafts, checks are recorded with local timestamps and synchronize automatically when network connectivity is restored.',
    },
    {
      q: 'Does VigilAMC replace a licensed fire safety contractor or certify buildings directly?',
      a: 'No. VigilAMC is an operational software platform. It does not replace licensed fire safety engineers, licensed agency sign-offs, or municipal fire authorities. Statutory Form-B documents generated on VigilAMC must be reviewed, verified, and signed by authorized personnel holding valid state fire agency licenses.',
    },
    {
      q: 'Already managing your fire assets in Excel or spreadsheets?',
      a: 'Already managing your assets in Excel? Import your existing data into VigilAMC in minutes. Upload your .xlsx or .csv files, review smart column mapping (Clients → Buildings → Assets), inspect validation warnings, and batch import your complete equipment inventory without manual data re-entry.',
    },
    {
      q: 'What is included in the Free Pilot program?',
      a: 'The Free Pilot gives your agency full access to the QR asset registry, technician mobile checklist, and Form-B PDF generation engine for up to 3 pilot facilities. You also get a dedicated 1-on-1 onboarding session with our founder to calibrate your workflows.',
    },
    {
      q: 'What happens when a critical defect is spotted during an inspection?',
      a: 'When a technician marks an extinguisher as depressurized or flags a leaking hydrant valve, VigilAMC immediately creates a Defect Ticket with attached photo evidence. Service managers can track pending repairs and generate client estimate summaries directly from the dashboard.',
    },
  ];

  return (
    <div className="w-full bg-white overflow-hidden">
      {/* =========================================================================
          HERO SECTION: Truthful B2B Messaging & Verified Status Indicators
          ========================================================================= */}
      <section className="relative min-h-[640px] lg:min-h-[720px] flex items-center justify-center pt-10 pb-20 px-4 sm:px-6 lg:px-8 ocean-mesh border-b border-slate-200/80">
        {/* Animated Particle Canvas */}
        <CanvasHero />

        {/* Ambient Decorative Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#0077B6]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-[#023E8A]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Truthful positioning pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/95 border border-ocean-200/90 shadow-sm text-xs font-semibold text-[#023E8A] mb-8 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-[#0077B6] animate-pulse" />
            <span className="font-medium text-slate-700">Fire Protection Operations &amp; Maintenance Software</span>
            <span className="text-slate-300">|</span>
            <span className="text-[#0077B6] font-bold">Delhi NCR • Delhi • Noida • Gurugram</span>
          </div>

          {/* Primary Main Headline */}
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-[#023E8A] tracking-[-0.03em] leading-[1.12] max-w-4xl mx-auto text-balance">
            Never Miss a Compliance Deadline Again
          </h1>

          {/* Required Supporting Copy */}
          <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-normal text-pretty">
            VigilAMC helps fire protection agencies track annual maintenance contracts, log inspections with QR codes, and generate client-ready Form-B reports in minutes.
          </p>

          {/* Primary CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setWorkflowModalOpen(true)}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#0077B6] to-[#023E8A] hover:from-[#006494] hover:to-[#011F48] text-white font-bold text-sm sm:text-base shadow-lg shadow-[#0077B6]/25 hover:shadow-xl hover:shadow-[#0077B6]/35 transition-all transform hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Book a 15-Minute Workflow Review</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <a
              href="#pilot-section"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-[#023E8A] font-bold text-sm sm:text-base border border-slate-300 hover:border-[#0077B6] shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-[#0077B6]" />
              <span>Join the Free Pilot</span>
            </a>

            <a
              href="#launch-demo"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-ocean-50/90 hover:bg-ocean-100 text-[#0077B6] hover:text-[#023E8A] font-bold text-sm sm:text-base border border-ocean-200/90 shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 text-[#0077B6] fill-current" />
              <span>Watch 20s Launch Demo</span>
            </a>
          </div>

          {/* 4 Feature-Status Cards Under Hero */}
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto text-left">
            <div className="p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Field Audits</span>
                <StatusBadge status="LIVE" />
              </div>
              <h3 className="font-display text-base font-bold text-[#023E8A]">
                QR-Verified Inspections
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Scan on-site tags to verify equipment presence, pressure, and physical condition.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Statutory Filing</span>
                <StatusBadge status="LIVE" />
              </div>
              <h3 className="font-display text-base font-bold text-[#023E8A]">
                Automated Form-B Reports
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Compile full asset registers and test logs into official Form-B PDF certificates in minutes.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Route Ops</span>
                <StatusBadge status="BETA" />
              </div>
              <h3 className="font-display text-base font-bold text-[#023E8A]">
                Technician Geo-Tracking
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Validate technician arrival coordinates and inspection timestamps on site.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Client Access</span>
                <StatusBadge status="COMING SOON" />
              </div>
              <h3 className="font-display text-base font-bold text-[#023E8A]">
                Client Compliance Portal
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Self-service compliance dashboard for building facility managers to view certificate history.
              </p>
            </div>
          </div>

          {/* Featured Product Launch Video */}
          <div id="launch-demo" className="mt-16 max-w-4xl mx-auto scroll-mt-24">
            <div className="relative rounded-2xl p-2.5 sm:p-3.5 bg-gradient-to-b from-white/95 via-ocean-50/40 to-slate-100/90 backdrop-blur-md border border-ocean-200/90 shadow-elevated overflow-hidden group">
              <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#021B3A] text-white rounded-xl mb-2.5 text-xs font-semibold shadow-inner">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-display tracking-wider uppercase text-[11px] text-cyan-200 font-bold">
                    VigilAMC In Action &bull; Product Overview
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-3 text-[11px] text-cyan-100/80">
                  <span className="px-2 py-0.5 rounded bg-ocean-800/80 text-cyan-200 border border-ocean-600/50">Mobile QR Scanning</span>
                  <span className="text-slate-500">&bull;</span>
                  <span className="px-2 py-0.5 rounded bg-ocean-800/80 text-cyan-200 border border-ocean-600/50">Form-B PDF Generation</span>
                </div>
              </div>

              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-950 shadow-2xl border border-slate-800/50">
                <video
                  poster="/brag.jpg"
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls
                  preload="metadata"
                  className="w-full h-full object-cover"
                >
                  <source src="/brag.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: REAL 7-STEP PRODUCT WORKFLOW
          ========================================================================= */}
      <ProductWorkflowSection />

      {/* =========================================================================
          SECTION 5: REAL PRODUCT INTERFACE PREVIEW (SAMPLE DATA WATERMARKED)
          ========================================================================= */}
      <ProductInterfacePreview />

      {/* =========================================================================
          SECTION 6: "SEE WHAT YOUR CLIENT RECEIVES"
          ========================================================================= */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#0077B6] bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-sm">
              Client Deliverables &amp; Transparency
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#023E8A] tracking-tight mt-4">
              See What Your Client Receives
            </h2>
            <p className="mt-3 text-base text-slate-600 leading-relaxed">
              When facility managers and audit authorities ask for proof of maintenance, give them professional, client-ready reports instead of messy paper logbooks.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Key Deliverables List */}
            <div className="lg:col-span-6 space-y-6">
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-[#0077B6]/40 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-ocean-50 text-[#0077B6] flex items-center justify-center shrink-0 border border-ocean-100">
                    <FileCheck2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">
                        Official Form-B Compliance Certificate
                      </h3>
                      <StatusBadge status="LIVE" />
                    </div>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                      Structured under Delhi Fire Service Rules, NBC 2016 Part 4 &amp; applicable NCR bylaws, formatted for licensed contractor sign-off.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-[#0077B6]/40 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">
                        Color-Coded Asset Health Schedule
                      </h3>
                      <StatusBadge status="SAMPLE" />
                    </div>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                      Full breakdown of extinguishers, wet riser landing valves, and alarms categorized as Operational, Requires Refill, or Needs Hydrostatic Testing.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-[#0077B6]/40 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">
                        QR-Accessible Digital Audit Trail
                      </h3>
                      <StatusBadge status="LIVE" />
                    </div>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                      Every certificate includes a verification QR code allowing auditors or building committees to check inspection dates and technician sign-offs.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-[#0077B6]/40 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">
                        Defect Remediation &amp; Quote Summary
                      </h3>
                      <StatusBadge status="SAMPLE" />
                    </div>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                      Clear list of defective equipment with photo evidence, allowing facility managers to quickly approve necessary repairs and parts replacements.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Report Download Card */}
            <div className="lg:col-span-6">
              <div className="rounded-3xl p-8 bg-gradient-to-br from-[#023E8A] via-[#022A5E] to-[#011F48] text-white shadow-xl border border-cyan-500/20 relative overflow-hidden">
                <div className="flex items-center justify-between pb-6 border-b border-navy-400/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0077B6] flex items-center justify-center text-white font-black text-sm">
                      PDF
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-base text-white">
                        Sample Form-B Compliance Certificate
                      </h4>
                      <p className="text-xs text-cyan-200">
                        Document Ref: VIGIL-CERT-2026-DEMO
                      </p>
                    </div>
                  </div>
                  <StatusBadge status="SAMPLE" />
                </div>

                <div className="py-6 space-y-4 text-xs">
                  <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 space-y-2">
                    <div className="flex justify-between text-slate-200">
                      <span>Representative Building:</span>
                      <strong className="text-white">Apex Business Towers (Tower B)</strong>
                    </div>
                    <div className="flex justify-between text-slate-200">
                      <span>Representative City:</span>
                      <strong className="text-white">Cyber City, Gurugram, Delhi NCR</strong>
                    </div>
                    <div className="flex justify-between text-slate-200">
                      <span>Equipments Documented:</span>
                      <strong className="text-cyan-300">48 Units (44 OK / 4 Defect)</strong>
                    </div>
                    <div className="flex justify-between text-slate-200">
                      <span>Biannual Cycle:</span>
                      <strong className="text-white">Period 01 (Jan - Jun 2026)</strong>
                    </div>
                  </div>

                  <p className="text-xs text-cyan-100/90 leading-relaxed italic">
                    &ldquo;Review the complete layout, equipment schedule, inspector declaration, and verification QR code of our standardized report.&rdquo;
                  </p>
                </div>

                <div className="pt-4 border-t border-navy-400/30 space-y-3">
                  <Link
                    href="/sample-report"
                    className="w-full py-3.5 px-6 rounded-xl bg-[#0077B6] hover:bg-[#0096C7] text-white font-bold text-sm text-center flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98]"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download &amp; Inspect Sample Report</span>
                  </Link>

                  <div className="p-3 rounded-lg bg-navy-900/60 border border-navy-700/60 text-[11px] text-slate-300 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Note:</strong> Sample Form-B report generated using synthetic facility data for demonstration purposes. Official certification requires valid licensed agency endorsement.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION: FEATURES GRID WITH STATUS BADGES
          ========================================================================= */}
      <section id="features" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#0077B6] bg-ocean-50 px-3 py-1 rounded-full border border-ocean-200">
              Platform Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#023E8A] tracking-tight mt-4">
              Purpose-Built for Fire Safety AMC Operations
            </h2>
            <p className="mt-3 text-base text-slate-600 leading-relaxed">
              Every feature is built around the practical realities of field technicians, service supervisors, and compliance managers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {/* Feature 1 */}
            <div className="corp-card p-8 bg-white flex flex-col justify-between h-full border border-slate-200 shadow-card hover:shadow-card-hover group">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-ocean-50 text-[#0077B6] flex items-center justify-center border border-ocean-100 shadow-xs">
                    <QrCode className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <StatusBadge status="LIVE" />
                </div>
                <h3 className="font-display text-xl font-bold text-[#023E8A] tracking-tight">
                  Asset QR Registry &amp; Tagging
                </h3>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  Register extinguishers, landing valves, hose reels, and alarm panels. Assign unique serialized QR labels to identify each asset instantly on site.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-[#0077B6]">
                <span>Full Asset Lifecycle Tracking</span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="corp-card p-8 bg-white flex flex-col justify-between h-full border border-slate-200 shadow-card hover:shadow-card-hover group">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-navy-50 text-[#023E8A] flex items-center justify-center border border-navy-100 shadow-xs">
                    <BellRing className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <StatusBadge status="LIVE" />
                </div>
                <h3 className="font-display text-xl font-bold text-[#023E8A] tracking-tight">
                  Scheduled Expiry Alerts
                </h3>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  Automatic email and notifications 60, 30, and 7 days prior to hydrostatic pressure test expiry or annual chemical refill deadlines.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-[#0077B6]">
                <span>Multi-Tier Renewal Schedules</span>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="corp-card p-8 bg-white flex flex-col justify-between h-full border border-slate-200 shadow-card hover:shadow-card-hover group">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-ocean-50 text-[#0077B6] flex items-center justify-center border border-ocean-100 shadow-xs">
                    <FileCheck2 className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <StatusBadge status="LIVE" />
                </div>
                <h3 className="font-display text-xl font-bold text-[#023E8A] tracking-tight">
                  Form-B Report Generator
                </h3>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  Generate statutory Biannual Form-B certificates compliant with State Fire Directorate formats, complete with equipment schedules and inspector logs.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-[#0077B6]">
                <Link href="/sample-report" className="hover:underline flex items-center gap-1">
                  <span>View Sample Form-B PDF</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="corp-card p-8 bg-white flex flex-col justify-between h-full border border-slate-200 shadow-card hover:shadow-card-hover group">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-navy-50 text-[#023E8A] flex items-center justify-center border border-navy-100 shadow-xs">
                    <Smartphone className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <StatusBadge status="BETA" />
                </div>
                <h3 className="font-display text-xl font-bold text-[#023E8A] tracking-tight">
                  Offline Mobile Field Checklist
                </h3>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  Enables technicians to record inspection checks in subterranean pump rooms and basements without continuous cellular connectivity.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-[#0077B6]">
                <span>In Active Pilot Testing</span>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="corp-card p-8 bg-white flex flex-col justify-between h-full border border-slate-200 shadow-card hover:shadow-card-hover group">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-ocean-50 text-[#0077B6] flex items-center justify-center border border-ocean-100 shadow-xs">
                    <Building2 className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <StatusBadge status="BETA" />
                </div>
                <h3 className="font-display text-xl font-bold text-[#023E8A] tracking-tight">
                  Multi-Facility Operations Dashboard
                </h3>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  Track inspection throughput, open defect tickets, and scheduled maintenance across multiple client buildings in one centralised interface.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-[#0077B6]">
                <span>Portfolio Overview &amp; Tracking</span>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="corp-card p-8 bg-white flex flex-col justify-between h-full border border-slate-200 shadow-card hover:shadow-card-hover group">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-navy-50 text-[#023E8A] flex items-center justify-center border border-navy-100 shadow-xs">
                    <Users className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <StatusBadge status="COMING SOON" />
                </div>
                <h3 className="font-display text-xl font-bold text-[#023E8A] tracking-tight">
                  Client Self-Service Portal
                </h3>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  Dedicated read-only access for facility management committees to view equipment readiness, download certificates, and approve quotes online.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-slate-500">
                <span>In Active Development</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          INTERACTIVE ROI & OPERATIONAL TIME SAVINGS CALCULATOR
          ========================================================================= */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 border-t border-slate-200">
        <div className="max-w-5xl mx-auto corp-card-elevated p-8 sm:p-12 border-ocean-200/80 ocean-mesh bg-white">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#0077B6] bg-ocean-50 px-3.5 py-1.5 rounded-full border border-ocean-200/80">
              Operational Impact Estimator
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-[#023E8A] tracking-tight mt-3 text-balance">
              Estimate Your Operational Time &amp; Cost Savings
            </h3>
            <p className="text-sm text-slate-600 mt-2 text-pretty">
              Adjust the sliders to match your active facility portfolio and evaluate potential time saved from manual logbook tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            {/* Sliders */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Buildings / Facilities Under AMC
                  </label>
                  <span className="px-3 py-1 bg-white border border-slate-300 rounded-lg text-sm font-black text-[#023E8A] font-display tabular-nums shadow-xs">
                    {calcBuildings} Facilities
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="40"
                  value={calcBuildings}
                  onChange={(e) => setCalcBuildings(parseInt(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0077B6]"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
                  <span>1 Facility</span>
                  <span>20 Facilities</span>
                  <span>40+ Facilities</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Total Fire Assets (Extinguishers, Hydrants, Panels)
                  </label>
                  <span className="px-3 py-1 bg-white border border-slate-300 rounded-lg text-sm font-black text-[#0077B6] font-display tabular-nums shadow-xs">
                    {calcAssets} Assets
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="3000"
                  step="50"
                  value={calcAssets}
                  onChange={(e) => setCalcAssets(parseInt(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0077B6]"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
                  <span>50 Assets</span>
                  <span>1,500 Assets</span>
                  <span>3,000+ Assets</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2 shadow-xs">
                <div className="flex items-center gap-2 text-[#023E8A] font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Drastically reduces manual Excel data entry and reconciliation errors</span>
                </div>
                <div className="flex items-center gap-2 text-[#023E8A] font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Helps avoid missed inspection cycles and frantic pre-audit rushes</span>
                </div>
              </div>
            </div>

            {/* Calculated Results Card */}
            <div className="bg-gradient-to-br from-[#023E8A] via-[#022A5E] to-[#011F48] text-white p-8 rounded-2xl shadow-xl flex flex-col justify-between space-y-6 border border-cyan-500/20">
              <div>
                <div className="text-xs uppercase font-extrabold tracking-wider text-cyan-200 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                  Estimated Time Reclaimed
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="font-display text-4xl sm:text-5xl font-black text-white tabular-nums tracking-tight">
                    {hoursSavedPerYear}
                  </span>
                  <span className="text-base text-cyan-200 font-semibold">Hours Saved / Year</span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Calculated based on average manual logbook compilation, travel reconciliation, and report preparation.
                </p>
              </div>

              <div className="pt-4 border-t border-navy-400/30">
                <div className="text-xs text-cyan-200 font-semibold">
                  Estimated Operational Efficiency Value
                </div>
                <div className="font-display text-2xl sm:text-3xl font-black text-white mt-1 tabular-nums tracking-tight">
                  ₹{costSavingsPerYear} <span className="text-xs text-slate-300 font-normal">equivalent / yr</span>
                </div>
              </div>

              <button
                onClick={() => setWorkflowModalOpen(true)}
                className="w-full py-3.5 bg-[#0077B6] hover:bg-white hover:text-[#023E8A] text-white font-bold text-xs uppercase tracking-wider rounded-xl text-center transition-all shadow-md active:scale-[0.98] cursor-pointer"
              >
                Schedule 15-Minute Workflow Review
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          REFERENCE FIELD SCENARIOS & LIGHTBOX (SAMPLE DEMONSTRATION DATA)
          ========================================================================= */}
      <section id="customers" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#0077B6] bg-ocean-50 px-3 py-1 rounded-full border border-ocean-200">
              Inspection Protocols &amp; Field Scenarios
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#023E8A] tracking-tight mt-4">
              Designed for Real-World Field Conditions
            </h2>
            <p className="mt-3 text-base text-slate-600 leading-relaxed">
              Explore how QR tagging, physical gauge verifications, and digital compliance logging apply to diverse facility types.
            </p>
          </div>

          {/* Interactive Lightbox Trigger Gallery */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {galleryImages.map((img, idx) => (
              <div
                key={idx}
                onClick={() => handleOpenLightbox(idx)}
                className="corp-card overflow-hidden group cursor-pointer bg-white transition-all transform hover:-translate-y-1.5 border border-slate-200"
              >
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.src}
                    alt={img.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-slate-900/30 group-hover:bg-slate-900/10 transition-colors" />
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-white/95 text-[#023E8A] text-[10px] font-bold shadow-sm">
                    {img.category}
                  </span>
                  <div className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-slate-900/80 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <span>Click to Zoom</span>
                  </div>
                </div>

                <div className="p-4">
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#0077B6] transition-colors line-clamp-1">
                    {img.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                    {img.building}
                  </p>
                  <p className="text-[11px] text-[#0077B6] font-semibold mt-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Inspection Flow Preview
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Verified Standards & Testimonials Placeholder Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="corp-card p-6 bg-slate-50 border border-slate-200 shadow-sm">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                Statutory Framework
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                VigilAMC aligns its equipment schedules with the <strong>Delhi Fire Prevention and Fire Safety Act &amp; NCR Rules</strong>, <strong>NBC 2016 Part 4</strong>, and <strong>IS 2190</strong> maintenance protocols.
              </p>
              <div className="mt-6 pt-4 border-t border-slate-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0077B6] text-white flex items-center justify-center font-bold text-xs">
                  NBC
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900">Standardized Schedules</h5>
                  <p className="text-[11px] text-slate-500">IS 2190 &amp; NBC Part 4 Guidelines</p>
                </div>
              </div>
            </div>

            <div className="corp-card p-6 bg-slate-50 border border-slate-200 shadow-sm">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                Field Traceability
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                Every field technician log includes QR verification timestamps, optional device coordinates, and photographic records for transparent defect communication.
              </p>
              <div className="mt-6 pt-4 border-t border-slate-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#023E8A] text-white flex items-center justify-center font-bold text-xs">
                  QR
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900">Digital Verification</h5>
                  <p className="text-[11px] text-slate-500">Physical Tagging &amp; Time Log</p>
                </div>
              </div>
            </div>

            {/* Testimonials Placeholder */}
            <div className="corp-card p-6 bg-amber-50/50 border border-amber-200 shadow-sm">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                Pilot Feedback Program
              </div>
              <p className="text-sm text-slate-700 leading-relaxed italic">
                [ADD VERIFIED CUSTOMER TESTIMONIAL] &bull; Customer case studies and testimonials from active pilot agencies are currently being documented and will be published with client authorization.
              </p>
              <div className="mt-6 pt-4 border-t border-amber-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs">
                  PILOT
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900">Partner Feedback</h5>
                  <p className="text-[11px] text-slate-500">Documentation In Progress</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: FOUNDER STORY & VIDEO PLACEHOLDER
          ========================================================================= */}
      <FounderSection />

      {/* =========================================================================
          SECTION 8 & 9: TRUST, TRANSPARENCY & STATUTORY DISCLAIMERS
          ========================================================================= */}
      <TrustTransparencySection />

      {/* =========================================================================
          PRICING TABLE SECTION
          ========================================================================= */}
      <section id="pricing" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#0077B6] bg-ocean-50 px-3 py-1 rounded-full border border-ocean-200">
              Transparent Pricing
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#023E8A] tracking-tight mt-4">
              Simple Plans to Modernize Your AMC Fleet
            </h2>
            <p className="mt-3 text-base text-slate-600 leading-relaxed">
              Every plan includes the core asset registry, QR tagging capabilities, and Form-B PDF generation.
            </p>

            {/* Monthly / Annual Toggle Switch */}
            <div className="mt-8 inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-300">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-[#023E8A] shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                  billingCycle === 'annual'
                    ? 'bg-[#0077B6] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Annual Billing</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-cyan-200 text-[#023E8A] font-extrabold">
                  SAVE 20%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {/* Tier 1: Starter AMC */}
            <div className="corp-card p-8 bg-white flex flex-col justify-between h-full border border-slate-200 shadow-card hover:shadow-card-hover">
              <div>
                <div className="flex justify-between items-center">
                  <h3 className="font-display text-xl font-bold text-slate-900">Starter AMC</h3>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md">
                    Up to 3 Facilities
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Suitable for independent fire contractors and small maintenance teams.
                </p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-black text-[#023E8A] tabular-nums tracking-tight">
                    ₹{billingCycle === 'annual' ? '3,999' : '4,999'}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">/ month</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {billingCycle === 'annual' ? 'Billed annually (₹47,988/yr) • Save 20%' : 'Billed month-to-month'}
                </p>

                <div className="mt-8 space-y-3 text-xs text-slate-700">
                  <p className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                    Included Capabilities:
                  </p>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Up to <strong>300 Fire Assets</strong> (Extinguishers, Hydrants)</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Technician Mobile Scanner (Offline Ready)</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Form-B PDF Generation Engine</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Automated Email Expiry Notifications</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Standard Email Support</span>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-8 border-t border-slate-100">
                <a
                  href="#pilot-section"
                  className="w-full py-3 px-4 rounded-xl text-xs font-bold text-[#0077B6] bg-ocean-50 hover:bg-ocean-100 text-center block transition-all border border-ocean-200 active:scale-[0.98]"
                >
                  Apply for Free Pilot
                </a>
              </div>
            </div>

            {/* Tier 2: Pro Fleet AMC */}
            <div className="corp-card p-8 bg-white border-2 border-[#0077B6] shadow-xl ring-4 ring-[#0077B6]/15 relative flex flex-col justify-between h-full">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#0077B6] to-[#023E8A] text-white text-[11px] font-extrabold uppercase tracking-wider shadow-md">
                Recommended for AMC Fleets
              </div>

              <div>
                <div className="flex justify-between items-center mt-1">
                  <h3 className="font-display text-xl font-bold text-[#023E8A]">Pro Fleet AMC</h3>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-ocean-50 text-[#0077B6] rounded-md border border-ocean-200">
                    Up to 15 Facilities
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  For growing fire safety AMC agencies managing multi-building commercial portfolios.
                </p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-black text-[#023E8A] tabular-nums tracking-tight">
                    ₹{billingCycle === 'annual' ? '6,399' : '7,999'}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">/ month</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {billingCycle === 'annual' ? 'Billed annually (₹76,788/yr) • Save 20%' : 'Billed month-to-month'}
                </p>

                <div className="mt-8 space-y-3 text-xs text-slate-700">
                  <p className="font-bold text-[#023E8A] uppercase tracking-wider text-[11px]">
                    Everything in Starter, plus:
                  </p>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Up to <strong>1,800 Fire Safety Assets</strong></span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Automated Email &amp; SMS Renewal Alerts</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Client Portal (When Live) Included at No Extra Cost</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Defect Quotation Summaries &amp; Photo Logs</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Priority Technical &amp; Onboarding Support</span>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-8 border-t border-slate-100">
                <a
                  href="#pilot-section"
                  className="w-full py-3.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#0077B6] to-[#023E8A] hover:from-[#006494] hover:to-[#011F48] text-center block transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
                >
                  Apply for Free Pilot
                </a>
              </div>
            </div>

            {/* Tier 3: Enterprise / Custom AMC */}
            <div className="corp-card p-8 bg-white flex flex-col justify-between h-full border border-slate-200 shadow-card hover:shadow-card-hover">
              <div>
                <div className="flex justify-between items-center">
                  <h3 className="font-display text-xl font-bold text-slate-900">Enterprise Operations</h3>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-navy-50 text-[#023E8A] rounded-md">
                    Custom Fleet
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  For large facility conglomerates, multi-city operations, and specialized industrial facilities.
                </p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-black text-[#023E8A] tracking-tight">Custom</span>
                  <span className="text-xs text-slate-500 font-medium">tailored to fleet size</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {billingCycle === 'annual' ? 'Annual contract with volume terms' : 'Flexible monthly rollout'}
                </p>

                <div className="mt-8 space-y-3 text-xs text-slate-700">
                  <p className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                    Enterprise-Grade Features:
                  </p>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>High Volume Asset Registry</strong></span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Dedicated Technical Onboarding Support</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Custom Bulk Asset Migration Assistance</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>99.9% Platform Availability Target</span>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-8 border-t border-slate-100">
                <Link
                  href="/contact"
                  className="w-full py-3 px-4 rounded-xl text-xs font-bold text-[#023E8A] bg-slate-100 hover:bg-slate-200 text-center block transition-all active:scale-[0.98]"
                >
                  Contact for Custom Quote
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FAQ ACCORDION SECTION
          ========================================================================= */}
      <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#0077B6] bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-sm">
              Common Inquiries
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#023E8A] tracking-tight mt-4 text-balance">
              Frequently Asked Questions
            </h2>
            <p className="mt-3 text-base text-slate-600 leading-relaxed text-pretty">
              Clear answers regarding statutory compliance, field workflows, and getting started with VigilAMC.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className={`corp-card overflow-hidden bg-white transition-all ${
                    isOpen ? 'border-[#0077B6]/40 shadow-card' : 'border-slate-200'
                  }`}
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full py-5 px-6 text-left flex items-center justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0077B6] cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span className="text-base font-bold text-slate-900 hover:text-[#0077B6] transition-colors">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#0077B6]' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 animate-in fade-in duration-200">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick contact reassurance */}
          <div className="mt-12 text-center text-xs text-slate-500">
            Have a specific statutory or municipal fire jurisdiction question?{' '}
            <Link href="/contact" className="text-[#0077B6] font-bold underline hover:text-[#023E8A] transition-colors">
              Speak directly with our team
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 11: JOIN THE FREE PILOT (8-FIELD APPLICATION FORM)
          ========================================================================= */}
      <section id="pilot-section" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#023E8A] via-[#022A5E] to-[#011F48] text-white relative overflow-hidden border-t border-navy-700/60 scroll-mt-16">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-navy-800/80 text-cyan-200 text-xs font-bold border border-cyan-400/20 shadow-sm mb-4">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>Pilot Cohort &bull; Free Access</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Join the Free Pilot Program
            </h2>
            <p className="text-sm sm:text-base text-cyan-100 mt-3 leading-relaxed">
              We are onboarding selected fire protection agencies into our hands-on pilot. Test QR tagging and Form-B generation across up to 3 of your facilities with direct founder onboarding.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-2xl text-slate-900 border border-slate-100">
            <FreePilotForm />
          </div>
        </div>
      </section>

      {/* Social Media & Community Bar */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ocean-50 text-[#0077B6] text-xs font-bold border border-ocean-200 mb-2">
              <span>Official Channels</span>
              <span className="text-slate-400">&bull;</span>
              <span>@vigilamc</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Follow VigilAMC for Fire Safety &amp; AMC Operations Updates
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Field operational tips, statutory compliance developments, and software updates.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://www.linkedin.com/company/vigilamc/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white hover:bg-[#0A66C2] text-slate-700 hover:text-white border border-slate-200 hover:border-[#0A66C2] text-xs font-bold transition-all shadow-xs group"
            >
              <Linkedin className="w-4 h-4 text-[#0A66C2] group-hover:text-white transition-colors" />
              <span>LinkedIn</span>
              <span className="text-[10px] text-slate-400 group-hover:text-blue-100 font-normal">vigilamc</span>
            </a>

            <a
              href="https://www.instagram.com/vigilamc"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] text-slate-700 hover:text-white border border-slate-200 hover:border-pink-500 text-xs font-bold transition-all shadow-xs group"
            >
              <Instagram className="w-4 h-4 text-pink-600 group-hover:text-white transition-colors" />
              <span>Instagram</span>
              <span className="text-[10px] text-slate-400 group-hover:text-pink-100 font-normal">@vigilamc</span>
            </a>

            <a
              href="https://x.com/vigilamc"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white hover:bg-black text-slate-700 hover:text-white border border-slate-200 hover:border-slate-800 text-xs font-bold transition-all shadow-xs group"
            >
              <svg className="w-3.5 h-3.5 fill-current text-slate-800 group-hover:text-white transition-colors" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span>X (Twitter)</span>
              <span className="text-[10px] text-slate-400 group-hover:text-slate-300 font-normal">@vigilamc</span>
            </a>

            <a
              href="https://www.youtube.com/@vigilamc"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white hover:bg-[#FF0000] text-slate-700 hover:text-white border border-slate-200 hover:border-red-500 text-xs font-bold transition-all shadow-xs group"
            >
              <Youtube className="w-4 h-4 text-red-600 group-hover:text-white transition-colors" />
              <span>YouTube</span>
              <span className="text-[10px] text-slate-400 group-hover:text-red-100 font-normal">@vigilamc</span>
            </a>
          </div>
        </div>
      </section>

      {/* Global Image Lightbox Component */}
      <ImageLightbox
        images={galleryImages}
        initialIndex={activeImageIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />

      {/* Workflow Review Modal */}
      <DemoModal
        isOpen={workflowModalOpen}
        onClose={() => setWorkflowModalOpen(false)}
      />
    </div>
  );
}
