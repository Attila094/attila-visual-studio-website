'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import type { Project } from '@/content/projects';
import { useHasHoverSupport } from '@/lib/useHasHoverSupport';
import { hoverEase, projectLayoutId } from '@/lib/motion';

export function ProjectGrid({ projects }: { projects: Project[] }) {
  const hasHover = useHasHoverSupport();
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {projects.map((project, i) => {
        const isHovered = hasHover && hoveredSlug === project.slug;
        const isSibling = hasHover && hoveredSlug !== null && !isHovered;

        return (
          <Link
            key={project.slug}
            href={`/projects/${project.slug}`}
            aria-label={`${project.title} — ${project.category}`}
            className="group relative block aspect-square overflow-hidden rounded-2xl bg-line [@media(hover:hover)and(pointer:fine)]:cursor-pointer"
            // Hover state is only tracked on real hover devices — on touch,
            // a tap goes straight to the morph navigation.
            onMouseEnter={hasHover ? () => setHoveredSlug(project.slug) : undefined}
            onMouseLeave={hasHover ? () => setHoveredSlug(null) : undefined}
          >
            <motion.div
              layoutId={projectLayoutId(project.slug)}
              className="relative h-full w-full"
              // GPU-only properties (transform + opacity) — never width/height.
              animate={{
                scale: isHovered ? 1.06 : isSibling ? 0.94 : 1,
                opacity: isSibling ? 0.55 : 1,
              }}
              transition={hoverEase}
              style={{ willChange: 'transform, opacity' }}
            >
              <Image
                src={project.thumbSrc}
                alt={project.alt}
                fill
                sizes="(min-width: 1024px) 24vw, (min-width: 768px) 31vw, 47vw"
                priority={i < 4}
                // Placeholders are SVG — served directly (the optimizer can't
                // rasterize SVG without sharp). Drop `unoptimized` once real
                // .jpg/.webp assets replace them to get full optimization.
                unoptimized
                className="object-cover"
              />
            </motion.div>

            {/* Caption overlay — fades in on hover (desktop) */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/55 to-transparent p-3 opacity-0 transition-opacity duration-300 [@media(hover:hover)and(pointer:fine)]:group-hover:opacity-100">
              <span className="text-[11px] font-medium leading-tight text-white">
                {project.title}
              </span>
              <span className="text-[11px] leading-tight text-white/70">
                {project.index}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
