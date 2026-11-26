import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'How VigilAMC Works | End-to-End Fire Safety AMC Workflow',
  description:
    'See how fire safety agencies onboard client sites, tag extinguishers, log field inspections, and generate audit-ready compliance reports.',
  alternates: {
    canonical: '/how-it-works',
  },
  openGraph: {
    title: 'How VigilAMC Works | End-to-End Fire Safety AMC Workflow',
    description:
      'See how fire safety agencies onboard client sites, tag extinguishers, log field inspections, and generate audit-ready compliance reports.',
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
