import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'Contact VigilAMC | Sales & Support',
  description:
    'Get in touch with the VigilAMC team for product inquiries, onboarding assistance, or fire safety AMC partnerships.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact VigilAMC | Sales & Support',
    description:
      'Get in touch with the VigilAMC team for product inquiries, onboarding assistance, or fire safety AMC partnerships.',
    url: `${SITE_CONFIG.SITE_URL}/contact`,
    siteName: SITE_CONFIG.COMPANY_NAME,
    locale: 'en_IN',
    type: 'website',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
