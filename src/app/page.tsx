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
  Youtube
} from 'lucide-react';
import { CanvasHero } from '@/components/CanvasHero';
import { ImageLightbox, LightboxImage } from '@/components/ImageLightbox';

export default function HomePage() {
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

  // Quick inquiry form states
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryBuildings, setInquiryBuildings] = useState('3-10');
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [inquiryError, setInquiryError] = useState('');

  const galleryImages: LightboxImage[] = [
    {
      src: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80',
      title: 'Commercial Multi-Story Life Safety Infrastructure',
      category: 'Commercial Facility',
      building: 'Standard High-Rise Facility Inspection',
      auditDate: 'Inspection Protocol',
      description: 'Extinguishers, landing valves, and yard hydrants monitored with digital timestamping for statutory compliance.',
    },
    {
      src: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80',
      title: 'Healthcare & Critical Infrastructure Safety Audit',
      category: 'Healthcare AMC Flow',
      building: 'Hospital & Critical Care Facility',
      auditDate: 'Compliance Workflow',
      description: 'Zero-tolerance safety compliance with real-time logging of wet risers, clean-agent suppression, and 24/7 digital records.',
    },
    {
      src: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=1200&q=80',
      title: 'Weatherproof Metal QR Tagging in Action',
      category: 'Field Inspection',
      building: 'Industrial Plant & Logistics Warehouse',
      auditDate: 'Field Tagging Standards',
      description: 'Anodized aluminum QR label installed on CO2 cylinder. Withstands UV exposure and industrial washdowns.',
    },
    {
      src: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
      title: 'Hydrant Flow & Pressure Gauge Verification',
      category: 'Wet Riser Testing',
      building: 'Commercial Multi-Tenant Complex',
      auditDate: 'Pressure Testing Workflow',
      description: 'Technicians log dynamic pressure readings using digital checklists to keep Form-B certification schedules updated.',
    },
  ];

  const handleOpenLightbox = (index: number) => {
    setActiveImageIndex(index);
    setLightboxOpen(true);
  };

  const handleQuickInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryEmail || !inquiryEmail.includes('@')) {
      setInquiryError('Please enter a valid business email');
      return;
    }
    setInquiryError('');
    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'QUICK_INQUIRY',
          email: inquiryEmail,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit inquiry');
      }
      setInquirySubmitted(true);
      setTimeout(() => {
        setInquiryEmail('');
        setInquirySubmitted(false);
      }, 5000);
    } catch (err: any) {
      setInquiryError(err.message || 'Error submitting. Please try again.');
    }
  };

  // ROI calculations
  const manualHoursSpentPerMonth = Math.round((calcAssets * 0.45) + (calcBuildings * 8));
  const vigilHoursSpentPerMonth = Math.round(manualHoursSpentPerMonth * 0.18);
  const hoursSavedPerYear = (manualHoursSpentPerMonth - vigilHoursSpentPerMonth) * 12;
  const costSavingsPerYear = (hoursSavedPerYear * 650).toLocaleString('en-IN');

  const faqs = [
    {
      q: 'How does VigilAMC prevent our clients from failing their Fire NOC audit?',
      a: 'VigilAMC tracks every statutory renewal, hydrostatic pressure test, refilling date, and quarterly inspection cycle automatically. 60, 30, and 7 days prior to any deadline, our system triggers automated alerts to your technicians and client facility heads. When audit day comes, our 1-click Form-B report compiles full photographic proof, calibration logs, and certified technician sign-offs ready for immediate Fire Directorate sign-off.',
    },
    {
      q: 'Can technicians inspect assets offline in basements with zero mobile network?',
      a: 'Yes! The VigilAMC technician mobile web application operates fully offline. Technicians can scan QR codes, log gauge readings, take inspection photos, and record defects even in deep subterranean basement pump rooms or shielded riser shafts. Once the device re-enters cellular or Wi-Fi range, all audit records sync automatically with encrypted timestamp validation.',
    },
    {
      q: 'How difficult is it to migrate from our current Excel spreadsheets?',
      a: 'Migration takes less than 24 hours. You can upload your existing equipment spreadsheets via our Bulk Asset Importer CSV/Excel template. Our AI validation engine maps floor locations, equipment types, and last test dates automatically. We also provide pre-printed, serialized industrial weatherproof QR labels ready to stick onto extinguishers, hydrants, and panels.',
    },
    {
      q: 'Does VigilAMC support official Form-B certification and Indian Fire Directorate standards?',
      a: 'Yes. VigilAMC is engineered specifically to comply with the Maharashtra Fire Prevention and Life Safety Measures Act, National Building Code (NBC 2016 Part 4), and NFPA 10, 25, and 72 standards. The platform generates legally formatted Form-B certificates containing licensed agency registration numbers, digital supervisor stamps, and asset schedules.',
    },
    {
      q: 'What happens when a critical defect is spotted during an inspection?',
      a: 'When a technician marks an extinguisher as depressurized, or notes a leaking landing valve, VigilAMC instantly generates a high-priority Defect Ticket. An immediate WhatsApp and email alert is dispatched to your service manager, along with an instant quotation line item that can be forwarded to the client facility manager for fast repair approval.',
    },
  ];

  return (
    <div className="w-full bg-white overflow-hidden">
      {/* =========================================================================
          HERO SECTION: Interactive Canvas, Corporate Ocean Blue (#0077B6) & Navy
          ========================================================================= */}
      <section className="relative min-h-[640px] lg:min-h-[720px] flex items-center justify-center pt-10 pb-20 px-4 sm:px-6 lg:px-8 ocean-mesh border-b border-slate-200/80">
        {/* Animated Particle & Connected Safety Node Canvas */}
        <CanvasHero />

        {/* Ambient Decorative Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#0077B6]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-[#023E8A]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Compliance Assurance Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/95 border border-ocean-200/90 shadow-sm text-xs font-semibold text-[#023E8A] mb-8 backdrop-blur-md transition-all hover:border-[#0077B6]/50">
            <span className="flex h-2 w-2 rounded-full bg-[#0077B6] animate-pulse" />
            <span className="font-medium text-slate-700">Trusted by <strong className="text-[#023E8A]">450+ Certified Fire AMC Agencies</strong></span>
            <span className="text-slate-300">|</span>
            <span className="text-[#0077B6] font-bold">100% Audit Readiness</span>
          </div>

          {/* Primary Main Headline */}
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-[#023E8A] tracking-[-0.03em] leading-[1.12] max-w-4xl mx-auto text-balance">
            Never miss a compliance deadline again.
          </h1>

          {/* Prompt Persona Subtitle */}
          <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-normal text-pretty">
            AMC teams track hundreds of extinguishers, hydrants and panels across dozens of buildings — on paper and Excel. Renewals slip, clients fail their fire NOC audit, and the contract goes to a competitor. <strong className="text-[#023E8A] font-semibold">VigilAMC puts every asset, due date and client report on autopilot.</strong>
          </p>

          {/* Primary CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#0077B6] to-[#023E8A] hover:from-[#006494] hover:to-[#011F48] text-white font-bold text-sm sm:text-base shadow-lg shadow-[#0077B6]/25 hover:shadow-xl hover:shadow-[#0077B6]/35 transition-all transform hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2 group"
            >
              <span>Create Agency Account</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-[#023E8A] font-bold text-sm sm:text-base border border-slate-300 hover:border-[#0077B6] shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-[#0077B6]" />
              <span>Access Dashboard</span>
            </Link>

            <a
              href="#launch-demo"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-ocean-50/90 hover:bg-ocean-100 text-[#0077B6] hover:text-[#023E8A] font-bold text-sm sm:text-base border border-ocean-200/90 shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 text-[#0077B6] fill-current" />
              <span>Watch 20s Launch Demo</span>
            </a>
          </div>

          {/* Core System Capabilities Badges */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="corp-card p-5 bg-white/95 backdrop-blur-md text-left transition-all hover:-translate-y-1 hover:shadow-card-hover border border-slate-200/90">
              <div className="font-display text-2xl sm:text-3xl font-black text-[#023E8A] tabular-nums tracking-tight">100%</div>
              <div className="text-xs font-semibold text-slate-500 mt-1">Audit-Proof Digital Records</div>
            </div>

            <div className="corp-card p-5 bg-white/95 backdrop-blur-md text-left transition-all hover:-translate-y-1 hover:shadow-card-hover border border-slate-200/90">
              <div className="font-display text-2xl sm:text-3xl font-black text-[#0077B6] tracking-tight">Instant</div>
              <div className="text-xs font-semibold text-slate-500 mt-1">QR Mobile Field Scanning</div>
            </div>

            <div className="corp-card p-5 bg-white/95 backdrop-blur-md text-left transition-all hover:-translate-y-1 hover:shadow-card-hover border border-slate-200/90">
              <div className="font-display text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">Zero</div>
              <div className="text-xs font-semibold text-slate-500 mt-1">Missed Expiry Deadlines</div>
            </div>

            <div className="corp-card p-5 bg-white/95 backdrop-blur-md text-left transition-all hover:-translate-y-1 hover:shadow-card-hover border border-slate-200/90">
              <div className="font-display text-2xl sm:text-3xl font-black text-[#023E8A] tracking-tight">1-Click</div>
              <div className="text-xs font-semibold text-slate-500 mt-1">Form-B PDF Generation</div>
            </div>
          </div>

          {/* =========================================================================
              FEATURED PRODUCT LAUNCH VIDEO
              ========================================================================= */}
          <div id="launch-demo" className="mt-16 max-w-4xl mx-auto scroll-mt-24">
            <div className="relative rounded-2xl p-2.5 sm:p-3.5 bg-gradient-to-b from-white/95 via-ocean-50/40 to-slate-100/90 backdrop-blur-md border border-ocean-200/90 shadow-elevated overflow-hidden group">
              <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#021B3A] text-white rounded-xl mb-2.5 text-xs font-semibold shadow-inner">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-display tracking-wider uppercase text-[11px] text-cyan-200 font-bold">
                    VigilAMC In Action &bull; 20-Second Product Tour
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-3 text-[11px] text-cyan-100/80">
                  <span className="px-2 py-0.5 rounded bg-ocean-800/80 text-cyan-200 border border-ocean-600/50">100% Offline QR Scanning</span>
                  <span className="text-slate-500">&bull;</span>
                  <span className="px-2 py-0.5 rounded bg-ocean-800/80 text-cyan-200 border border-ocean-600/50">1-Click Form-B Compliance</span>
                </div>
              </div>

              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-950 shadow-2xl border border-slate-800/50">
                <video
                  src="/brag.mp4"
                  poster="/brag.jpg"
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          CONTENT LAYOUT: Timeline / Scroll-based Storytelling Layout
          "From Paper & Excel Chaos to Autopilot Compliance"
          ========================================================================= */}
      <section id="how-it-works" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-white relative">
        <div className="max-w-6xl mx-auto">
          {/* Section Header with generous whitespace */}
          <div className="text-center max-w-3xl mx-auto mb-20 reveal-on-scroll">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#0077B6] bg-ocean-50 px-3 py-1 rounded-full border border-ocean-200">
              The AMC Transformation Storyline
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#023E8A] tracking-tight mt-4">
              How VigilAMC Transforms Broken AMC Operations
            </h2>
            <p className="mt-3 text-base text-slate-600 leading-relaxed">
              Step through the journey of how leading fire safety agencies replaced lost clipboards, missed refill dates, and frantic audit panics with an ironclad digital autopilot.
            </p>
          </div>

          {/* Timeline Vertical Container */}
          <div className="relative">
            {/* Center Track Line */}
            <div className="hidden md:block absolute left-1/2 top-4 bottom-12 -translate-x-1/2 w-1 timeline-track rounded-full opacity-30" />

            {/* Timeline Item 1: The Paper Chaos */}
            <div className="relative mb-16 md:mb-24 reveal-on-scroll">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="md:w-1/2 text-left md:text-right md:pr-12">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 text-red-700 text-xs font-bold border border-red-200 mb-2">
                    <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                    Stage 01: The Old Way
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                    The Paper &amp; Excel Trap
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                    Extinguishers sit hidden behind stairwells with faded paper inspection tags. Technicians check boxes from memory. Hydrostatic pressure renewals slip by weeks. When the Fire Officer conducts a surprise audit, the client fails, faces heavy fines, and fires the AMC contractor.
                  </p>
                  <ul className="mt-3 space-y-1.5 text-xs text-red-600 inline-block text-left font-medium">
                    <li className="flex items-center gap-2">
                      <X className="w-4 h-4 text-red-500 shrink-0" />
                      Unverified inspections with zero proof
                    </li>
                    <li className="flex items-center gap-2">
                      <X className="w-4 h-4 text-red-500 shrink-0" />
                      Client loses trust &amp; switches to competitors
                    </li>
                  </ul>
                </div>

                {/* Timeline Center Node Badge */}
                <div className="relative z-10 w-12 h-12 rounded-full bg-red-100 border-4 border-white shadow-md flex items-center justify-center text-red-600 shrink-0">
                  <Flame className="w-5 h-5" />
                </div>

                <div className="md:w-1/2 md:pl-12">
                  <div className="corp-card p-6 bg-slate-50 border-red-100">
                    <div className="flex items-center justify-between text-xs text-slate-500 pb-3 border-b border-slate-200">
                      <span className="font-mono text-red-700 font-bold">LEGACY_AUDIT_LOG.XLSX</span>
                      <span className="text-red-600 font-semibold">STATUS: 42 DAYS OVERDUE</span>
                    </div>
                    <div className="mt-3 space-y-2 text-xs">
                      <div className="flex justify-between p-2 rounded bg-white border border-slate-200 text-slate-700">
                        <span>Extinguisher #EX-084 (Basement 2)</span>
                        <span className="text-red-600 font-bold">Depressurized (Unreported)</span>
                      </div>
                      <div className="flex justify-between p-2 rounded bg-white border border-slate-200 text-slate-700">
                        <span>Hydrant Yard Landing Valve 4</span>
                        <span className="text-amber-600 font-bold">Gland Packing Leaking</span>
                      </div>
                      <div className="flex justify-between p-2 rounded bg-white border border-slate-200 text-slate-700">
                        <span>Fire NOC Renewal Window</span>
                        <span className="text-red-700 font-black">EXPIRED 14 DAYS AGO</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline Item 2: QR Tagging & Calibration */}
            <div className="relative mb-16 md:mb-24 reveal-on-scroll">
              <div className="flex flex-col md:flex-row-reverse items-center gap-8">
                <div className="md:w-1/2 text-left md:pl-12">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-ocean-50 text-[#0077B6] text-xs font-bold border border-ocean-200 mb-2">
                    <QrCode className="w-3.5 h-3.5 text-[#0077B6]" />
                    Stage 02: 12-Second Setup
                  </div>
                  <h3 className="text-2xl font-bold text-[#023E8A] tracking-tight">
                    Instant Smart QR Tagging
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                    Every fire asset receives a tamper-resistant industrial QR code. In 12 seconds per extinguisher or hydrant, your team scans the code, records capacity, chemical type, manufacturing date, and geo-tags the exact pillar or corridor location.
                  </p>
                  <ul className="mt-3 space-y-1.5 text-xs text-slate-700 font-medium">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      Weatherproof, grease-proof anodized metallic QR stickers
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      Bulk Excel import auto-creates entire building directories
                    </li>
                  </ul>
                </div>

                {/* Timeline Center Node Badge */}
                <div className="relative z-10 w-12 h-12 rounded-full bg-[#0077B6] border-4 border-white shadow-md flex items-center justify-center text-white shrink-0">
                  <QrCode className="w-5 h-5" />
                </div>

                <div className="md:w-1/2 md:pr-12">
                  <div className="corp-card p-6 bg-gradient-to-br from-white to-ocean-50 border-ocean-200">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-white border border-slate-300 p-1 flex items-center justify-center shadow-inner">
                        <QrCode className="w-10 h-10 text-[#023E8A]" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#023E8A]">ASSET TAG: VIGIL-MH-4019</h4>
                        <p className="text-xs text-slate-500">6kg ABC Dry Powder Extinguisher</p>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded bg-white border border-slate-200">
                        <span className="text-slate-400 block">Location</span>
                        <span className="font-semibold text-slate-800">4th Floor North Wing</span>
                      </div>
                      <div className="p-2 rounded bg-white border border-slate-200">
                        <span className="text-slate-400 block">Hydrostatic Test</span>
                        <span className="font-semibold text-emerald-600">Valid till Nov 2027</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline Item 3: Mobile Auditing & Proof */}
            <div className="relative mb-16 md:mb-24 reveal-on-scroll">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="md:w-1/2 text-left md:text-right md:pr-12">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-ocean-50 text-[#0077B6] text-xs font-bold border border-ocean-200 mb-2">
                    <Smartphone className="w-3.5 h-3.5 text-[#0077B6]" />
                    Stage 03: Field Inspections
                  </div>
                  <h3 className="text-2xl font-bold text-[#023E8A] tracking-tight">
                    GPS &amp; Photo-Verified Audits
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                    Technicians scan each asset QR code on their smartphone. The app enforces NFPA-compliant visual checks: pressure gauge in green zone, nozzle clear, seal intact, hose uncracked. Zero fake proxy check-ins are allowed — geo-fencing confirms physical presence.
                  </p>
                  <ul className="mt-3 space-y-1.5 text-xs text-slate-700 inline-block text-left font-medium">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      100% offline capability for underground basement plant rooms
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      Instant defect escalation with attached high-res photo proof
                    </li>
                  </ul>
                </div>

                {/* Timeline Center Node Badge */}
                <div className="relative z-10 w-12 h-12 rounded-full bg-[#023E8A] border-4 border-white shadow-md flex items-center justify-center text-white shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>

                <div className="md:w-1/2 md:pl-12">
                  <div className="corp-card p-6 bg-white border-slate-200">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        Technician: Suresh P. (ID: TECH-108)
                      </span>
                      <span className="text-[11px] font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold">
                        GPS VERIFIED
                      </span>
                    </div>
                    <div className="mt-3 space-y-2 text-xs">
                      <div className="flex items-center justify-between p-2 rounded bg-slate-50">
                        <span>Pressure Gauge Indicator</span>
                        <span className="text-emerald-600 font-bold">✓ 14.5 Bar (Normal)</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-slate-50">
                        <span>Tamper Seal &amp; Safety Pin</span>
                        <span className="text-emerald-600 font-bold">✓ Intact / Original</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-slate-50">
                        <span>Discharge Horn &amp; Hose</span>
                        <span className="text-emerald-600 font-bold">✓ No Obstructions</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline Item 4: 1-Click Form-B Certification */}
            <div className="relative reveal-on-scroll">
              <div className="flex flex-col md:flex-row-reverse items-center gap-8">
                <div className="md:w-1/2 text-left md:pl-12">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-2">
                    <Award className="w-3.5 h-3.5 text-emerald-600" />
                    Stage 04: The Autopilot
                  </div>
                  <h3 className="text-2xl font-bold text-[#023E8A] tracking-tight">
                    1-Click Form-B &amp; Contract Retained
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                    Generate the government-mandated Form-B Biannual Fire Safety Certificate in 3 seconds. The report automatically aggregates every extinguisher, hydrant flow test, and panel loop audit with licensed supervisor signatures. Your client passes every audit, and renews your contract year after year.
                  </p>
                  <ul className="mt-3 space-y-1.5 text-xs text-slate-700 font-medium">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      Direct PDF download compliant with State Fire Directorate
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      Client portal access with live compliance score (98.4%)
                    </li>
                  </ul>
                </div>

                {/* Timeline Center Node Badge */}
                <div className="relative z-10 w-12 h-12 rounded-full bg-emerald-600 border-4 border-white shadow-md flex items-center justify-center text-white shrink-0">
                  <FileCheck2 className="w-5 h-5" />
                </div>

                <div className="md:w-1/2 md:pr-12">
                  <div className="corp-card p-6 bg-gradient-to-br from-emerald-50/40 to-white border-emerald-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <FileCheck2 className="w-6 h-6 text-emerald-600" />
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">FORM-B CERTIFICATE</h4>
                          <p className="text-[11px] text-slate-500">Sec 3(1) Fire Safety Act 2006</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
                        APPROVED
                      </span>
                    </div>

                    <div className="mt-4 p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
                      <div className="flex justify-between">
                        <span>Total Assets Inspected:</span>
                        <strong className="text-slate-800">420 of 420 (100%)</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Licenced Agency Reg No:</span>
                        <strong className="text-[#023E8A]">MH/FIRE/LIC/2022/A-412</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Fire NOC Audit Validity:</span>
                        <strong className="text-emerald-700">Valid through March 2027</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FEATURES SECTION: Corporate Grid with Breathing Room & Tabs
          ========================================================================= */}
      <section id="features" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20 reveal-on-scroll">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#0077B6] bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
              Complete AMC Control
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#023E8A] tracking-tight mt-4">
              Everything Your Fire AMC Operation Needs to Scale
            </h2>
            <p className="mt-3 text-base text-slate-600 leading-relaxed">
              Designed hand-in-hand with leading Fire Safety Service Engineers and Facility Operations Heads.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {/* Feature 1 */}
            <div className="corp-card p-8 bg-white reveal-on-scroll flex flex-col justify-between h-full border border-slate-200/80 shadow-card hover:shadow-card-hover group">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-ocean-50 text-[#0077B6] flex items-center justify-center border border-ocean-100 shadow-xs group-hover:scale-105 transition-transform">
                    <QrCode className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-ocean-50 text-[#0077B6] border border-ocean-200">
                    Field Tagging
                  </span>
                </div>
                <h3 className="font-display text-xl font-bold text-[#023E8A] tracking-tight group-hover:text-[#0077B6] transition-colors">
                  Asset QR Registry &amp; Floor Maps
                </h3>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed text-pretty">
                  Scan, register, and tag fire extinguishers, landing valves, hose reels, and smoke heads in seconds. View color-coded compliance status directly on interactive floor architectural diagrams.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-[#0077B6] group-hover:text-[#023E8A] transition-colors">
                <span>Explore QR Registry</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>

            {/* Feature 2 */}
            <div className="corp-card p-8 bg-white reveal-on-scroll delay-100 flex flex-col justify-between h-full border border-slate-200/80 shadow-card hover:shadow-card-hover group">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-navy-50 text-[#023E8A] flex items-center justify-center border border-navy-100 shadow-xs group-hover:scale-105 transition-transform">
                    <BellRing className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    Automated
                  </span>
                </div>
                <h3 className="font-display text-xl font-bold text-[#023E8A] tracking-tight group-hover:text-[#0077B6] transition-colors">
                  Renewal &amp; WhatsApp Alerts
                </h3>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed text-pretty">
                  Never let an extinguisher refilling date slip. VigilAMC automatically sends WhatsApp, SMS, and email alerts to clients and technicians 60, 30, and 7 days prior to expiry.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-[#0077B6] group-hover:text-[#023E8A] transition-colors">
                <span>Explore Alert Workflows</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>

            {/* Feature 3 */}
            <div className="corp-card p-8 bg-white reveal-on-scroll delay-200 flex flex-col justify-between h-full border border-slate-200/80 shadow-card hover:shadow-card-hover group">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-ocean-50 text-[#0077B6] flex items-center justify-center border border-ocean-100 shadow-xs group-hover:scale-105 transition-transform">
                    <FileCheck2 className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Statutory NOC
                  </span>
                </div>
                <h3 className="font-display text-xl font-bold text-[#023E8A] tracking-tight group-hover:text-[#0077B6] transition-colors">
                  1-Click Form-B Compliance Filing
                </h3>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed text-pretty">
                  Instant generation of statutory Biannual Form-B certificates compliant with State Fire Directorate laws, complete with digital signatures and full equipment inspection audit trails.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-[#0077B6] group-hover:text-[#023E8A] transition-colors">
                <span>View Sample Form-B PDF</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>

            {/* Feature 4 */}
            <div className="corp-card p-8 bg-white reveal-on-scroll flex flex-col justify-between h-full border border-slate-200/80 shadow-card hover:shadow-card-hover group">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-navy-50 text-[#023E8A] flex items-center justify-center border border-navy-100 shadow-xs group-hover:scale-105 transition-transform">
                    <Smartphone className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200">
                    Offline Ready
                  </span>
                </div>
                <h3 className="font-display text-xl font-bold text-[#023E8A] tracking-tight group-hover:text-[#0077B6] transition-colors">
                  Offline Technician Mobile App
                </h3>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed text-pretty">
                  Technicians work uninterrupted in deep underground pump rooms, basements, or shielded stairwells. All data syncs automatically once reconnected with tamper-proof timestamps.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-[#0077B6] group-hover:text-[#023E8A] transition-colors">
                <span>Mobile App Features</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>

            {/* Feature 5 */}
            <div className="corp-card p-8 bg-white reveal-on-scroll delay-100 flex flex-col justify-between h-full border border-slate-200/80 shadow-card hover:shadow-card-hover group">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-ocean-50 text-[#0077B6] flex items-center justify-center border border-ocean-100 shadow-xs group-hover:scale-105 transition-transform">
                    <Building2 className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Multi-Tower
                  </span>
                </div>
                <h3 className="font-display text-xl font-bold text-[#023E8A] tracking-tight group-hover:text-[#0077B6] transition-colors">
                  Operations Command Dashboard
                </h3>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed text-pretty">
                  Manage 5 or 500 buildings on a unified executive dashboard. Track technician routes, inspection throughput, pending defect repair workorders, and portfolio-wide audit readiness.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-[#0077B6] group-hover:text-[#023E8A] transition-colors">
                <span>Enterprise Multi-Tower</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>

            {/* Feature 6 */}
            <div className="corp-card p-8 bg-white reveal-on-scroll delay-200 flex flex-col justify-between h-full border border-slate-200/80 shadow-card hover:shadow-card-hover group">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-navy-50 text-[#023E8A] flex items-center justify-center border border-navy-100 shadow-xs group-hover:scale-105 transition-transform">
                    <Users className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Retention
                  </span>
                </div>
                <h3 className="font-display text-xl font-bold text-[#023E8A] tracking-tight group-hover:text-[#0077B6] transition-colors">
                  Client Transparency Portal
                </h3>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed text-pretty">
                  Delight your clients with their own branded compliance portal. Facility directors can view live equipment health, download certificates 24/7, and approve refilling quotes in 1 click.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-[#0077B6] group-hover:text-[#023E8A] transition-colors">
                <span>Client Portal Preview</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          INTERACTIVE FEATURE: Live ROI & Asset Savings Calculator
          ========================================================================= */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto corp-card-elevated p-8 sm:p-12 border-ocean-200/80 ocean-mesh">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#0077B6] bg-ocean-50 px-3.5 py-1.5 rounded-full border border-ocean-200/80">
              Interactive ROI Calculator
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-[#023E8A] tracking-tight mt-3 text-balance">
              Calculate Your Operational Hours &amp; Cost Savings
            </h3>
            <p className="text-sm text-slate-600 mt-2 text-pretty">
              Slide to match your portfolio size and see how much time and money VigilAMC saves your AMC business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            {/* Sliders */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Buildings / Towers Managed
                  </label>
                  <span className="px-3 py-1 bg-white border border-slate-300 rounded-lg text-sm font-black text-[#023E8A] font-display tabular-nums shadow-xs">
                    {calcBuildings} Towers
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
                  <span>1 Tower</span>
                  <span>20 Towers</span>
                  <span>40+ Towers</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Total Fire Safety Assets (Extinguishers, Hydrants, Panels)
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

              <div className="p-4 bg-white/90 backdrop-blur-xs rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2 shadow-xs">
                <div className="flex items-center gap-2 text-[#023E8A] font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Eliminates 100% of Excel double-entry data errors</span>
                </div>
                <div className="flex items-center gap-2 text-[#023E8A] font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Prevents expensive contract churn &amp; audit penalty notices</span>
                </div>
              </div>
            </div>

            {/* Calculated Results Card */}
            <div className="bg-gradient-to-br from-[#023E8A] via-[#022A5E] to-[#011F48] text-white p-8 rounded-2xl shadow-xl flex flex-col justify-between space-y-6 border border-cyan-500/20">
              <div>
                <div className="text-xs uppercase font-extrabold tracking-wider text-cyan-200 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                  Estimated Annual Value Delivered
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="font-display text-4xl sm:text-5xl font-black text-white tabular-nums tracking-tight">
                    {hoursSavedPerYear}
                  </span>
                  <span className="text-base text-cyan-200 font-semibold">Hours Saved / Year</span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Replaces manual paperwork, lost logbooks, and Excel reconciliation.
                </p>
              </div>

              <div className="pt-4 border-t border-navy-400/30">
                <div className="text-xs text-cyan-200 font-semibold">
                  Estimated Financial Savings &amp; Penalty Prevention
                </div>
                <div className="font-display text-2xl sm:text-3xl font-black text-white mt-1 tabular-nums tracking-tight">
                  ₹{costSavingsPerYear} <span className="text-xs text-slate-300 font-normal">equivalent / yr</span>
                </div>
              </div>

              <Link
                href="/contact"
                className="w-full py-3.5 bg-[#0077B6] hover:bg-white hover:text-[#023E8A] text-white font-bold text-xs uppercase tracking-wider rounded-xl text-center transition-all shadow-md active:scale-[0.98]"
              >
                Claim Your Free Operational Assessment
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          CUSTOMERS SECTION: Case Studies & Interactive Image Lightbox Gallery
          ========================================================================= */}
      <section id="customers" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 reveal-on-scroll">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#0077B6] bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
              Proven Across Mission-Critical Sites
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#023E8A] tracking-tight mt-4">
              Trusted by Premier Commercial Towers, Hospitals &amp; Industry
            </h2>
            <p className="mt-3 text-base text-slate-600 leading-relaxed">
              Click any audit preview below to inspect actual field QR labels, pressure verifications, and compliance sign-offs in our high-res interactive gallery.
            </p>
          </div>

          {/* Interactive Lightbox Trigger Gallery */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {galleryImages.map((img, idx) => (
              <div
                key={idx}
                onClick={() => handleOpenLightbox(idx)}
                className="corp-card overflow-hidden group cursor-pointer bg-white transition-all transform hover:-translate-y-1.5"
              >
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.src}
                    alt={img.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80';
                    }}
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
                    Verified Audit Log
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Verified Standards & Testimonials Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="corp-card p-6 bg-white reveal-on-scroll border border-slate-100 shadow-sm">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Regulatory Standard
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                VigilAMC is engineered specifically to satisfy the strict mandates of the <strong>Maharashtra Fire Act 2006</strong>, <strong>NBC 2016 Part 4</strong>, and <strong>IS 2190</strong> maintenance protocols for AMC providers.
              </p>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0077B6] text-white flex items-center justify-center font-bold text-xs">
                  NBC
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900">Statutory Framework</h5>
                  <p className="text-[11px] text-slate-500">Form-B & Inspection Compliance</p>
                </div>
              </div>
            </div>

            <div className="corp-card p-6 bg-white reveal-on-scroll delay-100 border border-slate-100 shadow-sm">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                Field Accountability
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                Every field technician inspection generates an immutable audit record featuring tamper-evident QR verification, device geolocation, and photographic defect logging.
              </p>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#023E8A] text-white flex items-center justify-center font-bold text-xs">
                  GPS
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900">Tamper-Proof Tracking</h5>
                  <p className="text-[11px] text-slate-500">Zero-Trust Inspection Integrity</p>
                </div>
              </div>
            </div>

            <div className="corp-card p-6 bg-white reveal-on-scroll delay-200 border border-slate-100 shadow-sm">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                Pilot Verification
              </div>
              <p className="text-sm text-slate-700 leading-relaxed italic">
                &ldquo;Customer testimonials and case study releases are currently being verified from our active deployment agencies. Real partner reviews will be published shortly.&rdquo;
              </p>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-xs">
                  AMC
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900">Customer Testimonials</h5>
                  <p className="text-[11px] text-slate-500">Coming Soon from Active Agencies</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          PRICING TABLE SECTION: Interactive Monthly/Annual Switch
          ========================================================================= */}
      <section id="pricing" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 reveal-on-scroll">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#0077B6] bg-ocean-50 px-3 py-1 rounded-full border border-ocean-200">
              Clear, Predictable Pricing
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#023E8A] tracking-tight mt-4">
              Invest in Compliance. Eliminate Contract Churn.
            </h2>
            <p className="mt-3 text-base text-slate-600 leading-relaxed">
              Every plan includes the complete Fire NOC engine, technician mobile app, and automated WhatsApp alert matrix.
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
            {/* Tier 1: Basic AMC */}
            <div className="corp-card p-8 bg-white flex flex-col justify-between h-full reveal-on-scroll border border-slate-200/90 shadow-card hover:shadow-card-hover">
              <div>
                <div className="flex justify-between items-center">
                  <h3 className="font-display text-xl font-bold text-slate-900">Basic AMC</h3>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md">
                    Up to 3 Towers
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Ideal for independent fire safety contractors and small facility operations.
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
                    <span>Standard Form-B PDF Generator</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Email Expiry &amp; Renewal Notifications</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>50 Free Pre-printed Weatherproof QR Labels</span>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-8 border-t border-slate-100">
                <Link
                  href="/contact"
                  className="w-full py-3 px-4 rounded-xl text-xs font-bold text-[#0077B6] bg-ocean-50 hover:bg-ocean-100 text-center block transition-all border border-ocean-200 active:scale-[0.98]"
                >
                  Start 14-Day Free Pilot
                </Link>
              </div>
            </div>

            {/* Tier 2: Pro Fleet AMC (Most Popular) */}
            <div className="corp-card p-8 bg-white border-2 border-[#0077B6] shadow-xl ring-4 ring-[#0077B6]/15 relative flex flex-col justify-between h-full reveal-on-scroll delay-100">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#0077B6] to-[#023E8A] text-white text-[11px] font-extrabold uppercase tracking-wider shadow-md">
                Most Popular for AMC Fleets
              </div>

              <div>
                <div className="flex justify-between items-center mt-1">
                  <h3 className="font-display text-xl font-bold text-[#023E8A]">Pro Fleet AMC</h3>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-ocean-50 text-[#0077B6] rounded-md border border-ocean-200">
                    Up to 15 Towers
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
                    Everything in Basic, plus:
                  </p>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Up to <strong>1,800 Fire Safety Assets</strong></span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Automated WhatsApp &amp; SMS Renewal Engine</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Client Transparency Web Portal with Live Scores</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Instant Defect Quotation &amp; Repair Workorders</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>250 Free Pre-printed Weatherproof QR Labels</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Priority 24/7 Telephone Technical Support</span>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-8 border-t border-slate-100">
                <Link
                  href="/contact"
                  className="w-full py-3.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#0077B6] to-[#023E8A] hover:from-[#006494] hover:to-[#011F48] text-center block transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
                >
                  Start 14-Day Free Pilot
                </Link>
              </div>
            </div>

            {/* Tier 3: Enterprise / Custom AMC */}
            <div className="corp-card p-8 bg-white flex flex-col justify-between h-full reveal-on-scroll delay-200 border border-slate-200/90 shadow-card hover:shadow-card-hover">
              <div>
                <div className="flex justify-between items-center">
                  <h3 className="font-display text-xl font-bold text-slate-900">Custom / Enterprise AMC</h3>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-navy-50 text-[#023E8A] rounded-md">
                    Unlimited
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  For large facility conglomerates, airport authorities, and multi-city AMC operations.
                </p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-black text-[#023E8A] tracking-tight">Custom</span>
                  <span className="text-xs text-slate-500 font-medium">tailored to fleet size</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {billingCycle === 'annual' ? 'Volume licensing discount • Annual SLA' : 'Flexible monthly fleet deployment'}
                </p>

                <div className="mt-8 space-y-3 text-xs text-slate-700">
                  <p className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                    Enterprise-Grade Infrastructure:
                  </p>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Unlimited Assets &amp; Unlimited Facilities</strong></span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Dedicated Fire Compliance Engineer / Account Manager</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Custom ERP / SAP &amp; Facility Management API Sync</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>White-label Client Portal on your own custom domain</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>99.99% Guaranteed SLA &amp; On-Site Training Workshops</span>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-8 border-t border-slate-100">
                <Link
                  href="/contact"
                  className="w-full py-3 px-4 rounded-xl text-xs font-bold text-[#023E8A] bg-slate-100 hover:bg-slate-200 text-center block transition-all active:scale-[0.98]"
                >
                  Contact Enterprise Sales
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FAQ ACCORDION SECTION: Expandable with Fluid Animation
          ========================================================================= */}
      <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 reveal-on-scroll">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#0077B6] bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-sm">
              Got Questions?
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#023E8A] tracking-tight mt-4 text-balance">
              Frequently Asked Questions
            </h2>
            <p className="mt-3 text-base text-slate-600 leading-relaxed text-pretty">
              Everything you need to know about switching from paper logs to VigilAMC autopilot.
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
                    className="w-full py-5 px-6 text-left flex items-center justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0077B6]"
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
            Have a unique facility setup or custom Fire Directorate requirement?{' '}
            <Link href="/contact" className="text-[#0077B6] font-bold underline hover:text-[#023E8A] transition-colors">
              Speak directly with our Chief Compliance Architect
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FAST CONTACT / DEMO INQUIRY SECTION
          ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#023E8A] via-[#022A5E] to-[#011F48] text-white relative overflow-hidden border-t border-navy-700/60">
        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-navy-800/80 text-cyan-200 text-xs font-bold border border-cyan-400/20 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>Zero Setup Fee &bull; 14-Day Full Access Pilot</span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-balance">
            Stop Losing AMC Contracts Over Missed Deadlines
          </h2>

          <p className="text-sm sm:text-base text-cyan-100 max-w-2xl mx-auto leading-relaxed text-pretty">
            Join hundreds of certified fire safety agencies that put their entire equipment inventory, technician audits, and Form-B certifications on autopilot.
          </p>

          <form onSubmit={handleQuickInquiry} className="max-w-md mx-auto space-y-3 pt-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                required
                value={inquiryEmail}
                onChange={(e) => setInquiryEmail(e.target.value)}
                placeholder="Enter your work email address"
                className="w-full px-4 py-3 rounded-xl bg-white text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0077B6] shadow-sm"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-[#0077B6] hover:bg-[#0096C7] text-white font-bold text-sm rounded-xl shadow-lg transition-all whitespace-nowrap active:scale-[0.98]"
              >
                Get Started
              </button>
            </div>
            {inquiryError && <p className="text-xs text-red-300 text-left">{inquiryError}</p>}
            {inquirySubmitted && (
              <p className="text-xs text-emerald-300 font-semibold flex items-center justify-center gap-1.5 pt-1">
                <CheckCircle2 className="w-4 h-4" />
                Thank you! We will reach out within 15 minutes.
              </p>
            )}
          </form>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-cyan-200">
            <span>✓ No credit card required</span>
            <span>✓ Pre-printed QR labels included</span>
            <span>✓ 24-hour spreadsheet migration</span>
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
              Join the VigilAMC Fire Safety &amp; AMC Community
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Watch real-time compliance tutorials, Form-B statutory updates, and industry insights.
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
    </div>
  );
}
