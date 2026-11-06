import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'Contact Us | VigilAMC Technologies',
  description:
    'Get in touch with VigilAMC for agency onboarding, custom fire compliance workflows, or technical support.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact Us | VigilAMC Technologies',
    description:
      'Get in touch with VigilAMC for agency onboarding, workflows, or support.',
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
