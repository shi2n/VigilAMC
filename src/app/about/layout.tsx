import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'About Us | VigilAMC Technologies',
  description:
    'VigilAMC is dedicated to upgrading life-safety compliance in India with purpose-built AMC software for certified fire agencies.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About Us | VigilAMC Technologies',
    description:
      'VigilAMC is dedicated to upgrading life-safety compliance in India.',
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
