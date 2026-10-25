'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Flame,
  ShieldCheck,
  MapPin,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileCheck2,
  ArrowRight,
  ChevronDown,
  Building2,
  Sparkles,
} from 'lucide-react';

const STATUS_ROWS = [
  {
    building: 'Prestige Trade Tower · BKC Mumbai',
    system: 'Hydrant & Main Pump Room',
    due: 'Due in 14 days · 08 Nov 2026',
    status: 'OK',
    badgeBg: 'rgba(5, 150, 105, 0.14)',
    badgeBorder: 'rgba(5, 150, 105, 0.35)',
    badgeText: '#065F46',
    dotColor: '#059669',
    icon: CheckCircle2,
  },
  {
    building: 'Manipal Wing B · Bengaluru',
    system: 'Addressable Smoke Panel (Floor 4)',
    due: 'Due in 3 days · 28 Oct 2026',
    status: 'DUE SOON',
    badgeBg: 'rgba(217, 119, 6, 0.15)',
    badgeBorder: 'rgba(217, 119, 6, 0.38)',
    badgeText: '#92400E',
    dotColor: '#D97706',
    icon: Clock,
  },
  {
    building: 'DLF CyberPark Tower C · Gurugram',
    system: 'CO₂ & ABC Extinguisher Bank (B2)',
    due: 'Overdue by 2 days · Action Needed',
    status: 'EXPIRED',
    badgeBg: 'rgba(220, 38, 38, 0.14)',
    badgeBorder: 'rgba(220, 38, 38, 0.35)',
    badgeText: '#991B1B',
    dotColor: '#DC2626',
    icon: AlertTriangle,
  },
  {
    building: 'Oberoi Commerz II · Goregaon',
    system: 'Sprinkler Riser & Flow Switch',
    due: 'Verified · Next due 19 Jan 2027',
    status: 'OK',
    badgeBg: 'rgba(5, 150, 105, 0.14)',
    badgeBorder: 'rgba(5, 150, 105, 0.35)',
    badgeText: '#065F46',
    dotColor: '#059669',
    icon: CheckCircle2,
  },
];

