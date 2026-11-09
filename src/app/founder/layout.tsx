import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: "Founder's Desk & Mission | VigilAMC",
  description:
    'A personal note from Shaizan, Founder of VigilAMC. Why we are building dedicated compliance and operations software for fire protection AMC contractors across India.',
  alternates: {
    canonical: '/founder',
  },
  openGraph: {
    title: "Founder's Desk & Mission | VigilAMC",
    description:
      'Why we built VigilAMC for India fire safety contractors — eliminating missed inspection deadlines and paper logbooks.',
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
