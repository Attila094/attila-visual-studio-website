'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { getProjectGallery, type GalleryItem } from '@/content/galleryProjects';
import { projectLayoutId } from '@/lib/motion';
import { shouldBypassOptimizer } from '@/lib/image';
import { ProjectGallery } from './ProjectGallery';

/**
 * Project detail page — the destination of the grid → hero shared-element morph.
 *
 * The hero carries the SAME `layoutId` as the gallery tile the user clicked, so
 * Framer Motion animates that one element from tile to full-bleed hero across
 * the route change (no jump-cut). Everything below the hero is a separate
 * `motion.div` that fades + slides up *around* the locked image once it lands.
 *
 * Layout mirrors "project page layout.jpg": full-bleed hero with the title
 * overlaid bottom-left → a caption strip → a thumbnail row → a meta block
 * (helyszín / tervező / év) with description → a large feature block (big image
 * with prev/next, two secondary images, a second meta table) → a closing
 * paragraph.
 */
export function ProjectView({ project }: { project: GalleryItem }) {
  const gallery = getProjectGallery(project);
  // 12 images for the scrollable strip (the 4 originals + 8 more placeholders),
  // cycled from the available project images.
  const strip = Array.from({ length: 12 }, (_, i) => gallery[(i + 1) % gallery.length]);
  const [feat, setFeat] = useState(0);
  const featSrc = gallery[feat % gallery.length];
  const step = (d: number) => setFeat((f) => (f + d + gallery.length) % gallery.length);

  return (
    <article className="bg-paper text-ink">
      {/* 1 — Full-bleed hero. This is the shared element. */}
      <motion.div
        layoutId={projectLayoutId(project.slug)}
        className="relative h-[78vh] w-full overflow-hidden"
        style={{ willChange: 'transform' }}
      >
        <Image
          src={project.src}
          alt={project.alt}
          fill
          sizes="100vw"
          priority
          unoptimized={shouldBypassOptimizer(project.src)}
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" />

        <Link
          href="/"
          className="absolute left-3 top-3 z-[75] inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-ink backdrop-blur transition-transform duration-300 hover:-translate-x-0.5 sm:left-6 sm:top-5"
        >
          <span aria-hidden>←</span> Vissza
        </Link>

        <div className="absolute inset-x-0 bottom-0 px-5 pb-8 sm:px-8">
          <div className="mx-auto max-w-shell">
            <h1 className="text-2xl font-semibold uppercase tracking-[0.14em] text-white sm:text-4xl lg:text-5xl">
              {project.title}
              <span className="ml-3 font-light text-white/85">{project.location}</span>
            </h1>
          </div>
        </div>
      </motion.div>

      {/* Everything below fades + slides up around the just-locked hero. */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
        className="mx-auto max-w-shell px-5 sm:px-8"
      >
        {/* 2 — Caption strip: three "1 — Leírás" column headers. */}
        <div className="grid grid-cols-3 gap-6 border-b border-line py-3">
          {[0, 1, 2].map((i) => (
            <Caption key={i} />
          ))}
        </div>

        {/* 3 — Scrollable image gallery: vertical wheel → horizontal scroll,
            plus pointer drag-to-scroll. */}
        <div className="border-b border-line py-5">
          <ProjectGallery images={strip} alt={project.alt} tileClassName="aspect-[4/3] h-44 sm:h-56" />
        </div>

        {/* 4 — Label (left) · meta table + description (right). */}
        <div className="grid grid-cols-1 gap-8 py-10 md:grid-cols-2">
          <div>
            <Caption />
          </div>
          <div>
            <MetaTable project={project} />
            <p className="mt-6 max-w-md leading-relaxed text-muted">{project.description}</p>
          </div>
        </div>

        {/* 5 — Feature block: big image w/ prev·next · two secondary images · meta. */}
        <div className="grid grid-cols-1 gap-8 py-6 md:grid-cols-2">
          <div>
            <div className="relative aspect-square w-full overflow-hidden rounded-sm bg-line">
              <Image
                key={featSrc}
                src={featSrc}
                alt={`${project.title} — kiemelt nézet`}
                fill
                sizes="(min-width: 768px) 46vw, 100vw"
                unoptimized={shouldBypassOptimizer(featSrc)}
                className="object-cover"
              />
            </div>
            <div className="mt-4 flex items-center justify-center gap-10">
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Előző kép"
                className="text-2xl text-ink transition-transform hover:-translate-x-0.5"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Következő kép"
                className="text-2xl text-ink transition-transform hover:translate-x-0.5"
              >
                →
              </button>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-8">
            <div className="grid grid-cols-2 gap-3">
              <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-line">
                <Image
                  src={gallery[(feat + 1) % gallery.length]}
                  alt={`${project.title} — részlet 1`}
                  fill
                  sizes="23vw"
                  unoptimized={shouldBypassOptimizer(gallery[(feat + 1) % gallery.length])}
                  className="object-cover"
                />
              </div>
              <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-line">
                <Image
                  src={gallery[(feat + 2) % gallery.length]}
                  alt={`${project.title} — részlet 2`}
                  fill
                  sizes="23vw"
                  unoptimized={shouldBypassOptimizer(gallery[(feat + 2) % gallery.length])}
                  className="object-cover"
                />
              </div>
            </div>
            <div className="md:w-2/3 md:self-end">
              <MetaTable project={project} />
            </div>
          </div>
        </div>

        {/* 6 — Closing paragraph. */}
        <div className="border-t border-line py-10">
          <p className="max-w-2xl leading-relaxed text-muted">{project.description}</p>
          <Link
            href="/contact"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper transition-transform duration-300 hover:-translate-y-0.5"
          >
            Hasonló projektet tervezel? Beszéljünk <span aria-hidden>↗</span>
          </Link>
        </div>
      </motion.div>
    </article>
  );
}

function Caption() {
  return (
    <p className="flex items-center gap-3 text-sm">
      <span className="tabular-nums text-muted">1</span>
      <span className="uppercase tracking-wide">Leírás</span>
    </p>
  );
}

function MetaTable({ project }: { project: GalleryItem }) {
  const rows: [string, string, boolean][] = [
    ['helyszín', project.location, true],
    ['tervező', project.designer, true],
    ['év', project.year, false],
  ];
  return (
    <dl className="text-sm">
      {rows.map(([k, v, upper]) => (
        <div key={k} className="flex items-center justify-between border-b border-line py-2">
          <dt className="text-muted">{k}</dt>
          <dd className={`tabular-nums ${upper ? 'uppercase tracking-wide' : ''}`}>{v}</dd>
        </div>
      ))}
    </dl>
  );
}
