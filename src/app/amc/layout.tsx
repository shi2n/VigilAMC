import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'AMC Contract Management | VigilAMC',
  description:
    'Comprehensive Annual Maintenance Contract workflows for fire-safety service contractors across India.',
  alternates: {
    canonical: '/amc',
  },
  openGraph: {
    title: 'AMC Contract Management | VigilAMC',
    description:
      'Comprehensive Annual Maintenance Contract workflows for fire-safety contractors.',
    url: `${SITE_CONFIG.SITE_URL}/amc`,
    siteName: SITE_CONFIG.COMPANY_NAME,
    locale: 'en_IN',
    type: 'website',
  },
};

export default function AmcLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
