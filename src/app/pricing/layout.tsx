import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'VigilAMC Pricing | Basic, Pro & Advanced Plans (INR)',
  description:
    'Transparent monthly and yearly INR pricing for VigilAMC fire safety AMC teams. Basic (₹1,400/mo), Pro (₹2,500/mo), and Advanced (₹4,000/mo) plans with coupon support.',
  alternates: {
    canonical: '/pricing',
  },
  openGraph: {
    title: 'VigilAMC Pricing | Basic, Pro & Advanced Plans (INR)',
    description:
      'Transparent monthly and yearly INR pricing for VigilAMC fire safety AMC teams. Compare Basic, Pro, and Advanced plans with monthly and yearly savings.',
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
