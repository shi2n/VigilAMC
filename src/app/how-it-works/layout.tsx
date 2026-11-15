import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'How It Works — Fire Safety Compliance Software for Agencies | VigilAMC',
  description:
    'Fire safety compliance software for agencies that goes live in a day: import your Excel register, inspect offline with GPS proof, and automate 5-page Form B reports.',
  alternates: {
    canonical: '/how-it-works',
  },
  openGraph: {
    title: 'How It Works — Fire Safety Compliance Software for Agencies | VigilAMC',
    description:
      'Live in a day. Not a quarter. Step 1 Set up, Step 2 Inspect offline with GPS, Step 3 Form B reports & alerts.',
    url: `${SITE_CONFIG.SITE_URL}/how-it-works`,
    siteName: SITE_CONFIG.COMPANY_NAME,
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: `${SITE_CONFIG.SITE_URL}/images/scene-gps.jpg`,
        width: 1200,
        height: 750,
        alt: 'VigilAMC step-by-step fire safety agency workflow',
      },
    ],
  },
};

export default function HowItWorksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
