'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  BellRing,
  Smartphone,
  FileCheck2,
  XCircle,
  CheckCircle2,
  MapPin,
  Camera,
  Mic,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import SectorMarquee from './SectorMarquee';

const STEPS = [
  {
    number: '01',
    title: 'Before the Visit — Automatic Reminders',
    summary:
      'VigilAMC remembers every cylinder, alarm, and pump expiry date for you — and sends WhatsApp & email alerts 30, 15, and 7 days before anything expires.',
    proofPill: 'No more forgotten spreadsheets',
    icon: BellRing,
    previewTitle: 'Auto-Scheduled Reminder',
    previewMeta: 'Sent 15 days before due date · Prestige Tower',
    previewBadge: 'SCHEDULED',
  },
  {
    number: '02',
    title: 'On Site — Proof the Technician Was Really There',
    summary:
      'Your technician opens the mobile checklist at the building. The app locks GPS within 20 metres, takes a live camera photo of the pressure gauge, and supports voice-to-text remarks.',
    proofPill: 'GPS + Asset Tag ID + Camera Photo Proof',
    icon: Smartphone,
    previewTitle: 'Field Check · Floor 2 Hydrant Valve',
    previewMeta: 'GPS Verified · Voice Note Logged · Photo Locked',
    previewBadge: 'ON-SITE PROOF',
  },
  {
    number: '03',
    title: 'Instant Certificate — Audit-Ready PDF in 10 Seconds',
    summary:
      'The moment the technician and building manager sign on screen, VigilAMC builds your NBC 2016 / IS 2190 compliant Fire Safety Certificate — ready for fire officers and insurers.',
    proofPill: 'Shareable link + printable A4 PDF',
    icon: FileCheck2,
    previewTitle: 'Form-B Fire Compliance Certificate',
    previewMeta: 'Dual-Signed · Tamper-Evident Audit Log',
    previewBadge: 'CERTIFIED',
  },
];

const OLD_WAY = [
  'Paper registers that get lost, wet, or backdated the night before an inspection',
  'Technicians ticking "OK" from home without checking a single pressure gauge',
  'Scrambling for 3 days in Excel & WhatsApp when the Fire Officer or insurer asks for proof',
];

