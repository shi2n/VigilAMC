import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'About VigilAMC | Modernizing Fire Safety Compliance',
  description:
    'Learn how VigilAMC helps fire safety service providers replace manual registers with reliable digital inspection and AMC workflows.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About VigilAMC | Modernizing Fire Safety Compliance',
    description:
      'Learn how VigilAMC helps fire safety service providers replace manual registers with reliable digital inspection and AMC workflows.',
    url: `${SITE_CONFIG.SITE_URL}/about`,
    siteName: SITE_CONFIG.COMPANY_NAME,
    locale: 'en_IN',
    type: 'website',
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
