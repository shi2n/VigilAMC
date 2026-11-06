import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'Public Asset Verification | VigilAMC',
  description:
    'Instant tamper-proof verification for fire extinguishers, hydrants, and life-safety equipment inspected by certified agencies on VigilAMC.',
  alternates: {
    canonical: '/verify',
  },
  openGraph: {
    title: 'Public Asset Verification | VigilAMC',
    description:
      'Instant tamper-proof verification for fire extinguishers, hydrants, and life-safety equipment.',
    url: `${SITE_CONFIG.SITE_URL}/verify`,
    siteName: SITE_CONFIG.COMPANY_NAME,
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Public Asset Verification | VigilAMC',
    description:
      'Instant tamper-proof verification for fire extinguishers, hydrants, and life-safety equipment.',
    creator: '@vigilamc',
  },
};

export default function VerifyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
