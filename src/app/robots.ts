import { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/lib/siteConfig';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/dashboard/'],
      },
    ],
    sitemap: `${SITE_CONFIG.SITE_URL}/sitemap.xml`,
  };
}
