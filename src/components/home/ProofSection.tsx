'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  FileCheck2,
  MapPin,
  WifiOff,
  Mic,
  Tag,
  Award,
  ShieldCheck,
  ArrowUpRight,
  ArrowRight
} from 'lucide-react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { SITE_CONFIG } from '@/lib/siteConfig';
import { SectorMarquee } from './SectorMarquee';

interface StatCardProps {
  target: number;
  prefix?: string;
  suffix?: string;
  label: string;
}

function StatCounterCard({ target, prefix = '', suffix = '', label }: StatCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.4 });
  const prefersReduced = useReducedMotion();
  const [value, setValue] = useState<number>(target);

  useEffect(() => {
    if (!isInView || prefersReduced) {
      setValue(target);
      return;
    }

    let frameId = 0;
    const duration = 900;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - elapsed, 3);
      setValue(Math.round(target * eased));
      if (elapsed < 1) {
        frameId = requestAnimationFrame(step);
      } else {
        setValue(target);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [isInView, prefersReduced, target]);

  return (
    <div
      ref={ref}
      className="rounded-2xl bg-white/95 backdrop-blur-xl border border-[#FED7AA] p-4 sm:p-5 shadow-[0_14px_34px_-10px_rgba(234,88,12,0.12)] flex flex-col justify-between"
    >
      <div className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1C1917] tracking-[-0.02em] tabular-nums">
        {prefix}
        {value.toLocaleString('en-IN')}
        {suffix}
      </div>
      <div className="text-xs sm:text-sm font-medium text-[#44403C] mt-1">{label}</div>
    </div>
  );
}

const TRUST_CHIPS = [
  { icon: FileCheck2, label: 'Fire-Ready Reports' },
  { icon: MapPin, label: 'GPS + Photo Proof' },
  { icon: WifiOff, label: 'Offline-First' },
  { icon: Mic, label: 'Works in Any Language' },
  { icon: Tag, label: 'No QR Stickers (Tag ID + GPS instead)' },
  { icon: Award, label: 'White-Label Client Reports' },
] as const;

