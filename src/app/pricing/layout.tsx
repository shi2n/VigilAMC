import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'Pricing & Pilot Program | VigilAMC — Fire Safety AMC Software',
  description:
    'Simple, transparent pricing for Indian fire-safety service agencies. Free pilot onboarding for your first building.',
  alternates: {
    canonical: '/pricing',
  },
  openGraph: {
    title: 'Pricing & Pilot Program | VigilAMC',
    description:
      'Simple, transparent pricing for Indian fire-safety service agencies.',
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
