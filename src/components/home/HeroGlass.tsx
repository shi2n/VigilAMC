'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Flame,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  ArrowRight,
  ChevronDown,
  Sparkles,
  ScanLine,
  Award,
} from 'lucide-react';
import heroTechnician from '../../../public/images/hero-technician-v2.jpg';
import { subscribeScroll } from '@/lib/scrollEngine';

/* ------------------------------------------------------------------ */
/* Flying product-moment card                                          */
/* ------------------------------------------------------------------ */

interface FlyCardProps {
  testId: string;
  /** Position classes for the absolutely-positioned slot (mobile + lg). */
  slotClass: string;
  /** Scroll parallax rate (shared engine, data-sc-parallax). */
  rate: number;
  /** Base rotation in degrees (−6…+6). */
  rot: number;
  /** Idle bob duration (s) and phase offset (s, negative = mid-cycle start). */
  dur: number;
  phase: number;
  /** Entrance stagger delay (ms) and fly-in origin (px). */
  delay: number;
  fromX: number;
  fromY: number;
  entered: boolean;
  children: React.ReactNode;
}

function FlyCard({
  testId,
  slotClass,
  rate,
  rot,
  dur,
  phase,
  delay,
  fromX,
  fromY,
  entered,
  children,
}: FlyCardProps) {
  return (
    <div
      data-testid={testId}
      data-fly-card=""
      data-sc-parallax={rate}
      className={`fly-slot z-20 ${slotClass}`}
    >
      <div
        className={`fly-enter ${entered ? 'is-in' : ''}`}
        style={
          {
            '--fly-rot': `${rot}deg`,
            '--fly-delay': `${delay}ms`,
            '--fly-from-x': `${fromX}px`,
            '--fly-from-y': `${fromY}px`,
          } as React.CSSProperties
        }
      >
        <div
          className="fly-idle"
          style={
            {
              '--fly-dur': `${dur}s`,
              '--fly-phase': `${phase}s`,
            } as React.CSSProperties
          }
        >
          <div className="float-card px-3 py-2.5 sm:px-3.5 sm:py-3">{children}</div>
        </div>
      </div>
    </div>
  );
}

function CardRow({
  icon,
  title,
  detail,
  titleClass = 'text-[#1C1917]',
}: {
  icon: React.ReactNode;
  title: React.ReactNode;
  detail: string;
  titleClass?: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="shrink-0">{icon}</div>
      <div className="min-w-0 leading-tight">
        <div className={`text-[11px] sm:text-xs font-bold tracking-wide whitespace-nowrap ${titleClass}`}>
          {title}
        </div>
        <div className="text-[11px] sm:text-xs text-[#44403C] whitespace-nowrap mt-0.5">{detail}</div>
      </div>
    </div>
  );
}

const iconBox = (bg: string, children: React.ReactNode) => (
  <span
    className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm"
    style={{ background: bg }}
  >
    {children}
  </span>
);

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

