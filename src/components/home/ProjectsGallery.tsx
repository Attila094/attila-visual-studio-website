'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { galleryProjects, type Category, type GalleryItem } from '@/content/galleryProjects';
import { allPhotos, allVideos } from '@/content/photoVideo';
import { graphicAxonometries, graphicMotion, graphicPlans } from '@/content/graphics';
import { morphSpring, projectLayoutId } from '@/lib/motion';
import { shouldBypassOptimizer } from '@/lib/image';
import { MASONRY_GAP, masonryRowSpan, masonryTracks } from '@/lib/masonry';
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
type ArchitectEntry = {
  name: string;
  /** The project's own cover shot, out of `Építészet és belsőépítészet`. */
  cover?: string;
  /** Somewhere other than a project page for the tile to lead — the tiles that
   *  are an invitation rather than a finished job. */
  href?: string;
  item?: GalleryItem;
};

/**
 * Whether a project has photography behind it yet. The remaining `.svg` sources
 * are the scaffolding plates from before the real renders arrived — they read
 * as finished tiles, which is worse than an honest "hamarosan".
 */
function hasArtwork(item?: GalleryItem): item is GalleryItem {
  return !!item && !item.src.toLowerCase().endsWith('.svg');
}

const TILE_SIZES = '(min-width: 1024px) 15vw, (min-width: 768px) 30vw, 45vw';

