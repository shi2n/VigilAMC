import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Flame, Smartphone, Monitor, Building2 } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/siteConfig';
import { LightBrowserFrame, LightPhoneFrame } from '@/components/home/DeviceFrames';
import { TechnicianAppSection } from '@/components/home/TechnicianAppSection';
import { AdminDashboardSection } from '@/components/home/AdminDashboardSection';
import { ClientPortalSection } from '@/components/home/ClientPortalSection';
import { FinalCtaSection } from '@/components/home/FinalCtaSection';

export const metadata: Metadata = {
  title: 'Fire Safety AMC Software Modules & Products | VigilAMC',
  description:
    "Explore VigilAMC's suite of tools for fire safety agencies: Asset Tag ID registers, mobile field inspection logs, and client compliance portals.",
  alternates: {
    canonical: '/products',
  },
  openGraph: {
    title: 'Fire Safety AMC Software Modules & Products | VigilAMC',
    description:
      "Explore VigilAMC's suite of tools for fire safety agencies: Asset Tag ID registers, mobile field inspection logs, and client compliance portals.",
    url: `${SITE_CONFIG.SITE_URL}/products`,
    siteName: SITE_CONFIG.COMPANY_NAME,
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: `${SITE_CONFIG.SITE_URL}/screenshots/dashboard-fire-1440x900.png`,
        width: 1440,
        height: 900,
        alt: 'VigilAMC Admin Dashboard and Field Technician App overview',
      },
    ],
  },
};

export default function ProductsPage() {
  return (
    <div className="w-full bg-[#FFFFFF] text-[#1C1917] overflow-x-clip">
      {/* Compact Hero with Dashboard + Phone Combo */}
      <section
        aria-label="VigilAMC Three Products Overview"
        className="pt-8 pb-14 sm:pt-12 sm:pb-16 lg:pt-14 lg:pb-20 border-b border-[#FED7AA]/40"
        style={{
          background: 'linear-gradient(180deg, #FFFFFF 0%, #FFF8F2 100%)',
        }}
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-[820px] mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF8F2] border border-[#FED7AA] mb-4 sm:mb-5">
              <Flame className="w-4 h-4 text-[#EA580C]" aria-hidden="true" />
              <span className="text-xs sm:text-[13px] font-semibold text-[#C2410C]">
                The VigilAMC Product Suite
              </span>
            </div>

            <h1 className="font-display text-[38px] sm:text-[54px] lg:text-[66px] font-extrabold leading-[1.05] tracking-[-0.035em] text-[#1C1917] text-balance">
              Three products.{' '}
              <span className="text-[#C2410C]">One platform.</span>
            </h1>

            <p className="mt-4 sm:mt-5 text-[17px] sm:text-[19px] leading-[1.55] text-[#44403C] max-w-[640px] mx-auto">
              Everything your agency needs — the field app, the office dashboard, and your
              clients&apos; window into it all.
            </p>

            {/* Quick Product Anchors */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
              <a
                href="#technician-app"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-[#FED7AA] text-xs font-bold text-[#1C1917] hover:border-[#C2410C] hover:text-[#C2410C] transition-colors"
              >
                <Smartphone className="w-3.5 h-3.5 text-[#C2410C]" aria-hidden="true" />
                <span>01 · Technician App</span>
              </a>
              <a
                href="#admin-dashboard"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-[#FED7AA] text-xs font-bold text-[#1C1917] hover:border-[#C2410C] hover:text-[#C2410C] transition-colors"
              >
                <Monitor className="w-3.5 h-3.5 text-[#C2410C]" aria-hidden="true" />
                <span>02 · Admin Dashboard</span>
              </a>
              <a
                href="#client-portal"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-[#FED7AA] text-xs font-bold text-[#1C1917] hover:border-[#C2410C] hover:text-[#C2410C] transition-colors"
              >
                <Building2 className="w-3.5 h-3.5 text-[#C2410C]" aria-hidden="true" />
                <span>03 · Client Portal</span>
              </a>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                href="/contact"
                className="btn-flame w-full sm:w-auto min-h-[48px] px-7 py-3 rounded-2xl text-white font-bold text-[15px] inline-flex items-center justify-center gap-2 shadow-[0_12px_28px_-8px_rgba(194,65,12,0.45)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EA580C]"
              >
                <span>Book a Free Demo</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <Link
                href="/start-trial"
                className="btn-ghost-flame w-full sm:w-auto min-h-[48px] px-7 py-3 rounded-2xl font-bold text-[15px] inline-flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EA580C]"
              >
                Start Free Trial
              </Link>
            </div>
          </div>

          {/* Dashboard + Phone Combo Visual */}
          <div className="mt-8 sm:mt-10 max-w-[1000px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5 items-end">
            <div className="lg:col-span-9">
              <LightBrowserFrame url="vigilamc.com/dashboard · Admin Control">
                <div className="relative aspect-[16/10] w-full bg-[#FFF8F2]">
                  <Image
                    src="/screenshots/dashboard-fire-1440x900.png"
                    alt="VigilAMC Admin Dashboard browser interface showing AMC schedules and live equipment readiness"
                    fill
                    priority
                    sizes="(min-width: 1024px) 740px, 100vw"
                    className="object-cover object-top"
                  />
                </div>
              </LightBrowserFrame>
            </div>

            <div className="lg:col-span-3 flex justify-center">
              <div className="w-[180px] sm:w-[205px]">
                <LightPhoneFrame>
                  <div className="relative aspect-[9/19] w-full bg-[#FFF8F2]">
                    <Image
                      src="/screenshots/tech-home.png"
                      alt="VigilAMC Field Android Technician App home screen with offline sync outbox"
                      fill
                      priority
                      sizes="(min-width: 1024px) 205px, 180px"
                      className="object-cover object-top"
                    />
                  </div>
                </LightPhoneFrame>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product 01: Flagship Technician App (with Book a Free Demo CTA) */}
      <TechnicianAppSection showDemoCta />

      {/* Product 02: Admin Dashboard (with Book a Free Demo CTA) */}
      <AdminDashboardSection showDemoCta />

      {/* Product 03: Client Portal (with Book a Free Demo CTA) */}
      <ClientPortalSection showDemoCta />

      {/* Final Conversion Band */}
      <FinalCtaSection />
    </div>
  );
}