export function HeroGlass() {
  const glowPlaneRef = useRef<HTMLDivElement>(null);
  const copyPlaneRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Flying cards enter right after the H1 has started its stagger.
    const t = window.setTimeout(() => setEntered(true), 60);

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Depth planes (glow + copy) ride the shared scroll engine.
    const unsubscribe = subscribeScroll(({ scrollY, vh }) => {
      if (mq.matches) {
        if (glowPlaneRef.current) glowPlaneRef.current.style.transform = 'none';
        if (copyPlaneRef.current) {
          copyPlaneRef.current.style.transform = 'none';
          copyPlaneRef.current.style.opacity = '1';
        }
        return;
      }
      const progress = Math.min(1, Math.max(0, scrollY / vh));
      if (glowPlaneRef.current) {
        glowPlaneRef.current.style.transform = `translate3d(0, ${(scrollY * 0.15).toFixed(2)}px, 0)`;
      }
      if (copyPlaneRef.current) {
        copyPlaneRef.current.style.transform = `translate3d(0, ${(scrollY * 0.05).toFixed(2)}px, 0)`;
        copyPlaneRef.current.style.opacity = (1 - progress * 0.15).toFixed(3);
      }
    });

    return () => {
      window.clearTimeout(t);
      unsubscribe();
    };
  }, []);

  const stagger = (index: number): React.CSSProperties => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translate3d(0, 0, 0)' : 'translate3d(0, 16px, 0)',
    transition: `opacity 600ms cubic-bezier(0.16, 1, 0.3, 1) ${index * 80}ms, transform 600ms cubic-bezier(0.16, 1, 0.3, 1) ${index * 80}ms`,
  });

  return (
    <section
      id="hero-screen"
      aria-label="VigilAMC Fire Safety Compliance Overview"
      className="relative overflow-hidden pt-6 pb-10 sm:pt-10 sm:pb-12 lg:pt-12 lg:pb-12"
      style={{
        background: 'linear-gradient(180deg, #FFFFFF 0%, #FFF8F2 45%, #FFEBDD 85%, #FFF4EC 100%)',
      }}
    >
      {/* PLANE 1 (Back): warm ember glow plane */}
      <div
        ref={glowPlaneRef}
        aria-hidden="true"
        data-testid="hero-glow-plane"
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{ willChange: 'transform' }}
      >
        <div
          className="absolute -left-24 -top-24 w-[560px] h-[420px] rounded-full"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(255, 140, 66, 0.20) 0%, rgba(232, 89, 12, 0.10) 45%, rgba(255, 248, 242, 0) 72%)',
            filter: 'blur(85px)',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* LEFT: verified copy */}
          <div
            ref={copyPlaneRef}
            data-testid="hero-copy-plane"
            className="lg:col-span-7 text-center lg:text-left"
            style={{ willChange: 'transform, opacity' }}
          >
            <div style={stagger(0)}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-[#FED7AA] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_4px_14px_rgba(232,89,12,0.08)] mb-4 sm:mb-5 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-[#EA580C]" />
                <Flame className="w-3.5 h-3.5 text-[#C2410C]" />
                <span className="text-xs sm:text-[13px] font-semibold tracking-tight text-[#C2410C]">
                  FIRE SAFETY AMC SOFTWARE · INDIA
                </span>
              </div>
            </div>

            <div style={stagger(1)}>
              <h1 className="font-display font-bold tracking-[-0.03em] text-[#1C1917] text-[2.1rem] sm:text-[2.6rem] lg:text-[2.95rem] xl:text-[3.2rem] leading-[1.08] max-w-[15ch] sm:max-w-none mx-auto lg:mx-0">
                Never Miss a Fire{' '}
                <span
                  style={{
                    backgroundImage: 'linear-gradient(90deg, #9A3412 0%, #C2410C 48%, #EA580C 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Compliance
                </span>{' '}
                <br className="hidden sm:inline" />
                Deadline Again.
              </h1>
            </div>

            <div style={stagger(2)}>
              <p className="mt-4 sm:mt-5 text-[15px] sm:text-lg text-[#44403C] max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Every building has fire extinguishers, alarms, and pumps that must be checked on time. VigilAMC tracks every check, proves the technician actually visited, and prints your fire-NOC report in one click.
              </p>
            </div>

            <div
              style={stagger(3)}
              className="mt-6 sm:mt-7 flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3"
            >
              <Link
                href="/sample-report"
                className="btn-flame inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-base shadow-[0_10px_28px_-6px_rgba(194,65,12,0.45)]"
              >
                <FileCheck2 className="w-5 h-5" />
                <span>See a Live Sample Report</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="btn-ghost-flame inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-base"
              >
                <span>Start 30-Day Free Pilot</span>
              </Link>
            </div>

            {/* Trust chips (E1: "No QR Stickers" restored next to "No Hardware Needed") */}
            <div
              style={stagger(4)}
              className="mt-5 sm:mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-2 text-xs sm:text-[13px] font-medium text-[#44403C]"
            >
              <span
                data-testid="trust-chip-dpiit"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 border border-[#FED7AA]/90 backdrop-blur-sm"
              >
                <Award className="w-3.5 h-3.5 text-[#EA580C]" />
                DPIIT Recognized Startup
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 border border-[#FED7AA]/90 backdrop-blur-sm">
                <MapPin className="w-3.5 h-3.5 text-[#C2410C]" />
                GPS + Camera Proof
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 border border-[#FED7AA]/90 backdrop-blur-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-[#059669]" />
                NBC 2016 · IS 2190 Ready
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 border border-[#FED7AA]/90 backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-[#C2410C]" />
                No Hardware Needed
              </span>
              <span
                data-testid="trust-chip-no-qr"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 border border-[#FED7AA]/90 backdrop-blur-sm"
              >
                <span className="relative inline-flex w-3.5 h-3.5" aria-hidden="true">
                  <ScanLine className="w-3.5 h-3.5 text-[#C2410C]" />
                  <span className="absolute left-1/2 top-[-1px] h-[16px] w-[1.5px] -translate-x-1/2 rotate-45 rounded bg-[#C2410C]" />
                </span>
                No QR Stickers
              </span>
            </div>

            <div style={stagger(5)} className="mt-6 sm:mt-7 hidden lg:block">
              <a
                href="#how-it-works"
                className="group inline-flex items-center gap-2 text-sm font-semibold text-[#C2410C] hover:text-[#9A3412] transition-colors"
              >
                <span>See how it works in 3 simple steps</span>
                <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
              </a>
            </div>
          </div>

          {/* RIGHT: photo + flying product moments */}
          <div
            data-sc-scene=""
            data-testid="hero-photo-scene"
            className="lg:col-span-5 relative mx-auto w-full max-w-[520px] lg:max-w-none"
          >
            {/* glow-blob behind the photo cluster */}
            <div aria-hidden="true" className="glow-blob -inset-10 lg:-inset-16" style={{ opacity: 0.95 }} />

            {/* Photo card (parallax layer) */}
            <div data-sc-parallax="0.05" data-testid="hero-photo-card" className="relative z-10">
              <div
                className="photo-tilt relative aspect-[4/3] lg:aspect-[4/5] rounded-[28px] overflow-hidden border-[6px] border-white shadow-[0_40px_80px_-30px_rgba(28,25,23,0.40),0_0_80px_rgba(232,89,12,0.14)] bg-[#FFF8F2]"
                style={{ '--photo-rot': '-2deg' } as React.CSSProperties}
              >
                <Image
                  src={heroTechnician}
                  alt="Fire safety technician checking the pressure gauge of a red fire extinguisher in a modern Indian office building"
                  fill
                  priority
                  fetchPriority="high"
                  quality={90}
                  sizes="(min-width: 1440px) 1280px, (min-width: 1024px) 50vw, 100vw"
                  className="object-cover object-[70%_40%]"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(28,25,23,0) 55%, rgba(28,25,23,0.18) 100%)',
                  }}
                />
              </div>
            </div>

            {/* 1. OVERDUE ALERT — overlaps photo top-left (mobile: inside top-left) */}
            <FlyCard
              testId="hero-fly-overdue"
              slotClass="left-2 top-3 lg:-left-14 lg:top-8"
              rate={0.12}
              rot={-4}
              dur={5.2}
              phase={-1.1}
              delay={420}
              fromX={-24}
              fromY={0}
              entered={entered}
            >
              <CardRow
                icon={iconBox('#FEE2E2', <AlertTriangle className="w-4 h-4 text-[#B91C1C]" />)}
                title={
                  <span className="inline-flex items-center gap-1.5">
                    <span className="px-1.5 py-[1px] rounded-md bg-[#FEE2E2] text-[#991B1B]">OVERDUE ALERT</span>
                  </span>
                }
                detail="2 cylinders · Prestige Tower"
              />
            </FlyCard>

            {/* 2. GPS LOCKED — overlaps photo top-left, lower (mobile: inside top-right) */}
            <FlyCard
              testId="hero-fly-gps"
              slotClass="left-2 top-[44%] lg:right-auto lg:-left-20 lg:top-[30%]"
              rate={0.08}
              rot={3}
              dur={6.1}
              phase={-3.4}
              delay={500}
              fromX={-24}
              fromY={0}
              entered={entered}
            >
              <CardRow
                icon={iconBox('linear-gradient(135deg,#FF8C42,#EA580C)', <MapPin className="w-4 h-4 text-white" />)}
                title="GPS LOCKED"
                detail="Within 20 m · 19.0658° N"
              />
            </FlyCard>

            {/* 3. PHOTO PROOF — right edge (desktop only) */}
            <FlyCard
              testId="hero-fly-photo"
              slotClass="hidden lg:block -right-12 top-[8%]"
              rate={0.16}
              rot={5}
              dur={4.6}
              phase={-0.6}
              delay={580}
              fromX={24}
              fromY={0}
              entered={entered}
            >
              <CardRow
                icon={iconBox('#D1FAE5', <CheckCircle2 className="w-4 h-4 text-[#047857]" />)}
                title="PHOTO PROOF"
                detail="Live camera · Gallery blocked"
              />
            </FlyCard>

            {/* 4. SIGNED — right edge, lower (desktop only) */}
            <FlyCard
              testId="hero-fly-signed"
              slotClass="hidden lg:block -right-12 top-[68%]"
              rate={-0.05}
              rot={-3}
              dur={6.8}
              phase={-2.2}
              delay={660}
              fromX={24}
              fromY={0}
              entered={entered}
            >
              <CardRow
                icon={iconBox(
                  '#FFF0E6',
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" aria-hidden="true">
                    <path
                      d="M2 16c2.5-5 4.5-8 6-8 2 0-1.5 8 .5 8 1.5 0 2.5-4 4-4s.5 3 2 3 2-2 3.5-2H22"
                      stroke="#C2410C"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path d="M2 20h20" stroke="#FED7AA" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                )}
                title="SIGNED"
                detail="R. Sharma + Facility Mgr"
              />
            </FlyCard>

            {/* 5. CERTIFICATE READY — bottom-left overlapping the gutter */}
            <FlyCard
              testId="hero-fly-certificate"
              slotClass="left-3 bottom-3 lg:-left-24 lg:bottom-10"
              rate={0.1}
              rot={-2}
              dur={5.6}
              phase={-4.2}
              delay={740}
              fromX={-24}
              fromY={12}
              entered={entered}
            >
              <CardRow
                icon={iconBox('linear-gradient(135deg,#C2410C,#9A3412)', <FileCheck2 className="w-4 h-4 text-white" />)}
                title="CERTIFICATE READY"
                detail="Form-B PDF · 10 sec"
              />
            </FlyCard>

            {/* 6. Stat chip (desktop only) */}
            <FlyCard
              testId="hero-fly-stat"
              slotClass="hidden lg:block right-6 -bottom-5"
              rate={0.14}
              rot={4}
              dur={4.2}
              phase={-1.8}
              delay={820}
              fromX={0}
              fromY={24}
              entered={entered}
            >
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-[#059669]" />
                <span className="font-display font-bold text-sm text-[#1C1917] tabular-nums">142 assets</span>
                <span className="text-xs font-medium text-[#065F46]">Safe &amp; verified</span>
              </div>
            </FlyCard>
          </div>
        </div>

        {/* Mobile scroll cue */}
        <div className="mt-8 flex justify-center lg:hidden">
          <a
            href="#how-it-works"
            className="group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-[#FED7AA] text-xs font-semibold text-[#C2410C] shadow-sm backdrop-blur-md"
          >
            <span>See how it works in 3 simple steps</span>
            <ChevronDown className="w-4 h-4 text-[#EA580C]" />
          </a>
        </div>
      </div>
    </section>
  );
}

export default HeroGlass;
