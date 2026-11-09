import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'Agency Onboarding & Setup | Schedule an Agency Demo | VigilAMC',
  description:
    'Schedule an Agency Demo or Request Workflow Setup. Speak directly with our product team to import your client asset rosters, configure mobile field checklists, and compile Form-B reports in minutes.',
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
