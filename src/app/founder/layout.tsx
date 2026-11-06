import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'Founder Portal | VigilAMC',
  description:
    'VigilAMC founder management workspace and operational telemetry.',
  alternates: {
    canonical: '/founder',
  },
  openGraph: {
    title: 'Founder Portal | VigilAMC',
    description: 'VigilAMC founder management workspace.',
    url: `${SITE_CONFIG.SITE_URL}/founder`,
    siteName: SITE_CONFIG.COMPANY_NAME,
    locale: 'en_IN',
    type: 'website',
  },
};

export default function FounderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
