'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  FileSpreadsheet,
  Download,
  MessageCircle,
  Sparkles
} from 'lucide-react';
import { SITE_CONFIG } from '@/lib/siteConfig';

export function FounderSection() {
  return (
    <section id="founder" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 border-t border-slate-200 scroll-mt-24">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-ocean-50 text-[#0077B6] text-xs font-bold border border-ocean-200 mb-3">
            <span>Leadership &amp; Mission</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#023E8A] tracking-tight">
            Why I Started VigilAMC
          </h2>
          <p className="mt-3 text-base text-slate-600 leading-relaxed">
            A personal commitment to bringing accountability, transparency, and simplicity to life safety maintenance across India.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Founder Story */}
          <div className="lg:col-span-7 space-y-6 text-sm text-slate-700 leading-relaxed">
            <div className="p-4 rounded-xl bg-white border border-ocean-200/80 shadow-2xs space-y-1">
              <span className="text-xs uppercase font-extrabold text-[#0077B6] tracking-wider block">
                From the Founder
              </span>
              <h3 className="text-lg font-black text-[#023E8A]">
                {SITE_CONFIG.FOUNDER_NAME} &bull; {SITE_CONFIG.FOUNDER_TITLE}
              </h3>
              <p className="text-xs text-slate-500">
                {SITE_CONFIG.FOUNDER_CITY} &bull; <a href={SITE_CONFIG.PHONE_TEL} className="text-[#0077B6] font-semibold hover:underline">{SITE_CONFIG.PHONE_DISPLAY}</a> &bull; <a href={SITE_CONFIG.WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="text-emerald-700 font-semibold hover:underline">Direct WhatsApp</a> &bull; <a href={`mailto:${SITE_CONFIG.CONTACT_EMAIL}`} className="text-[#0077B6] hover:underline">{SITE_CONFIG.CONTACT_EMAIL}</a>
              </p>
            </div>

            <p>
              In talking with fire safety contractors and service providers across Delhi NCR, Mumbai, and Bengaluru, one painful truth kept surfacing: while fire safety hardware is strictly governed by state fire acts and national codes, <strong>the day-to-day management of AMCs still runs on paper tags, WhatsApp chats, and fragmented Excel sheets.</strong>
            </p>

            <p>
              When your agency handles hundreds of cylinders, hose reels, and hydrant landing valves across dozens of towers, tracking quarterly refills, annual servicing, and 3-to-5-year hydrostatic pressure testing dates manually becomes overwhelming. Too often, a missed refill is caught only during a panicked pre-audit rush or when a client disputes an invoice.
            </p>

            <p>
              <strong>We built VigilAMC to solve both sides of this equation:</strong> protect your compliance deadlines so you never lose an AMC contract, and arm your technicians with timestamped photo proof on site so facility managers approve billable refills, valve replacements, and spare parts without arguing.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <a
                href="#pilot-section"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0077B6] hover:bg-[#023E8A] text-white text-xs font-bold shadow-md transition-all active:scale-[0.98] cursor-pointer"
              >
                <span>Join Free Testing Phase</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href={SITE_CONFIG.WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold transition-all"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600 fill-current" />
                <span>Chat with Shaizan on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Right Column: Founding Agency Onboarding Promise Card */}
          <div className="lg:col-span-5">
            <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-xl space-y-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-28 h-28 bg-ocean-50 rounded-bl-full pointer-events-none" />

              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#0077B6]" />
                  <span className="font-extrabold text-sm text-[#023E8A]">
                    Founding Agency Onboarding Promise
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  Guaranteed
                </span>
              </div>

              {/* 3 Core Guarantees */}
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-ocean-50 text-[#0077B6] flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      1. Zero Data-Entry Pain
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                      Send your messy Excel or handwritten logbook sheets &mdash; our team imports your first 3 client buildings completely free.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      2. Your Clients Stay Strictly Yours
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                      Strict multi-tenant database isolation &amp; non-compete guarantee. We never contact your buildings, sell physical hardware, or provide AMC services.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#023E8A] flex items-center justify-center shrink-0">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      3. Zero Lock-In Anytime
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                      1-click full Excel &amp; PDF export of every asset, service log, and Form-B report whenever you need it. Your data is always yours.
                    </p>
                  </div>
                </div>
              </div>

              {/* Founder Signature Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-serif italic font-bold text-slate-800 text-sm">
                    Shaizan
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    Founder, VigilAMC &bull; New Delhi
                  </div>
                </div>
                <div className="text-right">
                  <a
                    href={SITE_CONFIG.PHONE_TEL}
                    className="text-xs font-bold text-[#0077B6] hover:underline"
                  >
                    {SITE_CONFIG.PHONE_DISPLAY}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
