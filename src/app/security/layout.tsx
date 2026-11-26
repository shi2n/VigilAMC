import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'Data Security & Compliance | VigilAMC',
  description:
    'Learn how VigilAMC protects client facility records, inspection logs, and compliance data with enterprise-grade security.',
  alternates: {
    canonical: '/security',
  },
  openGraph: {
    title: 'Data Security & Compliance | VigilAMC',
    description:
      'Learn how VigilAMC protects client facility records, inspection logs, and compliance data with enterprise-grade security.',
    url: `${SITE_CONFIG.SITE_URL}/security`,
    siteName: SITE_CONFIG.COMPANY_NAME,
    locale: 'en_IN',
    type: 'website',
  },
};

export default function SecurityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
