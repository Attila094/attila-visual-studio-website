import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getAllArchSlugs,
  getArchProjectBySlug,
} from '@/content/architectureProjects';
import { ArchProjectView } from '@/components/project/ArchProjectView';

/**
 * One page per project in the "01 Építészet & belsőépítészet" menu.
 *
 * A static segment deeper than `/projects/[slug]`, so the two dynamic routes
 * cannot shadow each other: a one-segment path still reaches the bento gallery's
 * pages, and only `/projects/architecture/<slug>` reaches these.
 */
export function generateStaticParams() {
  return getAllArchSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const project = getArchProjectBySlug(params.slug);
  if (!project) return {};

  // Only what is actually written down. A project with no description yet gets
  // its name and place rather than a sentence nobody wrote.
  const description =
    project.description ??
    `${project.title} — építészeti és belsőépítészeti munka, ${project.location}. Attila Visual Studio.`;

  // "Hévíz — Hévíz" helps nobody: the place is only worth adding where it
  // is not already the name.
  const title = project.title.includes(project.location)
    ? project.title
    : `${project.title} — ${project.location}`;

  return {
    title,
    description,
    openGraph: {
      title: `${project.title} | Attila Visual Studio`,
      description,
      // Falls through to the site-wide logo card where a project has no cover.
      ...(project.cover
        ? { images: [{ url: project.cover, alt: project.alt }] }
        : {}),
    },
  };
}

export default function ArchitectureProjectPage({ params }: { params: { slug: string } }) {
  const project = getArchProjectBySlug(params.slug);
  if (!project) notFound();

  return <ArchProjectView project={project} />;
}
