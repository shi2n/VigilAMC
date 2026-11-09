'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Phone,
  Mail,
  MessageCircle,
  ArrowRight,
  Award,
  Lock,
  MapPin,
  CheckCircle2,
  Flame,
  HeartHandshake
} from 'lucide-react';
import { SITE_CONFIG } from '@/lib/siteConfig';

export default function FounderDeskPage() {
  return (
    <div className="w-full bg-white">
      {/* Hero Banner: Founder's Desk */}
      <section className="bg-gradient-to-b from-[#FFF8F2] via-white to-white py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-200">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#FED7AA] shadow-xs text-xs font-bold text-[#C2410C]">
            <Flame className="w-3.5 h-3.5 fill-[#C2410C]" />
            <span>Founder&apos;s Desk &bull; VigilAMC</span>
            <span className="text-slate-300">&bull;</span>
            <span>New Delhi, India</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-[#1C1917] tracking-tight">
            Why We Built VigilAMC for India&apos;s Fire Protection Contractors
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            A personal note from Shaizan, Founder of VigilAMC, on our mission to digitize fire safety AMC operations and eliminate missed compliance deadlines across India.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#C2410C] hover:bg-[#1C1917] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
            >
              <span>Schedule an Agency Walkthrough</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href={SITE_CONFIG.WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#25D366] hover:bg-[#20BA5C] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Chat with Founder on WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      {/* Main Letter / Story Content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="space-y-12">
          {/* Recognition Banner */}
          <div className="p-5 rounded-2xl bg-[#FFF8F2] border border-[#FED7AA] shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white border border-[#FED7AA] flex items-center justify-center shrink-0 text-[#C2410C] shadow-xs">
              <Award className="w-6 h-6" />
            </div>
            <div className="space-y-0.5">
              <span className="text-xs uppercase font-extrabold tracking-wider text-[#C2410C]">
                Recognized by Startup India &bull; DPIIT Certified
              </span>
              <p className="text-xs text-slate-700 font-medium leading-relaxed">
                VigilAMC is an officially recognized Indian deep-compliance tech initiative dedicated to life-safety infrastructure and building compliance automation.
              </p>
            </div>
          </div>

          {/* Founder's Letter */}
          <article className="prose prose-slate max-w-none space-y-6 text-slate-700 text-sm sm:text-base leading-relaxed">
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-12 h-12 rounded-full bg-[#FFF8F2] border border-[#FED7AA] flex items-center justify-center text-[#C2410C] font-black text-lg">
                  S
                </div>
                <div>
                  <h2 className="text-base font-black text-[#1C1917] m-0">Shaizan</h2>
                  <p className="text-xs text-slate-500 m-0">Founder, VigilAMC Technologies &bull; New Delhi</p>
                </div>
              </div>

              <p className="font-medium text-slate-800">
                To Fire Protection Contractors, Agency Owners, and Facility Safety Directors,
              </p>

              <p>
                Fire safety in India is one of the most critical responsibilities in any commercial tower, industrial warehouse, or residential complex. Yet for years, the agencies entrusted with keeping these systems alive have been forced to run their field operations on handwritten logbooks, fragmented WhatsApp chats, and cumbersome Excel spreadsheets.
              </p>

              <p>
                When an inspection visit is delayed or an extinguisher goes unserviced in a remote basement, the safety of human lives and property is at stake. When audit season arrives, compiling statutory Form-B reports takes days of manual transcription and guesswork.
              </p>

              <p>
                We built <strong>VigilAMC</strong> to solve this exact bottleneck. Our platform gives fire safety service providers a complete digital operating system:
              </p>

              <ul className="space-y-2 list-none pl-0">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                  <span><strong>Total Asset Visibility:</strong> Map every extinguisher, hydrant, sprinkler valve, and alarm panel with location tags, zones, and serial records.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                  <span><strong>Field GPS &amp; Photo Proof:</strong> Technicians log inspections via our offline-capable field app with real-time GPS coordinates, pressure gauge photos, and client signatures.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                  <span><strong>1-Click Statutory Compliance:</strong> Generate client-ready Form-B and IS 2190 maintenance certificates in minutes instead of days.</span>
                </li>
              </ul>
            </div>
          </article>

          {/* Non-Compete Guarantee & Values */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#1C1917]">Partner Non-Compete Guarantee</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                VigilAMC is strictly a software partner. We never contact your client buildings, pitch renewals, or provide physical fire AMC services. Your agency database and client roster remain 100% confidential.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFF8F2] border border-[#FED7AA] text-[#C2410C] flex items-center justify-center">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#1C1917]">Direct Founder Accessibility</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                As a partner agency, you have direct access to our founder desk for custom workflow integrations, building roster imports, and technician training sessions.
              </p>
            </div>
          </div>

          {/* Contact & Reach Section */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[#FFF8F2] border border-[#FED7AA] shadow-sm space-y-5">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#C2410C]">
                Direct Founder Reach &amp; Helplines
              </span>
              <h3 className="text-xl font-black text-[#1C1917]">
                Connect Directly with Our Leadership Team
              </h3>
              <p className="text-xs text-slate-600">
                Have questions about onboarding your agency, migrating from Excel, or scheduling a live demo? Reach out anytime:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Founder Desk Direct</span>
                <a
                  href={`mailto:${SITE_CONFIG.FOUNDER_EMAIL}`}
                  className="text-xs font-bold text-[#1C1917] hover:text-[#C2410C] transition-colors break-all"
                >
                  {SITE_CONFIG.FOUNDER_EMAIL}
                </a>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Phone &amp; Direct Calls</span>
                <a
                  href={SITE_CONFIG.PHONE_TEL}
                  className="text-xs font-bold text-[#1C1917] hover:text-[#C2410C] transition-colors"
                >
                  {SITE_CONFIG.PHONE_DISPLAY}
                </a>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Co-Founder &amp; Partnerships</span>
                <a
                  href={`mailto:${SITE_CONFIG.COFOUNDER_EMAIL}`}
                  className="text-xs font-bold text-[#1C1917] hover:text-[#C2410C] transition-colors break-all"
                >
                  {SITE_CONFIG.COFOUNDER_EMAIL}
                </a>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Technical Support</span>
                <a
                  href={`mailto:${SITE_CONFIG.SUPPORT_EMAIL}`}
                  className="text-xs font-bold text-[#1C1917] hover:text-[#C2410C] transition-colors break-all"
                >
                  {SITE_CONFIG.SUPPORT_EMAIL}
                </a>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 border-t border-[#FED7AA]/60">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#C2410C] shrink-0" />
                <span>Headquarters: {SITE_CONFIG.ADDRESS_DISPLAY}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-400">Support Hours:</span>
                <span className="font-semibold text-slate-700">Mon &ndash; Sat, 9 AM &ndash; 7 PM IST</span>
              </div>
            </div>
          </div>

          {/* Bottom Action Cards */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#C2410C] hover:bg-[#1C1917] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
            >
              <span>Schedule 15-Minute Agency Walkthrough</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white border border-slate-300 hover:border-slate-400 text-slate-800 text-xs font-bold shadow-xs transition-all"
            >
              <span>How VigilAMC Works</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
