import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'Founder | VigilAMC',
  description:
    'Meet the founder behind VigilAMC and the mission to bring digital accountability to fire safety maintenance.',
  alternates: {
    canonical: '/founder',
  },
  openGraph: {
    title: 'Founder | VigilAMC',
    description:
      'Meet the founder behind VigilAMC and the mission to bring digital accountability to fire safety maintenance.',
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
