'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  FileCheck2,
  ShieldCheck,
  MapPin,
  Lock,
  ArrowRight,
  CheckCircle2,
  Award,
  ShieldAlert,
  Download,
  Users2,
  Sparkles,
} from 'lucide-react';

interface StatCardConfig {
  id: string;
  target: number;
  prefix?: string;
  suffix: string;
  unitLabel: string;
  label: string;
  sublabel: string;
  formatLocale?: boolean;
}

const STATS: StatCardConfig[] = [
  {
    id: 'stat-hours',
    target: 190,
    suffix: '+',
    unitLabel: ' hrs/yr',
    label: 'Saved on Manual Paperwork',
    sublabel: 'Per AMC agency by eliminating Excel & paper registers',
  },
  {
    id: 'stat-savings',
    target: 96000,
    prefix: '₹',
    suffix: '',
    unitLabel: '/yr',
    label: 'Saved on Printing & Stationary',
    sublabel: 'Digital dual-signed PDF certificates replace triplicate books',
    formatLocale: true,
  },
  {
    id: 'stat-pages',
    target: 750,
    suffix: '+',
    unitLabel: ' pages',
    label: 'Paper Registers Eliminated',
    sublabel: 'Every building log stored safely in cloud & signed R2 proof',
  },
  {
    id: 'stat-speed',
    target: 10,
    suffix: '',
    unitLabel: ' sec',
    label: 'To Generate Fire-NOC Report',
    sublabel: 'Instant Annex B / Form-B PDF right after on-site signature',
  },
];

const GUARANTEES = [
  {
    title: 'NBC 2016 · IS 2190 · State Fire Services Annex B Aligned',
    description:
      'Every checklist item and certificate layout matches Indian statutory fire inspection formats out of the box.',
    icon: Award,
  },
  {
    title: '20-Metre GPS Lock + Live Camera + Dual Signature',
    description:
      'Gallery uploads are blocked. Every inspection photo is watermarked with live GPS coordinates, date, time, and technician ID.',
    icon: MapPin,
  },
  {
    title: 'Tamper-Evident Cloud Storage with Private Signed URLs',
    description:
      'All inspection photos and signed certificates are stored in encrypted Cloudflare R2 buckets with time-limited signed access.',
    icon: Lock,
  },
];

function AnimatedStatValue({
  stat,
  active,
  reducedMotion,
}: {
  stat: StatCardConfig;
  active: boolean;
  reducedMotion: boolean;
}) {
  const [val, setVal] = useState<number>(reducedMotion ? stat.target : 0);

  useEffect(() => {
    if (reducedMotion) {
      setVal(stat.target);
      return;
    }
    if (!active) {
      setVal(0);
      return;
    }

    let rafId = 0;
    const duration = 1200; // A4: 1.2s rAF count-up
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // easeOutQuart
      const eased = 1 - Math.pow(1 - progress, 4);
      const nextVal = Math.round(stat.target * eased);
      setVal(nextVal);
      if (progress < 1) {
        rafId = window.requestAnimationFrame(step);
      } else {
        setVal(stat.target);
      }
    };

    rafId = window.requestAnimationFrame(step);
    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [active, reducedMotion, stat.target]);

  const formatted = stat.formatLocale ? val.toLocaleString('en-IN') : String(val);

  return (
    <span
      data-testid={stat.id}
      data-target={stat.target}
      data-current={val}
      className="tabular-nums"
    >
      {stat.prefix || ''}
      {formatted}
      {stat.suffix}
    </span>
  );
}

