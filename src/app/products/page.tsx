import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Flame, Smartphone, Monitor, Building2 } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/siteConfig';
import { TechnicianAppSection } from '@/components/home/TechnicianAppSection';
import { AdminDashboardSection } from '@/components/home/AdminDashboardSection';
import { ClientPortalSection } from '@/components/home/ClientPortalSection';
import { FinalCtaSection } from '@/components/home/FinalCtaSection';

export const metadata: Metadata = {
  title: 'Products — Field Technician App, Admin Dashboard & Client Portal | VigilAMC',
  description:
    'Explore the three connected VigilAMC products for fire-safety agencies: offline Android Technician App on Google Play, Admin Dashboard with Form B reports, and white-label Client Portal.',
  alternates: {
    canonical: '/products',
  },
  openGraph: {
    title: 'Products — Field Technician App, Admin Dashboard & Client Portal | VigilAMC',
    description:
      'One platform across field, office, and clients: offline GPS technician app, AMC & Form B admin dashboard, and building client portal.',
    url: `${SITE_CONFIG.SITE_URL}/products`,
    siteName: SITE_CONFIG.COMPANY_NAME,
    locale: 'en_IN',
    type: 'website',
  },
};

const PRODUCT_JUMP_CARDS = [
  {
    id: 'technician-app',
    label: '01 · Field Team',
    title: 'Technician App',
    desc: 'Offline-first Android app with GPS-stamped photos, checklists, and 10 Indian languages.',
    icon: Smartphone,
  },
  {
    id: 'admin-dashboard',
    label: '02 · Office',
    title: 'Admin Dashboard',
    desc: 'AMC cycles, Excel bulk import, repair re-scheduling, teams, and 5-page Form B PDFs.',
    icon: Monitor,
  },
  {
    id: 'client-portal',
    label: '03 · Society & Industry Clients',
    title: 'Client Portal',
    desc: 'White-label compliance portal with building readiness status and Form B receipts.',
    icon: Building2,
  },
];

export default function ProductsPage() {
  return (
    <div className="w-full bg-[#FFFFFF] text-[#1C1917] overflow-x-clip">
      {/* Dedicated /products Hero Banner */}
      <section
        aria-label="VigilAMC Product Suite Overview"
        className="pt-10 pb-14 sm:pt-14 sm:pb-18 border-b border-[#FED7AA]/40"
        style={{
          background: 'linear-gradient(180deg, #FFFFFF 0%, #FFF8F2 100%)',
        }}
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-[780px] mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF8F2] border border-[#FED7AA] mb-5">
              <Flame className="w-4 h-4 text-[#EA580C]" aria-hidden="true" />
              <span className="text-xs sm:text-[13px] font-semibold text-[#C2410C]">
                Three products · One connected agency system
              </span>
            </div>

            <h1 className="font-display text-[36px] sm:text-[48px] lg:text-[58px] font-extrabold leading-[1.08] tracking-[-0.03em] text-[#1C1917] text-balance">
              Every part of your agency, connected from day one.
            </h1>

            <p className="mt-5 text-[17px] sm:text-[19px] leading-[1.55] text-[#44403C] max-w-[640px] mx-auto">
              Your technicians inspect offline on Android, your office manages AMC schedules and
              Form B reports from the dashboard, and your clients verify everything in their own portal.
            </p>

            <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3.5">
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

          {/* 3-Card Product Directory Strip */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
            {PRODUCT_JUMP_CARDS.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="group rounded-2xl bg-white border border-[#FED7AA]/70 p-6 shadow-[0_12px_32px_-20px_rgba(28,25,23,0.16)] hover:-translate-y-0.5 hover:border-[#EA580C]/60 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EA580C]"
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#C2410C]">
                      {item.label}
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-[#FFF0E6] border border-[#FED7AA] flex items-center justify-center text-[#C2410C]">
                      <Icon className="w-4 h-4" aria-hidden="true" />
                    </div>
                  </div>
                  <h2 className="font-display text-xl font-bold text-[#1C1917]">
                    {item.title}
                  </h2>
                  <p className="mt-2 text-sm text-[#44403C] leading-relaxed">
                    {item.desc}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#C2410C]">
                    Jump to details
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Flagship Field Technician App */}
      <TechnicianAppSection />

      {/* Agency Admin Dashboard */}
      <AdminDashboardSection />

      {/* Building Client Portal */}
      <ClientPortalSection />

      {/* Final Conversion CTA */}
      <FinalCtaSection />
    </div>
  );
}
