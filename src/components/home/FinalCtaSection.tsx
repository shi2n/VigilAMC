'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Mail, Phone } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/siteConfig';

export function FinalCtaSection() {
  return (
    <section
      id="final-cta"
      data-testid="final-cta-section"
      aria-labelledby="final-cta-heading"
      className="relative overflow-hidden py-20 sm:py-28 bg-[#C2410C] text-white border-t border-[#EA580C]"
    >
      {/* Subtle FIRE ember radial highlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[780px] h-[360px] rounded-full"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(234, 88, 12, 0.75) 0%, rgba(194, 65, 12, 0) 72%)',
        }}
      />

      <div className="relative z-10 max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2
          id="final-cta-heading"
          className="font-sans font-bold text-[34px] sm:text-[44px] lg:text-[52px] leading-[1.08] tracking-[-0.03em] text-white"
        >
          Keep every building ready for inspection.
        </h2>

        <p className="mt-4 sm:mt-5 text-[17px] sm:text-[19px] text-white max-w-[600px] mx-auto leading-relaxed">
          Book a 15-minute walkthrough for your agency or start setting up your buildings and team right now.
        </p>

        {/* Primary & Secondary CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3.5">
          <Link
            href="/contact"
            data-testid="final-cta-book-demo"
            className="min-h-[50px] inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white hover:bg-[#FFF8F2] text-[#9A3412] font-bold text-[15px] shadow-lg transition-transform duration-150 hover:-translate-y-0.5"
          >
            <span>Book a Free Demo</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>

          <Link
            href="/start-trial"
            data-testid="final-cta-start-trial"
            className="min-h-[50px] inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#9A3412] hover:bg-[#7C2D12] border border-white/40 text-white font-bold text-[15px] transition-transform duration-150 hover:-translate-y-0.5"
          >
            <span>Start Free Trial</span>
          </Link>
        </div>

        {/* Direct Phone & Support Email */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm font-semibold">
          <a
            href={SITE_CONFIG.PHONE_TEL}
            className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#9A3412] hover:bg-[#7C2D12] border border-white/30 text-white transition-colors"
          >
            <Phone className="w-4 h-4" aria-hidden="true" />
            <span>{SITE_CONFIG.PHONE_DISPLAY}</span>
          </a>

          <a
            href={SITE_CONFIG.SALES_PHONE_TEL}
            className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#9A3412] hover:bg-[#7C2D12] border border-white/30 text-white transition-colors"
          >
            <Phone className="w-4 h-4" aria-hidden="true" />
            <span>Sales &amp; Demos: {SITE_CONFIG.SALES_PHONE_DISPLAY}</span>
          </a>

          <a
            href={`mailto:${SITE_CONFIG.SUPPORT_EMAIL}`}
            className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#9A3412] hover:bg-[#7C2D12] border border-white/30 text-white transition-colors"
          >
            <Mail className="w-4 h-4" aria-hidden="true" />
            <span>{SITE_CONFIG.SUPPORT_EMAIL}</span>
          </a>

          <a
            href={`mailto:${SITE_CONFIG.SALES_EMAIL}`}
            className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#9A3412] hover:bg-[#7C2D12] border border-white/30 text-white transition-colors"
          >
            <Mail className="w-4 h-4" aria-hidden="true" />
            <span>{SITE_CONFIG.SALES_EMAIL}</span>
          </a>
        </div>
      </div>
    </section>
  );
}

export default FinalCtaSection;
