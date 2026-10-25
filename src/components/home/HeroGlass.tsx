'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Camera,
  PenTool,
  WifiOff,
  Mic,
  FileCheck2,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ShieldCheck,
  Flame,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import { SITE_CONFIG } from '@/lib/siteConfig';

const TRUST_ITEMS = [
  { icon: MapPin, label: 'GPS Proof' },
  { icon: Camera, label: 'Photo Evidence' },
  { icon: PenTool, label: 'Client Signatures' },
  { icon: WifiOff, label: 'Works Offline' },
  { icon: Mic, label: 'Any Language' },
  { icon: FileCheck2, label: 'Reports in 1 Tap' },
] as const;

export function HeroGlass() {
  const heroRef = useRef<HTMLElement>(null);
  const prefersReduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const shouldReduceMotion = mounted && Boolean(prefersReduced);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  // Independent depth plane scroll parallax (30-40px across hero scroll)
  const midPlaneY = useTransform(scrollYProgress, [0, 1], [0, shouldReduceMotion ? 0 : -32]);
  const frontPlaneY = useTransform(scrollYProgress, [0, 1], [0, shouldReduceMotion ? 0 : -40]);
  const backGlowY = useTransform(scrollYProgress, [0, 1], [0, shouldReduceMotion ? 0 : 18]);

  // Subtle desktop pointer micro-tilt (max 2deg)
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || e.pointerType !== 'mouse') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setTilt({
      rx: Number((-ny * 1.8).toFixed(2)),
      ry: Number((nx * 1.8).toFixed(2)),
    });
  };

  const handlePointerLeave = () => {
    setTilt({ rx: 0, ry: 0 });
  };

  return (
    <section
      ref={heroRef}
      aria-labelledby="hero-heading"
      className="relative min-h-[calc(100vh-4rem)] lg:max-h-[115vh] flex flex-col justify-between pt-6 pb-6 sm:pt-8 sm:pb-10 px-4 sm:px-6 lg:px-8 bg-[#FFFFFF] overflow-hidden border-b border-[#FED7AA]/50"
    >
      {/* =====================================================================
          BACK PLANE: Soft radial ember glow field + thin gradient hairline
          ===================================================================== */}
      <motion.div
        aria-hidden="true"
        style={{ y: backGlowY }}
        className="pointer-events-none absolute inset-0 overflow-hidden motion-reduce:!transform-none"
      >
        <div
          className="absolute top-1/2 right-[6%] -translate-y-1/2 w-[34rem] h-[34rem] rounded-full animate-ember-breathe motion-reduce:!animate-none motion-reduce:opacity-15"
          style={{
            background:
              'radial-gradient(circle, rgba(232,89,12,0.16) 0%, rgba(255,140,66,0.08) 45%, rgba(255,255,255,0) 72%)',
          }}
        />
        <div
          className="absolute top-[12%] left-[8%] w-[24rem] h-[24rem] rounded-full opacity-90"
          style={{
            background:
              'radial-gradient(circle, rgba(232,89,12,0.10) 0%, rgba(255,244,236,0.4) 55%, rgba(255,255,255,0) 75%)',
          }}
        />
        {/* Thin gradient hairline across the hero field */}
        <div className="absolute top-[18%] inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#FF8C42]/45 to-transparent" />
      </motion.div>

      <div className="relative z-10 max-w-6xl mx-auto w-full my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* =================================================================
              LEFT COLUMN: Plain-English Hero Story (LCP Target)
              ================================================================= */}
          <div className="lg:col-span-7 text-left space-y-5">
            {/* Eyebrow chip (glass pill) */}
            <motion.div
              initial={{ opacity: 1, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/85 backdrop-blur-md border border-[#FED7AA] shadow-[0_2px_10px_rgba(234,88,12,0.08)] motion-reduce:!transform-none"
            >
              <span className="h-2 w-2 rounded-full bg-[#EA580C]" aria-hidden="true" />
              <span className="font-display text-[11px] sm:text-xs font-bold uppercase tracking-[0.08em] text-[#C2410C]">
                FIRE SAFETY AMC SOFTWARE &middot; BUILT FOR INDIA
              </span>
            </motion.div>

            {/* H1: Fits <= 3 lines on 375px mobile and scales with clamp on desktop */}
            <motion.h1
              id="hero-heading"
              initial={{ opacity: 1, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05, ease: [0.23, 1, 0.32, 1] }}
              className="font-display text-[1.75rem] sm:text-[clamp(2.6rem,5.2vw,4.15rem)] font-bold text-[#1C1917] tracking-[-0.02em] leading-[1.05] max-w-[18ch] motion-reduce:!transform-none"
            >
              Never Miss a Fire Compliance Deadline Again
            </motion.h1>

            {/* Subheadline: 1 sentence, grade-8 plain words */}
            <motion.p
              initial={{ opacity: 1, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.11, ease: [0.23, 1, 0.32, 1] }}
              className="text-[15px] sm:text-lg text-[#44403C] leading-[1.55] max-w-2xl font-normal motion-reduce:!transform-none"
            >
              VigilAMC is the simple software that fire-safety service companies use to track every
              extinguisher, pump and alarm - record each service visit with live GPS, photos and
              the client&apos;s signature - and send compliance-ready reports in minutes, not days.
            </motion.p>

            {/* Primary & Secondary CTAs */}
            <motion.div
              initial={{ opacity: 1, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.17, ease: [0.23, 1, 0.32, 1] }}
              className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 motion-reduce:!transform-none"
            >
              <a
                href={SITE_CONFIG.WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="relative min-h-[48px] inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#C2410C] hover:bg-[#EA580C] text-white font-display font-bold text-base shadow-[0_10px_28px_-6px_rgba(194,65,12,0.45)] transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C2410C]"
              >
                <span>Book a Free Demo</span>
                <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </a>

              <Link
                href="/sample-report"
                className="min-h-[48px] inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/85 hover:bg-[#FFF4EC] backdrop-blur-md border border-[#FED7AA] hover:border-[#C2410C] text-[#1C1917] hover:text-[#C2410C] font-display font-semibold text-base shadow-sm transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C2410C] group"
              >
                <span>See a Real Report</span>
                <ArrowRight
                  className="w-4 h-4 text-[#C2410C] transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </motion.div>

            {/* Icon-First Trust Strip (6 items, 2-word labels) */}
            <motion.div
              initial={{ opacity: 1, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.23, ease: [0.23, 1, 0.32, 1] }}
              className="pt-2 grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-w-xl motion-reduce:!transform-none"
            >
              {TRUST_ITEMS.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#FFF8F2]/90 border border-[#FED7AA]/70 text-xs font-semibold text-[#1C1917]"
                >
                  <Icon className="w-4 h-4 text-[#C2410C] shrink-0" aria-hidden="true" />
                  <span>{label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* =================================================================
              RIGHT COLUMN: Lit-Glass Depth Composition
              - Desktop (>=640px): 3 Planes (Back Glow, Mid Tilted Dashboard Card, Front Overlapping Proof Card)
              - Mobile (<640px): 2 Planes (Glow + 1 Combined Static Glass Card)
              ================================================================= */}
          <div
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            className="lg:col-span-5 relative"
          >
            {/* DESKTOP (>=640px) 3-PLANE COMPOSITION */}
            <div
              className="hidden sm:block relative pt-2 pb-12 pl-4 pr-2 motion-reduce:!transform-none"
              style={{
                transform: shouldReduceMotion
                  ? undefined
                  : `perspective(1100px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
                transition: 'transform 180ms cubic-bezier(0.23, 1, 0.32, 1)',
              }}
            >
              {/* MID PLANE: Floating Glass Dashboard Card (tilted 2deg, slow parallax) */}
              <motion.div
                style={{ y: midPlaneY }}
                className="relative z-10 rotate-[2deg] motion-reduce:rotate-0 motion-reduce:!transform-none rounded-2xl bg-white/80 backdrop-blur-xl border border-[#FED7AA] p-5 shadow-[0_24px_60px_-15px_rgba(28,25,23,0.14),inset_0_1px_0_rgba(255,255,255,0.9)]"
              >
                {/* Card Header */}
                <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-[#FED7AA]/60">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-[#FFF4EC] border border-[#FED7AA] flex items-center justify-center text-[#C2410C]">
                      <Flame className="w-4 h-4" aria-hidden="true" />
                    </span>
                    <div>
                      <div className="text-xs font-display font-bold text-[#1C1917]">
                        AMC Command Dashboard
                      </div>
                      <div className="text-[11px] text-[#44403C]">
                        10 Facilities &middot; 750 Fire Assets
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#FFF4EC] border border-[#FED7AA] text-[10px] font-bold text-[#C2410C] uppercase tracking-wider">
                    Live Status
                  </span>
                </div>

                {/* Miniature KPI Strip: Overdue 2 / Due Soon 5 / Open Repairs 1 / Inspections 12 */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  <div className="p-2.5 rounded-xl bg-[#FEF2F2] border border-[#B91C1C]/20 text-left">
                    <div className="text-[10px] font-semibold text-[#B91C1C] uppercase">
                      Overdue
                    </div>
                    <div className="font-display text-xl font-bold text-[#B91C1C] tabular-nums mt-0.5">
                      2
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#FFF4EC] border border-[#FED7AA] text-left">
                    <div className="text-[10px] font-semibold text-[#C2410C] uppercase">
                      Due Soon
                    </div>
                    <div className="font-display text-xl font-bold text-[#C2410C] tabular-nums mt-0.5">
                      5
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#FFF8F2] border border-[#FED7AA] text-left">
                    <div className="text-[10px] font-semibold text-[#44403C] uppercase">
                      Open Repairs
                    </div>
                    <div className="font-display text-xl font-bold text-[#1C1917] tabular-nums mt-0.5">
                      1
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#ECFDF5] border border-[#0E9F6E]/25 text-left">
                    <div className="text-[10px] font-semibold text-[#0E9F6E] uppercase">
                      Inspections
                    </div>
                    <div className="font-display text-xl font-bold text-[#0E9F6E] tabular-nums mt-0.5">
                      12
                    </div>
                  </div>
                </div>

                {/* Asset Schedule Rows */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/90 border border-[#FED7AA]/60">
                    <div className="flex items-center gap-2 min-w-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#0E9F6E] shrink-0" aria-hidden="true" />
                      <span className="font-semibold text-[#1C1917] truncate">
                        EXT-B1-04 &middot; 6kg ABC Cylinder
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-[#0E9F6E] bg-[#ECFDF5] px-2 py-0.5 rounded-full shrink-0">
                      VERIFIED
                    </span>
                  </div>

                  <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/90 border border-[#FED7AA]/60">
                    <div className="flex items-center gap-2 min-w-0">
                      <Clock className="w-3.5 h-3.5 text-[#C2410C] shrink-0" aria-hidden="true" />
                      <span className="font-semibold text-[#1C1917] truncate">
                        PMP-B2-01 &middot; Main Hydrant Pump
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-[#C2410C] bg-[#FFF4EC] px-2 py-0.5 rounded-full shrink-0">
                      DUE SOON
                    </span>
                  </div>

                  <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/90 border border-[#B91C1C]/20">
                    <div className="flex items-center gap-2 min-w-0">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#B91C1C] shrink-0" aria-hidden="true" />
                      <span className="font-semibold text-[#1C1917] truncate">
                        ALM-GF-02 &middot; Smoke Loop Panel
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-[#B91C1C] bg-[#FEF2F2] px-2 py-0.5 rounded-full shrink-0">
                      OVERDUE
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* FRONT PLANE: Overlapping Glass Proof Card (counter-tilted, stronger parallax) */}
              <motion.div
                style={{ y: frontPlaneY }}
                className="relative z-20 -mt-10 -ml-4 max-w-[21rem] -rotate-[1.5deg] motion-reduce:rotate-0 motion-reduce:!transform-none rounded-2xl bg-white/92 backdrop-blur-2xl border border-[#FED7AA] p-4 shadow-[0_28px_56px_-12px_rgba(194,65,12,0.22),inset_0_1px_0_rgba(255,255,255,0.95)]"
              >
                <div className="flex items-start gap-3">
                  {/* Photo Thumbnail with Gauge Illustration */}
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#1C1917] to-[#44403C] p-1.5 flex flex-col justify-between shrink-0 border border-[#FED7AA]/40 relative overflow-hidden">
                    <div className="flex items-center justify-between text-[8px] font-mono text-[#FAFAF9]/90">
                      <span>CAM</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0E9F6E]" />
                    </div>
                    <svg
                      viewBox="0 0 48 28"
                      className="w-full h-7"
                      aria-label="Extinguisher pressure gauge in green zone"
                    >
                      <path
                        d="M 6 24 A 18 18 0 0 1 42 24"
                        fill="none"
                        stroke="#44403C"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                      <path
                        d="M 18 8 A 18 18 0 0 1 34 9"
                        fill="none"
                        stroke="#0E9F6E"
                        strokeWidth="4.5"
                        strokeLinecap="round"
                      />
                      <line
                        x1="24"
                        y1="24"
                        x2="27"
                        y2="9"
                        stroke="#FAFAF9"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <circle cx="24" cy="24" r="2.5" fill="#FF8C42" />
                    </svg>
                    <div className="text-[8px] font-mono text-[#FF8C42] text-center font-bold">
                      14.5 BAR
                    </div>
                  </div>

                  {/* Proof Metadata */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-[11px] font-display font-bold text-[#1C1917] truncate">
                        Field Visit Proof
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-[#0E9F6E]/12 border border-[#0E9F6E]/30 text-[10px] font-bold text-[#0E9F6E]">
                        COMPLETED
                      </span>
                    </div>

                    {/* Location Stamp Chip */}
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FFF4EC] border border-[#FED7AA] text-[10px] font-mono font-semibold text-[#C2410C]">
                      <MapPin className="w-3 h-3 shrink-0" aria-hidden="true" />
                      <span>GPS 28.6139, 77.2090 - 2m accuracy</span>
                    </div>

                    {/* Client Signature Squiggle Line */}
                    <div className="pt-1 flex items-center justify-between border-t border-[#FED7AA]/50">
                      <span className="text-[10px] text-[#44403C] font-medium">
                        Client Sign-off:
                      </span>
                      <svg
                        viewBox="0 0 110 22"
                        className="w-24 h-4 text-[#1C1917]"
                        aria-label="Client supervisor signature"
                      >
                        <path
                          d="M4 16 C 14 4, 22 19, 32 10 C 40 3, 45 17, 56 12 C 66 7, 74 16, 88 9 C 94 6, 100 13, 106 11"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* MOBILE (<640px) ART-DIRECTED 2-PLANE STATIC COMPOSITION */}
            <div className="sm:hidden rounded-2xl bg-white/92 backdrop-blur-xl border border-[#FED7AA] p-4 shadow-[0_14px_34px_-10px_rgba(28,25,23,0.12)] space-y-3.5">
              {/* Top Half: Dashboard KPI Strip */}
              <div className="flex items-center justify-between pb-2.5 border-b border-[#FED7AA]/60">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#C2410C]" aria-hidden="true" />
                  <span className="font-display text-xs font-bold text-[#1C1917]">
                    Live AMC Command (10 Facilities)
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#0E9F6E]/12 text-[#0E9F6E] text-[10px] font-bold">
                  COMPLETED
                </span>
              </div>

              <div className="grid grid-cols-4 gap-1.5 text-center">
                <div className="p-2 rounded-lg bg-[#FEF2F2] border border-[#B91C1C]/20">
                  <div className="text-[9px] font-bold text-[#B91C1C] uppercase">Overdue</div>
                  <div className="font-display text-base font-bold text-[#B91C1C] tabular-nums">
                    2
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-[#FFF4EC] border border-[#FED7AA]">
                  <div className="text-[9px] font-bold text-[#C2410C] uppercase">Due Soon</div>
                  <div className="font-display text-base font-bold text-[#C2410C] tabular-nums">
                    5
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-[#FFF8F2] border border-[#FED7AA]">
                  <div className="text-[9px] font-bold text-[#44403C] uppercase">Repairs</div>
                  <div className="font-display text-base font-bold text-[#1C1917] tabular-nums">
                    1
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-[#ECFDF5] border border-[#0E9F6E]/25">
                  <div className="text-[9px] font-bold text-[#0E9F6E] uppercase">Done</div>
                  <div className="font-display text-base font-bold text-[#0E9F6E] tabular-nums">
                    12
                  </div>
                </div>
              </div>

              {/* Bottom Half: Integrated Proof Card */}
              <div className="p-3 rounded-xl bg-[#FFF8F2] border border-[#FED7AA] space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="inline-flex items-center gap-1 font-mono font-semibold text-[#C2410C]">
                    <MapPin className="w-3 h-3" aria-hidden="true" />
                    GPS 28.6139, 77.2090 - 2m accuracy
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-[#FED7AA]/60 text-[11px] text-[#44403C]">
                  <span className="inline-flex items-center gap-1 font-medium text-[#1C1917]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#0E9F6E]" aria-hidden="true" />
                    Photo + Client Signature
                  </span>
                  <svg
                    viewBox="0 0 90 18"
                    className="w-20 h-3.5 text-[#1C1917]"
                    aria-label="Client supervisor signature"
                  >
                    <path
                      d="M3 13 C 12 3, 18 15, 28 8 C 36 2, 42 14, 52 9 C 62 5, 70 13, 86 7"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Cue: Thin ember line + "See how it works" (cue opacity >= 0.5) */}
      <div className="relative z-10 pt-4 flex flex-col items-center justify-center opacity-85">
        <a
          href="#how-it-works"
          className="inline-flex flex-col items-center gap-1 text-xs font-display font-semibold text-[#C2410C] hover:text-[#1C1917] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C2410C] rounded-lg px-3 py-1"
        >
          <span>See how it works</span>
          <span
            aria-hidden="true"
            className="w-[2px] h-5 bg-gradient-to-b from-[#FF8C42] via-[#EA580C] to-transparent rounded-full"
          />
        </a>
      </div>
    </section>
  );
}
