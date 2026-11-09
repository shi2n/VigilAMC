// UI 'unslop' pass method by Damir Sokolovsky (@heydamir) — github.com/heydamir/unslop (CC BY 4.0)
import React from 'react';
import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/siteConfig';
import { EmberLine } from '@/components/home/EmberLine';
import { HeroGlass } from '@/components/home/HeroGlass';
import { PainScene } from '@/components/home/PainScene';
import { HowItWorks } from '@/components/home/HowItWorks';
import { SectorMarquee } from '@/components/home/SectorMarquee';
import { ProductOverviewSection } from '@/components/home/ProductOverviewSection';
import { PlatformFeaturesGrid } from '@/components/home/PlatformFeaturesGrid';
import { VideoExplainerSection } from '@/components/home/VideoExplainerSection';
import { FreeToolsSection } from '@/components/home/FreeToolsSection';
import { FieldAppSection } from '@/components/home/FieldAppSection';
import { ContactSection } from '@/components/home/ContactSection';
import { ProofSection } from '@/components/home/ProofSection';

export const metadata: Metadata = {
  title: 'VigilAMC - Fire Safety AMC & Compliance Software | India',
  description:
    'VigilAMC is the complete software suite that fire-safety service companies use to track every extinguisher, pump and alarm, record visits with live GPS, photos and client signatures, and send compliance-ready reports in minutes.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'VigilAMC - Fire Safety AMC & Compliance Software | India',
    description:
      'Never Miss a Fire Compliance Deadline Again. Track every extinguisher, pump and alarm with live GPS, photo proof, client signatures, and compliance reports in minutes.',
    url: SITE_CONFIG.SITE_URL,
    siteName: SITE_CONFIG.COMPANY_NAME,
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VigilAMC - Fire Safety AMC & Compliance Software | India',
    description:
      'Never Miss a Fire Compliance Deadline Again. Track every extinguisher, pump and alarm with live GPS, photo proof, client signatures, and compliance reports in minutes.',
    creator: '@vigilamc',
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
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: SITE_CONFIG.PHONE_DISPLAY,
        email: SITE_CONFIG.CONTACT_EMAIL,
        contactType: 'customer support',
        areaServed: 'IN',
        availableLanguage: ['English', 'Hindi'],
      },
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
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'INR',
        description: 'Free 1-building pilot onboarding for fire-safety service companies.',
      },
    },
  ];

  return (
    <div className="relative w-full bg-[#FFFFFF] text-[#1C1917] overflow-x-hidden">
      {/* Structured Data: Organization + SoftwareApplication */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Signature Move: The Ember Line travelling down the page seam */}
      <EmberLine />

      {/* Screen 1: Hero State with Flying Product Moments */}
      <HeroGlass />

      {/* Screen 2: Pain Scene Drama (Replaces old/new strip) */}
      <PainScene />

      {/* Screen 3: 3 Steps With Real Indian Inspection Imagery */}
      <HowItWorks />

      {/* Building-Type Industry Photo Strip Marquee */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <SectorMarquee />
      </div>

      {/* Screen 3A: Product Overview Section (Admin Dashboard + Field Technician App) */}
      <ProductOverviewSection />

      {/* Screen 3B: Platform Features Grid (10 Core Tools) */}
      <PlatformFeaturesGrid />

      {/* Screen 3C: Video Explainer Section (Owner 40s YouTube Facade) */}
      <VideoExplainerSection />

      {/* Screen 3D: Free Tools & Live Demos Section (4 Real Tool Cards) */}
      <FreeToolsSection />

      {/* Screen 3E: VigilAMC Field Android App on Google Play */}
      <FieldAppSection />

      {/* Screen 3F: Direct Team & Founder Desk Contact Section */}
      <ContactSection />

      {/* Screen 4: Real Numbers + Guarantees + Founding Agency Promise + Final CTA */}
      <ProofSection />
    </div>
  );
}