function ArchitectTile({ entry, index }: { entry: ArchitectEntry; index: number }) {
  const { name, cover, href } = entry;
  // Only a project whose own page has something to show is worth linking to.
  const item = hasArtwork(entry.item) ? entry.item : undefined;
  // The cover shot leads; failing that, the project's own artwork.
  const src = cover ?? item?.src;

  // The tile carries the same number as its line in the list beside it: the two
  // are built from one array, so they cannot drift. Number left, name right.
  const caption = (
    <figcaption className="mb-2 flex items-baseline justify-between gap-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">
      <span className="tabular-nums text-white/40">{pad(index + 1)}</span>
      <span className="truncate">{name}</span>
    </figcaption>
  );

  if (!src) {
    const plate = (
      <span className="grid aspect-[3/5] w-full place-items-center bg-white/5 ring-1 ring-white/10">
        <span className="px-2 text-center text-[9px] uppercase tracking-[0.25em] text-white/30">
          hamarosan
        </span>
      </span>
    );
    return (
      <figure className="flex w-40 shrink-0 flex-col sm:w-48 lg:w-56">
        {caption}
        {href ? (
          // The plate itself is the button: there is no work to show yet, so
          // the tile's whole job is to lead to the enquiry form.
          <Link
            href={href}
            draggable={false}
            className="block w-full ring-inset transition-colors hover:[&>span]:bg-white/10 hover:[&>span>span]:text-white/60"
          >
            {plate}
          </Link>
        ) : (
          plate
        )}
      </figure>
    );
  }

  const art = (
    <Image
      src={src}
      alt={item?.alt ?? `${name} — építészeti projekt`}
      fill
      sizes={TILE_SIZES}
      unoptimized={shouldBypassOptimizer(src)}
      draggable={false}
      className="pointer-events-none object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
    />
  );

  // A cover with no project page behind it is just a picture — no link, and no
  // morph handle either, since there is no hero on the other side to morph to.
  if (!item) {
    return (
      <figure className="flex w-40 shrink-0 flex-col sm:w-48 lg:w-56">
        {caption}
        <div className="group relative block aspect-[3/5] w-full overflow-hidden bg-white/5">
          {art}
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
          {art}
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
      {entries.map((entry, i) => (
        <ArchitectTile key={entry.item?.slug ?? entry.name} entry={entry} index={i} />
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
  lowercase,
}: {
  title: string;
  /** The tiles AND the numbered list beside them, in order — one array, so a
   *  tile's number can never point at a different project than its line. */
  entries: ArchitectEntry[];
  lowercase?: boolean;
}) {
  return (
    <section>
      <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white">{title}</h3>

      {/* One rule for the whole section, hung off the bottom of the title and
          running to the end of the tile row — rather than a short stub over
          each tile. */}
      <div className="mt-2 border-t border-white/20" />

      <div className="mt-3 grid grid-cols-1 items-stretch gap-x-6 gap-y-6 lg:grid-cols-[180px_1fr]">
        {/* Label column. On desktop it stretches to the tile row's height and
            the list scrolls vertically inside that height if it overflows. */}
        <div className="relative lg:min-h-0">
          <ol className="min-h-0 space-y-1 overflow-y-auto pr-2 lg:absolute lg:inset-0 [scrollbar-color:rgba(255,255,255,0.25)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar]:w-1">
            {entries.map((entry, i) => (
              <li key={`${entry.name}-${i}`} className="flex gap-3 text-sm">
                <span className="tabular-nums text-white/40">{pad(i + 1)}</span>
                <span
                  className={`tracking-wide text-white/80 ${lowercase ? 'lowercase' : 'uppercase'}`}
                >
                  {entry.name}
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* Horizontally scrollable + draggable image tiles. */}
        <div className="min-w-0">
          <ArchitectTileRow entries={entries} />
        </div>
      </div>
    </section>
  );
}

/**
 * The bespoke layout for the "01 építészet & belsőépítészet" category only:
 * two stacked editorial sections (Építészet ← exterior, Belsőépítészet ←
 * interior). Reuses the same dark panel shell as the default gallery.
 */
/** Where the cover shots from `Építészet és belsőépítészet` are served from. */
const ARCH = '/media/architecture';

type ArchitectProject = { name: string; slug?: string; cover?: string; href?: string };

/**
 * The Építészet projects, in order — the same shape as Belsőépítészet below.
 * One array drives both the numbered list and the tiles, so tile 01 is the
 * project on line 01. `cover` is that project's own cover shot; `slug` attaches
 * the tile to a project page. With neither — or with only a project still on a
 * placeholder plate — the tile reads "hamarosan".
 */
const EPITESZET_PROJECTS: ArchitectProject[] = [
  { name: 'Rád', slug: 'rad-house', cover: `${ARCH}/epiteszet/rad.webp` },
  { name: 'Szugló', cover: `${ARCH}/epiteszet/szuglo.webp` },
  { name: 'Hertelend', cover: `${ARCH}/epiteszet/hertelend.webp` },
  { name: 'Újpest' },
  { name: 'Budapest - Hosszúrét', cover: `${ARCH}/epiteszet/budapest-hosszuret.webp` },
  // Not a project: the open slot at the end of the row, on its blank plate,
  // leading to the contact form.
  { name: 'Projected', href: '/contact' },
];

/**
 * The Belsőépítészet projects, in order. The label column and the tiles are
 * driven by this one list, so the numbering and the tile captions always agree.
 * `slug` attaches a tile to a real project page; entries without one render as
 * named placeholders until their imagery exists.
 */
const BELSOEPITESZET_PROJECTS: ArchitectProject[] = [
  { name: 'Pécs - Rókus', cover: `${ARCH}/belsoepiteszet/pecs-rokus.webp` },
  { name: 'Rád', slug: 'rad-kitchen', cover: `${ARCH}/belsoepiteszet/rad.webp` },
  { name: 'Hévíz', cover: `${ARCH}/belsoepiteszet/heviz.webp` },
  { name: 'Budapest - Pinty', cover: `${ARCH}/belsoepiteszet/budapest-pinty.webp` },
  { name: 'Pécs - Petrus', cover: `${ARCH}/belsoepiteszet/pecs-petrus.webp` },
  { name: 'Újpest' },
  { name: 'Gödöllő', cover: `${ARCH}/belsoepiteszet/godollo.webp` },
];

function ArchitectLayout() {
  const toEntries = (projects: ArchitectProject[]): ArchitectEntry[] =>
    projects.map(({ name, slug, cover, href }) => ({
      name,
      cover,
      href,
      item: slug ? galleryProjects.find((p) => p.slug === slug) : undefined,
    }));

  return (
    <div className="space-y-10 rounded-3xl bg-[#111111] p-3 ring-1 ring-white/10 sm:p-5">
      <ArchitectSection title="Építészet" entries={toEntries(EPITESZET_PROJECTS)} />
      <ArchitectSection
        title="Belsőépítészet"
        entries={toEntries(BELSOEPITESZET_PROJECTS)}
        lowercase
      />
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
 * while the Photo · Video group is centred. Photo shows the stills, Video the
 * films, ALL shows both — everything under `projects/Fotó és video`, by way of
 * `photoVideo.ts`.
 */
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

type PhotoVideoFilter = 'photo' | 'video';

function PhotoVideoLayout() {
  const [filter, setFilter] = useState<PhotoVideoFilter>('photo');
  const [open, setOpen] = useState<string | null>(null);
  const showPhoto = filter === 'photo';
  const showVideo = filter === 'video';

  // Switching sets closes whatever was open — its tile is gone.
  useEffect(() => setOpen(null), [filter]);

  // A click anywhere outside the open still closes it. Clicking another one
  // fires this first and its own onClick second, so the grid simply switches.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!(e.target as HTMLElement).closest?.('[data-photo-open]')) setOpen(null);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  // The row spans below are measured from the grid's resolved columns, so the
  // responsive counts stay in the class list. A callback ref, because the grid
  // only exists under the Photo filter.
  const [gridEl, setGridEl] = useState<HTMLDivElement | null>(null);
  const [tracks, setTracks] = useState({ column: 0, full: 0, count: 0 });
  useLayoutEffect(() => {
    if (!gridEl) return;
    const measure = () => setTracks(masonryTracks(gridEl));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(gridEl);
    return () => ro.disconnect();
  }, [gridEl]);

  return (
    <div className="rounded-3xl bg-[#111111] p-3 ring-1 ring-white/10 sm:p-5">
      {/* Filter bar — Photo · Video, centred. */}
      <div className="relative mb-4 flex flex-wrap items-center justify-center gap-2">
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
        {showPhoto &&
          (allPhotos.length ? (
            // A masonry grid rather than CSS columns: the shoots run about four
            // portraits to every landscape, so every still keeps its own shape,
            // and a real grid is what lets one of them open across the rest.
            <div
              ref={setGridEl}
              style={{ gridAutoRows: '1px', columnGap: MASONRY_GAP, rowGap: 0 }}
              className="grid grid-cols-2 items-start md:grid-cols-3 lg:grid-cols-4"
            >
              {allPhotos.map((photo) => {
                const isOpen = open === photo.src;
                return (
                  <motion.button
                    key={photo.src}
                    type="button"
                    layout
                    {...(isOpen ? { 'data-photo-open': true } : {})}
                    onClick={() => setOpen(isOpen ? null : photo.src)}
                    transition={morphSpring}
                    aria-expanded={isOpen}
                    style={{
                      gridRowEnd: `span ${masonryRowSpan(
                        photo.width,
                        photo.height,
                        isOpen ? tracks.full : tracks.column,
                      )}`,
                      marginBottom: MASONRY_GAP,
                    }}
                    className={`block w-full overflow-hidden bg-white/[0.03] ${
                      isOpen ? 'col-span-full' : ''
                    }`}
                  >
                    <Image
                      src={photo.src}
                      alt={`${photo.set} — építészeti fotó`}
                      width={photo.width}
                      height={photo.height}
                      sizes={
                        isOpen
                          ? '(min-width: 768px) 90vw, 92vw'
                          : '(min-width: 1024px) 22vw, (min-width: 768px) 30vw, 45vw'
                      }
                      className="block h-auto w-full"
                    />
                  </motion.button>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {Array.from({ length: 4 }, (_, i) => (
                <MediaPlaceholder key={`photo-${i}`} kind="image" label={`Fotó ${pad(i + 1)}`} />
              ))}
            </div>
          ))}
        {showVideo &&
          (allVideos.length ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {allVideos.map((video) => (
                <video
                  key={video.src}
                  src={video.src}
                  poster={video.poster}
                  controls
                  playsInline
                  // Nothing but the poster travels until the visitor presses
                  // play — the film is 11 MB.
                  preload="none"
                  width={video.width}
                  height={video.height}
                  aria-label={`${video.set} — építészeti videó`}
                  className="block h-auto w-full bg-white/[0.03]"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {Array.from({ length: 2 }, (_, i) => (
                <MediaPlaceholder key={`video-${i}`} kind="video" label={`Videó ${pad(i + 1)}`} />
              ))}
            </div>
          ))}
      </div>
    </div>
  );
}

/**
 * The "04 Grafikai tervezés" content: Plan · Axonometry · Motion Diagram,
 * centred, one set at a time. The drawings are square, so the grid is too —
 * nothing is cropped at any column count. The motion diagrams are the two
 * concept animations, re-encoded from GIF and looping silently.
 */
const GRAPHICS_FILTERS = [
  { id: 'plan', label: 'Plan' },
  { id: 'axonometry', label: 'Axonometry' },
  { id: 'motion', label: 'Motion Diagram' },
] as const;

type GraphicsFilter = (typeof GRAPHICS_FILTERS)[number]['id'];

function GraphicsLayout() {
  const [filter, setFilter] = useState<GraphicsFilter>('plan');
  const stills = filter === 'plan' ? graphicPlans : filter === 'axonometry' ? graphicAxonometries : [];

  return (
    <div className="rounded-3xl bg-[#111111] p-3 ring-1 ring-white/10 sm:p-5">
      {/* Filter bar — the three sets, centred. */}
      <div className="relative mb-4 flex flex-wrap items-center justify-center gap-2">
        <div className="flex overflow-hidden rounded-full bg-white/10">
          {GRAPHICS_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-widest transition-colors sm:px-6 ${
                filter === f.id ? 'bg-white text-black' : 'text-white/60 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filter === 'motion' ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {graphicMotion.map((clip) => (
            <video
              key={clip.src}
              src={clip.src}
              poster={clip.poster}
              width={clip.width}
              height={clip.height}
              // A diagram, not a film: it explains itself by running, so it
              // runs — silently, on loop, with no chrome in the way.
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label="Koncepció diagram"
              className="block h-auto w-full bg-white"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {stills.map((still) => (
            <Image
              key={still.src}
              src={still.src}
              alt="Grafikai terv"
              width={still.width}
              height={still.height}
              sizes="(min-width: 768px) 30vw, 46vw"
              className="block h-auto w-full bg-white"
            />
          ))}
        </div>
      )}
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
