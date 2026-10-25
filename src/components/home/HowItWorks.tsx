'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  MapPin,
  PenTool,
  FileCheck2,
  ChevronDown,
  Info,
  XCircle,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { motion, useScroll, useMotionValueEvent, useReducedMotion } from 'motion/react';

const STEPS = [
  {
    num: '01',
    title: 'INSPECT',
    body: 'The technician arrives. The app logs live GPS, walks them floor-by-floor with simple tap checklists, and captures photos with automatic location stamps.',
    icon: MapPin,
    linkLabel: 'Preview Field App',
    linkHref: '/technician',
  },
  {
    num: '02',
    title: 'PROVE',
    body: 'The supervisor signs on the phone screen. Voice remarks work in any Indian language. Everything works even in basement parking with no internet.',
    icon: PenTool,
    linkLabel: null,
    linkHref: null,
  },
  {
    num: '03',
    title: 'REPORT',
    body: 'Before the technician leaves the building, the compliance report is ready - clean, branded, and shared with the client on WhatsApp in one tap.',
    icon: FileCheck2,
    linkLabel: 'See Sample Report',
    linkHref: '/sample-report',
  },
] as const;

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [explainerOpen, setExplainerOpen] = useState(true);
  const [activeStep, setActiveStep] = useState<number>(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const shouldReduceMotion = mounted && Boolean(prefersReduced);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 75%', 'end 35%'],
  });

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (latest < 0.35) {
      setActiveStep(0);
    } else if (latest < 0.68) {
      setActiveStep(1);
    } else {
      setActiveStep(2);
    }
  });

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      aria-labelledby="how-it-works-heading"
      className="relative py-12 sm:py-14 px-4 sm:px-6 lg:px-8 bg-[#FFF8F2] border-b border-[#FED7AA]/60 scroll-mt-16"
    >
      <div className="relative z-10 max-w-6xl mx-auto space-y-6">
        {/* Section Header */}
        <div className="max-w-3xl space-y-2.5">
          <div className="font-display text-xs font-bold uppercase tracking-[0.12em] text-[#C2410C]">
            HOW IT WORKS
          </div>
          <h2
            id="how-it-works-heading"
            className="font-display text-[clamp(1.8rem,3.5vw,2.6rem)] font-bold text-[#1C1917] tracking-[-0.02em] leading-[1.1]"
          >
            If you can use WhatsApp, you can use VigilAMC.
          </h2>
          <p className="text-base sm:text-lg text-[#44403C] leading-relaxed">
            Three steps. No training. No QR stickers. No paper registers.
          </p>
        </div>

        {/* First-Timer Plain-English Explainer Chip (accessible button with aria-expanded) */}
        <div className="max-w-3xl rounded-2xl bg-white/85 backdrop-blur-xl border border-[#FED7AA] shadow-[0_8px_24px_-8px_rgba(234,88,12,0.10)] overflow-hidden">
          <button
            type="button"
            onClick={() => setExplainerOpen((prev) => !prev)}
            aria-expanded={explainerOpen}
            aria-controls="fire-amc-explainer-panel"
            className="w-full min-h-[44px] px-4 sm:px-5 py-2.5 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-display font-bold text-[#1C1917] hover:bg-[#FFF4EC]/60 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#C2410C]"
          >
            <span className="inline-flex items-center gap-2">
              <Info className="w-4 h-4 text-[#C2410C] shrink-0" aria-hidden="true" />
              <span>New to fire safety? What is a Fire AMC?</span>
            </span>
            <ChevronDown
              className={`w-4 h-4 text-[#C2410C] shrink-0 transition-transform duration-200 ${
                explainerOpen ? 'rotate-180' : ''
              }`}
              aria-hidden="true"
            />
          </button>

          {explainerOpen && (
            <div
              id="fire-amc-explainer-panel"
              className="px-4 sm:px-5 pb-3.5 pt-1 text-sm text-[#44403C] leading-relaxed border-t border-[#FED7AA]/50"
            >
              New to fire safety? Buildings must keep every extinguisher, pump and alarm serviced
              by law - that yearly service agreement is called a{' '}
              <strong className="font-semibold text-[#1C1917]">
                Fire AMC (Annual Maintenance Contract)
              </strong>
              . VigilAMC digitizes that work.
            </div>
          )}
        </div>

        {/* 3 Glass Step Cards (stagger-reveal 25ms, left border ignites with Ember Line) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isLit = idx <= activeStep;
            return (
              <motion.article
                key={step.num}
                initial={{ opacity: 0.95, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{
                  duration: 0.4,
                  delay: shouldReduceMotion ? 0 : idx * 0.025,
                  ease: [0.23, 1, 0.32, 1],
                }}
                className={`relative rounded-2xl bg-white/90 backdrop-blur-xl border border-[#FED7AA] border-l-4 p-5 flex flex-col justify-between transition-all duration-300 motion-reduce:!transform-none ${
                  isLit
                    ? 'border-l-[#EA580C] shadow-[0_16px_38px_-12px_rgba(234,88,12,0.16)]'
                    : 'border-l-[#FED7AA] shadow-sm'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-3xl font-bold tracking-tight bg-gradient-to-br from-[#FF8C42] via-[#EA580C] to-[#C2410C] bg-clip-text text-transparent tabular-nums">
                      {step.num}
                    </span>
                    <span className="w-9 h-9 rounded-xl bg-[#FFF4EC] border border-[#FED7AA] flex items-center justify-center text-[#C2410C]">
                      <Icon className="w-4 h-4" aria-hidden="true" />
                    </span>
                  </div>

                  <h3 className="font-display text-lg font-bold text-[#1C1917] tracking-[-0.01em]">
                    {step.title}
                  </h3>

                  <p className="text-sm text-[#44403C] leading-relaxed">{step.body}</p>
                </div>

                {step.linkHref && step.linkLabel && (
                  <div className="pt-3.5 mt-3.5 border-t border-[#FED7AA]/50">
                    <Link
                      href={step.linkHref}
                      className="inline-flex items-center gap-1.5 text-xs font-display font-bold text-[#C2410C] hover:text-[#1C1917] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C2410C] rounded"
                    >
                      <span>{step.linkLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                )}
              </motion.article>
            );
          })}
        </div>

        {/* Before / After Glass Strip (2 columns, slides in from 8px) */}
        <motion.div
          initial={{ opacity: 0.95, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 motion-reduce:!transform-none"
        >
          {/* Old Way (muted stone) */}
          <div className="rounded-2xl bg-[#F5F5F4]/90 border border-[#E7E5E4] p-4 sm:p-5 flex items-start gap-3.5">
            <XCircle className="w-5 h-5 text-[#B91C1C] shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-[#44403C]">
                The old way
              </h3>
              <p className="text-sm text-[#44403C] mt-1 leading-relaxed">
                Paper registers, WhatsApp photo chaos, reports in 3 days, no proof during audits.
              </p>
            </div>
          </div>

          {/* The VigilAMC Way (ember accents) */}
          <div className="rounded-2xl bg-white/95 backdrop-blur-xl border border-[#FED7AA] p-4 sm:p-5 flex items-start gap-3.5 shadow-[0_12px_30px_-10px_rgba(234,88,12,0.14)]">
            <CheckCircle2 className="w-5 h-5 text-[#0E9F6E] shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-[#C2410C]">
                The VigilAMC way
              </h3>
              <p className="text-sm text-[#1C1917] font-medium mt-1 leading-relaxed">
                Live GPS proof, reports in 1 minute, expiry alerts, audit-ready in 2 taps.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
