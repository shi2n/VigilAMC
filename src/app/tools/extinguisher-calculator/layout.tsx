import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'Fire Extinguisher Calculator (IS 2190 & NBC 2016) | VigilAMC',
  description:
    'Free fire extinguisher requirement calculator based on Indian Standard IS 2190 and NBC 2016. Calculate unit count, types, and placement for your facility.',
  alternates: {
    canonical: '/tools/extinguisher-calculator',
  },
  openGraph: {
    title: 'Fire Extinguisher Calculator (IS 2190 & NBC 2016) | VigilAMC',
    description:
      'Free fire extinguisher requirement calculator based on Indian Standard IS 2190 and NBC 2016.',
    url: `${SITE_CONFIG.SITE_URL}/tools/extinguisher-calculator`,
    siteName: SITE_CONFIG.COMPANY_NAME,
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Fire Extinguisher Calculator | VigilAMC',
    description:
      'Free fire extinguisher requirement calculator based on IS 2190 & NBC 2016.',
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
