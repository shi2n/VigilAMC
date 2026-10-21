'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  ShieldAlert,
  MapPin,
  Camera,
  FileCheck2,
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
  Send,
  Sliders,
  DollarSign,
  Linkedin,
  Instagram,
  Youtube,
  FileText,
  Download,
  AlertTriangle,
  Lock,
  FileSpreadsheet,
  Gauge,
  Activity,
  BellRing,
  Shield,
  MessageCircle,
  Layers,
  CheckCircle
} from 'lucide-react';
import { HeroProductPreview } from '@/components/HeroProductPreview';
import { CanvasHero } from '@/components/CanvasHero';
import { ImageLightbox, LightboxImage } from '@/components/ImageLightbox';
import { StatusBadge } from '@/components/StatusBadge';
import { ProductWorkflowSection } from '@/components/ProductWorkflowSection';
import { ProductInterfacePreview } from '@/components/ProductInterfacePreview';
import { FounderSection } from '@/components/FounderSection';
import { TrustTransparencySection } from '@/components/TrustTransparencySection';
import { FreePilotForm } from '@/components/FreePilotForm';
import { DemoModal } from '@/components/DemoModal';
import { SITE_CONFIG } from '@/lib/siteConfig';

export default function HomePage() {
  // Demo / Workflow review modal
  const [workflowModalOpen, setWorkflowModalOpen] = useState(false);

  // FAQ open state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Interactive ROI Calculator states (Realistic Dual-Lever Indian AMC Economics)
  const [calcBuildings, setCalcBuildings] = useState<number>(10);
  const [calcAssets, setCalcAssets] = useState<number>(750);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // 4 Realistic Indian Fire-Safety Field Inspection Protocols (Pure UI cards, no broken Unsplash links)
  const inspectionProtocols: LightboxImage[] = [
    {
      id: 'extinguishers',
      title: 'Portable Fire Extinguishers (IS 2190)',
      category: 'IS 2190 Maintenance Standard',
      specs: '6kg ABC Powder / 4.5kg CO2 / 9L Water Mist',
      building: 'High-Rise Commercial & Residential Towers',
      auditDate: 'Quarterly Physical Inspection + Annual Refill Log',
      reading: '14.5 Bar [NORMAL]',
      checks: [
        'Pressure gauge reading (Green zone verification)',
        'Gross vs. tare cylinder weight check',
        'Safety pin, lock wire & tamper seal intact',
        'Refill & Hydrostatic Pressure Test (HPT) due dates',
        'Floor location, wing tag & GPS stamped photo'
      ],
      description:
        'Standardized IS 2190 inspection checklists for all portable extinguishers. Track cylinder tare weight, gauge readings, and automated 60/30/7-day alerts for refilling and mandatory 3/5-year hydro-pressure testing.',
    },
    {
      id: 'hydrants',
      title: 'Wet Riser & Hydrant Landing Valves',
      category: 'NBC 2016 Part 4 Standards',
      specs: '63mm Single/Double Headed Landing Valve & 30m Hose Reel',
      building: 'Multi-Tenant Commercial Complexes & Tech Parks',
      auditDate: 'Monthly Hydraulic Flow & Pressure Verification',
      reading: 'Static 7.0 Bar / Dyn 3.5 Bar',
      checks: [
        'Static & dynamic pressure gauge reading (Bar)',
        'Rubber hose reel drum condition & nozzle check',
        'Landing valve gland packing & lug leakage test',
        'Branch pipe nozzle and canvas hose condition',
        'Staircase riser location tag + photo verification'
      ],
      description:
        'Systematic pressure and flow verification for internal wet risers and external yard hydrants. Technicians log dynamic pressure at remote landing valves with timestamped photo proof for Form-B certification.',
    },
    {
      id: 'pumps',
      title: 'Basement Fire Pump House (Offline Mode)',
      category: 'Subterranean Infrastructure',
      specs: 'Main Electrical, Diesel Standby & Jockey Pumps',
      building: 'Sub-level 2/3 Underground Pump Rooms',
      auditDate: 'Weekly Auto-Cut In/Out Operational Test',
      reading: 'Cut-In 5.5 Bar / Cut-Out 7.0 Bar',
      checks: [
        'Auto cut-in / cut-out pressure switch calibration',
        'Suction and delivery manifold valve positions',
        'Diesel engine fuel level, battery voltage & starter',
        'Jockey pump run frequency & leakage detection',
        '100% offline inspection caching in basement depths'
      ],
      description:
        'Ensures reliable fire pump testing even with zero mobile reception in subterranean basements. Technicians test main electrical, diesel standby, and jockey pumps offline; all records sync automatically upon network reconnection.',
    },
    {
      id: 'alarms',
      title: 'Addressable & Conventional Fire Alarm Panels',
      category: 'IS 2189 / NFPA 72 Standards',
      specs: '4-8 Loop Panels • Smoke/Heat Detectors • MCPs & Sounders',
      building: 'IT Parks, Hospitals & Industrial Campuses',
      auditDate: 'Monthly Loop Walkthrough & Standby Power Check',
      reading: 'Loops Normal • 27.2V Standby',
      checks: [
        'Loop open/short fault status and detector health',
        'Standby battery float charge & backup test',
        'Manual call point (MCP) response verification',
        'Hooter / strobe audio-visual sounder check',
        'Control room panel timestamp + photo proof'
      ],
      description:
        'Centralized fire alarm panel audit schedule. Log loop tests, detector maintenance dates, and power supply health to produce tamper-evident inspection trails for client building committees.',
    },
  ];

  const handleOpenLightbox = (index: number) => {
    setActiveImageIndex(index);
    setLightboxOpen(true);
  };

  // Realistic Dual-Lever Indian AMC Economics:
  // 1. Admin & Form-B time saved: ~7 hrs/building/yr (2 biannual Form-B packages + follow-ups)
  //    + ~0.16 hrs/asset/yr (~10 mins/asset across 4 quarterly checks)
  // 2. Supervisor back-office cost: ₹300/hour
  // 3. Billable Defect Recovery: ~8% of assets flagged with photo proof for approved refills/spares @ ₹650 avg net margin
  const adminHoursSaved = Math.round((calcBuildings * 7) + (calcAssets * 0.16));
  const adminCostSaved = adminHoursSaved * 300;
  const recoveredBilling = Math.round(calcAssets * 0.08 * 650);
  const totalAnnualImpact = adminCostSaved + recoveredBilling;

  const faqs = [
    {
      q: 'How much does VigilAMC cost after the free testing phase, and do I own my data?',
      a: 'Founding agencies get 60 days of full access 100% free (including free Excel asset import for your first 3 buildings). Afterward, simple transparent plans start at ₹1,499/month for growing teams and ₹2,999/month for multi-site agencies — locked in for early partners, with zero long-term lock-in and 1-click full Excel/PDF data export at any time.',
    },
    {
      q: 'Will VigilAMC contact my client buildings or compete with my AMC agency?',
      a: 'Never. VigilAMC is pure software — we do NOT provide physical fire AMC services, sell refills, or pitch buildings directly. Your client list, contract expiry dates, and pricing belong strictly to your agency under our Partner Non-Compete Guarantee and multi-tenant database isolation.',
    },
    {
      q: 'How does VigilAMC help fire protection agencies avoid missed compliance deadlines?',
      a: 'VigilAMC tracks every statutory inspection cycle, refilling date, and hydrostatic pressure testing window in a centralised schedule. Automated reminders notify your operations team 60, 30, and 7 days prior to expiry so technician visits can be dispatched well in advance of audit deadlines.',
    },
    {
      q: 'Can technicians inspect assets offline in subterranean basements with zero mobile network?',
      a: 'Yes. Our technician mobile field interface stores inspection checklists and photo logs locally in the browser. When technicians work in underground pump rooms or shielded riser shafts, checks and floor location notes are recorded with local timestamps and synchronize automatically when network connectivity is restored.',
    },
    {
      q: 'Does VigilAMC replace a licensed fire safety contractor or certify buildings directly?',
      a: 'No. VigilAMC is an operational software platform. It does not replace licensed fire safety engineers, licensed agency sign-offs, or municipal fire authorities. Statutory Form-B documents generated on VigilAMC are compiled for review, verification, and signature by authorized personnel holding valid state fire agency licenses.',
    },
    {
      q: 'Already managing your fire assets in Excel or spreadsheets?',
      a: 'Import your existing data into VigilAMC in minutes. Upload your .xlsx or .csv files, review smart column mapping (Clients → Buildings → Assets), inspect validation warnings, and batch import your complete equipment inventory without manual data re-entry. Our team also offers free white-glove Excel onboarding for your first 3 client buildings.',
    },
    {
      q: 'What happens when a critical defect is spotted during an inspection?',
      a: 'When a technician marks an extinguisher as depressurized or flags a leaking hydrant valve, VigilAMC immediately creates a Defect Ticket with attached timestamped photo proof. Service managers can generate itemized client estimate summaries directly from the dashboard so facility managers approve repairs quickly.',
    },
  ];

  return (
    <div className="w-full bg-white overflow-hidden">
      {/* =========================================================================
          HERO SECTION: High-Conversion B2B Messaging & Contractor Focus
          ========================================================================= */}
      <section className="relative min-h-[640px] lg:min-h-[700px] flex items-center justify-center pt-8 pb-16 px-4 sm:px-6 lg:px-8 ocean-mesh border-b border-slate-200/80">
        {/* Animated Particle Canvas */}
        <CanvasHero />

        {/* Ambient Decorative Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#0077B6]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-[#023E8A]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Truthful positioning pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/95 border border-ocean-200/90 shadow-sm text-xs font-semibold text-[#023E8A] mb-8 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-[#0077B6] animate-pulse" />
            <span className="font-medium text-slate-700">Fire Safety AMC Operations Platform</span>
            <span className="text-slate-300">|</span>
            <span className="text-[#0077B6] font-bold">Serving fire protection agencies across India</span>
          </div>

          {/* Primary Main Headline */}
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-[#023E8A] tracking-[-0.03em] leading-[1.12] max-w-4xl mx-auto text-balance">
            Never Miss a Compliance Deadline Again
          </h1>

          {/* Dual-Hook Value Proposition (Compliance Protection + Billable Defect Revenue) */}
          <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-normal text-pretty">
            Protect your AMC contracts against missed refill or hydro-testing deadlines, and get instant photo-backed client approval for billable refills, spare parts, and Form-B certification.
          </p>

          {/* Simplified High-Intent CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setWorkflowModalOpen(true)}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#0077B6] to-[#023E8A] hover:from-[#006494] hover:to-[#011F48] text-white font-bold text-sm sm:text-base shadow-lg shadow-[#0077B6]/25 hover:shadow-xl hover:shadow-[#0077B6]/35 transition-all transform hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Book a 15-Minute Workflow Review &rarr;</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <Link
              href="/sample-report"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-[#023E8A] font-bold text-sm sm:text-base border border-slate-300 hover:border-[#0077B6] shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer group"
            >
              <FileCheck2 className="w-4 h-4 text-[#0077B6]" />
              <span>View Sample Form-B Report &rarr;</span>
            </Link>
          </div>

          {/* Compact Trust Link Below Buttons */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-500">
            <a
              href="#pilot-section"
              className="inline-flex items-center gap-1.5 text-[#0077B6] hover:text-[#023E8A] transition-colors font-semibold"
            >
              <span>Or join free agency testing &darr;</span>
            </a>
            <span className="text-slate-300">&bull;</span>
            <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              60-Day Free Founding Agency Access
            </span>
          </div>

          {/* 4 Clean Feature Cards Under Hero (No Badge Clutter) */}
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto text-left">
            <div className="p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className="w-8 h-8 rounded-lg bg-ocean-50 text-[#0077B6] flex items-center justify-center mb-3">
                <MapPin className="w-4 h-4" />
              </div>
              <h3 className="font-display text-base font-bold text-[#023E8A]">
                GPS-Verified Inspections
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Floor location tags, GPS coordinates, and timestamped photo proof for every asset.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <FileCheck2 className="w-4 h-4" />
              </div>
              <h3 className="font-display text-base font-bold text-[#023E8A]">
                Automated Form-B Reports
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Compile full asset registers and test logs into official Form-B PDF certificates in minutes.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                <Camera className="w-4 h-4" />
              </div>
              <h3 className="font-display text-base font-bold text-[#023E8A]">
                Photo-Verified Quotes
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Depressurized cylinders &amp; leaking valves get instant photo proof for immediate client sign-off.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#023E8A] flex items-center justify-center mb-3">
                <Smartphone className="w-4 h-4" />
              </div>
              <h3 className="font-display text-base font-bold text-[#023E8A]">
                Subterranean Offline Mode
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Technicians log pump room &amp; riser checks offline; records sync automatically upon connection.
              </p>
            </div>
          </div>

          {/* Interactive SaaS Browser + Mobile Mockup Showcase */}
          <HeroProductPreview onOpenModal={() => setWorkflowModalOpen(true)} />
        </div>
      </section>

      {/* =========================================================================
          EXPLICIT PARTNER NON-COMPETE & DATA LOCK TRUST BANNER
          ========================================================================= */}
      <section className="bg-slate-900 text-white py-6 px-4 sm:px-6 lg:px-8 border-y border-slate-800">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>100% Built for AMC Contractors &mdash; Never Your Competitor</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Data Lock Guaranteed
                </span>
              </h4>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                VigilAMC is pure software. We do NOT provide physical fire AMC services, sell refills, or pitch buildings directly. Your client list, pricing, and contract expiry dates belong strictly to your agency and are never shared or contacted by us.
              </p>
            </div>
          </div>
          <Link
            href="/security"
            className="shrink-0 text-xs font-bold text-cyan-300 hover:text-white flex items-center gap-1 transition-colors whitespace-nowrap"
          >
            <span>Read Security Architecture</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* =========================================================================
          INTERACTIVE WORKFLOW SECTION: How VigilAMC Works in Practice
          ========================================================================= */}
      <ProductWorkflowSection />

      {/* =========================================================================
          PLATFORM INTERFACE PREVIEW: Sample Dashboard & Form-B Highlights
          ========================================================================= */}
      <ProductInterfacePreview />

      {/* =========================================================================
          INTERACTIVE ROI & OPERATIONAL TIME SAVINGS CALCULATOR (Realistic Math)
          ========================================================================= */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 border-t border-slate-200">
        <div className="max-w-5xl mx-auto corp-card-elevated p-8 sm:p-12 border-ocean-200/80 ocean-mesh bg-white">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#0077B6] bg-ocean-50 px-3.5 py-1.5 rounded-full border border-ocean-200/80">
              Operational Impact Estimator
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-[#023E8A] tracking-tight mt-3 text-balance">
              Estimate Your Operational Time &amp; Defect Revenue Reclaimed
            </h3>
            <p className="text-sm text-slate-600 mt-2 text-pretty">
              Adjust the sliders to match your active facility portfolio and evaluate realistic time and billable defect revenue reclaimed.
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
                  min="2"
                  max="60"
                  value={calcBuildings}
                  onChange={(e) => setCalcBuildings(parseInt(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0077B6]"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
                  <span>2 Facilities</span>
                  <span>30 Facilities</span>
                  <span>60 Facilities</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Total Fire Assets Managed (Cylinders, Hydrants, Panels)
                  </label>
                  <span className="px-3 py-1 bg-white border border-slate-300 rounded-lg text-sm font-black text-[#0077B6] font-display tabular-nums shadow-xs">
                    {calcAssets} Assets
                  </span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="5000"
                  step="50"
                  value={calcAssets}
                  onChange={(e) => setCalcAssets(parseInt(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0077B6]"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
                  <span>100 Assets</span>
                  <span>2,500 Assets</span>
                  <span>5,000 Assets</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2 shadow-xs">
                <div className="flex items-center gap-2 text-[#023E8A] font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Saves ~7 hrs/facility/year on Form-B compilation &amp; client follow-ups</span>
                </div>
                <div className="flex items-center gap-2 text-[#023E8A] font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Photo evidence prevents unbilled refills &amp; disputed repair quotes</span>
                </div>
              </div>
            </div>

            {/* Calculated Results Card */}
            <div className="bg-gradient-to-br from-[#023E8A] via-[#022A5E] to-[#011F48] text-white p-7 sm:p-8 rounded-2xl shadow-xl flex flex-col justify-between space-y-6 border border-cyan-500/20">
              <div>
                <div className="text-xs uppercase font-extrabold tracking-wider text-cyan-200 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                  Admin &amp; Reporting Time Reclaimed
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-display text-4xl sm:text-5xl font-black text-white tabular-nums tracking-tight">
                    {adminHoursSaved}
                  </span>
                  <span className="text-base text-cyan-200 font-semibold">Hours / Year</span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Based on 7 hrs/facility/yr for biannual Form-B preparation plus ~10 mins/asset across quarterly inspections.
                </p>
              </div>

              <div className="pt-4 border-t border-navy-400/30">
                <div className="text-xs text-cyan-200 font-semibold">
                  Estimated Annual Business Impact
                </div>
                <div className="font-display text-2xl sm:text-3xl font-black text-white mt-1 tabular-nums tracking-tight">
                  ₹{totalAnnualImpact.toLocaleString('en-IN')}{' '}
                  <span className="text-xs text-slate-300 font-normal">/ yr</span>
                </div>

                {/* Transparent Breakdown Pills */}
                <div className="mt-3 space-y-1.5 text-[11px] font-mono">
                  <div className="p-2 rounded bg-navy-900/70 border border-navy-700/60 text-cyan-100 flex items-center justify-between">
                    <span>Admin &amp; Excel Time:</span>
                    <strong className="text-white">₹{adminCostSaved.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="p-2 rounded bg-navy-900/70 border border-navy-700/60 text-emerald-200 flex items-center justify-between">
                    <span>Photo-Approved Refills &amp; Spares:</span>
                    <strong className="text-emerald-300">+ ₹{recoveredBilling.toLocaleString('en-IN')}</strong>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 mt-2 italic">
                  * Formula: (Hours saved &times; ₹300/hr supervisor cost) + (8% assets with photo-approved defect billing @ ₹650 avg margin).
                </p>
              </div>

              <button
                onClick={() => setWorkflowModalOpen(true)}
                className="w-full py-3.5 bg-[#0077B6] hover:bg-white hover:text-[#023E8A] text-white font-bold text-xs uppercase tracking-wider rounded-xl text-center transition-all shadow-md active:scale-[0.98] cursor-pointer"
              >
                Schedule 15-Minute Agency Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          REALISTIC INDIAN FIRE-SAFETY FIELD INSPECTION CARDS (Replaces Unsplash)
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
              Standardized statutory checklists with floor location notes, GPS position, and timestamped photo verification for every critical fire asset type.
            </p>
          </div>

          {/* 4 Crisp Visual Inspection UI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {inspectionProtocols.map((protocol, idx) => (
              <div
                key={protocol.id}
                onClick={() => handleOpenLightbox(idx)}
                className="corp-card overflow-hidden group cursor-pointer bg-white transition-all transform hover:-translate-y-1.5 border border-slate-200 shadow-sm hover:shadow-md flex flex-col justify-between"
              >
                {/* Visual Stamped Mock Header */}
                <div className="relative p-5 bg-gradient-to-br from-[#0A1A33] via-[#0F274D] to-[#08152B] text-white overflow-hidden">
                  <div className="flex items-center justify-between text-[10px] font-mono text-cyan-300 pb-2 border-b border-slate-700/60">
                    <span className="truncate pr-1">{protocol.category}</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold shrink-0">
                      {protocol.reading}
                    </span>
                  </div>

                  <div className="pt-3 pb-2">
                    <div className="w-10 h-10 rounded-xl bg-[#0077B6]/30 border border-cyan-400/30 flex items-center justify-center text-cyan-300 mb-2 group-hover:scale-110 transition-transform">
                      {idx === 0 && <Flame className="w-5 h-5 text-amber-400" />}
                      {idx === 1 && <Gauge className="w-5 h-5 text-cyan-400" />}
                      {idx === 2 && <Activity className="w-5 h-5 text-emerald-400" />}
                      {idx === 3 && <BellRing className="w-5 h-5 text-blue-400" />}
                    </div>
                    <h4 className="font-bold text-sm text-white line-clamp-1 group-hover:text-cyan-200 transition-colors">
                      {protocol.title}
                    </h4>
                    <p className="text-[11px] text-cyan-100/70 font-mono mt-0.5 line-clamp-1">
                      {protocol.specs}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800 font-mono">
                    <span>GPS &bull; Time &bull; Photo</span>
                    <span className="text-cyan-300 group-hover:underline">View Specs &rarr;</span>
                  </div>
                </div>

                {/* Inspection Checklist Items */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Field Verifications:
                    </span>
                    {protocol.checks?.slice(0, 3).map((check, cIdx) => (
                      <div key={cIdx} className="text-xs text-slate-600 flex items-start gap-1.5 leading-snug">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{check}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="truncate">{protocol.building}</span>
                    <span className="text-[#0077B6] font-bold shrink-0">Click to Inspect</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Verified Standards & Evidence Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="corp-card p-6 bg-slate-50 border border-slate-200 shadow-sm">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                Statutory Framework
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                VigilAMC aligns its equipment schedules with <strong>NBC 2016 Part 4</strong>, <strong>IS 2190</strong> maintenance protocols, and applicable state and municipal fire safety acts.
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
                Every field technician log includes GPS position, floor and location notes, and inspection timestamps for tamper-evident service records that facility managers trust.
              </p>
              <div className="mt-6 pt-4 border-t border-slate-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#023E8A] text-white flex items-center justify-center font-bold text-xs">
                  GPS
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900">Digital Verification</h5>
                  <p className="text-[11px] text-slate-500">Location Notes &amp; Time Log</p>
                </div>
              </div>
            </div>

            <div className="corp-card p-6 bg-slate-50 border border-slate-200 shadow-sm">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-100 text-cyan-800 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-600"></span>
                Billable Defect Proof
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                Flag depressurized cylinders, leaking landing valves, and dead batteries with timestamped photos. Generate client repair estimates in 1 click so quotes get approved fast.
              </p>
              <div className="mt-6 pt-4 border-t border-slate-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0077B6] text-white flex items-center justify-center font-bold text-xs">
                  ₹
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900">1-Click Repair Quotes</h5>
                  <p className="text-[11px] text-slate-500">Photo-Backed Client Approvals</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          LEADERSHIP & FOUNDER PROMISE SECTION
          ========================================================================= */}
      <FounderSection />

      {/* =========================================================================
          HONEST TRUST & TRANSPARENCY SECTION
          ========================================================================= */}
      <TrustTransparencySection />

      {/* =========================================================================
          FREQUENTLY ASKED QUESTIONS (FAQS)
          ========================================================================= */}
      <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 border-t border-slate-200 scroll-mt-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#0077B6] bg-ocean-50 px-3.5 py-1.5 rounded-full border border-ocean-200">
              Clear Answers
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#023E8A] tracking-tight mt-3">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Common questions about VigilAMC software capabilities, data privacy, and testing terms.
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

          <div className="mt-12 text-center text-xs text-slate-500">
            Have a specific AMC workflow or municipal requirement?{' '}
            <Link href="/contact" className="text-[#0077B6] font-bold underline hover:text-[#023E8A] transition-colors">
              Speak directly with our team
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          JOIN THE FREE TESTING (PILOT APPLICATION FORM)
          ========================================================================= */}
      <section id="pilot-section" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#023E8A] via-[#022A5E] to-[#011F48] text-white relative overflow-hidden border-t border-navy-700/60 scroll-mt-16">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-navy-800/80 text-cyan-200 text-xs font-bold border border-cyan-400/20 shadow-sm mb-4">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>Testing Phase &bull; Free Access</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Join the Free Testing Program
            </h2>
            <p className="text-sm sm:text-base text-cyan-100 mt-3 leading-relaxed">
              VigilAMC is in its testing phase and is free for every agency that joins. Test asset registration, GPS and photo-verified inspections, and Form-B generation with direct founder onboarding.
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
              href={SITE_CONFIG.SOCIAL.LINKEDIN}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white hover:bg-[#0A66C2] text-slate-700 hover:text-white border border-slate-200 hover:border-[#0A66C2] text-xs font-bold transition-all shadow-xs group"
            >
              <Linkedin className="w-4 h-4 text-[#0A66C2] group-hover:text-white transition-colors" />
              <span>LinkedIn</span>
              <span className="text-[10px] text-slate-400 group-hover:text-blue-100 font-normal">vigilamc</span>
            </a>

            <a
              href={SITE_CONFIG.SOCIAL.INSTAGRAM}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] text-slate-700 hover:text-white border border-slate-200 hover:border-pink-500 text-xs font-bold transition-all shadow-xs group"
            >
              <Instagram className="w-4 h-4 text-pink-600 group-hover:text-white transition-colors" />
              <span>Instagram</span>
              <span className="text-[10px] text-slate-400 group-hover:text-pink-100 font-normal">@vigilamc</span>
            </a>

            <a
              href={SITE_CONFIG.SOCIAL.TWITTER}
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
              href={SITE_CONFIG.SOCIAL.YOUTUBE}
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
        images={inspectionProtocols}
        initialIndex={activeImageIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />

      {/* Demo Modal */}
      <DemoModal
        isOpen={workflowModalOpen}
        onClose={() => setWorkflowModalOpen(false)}
      />
    </div>
  );
}
