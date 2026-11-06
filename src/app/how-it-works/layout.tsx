import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'How It Works | VigilAMC — 3-Step Fire Safety AMC Workflow',
  description:
    'See how VigilAMC automates your fire safety operations: onboard premises, dispatch technicians with mobile GPS app, and generate Form-B compliance reports.',
  alternates: {
    canonical: '/how-it-works',
  },
  openGraph: {
    title: 'How It Works | VigilAMC',
    description:
      'See how VigilAMC automates your fire safety operations in 3 simple steps.',
    url: `${SITE_CONFIG.SITE_URL}/how-it-works`,
    siteName: SITE_CONFIG.COMPANY_NAME,
    locale: 'en_IN',
    type: 'website',
  },
};

export default function HowItWorksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