export function ProofSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const statsGridRef = useRef<HTMLDivElement>(null);
  const ctaBandRef = useRef<HTMLDivElement>(null);
  const ctaGlowRef = useRef<HTMLDivElement>(null);

  const [sectionVisible, setSectionVisible] = useState(false);
  const [statsActive, setStatsActive] = useState(false);
  const [ctaVisible, setCtaVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const applyPref = () => {
      setReducedMotion(mq.matches);
      if (mq.matches) {
        setSectionVisible(true);
        setStatsActive(true);
        setCtaVisible(true);
        if (ctaGlowRef.current) {
          ctaGlowRef.current.style.transform = 'translate3d(-50%, 0, 0) scale(1)';
        }
      }
    };
    applyPref();
    mq.addEventListener('change', applyPref);

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target === sectionRef.current) setSectionVisible(true);
            if (entry.target === statsGridRef.current) setStatsActive(true);
            if (entry.target === ctaBandRef.current) setCtaVisible(true);
          }
        });
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.1 }
    );

    if (sectionRef.current) io.observe(sectionRef.current);
    if (statsGridRef.current) io.observe(statsGridRef.current);
    if (ctaBandRef.current) io.observe(ctaBandRef.current);

    // A7: charcoal band's ember glow scales 0.9 -> 1 with scroll progress through the band
    let rafId = 0;
    const updateBandGlow = () => {
      rafId = 0;
      if (mq.matches || !ctaBandRef.current || !ctaGlowRef.current) return;
      const rect = ctaBandRef.current.getBoundingClientRect();
      const vh = Math.max(600, window.innerHeight);
      const raw = (vh - rect.top) / (vh + rect.height);
      const clamped = Math.min(1, Math.max(0, raw));
      const scaleVal = 0.9 + clamped * 0.1;
      ctaGlowRef.current.style.transform = `translate3d(-50%, 0, 0) scale(${scaleVal.toFixed(3)})`;
    };

    const onScroll = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(updateBandGlow);
      }
    };

    updateBandGlow();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      mq.removeEventListener('change', applyPref);
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section
      id="proof-screen"
      ref={sectionRef}
      aria-labelledby="proof-heading"
      className="relative py-12 sm:py-16 lg:py-20 overflow-hidden border-t border-[#FED7AA]/60"
      style={{
        background:
          'linear-gradient(180deg, #FFF8F2 0%, #FFE8D6 45%, #FFF4EC 82%, #FFFFFF 100%)',
      }}
    >
      {/* Ambient Radial Ember Glow Planes behind Stat Cards & Guarantee Band */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[14%] left-[15%] w-[460px] h-[360px] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(232, 89, 12, 0.22) 0%, rgba(255, 140, 66, 0.15) 48%, rgba(255, 248, 242, 0) 74%)',
          filter: 'blur(90px)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[18%] right-[14%] w-[480px] h-[360px] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(255, 140, 66, 0.22) 0%, rgba(232, 89, 12, 0.14) 50%, rgba(255, 248, 242, 0) 74%)',
          filter: 'blur(90px)',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div
          className={`sc-reveal ${
            sectionVisible ? 'is-visible' : ''
          } text-center max-w-3xl mx-auto mb-10 sm:mb-12`}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-[#FED7AA] text-xs font-bold uppercase tracking-wider text-[#C2410C] mb-3 backdrop-blur-sm">
            Real Numbers · Real Audit Proof
          </div>
          <h2
            id="proof-heading"
            className="font-display font-bold tracking-[-0.02em] text-[#1C1917] text-[clamp(1.75rem,3.5vw,2.5rem)] leading-[1.12]"
          >
            Built to Pass Fire Officer &amp; Insurance Audits First Time
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#44403C]">
            Whether you manage 10 buildings or 500 AMC sites across India, VigilAMC pays for itself from month one.
          </p>
        </div>

        {/* 4 Outcome Stat Glass Cards (A4: rAF 1.2s count-up) */}
        <div
          ref={statsGridRef}
          data-testid="proof-stats-grid"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-10 sm:mb-14"
        >
          {STATS.map((stat, idx) => (
            <div
              key={stat.id}
              style={{
                transitionDelay: `${idx * 60}ms`,
                background: 'rgba(255, 255, 255, 0.65)',
              }}
              className={`sc-reveal ${
                sectionVisible ? 'is-visible' : ''
              } glass-panel rounded-2xl p-5 sm:p-6 hover:-translate-y-1 transition-transform duration-200`}
            >
              <div className="font-display font-bold text-3xl sm:text-4xl text-[#C2410C] tracking-tight mb-1.5">
                <AnimatedStatValue
                  stat={stat}
                  active={statsActive}
                  reducedMotion={reducedMotion}
                />
                <span className="text-lg sm:text-xl font-semibold text-[#1C1917]">
                  {stat.unitLabel}
                </span>
              </div>
              <div className="font-display font-bold text-sm sm:text-base text-[#1C1917] mb-1">
                {stat.label}
              </div>
              <p className="text-xs text-[#44403C] leading-relaxed">{stat.sublabel}</p>
            </div>
          ))}
        </div>

        {/* 3 Guarantee Rows in Lit-Glass Container */}
        <div
          style={{
            transitionDelay: '180ms',
            background: 'rgba(255, 255, 255, 0.65)',
          }}
          className={`sc-reveal ${
            sectionVisible ? 'is-visible' : ''
          } glass-panel rounded-2xl p-6 sm:p-8 mb-8 sm:mb-10`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 divide-y lg:divide-y-0 lg:divide-x divide-[#1C1917]/10">
            {GUARANTEES.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className={idx === 0 ? 'pt-0' : 'pt-5 lg:pt-0 lg:pl-8'}
                >
                  <div className="w-10 h-10 rounded-xl bg-[#FFF0E6] border border-[#FED7AA] flex items-center justify-center text-[#C2410C] mb-3.5 shadow-sm">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-bold text-base text-[#1C1917] mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#44403C] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* E2: Guarantees band before final CTA (glass, ember border) + Founding Agency Promise */}
        <div
          data-testid="guarantees-promise-band"
          style={{
            transitionDelay: '220ms',
            background: 'rgba(255, 255, 255, 0.75)',
          }}
          className={`sc-reveal ${
            sectionVisible ? 'is-visible' : ''
          } glass-panel border border-[#FED7AA] rounded-2xl p-6 sm:p-7 mb-10 sm:mb-12 shadow-[0_12px_36px_-12px_rgba(232,89,12,0.14)]`}
        >
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-semibold text-[#1C1917] pb-4 mb-4 border-b border-[#FED7AA]/80 text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0E6] border border-[#FED7AA] text-[#C2410C]">
              <Sparkles className="w-3.5 h-3.5 text-[#EA580C]" />
              Free 1-building pilot
            </span>
            <span className="text-[#C2410C] font-bold">·</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0E6] border border-[#FED7AA] text-[#C2410C]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
              No lock-in, ever
            </span>
            <span className="text-[#C2410C] font-bold">·</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0E6] border border-[#FED7AA] text-[#C2410C]">
              <Download className="w-3.5 h-3.5 text-[#C2410C]" />
              Your data stays yours
            </span>
            <span className="text-[#C2410C] font-bold">·</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0E6] border border-[#FED7AA] text-[#C2410C]">
              <ShieldAlert className="w-3.5 h-3.5 text-[#C2410C]" />
              No non-compete games
            </span>
          </div>

          <div className="max-w-3xl mx-auto text-center">
            <h4 className="font-display font-bold text-sm sm:text-base text-[#1C1917] mb-2 flex items-center justify-center gap-2">
              <Users2 className="w-4 h-4 text-[#EA580C]" />
              <span>Founding Agency Promise</span>
            </h4>
            <p className="text-xs sm:text-[13px] text-[#44403C] leading-relaxed">
              We provide 1-click full data export anytime. We build software exclusively for fire safety service agencies — we never sell fire equipment, and we never contact your clients or buildings directly.
            </p>
            <div className="mt-3.5">
              <Link
                href="/sample-report"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#C2410C] hover:text-[#9A3412] hover:underline"
              >
                <span>Inspect Sample Report</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Final Charcoal CTA Band (#1C1917) with A7 scroll-progress ember glow scale (0.9 -> 1) + lifted glass card */}
        <div
          ref={ctaBandRef}
          data-testid="cta-charcoal-band"
          className="relative rounded-3xl overflow-hidden bg-[#1C1917] text-[#FAFAF9] p-6 sm:p-10 lg:p-12 shadow-[0_28px_64px_-20px_rgba(28,25,23,0.45)]"
        >
          {/* Ember radial glow behind CTA card — scales 0.9 -> 1 with scroll progress */}
          <div
            ref={ctaGlowRef}
            aria-hidden="true"
            data-testid="cta-ember-glow"
            className="pointer-events-none absolute -top-24 left-1/2 w-[540px] h-[300px] rounded-full"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(234, 88, 12, 0.34) 0%, rgba(255, 140, 66, 0.14) 52%, rgba(28, 25, 23, 0) 75%)',
              filter: 'blur(38px)',
              transform: 'translate3d(-50%, 0, 0) scale(0.9)',
              willChange: 'transform',
            }}
          />

          <div
            data-testid="cta-lifted-card"
            className={`relative z-10 rounded-2xl border border-white/15 bg-white/[0.06] backdrop-blur-xl p-6 sm:p-8 transition-all duration-500 ${
              ctaVisible && !reducedMotion
                ? '-translate-y-1 shadow-[0_24px_60px_-16px_rgba(234,88,12,0.28)]'
                : ''
            }`}
          >
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C2410C]/30 border border-[#EA580C]/50 text-xs font-semibold text-[#FED7AA] mb-4">
                <ShieldCheck className="w-3.5 h-3.5 text-[#FF8C42]" />
                <span>Ready in 10 Minutes · No Extra Hardware</span>
              </div>

              <h3 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-[#FAFAF9] tracking-tight leading-tight">
                See Exactly What a Fire Officer Sees During an Inspection
              </h3>
              <p className="mt-3 text-sm sm:text-base text-[#A8A29E] max-w-xl mx-auto leading-relaxed">
                Open a real sample Fire Safety Compliance Report right now, or start your 30-day free pilot with your first building in under 10 minutes.
              </p>

              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3.5">
                <Link
                  href="/sample-report"
                  className="btn-flame inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-base shadow-lg"
                >
                  <FileCheck2 className="w-5 h-5" />
                  <span>See a Live Sample Report</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-[#FFF8F2] text-[#1C1917] font-semibold text-base transition-all hover:-translate-y-0.5"
                >
                  <span>Start 30-Day Free Pilot</span>
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[#A8A29E]">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                  Works on any Android or iPhone
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                  Icon-first + Voice-to-Text Mic
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                  Instant Printable A4 PDF
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProofSection;
