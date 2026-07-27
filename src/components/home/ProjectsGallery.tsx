'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { galleryProjects, type Category, type GalleryItem } from '@/content/galleryProjects';
import { projectLayoutId } from '@/lib/motion';
import { shouldBypassOptimizer } from '@/lib/image';
import { VisualizationGallery } from './VisualizationGallery';

type Filter = 'all' | Category;

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'exterior', label: 'Exterior' },
  { id: 'interior', label: 'Interior' },
  { id: 'product', label: 'Product' },
];

function Frame({ item, sizes }: { item: GalleryItem; sizes: string }) {
  return (
    <Link
      href={`/projects/${item.slug}`}
      aria-label={item.title}
      className="group relative block h-full w-full overflow-hidden rounded-none bg-[#b4b1a9]"
    >
      {/* The morph handle: the SAME layoutId lives on the detail-page hero, so
          Framer Motion animates this element across the route change instead of
          jump-cutting. Only transform is animated (GPU-only). */}
      <motion.div
        layoutId={projectLayoutId(item.slug)}
        className="absolute inset-0"
        style={{ willChange: 'transform' }}
      >
        <Image
          src={item.src}
          alt={item.alt}
          fill
          sizes={sizes}
          unoptimized={shouldBypassOptimizer(item.src)}
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />
      </motion.div>
      {/* Caption is intentionally OUTSIDE the shared element so it doesn't morph
          — it belongs to the grid, not the hero. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-white">{item.label}</p>
        {item.sublabel && (
          <p className="text-[10px] uppercase tracking-wide text-white/70">{item.sublabel}</p>
        )}
      </div>
    </Link>
  );
}

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * A single portrait tile for the editorial architect layout: a thin-ruled
 * caption (index · location) sits ABOVE the image. The morph handle (Link +
 * layoutId) is identical to <Frame> — only the surrounding structure differs,
 * so the shared-element transition to the detail page is preserved.
 */
/**
 * One project in an architect section. `item` is the backing gallery project —
 * when absent the tile renders as a named placeholder awaiting real imagery.
 */
type ArchitectEntry = { name: string; item?: GalleryItem };

function ArchitectTile({ entry }: { entry: ArchitectEntry }) {
  const { name, item } = entry;

  // Project name only — the numbering belongs to the label column beside this
  // row, so numbering both would make "01" point at two different things.
  const caption = (
    <figcaption className="mb-2 flex items-center border-t border-white/20 pt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">
      <span className="truncate">{name}</span>
    </figcaption>
  );

  if (!item) {
    return (
      <figure className="flex w-40 shrink-0 flex-col sm:w-48 lg:w-56">
        {caption}
        <div className="grid aspect-[3/5] w-full place-items-center bg-white/5 ring-1 ring-white/10">
          <span className="px-2 text-center text-[9px] uppercase tracking-[0.25em] text-white/30">
            hamarosan
          </span>
        </div>
      </figure>
    );
  }

  return (
    <figure className="flex w-40 shrink-0 flex-col sm:w-48 lg:w-56">
      {caption}
      <Link
        href={`/projects/${item.slug}`}
        aria-label={item.title}
        draggable={false}
        className="group relative block aspect-[3/5] w-full overflow-hidden rounded-none bg-white/5"
      >
        <motion.div
          layoutId={projectLayoutId(item.slug)}
          className="absolute inset-0"
          style={{ willChange: 'transform' }}
        >
          <Image
            src={item.src}
            alt={item.alt}
            fill
            sizes="(min-width: 1024px) 15vw, (min-width: 768px) 30vw, 45vw"
            unoptimized={shouldBypassOptimizer(item.src)}
            draggable={false}
            className="pointer-events-none object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        </motion.div>
      </Link>
    </figure>
  );
}

/**
 * Horizontally scrollable + draggable row of architect tiles. Vertical wheel is
 * translated into horizontal scroll; pointer drag scrolls too. A drag that
 * actually moved suppresses the tile's <Link> navigation so dragging never
 * accidentally opens a project.
 */
function ArchitectTileRow({ entries }: { entries: ArchitectEntry[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startX: 0, startScroll: 0, moved: false });

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return; // already horizontal
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0) return; // nothing to scroll — let the page have it
      // Only swallow the wheel while this row can still consume it; at either
      // end it passes through so the page keeps scrolling.
      const atStart = el.scrollLeft <= 0.5;
      const atEnd = el.scrollLeft >= max - 0.5;
      if ((e.deltaY > 0 && atEnd) || (e.deltaY < 0 && atStart)) return;
      el.scrollLeft = Math.max(0, Math.min(max, el.scrollLeft + e.deltaY));
      e.preventDefault();
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  function onPointerDown(e: React.PointerEvent) {
    const el = scrollerRef.current;
    if (!el) return;
    drag.current = { active: true, startX: e.clientX, startScroll: el.scrollLeft, moved: false };
  }
  function onPointerMove(e: React.PointerEvent) {
    const el = scrollerRef.current;
    if (!el || !drag.current.active) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    el.scrollLeft = drag.current.startScroll - dx;
  }
  function endDrag() {
    drag.current.active = false;
  }
  function onClickCapture(e: React.MouseEvent) {
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = false;
    }
  }

  return (
    <div
      ref={scrollerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
      onClickCapture={onClickCapture}
      className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [@media(hover:hover)and(pointer:fine)]:cursor-grab [@media(hover:hover)and(pointer:fine)]:active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
    >
      {entries.map((entry) => (
        <ArchitectTile key={entry.item?.slug ?? entry.name} entry={entry} />
      ))}
    </div>
  );
}

/**
 * One editorial section from "architect layout.jpg": a left label column (title
 * + numbered location list) followed by a row of captioned portrait tiles.
 *
 * Responsive collapse via a single grid:
 *   mobile  → grid-cols-2  (label full-width on top, tiles 2-up)
 *   md      → grid-cols-3  (label full-width, tiles 3-up)
 *   lg      → grid-cols-6  (label = 1 col, then up to 5 tiles across — the
 *             desktop editorial row from the reference)
 */
function ArchitectSection({
  title,
  entries,
  listItems,
  lowercase,
}: {
  title: string;
  /** The tiles, in order. */
  entries: ArchitectEntry[];
  /** Optional curated list for the numbered label column. Falls back to the
   *  entries' own names when omitted. */
  listItems?: string[];
  lowercase?: boolean;
}) {
  const list = listItems ?? entries.map((e) => e.name);
  return (
    <section className="grid grid-cols-1 items-stretch gap-x-6 gap-y-6 lg:grid-cols-[180px_1fr]">
      {/* Label column. On desktop it stretches to the tile row's height and the
          list scrolls vertically inside that height if it overflows. */}
      <div className="relative lg:min-h-0">
        <div className="flex h-full flex-col lg:absolute lg:inset-0">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white">{title}</h3>
          <ol className="mt-3 min-h-0 flex-1 space-y-1 overflow-y-auto pr-2 [scrollbar-color:rgba(255,255,255,0.25)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar]:w-1">
            {list.map((loc, i) => (
              <li key={`${loc}-${i}`} className="flex gap-3 text-sm">
                <span className="tabular-nums text-white/40">{pad(i + 1)}</span>
                <span className={`tracking-wide text-white/80 ${lowercase ? 'lowercase' : 'uppercase'}`}>
                  {loc}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Horizontally scrollable + draggable image tiles. */}
      <div className="min-w-0">
        <ArchitectTileRow entries={entries} />
      </div>
    </section>
  );
}

/**
 * The bespoke layout for the "01 építészet & belsőépítészet" category only:
 * two stacked editorial sections (Építészet ← exterior, Belsőépítészet ←
 * interior). Reuses the same dark panel shell as the default gallery.
 */
// Curated location list for the Építészet label column (independent of how many
// image tiles currently exist — the list scrolls, the tiles scroll separately).
const EPITESZET_LOCATIONS = [
  'Rád',
  'Szugló',
  'Hertelend',
  'Újpest',
  'Hévíz',
  'Keszthely',
  'Budapest',
  'Tab',
  'Pécs',
];

/**
 * The Belsőépítészet projects, in order. The label column and the tiles are
 * driven by this one list, so the numbering and the tile captions always agree.
 * `slug` attaches a tile to a real project page; entries without one render as
 * named placeholders until their imagery exists.
 */
const BELSOEPITESZET_PROJECTS: { name: string; slug?: string }[] = [
  { name: 'Pécs - Rókus' },
  { name: 'Hévíz' },
  { name: 'Újpest' },
  { name: 'Rád', slug: 'rad-kitchen' },
  { name: 'Pécs - TP' },
  { name: 'Pécs - Petrus' },
  { name: 'Artwork' },
];

function ArchitectLayout() {
  const exterior = galleryProjects.filter((p) => p.category === 'exterior');
  const exteriorEntries: ArchitectEntry[] = exterior.map((item) => ({
    name: item.location,
    item,
  }));
  const interiorEntries: ArchitectEntry[] = BELSOEPITESZET_PROJECTS.map(({ name, slug }) => ({
    name,
    item: slug ? galleryProjects.find((p) => p.slug === slug) : undefined,
  }));

  return (
    <div className="space-y-10 rounded-3xl bg-[#111111] p-3 ring-1 ring-white/10 sm:p-5">
      <ArchitectSection
        title="Építészet"
        entries={exteriorEntries}
        listItems={EPITESZET_LOCATIONS}
      />
      <ArchitectSection title="Belsőépítészet" entries={interiorEntries} lowercase />
    </div>
  );
}

/**
 * The "05 3D Nyomtatás" content: its own centred filter bar
 * (Tidal · Alien · Serenity · Balloon). "Alien" plays the web-optimized
 * showcase video; the others show a video placeholder until their clips exist.
 * Add a clip by filling `video` (and `poster`) on the matching entry below.
 */
type PrintFilter = { id: string; label: string; video?: string; poster?: string };

const PRINT_FILTERS: PrintFilter[] = [
  { id: 'tidal', label: 'Tidal' },
  {
    id: 'alien',
    label: 'Alien',
    video: '/3d-printing/photonflow-alien.mp4',
    poster: '/3d-printing/photonflow-alien-poster.webp',
  },
  { id: 'serenity', label: 'Serenity' },
  { id: 'balloon', label: 'Balloon' },
];

function VideoPlaceholder({ label }: { label: string }) {
  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center gap-4 rounded-none bg-white/[0.03] ring-1 ring-white/10">
      <span className="grid h-16 w-16 place-items-center rounded-full text-white/50 ring-1 ring-white/20">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
      <span className="text-xs uppercase tracking-[0.3em] text-white/45">{label} — hamarosan</span>
    </div>
  );
}

function PrintLayout() {
  const [active, setActive] = useState('alien'); // default to the one with a clip
  const current = PRINT_FILTERS.find((f) => f.id === active) ?? PRINT_FILTERS[0];

  return (
    <div className="rounded-3xl bg-[#111111] p-3 ring-1 ring-white/10 sm:p-5">
      {/* Centred filter bar */}
      <div className="mb-4 flex justify-center">
        <div className="flex overflow-hidden rounded-full bg-white/10">
          {PRINT_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setActive(f.id)}
              className={`px-6 py-2 text-xs font-semibold uppercase tracking-widest transition-colors ${
                active === f.id ? 'bg-white text-black' : 'text-white/60 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Selected clip, or a placeholder while that segment is empty. */}
      {current.video ? (
        <div className="aspect-video w-full overflow-hidden rounded-none bg-black">
          <video
            key={current.video}
            className="h-full w-full object-cover"
            src={current.video}
            poster={current.poster}
            controls
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
        </div>
      ) : (
        <VideoPlaceholder label={current.label} />
      )}
    </div>
  );
}

/**
 * The "03 Fotózás & Videózás" content: ALL keeps its original left position
 * while the Photo · Video group is centred. Photo shows 4 image slots, Video
 * shows 2 video slots, ALL shows both. Swap a placeholder for real media by
 * rendering an <img>/<video> in place of <MediaPlaceholder>.
 */
const PHOTO_SLOTS = 4;
const VIDEO_SLOTS = 2;

function MediaPlaceholder({ kind, label }: { kind: 'image' | 'video'; label: string }) {
  return (
    <div
      className={`flex w-full flex-col items-center justify-center gap-3 bg-white/[0.03] ring-1 ring-white/10 ${
        kind === 'video' ? 'aspect-video' : 'aspect-[4/3]'
      }`}
    >
      <span className="grid h-12 w-12 place-items-center rounded-full text-white/50 ring-1 ring-white/20">
        {kind === 'video' ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 16H5l3.5-4.5 2.5 3 3.5-4.5L19 19z" />
          </svg>
        )}
      </span>
      <span className="text-[0.6rem] uppercase tracking-[0.3em] text-white/45">{label}</span>
    </div>
  );
}

type PhotoVideoFilter = 'all' | 'photo' | 'video';

function PhotoVideoLayout() {
  const [filter, setFilter] = useState<PhotoVideoFilter>('all');
  const showPhoto = filter === 'all' || filter === 'photo';
  const showVideo = filter === 'all' || filter === 'video';

  return (
    <div className="rounded-3xl bg-[#111111] p-3 ring-1 ring-white/10 sm:p-5">
      {/* Filter bar: ALL stays left (as before); Photo · Video sits centred.
          On narrow screens they stack in normal flow instead of overlapping. */}
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
          {(
            [
              ['photo', 'Photo'],
              ['video', 'Video'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={`px-6 py-2 text-xs font-semibold uppercase tracking-widest transition-colors ${
                filter === id ? 'bg-white text-black' : 'text-white/60 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {showPhoto && (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {Array.from({ length: PHOTO_SLOTS }, (_, i) => (
              <MediaPlaceholder key={`photo-${i}`} kind="image" label={`Fotó ${pad(i + 1)}`} />
            ))}
          </div>
        )}
        {showVideo && (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {Array.from({ length: VIDEO_SLOTS }, (_, i) => (
              <MediaPlaceholder key={`video-${i}`} kind="video" label={`Videó ${pad(i + 1)}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * The "04 Grafika" content: ALL keeps its original left position while the
 * Plan · Axonometry · Sketch group is centred. Each category has 3 image slots;
 * ALL shows every category stacked. Swap a placeholder for real media by
 * rendering an <img> in place of <MediaPlaceholder>.
 */
const GRAPHICS_SLOTS = 3;

const GRAPHICS_FILTERS = [
  { id: 'plan', label: 'Plan' },
  { id: 'axonometry', label: 'Axonometry' },
  { id: 'sketch', label: 'Sketch' },
] as const;

type GraphicsFilter = 'all' | (typeof GRAPHICS_FILTERS)[number]['id'];

function GraphicsLayout() {
  const [filter, setFilter] = useState<GraphicsFilter>('all');
  const visible = GRAPHICS_FILTERS.filter((f) => filter === 'all' || filter === f.id);

  return (
    <div className="rounded-3xl bg-[#111111] p-3 ring-1 ring-white/10 sm:p-5">
      {/* Filter bar: ALL stays left (as before); the category group sits centred.
          On narrow screens they stack in normal flow instead of overlapping. */}
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
          {GRAPHICS_FILTERS.map((f) => (
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

      <div className="flex flex-col gap-3">
        {visible.map((f) => (
          <div key={f.id} className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {Array.from({ length: GRAPHICS_SLOTS }, (_, i) => (
              <MediaPlaceholder key={`${f.id}-${i}`} kind="image" label={`${f.label} ${pad(i + 1)}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProjectsGallery({ categoryId }: { categoryId?: string | null }) {
  const [filter, setFilter] = useState<Filter>('all');
  const [hero, a, b, c, d, e, f, g] = galleryProjects;
  const filtered = galleryProjects.filter((p) => filter === 'all' || p.category === filter);

  // Conditional layout: the "01 építészet & belsőépítészet" tile (id
  // 'epiteszet') gets the bespoke editorial grid from "architect layout.jpg".
  // Every other category falls through to the default filter + bento layout
  // below, unchanged.
  if (categoryId === 'epiteszet') {
    return <ArchitectLayout />;
  }

  // The "05 3D Nyomtatás" tile (id 'nyomtatas') gets its own centred filter bar
  // (Tidal · Alien · Serenity · Balloon) and a showcase video / placeholder.
  if (categoryId === 'nyomtatas') {
    return <PrintLayout />;
  }

  // The "03 Fotózás & Videózás" tile (id 'foto-video') gets a Photo · Video
  // filter with 4 image slots and 2 video slots.
  if (categoryId === 'foto-video') {
    return <PhotoVideoLayout />;
  }

  // The "04 Grafika" tile (id 'grafika') gets a Plan · Axonometry · Sketch
  // filter with 3 image slots per category.
  if (categoryId === 'grafika') {
    return <GraphicsLayout />;
  }

  // The "02 Vizualizáció" tile gets the pinned-scroll infinite gallery from
  // "visualization layout menu.jpg".
  if (categoryId === 'vizualizacio') {
    return <VisualizationGallery />;
  }

  return (
    <div className="rounded-3xl bg-[#111111] p-3 ring-1 ring-white/10 sm:p-5">
      {/* Filter bar: ALL stays left (as before); the category group sits centred.
          On narrow screens they stack in normal flow instead of overlapping. */}
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
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`px-6 py-2 text-xs font-semibold uppercase tracking-widest transition-colors ${
                filter === item.id ? 'bg-white text-black' : 'text-white/60 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* ALL → the curated bento layout from the reference */}
      {filter === 'all' ? (
        <div className="flex flex-col gap-3">
          {/* Full-width hero */}
          <div className="aspect-[16/7] w-full">
            <Frame item={hero} sizes="(min-width: 640px) 90vw, 100vw" />
          </div>

          {/* 50 / 50 */}
          <div className="flex aspect-[8/3] w-full gap-3">
            <div className="h-full flex-1">
              <Frame item={a} sizes="45vw" />
            </div>
            <div className="h-full flex-1">
              <Frame item={b} sizes="45vw" />
            </div>
          </div>

          {/* 3-up: narrow · wide · wide */}
          <div className="flex aspect-[3/1] w-full gap-3">
            <div className="h-full flex-[26]">
              <Frame item={c} sizes="24vw" />
            </div>
            <div className="h-full flex-[37]">
              <Frame item={d} sizes="33vw" />
            </div>
            <div className="h-full flex-[37]">
              <Frame item={e} sizes="33vw" />
            </div>
          </div>

          {/* ~62 / 38 */}
          <div className="flex aspect-[5/2] w-full gap-3">
            <div className="h-full flex-[62]">
              <Frame item={f} sizes="56vw" />
            </div>
            <div className="h-full flex-[38]">
              <Frame item={g} sizes="34vw" />
            </div>
          </div>
        </div>
      ) : (
        /* Filtered → uniform responsive grid */
        <motion.div layout className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((item) => (
              <motion.div
                key={item.src}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25 }}
                className="aspect-[4/3]"
              >
                <Frame item={item} sizes="(min-width: 768px) 30vw, 45vw" />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
