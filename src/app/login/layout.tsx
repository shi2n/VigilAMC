import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'Agency Login | VigilAMC — Fire Safety AMC Software',
  description:
    'Sign in to your VigilAMC agency dashboard to manage fire safety inspections, equipment registries, technician workflows, and Form-B compliance certificates.',
  alternates: {
    canonical: '/login',
  },
  openGraph: {
    title: 'Agency Login | VigilAMC',
    description:
      'Sign in to your VigilAMC agency dashboard to manage fire safety inspections and compliance.',
    url: `${SITE_CONFIG.SITE_URL}/login`,
    siteName: SITE_CONFIG.COMPANY_NAME,
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Agency Login | VigilAMC',
    description:
      'Sign in to your VigilAMC agency dashboard to manage fire safety inspections and compliance.',
    creator: '@vigilamc',
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
