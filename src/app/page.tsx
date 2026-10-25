import React from 'react';
import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/siteConfig';
import { EmberLine } from '@/components/home/EmberLine';
import { HeroGlass } from '@/components/home/HeroGlass';
import { HowItWorks } from '@/components/home/HowItWorks';
import { ProofSection } from '@/components/home/ProofSection';

export const metadata: Metadata = {
  title: 'VigilAMC - Fire Safety AMC & Compliance Software | India',
  description:
    'VigilAMC is the simple software that fire-safety service companies use to track every extinguisher, pump and alarm, record visits with live GPS, photos and client signatures, and send compliance-ready reports in minutes.',
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
      name: SITE_CONFIG.COMPANY_NAME,
      legalName: SITE_CONFIG.LEGAL_NAME,
      url: SITE_CONFIG.SITE_URL,
      email: SITE_CONFIG.CONTACT_EMAIL,
      telephone: SITE_CONFIG.PHONE_DISPLAY,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'New Delhi',
        postalCode: '110092',
        addressCountry: 'IN',
      },
      sameAs: [
        SITE_CONFIG.SOCIAL.LINKEDIN,
        SITE_CONFIG.SOCIAL.INSTAGRAM,
        SITE_CONFIG.SOCIAL.TWITTER,
        SITE_CONFIG.SOCIAL.YOUTUBE,
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
        name: SITE_CONFIG.COMPANY_NAME,
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
    <div className="relative w-full bg-[#FFFFFF] text-[#1C1917] overflow-hidden">
      {/* Structured Data: Organization + SoftwareApplication */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Signature Move: The Ember Line travelling down the page seam */}
      <EmberLine />

      {/* Screen 1: Opening Hero State (~100vh) */}
      <HeroGlass />

      {/* Screen 2: Midpoint How It Works State */}
      <HowItWorks />

      {/* Screen 3: Exit Proof + Final CTA State */}
      <ProofSection />
    </div>
  );
}
