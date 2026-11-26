import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'Fire Extinguisher Calculator | Requirement & Sizing Tool',
  description:
    'Calculate the required number, type, and placement of fire extinguishers for your building area and hazard class in seconds.',
  alternates: {
    canonical: '/tools/extinguisher-calculator',
  },
  openGraph: {
    title: 'Fire Extinguisher Calculator | Requirement & Sizing Tool',
    description:
      'Calculate the required number, type, and placement of fire extinguishers for your building area and hazard class in seconds.',
    url: `${SITE_CONFIG.SITE_URL}/tools/extinguisher-calculator`,
    siteName: SITE_CONFIG.COMPANY_NAME,
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Fire Extinguisher Calculator | Requirement & Sizing Tool',
    description:
      'Calculate the required number, type, and placement of fire extinguishers for your building area and hazard class in seconds.',
    creator: '@vigilamc',
  },
};

export default function ExtinguisherCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
