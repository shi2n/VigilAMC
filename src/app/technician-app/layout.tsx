import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'VigilAMC Technician App | Offline Fire Safety Inspection App for Field Teams',
  description:
    'India’s offline-first fire safety AMC field app for technicians. Record GPS-stamped camera photo proof, floor checklists, voice remarks, and instant Form B sync.',
  alternates: {
    canonical: '/technician-app',
  },
  openGraph: {
    title: 'VigilAMC Technician App | Offline Fire Safety Inspection App',
    description:
      'Works offline in basements and pump rooms with GPS-stamped photo proof, floor checklists, voice remarks, and real-time sync to the agency dashboard.',
    url: `${SITE_CONFIG.SITE_URL}/technician-app`,
    siteName: SITE_CONFIG.COMPANY_NAME,
    locale: 'en_IN',
    type: 'website',
  },
};

export default function TechnicianAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
