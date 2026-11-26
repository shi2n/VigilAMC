import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'VigilAMC Pricing | Plans for Fire Safety AMC Agencies',
  description:
    'Transparent subscription plans built for growing fire safety contractors and enterprise AMC service providers.',
  alternates: {
    canonical: '/pricing',
  },
  openGraph: {
    title: 'VigilAMC Pricing | Plans for Fire Safety AMC Agencies',
    description:
      'Transparent subscription plans built for growing fire safety contractors and enterprise AMC service providers.',
    url: `${SITE_CONFIG.SITE_URL}/pricing`,
    siteName: SITE_CONFIG.COMPANY_NAME,
    locale: 'en_IN',
    type: 'website',
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
