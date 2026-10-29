'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Target,
  Award,
  Users,
  Building,
  CheckCircle2,
  ArrowRight,
  Flame,
  FileCheck2,
  Calendar,
  Globe2,
  HeartHandshake,
  Linkedin,
  Instagram,
  Youtube,
  AlertTriangle,
  Sparkles,
  MapPin,
  Clock,
  Compass
} from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { SITE_CONFIG } from '@/lib/siteConfig';

export default function AboutUsPage() {
  const roadmapStages = [
    {
      period: '2025',
      title: 'Field Research & Operational Prototyping',
      desc: 'Conducted field interviews with fire safety AMC contractors and facility managers. Discovered that over 90% of missed inspection cycles and audit penalties were caused by handwritten logbooks and manual spreadsheets.',
    },
    {
      period: 'Early 2026',
      title: 'Core Architecture & Form-B Engine',
      desc: 'Engineered the unified asset registry with equipment details and floor notes, mobile inspection form with GPS verification and photo proof (in beta), and statutory Form-B PDF generation engine compliant with NBC 2016 Part 4 and IS 2190.',
    },
    {
      period: 'Current (2026)',
      title: 'Free Testing Phase & Agency Onboarding',
      desc: 'Actively onboarding commercial and industrial fire protection agencies into our free testing program. Calibrating real field workflows directly with service managers and technicians.',
    },
    {
      period: 'Roadmap',
      title: 'Client Transparency Portal & Advanced Fleet Analytics',
      desc: 'Developing self-service compliance dashboards for building committees, automated repair quotation approvals, and multi-tenant fleet dispatching.',
    },
  ];

  return (
    <div className="w-full bg-white">
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-ocean-50 to-white py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-200">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-ocean-200 shadow-xs text-xs font-bold text-[#C2410C] mb-4">
            <span>About VigilAMC</span>
            <span className="text-slate-300">&bull;</span>
            <span>New Delhi, India</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-[#1C1917] tracking-tight">
            Building the Digital Backbone for Fire Safety AMC Operations
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            VigilAMC is dedicated to helping fire protection contractors eliminate forgotten inspection cycles, replace broken paper logbooks, and deliver transparent compliance records to their clients.
          </p>

          {/* Startup India DPIIT Credibility Block */}
          <div className="mt-8 max-w-2xl mx-auto p-4 sm:p-5 rounded-2xl bg-white border border-[#FED7AA] shadow-xs text-left flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#FFF8F2] border border-[#FED7AA] flex items-center justify-center shrink-0 text-[#EA580C]">
              <Award className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-[#1C1917]">
                  Recognized by Startup India (DPIIT)
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#FFF8F2] text-[#C2410C] border border-[#FED7AA]">
                  DPIIT-recognized startup
                </span>
              </div>
              <p className="mt-1 text-xs text-[#44403C] leading-relaxed">
                DPIIT recognition for eligible Indian startups: tax benefits, IP support, and access to the Startup India ecosystem.
              </p>
              <div className="mt-2">
                <a
                  href="https://www.startupindia.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#EA580C] hover:text-[#C2410C] transition-colors"
                >
                  <span>Look us up on startupindia.gov.in</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Origin & Founder Story Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C2410C] bg-ocean-50 px-3 py-1 rounded-full border border-ocean-200">
              Founder Story
            </span>
            <h2 className="text-3xl font-extrabold text-[#1C1917] tracking-tight">
              Why I Started VigilAMC
            </h2>
            <div className="space-y-4 text-sm sm:text-base text-slate-600 leading-relaxed">
              <p>
                My name is <strong>Shaizan</strong>. I founded VigilAMC in <strong>New Delhi</strong> after observing a persistent, costly problem in the fire protection industry: competent, hardworking AMC contractors losing multi-year contracts simply because manual paper record-keeping failed them.
              </p>
              <p>
                In hundreds of high-rise commercial complexes, industrial plants, and hospitals, fire safety equipment is tracked on faded paper tags, clipboards, or scattered Excel spreadsheets. When an extinguisher loses pressure behind a stairwell or a hydrostatic pressure test deadline quietly expires, nobody notices until a municipal Fire Officer conducts a surprise inspection.
              </p>
              <p>
                The facility fails the audit, faces penalty notices, and the AMC contractor takes the blame. I built VigilAMC to put an end to this breakdown — replacing paper chaos with GPS-verified inspections, photo proof, floor location notes, and instant Form-B certification.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#C2410C] text-white flex items-center justify-center font-bold text-sm shrink-0">
                S
              </div>
              <div>
                <p className="font-bold text-slate-900">{SITE_CONFIG.FOUNDER_NAME}</p>
                <p className="text-[11px] text-slate-500">
                  Founder &amp; Product Architect &bull; {SITE_CONFIG.FOUNDER_CITY} &bull;{' '}
                  <a href={SITE_CONFIG.PHONE_TEL} className="text-[#C2410C] font-semibold hover:underline">
                    {SITE_CONFIG.PHONE_DISPLAY}
                  </a>{' '}
                  &bull;{' '}
                  <a href={`mailto:${SITE_CONFIG.CONTACT_EMAIL}`} className="text-[#C2410C] hover:underline">
                    {SITE_CONFIG.CONTACT_EMAIL}
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="corp-card p-8 bg-gradient-to-br from-[#1C1917] to-[#C2410C] text-white shadow-xl rounded-2xl relative overflow-hidden">
              <div className="relative z-10 space-y-6">
                <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-cyan-200">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight">Our Guiding Purpose</h3>
                <p className="text-cyan-100 text-sm sm:text-base leading-relaxed">
                  &ldquo;To provide fire safety service agencies with reliable, modern digital tools that prevent missed inspection deadlines, protect contractor reputations, and raise the standard of life-safety documentation.&rdquo;
                </p>
                <div className="pt-4 border-t border-white/20 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-xl sm:text-2xl font-black text-white">NBC 2016</span>
                    <p className="text-cyan-200 mt-0.5">Part 4 Life Safety Code</p>
                  </div>
                  <div>
                    <span className="text-xl sm:text-2xl font-black text-white">IS 2190</span>
                    <p className="text-cyan-200 mt-0.5">Selection &amp; Maintenance</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Regulatory Standards & Compliance Certifications */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 border-y border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#C2410C] bg-white px-3 py-1 rounded-full border border-slate-200">
              Statutory Alignment
            </span>
            <h2 className="text-3xl font-extrabold text-[#1C1917] mt-3">
              Built on Recognized Fire Codes &amp; Maintenance Protocols
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Every inspection workflow and Form-B field in VigilAMC is designed around standardized life-safety guidelines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="corp-card p-6 bg-white border border-slate-200">
              <div className="w-10 h-10 rounded-lg bg-ocean-50 text-[#C2410C] flex items-center justify-center mb-4">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">National Building Code (NBC 2016)</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Part 4 Fire &amp; Life Safety requirements covering fire fighting equipment spatial distribution, riser requirements, and periodic operational testing intervals.
              </p>
            </div>

            <div className="corp-card p-6 bg-white border border-slate-200">
              <div className="w-10 h-10 rounded-lg bg-navy-50 text-[#1C1917] flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">IS 2190 &amp; IS 15683 Protocols</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Bureau of Indian Standards maintenance schedules for portable fire extinguishers, covering monthly physical inspections, chemical refilling cycles, and hydrostatic pressure testing.
              </p>
            </div>

            <div className="corp-card p-6 bg-white border border-slate-200">
              <div className="w-10 h-10 rounded-lg bg-ocean-50 text-[#C2410C] flex items-center justify-center mb-4">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">State Fire Rules &amp; Form-B</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Structured around NBC 2016 Part 4 and applicable State Fire Safety Rules, formatted for licensed contractor review and client submission.
              </p>
            </div>
          </div>

          {/* Statutory Disclaimer Box */}
          <div className="mt-8 p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Statutory Clarification:</strong> VigilAMC is an operational record-keeping and workflow automation tool. It is not a government agency, nor does it issue statutory licenses. Official Form-B certificates generated by the system must be verified and endorsed by authorized personnel holding valid licenses issued by the respective State Fire Directorate.
            </p>
          </div>
        </div>
      </section>

      {/* Product Journey & Roadmap */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#C2410C] bg-ocean-50 px-3 py-1 rounded-full border border-ocean-200">
              Development Roadmap
            </span>
            <h2 className="text-3xl font-extrabold text-[#1C1917] mt-3">
              Our Journey &amp; Milestones
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              From initial field interviews to building a specialized compliance platform for fire protection agencies.
            </p>
          </div>

          <div className="space-y-8 relative before:absolute before:inset-0 before:left-4 md:before:left-1/2 before:w-0.5 before:bg-ocean-200">
            {roadmapStages.map((m, idx) => (
              <div
                key={idx}
                className="relative flex flex-col md:flex-row items-start md:items-center gap-6"
              >
                <div className={`md:w-1/2 ${idx % 2 === 0 ? 'md:text-right md:pr-10' : 'md:order-2 md:pl-10'}`}>
                  <span className="text-xs font-black text-[#C2410C] bg-ocean-50 px-2.5 py-0.5 rounded border border-ocean-200">
                    {m.period}
                  </span>
                  <h4 className="text-base font-bold text-slate-900 mt-1">{m.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{m.desc}</p>
                </div>

                <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#C2410C] border-4 border-white shadow flex items-center justify-center shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>

                <div className={`hidden md:block md:w-1/2 ${idx % 2 === 0 ? 'md:order-2' : ''}`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 px-4 bg-[#1C1917] text-white text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl font-extrabold">Ready to Join the VigilAMC Testing Program?</h2>
          <p className="text-cyan-100 text-sm max-w-xl mx-auto leading-relaxed">
            VigilAMC is in its testing phase and is free for every agency that joins. Test asset registration, GPS-verified inspections, and automated Form-B reports in your facilities.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/#pilot-section"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#C2410C] hover:bg-white hover:text-[#1C1917] font-bold text-sm rounded-xl transition-all shadow-lg"
            >
              <span>Join the free testing</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/sample-report"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-xl transition-all border border-white/20"
            >
              <span>Inspect Sample Form-B</span>
            </Link>
          </div>

          {/* Social Channels Strip */}
          <div className="pt-8 border-t border-navy-700/60 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-cyan-200">
            <span className="font-semibold text-slate-200">Official Channels (@vigilamc):</span>
            <div className="flex items-center gap-3">
              <a
                href="https://www.linkedin.com/company/vigilamc/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#0A66C2] flex items-center justify-center text-white transition-colors"
                aria-label="LinkedIn"
                title="LinkedIn: vigilamc"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://www.instagram.com/vigilamc"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] flex items-center justify-center text-white transition-colors"
                aria-label="Instagram"
                title="Instagram: @vigilamc"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://x.com/vigilamc"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-black flex items-center justify-center text-white transition-colors"
                aria-label="X (Twitter)"
                title="X (Twitter): @vigilamc"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://www.youtube.com/@vigilamc"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#FF0000] flex items-center justify-center text-white transition-colors"
                aria-label="YouTube"
                title="YouTube: @vigilamc"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
