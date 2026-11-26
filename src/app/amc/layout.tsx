import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'Fire Safety Annual Maintenance Contract (AMC) Management | VigilAMC',
  description:
    'Streamline recurring fire safety AMC schedules, statutory maintenance logs, and contract renewals for commercial and industrial facilities.',
  alternates: {
    canonical: '/amc',
  },
  openGraph: {
    title: 'Fire Safety Annual Maintenance Contract (AMC) Management | VigilAMC',
    description:
      'Streamline recurring fire safety AMC schedules, statutory maintenance logs, and contract renewals for commercial and industrial facilities.',
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
