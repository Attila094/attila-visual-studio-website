import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllGallerySlugs, getGalleryProjectBySlug } from '@/content/galleryProjects';
import { ProjectView } from '@/components/project/ProjectView';
import { ProjectJsonLd } from '@/components/project/ProjectJsonLd';

export function generateStaticParams() {
  return getAllGallerySlugs().map((slug) => ({ slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const project = getGalleryProjectBySlug(params.slug);
  if (!project) return {};

  return {
    title: `${project.title} — ${project.location}`,
    description: project.description,
    openGraph: {
      title: `${project.title} | Attila Visual Studio`,
      description: project.description,
      images: [{ url: project.src, width: 1600, height: 1600, alt: project.alt }],
    },
  };
}

export default function ProjectPage({ params }: { params: { slug: string } }) {
  const project = getGalleryProjectBySlug(params.slug);
  if (!project) notFound();

  return (
    <>
      <ProjectJsonLd project={project} />
      <ProjectView project={project} />
    </>
  );
}