const VIGIL_WAY = [
  'Live building dashboard — see every green (safe), amber (due soon), and red (expired) asset in 5 seconds',
  'GPS + Asset Tag ID + Floor/Zone checklist + live camera photo proves every visit is real',
  'One-click NBC 2016 & IS 2190 PDF report ready to hand to any Fire Officer or committee',
];

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [stripRevealed, setStripRevealed] = useState(false);
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      setRevealed(true);
      setStripRevealed(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target === sectionRef.current) {
              setRevealed(true);
            }
            if (entry.target === stripRef.current) {
              setStripRevealed(true);
            }
          }
        });
      },
      { rootMargin: '0px 0px -15% 0px', threshold: 0.08 }
    );

    if (sectionRef.current) io.observe(sectionRef.current);
    if (stripRef.current) io.observe(stripRef.current);

    return () => io.disconnect();
  }, []);

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      aria-labelledby="how-it-works-heading"
      className="relative py-14 sm:py-20 lg:py-24 overflow-hidden border-t border-[#FED7AA]/70"
      style={{
        background:
          'linear-gradient(180deg, #FFF4EC 0%, #FFF8F2 45%, #FFE8D6 85%, #FFF8F2 100%)',
      }}
    >
      {/* Ambient Ember Glow Planes behind glass clusters (Critical Glass Rule) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 w-[560px] sm:w-[880px] h-[340px] rounded-full"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(232, 89, 12, 0.20) 0%, rgba(255, 140, 66, 0.14) 48%, rgba(255, 248, 242, 0) 74%)',
          filter: 'blur(90px)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[38%] left-[12%] w-[440px] h-[380px] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(255, 140, 66, 0.22) 0%, rgba(232, 89, 12, 0.14) 50%, rgba(255, 248, 242, 0) 75%)',
          filter: 'blur(95px)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[40%] right-[10%] w-[460px] h-[380px] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(232, 89, 12, 0.20) 0%, rgba(255, 140, 66, 0.14) 50%, rgba(255, 248, 242, 0) 75%)',
          filter: 'blur(95px)',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Plain-Language Explainer Callout ("What is a Fire AMC, really?") */}
        <div
          style={{ transitionDelay: '0ms' }}
          className={`sc-reveal ${
            revealed ? 'is-visible' : ''
          } glass-panel max-w-4xl mx-auto mb-12 sm:mb-16 rounded-2xl p-5 sm:p-7`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-[#1C1917]/10">
            <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#C2410C]">
              <Sparkles className="w-4 h-4 text-[#EA580C]" />
              <span>Wait — What is a &ldquo;Fire AMC&rdquo; in plain English?</span>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0E6] border border-[#FED7AA] text-xs font-semibold text-[#C2410C] w-fit">
              <ShieldAlert className="w-3.5 h-3.5" />
              Mandatory by Indian Fire Law
            </span>
          </div>
          <p className="text-sm sm:text-base text-[#1C1917] leading-relaxed font-medium">
            An <strong className="font-bold text-[#C2410C]">AMC (Annual Maintenance Contract)</strong> is a yearly promise that a trained fire technician will inspect every extinguisher, smoke detector, hydrant valve, and water pump in a building every quarter.{' '}
            <span className="text-[#44403C] font-normal">
              If a check is skipped or faked on paper, equipment can fail during a real fire — and the building risks losing its Fire NOC or insurance payout. VigilAMC makes every check automatic, honest, and provable.
            </span>
          </p>
        </div>

        {/* Section Heading */}
        <div
          style={{ transitionDelay: '60ms' }}
          className={`sc-reveal ${
            revealed ? 'is-visible' : ''
          } text-center max-w-3xl mx-auto mb-10 sm:mb-14`}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-[#FED7AA] text-xs font-bold uppercase tracking-wider text-[#C2410C] mb-3 backdrop-blur-sm">
            Simple 3-Step Story
          </div>
          <h2
            id="how-it-works-heading"
            className="font-display font-bold tracking-[-0.02em] text-[#1C1917] text-[clamp(1.75rem,3.5vw,2.6rem)] leading-[1.12]"
          >
            How VigilAMC Keeps Every Building Safe — Step by Step
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#44403C]">
            No complicated training. No hardware stickers that peel off. Just three clear steps from reminder to certificate.
          </p>
        </div>

        {/* 3 Step Glass Cards (A3: scale 0.97 -> 1 + 24px rise + 6px->0 blur + 60ms stagger) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-7">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                style={{
                  transitionDelay: `${120 + index * 60}ms`,
                  background: 'rgba(255, 255, 255, 0.45)',
                }}
                className={`sc-reveal-step ${
                  revealed ? 'is-visible' : ''
                } glass-panel group relative rounded-2xl p-6 sm:p-7 flex flex-col justify-between hover:-translate-y-1 transition-all duration-300`}
              >
                <div>
                  {/* Step Badge + Icon */}
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C2410C] text-white font-display font-bold text-xs tracking-wide shadow-sm">
                      STEP {step.number}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-[#FFF0E6] border border-[#FED7AA] flex items-center justify-center text-[#C2410C] group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Step Title & Plain-Language Explanation */}
                  <h3 className="font-display font-bold text-lg sm:text-xl text-[#1C1917] mb-2.5 leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[#44403C] leading-relaxed mb-5">
                    {step.summary}
                  </p>
                </div>

                {/* Mini Interactive UI Preview Slice inside each card */}
                <div className="pt-4 border-t border-[#1C1917]/10">
                  <div className="rounded-xl bg-white/75 border border-white/85 p-3.5 mb-3 shadow-sm">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-bold text-[#1C1917] truncate">
                        {step.previewTitle}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#059669]/15 text-[#065F46] border border-[#059669]/30 shrink-0">
                        {step.previewBadge}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#44403C]">{step.previewMeta}</div>
                    {step.number === '02' && (
                      <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-[#C2410C]">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-[#FED7AA]">
                          <MapPin className="w-3 h-3" /> GPS
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-[#FED7AA]">
                          <Camera className="w-3 h-3" /> Photo
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-[#FED7AA]">
                          <Mic className="w-3 h-3" /> Voice Note
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C2410C]">
                    <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                    <span>{step.proofPill}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Before / After Comparison Strip (A6: "The VigilAMC way" wipes in via clip-path inset 500ms after "The old way") */}
        <div
          ref={stripRef}
          className="mt-10 sm:mt-14 grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6"
        >
          {/* Left: The Old Way */}
          <div
            className={`sc-reveal ${
              stripRevealed ? 'is-visible' : ''
            } glass-panel-dense rounded-2xl p-5 sm:p-6`}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DC2626]/10 border border-[#DC2626]/25 text-xs font-bold text-[#991B1B] mb-4">
              <XCircle className="w-4 h-4 text-[#DC2626]" />
              <span>THE OLD WAY · PAPER LOGBOOKS &amp; WHATSAPP</span>
            </div>
            <ul className="space-y-3">
              {OLD_WAY.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-sm text-[#44403C] leading-relaxed"
                >
                  <XCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: The VigilAMC Way (A6 clip-path inset reveal 500ms after Old Way) */}
          <div
            data-testid="vigil-way-wipe"
            style={{ transitionDelay: '180ms' }}
            className={`sc-wipe-after ${
              stripRevealed ? 'is-visible' : ''
            } glass-panel rounded-2xl p-5 sm:p-6`}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#059669]/15 border border-[#059669]/30 text-xs font-bold text-[#065F46] mb-4">
              <CheckCircle2 className="w-4 h-4 text-[#059669]" />
              <span>THE VIGILAMC WAY · LIVE PROOF IN 10 SECONDS</span>
            </div>
            <ul className="space-y-3">
              {VIGIL_WAY.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-sm text-[#1C1917] font-medium leading-relaxed"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sector Pill Marquee (A5: scroll-velocity reactive + reversible) */}
        <SectorMarquee />
      </div>
    </section>
  );
}

export default HowItWorks;
