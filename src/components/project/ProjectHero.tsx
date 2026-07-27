'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import type { Project } from '@/content/projects';
import { projectLayoutId } from '@/lib/motion';

export function ProjectHero({ project }: { project: Project }) {
  return (
    <article className="relative">
      {/* Full-viewport hero that morphs from the grid tile via layoutId */}
      <motion.div
        layoutId={projectLayoutId(project.slug)}
        className="relative h-dvh w-full overflow-hidden"
        style={{ willChange: 'transform' }}
      >
        <Image
          src={project.heroSrc}
          alt={project.alt}
          fill
          sizes="100vw"
          priority
          // Placeholder SVG — see note in ProjectGrid; remove for raster assets.
          unoptimized
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/25" />

        {/* Back control — reverses the morph on click (soft navigation) */}
        <Link
          href="/"
          className="absolute left-5 top-24 inline-flex items-center gap-2 rounded-full bg-paper/90 px-4 py-2 text-sm font-medium text-ink backdrop-blur transition-transform duration-300 hover:-translate-x-0.5 sm:left-8"
        >
          <span aria-hidden>←</span> Vissza a gridhez
        </Link>

        {/* Hero caption */}
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-shell px-5 pb-10 sm:px-8">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/80">
            {project.index} · {project.category}
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white sm:text-6xl">
            {project.title}
          </h1>
        </div>
      </motion.div>

      {/* Detail body */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-shell px-5 py-16 sm:px-8"
      >
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          <p className="text-2xl font-medium leading-snug tracking-tight md:col-span-8">
            {project.summary}
          </p>
          <dl className="space-y-4 text-sm md:col-span-4">
            <div className="flex justify-between border-b border-line pb-3">
              <dt className="text-muted">Helyszín</dt>
              <dd>{project.location}</dd>
            </div>
            <div className="flex justify-between border-b border-line pb-3">
              <dt className="text-muted">Év</dt>
              <dd>{project.year}</dd>
            </div>
            <div className="flex justify-between border-b border-line pb-3">
              <dt className="text-muted">Médium</dt>
              <dd>{project.medium === 'photograph' ? 'Fotográfia' : '3D vizualizáció'}</dd>
            </div>
          </dl>
        </div>

        <Link
          href="/contact"
          className="mt-14 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper transition-transform duration-300 hover:-translate-y-0.5"
        >
          Hasonló projektet tervezel? Beszéljünk <span aria-hidden>↗</span>
        </Link>
      </motion.div>
    </article>
  );
}
