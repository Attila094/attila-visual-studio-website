'use client';

import { useRef, useState } from 'react';
import { Bebas_Neue } from 'next/font/google';
import { motion, useReducedMotion, useTransform } from 'framer-motion';
import { visualizationProjects } from '@/content/visualizationProjects';
import { usePinnedScrollProgress, wrap } from './usePinnedScrollProgress';
import { useHasHoverSupport } from '@/lib/useHasHoverSupport';

const bebas = Bebas_Neue({ subsets: ['latin'], weight: '400' });

/** Size of the incoming thumbnail, as a fraction of the full image stage. */
const THUMB_SCALE = 0.17;
/** Gap between the stage's bottom edge and the thumbnail, as a fraction of H. */
const THUMB_GAP = 0.025;

/**
 * Resting offsets for the incoming thumbnail, in % of the stage box.
 *  x → right edge of the thumbnail meets the right edge of the stage.
 *  y → thumbnail sits fully BELOW the stage: half the box (0.5) clears the
 *      bottom edge, + the gap, + half the thumbnail's own scaled height.
 */
const THUMB_X = ((1 - THUMB_SCALE) / 2) * 100;
const THUMB_Y = (0.5 + THUMB_GAP + THUMB_SCALE / 2) * 100;

type Filter = 'all' | 'still' | 'panoramic' | 'animation';

const FILTERS: { id: Exclude<Filter, 'all'>; label: string }[] = [
  { id: 'still', label: 'Still' },
  { id: 'panoramic', label: 'Panoramic' },
  { id: 'animation', label: 'Animation' },
];

/**
 * "02 Vizualizáció" — pinned-scroll infinite gallery matching
 * "visualization layout menu.jpg": filter bar on top, project text on the left,
 * the featured render on the right, and the next project waiting as a thumbnail
 * in the container's bottom-right corner, directly under the image.
 *
 * Scrolling with the cursor inside the container drives the handoff instead of
 * the page: each scroll plays one automatic transition where the current image
 * slides up behind the stage's top edge while the thumbnail scales up and
 * travels into its place, and the captions cross-fade.
 */
