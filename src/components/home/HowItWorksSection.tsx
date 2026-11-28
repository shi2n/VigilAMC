'use client';

import React from 'react';
import Link from 'next/link';
import Image, { type StaticImageData } from 'next/image';
import { ArrowRight, FileSpreadsheet, Smartphone, FileCheck2 } from 'lucide-react';
import scenePump from '../../../public/images/scene-pump.jpg';
import sceneGps from '../../../public/images/scene-gps.jpg';
import sceneSignoff from '../../../public/images/scene-signoff.jpg';
import { AppleReveal } from './AppleReveal';

interface StepItem {
  num: string;
  title: string;
  desc: string;
  icon: typeof FileSpreadsheet;
  photo: StaticImageData;
  alt: string;
}

const STEPS: StepItem[] = [
  {
    num: '01',
    title: 'Add your buildings or import from Excel',
    desc: 'Bring your existing client sites, floors, and asset registers in minutes without starting from scratch.',
    icon: FileSpreadsheet,
    photo: scenePump,
    alt: 'Fire technician reviewing building pump room equipment register',
  },
  {
    num: '02',
    title: 'Your team inspects offline with GPS proof',
    desc: 'Technicians complete floor checklists and take GPS-stamped photos even in basements with no mobile signal.',
    icon: Smartphone,
    photo: sceneGps,
    alt: 'Technician inspecting a red hydrant landing valve with smartphone GPS verification',
  },
  {
    num: '03',
    title: 'Reports and alerts go out automatically',
    desc: 'Generate 5-page white-label Form B PDFs, track client portal receipts, and send due-date reminders on schedule.',
    icon: FileCheck2,
    photo: sceneSignoff,
    alt: 'Facility manager signing digital inspection record in a building lobby',
  },
];

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="py-20 sm:py-28 bg-[#FFF8F2] border-t border-[#FED7AA]/70"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <AppleReveal className="text-center max-w-[700px] mx-auto mb-14 sm:mb-18">
          <p className="text-xs sm:text-[13px] font-bold uppercase tracking-[0.12em] text-[#C2410C] mb-3">
            How it works
          </p>
          <h2
            id="how-it-works-heading"
            className="font-sans font-bold text-[32px] sm:text-[42px] lg:text-[48px] leading-[1.1] tracking-[-0.03em] text-[#1C1917]"
          >
            Three steps from Excel to audit-ready.
          </h2>
          <p className="mt-4 text-[17px] sm:text-[18px] text-[#44403C] max-w-[560px] mx-auto leading-relaxed">
            You do not need extra hardware or long training sessions. Most agencies get their first sites live in one afternoon.
          </p>
          <div className="mt-4">
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#C2410C] hover:text-[#9A3412] underline underline-offset-4"
            >
              <span>Explore how it works</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </AppleReveal>

        {/* Horizontal 3-Step Timeline */}
        <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Desktop horizontal connector line */}
          <div
            aria-hidden="true"
            className="hidden lg:block absolute top-8 left-[16%] right-[16%] h-[2px] bg-[#FED7AA]"
          />

          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <AppleReveal key={step.num} delayMs={idx * 70}>
                <div className="relative h-full flex flex-col">
                  {/* Step Number Bubble on Timeline */}
                  <div className="flex items-center gap-3 mb-4 relative z-10">
                    <span className="w-16 h-16 rounded-2xl bg-[#C2410C] text-white font-sans font-bold text-xl flex items-center justify-center shadow-md shrink-0">
                      {step.num}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#FED7AA] text-xs font-bold text-[#C2410C]">
                      <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Step {idx + 1}</span>
                    </span>
                  </div>

                  {/* Step Card */}
                  <div className="flex-1 rounded-3xl bg-white border border-[#FED7AA]/80 overflow-hidden shadow-[0_14px_36px_-22px_rgba(28,25,23,0.14)] flex flex-col">
                    <div className="relative aspect-[16/10] w-full bg-[#FFF8F2]">
                      <Image
                        src={step.photo}
                        alt={step.alt}
                        fill
                        sizes="(min-width: 1024px) 380px, 94vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-sans font-bold text-[19px] text-[#1C1917] leading-snug">
                          {step.title}
                        </h3>
                        <p className="mt-2.5 text-[15px] text-[#44403C] leading-relaxed">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </AppleReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;
