import React from 'react';
import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/siteConfig';
import { EmberLine } from '@/components/home/EmberLine';
import { HeroSection } from '@/components/home/HeroSection';
import { ProblemSection } from '@/components/home/ProblemSection';
import { TrioOverviewSection } from '@/components/home/TrioOverviewSection';
import { TechnicianAppSection } from '@/components/home/TechnicianAppSection';
import { AdminDashboardSection } from '@/components/home/AdminDashboardSection';
import { ClientPortalSection } from '@/components/home/ClientPortalSection';
import { FeatureGridSection } from '@/components/home/FeatureGridSection';
import { HowItWorksSection } from '@/components/home/HowItWorksSection';
import { VideoExplainerSection } from '@/components/home/VideoExplainerSection';
import { FinalCtaSection } from '@/components/home/FinalCtaSection';

export const metadata: Metadata = {
  title: 'VigilAMC | Fire Safety Compliance Software for Agencies | Offline App, Dashboard & Form B',
  description:
    'Fire safety compliance software for Indian agencies, with an offline technician app, admin dashboard, client portal, and 5-page Form B reports.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'VigilAMC | Fire Safety Compliance Software for Agencies | Offline App, Dashboard & Form B',
    description:
      'Inspections, AMC schedules, compliance reports, your field team, and your clients in one place. Works online or offline.',
    url: SITE_CONFIG.SITE_URL,
    siteName: SITE_CONFIG.COMPANY_NAME,
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: `${SITE_CONFIG.SITE_URL}/images/hero-technician-v2.jpg`,
        width: 1200,
        height: 675,
        alt: 'VigilAMC offline fire-safety technician inspection and agency compliance suite',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VigilAMC | Fire Safety Compliance Software for Agencies',
    description:
      'Inspections, AMC schedules, Form B compliance reports, your field team, and your clients in one place. Works online or offline.',
    creator: '@vigilamc',
    images: [`${SITE_CONFIG.SITE_URL}/images/hero-technician-v2.jpg`],
  },
};

export default function HomePage() {
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'VigilAMC Technologies',
      legalName: SITE_CONFIG.LEGAL_NAME,
      url: SITE_CONFIG.SITE_URL,
      logo: `${SITE_CONFIG.SITE_URL}/brand/logo-tile-512.png`,
      email: 'vigilamc@gmail.com',
      telephone: SITE_CONFIG.PHONE_DISPLAY,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'New Delhi',
        postalCode: '110092',
        addressCountry: 'IN',
      },
      sameAs: [
        SITE_CONFIG.SOCIAL.YOUTUBE,
        SITE_CONFIG.GOOGLE_PLAY_URL,
        SITE_CONFIG.SOCIAL.LINKEDIN,
        SITE_CONFIG.SOCIAL.INSTAGRAM,
        SITE_CONFIG.SOCIAL.TWITTER,
      ],
      contactPoint: [
        {
          '@type': 'ContactPoint',
          telephone: SITE_CONFIG.PHONE_DISPLAY,
          email: SITE_CONFIG.CONTACT_EMAIL,
          contactType: 'customer support',
          areaServed: 'IN',
          availableLanguage: ['English', 'Hindi'],
        },
        {
          '@type': 'ContactPoint',
          telephone: SITE_CONFIG.SALES_PHONE_DISPLAY,
          email: SITE_CONFIG.SALES_EMAIL,
          contactType: 'sales',
          areaServed: 'IN',
          availableLanguage: ['English', 'Hindi'],
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: SITE_CONFIG.COMPANY_NAME,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web, Android, iOS',
      description:
        'Fire safety Annual Maintenance Contract (AMC) software for Indian fire-safety service companies to track extinguishers, pumps and alarms, log GPS and photo proof, collect client signatures, and generate compliance reports.',
      url: SITE_CONFIG.SITE_URL,
      author: {
        '@type': 'Organization',
        name: 'VigilAMC Technologies',
        url: SITE_CONFIG.SITE_URL,
      },
    },
  ];

  return (
    <div className="relative w-full bg-[#FFFFFF] text-[#1C1917] overflow-x-clip">
      {/* Structured Data: Organization + SoftwareApplication */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Signature Move: The Ember Line travelling down the page seam on wide desktops */}
      <EmberLine />

      {/* S1: Hero — static composition, no hero video */}
      <HeroSection />

      {/* S2: The Problem — 5 agency-owner pains + flip to solution */}
      <ProblemSection />

      {/* S3: Three Products. One Platform. */}
      <TrioOverviewSection />

      {/* S4: Technician App (Flagship — offline, GPS-stamped proof, Play Store) */}
      <TechnicianAppSection />

      {/* S5: Admin Dashboard ("The office, organized") */}
      <AdminDashboardSection />

      {/* S6: Client Portal */}
      <ClientPortalSection />

      {/* S7: 12-tile Feature Grid */}
      <FeatureGridSection />

      {/* S8: How It Works — 3-step horizontal timeline */}
      <HowItWorksSection />

      {/* S9: Video Explainer (self-hosted MP4) */}
      <VideoExplainerSection />

      {/* S10: Final CTA band (followed by unchanged CorporateFooter in SiteLayout) */}
      <FinalCtaSection />
    </div>
  );
}
