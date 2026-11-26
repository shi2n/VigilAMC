import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'Customers & Use Cases | VigilAMC Fire Safety Platform',
  description:
    'Discover how fire safety contractors and facility maintenance teams use VigilAMC to eliminate paperwork and retain AMC clients.',
  alternates: {
    canonical: '/customers',
  },
  openGraph: {
    title: 'Customers & Use Cases | VigilAMC Fire Safety Platform',
    description:
      'Discover how fire safety contractors and facility maintenance teams use VigilAMC to eliminate paperwork and retain AMC clients.',
    url: `${SITE_CONFIG.SITE_URL}/customers`,
    siteName: SITE_CONFIG.COMPANY_NAME,
    locale: 'en_IN',
    type: 'website',
  },
};

export default function CustomersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
