import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'Interactive Live Demo | VigilAMC — Fire Safety AMC Software',
  description:
    'Experience VigilAMC live in your browser: explore fire safety asset management, Form-B statutory compliance, and mobile technician workflows.',
  alternates: {
    canonical: '/demo',
  },
  openGraph: {
    title: 'Interactive Live Demo | VigilAMC — Fire Safety AMC Software',
    description:
      'Experience VigilAMC live in your browser: explore fire safety asset management, Form-B statutory compliance, and mobile technician workflows.',
    url: `${SITE_CONFIG.SITE_URL}/demo`,
    siteName: SITE_CONFIG.COMPANY_NAME,
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Interactive Live Demo | VigilAMC',
    description:
      'Experience VigilAMC live in your browser: explore fire safety asset management and compliance.',
    creator: '@vigilamc',
  },
};

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
