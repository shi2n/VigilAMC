'use client';

import React from 'react';
import {
  FileSpreadsheet,
  MapPinOff,
  FileWarning,
  ClockAlert,
  WifiOff,
  ArrowDown,
} from 'lucide-react';
import { AppleReveal } from './AppleReveal';

const PAIN_POINTS = [
  {
    icon: FileSpreadsheet,
    sting: 'AMC renewals slip because reminders live in Excel',
    detail: 'One missed cell means a lapsed building contract or an unhappy RWA.',
  },
  {
    icon: MapPinOff,
    sting: "Technicians say they visited, with nothing to prove it",
    detail: 'Without GPS coordinates and live photos, you cannot defend a site visit when a client questions a bill.',
  },
  {
    icon: FileWarning,
    sting: 'Clients ask for reports and you scramble',
    detail: 'Hours disappear digging through WhatsApp chats and paper registers.',
  },
  {
    icon: ClockAlert,
    sting: 'Audit week turns into late-night paperwork',
    detail: 'Compiling Form B registers across dozens of buildings by hand takes all weekend.',
  },
  {
    icon: WifiOff,
    sting: 'Field network dies and work stops',
    detail: 'Basements and pump rooms have no mobile signal when inspections happen.',
  },
];

export function ProblemSection() {
  return (
    <section
      id="the-problem"
      aria-labelledby="problem-heading"
      className="py-16 sm:py-24 lg:py-28 bg-[#FFF8F2] border-t border-[#FED7AA]/60"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <AppleReveal className="text-center max-w-[680px] mx-auto mb-12 sm:mb-16">
          <p className="text-xs sm:text-[13px] font-bold uppercase tracking-[0.12em] text-[#C2410C] mb-3">
            The daily headache
          </p>
          <h2
            id="problem-heading"
            className="font-sans font-bold text-[32px] sm:text-[42px] lg:text-[48px] leading-[1.1] tracking-[-0.03em] text-[#1C1917]"
          >
            Sound familiar?
          </h2>
          <p className="mt-4 text-[17px] sm:text-[18px] text-[#44403C] max-w-[540px] mx-auto leading-relaxed">
            Running a 5-to-50 technician agency on WhatsApp, Excel, and paper registers breaks down the moment contracts grow.
          </p>
        </AppleReveal>

        {/* 5 Pain Cards: 3 top + 2 bottom balanced on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5">
          {PAIN_POINTS.map((pain, idx) => {
            const Icon = pain.icon;
            const colSpan = idx < 3 ? 'lg:col-span-2' : 'lg:col-span-3';
            return (
              <AppleReveal
                key={pain.sting}
                delayMs={idx * 60}
                className={colSpan}
              >
                <div className="h-full rounded-2xl bg-white border border-[#FED7AA]/80 p-6 sm:p-7 shadow-[0_12px_32px_-20px_rgba(28,25,23,0.12)] hover:-translate-y-0.5 transition-transform duration-200 flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-[#FFF0E6] border border-[#FED7AA] flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-[#C2410C]" aria-hidden="true" />
                    </div>
                    <h3 className="font-sans font-bold text-[17px] sm:text-[18px] text-[#1C1917] leading-snug">
                      {pain.sting}
                    </h3>
                    <p className="mt-2 text-[14px] text-[#44403C] leading-relaxed">
                      {pain.detail}
                    </p>
                  </div>
                </div>
              </AppleReveal>
            );
          })}
        </div>

        {/* Flip line to solution */}
        <AppleReveal delayMs={180} className="mt-10 sm:mt-12 text-center">
          <a
            href="#products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-[#FED7AA] text-[15px] sm:text-[16px] font-bold text-[#C2410C] hover:bg-[#FFF0E6] shadow-sm transition-colors"
          >
            <span>See how VigilAMC handles all five</span>
            <ArrowDown className="w-4 h-4" aria-hidden="true" />
          </a>
        </AppleReveal>
      </div>
    </section>
  );
}

export default ProblemSection;
