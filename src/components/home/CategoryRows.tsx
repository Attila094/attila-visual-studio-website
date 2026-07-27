'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { services } from '@/content/services';
import { getProjectsByService, type Project } from '@/content/projects';
import { useHasHoverSupport } from '@/lib/useHasHoverSupport';
import { projectLayoutId } from '@/lib/motion';

export function CategoryRows() {
  return (
    <section className="mx-auto max-w-shell px-5 sm:px-8">
      {services.map((service) => (
        <CategoryRow
          key={service.id}
          title={service.title}
          projects={getProjectsByService(service.id as Project['serviceId'])}
        />
      ))}
      {/* Closing divider so the last row reads as bounded, like the reference */}
      <div className="border-t border-line" />
    </section>
  );
}

function CategoryRow({ title, projects }: { title: string; projects: Project[] }) {
  const hasHover = useHasHoverSupport();
  const viewportRef = useRef<HTMLDivElement>(null);
  // Suppresses the tile's navigation when the pointer-up ends a drag.
  const didDrag = useRef(false);

  return (
    <div className="border-t border-line py-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-6">
        {/* Column 1 — fixed category text, never slides */}
        <div className="md:col-span-1">
          <h2 className="text-sm font-semibold capitalize leading-snug tracking-tight">
            {title}
          </h2>
          <ol className="mt-3 space-y-1">
            {projects.map((p, i) => (
              <li key={p.slug} className="flex gap-2 text-[11px] leading-tight text-muted">
                <span className="tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                <span>{p.title}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Columns 2–6 — draggable carousel of tiles */}
        <div
          ref={viewportRef}
          className="overflow-hidden md:col-span-5 [@media(hover:hover)and(pointer:fine)]:cursor-grab [@media(hover:hover)and(pointer:fine)]:active:cursor-grabbing"
        >
          <motion.div
            className="flex w-max gap-4 px-1 py-8"
            drag="x"
            dragConstraints={viewportRef}
            dragElastic={0.06}
            onDragStart={() => {
              didDrag.current = true;
            }}
            onDragEnd={() => {
              // Reset after the click event that follows pointer-up has fired.
              setTimeout(() => {
                didDrag.current = false;
              }, 0);
            }}
          >
            {projects.map((project, i) => (
              <Link
                key={project.slug}
                href={`/projects/${project.slug}`}
                aria-label={`${project.title} — ${project.category}`}
                draggable={false}
                onClick={(e) => {
                  if (didDrag.current) e.preventDefault();
                }}
                className="shrink-0"
              >
                <motion.div
                  className="w-40 sm:w-48 lg:w-56"
                  whileHover={hasHover ? { scale: 1.2 } : undefined}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  style={{ willChange: 'transform' }}
                >
                  {/* Label row: number left, location right (per reference) */}
                  <div className="mb-1.5 flex items-center justify-between text-[10px] uppercase tracking-wide text-muted">
                    <span className="tabular-nums">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="truncate pl-2">{project.location}</span>
                  </div>

                  <motion.div
                    layoutId={projectLayoutId(project.slug)}
                    className="relative aspect-square w-full overflow-hidden rounded-xl bg-line"
                  >
                    <Image
                      src={project.thumbSrc}
                      alt={project.alt}
                      fill
                      sizes="(min-width: 1024px) 15vw, (min-width: 640px) 25vw, 40vw"
                      priority={i < 4}
                      unoptimized
                      draggable={false}
                      className="object-cover"
                    />
                  </motion.div>
                </motion.div>
              </Link>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