export function HeroGlass() {
  const glowPlaneRef = useRef<HTMLDivElement>(null);
  const copyPlaneRef = useRef<HTMLDivElement>(null);
  const cardsPlaneRef = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [leftTilt, setLeftTilt] = useState({ rx: 0, ry: 0 });
  const [rightTilt, setRightTilt] = useState({ rx: 0, ry: 0 });

  useEffect(() => {
    setMounted(true);
    if (typeof window === 'undefined') return;

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const applyMotionPref = () => {
      setReducedMotion(mq.matches);
      if (mq.matches) {
        if (glowPlaneRef.current) glowPlaneRef.current.style.transform = 'translate3d(0, 0px, 0)';
        if (copyPlaneRef.current) {
          copyPlaneRef.current.style.transform = 'translate3d(0, 0px, 0)';
          copyPlaneRef.current.style.opacity = '1';
        }
        if (cardsPlaneRef.current) {
          cardsPlaneRef.current.style.transform = 'translate3d(0, 0px, 0)';
        }
      }
    };
    applyMotionPref();
    mq.addEventListener('change', applyMotionPref);

    let rafId = 0;
    const updateDepthPlanes = () => {
      rafId = 0;
      if (mq.matches) return;

      const sy = window.scrollY;
      const vh = Math.max(600, window.innerHeight);
      const progress = Math.min(1, Math.max(0, sy / vh));

      // A1. bg-warm / ember glow plane: translateY(scrollY * 0.15)
      if (glowPlaneRef.current) {
        glowPlaneRef.current.style.transform = `translate3d(0, ${(sy * 0.15).toFixed(2)}px, 0)`;
      }

      // A1. H1 + copy plane: translateY(scrollY * 0.05), opacity 1 -> 0.85 across first viewport
      if (copyPlaneRef.current) {
        const copyOpacity = 1 - progress * 0.15;
        copyPlaneRef.current.style.transform = `translate3d(0, ${(sy * 0.05).toFixed(2)}px, 0)`;
        copyPlaneRef.current.style.opacity = copyOpacity.toFixed(3);
      }

      // A1. glass mockup cards plane: translateY(scrollY * 0.22) + slight rotateX(6deg -> 0deg)
      if (cardsPlaneRef.current) {
        const rotX = Math.max(0, 6 * (1 - Math.min(1, sy / 420)));
        cardsPlaneRef.current.style.transform = `perspective(1200px) translate3d(0, ${(sy * 0.22).toFixed(2)}px, 0) rotateX(${rotX.toFixed(2)}deg)`;
      }
    };

    const onScroll = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(updateDepthPlanes);
      }
    };

    updateDepthPlanes();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      mq.removeEventListener('change', applyMotionPref);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  const handleCardMove = (
    e: React.MouseEvent<HTMLDivElement>,
    setter: React.Dispatch<React.SetStateAction<{ rx: number; ry: number }>>
  ) => {
    if (reducedMotion || typeof window !== 'undefined' && window.innerWidth < 768) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    setter({ rx: Number((-ny * 4.5).toFixed(2)), ry: Number((nx * 4.5).toFixed(2)) });
  };

  const getStaggerStyle = (index: number): React.CSSProperties => {
    if (reducedMotion) {
      return { opacity: 1, transform: 'none' };
    }
    return {
      opacity: mounted ? 1 : 0,
      transform: mounted ? 'translate3d(0, 0, 0)' : 'translate3d(0, 16px, 0)',
      transition: `opacity 600ms cubic-bezier(0.16, 1, 0.3, 1) ${index * 80}ms, transform 600ms cubic-bezier(0.16, 1, 0.3, 1) ${index * 80}ms`,
    };
  };

  return (
    <section
      id="hero-screen"
      aria-label="VigilAMC Fire Safety Compliance Overview"
      className="relative overflow-hidden pt-5 pb-12 sm:pt-8 sm:pb-16 lg:pt-10 lg:pb-24"
      style={{
        background:
          'linear-gradient(180deg, #FFFFFF 0%, #FFF8F2 38%, #FFE8D6 78%, #FFF4EC 100%)',
      }}
    >
      {/* PLANE 1 (Back): Warm radial ember glow plane (translateY(scrollY * 0.15)) */}
      <div
        ref={glowPlaneRef}
        aria-hidden="true"
        data-testid="hero-glow-plane"
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{
          transform: 'translate3d(0, 0px, 0)',
          willChange: 'transform',
        }}
      >
        {/* Top center warm sun */}
        <div
          className="absolute left-1/2 -top-24 -translate-x-1/2 w-[620px] sm:w-[980px] h-[420px] sm:h-[580px] rounded-full"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(255, 140, 66, 0.24) 0%, rgba(232, 89, 12, 0.15) 42%, rgba(255, 248, 242, 0) 72%)',
            filter: 'blur(85px)',
          }}
        />
        {/* Left behind Card A: intense ember glow so transparent glass refracts orange/apricot */}
        <div
          className="absolute left-[4%] lg:left-[8%] top-[44%] w-[360px] sm:w-[540px] h-[340px] sm:h-[440px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(232, 89, 12, 0.22) 0%, rgba(255, 140, 66, 0.16) 48%, rgba(255, 248, 242, 0) 75%)',
            filter: 'blur(90px)',
          }}
        />
        {/* Right behind Card B: warm flame-apricot glow */}
        <div
          className="absolute right-[4%] lg:right-[8%] top-[48%] w-[340px] sm:w-[500px] h-[340px] sm:h-[420px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(255, 140, 66, 0.22) 0%, rgba(232, 89, 12, 0.14) 50%, rgba(255, 248, 242, 0) 75%)',
            filter: 'blur(95px)',
          }}
        />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* PLANE 3 (Front Copy Plane): translateY(scrollY * 0.05), opacity 1 -> 0.85 */}
        <div
          ref={copyPlaneRef}
          data-testid="hero-copy-plane"
          className="max-w-4xl mx-auto text-center"
          style={{
            transform: 'translate3d(0, 0px, 0)',
            opacity: 1,
            willChange: 'transform, opacity',
          }}
        >
          {/* Eyebrow pill (stagger 0) */}
          <div style={getStaggerStyle(0)}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/75 border border-[#FED7AA] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_4px_14px_rgba(232,89,12,0.08)] mb-4 sm:mb-5 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#EA580C]" />
              <Flame className="w-3.5 h-3.5 text-[#C2410C]" />
              <span className="text-xs sm:text-[13px] font-semibold tracking-tight text-[#C2410C]">
                FIRE SAFETY AMC SOFTWARE · INDIA
              </span>
            </div>
          </div>

          {/* H1 (stagger 1) — Rule 9b: 2 balanced lines on desktop ("Never Miss a Fire Compliance / Deadline Again."), <= 3 lines on 375px mobile */}
          <div style={getStaggerStyle(1)}>
            <h1 className="font-display font-bold tracking-[-0.025em] text-[#1C1917] text-[2.1rem] sm:text-[2.75rem] lg:text-[3.35rem] leading-[1.08] max-w-[15ch] sm:max-w-none mx-auto">
              Never Miss a Fire{' '}
              <span
                style={{
                  backgroundImage:
                    'linear-gradient(90deg, #9A3412 0%, #C2410C 48%, #EA580C 100%)',
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

          {/* Subhead (stagger 2) — plain 12-year-old English, <= 28 words */}
          <div style={getStaggerStyle(2)}>
            <p className="mt-3.5 sm:mt-5 text-[15px] sm:text-lg text-[#44403C] max-w-2xl mx-auto leading-relaxed font-normal">
              Every building has fire extinguishers, alarms, and pumps that must be checked on time. VigilAMC tracks every check, proves the technician actually visited, and prints your fire-NOC report in one click.
            </p>
          </div>

          {/* Primary & Secondary CTAs (stagger 3) */}
          <div
            style={getStaggerStyle(3)}
            className="mt-5 sm:mt-7 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3"
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

          {/* 3 Mini Trust Chips (stagger 4) */}
          <div
            style={getStaggerStyle(4)}
            className="mt-4 sm:mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-[13px] font-medium text-[#44403C]"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/75 border border-[#FED7AA]/90 backdrop-blur-sm">
              <MapPin className="w-3.5 h-3.5 text-[#C2410C]" />
              GPS + Camera Proof
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/75 border border-[#FED7AA]/90 backdrop-blur-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-[#059669]" />
              NBC 2016 · IS 2190 Ready
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/75 border border-[#FED7AA]/90 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#C2410C]" />
              No Hardware Needed
            </span>
          </div>
        </div>

        {/* PLANE 2 (Mid Glass Mockup Cards Plane): translateY(scrollY * 0.22) + rotateX(6deg -> 0) */}
        <div
          ref={cardsPlaneRef}
          data-testid="hero-cards-plane"
          className="relative mt-7 sm:mt-10 lg:mt-12"
          style={{
            transform: reducedMotion
              ? 'translate3d(0, 0px, 0)'
              : 'perspective(1200px) translate3d(0, 0px, 0) rotateX(6deg)',
            transformOrigin: 'center top',
            willChange: 'transform',
          }}
        >
          {/* Saturated warm gradient mesh directly behind the glass cards so backdrop-filter blur(18px) visibly refracts color */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-4 sm:-inset-6 rounded-[32px] opacity-90"
            style={{
              background:
                'radial-gradient(circle at 22% 35%, rgba(234, 88, 12, 0.22) 0%, rgba(255, 140, 66, 0.14) 35%, transparent 68%), radial-gradient(circle at 80% 65%, rgba(255, 140, 66, 0.24) 0%, rgba(194, 65, 12, 0.14) 40%, transparent 70%)',
              filter: 'blur(42px)',
            }}
          />

          <div
            style={getStaggerStyle(5)}
            className="relative grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch"
          >
            {/* Card A (Left / Primary): Building Fire-Safety Status Card (real transparent glass) */}
            <div
              data-testid="hero-glass-card-a"
              onMouseMove={(e) => handleCardMove(e, setLeftTilt)}
              onMouseLeave={() => setLeftTilt({ rx: 0, ry: 0 })}
              className="glass-panel lg:col-span-7 rounded-2xl p-4 sm:p-6 transition-transform duration-200 ease-out"
              style={{
                background: 'rgba(255, 255, 255, 0.45)',
                transform:
                  leftTilt.rx || leftTilt.ry
                    ? `perspective(900px) rotateX(${leftTilt.rx}deg) rotateY(${leftTilt.ry}deg)`
                    : undefined,
              }}
            >
              {/* Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 mb-3.5 border-b border-[#1C1917]/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#FFF0E6]/90 border border-[#FED7AA] flex items-center justify-center text-[#C2410C] shadow-sm">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-display font-bold text-sm sm:text-base text-[#1C1917]">
                        Live Building Fire-Safety Status
                      </h2>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#059669]/15 text-[#065F46] border border-[#059669]/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
                        LIVE SYNC
                      </span>
                    </div>
                    <p className="text-xs text-[#44403C]">
                      Every building you manage — green means safe, red means act today
                    </p>
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#44403C]">
                    Audit Readiness
                  </span>
                  <div className="font-display font-bold text-lg text-[#1C1917] tabular-nums">
                    98.4% Verified
                  </div>
                </div>
              </div>

              {/* Mobile simplified 2-column summary bar + Desktop 3-column summary bar */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-3.5">
                <div className="rounded-xl bg-[#FFF4EC] sm:bg-white/65 border border-[#FED7AA] px-3 py-2">
                  <div className="text-[11px] font-semibold text-[#44403C]">SAFE & VERIFIED</div>
                  <div className="font-display font-bold text-base sm:text-lg text-[#065F46] tabular-nums">
                    142 Assets
                  </div>
                </div>
                <div className="rounded-xl bg-[#FFF4EC] sm:bg-white/65 border border-[#FED7AA] px-3 py-2">
                  <div className="text-[11px] font-semibold text-[#44403C]">DUE THIS WEEK</div>
                  <div className="font-display font-bold text-base sm:text-lg text-[#92400E] tabular-nums">
                    6 Checks
                  </div>
                </div>
                <div className="col-span-2 sm:col-span-1 rounded-xl bg-[#FFF4EC] sm:bg-white/65 border border-[#FED7AA] px-3 py-2 flex sm:block items-center justify-between">
                  <div className="text-[11px] font-semibold text-[#44403C]">OVERDUE ALERT</div>
                  <div className="font-display font-bold text-base sm:text-lg text-[#991B1B] tabular-nums">
                    1 Cylinder Bank
                  </div>
                </div>
              </div>

              {/* Status Rows */}
              <div className="space-y-2">
                {STATUS_ROWS.map((row, idx) => {
                  const Icon = row.icon;
                  return (
                    <div
                      key={row.building}
                      className={`${
                        idx === 3 ? 'hidden sm:flex' : 'flex'
                      } items-center justify-between gap-3 rounded-xl bg-white/70 hover:bg-white/85 border border-white/80 px-3.5 py-2.5 transition-colors shadow-[0_2px_8px_rgba(28,25,23,0.04)]`}
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-xs sm:text-sm text-[#1C1917] truncate">
                          {row.building}
                        </div>
                        <div className="text-[11px] sm:text-xs text-[#44403C] truncate">
                          {row.system} · <span className="font-medium">{row.due}</span>
                        </div>
                      </div>
                      <span
                        style={{
                          backgroundColor: row.badgeBg,
                          borderColor: row.badgeBorder,
                          color: row.badgeText,
                        }}
                        className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border tabular-nums"
                      >
                        <Icon className="w-3.5 h-3.5" style={{ color: row.dotColor }} />
                        {row.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Card B (Right / Proof Card): Technician Visit Proof Card (real transparent glass) */}
            <div
              data-testid="hero-glass-card-b"
              onMouseMove={(e) => handleCardMove(e, setRightTilt)}
              onMouseLeave={() => setRightTilt({ rx: 0, ry: 0 })}
              className="glass-panel lg:col-span-5 rounded-2xl p-4 sm:p-6 flex flex-col justify-between transition-transform duration-200 ease-out"
              style={{
                background: 'rgba(255, 255, 255, 0.45)',
                transform:
                  rightTilt.rx || rightTilt.ry
                    ? `perspective(900px) rotateX(${rightTilt.rx}deg) rotateY(${rightTilt.ry}deg)`
                    : undefined,
              }}
            >
              <div>
                <div className="flex items-center justify-between gap-2 pb-3 mb-3.5 border-b border-[#1C1917]/10">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#C2410C] text-white flex items-center justify-center shadow-sm">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-sm sm:text-base text-[#1C1917]">
                        Technician Visit Proof
                      </h3>
                      <p className="text-[11px] text-[#44403C]">
                        Anti-fake check · Locked on site
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-[#FFF0E6] border border-[#FED7AA] font-mono text-[11px] font-bold text-[#C2410C]">
                    TAG #EXT-B2-019
                  </span>
                </div>

                {/* Simulated Photo Gauge + Timestamp Overlay */}
                <div className="relative rounded-xl overflow-hidden border border-white/80 bg-gradient-to-br from-[#FFF4EC] via-[#FFE8D6] to-[#FED7AA]/70 p-3.5 mb-3.5 shadow-inner">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Pressure Gauge Visual */}
                      <div className="w-12 h-12 rounded-full bg-white border-4 border-[#059669] flex flex-col items-center justify-center shadow-sm shrink-0">
                        <span className="text-[10px] font-bold text-[#065F46] leading-none">
                          14.2
                        </span>
                        <span className="text-[9px] font-semibold text-[#44403C]">BAR OK</span>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#1C1917]">
                          6kg ABC Dry Powder · Basement 2
                        </div>
                        <div className="text-[11px] text-[#44403C]">
                          Pin intact · Nozzle clear · Hydro-test valid
                        </div>
                        <div className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-[#065F46]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                          Live Camera Capture (Gallery Blocked)
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* GPS + Timestamp + Dual Signature */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between rounded-lg bg-white/75 border border-white/80 px-3 py-2">
                    <span className="inline-flex items-center gap-1.5 font-medium text-[#44403C]">
                      <MapPin className="w-3.5 h-3.5 text-[#C2410C]" />
                      GPS Locked Within 20m
                    </span>
                    <span className="font-mono font-semibold text-[#1C1917] tabular-nums">
                      19.0658° N, 72.8681° E
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-white/75 border border-white/80 px-3 py-2">
                    <span className="font-medium text-[#44403C]">Signed By</span>
                    <span className="font-semibold text-[#1C1917]">
                      R. Sharma (Tech) + Facility Mgr
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Instant Annex B Certificate Pill */}
              <div className="mt-4 pt-3 border-t border-[#1C1917]/10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#059669]" />
                  <span className="text-xs font-semibold text-[#1C1917]">
                    Form-B Fire Certificate Auto-Generated
                  </span>
                </div>
                <Link
                  href="/sample-report"
                  className="text-xs font-bold text-[#C2410C] hover:text-[#9A3412] underline underline-offset-2 shrink-0"
                >
                  View PDF →
                </Link>
              </div>
            </div>
          </div>

          {/* Contact Anchor + Scroll Cue (opacity >= 0.5 per scroll-craft rule) */}
          <div className="mt-7 sm:mt-9 flex flex-col items-center justify-center">
            <a
              href="#how-it-works"
              style={{ opacity: 0.85 }}
              className="group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-[#FED7AA] text-xs font-semibold text-[#C2410C] shadow-sm hover:bg-[#FFF4EC] transition-all backdrop-blur-md"
            >
              <span>See how it works in 3 simple steps</span>
              <ChevronDown className="w-4 h-4 text-[#EA580C] group-hover:translate-y-0.5 transition-transform" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroGlass;