export function VisualizationGallery() {
  const [filter, setFilter] = useState<Filter>('all');
  const hasHover = useHasHoverSupport();
  const reduce = useReducedMotion() ?? false;

  const projects = visualizationProjects;
  const count = projects.length;

  // Only the Still set is a photographic gallery; the others are placeholders.
  const showsGallery = filter === 'all' || filter === 'still';

  const { containerRef, t, index, step } = usePinnedScrollProgress(
    count,
    hasHover && showsGallery,
    reduce,
  );

  const curIdx = wrap(index, count);
  const nextIdx = wrap(index + 1, count);
  const current = projects[curIdx];
  const next = projects[nextIdx];

  // --- Derived animation values ------------------------------------------
  // Outgoing: slides up and is clipped by the stage's top edge.
  const outY = useTransform(t, [0, 1], ['0%', '-100%']);

  // Incoming: travels from the thumbnail slot below the stage into the stage,
  // scaling up as it goes.
  const inScale = useTransform(t, [0, 1], [THUMB_SCALE, 1]);
  const inX = useTransform(t, [0, 1], [`${THUMB_X}%`, '0%']);
  const inY = useTransform(t, [0, 1], [`${THUMB_Y}%`, '0%']);
  const inRadius = useTransform(t, [0, 1], ['3px', '0px']);

  // Captions: the current name slides up and out of the top of its (clipped)
  // box, then the new one rises into place from below.
  const curTextY = useTransform(t, [0, 0.5], ['0%', '-115%']);
  const curTextOpacity = useTransform(t, [0, 0.38, 0.5], [1, 1, 0]);
  const nextTextY = useTransform(t, [0.5, 1], ['115%', '0%']);
  const nextTextOpacity = useTransform(t, [0.5, 0.62, 1], [0, 1, 1]);

  // --- Touch fallback: a vertical swipe advances one image ----------------
  const swipe = useRef({ y: 0, active: false });
  const touchHandlers =
    hasHover || !showsGallery
      ? {}
      : {
          onPointerDown: (e: React.PointerEvent) => {
            swipe.current = { y: e.clientY, active: true };
          },
          onPointerUp: (e: React.PointerEvent) => {
            if (!swipe.current.active) return;
            swipe.current.active = false;
            const dy = swipe.current.y - e.clientY;
            if (Math.abs(dy) > 40) step(dy > 0 ? 1 : -1);
          },
          onPointerCancel: () => {
            swipe.current.active = false;
          },
        };

  return (
    <div className="rounded-3xl bg-[#111111] p-3 ring-1 ring-white/10 sm:p-5">
      {/* Filter bar — ALL stays left, the category group is centred. */}
      <div className="relative mb-4 flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`rounded-full px-6 py-2 text-xs font-semibold uppercase tracking-widest transition-colors sm:absolute sm:left-0 ${
            filter === 'all' ? 'bg-white text-black' : 'bg-white/10 text-white/60 hover:text-white'
          }`}
        >
          All
        </button>
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

      {showsGallery ? (
        <div
          ref={containerRef}
          {...touchHandlers}
          className="grid grid-cols-1 items-center gap-4 md:grid-cols-[minmax(150px,22%)_1fr]"
        >
          {/* Left — caption. The box is clipped, so the outgoing name slides up
              and out of the top while the incoming one rises in from below. */}
          <div className="relative min-h-[92px] overflow-hidden md:min-h-[120px]">
            <motion.div style={{ opacity: curTextOpacity, y: curTextY }}>
              <Caption {...current} />
            </motion.div>
            <motion.div
              className="absolute inset-0"
              style={{ opacity: nextTextOpacity, y: nextTextY }}
              aria-hidden
            >
              <Caption {...next} />
            </motion.div>
          </div>

          {/* Right — image column. Bottom padding reserves the strip the
              thumbnail parks in; the column itself is NOT clipped, so the
              thumbnail can sit outside (below) the stage.

              Every project is rendered ONCE in each layer and simply toggled,
              rather than swapping `src` on two shared elements — swapping meant
              the browser had to decode a new image mid-handoff, which is what
              caused the flicker. Nothing reloads now. */}
          <div className="relative w-full pb-[12%]" aria-hidden>
            {/* Stage — overflow-hidden gives the outgoing image a top boundary
                to disappear behind. */}
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/40">
              {projects.map((p, i) => (
                <motion.div
                  key={`stage-${p.name}`}
                  className="absolute inset-0"
                  style={
                    i === curIdx
                      ? { y: outY, opacity: 1, willChange: 'transform' }
                      : { opacity: 0 }
                  }
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.src} alt="" draggable={false} className="h-full w-full object-cover" />
                </motion.div>
              ))}
            </div>

            {/* Incoming — siblings of the stage (so they aren't clipped),
                occupying the same box, parked below-right until they grow in. */}
            {projects.map((p, i) => (
              <motion.div
                key={`incoming-${p.name}`}
                className="pointer-events-none absolute inset-x-0 top-0 aspect-[16/10] overflow-hidden"
                style={
                  i === nextIdx
                    ? {
                        scale: inScale,
                        x: inX,
                        y: inY,
                        borderRadius: inRadius,
                        opacity: 1,
                        willChange: 'transform',
                      }
                    : { opacity: 0 }
                }
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.src} alt="" draggable={false} className="h-full w-full object-cover" />
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <ImagePlaceholder label={filter === 'panoramic' ? 'Panoramic' : 'Animation'} />
      )}
    </div>
  );
}

function Caption({
  name,
  studio,
  location,
}: {
  name: string;
  studio: string;
  location: string;
}) {
  return (
    <div>
      <h3
        className={`${bebas.className} text-2xl uppercase tracking-[0.12em] text-white sm:text-3xl`}
      >
        {name}
      </h3>
      <p className="mt-1 text-[11px] lowercase tracking-wide text-white/55">{studio}</p>
      <p className="text-[11px] uppercase tracking-[0.14em] text-white/80">{location}</p>
    </div>
  );
}

/** Shown for the Panoramic / Animation filters until their media exists. */
function ImagePlaceholder({ label }: { label: string }) {
  return (
    <div className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-3 bg-white/[0.03] ring-1 ring-white/10">
      <span className="grid h-12 w-12 place-items-center rounded-full text-white/50 ring-1 ring-white/20">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 16H5l3.5-4.5 2.5 3 3.5-4.5L19 19z" />
        </svg>
      </span>
      <span className="text-[0.6rem] uppercase tracking-[0.3em] text-white/45">
        {label} — hamarosan
      </span>
    </div>
  );
}
