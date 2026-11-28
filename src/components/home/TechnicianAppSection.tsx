'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  WifiOff,
  MapPin,
  BellRing,
  Languages,
  Camera,
  Award,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { GooglePlayBadge } from '@/components/GooglePlayBadge';
import { AppleReveal } from './AppleReveal';
import { LightPhoneFrame } from './DeviceFrames';

const APP_SCREENS = [
  {
    id: 'home',
    label: 'Home & Outbox',
    src: '/screenshots/tech-home.png',
    alt: 'VigilAMC Field Android app home dashboard showing offline sync status and daily tasks',
  },
  {
    id: 'checklist',
    label: 'Floor Checklists',
    src: '/screenshots/tech-checklist-detail.png',
    alt: 'VigilAMC Field floor-by-floor extinguisher checklist and guard sign-off screen',
  },
  {
    id: 'capture',
    label: 'GPS Photo & Voice',
    src: '/screenshots/tech-inspection-modal.png',
    alt: 'VigilAMC Field camera photo stamp and voice-to-text remarks inspection screen',
  },
];

const LEFT_CALLOUTS = [
  {
    icon: WifiOff,
    title: 'WORKS OFFLINE',
    body: 'Full inspections, camera photos, and checklists work inside basements and pump rooms. Records stay queued in a local outbox and sync as soon as signal returns.',
  },
  {
    icon: MapPin,
    title: 'GPS-STAMPED PROOF',
    body: 'Every photo and inspection carries burned-in GPS coordinates, date, time, and Asset Tag ID, so you have verifiable site proof without fragile paper stickers.',
  },
  {
    icon: BellRing,
    title: 'INSTANT NOTIFICATIONS',
    body: 'New building assigned? A lock-screen push alert notifies your technician right away so urgent jobs do not sit unread in WhatsApp.',
  },
];

const RIGHT_CALLOUTS = [
  {
    icon: Languages,
    title: '10 INDIAN LANGUAGES + VOICE INPUT',
    body: 'Switch the app to Hindi, Marathi, Gujarati, Tamil, Telugu, Kannada, Malayalam, Bengali, Punjabi, or English, and speak inspection remarks using the voice mic.',
  },
  {
    icon: Camera,
    title: 'CAMERA PHOTO CAPTURE, CHECKLISTS & HISTORY',
    body: 'Rear-camera live photo capture, floor and zone checklists, digital guard sign-offs, and full visit history right on the technician’s phone.',
  },
];