export function ProofSection() {
  return (
    <section
      id="proof"
      aria-labelledby="proof-heading"
      className="relative py-12 sm:py-14 px-4 sm:px-6 lg:px-8 scroll-mt-20"
    >
      <div className="relative z-10 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="max-w-3xl space-y-2">
          <div className="font-display text-xs font-bold uppercase tracking-[0.12em] text-[#C2410C]">
            WHY TEAMS SWITCH
          </div>
          <h2
            id="proof-heading"
            className="font-display text-[clamp(1.8rem,3.5vw,2.6rem)] font-bold text-[#1C1917] tracking-[-0.02em] leading-[1.1]"
          >
            Less paperwork. Fewer arguments. More renewals.
          </h2>
        </div>

        {/* 4 Stat Cards (NumberTicker count-up on scroll, brand shadow) */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <StatCounterCard target={190} suffix=" hrs" label="saved / year" />
            <StatCounterCard target={96000} prefix="Rs." label="saved / year" />
            <StatCounterCard target={750} label="assets tracked live" />
            <StatCounterCard target={10} label="facilities, 1 dashboard" />
          </div>
          <p className="text-xs text-[#44403C]">
            Based on a typical 10-facility operation moving from manual reporting.
          </p>
        </div>

        {/* Icon-First Trust Chips */}
        <div className="flex flex-wrap items-center gap-2">
          {TRUST_CHIPS.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#FFF8F2] border border-[#FED7AA] text-xs sm:text-sm font-semibold text-[#1C1917]"
            >
              <Icon className="w-4 h-4 text-[#C2410C] shrink-0" aria-hidden="true" />
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* Sector Marquee (soft ember tint band) */}
        <SectorMarquee />

        {/* Guarantee Glass Band (Founding Agency Promise + Non-Compete Guarantee condensed) */}
        <div className="rounded-2xl bg-[#FFF8F2]/90 backdrop-blur-xl border border-[#FED7AA] p-4 sm:p-5 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="w-9 h-9 rounded-xl bg-[#FFF4EC] border border-[#FED7AA] flex items-center justify-center text-[#0E9F6E] shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            </span>
            <div className="space-y-0.5">
              <h3 className="font-display text-sm sm:text-base font-bold text-[#1C1917]">
                Free 1-building pilot &middot; No lock-in, ever &middot; Your data stays yours &middot; No non-compete games
              </h3>
              <p className="text-xs sm:text-sm text-[#44403C] leading-relaxed">
                <strong>Founding Agency Onboarding Promise &amp; Non-Compete Guarantee:</strong> We
                set up your first building from Excel for free with 1-click data export anytime.
                VigilAMC is pure software - we never sell fire equipment or contact your clients.
              </p>
            </div>
          </div>

          <Link
            href="/sample-report"
            className="min-h-[44px] shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#FED7AA] hover:border-[#C2410C] text-xs font-display font-bold text-[#C2410C] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C2410C]"
          >
            <span>Inspect Sample Report</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>

        {/* Final CTA Band (Charcoal #1C1917 with subtle ember glow, glass card inside scales 0.98->1 on entry) */}
        <motion.div
          initial={{ opacity: 0.96, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className="relative rounded-3xl bg-[#1C1917] text-[#FAFAF9] p-5 sm:p-7 overflow-hidden border border-[#FED7AA]/25 shadow-[0_24px_60px_-15px_rgba(28,25,23,0.35)] motion-reduce:!transform-none"
        >
          {/* Sealed Ember Glow from the Ember Line */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[28rem] h-[14rem] rounded-full blur-2xl opacity-35"
            style={{
              background:
                'radial-gradient(circle, rgba(255,140,66,0.55) 0%, rgba(234,88,12,0.25) 50%, transparent 75%)',
            }}
          />

          <div className="relative z-10 rounded-2xl bg-white/[0.04] backdrop-blur-md border border-[#FAFAF9]/12 p-5 sm:p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
            <div className="space-y-1.5 max-w-xl">
              <h2 className="font-display text-[clamp(1.5rem,2.8vw,2.2rem)] font-bold text-[#FAFAF9] tracking-[-0.02em] leading-[1.1]">
                See VigilAMC on your own building.
              </h2>
              <p className="text-sm sm:text-base text-[#A8A29E] leading-relaxed">
                Free pilot on 1 building. We set it up. You compare.
              </p>
              <div className="pt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#A8A29E] font-medium">
                <a
                  href={`mailto:${SITE_CONFIG.CONTACT_EMAIL}`}
                  className="hover:text-[#FAFAF9] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF8C42] rounded"
                >
                  {SITE_CONFIG.CONTACT_EMAIL}
                </a>
                <span aria-hidden="true">-</span>
                <a
                  href={SITE_CONFIG.PHONE_TEL}
                  className="hover:text-[#FAFAF9] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF8C42] rounded"
                >
                  {SITE_CONFIG.PHONE_DISPLAY}
                </a>
                <span aria-hidden="true">-</span>
                <a
                  href={SITE_CONFIG.SOCIAL.LINKEDIN}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#FF8C42] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF8C42] rounded"
                >
                  @vigilamc
                </a>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
              <a
                href={SITE_CONFIG.WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[48px] inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-[#C2410C] hover:bg-[#EA580C] text-white font-display font-bold text-base shadow-[0_10px_28px_-6px_rgba(234,88,12,0.5)] transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF8C42]"
              >
                <span>Book a Free Demo</span>
                <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </a>

              <Link
                href="/login"
                className="min-h-[48px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-[#FAFAF9]/20 text-[#FAFAF9] font-display font-semibold text-sm transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF8C42]"
              >
                <span>Agency Login</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
