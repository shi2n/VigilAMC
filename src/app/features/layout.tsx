import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'Features: GPS & Asset Tag Tracking, Inspections & Alerts | VigilAMC',
  description:
    'Automate fire safety inspections with Asset Tag ID tracking, floor/zone checklists, GPS-verified technician check-ins, digital signatures, and automated renewal alerts.',
  alternates: {
    canonical: '/features',
  },
  openGraph: {
    title: 'Features: GPS & Asset Tag Tracking, Inspections & Alerts | VigilAMC',
    description:
      'Automate fire safety inspections with Asset Tag ID tracking, floor/zone checklists, GPS-verified technician check-ins, digital signatures, and automated renewal alerts.',
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
