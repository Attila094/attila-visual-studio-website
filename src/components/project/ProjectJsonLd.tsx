import type { GalleryItem } from '@/content/galleryProjects';

/**
 * Classifies the work by its actual medium — a location photograph and a 3D
 * render are not the same schema type.
 */
export function ProjectJsonLd({ project }: { project: GalleryItem }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': project.medium === 'photograph' ? 'Photograph' : 'VisualArtwork',
    name: project.title,
    description: project.description,
    contentLocation: project.location,
    dateCreated: project.year,
    creator: { '@type': 'Organization', name: project.designer },
    ...(project.medium === 'render'
      ? { artMedium: '3D visualization', artform: 'Architectural rendering' }
      : {}),
    image: project.src,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
