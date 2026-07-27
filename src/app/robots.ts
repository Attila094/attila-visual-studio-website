import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Local-only scratch route; 404s in production but kept out of crawls too.
      disallow: ['/hero-lab'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
