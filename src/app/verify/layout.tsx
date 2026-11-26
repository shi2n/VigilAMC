import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'Verify Fire Safety Inspection Certificate | VigilAMC',
  description:
    'Authenticate a VigilAMC fire safety inspection report or asset compliance certificate using its unique verification ID.',
  alternates: {
    canonical: '/verify',
  },
  openGraph: {
    title: 'Verify Fire Safety Inspection Certificate | VigilAMC',
    description:
      'Authenticate a VigilAMC fire safety inspection report or asset compliance certificate using its unique verification ID.',
    url: `${SITE_CONFIG.SITE_URL}/verify`,
    siteName: SITE_CONFIG.COMPANY_NAME,
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Verify Fire Safety Inspection Certificate | VigilAMC',
    description:
      'Authenticate a VigilAMC fire safety inspection report or asset compliance certificate using its unique verification ID.',
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
