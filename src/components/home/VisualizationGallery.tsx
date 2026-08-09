'use client';

import { useEffect, useLayoutEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { vizAnimations, vizPanoramas, vizStills } from '@/content/visualization';
import { morphSpring } from '@/lib/motion';
import { MASONRY_GAP, masonryRowSpan } from '@/lib/masonry';

/** WebGL: it can't render on the server, and three.js has no business in the
 *  page bundle until a panorama is actually opened. */
const PanoramaSphere = dynamic(
  () => import('@/components/PanoramaSphere').then((m) => m.PanoramaSphere),
  { ssr: false },
);

type Filter = 'still' | 'panoramic' | 'animation';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'still', label: 'Still' },
  { id: 'panoramic', label: 'Panoramic' },
  { id: 'animation', label: 'Animation' },
];


/**
 * "01 Építészeti vizualizáció" — three sets behind one filter bar.
 *
 * Still and Panoramic share an interaction: a two-column grid where one tile at
 * a time opens across the full width, and a click anywhere outside it closes it
 * again. For a panorama that open state is also what mounts the drag-to-look
 * sphere, so only ever one WebGL context is alive no matter how many renders
 * are in the set.
 */
export function VisualizationGallery() {
  const [filter, setFilter] = useState<Filter>('still');
  const [open, setOpen] = useState<string | null>(null);

  // Switching sets closes whatever was open — its tile is gone.
  useEffect(() => setOpen(null), [filter]);

  // The row spans are computed from the column's real width, which follows the
  // container. Measured before paint, so the tiles never flash at the wrong
  // height on the way in.
  // A callback ref, not `useRef`: the grid only exists under the Still filter,
  // so the measurement has to be tied to the node arriving rather than to this
  // component mounting.
  const [gridEl, setGridEl] = useState<HTMLDivElement | null>(null);
  const [gridWidth, setGridWidth] = useState(0);
  useLayoutEffect(() => {
    if (!gridEl) return;
    const measure = () => setGridWidth(gridEl.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(gridEl);
    return () => ro.disconnect();
  }, [gridEl]);
  const colWidth = gridWidth ? (gridWidth - MASONRY_GAP) / 2 : 0;

  // A click anywhere outside the open tile closes it. Clicking another tile
  // fires this first and its own onClick second, so the grid simply switches.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!(e.target as HTMLElement).closest?.('[data-viz-open]')) setOpen(null);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  return (
    <div className="rounded-3xl bg-[#111111] p-3 ring-1 ring-white/10 sm:p-5">
      {/* Filter bar — the three sets, centred. */}
      <div className="relative mb-4 flex flex-wrap items-center justify-center gap-2">
        <div className="flex overflow-hidden rounded-full bg-white/10">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`px-6 py-2 text-xs font-semibold uppercase tracking-widest transition-colors ${
                filter === f.id ? 'bg-white text-black' : 'text-white/60 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filter === 'still' && (
        <div
          ref={setGridEl}
          // 1px rows and no row gap: the span each tile claims is its own
          // height, so nothing is rounded up into dead space. `items-start`
          // keeps a tile from being stretched to its row, which would override
          // the aspect ratio.
          style={{ gridAutoRows: '1px', columnGap: MASONRY_GAP, rowGap: 0 }}
          className="grid grid-cols-2 items-start"
        >
          {vizStills.map((still) => {
            const isOpen = open === still.src;
            return (
              <motion.button
                key={still.src}
                type="button"
                layout
                {...(isOpen ? { 'data-viz-open': true } : {})}
                onClick={() => setOpen(isOpen ? null : still.src)}
                transition={morphSpring}
                aria-expanded={isOpen}
                // Its own proportions at either size, so `object-cover` never
                // has anything to crop — opening only widens the render.
                style={{
                  aspectRatio: `${still.width} / ${still.height}`,
                  gridRowEnd: `span ${masonryRowSpan(
                    still.width,
                    still.height,
                    isOpen ? gridWidth : colWidth,
                  )}`,
                  marginBottom: MASONRY_GAP,
                }}
                className={`relative block w-full overflow-hidden bg-white/[0.03] ${
                  isOpen ? 'col-span-2' : ''
                }`}
              >
                <Image
                  src={still.src}
                  alt="Építészeti látványterv"
                  fill
                  sizes={isOpen ? '(min-width: 768px) 60vw, 92vw' : '(min-width: 768px) 30vw, 46vw'}
                  className="object-cover"
                />
              </motion.button>
            );
          })}
        </div>
      )}

      {filter === 'panoramic' && (
        <div className="grid grid-cols-2 gap-3">
          {vizPanoramas.map((pano) => {
            const isOpen = open === pano.src;
            return (
              <motion.div
                key={pano.src}
                layout
                {...(isOpen ? { 'data-viz-open': true } : {})}
                transition={morphSpring}
                className={isOpen ? 'col-span-2' : ''}
              >
                {isOpen ? (
                  // The sphere replaces the flat tile rather than sitting on
                  // top of it: it mounts here and nowhere else, so the context
                  // dies with the tile. Closing is the click outside — the
                  // viewer owns every drag inside its own frame.
                  <PanoramaSphere src={pano.src} poster={pano.poster} className="rounded-lg" />
                ) : (
                  <button
                    type="button"
                    onClick={() => setOpen(pano.src)}
                    aria-label="360°-os panoráma megnyitása"
                    className="relative block aspect-[2/1] w-full overflow-hidden rounded-lg bg-white/[0.03]"
                  >
                    <Image
                      src={pano.poster}
                      alt="360°-os panoráma látványterv"
                      fill
                      sizes="(min-width: 768px) 30vw, 46vw"
                      className="object-cover"
                    />
                    <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-[0.6rem] uppercase tracking-[0.3em] text-white/70">
                      360°
                    </span>
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {filter === 'animation' && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {vizAnimations.map((clip) => (
            <video
              key={clip.src}
              src={clip.src}
              poster={clip.poster}
              controls
              playsInline
              // Only the poster travels until the visitor presses play.
              preload="none"
              aria-label="Építészeti animáció"
              className="block h-auto w-full rounded-lg bg-white/[0.03]"
            />
          ))}
        </div>
      )}
    </div>
  );
}