export function TechnicianAppSection({ showDemoCta = false }: { showDemoCta?: boolean }) {
  const [activeScreen, setActiveScreen] = useState(0);
  const current = APP_SCREENS[activeScreen];

  return (
    <section
      id="technician-app"
      aria-labelledby="technician-app-heading"
      className="relative scroll-mt-20 py-20 sm:py-28 bg-[#FFF8F2] border-t border-[#FED7AA]/70 overflow-hidden"
    >
      {/* Alias anchor for existing #field-app links */}
      <span id="field-app" className="sr-only" aria-hidden="true" />

      {/* Warm radial glow behind flagship phone */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[520px] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(234, 88, 12, 0.14) 0%, rgba(255, 140, 66, 0.08) 48%, rgba(255, 248, 242, 0) 74%)',
        }}
      />

      <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Flagship Header */}
        <AppleReveal className="text-center max-w-[820px] mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#FED7AA] shadow-sm mb-5">
            <Award className="w-4 h-4 text-[#C2410C]" aria-hidden="true" />
            <span className="text-xs sm:text-[13px] font-bold text-[#C2410C]">
              Flagship · VigilAMC Field on Google Play
            </span>
          </div>

          <h2
            id="technician-app-heading"
            className="font-sans font-bold text-[32px] sm:text-[42px] lg:text-[48px] leading-[1.09] tracking-[-0.03em] text-[#1C1917] text-balance"
          >
            India&apos;s first offline fire-compliance app with{' '}
            <span className="text-[#C2410C]">GPS-stamped proof of service.</span>
          </h2>

          <p className="mt-4 text-[17px] sm:text-[18px] text-[#44403C] max-w-[620px] mx-auto leading-relaxed">
            Built for field technicians across India, with 6-second extinguisher checks that save cleanly in basements with no network signal.
          </p>
        </AppleReveal>

        {/* 3-Column Showcase: Left Callouts · Big Center Phone · Right Callouts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          {/* Left Feature Callouts */}
          <div className="lg:col-span-4 space-y-5 order-2 lg:order-1">
            {LEFT_CALLOUTS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <AppleReveal key={item.title} delayMs={idx * 60}>
                  <div className="rounded-2xl bg-white border border-[#FED7AA]/80 p-5 shadow-[0_12px_32px_-20px_rgba(28,25,23,0.12)]">
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className="w-8 h-8 rounded-xl bg-[#FFF0E6] border border-[#FED7AA] flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-[#C2410C]" aria-hidden="true" />
                      </span>
                      <h3 className="text-xs font-extrabold tracking-wider uppercase text-[#C2410C]">
                        {item.title}
                      </h3>
                    </div>
                    <p className="text-[14px] text-[#44403C] leading-relaxed">
                      {item.body}
                    </p>
                  </div>
                </AppleReveal>
              );
            })}
          </div>

          {/* Center Big Play-Store-Quality Phone Mockup */}
          <div className="lg:col-span-4 flex flex-col items-center order-1 lg:order-2">
            <div className="w-full max-w-[290px] sm:max-w-[310px]">
              <LightPhoneFrame>
                <div className="relative aspect-[9/19] w-full bg-[#FFF8F2]">
                  <Image
                    src={current.src}
                    alt={current.alt}
                    fill
                    sizes="(min-width: 1024px) 310px, 82vw"
                    className="object-cover object-top"
                  />
                </div>
              </LightPhoneFrame>
            </div>

            {/* Interactive screen switcher */}
            <div
              role="tablist"
              aria-label="Technician app screens"
              className="mt-5 inline-flex items-center gap-1 p-1 rounded-xl bg-white border border-[#FED7AA] shadow-xs"
            >
              {APP_SCREENS.map((screen, idx) => {
                const selected = idx === activeScreen;
                return (
                  <button
                    key={screen.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setActiveScreen(idx)}
                    className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      selected
                        ? 'bg-[#C2410C] text-white'
                        : 'text-[#44403C] hover:text-[#1C1917] hover:bg-[#FFF8F2]'
                    }`}
                  >
                    {screen.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Feature Callouts + Play Store CTA */}
          <div className="lg:col-span-4 space-y-5 order-3">
            {RIGHT_CALLOUTS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <AppleReveal key={item.title} delayMs={idx * 60}>
                  <div className="rounded-2xl bg-white border border-[#FED7AA]/80 p-5 shadow-[0_12px_32px_-20px_rgba(28,25,23,0.12)]">
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className="w-8 h-8 rounded-xl bg-[#FFF0E6] border border-[#FED7AA] flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-[#C2410C]" aria-hidden="true" />
                      </span>
                      <h3 className="text-xs font-extrabold tracking-wider uppercase text-[#C2410C]">
                        {item.title}
                      </h3>
                    </div>
                    <p className="text-[14px] text-[#44403C] leading-relaxed">
                      {item.body}
                    </p>
                  </div>
                </AppleReveal>
              );
            })}

            {/* Play Store Badge + Same Account Line */}
            <AppleReveal delayMs={120}>
              <div className="rounded-2xl bg-white border border-[#FED7AA] p-5 shadow-sm space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <GooglePlayBadge size="lg" theme="dark" />
                </div>
                <p className="text-[13px] font-semibold text-[#1C1917] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" aria-hidden="true" />
                  <span>Also on Android with the same account (com.vigilamc)</span>
                </p>
                <p className="text-xs text-[#44403C]">
                  Technicians sign in with their Staff ID and 6-digit PIN, and their assigned buildings and checklists load automatically.
                </p>
              </div>
            </AppleReveal>
          </div>
        </div>

        {/* Honest substantiation fine print */}
        <p className="mt-10 sm:mt-12 text-center text-xs text-[#44403C] max-w-[680px] mx-auto">
          First means the first fire-compliance field app built with offline sync and GPS-stamped inspections for Indian agencies.
        </p>

        {showDemoCta && (
          <div className="mt-8 text-center">
            <Link
              href="/contact"
              className="btn-flame min-h-[48px] px-7 py-3 rounded-2xl text-white font-bold text-[15px] inline-flex items-center justify-center gap-2 shadow-[0_12px_28px_-8px_rgba(194,65,12,0.45)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EA580C]"
            >
              <span>Book a Free Demo</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

export default TechnicianAppSection;
