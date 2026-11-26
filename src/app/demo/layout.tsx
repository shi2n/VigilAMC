import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'Book a Live Demo | VigilAMC Fire Safety Software',
  description:
    'Schedule a personalized walkthrough of VigilAMC to see how your agency can digitize field inspections and compliance reporting.',
  alternates: {
    canonical: '/demo',
  },
  openGraph: {
    title: 'Book a Live Demo | VigilAMC Fire Safety Software',
    description:
      'Schedule a personalized walkthrough of VigilAMC to see how your agency can digitize field inspections and compliance reporting.',
    url: `${SITE_CONFIG.SITE_URL}/demo`,
    siteName: SITE_CONFIG.COMPANY_NAME,
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Book a Live Demo | VigilAMC Fire Safety Software',
    description:
      'Schedule a personalized walkthrough of VigilAMC to see how your agency can digitize field inspections and compliance reporting.',
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
