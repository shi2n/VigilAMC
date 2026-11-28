'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Flame, MapPin, CheckCircle2 } from 'lucide-react';
import heroTechnician from '../../../public/images/hero-technician-v2.jpg';
import { LightBrowserFrame, LightPhoneFrame } from './DeviceFrames';

const HERO_TRUTHS = [
  '10 technician languages',
  '22 admin languages',
  'Offline-first sync',
  'GPS-stamped inspections',
  '5-page Form B in minutes',
];

export function HeroSection() {
  return (
    <section
      id="hero-screen"
      aria-label="VigilAMC Fire Safety Compliance Platform Overview"
      className="relative overflow-hidden pt-7 pb-14 sm:pt-9 sm:pb-16 lg:pt-10 lg:pb-20"
      style={{
        background: 'linear-gradient(180deg, #FFFFFF 0%, #FFF8F2 100%)',
      }}
    >
      {/* Subtle warm ambient radial behind hero visual */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[28%] left-1/2 -translate-x-1/2 w-[900px] h-[440px] rounded-full"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(234, 88, 12, 0.10) 0%, rgba(255, 140, 66, 0.05) 45%, rgba(255, 255, 255, 0) 72%)',
        }}
      />

      <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered Apple-grade Hero Copy */}
        <div className="text-center max-w-[960px] mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF8F2] border border-[#FED7AA] shadow-[0_1px_2px_rgba(28,25,23,0.04)] mb-4 sm:mb-5">
            <Flame className="w-4 h-4 text-[#EA580C]" aria-hidden="true" />
            <span className="text-xs sm:text-[13px] font-semibold text-[#C2410C]">
              Built for fire-safety agencies
            </span>
          </div>

          <h1 className="font-sans font-bold tracking-[-0.035em] text-[#1C1917] text-[36px] sm:text-[52px] lg:text-[64px] leading-[1.06] text-balance">
            Run your entire fire-safety agency from{' '}
            <span className="text-[#C2410C]">one place.</span>
          </h1>

          <p className="mt-5 sm:mt-6 text-[17px] sm:text-[19px] text-[#44403C] max-w-[640px] mx-auto leading-[1.55]">
            Keep inspections, AMC schedules, Form B reports, field technicians, and clients in one connected system that works online or offline.
          </p>

          {/* Primary + Secondary CTAs */}
          <div className="mt-7 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3.5">
            <Link
              href="/contact"
              data-testid="hero-book-demo-btn"
              className="btn-flame min-h-[48px] inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-[15px] shadow-[0_8px_24px_-6px_rgba(194,65,12,0.4)]"
            >
              <span>Book a Free Demo</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              href="/start-trial"
              data-testid="hero-start-trial-btn"
              className="min-h-[48px] inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-[15px] bg-transparent border-2 border-[#EA580C] text-[#C2410C] hover:bg-[#FFF0E6] hover:border-[#C2410C] hover:-translate-y-0.5 transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EA580C]"
            >
              <span>Start Free Trial</span>
            </Link>
          </div>

          {/* Factual Stat Strip */}
          <div
            data-testid="hero-stat-strip"
            className="mt-6 sm:mt-7 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[13px] font-medium text-[#44403C]"
          >
            {HERO_TRUTHS.map((item, idx) => (
              <React.Fragment key={item}>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#059669] shrink-0" aria-hidden="true" />
                  <span>{item}</span>
                </span>
                {idx < HERO_TRUTHS.length - 1 && (
                  <span className="text-[#78716C] hidden sm:inline" aria-hidden="true">
                    ·
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Hero Product Visual Stage: Dashboard + Phone App + Field Photo (CLS 0 fixed aspect boxes) */}
        <div className="mt-7 sm:mt-9 relative max-w-[1100px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-end">
            {/* Admin Dashboard Browser Chrome */}
            <div className="lg:col-span-7">
              <LightBrowserFrame url="vigilamc.com/dashboard · Agency Control">
                <div className="relative aspect-[16/10] w-full bg-[#FFF8F2]">
                  <Image
                    src="/screenshots/dashboard-fire-1440x900.png"
                    alt="VigilAMC Admin Dashboard showing agency compliance summary, overdue equipment alerts, and scheduled inspections"
                    fill
                    priority
                    sizes="(min-width: 1024px) 640px, 100vw"
                    className="object-cover object-top"
                  />
                </div>
              </LightBrowserFrame>
            </div>

            {/* Right Column: Field Technician Phone + On-site Proof Photo side-by-side */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-4 items-end">
              <div className="max-w-[205px] mx-auto w-full">
                <LightPhoneFrame>
                  <div className="relative aspect-[9/19] w-full bg-[#FFF8F2]">
                    <Image
                      src="/screenshots/tech-home.png"
                      alt="VigilAMC Field Android app home screen with offline sync status and daily tasks"
                      fill
                      priority
                      sizes="(min-width: 1024px) 205px, 45vw"
                      className="object-cover object-top"
                    />
                  </div>
                </LightPhoneFrame>
              </div>

              <div className="rounded-2xl bg-white p-2.5 border border-[#E7E5E4] shadow-[0_18px_40px_-20px_rgba(28,25,23,0.20)]">
                <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-[#FFF8F2]">
                  <Image
                    src={heroTechnician}
                    alt="Fire safety technician inspecting an extinguisher pressure gauge on site"
                    fill
                    priority
                    sizes="(min-width: 1024px) 220px, 45vw"
                    className="object-cover object-[70%_30%]"
                  />
                </div>
                <div className="pt-2.5 px-1 flex items-center justify-between gap-2 text-[11px] font-semibold text-[#1C1917]">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#C2410C]" aria-hidden="true" />
                    GPS Proof
                  </span>
                  <span className="text-[#047857]">On Site</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
