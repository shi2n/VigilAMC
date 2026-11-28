'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BellRing,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  Flame,
  MapPin,
  Mic,
  ShieldCheck,
  Smartphone,
  WifiOff,
} from 'lucide-react';
import { AppleReveal } from '@/components/home/AppleReveal';
import { TechnicianAppSection } from '@/components/home/TechnicianAppSection';
import { FinalCtaSection } from '@/components/home/FinalCtaSection';
import { GooglePlayBadge } from '@/components/GooglePlayBadge';
import { AppStoreBadge } from '@/components/AppStoreBadge';

const FIELD_PILLARS = [
  {
    icon: WifiOff,
    title: '100% Offline Basement Mode',
    description:
      'Complete floor-by-floor inspections and capture evidence photos even with zero mobile signal inside basements and pump rooms. Records stay queued safely in the local outbox and auto-sync once back online.',
  },
  {
    icon: MapPin,
    title: 'GPS + Asset Tag ID Proof',
    description:
      'Every submitted inspection stamps live GPS coordinates, date, timestamp, and Asset Tag ID, without paper stickers or extra hardware.',
  },
  {
    icon: Mic,
    title: 'Icon-First UI & Voice Remarks',
    description:
      'Built for field technicians across India with large touch controls, clear visual status icons, and built-in voice-to-text remarks so technicians never struggle typing in dimly lit plant rooms.',
  },
  {
    icon: BellRing,
    title: 'Instant Job & Urgent Alerts',
    description:
      'Agency admins dispatch inspections and repair work orders directly to a technician’s phone with lock-screen push alerts and real-time completion updates.',
  },
] as const;

const TECH_WORKFLOW_STEPS = [
  {
    step: '01',
    icon: ClipboardCheck,
    title: 'Open Assigned Building & Floor Checklist',
    description:
      'Technicians sign in with their Staff ID and PIN to view today’s assigned sites, floor-by-floor extinguisher lists, hydrants, and pending defects.',
    highlight: 'Assigned floors and due units ready on open',
  },
  {
    step: '02',
    icon: Camera,
    title: 'Inspect & Capture GPS Photo Proof',
    description:
      'Tap each asset tag, verify pressure gauge, seal, and nozzle condition, speak voice remarks if needed, and snap a live rear-camera photo.',
    highlight: 'Saves locally in basements with no signal',
  },
  {
    step: '03',
    icon: ShieldCheck,
    title: 'Auto-Sync to Office & Form B Reports',
    description:
      'Completed visits sync straight to the office dashboard, trigger defect work orders automatically, and feed directly into white-label 5-page Form B compliance PDFs.',
    highlight: 'Feeds straight into client Form B reports',
  },
] as const;

