import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'Client Portal Sign In | VigilAMC',
  description:
    'Access your premises fire safety compliance portal, view inspection certificates, and download Form-B records.',
  alternates: {
    canonical: '/portal/login',
  },
  openGraph: {
    title: 'Client Portal Sign In | VigilAMC',
    description:
      'Access your premises fire safety compliance portal and download Form-B records.',
    url: `${SITE_CONFIG.SITE_URL}/portal/login`,
    siteName: SITE_CONFIG.COMPANY_NAME,
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Client Portal Sign In | VigilAMC',
    description:
      'Access your premises fire safety compliance portal and download Form-B records.',
    creator: '@vigilamc',
  },
};

export default function PortalLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
