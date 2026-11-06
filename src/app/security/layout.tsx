import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'Security & Data Architecture | VigilAMC',
  description:
    'Overview of data protection, DPDP Act 2023 compliance, cryptographic proof, and infrastructure security at VigilAMC.',
  alternates: {
    canonical: '/security',
  },
  openGraph: {
    title: 'Security & Data Architecture | VigilAMC',
    description:
      'Overview of data protection, DPDP Act 2023 compliance, and infrastructure security at VigilAMC.',
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
