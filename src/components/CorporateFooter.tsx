'use client';

import React from 'react';
import Link from 'next/link';
import {
  Mail,
  Phone,
  Youtube,
  Linkedin,
  Instagram,
  Twitter,
  ShieldCheck,
  ArrowUpRight,
} from 'lucide-react';
import { SITE_CONFIG } from '@/lib/siteConfig';
import { NewsletterForm } from '@/components/NewsletterForm';
import { SkylineStrip } from '@/components/SkylineStrip';
import { StartupDirectoryBadges } from '@/components/StartupDirectoryBadges';
import { GooglePlayBadge } from '@/components/GooglePlayBadge';
import { AppStoreBadge } from '@/components/AppStoreBadge';

export function CorporateFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      data-testid="vigil-corporate-footer"
      className="bg-[#FFF8F2] text-[#44403C] border-t border-[#FED7AA]/60 pt-12 sm:pt-16 pb-0 overflow-hidden no-print"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ══════════════════════════════════════════════════════
            ZONE A (TOP): Brand Lockup & Newsletter Card
            Two columns on desktop, stacked on mobile/tablet
        ══════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b border-[#FED7AA]/50 items-start">
          {/* ZONE A - LEFT: Brand Mark + Wordmark + 2-Line Paragraph */}
          <div className="lg:col-span-6 space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-3 min-h-[44px] rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EA580C] group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.svg"
                alt="VigilAMC Brand Logo"
                width={44}
                height={44}
                className="w-11 h-11 rounded-xl shadow-sm shrink-0 transition-transform duration-200 group-hover:scale-105"
              />
              <span className="font-display text-2xl font-bold tracking-tight text-[#1C1917]">
                Vigil<span className="text-[#C2410C]">AMC</span>
              </span>
            </Link>

            <p className="text-sm text-[#44403C] leading-relaxed max-w-lg font-normal">
              VigilAMC keeps residential societies, commercial towers, and industrial plants audit-ready —
              streamlining scheduled fire inspections, statutory Form-B compliance certificates, and field technician dispatch in one unified platform.
            </p>

            {/* Mobile App Download Badges */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <GooglePlayBadge size="sm" theme="light" />
              <AppStoreBadge size="sm" theme="light" comingSoon />
              <span className="text-xs text-[#57534E] font-medium block w-full sm:w-auto">
                Field app on Google Play &amp; Apple App Store (Soon).
              </span>
            </div>
          </div>

          {/* ZONE A - RIGHT: Newsletter Card (Glass Panel Touch) */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl bg-white/80 backdrop-blur-md border border-[#FED7AA]/70 p-6 sm:p-7 shadow-[0_8px_30px_rgb(234,88,12,0.06)] space-y-3.5">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#C2410C]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#EA580C]" aria-hidden="true" />
                  Industry Dispatch
                </span>
                <h3 className="font-display text-lg font-bold text-[#1C1917] tracking-tight">
                  Fire-Safety Updates
                </h3>
              </div>

              {/* Newsletter Form Component */}
              <NewsletterForm />
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            ZONE B (MIDDLE): 4 Navigation Link Columns
            Desktop 4 cols, Tablet 2x2, Mobile 2 wide
        ══════════════════════════════════════════════════════ */}
        <div className="py-12 border-b border-[#FED7AA]/50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-10">
            {/* Column 1: Quick Links */}
            <nav aria-label="Quick Links" className="space-y-3">
              <h4 className="font-display text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                Quick Links
              </h4>
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/"
                    className="inline-flex items-center min-h-[44px] text-sm text-[#44403C] hover:text-[#EA580C] hover:translate-x-0.5 transition-all font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#EA580C] rounded"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/features"
                    className="inline-flex items-center min-h-[44px] text-sm text-[#44403C] hover:text-[#EA580C] hover:translate-x-0.5 transition-all font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#EA580C] rounded"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="inline-flex items-center min-h-[44px] text-sm text-[#44403C] hover:text-[#EA580C] hover:translate-x-0.5 transition-all font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#EA580C] rounded"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/demo"
                    className="inline-flex items-center min-h-[44px] text-sm text-[#C2410C] hover:text-[#9A3412] hover:translate-x-0.5 transition-all font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#EA580C] rounded"
                  >
                    Demo Tour
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tools/extinguisher-calculator"
                    className="inline-flex items-center min-h-[44px] text-sm text-[#44403C] hover:text-[#EA580C] hover:translate-x-0.5 transition-all font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#EA580C] rounded"
                  >
                    Free Audit Calculator
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Column 2: Client Care */}
            <nav aria-label="Client Care" className="space-y-3">
              <h4 className="font-display text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                Client Care
              </h4>
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/contact"
                    className="inline-flex items-center min-h-[44px] text-sm text-[#44403C] hover:text-[#EA580C] hover:translate-x-0.5 transition-all font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#EA580C] rounded"
                  >
                    Help &amp; Support
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing#faqs"
                    className="inline-flex items-center min-h-[44px] text-sm text-[#44403C] hover:text-[#EA580C] hover:translate-x-0.5 transition-all font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#EA580C] rounded"
                  >
                    FAQs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="inline-flex items-center min-h-[44px] text-sm text-[#44403C] hover:text-[#EA580C] hover:translate-x-0.5 transition-all font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#EA580C] rounded"
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="inline-flex items-center min-h-[44px] text-sm text-[#44403C] hover:text-[#EA580C] hover:translate-x-0.5 transition-all font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#EA580C] rounded"
                  >
                    Agency Onboarding
                  </Link>
                </li>
                <li>
                  <Link
                    href="/sample-report"
                    className="inline-flex items-center min-h-[44px] text-sm text-[#44403C] hover:text-[#EA580C] hover:translate-x-0.5 transition-all font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#EA580C] rounded"
                  >
                    Sample Form-B Report
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Column 3: Company */}
            <nav aria-label="Company" className="space-y-3">
              <h4 className="font-display text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                Company
              </h4>
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/founder"
                    className="inline-flex items-center min-h-[44px] text-sm text-[#44403C] hover:text-[#EA580C] hover:translate-x-0.5 transition-all font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#EA580C] rounded"
                  >
                    Founder Desk
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="inline-flex items-center min-h-[44px] text-sm text-[#44403C] hover:text-[#EA580C] hover:translate-x-0.5 transition-all font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#EA580C] rounded"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="inline-flex items-center min-h-[44px] text-sm text-[#44403C] hover:text-[#EA580C] hover:translate-x-0.5 transition-all font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#EA580C] rounded"
                  >
                    Terms &amp; Conditions
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="inline-flex items-center min-h-[44px] text-sm text-[#44403C] hover:text-[#EA580C] hover:translate-x-0.5 transition-all font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#EA580C] rounded"
                  >
                    Why VigilAMC
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="inline-flex items-center min-h-[44px] text-sm text-[#44403C] hover:text-[#EA580C] hover:translate-x-0.5 transition-all font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#EA580C] rounded"
                  >
                    Agency Login
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Column 4: Connect With Us */}
            <div className="space-y-3">
              <h4 className="font-display text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                Connect With Us
              </h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-[#C2410C]">
                    Email Support
                  </span>
                  <a
                    href={`mailto:${SITE_CONFIG.EMAILS.support}`}
                    className="inline-flex items-center min-h-[36px] text-sm text-[#44403C] hover:text-[#EA580C] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#EA580C] rounded"
                  >
                    <Mail className="w-3.5 h-3.5 mr-1.5 text-[#C2410C] shrink-0" aria-hidden="true" />
                    <span>{SITE_CONFIG.EMAILS.support}</span>
                  </a>
                </div>

                <div>
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-[#C2410C]">
                    Direct Phone / WhatsApp
                  </span>
                  <a
                    href={SITE_CONFIG.PHONE_TEL}
                    className="inline-flex items-center min-h-[36px] text-sm font-semibold text-[#1C1917] hover:text-[#EA580C] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#EA580C] rounded"
                  >
                    <Phone className="w-3.5 h-3.5 mr-1.5 text-[#C2410C] shrink-0" aria-hidden="true" />
                    <span>{SITE_CONFIG.PHONE_DISPLAY}</span>
                  </a>
                </div>

                {/* Social Icon Bubbles with Real URLs */}
                <div className="pt-2">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-[#57534E] mb-2">
                    Social Channels
                  </span>
                  <div className="flex items-center gap-2">
                    {/* YouTube (real brand video / channel) */}
                    <a
                      href={SITE_CONFIG.SOCIAL.YOUTUBE}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="VigilAMC on YouTube"
                      className="w-10 h-10 rounded-xl bg-white border border-[#FED7AA]/70 flex items-center justify-center text-[#44403C] hover:text-[#C2410C] hover:border-[#EA580C] hover:bg-[#FFF4EC] shadow-sm transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#EA580C]"
                    >
                      <Youtube className="w-4 h-4 text-[#C2410C]" aria-hidden="true" />
                    </a>

                    {/* LinkedIn */}
                    <a
                      href={SITE_CONFIG.SOCIAL.LINKEDIN}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="VigilAMC on LinkedIn"
                      className="w-10 h-10 rounded-xl bg-white border border-[#FED7AA]/70 flex items-center justify-center text-[#44403C] hover:text-[#C2410C] hover:border-[#EA580C] hover:bg-[#FFF4EC] shadow-sm transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#EA580C]"
                    >
                      <Linkedin className="w-4 h-4 text-[#0077B5]" aria-hidden="true" />
                    </a>

                    {/* Instagram */}
                    <a
                      href={SITE_CONFIG.SOCIAL.INSTAGRAM}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="VigilAMC on Instagram"
                      className="w-10 h-10 rounded-xl bg-white border border-[#FED7AA]/70 flex items-center justify-center text-[#44403C] hover:text-[#C2410C] hover:border-[#EA580C] hover:bg-[#FFF4EC] shadow-sm transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#EA580C]"
                    >
                      <Instagram className="w-4 h-4 text-[#E1306C]" aria-hidden="true" />
                    </a>

                    {/* X / Twitter */}
                    <a
                      href={SITE_CONFIG.SOCIAL.TWITTER}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="VigilAMC on X"
                      className="w-10 h-10 rounded-xl bg-white border border-[#FED7AA]/70 flex items-center justify-center text-[#44403C] hover:text-[#C2410C] hover:border-[#EA580C] hover:bg-[#FFF4EC] shadow-sm transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#EA580C]"
                    >
                      <Twitter className="w-4 h-4 text-[#1C1917]" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Verified Startup Directory Badges */}
        <StartupDirectoryBadges variant="footer" />

        {/* ══════════════════════════════════════════════════════
            ZONE C (BOTTOM BAND): Centered Dynamic Legal Line
            Positioned directly ABOVE the Skyline Strip
        ══════════════════════════════════════════════════════ */}
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#57534E]">
          <p className="text-center sm:text-left leading-relaxed">
            VigilAMC is compliance software for fire-safety service agencies and building owners.
            <span className="block sm:inline sm:ml-1 text-[11px] text-[#57534E]/80">
              DPIIT-recognized startup · Made in India
            </span>
          </p>
          <p className="font-semibold text-[#1C1917] tracking-tight shrink-0 text-center sm:text-right">
            &copy; {currentYear} VigilAMC. All Rights Reserved.
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          SIGNATURE SKYLINE STRIP (Item 2)
          Flush against the page bottom, full-bleed, fixed height
      ══════════════════════════════════════════════════════ */}
      <div className="w-full mt-2 -mb-px">
        <SkylineStrip />
      </div>
    </footer>
  );
}
