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
  DollarSign
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
      title: 'Prestige CyberTech Park — 42 Floors',
      category: 'Commercial High-Rise',
      building: 'Prestige CyberTech Tower A & B, Bengaluru',
      auditDate: 'September 2026',
      description: '1,450 life safety assets monitored. Extinguishers, landing valves, and yard hydrants 100% compliant during surprise municipal Fire Directorate audit.',
    },
    {
      src: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80',
      title: 'MetroHealth Super-Speciality Hospital',
      category: 'Healthcare Infrastructure',
      building: 'MetroHealth Central Hospital, Mumbai',
      auditDate: 'August 2026',
      description: 'Zero tolerance for life safety lapses. Real-time telemetry on wet risers, clean-agent FM-200 gas suppression in ICU server rooms, and 24/7 digital logs.',
    },
    {
      src: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=1200&q=80',
      title: 'Weatherproof Metal QR Tagging in Action',
      category: 'Field Inspection',
      building: 'Orion Global Tech Hub, Hyderabad',
      auditDate: 'August 2026',
      description: 'Anodized aluminum QR label installed on CO2 cylinder. Withstands UV exposure and industrial washdowns.',
    },
    {
      src: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
      title: 'Hydrant Flow & Pressure Gauge Verification',
      category: 'Wet Riser Testing',
      building: 'Starlight Commercial Tower, Navi Mumbai',
      auditDate: 'September 2026',
      description: 'Technician logged 7.5 Bar dynamic pressure using digital transducer sync. Certified Form-B schedule auto-updated.',
    },
  ];

  const handleOpenLightbox = (index: number) => {
    setActiveImageIndex(index);
    setLightboxOpen(true);
  };

  const handleQuickInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryEmail || !inquiryEmail.includes('@')) {
      setInquiryError('Please enter a valid business email');
      return;
    }
    setInquiryError('');
    setInquirySubmitted(true);
    setTimeout(() => {
      setInquiryEmail('');
      setInquirySubmitted(false);
    }, 4500);
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
      <section className="relative min-h-[640px] lg:min-h-[720px] flex items-center justify-center pt-8 pb-20 px-4 sm:px-6 lg:px-8 ocean-mesh border-b border-slate-200">
        {/* Animated Particle & Connected Safety Node Canvas */}
        <CanvasHero />

        {/* Ambient Decorative Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#0077B6]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-[#023E8A]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Compliance Assurance Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-ocean-200 shadow-sm text-xs font-semibold text-[#023E8A] mb-6 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-[#0077B6] animate-pulse" />
            <span>Trusted by 450+ Certified Fire Safety AMC Agencies</span>
            <span className="text-slate-300">|</span>
            <span className="text-[#0077B6] font-bold">100% Audit Readiness</span>
          </div>

          {/* Primary Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#023E8A] tracking-tight leading-[1.15] max-w-4xl mx-auto">
            Never miss a compliance deadline again.
          </h1>

          {/* Prompt Persona Subtitle */}
          <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-normal">
            AMC teams track hundreds of extinguishers, hydrants and panels across dozens of buildings — on paper and Excel. Renewals slip, clients fail their fire NOC audit, and the contract goes to a competitor. <strong className="text-[#023E8A] font-semibold">VigilAMC puts every asset, due date and client report on autopilot.</strong>
          </p>

          {/* Primary CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#0077B6] hover:bg-[#023E8A] text-white font-bold text-sm sm:text-base shadow-lg shadow-[#0077B6]/25 hover:shadow-xl hover:shadow-[#0077B6]/35 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
            >
              <span>Start 14-Day Free Pilot</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <a
              href="#how-it-works"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-[#023E8A] font-bold text-sm sm:text-base border border-slate-300 hover:border-[#0077B6] shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 text-[#0077B6] fill-[#0077B6]" />
              <span>Explore Interactive Demo</span>
            </a>
          </div>

          {/* Parallax Floating Metric Badges */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-xl bg-white/95 border border-slate-200/90 shadow-sm backdrop-blur-md text-left transition-transform hover:-translate-y-1">
              <div className="text-2xl sm:text-3xl font-black text-[#023E8A]">99.8%</div>
              <div className="text-xs font-semibold text-slate-500 mt-0.5">On-Time Inspection Rate</div>
            </div>

            <div className="p-4 rounded-xl bg-white/95 border border-slate-200/90 shadow-sm backdrop-blur-md text-left transition-transform hover:-translate-y-1">
              <div className="text-2xl sm:text-3xl font-black text-[#0077B6]">14,800+</div>
              <div className="text-xs font-semibold text-slate-500 mt-0.5">Life Safety Assets Tagged</div>
            </div>

            <div className="p-4 rounded-xl bg-white/95 border border-slate-200/90 shadow-sm backdrop-blur-md text-left transition-transform hover:-translate-y-1">
              <div className="text-2xl sm:text-3xl font-black text-emerald-600">0</div>
              <div className="text-xs font-semibold text-slate-500 mt-0.5">Fire NOC Audit Failures</div>
            </div>

            <div className="p-4 rounded-xl bg-white/95 border border-slate-200/90 shadow-sm backdrop-blur-md text-left transition-transform hover:-translate-y-1">
              <div className="text-2xl sm:text-3xl font-black text-[#023E8A]">3 Sec</div>
              <div className="text-xs font-semibold text-slate-500 mt-0.5">Form-B PDF Generation</div>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="corp-card p-8 bg-white reveal-on-scroll">
              <div className="w-12 h-12 rounded-xl bg-ocean-50 text-[#0077B6] flex items-center justify-center mb-6 border border-ocean-100">
                <QrCode className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="text-xl font-bold text-[#023E8A] tracking-tight">
                Asset QR Registry &amp; Floor Maps
              </h3>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                Scan, register, and tag fire extinguishers, landing valves, hose reels, and smoke heads in seconds. View color-coded compliance status directly on interactive floor architectural diagrams.
              </p>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-[#0077B6]">
                <span>Explore QR Registry</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </div>
            </div>

            {/* Feature 2 */}
            <div className="corp-card p-8 bg-white reveal-on-scroll delay-100">
              <div className="w-12 h-12 rounded-xl bg-navy-50 text-[#023E8A] flex items-center justify-center mb-6 border border-navy-100">
                <BellRing className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="text-xl font-bold text-[#023E8A] tracking-tight">
                Automated Renewal &amp; WhatsApp Alerts
              </h3>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                Never let an extinguisher refilling date slip. VigilAMC automatically sends WhatsApp, SMS, and email alerts to clients and technicians 60, 30, and 7 days prior to expiry.
              </p>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-[#0077B6]">
                <span>Explore Alert Workflows</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </div>
            </div>

            {/* Feature 3 */}
            <div className="corp-card p-8 bg-white reveal-on-scroll delay-200">
              <div className="w-12 h-12 rounded-xl bg-ocean-50 text-[#0077B6] flex items-center justify-center mb-6 border border-ocean-100">
                <FileCheck2 className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="text-xl font-bold text-[#023E8A] tracking-tight">
                1-Click Form-B Compliance Filing
              </h3>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                Instant generation of statutory Biannual Form-B certificates compliant with State Fire Directorate laws, complete with digital signatures and full equipment inspection audit trails.
              </p>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-[#0077B6]">
                <span>View Sample Form-B PDF</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </div>
            </div>

            {/* Feature 4 */}
            <div className="corp-card p-8 bg-white reveal-on-scroll">
              <div className="w-12 h-12 rounded-xl bg-navy-50 text-[#023E8A] flex items-center justify-center mb-6 border border-navy-100">
                <Smartphone className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="text-xl font-bold text-[#023E8A] tracking-tight">
                Offline-First Technician Mobile App
              </h3>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                Technicians work uninterrupted in deep underground pump rooms, basements, or shielded stairwells. All data syncs automatically once reconnected with tamper-proof timestamps.
              </p>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-[#0077B6]">
                <span>Mobile App Features</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </div>
            </div>

            {/* Feature 5 */}
            <div className="corp-card p-8 bg-white reveal-on-scroll delay-100">
              <div className="w-12 h-12 rounded-xl bg-ocean-50 text-[#0077B6] flex items-center justify-center mb-6 border border-ocean-100">
                <Building2 className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="text-xl font-bold text-[#023E8A] tracking-tight">
                Multi-Building Operations Command
              </h3>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                Manage 5 or 500 buildings on a unified executive dashboard. Track technician routes, inspection throughput, pending defect repair workorders, and portfolio-wide audit readiness.
              </p>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-[#0077B6]">
                <span>Enterprise Multi-Tower</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </div>
            </div>

            {/* Feature 6 */}
            <div className="corp-card p-8 bg-white reveal-on-scroll delay-200">
              <div className="w-12 h-12 rounded-xl bg-navy-50 text-[#023E8A] flex items-center justify-center mb-6 border border-navy-100">
                <Users className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="text-xl font-bold text-[#023E8A] tracking-tight">
                Client Transparency Portal
              </h3>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                Delight your clients with their own branded compliance portal. Facility directors can view live equipment health, download certificates 24/7, and approve refilling quotes in 1 click.
              </p>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-[#0077B6]">
                <span>Client Portal Preview</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          INTERACTIVE FEATURE: Live ROI & Asset Savings Calculator
          ========================================================================= */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto corp-card-elevated p-8 sm:p-12 border-ocean-200 ocean-mesh">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#0077B6] bg-ocean-50 px-3 py-1 rounded-full border border-ocean-200">
              Interactive ROI Calculator
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#023E8A] tracking-tight mt-3">
              Calculate Your Operational Hours &amp; Cost Savings
            </h3>
            <p className="text-sm text-slate-600 mt-2">
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
                  <span className="px-3 py-1 bg-white border border-slate-300 rounded-lg text-sm font-black text-[#023E8A]">
                    {calcBuildings} Buildings
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="40"
                  value={calcBuildings}
                  onChange={(e) => setCalcBuildings(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0077B6]"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
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
                  <span className="px-3 py-1 bg-white border border-slate-300 rounded-lg text-sm font-black text-[#0077B6]">
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
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0077B6]"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>50 Assets</span>
                  <span>1,500 Assets</span>
                  <span>3,000+ Assets</span>
                </div>
              </div>

              <div className="p-4 bg-white/80 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
                <div className="flex items-center gap-2 text-[#023E8A] font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  Eliminates 100% of Excel double-entry data errors
                </div>
                <div className="flex items-center gap-2 text-[#023E8A] font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  Prevents expensive contract churn &amp; audit penalty notices
                </div>
              </div>
            </div>

            {/* Calculated Results Card */}
            <div className="bg-[#023E8A] text-white p-8 rounded-2xl shadow-xl flex flex-col justify-between space-y-6">
              <div>
                <div className="text-xs uppercase font-extrabold tracking-wider text-cyan-200">
                  Estimated Annual Value Delivered
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-black text-white">
                    {hoursSavedPerYear}
                  </span>
                  <span className="text-base text-cyan-200 font-semibold">Hours Saved / Year</span>
                </div>
                <p className="text-xs text-slate-200 mt-1">
                  Replaces manual paperwork, lost logbooks, and Excel reconciliation.
                </p>
              </div>

              <div className="pt-4 border-t border-navy-400/40">
                <div className="text-xs text-cyan-200 font-semibold">
                  Estimated Financial Savings &amp; Penalty Prevention
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white mt-1">
                  ₹{costSavingsPerYear} <span className="text-xs text-slate-300 font-normal">equivalent / yr</span>
                </div>
              </div>

              <Link
                href="/contact"
                className="w-full py-3 bg-[#0077B6] hover:bg-white hover:text-[#023E8A] text-white font-bold text-xs uppercase tracking-wider rounded-xl text-center transition-colors shadow"
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

          {/* Testimonial Quote Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="corp-card p-6 bg-white reveal-on-scroll">
              <div className="flex items-center gap-1 text-amber-500 mb-3">
                {'★'.repeat(5)}
              </div>
              <p className="text-sm text-slate-700 leading-relaxed italic">
                &ldquo;Before VigilAMC, we lost a major tech park contract because a single hydro-test date slipped and the client failed their surprise Fire Directorate audit. Since implementing VigilAMC across 3,200 assets, our audit pass rate is a spotless 100%.&rdquo;
              </p>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0077B6] text-white flex items-center justify-center font-bold text-sm">
                  AR
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900">Anand R. Verma</h5>
                  <p className="text-[11px] text-slate-500">Managing Director, SafeShield Fire Engineering</p>
                </div>
              </div>
            </div>

            <div className="corp-card p-6 bg-white reveal-on-scroll delay-100">
              <div className="flex items-center gap-1 text-amber-500 mb-3">
                {'★'.repeat(5)}
              </div>
              <p className="text-sm text-slate-700 leading-relaxed italic">
                &ldquo;Form-B generation used to consume 3 days of administrative headache every quarter. Now with VigilAMC, it takes literally 3 seconds. The automated WhatsApp alerts have boosted our prompt refilling approval by over 80%.&rdquo;
              </p>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#023E8A] text-white flex items-center justify-center font-bold text-sm">
                  MK
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900">Major K. Sengupta (Retd.)</h5>
                  <p className="text-[11px] text-slate-500">VP Operations, Apex Facility Management</p>
                </div>
              </div>
            </div>

            <div className="corp-card p-6 bg-white reveal-on-scroll delay-200">
              <div className="flex items-center gap-1 text-amber-500 mb-3">
                {'★'.repeat(5)}
              </div>
              <p className="text-sm text-slate-700 leading-relaxed italic">
                &ldquo;In a 400-bed hospital, life safety cannot fail. VigilAMC gave our clinical directors transparent live visibility over every sprinkler, hydrant valve, and smoke detector. It gives us absolute peace of mind.&rdquo;
              </p>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                  DS
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900">Dr. Sneha Desai</h5>
                  <p className="text-[11px] text-slate-500">Chief Infrastructure Officer, CarePoint Hospitals</p>
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
            <div className="corp-card p-8 bg-white flex flex-col justify-between reveal-on-scroll">
              <div>
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-slate-900">Basic AMC</h3>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md">
                    Up to 3 Towers
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Ideal for independent fire safety contractors and small facility operations.
                </p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-[#023E8A]">
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

              <div className="mt-8 pt-6 border-t border-slate-100">
                <Link
                  href="/contact"
                  className="w-full py-3 px-4 rounded-xl text-xs font-bold text-[#0077B6] bg-ocean-50 hover:bg-ocean-100 text-center block transition-colors border border-ocean-200"
                >
                  Start 14-Day Free Pilot
                </Link>
              </div>
            </div>

            {/* Tier 2: Pro Fleet AMC (Most Popular) */}
            <div className="corp-card p-8 bg-white border-2 border-[#0077B6] shadow-xl relative flex flex-col justify-between reveal-on-scroll delay-100">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#0077B6] text-white text-xs font-extrabold uppercase tracking-wider shadow">
                Most Popular for AMC Fleets
              </div>

              <div>
                <div className="flex justify-between items-center mt-1">
                  <h3 className="text-xl font-bold text-[#023E8A]">Pro Fleet AMC</h3>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-ocean-50 text-[#0077B6] rounded-md border border-ocean-200">
                    Up to 15 Towers
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  For growing fire safety AMC agencies managing multi-building commercial portfolios.
                </p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-[#023E8A]">
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

              <div className="mt-8 pt-6 border-t border-slate-100">
                <Link
                  href="/contact"
                  className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#0077B6] hover:bg-[#023E8A] text-center block transition-all shadow-md hover:shadow-lg"
                >
                  Start 14-Day Free Pilot
                </Link>
              </div>
            </div>

            {/* Tier 3: Enterprise / Custom AMC */}
            <div className="corp-card p-8 bg-white flex flex-col justify-between reveal-on-scroll delay-200">
              <div>
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-slate-900">Custom / Enterprise AMC</h3>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-navy-50 text-[#023E8A] rounded-md">
                    Unlimited
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  For large facility conglomerates, airport authorities, and multi-city AMC operations.
                </p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-[#023E8A]">Custom</span>
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

              <div className="mt-8 pt-6 border-t border-slate-100">
                <Link
                  href="/contact"
                  className="w-full py-3 px-4 rounded-xl text-xs font-bold text-[#023E8A] bg-slate-100 hover:bg-slate-200 text-center block transition-colors"
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
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#0077B6] bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
              Got Questions?
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#023E8A] tracking-tight mt-4">
              Frequently Asked Questions
            </h2>
            <p className="mt-3 text-base text-slate-600 leading-relaxed">
              Everything you need to know about switching from paper logs to VigilAMC autopilot.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="corp-card overflow-hidden bg-white border border-slate-200 transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full py-5 px-6 text-left flex items-center justify-between gap-4 focus:outline-none"
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
            <Link href="/contact" className="text-[#0077B6] font-bold underline hover:text-[#023E8A]">
              Speak directly with our Chief Compliance Architect
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FAST CONTACT / DEMO INQUIRY SECTION
          ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#023E8A] text-white">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy-700 text-cyan-200 text-xs font-bold border border-navy-500">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            Zero Setup Fee &bull; 14-Day Full Access Pilot
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Stop Losing AMC Contracts Over Missed Deadlines
          </h2>

          <p className="text-sm sm:text-base text-cyan-100 max-w-2xl mx-auto leading-relaxed">
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
                className="w-full px-4 py-3 rounded-xl bg-white text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0077B6]"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-[#0077B6] hover:bg-[#0096C7] text-white font-bold text-sm rounded-xl shadow-lg transition-colors whitespace-nowrap"
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
