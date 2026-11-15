import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'Features — Fire Safety Compliance Software for Agencies | VigilAMC',
  description:
    'Fire safety compliance software for agencies: offline mobile inspections, GPS-stamped photos, Excel bulk import, white-label 5-page Form B reports, and 22 Indian languages.',
  alternates: {
    canonical: '/features',
  },
  openGraph: {
    title: 'Features — Fire Safety Compliance Software for Agencies | VigilAMC',
    description:
      'Everything else your agency runs on — grouped across Field Tools, Office Tools, Reports & Compliance, and Platform.',
    url: `${SITE_CONFIG.SITE_URL}/features`,
    siteName: SITE_CONFIG.COMPANY_NAME,
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: `${SITE_CONFIG.SITE_URL}/screenshots/dashboard-fire-1440x900.png`,
        width: 1440,
        height: 900,
        alt: 'VigilAMC agency compliance features and dashboard overview',
      },
    ],
  },
};

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
