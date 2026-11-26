import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'Sample Fire Safety Inspection & Compliance Report | VigilAMC',
  description:
    'Preview an audit-ready PDF fire safety inspection report with timestamped asset logs, technician verification, and compliance status.',
  alternates: {
    canonical: '/sample-report',
  },
  openGraph: {
    title: 'Sample Fire Safety Inspection & Compliance Report | VigilAMC',
    description:
      'Preview an audit-ready PDF fire safety inspection report with timestamped asset logs, technician verification, and compliance status.',
    url: `${SITE_CONFIG.SITE_URL}/sample-report`,
    siteName: SITE_CONFIG.COMPANY_NAME,
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sample Fire Safety Inspection & Compliance Report | VigilAMC',
    description:
      'Preview an audit-ready PDF fire safety inspection report with timestamped asset logs, technician verification, and compliance status.',
    creator: '@vigilamc',
  },
};

export default function SampleReportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
