import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/siteConfig';

type Props = {
  params: { assetTag?: string; qrCode?: string };
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const tag = decodeURIComponent(resolvedParams?.assetTag || resolvedParams?.qrCode || '').trim();
  const title = tag ? `Verify Asset ${tag} | VigilAMC` : 'Verify Fire Safety Asset | VigilAMC';
  const description = tag
    ? `Official statutory service & inspection verification record for fire safety equipment ${tag}.`
    : 'Official statutory service & inspection verification record for fire safety equipment.';
  const canonicalPath = tag ? `/verify/${encodeURIComponent(tag)}` : '/verify';

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_CONFIG.SITE_URL}${canonicalPath}`,
      siteName: SITE_CONFIG.COMPANY_NAME,
      locale: 'en_IN',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
      creator: '@vigilamc',
    },
  };
}

export default function VerifyAssetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