export default function TechnicianAppPage() {
  return (
    <div className="w-full bg-[#FFFFFF] text-[#1C1917] overflow-x-clip">
      {/* Hero Banner */}
      <section
        aria-label="VigilAMC Technician App Hero"
        className="relative pt-12 pb-16 sm:pt-16 sm:pb-20 border-b border-[#FED7AA]/60 overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #FFFFFF 0%, #FFF8F2 100%)',
        }}
      >
        <div
          aria-hidden="true"
          className="ember-glow-plane absolute -top-24 left-1/2 -translate-x-1/2 w-[560px] h-[260px] rounded-full"
        />

        <div className="relative z-10 max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#FED7AA] shadow-xs mb-5">
            <Smartphone className="w-4 h-4 text-[#EA580C]" aria-hidden="true" />
            <span className="text-xs sm:text-[13px] font-bold text-[#C2410C]">
              VigilAMC Field · Technician App
            </span>
          </div>

          <h1 className="font-display text-[36px] sm:text-[52px] lg:text-[64px] font-extrabold leading-[1.06] tracking-[-0.035em] text-[#1C1917] max-w-[880px] mx-auto text-balance">
            Built for fire technicians on site,{' '}
            <span className="text-[#C2410C]">online or offline.</span>
          </h1>

          <p className="mt-4 sm:mt-5 text-[16px] sm:text-[19px] leading-[1.55] text-[#44403C] max-w-[660px] mx-auto text-pretty">
            Give every field technician a fast, icon-first Android &amp; mobile web app for 6-second extinguisher checks, GPS-stamped camera proof, voice remarks, and automatic sync to your office dashboard.
          </p>

          {/* Store Badges + Primary Actions */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3.5">
            <GooglePlayBadge size="md" theme="dark" />
            <AppStoreBadge size="md" theme="light" comingSoon />
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/contact"
              className="btn-flame w-full sm:w-auto min-h-[48px] px-7 py-3 rounded-2xl text-white font-bold text-[15px] inline-flex items-center justify-center gap-2 shadow-[0_12px_28px_-8px_rgba(194,65,12,0.45)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EA580C]"
            >
              <span>Book a Free Demo</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              href="/technician"
              className="btn-ghost-flame w-full sm:w-auto min-h-[48px] px-7 py-3 rounded-2xl font-bold text-[15px] inline-flex items-center justify-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EA580C]"
            >
              <Flame className="w-4 h-4" aria-hidden="true" />
              <span>Open Technician Web App</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Flagship Interactive Phone Showcase */}
      <TechnicianAppSection showDemoCta />

      {/* 4 Field-Proven Capabilities */}
      <section
        aria-labelledby="field-pillars-heading"
        className="py-16 sm:py-22 bg-white border-t border-[#FED7AA]/50"
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <AppleReveal className="text-center max-w-[700px] mx-auto mb-12">
            <p className="text-xs sm:text-[13px] font-bold uppercase tracking-[0.12em] text-[#C2410C] mb-2">
              Engineered for Basements &amp; Sites
            </p>
            <h2
              id="field-pillars-heading"
              className="font-display text-[30px] sm:text-[42px] font-extrabold leading-[1.1] tracking-[-0.03em] text-[#1C1917]"
            >
              Everything your field team needs in one hand
            </h2>
            <p className="mt-3 text-[16px] sm:text-[18px] text-[#44403C]">
              Lightweight performance tested on everyday Android smartphones across Indian commercial towers, societies, and factories.
            </p>
          </AppleReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FIELD_PILLARS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <AppleReveal key={item.title} delayMs={idx * 60}>
                  <div className="h-full rounded-3xl bg-[#FFF8F2] border border-[#FED7AA]/80 p-6 sm:p-7 shadow-[0_12px_30px_-20px_rgba(28,25,23,0.12)] flex flex-col gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-white border border-[#FED7AA] flex items-center justify-center shadow-xs">
                      <Icon className="w-5 h-5 text-[#EA580C]" aria-hidden="true" />
                    </div>
                    <h3 className="font-display text-lg sm:text-xl font-bold text-[#1C1917]">
                      {item.title}
                    </h3>
                    <p className="text-sm sm:text-[15px] text-[#44403C] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </AppleReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3-Step On-Site Inspection Flow */}
      <section
        aria-labelledby="tech-steps-heading"
        className="py-16 sm:py-22 bg-[#FFF8F2] border-t border-[#FED7AA]/60"
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <AppleReveal className="text-center max-w-[680px] mx-auto mb-12">
            <p className="text-xs sm:text-[13px] font-bold uppercase tracking-[0.12em] text-[#C2410C] mb-2">
              On-Site Workflow
            </p>
            <h2
              id="tech-steps-heading"
              className="font-display text-[30px] sm:text-[40px] font-extrabold leading-[1.1] tracking-[-0.03em] text-[#1C1917]"
            >
              From site arrival to verified proof in 3 steps
            </h2>
          </AppleReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TECH_WORKFLOW_STEPS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <AppleReveal key={item.step} delayMs={idx * 60}>
                  <div className="h-full rounded-3xl bg-white border border-[#FED7AA]/80 p-6 sm:p-7 shadow-card flex flex-col justify-between gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="inline-flex px-3 py-1 rounded-full bg-[#FFF0E6] border border-[#FED7AA] text-[#C2410C] text-xs font-extrabold tracking-wider">
                          STEP {item.step}
                        </span>
                        <span className="w-9 h-9 rounded-xl bg-[#FFF8F2] border border-[#FED7AA] flex items-center justify-center">
                          <Icon className="w-4 h-4 text-[#EA580C]" aria-hidden="true" />
                        </span>
                      </div>
                      <h3 className="font-display text-lg font-bold text-[#1C1917]">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm text-[#44403C] leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-[#FED7AA]/50 flex items-center gap-1.5 text-xs font-semibold text-[#059669]">
                      <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>{item.highlight}</span>
                    </div>
                  </div>
                </AppleReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <FinalCtaSection />
    </div>
  );
}
