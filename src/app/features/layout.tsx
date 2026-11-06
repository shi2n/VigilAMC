import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'Features & Capabilities | VigilAMC — Fire Safety AMC Software',
  description:
    'Explore VigilAMC platform features: asset tracking, Form-B statutory compliance, technician offline mobile app, and client portal.',
  alternates: {
    canonical: '/features',
  },
  openGraph: {
    title: 'Features & Capabilities | VigilAMC',
    description:
      'Explore VigilAMC platform features: asset tracking, Form-B statutory compliance, technician offline mobile app, and client portal.',
    url: `${SITE_CONFIG.SITE_URL}/features`,
    siteName: SITE_CONFIG.COMPANY_NAME,
    locale: 'en_IN',
    type: 'website',
  },
};

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
