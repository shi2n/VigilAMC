import React from 'react';
import Link from 'next/link';
import { SITE_CONFIG } from '@/lib/siteConfig';

export function CorporateFooter() {
  return (
    <footer className="bg-[#1C1917] text-[#FAFAF9] border-t border-[#FED7AA]/15 py-8 px-4 sm:px-6 lg:px-8 no-print">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-6 border-b border-[#FAFAF9]/10">
          {/* Brand Mark + Wordmark Lockup + One-Liner */}
          <div className="md:col-span-6 space-y-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 min-h-[44px] rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF8C42] group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/logo-tile-192.png"
                alt="VigilAMC Logo"
                width={36}
                height={36}
                className="w-9 h-9 rounded-xl object-cover ring-1 ring-white/20 shadow-sm shrink-0 transition-transform duration-200 group-hover:scale-105"
              />
              <span className="font-display text-xl font-bold tracking-[-0.02em] text-[#FAFAF9]">
                Vigil<span className="text-[#FF8C42]">AMC</span>
              </span>
            </Link>
            <p className="text-sm text-[#A8A29E] max-w-md leading-relaxed">
              Fire safety AMC software - tracked, proven, reported.
            </p>
            <div className="pt-1 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#A8A29E]">
              <a
                href={`mailto:${SITE_CONFIG.CONTACT_EMAIL}`}
                className="hover:text-[#FAFAF9] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF8C42] rounded"
              >
                {SITE_CONFIG.CONTACT_EMAIL}
              </a>
              <span aria-hidden="true">&middot;</span>
              <a
                href={SITE_CONFIG.PHONE_TEL}
                className="hover:text-[#FAFAF9] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF8C42] rounded"
              >
                {SITE_CONFIG.PHONE_DISPLAY}
              </a>
              <span aria-hidden="true">&middot;</span>
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

          {/* Product Column */}
          <div className="md:col-span-3 space-y-2.5">
            <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[#FAFAF9]">
              Product
            </h3>
            <ul className="space-y-1.5 text-sm text-[#A8A29E]">
              <li>
                <Link
                  href="/sample-report"
                  className="inline-flex items-center min-h-[36px] hover:text-[#FAFAF9] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF8C42] rounded"
                >
                  Sample Report
                </Link>
              </li>
              <li>
                <Link
                  href="/technician"
                  className="inline-flex items-center min-h-[36px] hover:text-[#FAFAF9] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF8C42] rounded"
                >
                  Field App
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="inline-flex items-center min-h-[36px] hover:text-[#FAFAF9] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF8C42] rounded"
                >
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div className="md:col-span-3 space-y-2.5">
            <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[#FAFAF9]">
              Company
            </h3>
            <ul className="space-y-1.5 text-sm text-[#A8A29E]">
              <li>
                <a
                  href={`mailto:${SITE_CONFIG.CONTACT_EMAIL}`}
                  className="inline-flex items-center min-h-[36px] hover:text-[#FAFAF9] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF8C42] rounded"
                >
                  Contact ({SITE_CONFIG.CONTACT_EMAIL})
                </a>
              </li>
              <li>
                <a
                  href={SITE_CONFIG.WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center min-h-[36px] hover:text-[#FF8C42] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF8C42] rounded"
                >
                  WhatsApp ({SITE_CONFIG.PHONE_DISPLAY})
                </a>
              </li>
              <li className="pt-1 flex items-center gap-3 text-xs">
                <a
                  href={SITE_CONFIG.SOCIAL.LINKEDIN}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#FAFAF9] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF8C42] rounded"
                >
                  LinkedIn
                </a>
                <a
                  href={SITE_CONFIG.SOCIAL.INSTAGRAM}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#FAFAF9] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF8C42] rounded"
                >
                  Instagram
                </a>
                <a
                  href={SITE_CONFIG.SOCIAL.TWITTER}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#FAFAF9] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF8C42] rounded"
                >
                  X
                </a>
                <a
                  href={SITE_CONFIG.SOCIAL.YOUTUBE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#FAFAF9] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF8C42] rounded"
                >
                  YouTube
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal Line */}
        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#A8A29E]">
          <p>
            VigilAMC is software for fire-safety service companies. We do not sell firefighting equipment.
          </p>
          <p className="shrink-0 font-medium text-[#FAFAF9]/90">
            (c) 2026 VigilAMC - Made in India
          </p>
        </div>
      </div>
    </footer>
  );
}
