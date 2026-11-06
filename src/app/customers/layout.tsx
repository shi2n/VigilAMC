import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'Customer Stories & AMC Agencies | VigilAMC',
  description:
    'Discover how fire-safety maintenance companies across India trust VigilAMC to safeguard commercial towers, hospitals, and industrial plants.',
  alternates: {
    canonical: '/customers',
  },
  openGraph: {
    title: 'Customer Stories & AMC Agencies | VigilAMC',
    description:
      'Discover how fire-safety maintenance companies across India trust VigilAMC.',
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
