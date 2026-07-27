import type { MetadataRoute } from 'next';
import { getAllGallerySlugs } from '@/content/galleryProjects';
import { SITE_URL } from '@/lib/site';

/**
 * Static pages plus one entry per project detail route. `/hero-lab` is a
 * local-only scratch page (404s in production) and is deliberately excluded.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes = [
    { path: '', priority: 1 },
    { path: '/services', priority: 0.8 },
    { path: '/about', priority: 0.6 },
    { path: '/contact', priority: 0.6 },
  ].map(({ path, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority,
  }));

  const projectRoutes = getAllGallerySlugs().map((slug) => ({
    url: `${SITE_URL}/projects/${slug}`,
    lastModified: now,
    changeFrequency: 'yearly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...projectRoutes];
}
