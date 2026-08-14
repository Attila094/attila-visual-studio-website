'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Bebas_Neue, Montserrat } from 'next/font/google';
import { motion, useMotionValue, useTransform, type MotionValue } from 'framer-motion';
import { heroSequenceImages, type HeroSequenceImage } from '@/content/heroSequence';
import { mainTiles } from '@/content/mainTiles';
import {
  captionColor,
  captionGroups,
  captionLines,
  linesBefore,
} from '@/content/sequenceCaptions';
import { logoDockEnd, selectedTile } from '@/lib/heroSequenceState';
import { WORK_ANCHOR } from '@/lib/anchors';
import { useHeldViewportHeight } from '@/lib/useHeldViewportHeight';
import {
  captionArrivals,
  clipWindow,
  PHASES,
  REVEAL_SPAN,
  SWAP_AT,
} from '@/lib/sequenceTiming';
import { SequenceCaptions } from './SequenceCaptions';

const bebas = Bebas_Neue({ subsets: ['latin', 'latin-ext'], weight: '400' });
const montserrat = Montserrat({ subsets: ['latin', 'latin-ext'], weight: '800' });

/* ================================================================
   Scroll-driven hero image sequence.

   The bouncing ball becomes a rounded image that grows to fill the stage —
   centred on the page. As each image reaches full size its caption is revealed
   across the page, and STAYS, receding as the scroll moves on and the next one
   lands beneath it, so the titles build into a list. When the fifth image
   starts to shrink, all five fly to the exact rects laid out by <MainTiles> —
   brightening back to full on the way — and on arrival they BECOME the tiles:
   each settles to 95%, takes its title, and turns into a button that opens its
   projects gallery. The caption stack dissolves over that same flight, since
   the tiles carry those titles now.

   Where a finished image goes depends on the screen. On a wide one it shrinks
   to 15% and parks in a row to the left of the big image, tops flush. On a
   phone there is no gutter to park in, so it keeps its full width instead and
   loses only its height, becoming a 5:1 strip in a pile under the logo — which
   is the shape the tiles themselves take there, so the pile is a preview of
   what the sequence resolves into.

   NOTHING HERE IS ON A CLOCK. Progress is MAPPED from the scroll position, not
   integrated from deltas and not played out over time, so the sequence scrubs
   cleanly in both directions: scrolling up runs it backwards, scrolling down
   picks it up from exactly where it left off, and the page is never pinned or
   driven. Every position, every opacity and every flip is a pure function of
   that one number. The single exception is a caption's reveal, a one-shot
   animation that plays the first time its line is reached; it is latched in
   <SequenceCaptions> so scrolling back and forth cannot replay it.
   ================================================================ */

/** Ball size in px — must match BallMenu's BALL so the handoff is invisible. */
const BALL = 16;
/** Gap under the logo, and clearance above the viewport bottom. */
const LOGO_GAP = 28;
const BOTTOM_MARGIN = 40;
/** Side clearance, and the gap between the big image and its thumbnail. */
const SIDE_MARGIN = 24;
const THUMB_GAP = 16;
/** Slot aspect (w / h) — 3:4 portrait, same as a MainTile. */
const ASPECT = 3 / 4;
/** Scale of an incoming image while it waits beside the big one. */
const THUMB = 0.18;
/** Size a finished image shrinks to and parks at, as a fraction of full size. */
const PARKED = 0.15;
/** Gap between two parked images — and between the newest one and the big
 *  image it sits beside, so the row reads as one evenly spaced strip. */
const ROW_ITEM_GAP = 10;
/** Corner radius (px) at each stage. Kept in px so corners stay circular. */
const RADIUS = 34;
const PARKED_RADIUS = 8;
const TILE_RADIUS = 16; // matches MainTiles' rounded-2xl
/** Below this width the phone layout applies. Matches Tailwind's `sm`. */
export const MOBILE_MAX = 640;
/** On a phone the corners come in to 40% of their radius — 34px of rounding
 *  reads as a squircle at that scale. */
const MOBILE_RADIUS_SCALE = 0.4;
/** On a phone the pile's strips sit this far apart, and the big image keeps
 *  this much clearance from the screen edge. */
const MOBILE_ROW_GAP = ROW_ITEM_GAP / 2;
const MOBILE_SIDE_MARGIN = 12;
/** Where the fixed chrome ends — the nav pills and the docked logo both finish
 *  at 55px. A caption over an expanded picture is centred in what lies between
 *  this and the picture's top edge. */
const HEADER_H = 56;
/** A phone caption's type size, as a share of the big image's width. */
const CAPTION_SIZE = 0.065 * 2.5;
/**
 * …under a ceiling: no line may take more than this much of the screen's
 * width. The ceiling is what actually decides the size on a phone. At the size
 * above, "GRAFIKAI TERVEZÉS" sets 640px wide on a 375px screen — it would hang
 * a quarter of its length off each edge — so the longest line is what the whole
 * set is sized from, and they all share one size rather than each finding its
 * own and reading as a jumble.
 */
const CAPTION_SCREEN_FILL = 0.94;
/** The longest caption there is: what the ceiling above is measured against. */
const LONGEST_CAPTION = captionLines.reduce((a, b) => (b.length > a.length ? b : a));
/** The size the hidden probe is set at; the measurement is divided back out of
 *  it, so only its precision matters. */
const CAPTION_PROBE_PX = 100;
/** …and the line box that size sets, as a multiple of it. */
const CAPTION_LINE = 1.15;
/** Scroll runway, in viewport heights. */
export const RUNWAY_VH = 3;
/** Progress at which the first image takes over from the bouncing ball. */
const BALL_HANDOFF = 0.005;

/**
 * How much of the scroll a phone's landing may fall short by and still count as
 * arrived.
 *
 * The sequence finishes on an exact scroll position, and the glide below aims
 * at it — but a smooth scroll settles where the browser's own animation leaves
 * it, which is routinely a fraction of a pixel short. Without this the five
 * pictures sit in their tiles, lit and titled, with pointer events still
 * switched off: the reported "sometimes the tiles don't open". Small enough
 * that the flight is 99.7% done inside it, so nothing visibly snaps.
 */
const LANDING_SLACK = 8;

/**
 * How long the page is held at the landing when it is reached from BELOW.
 *
 * Coming back up the page from the footer, the tile row arrives and is gone
 * again in the same flick — the sequence starts pulling itself apart before you
 * have registered that the tiles were ever there. So the scroll is caught on
 * that one frame, which kills a fling's momentum, and let go again a moment
 * later: keep pushing up and you carry straight on into the sequence.
 *
 * Long enough to read as a stop, short enough that a visitor who means to go
 * further never feels held. Only ever on the way UP — going down, the landing
 * is where you were heading anyway and stopping there would be in the way.
 */
const LANDING_BRAKE_MS = 350;

/** Once landed, each image settles from 100% to 95% of its tile. */
const FINAL_SCALE = 0.95;

/**
 * What a phone's landed tile looks like: the photograph held back to a little
 * over a third and taken just off focus, so the five read as a soft ground for
 * their titles rather than five competing pictures.
 *
 * Only the PICTURE is softened. The title sits outside it and stays crisp at
 * full strength, which is the whole point of putting it behind glass.
 */
const MOBILE_TILE_OPACITY = 0.4;
const MOBILE_TILE_BLUR_PX = 3;
/**
 * …and how much the softened picture is scaled up underneath. A blur samples
 * past the element's own edge, where there is nothing, so an unscaled one fades
 * out at all four sides and the tile loses its corners. 5% of the shortest tile
 * a phone produces is comfortably more than the radius above, which is all the
 * overscan has to beat — any more than that is crop thrown away for nothing.
 */
const MOBILE_TILE_OVERSCAN = 1.1;
/** Selection, once the images are tiles: picked grows 5%, the rest shrink 5%. */
const SELECTED_SCALE = 1.05;
const UNSELECTED_SCALE = 0.95;

const N = heroSequenceImages.length; // 5

/** Phase boundaries — shared with the captions, which arrive on them. */
const P = PHASES;
/** Where each image gives way — see `@/lib/sequenceTiming`, which lays the
 *  whole timeline out from how long each beat needs. */
const SWAP = SWAP_AT;
/** The fifth image's shrink is the flight to the tiles, so the last swap is
 *  where every image sets off for its place in the row. */
const FINAL_START = SWAP[N - 1];
/**
 * Where the phone's self-scroll re-arms: the moment the last image reaches full
 * size, one beat before it gives way. The glide fires on the way DOWN past
 * FINAL_START and can only be loaded again by coming back up past this, so it
 * happens once per pass — never twice on one scroll, and never at all on a
 * reload or a WORK link that arrives already past it.
 */
const AUTOSCROLL_REARM = P[N];
/**
 * Where a two-faced slot turns over: the moment its group's second caption
 * arrives, so the picture changes with the word. Read from progress rather than
 * signalled by the captions, now that both are functions of the same scroll.
 * `null` for a slot with only one line and nothing to turn to.
 */
const FLIP_AT: (number | null)[] = captionGroups.map((group, i) =>
  group.length > 1 ? captionArrivals[linesBefore(i) + 1] : null,
);
/** What a finished image dims to once it has shrunk — it is a marker of where
 *  the sequence has been, not something to look at. Full again by the time it
 *  lands on its tile. */
const PARKED_OPACITY = 0.1;
/** …and what its caption dims to, once it has travelled down with it. Set
 *  higher than the picture's: a word at a tenth is unreadable where a
 *  photograph at a tenth is merely faint. */
const PARKED_TEXT_OPACITY = 0.2;
/** How long a two-faced slot takes to turn over. */
const FLIP_MS = 900;

/**
 * A silent clip standing in for a still.
 *
 * It does NOT autoplay. A slot spends the first part of its life as a thumbnail
 * the size of a fingernail, and a clip left running through that is half over
 * by the time the slot is big enough to watch — so it is held at its first
 * frame and started by `playing`, which the slot turns on at full size. Held at
 * the first frame rather than paused wherever it happened to be, so it always
 * begins at the beginning.
 */
function SlotVideo({
  src,
  poster,
  alt,
  scrub,
}: {
  src: string;
  poster?: string;
  alt: string;
  /** How far through the clip the scroll has come, 0→1, or null while the slot
   *  is not showing it. */
  scrub: MotionValue<number> | null;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !scrub) return;
    // The clip does not play — it is SCRUBBED. Seeking to a position the
    // scroll chooses means the picture runs forwards as you go down and
    // backwards as you come back up, which is what everything else on this
    // stage does. It stays paused throughout: `play()` and seeking at the same
    // time fight each other.
    el.pause();
    const seek = (t: number) => {
      const d = el.duration;
      if (!Number.isFinite(d) || d <= 0) return;
      const want = Math.min(0.999, Math.max(0, t)) * d;
      // Seeking is the expensive part, so ask only when the frame would
      // actually differ — a scroll fires far more often than the clip has
      // frames to show for it.
      if (Math.abs(el.currentTime - want) > 1 / 30) el.currentTime = want;
    };
    seek(scrub.get());
    const stop = scrub.on('change', seek);
    // The duration is unknown until metadata lands; seek again once it is.
    const onMeta = () => seek(scrub.get());
    el.addEventListener('loadedmetadata', onMeta);
    return () => {
      stop();
      el.removeEventListener('loadedmetadata', onMeta);
    };
  }, [scrub]);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="auto"
      aria-label={alt}
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}

/** One face of a slot: a still, or a silent clip scrubbed in its place. */
function SlotFace({
  src,
  poster,
  alt,
  scrub = null,
}: {
  src: string;
  poster?: string;
  alt: string;
  /** Only meaningful for a clip: where the scroll has reached within it. */
  scrub?: MotionValue<number> | null;
}) {
  if (/\.mp4$/i.test(src)) {
    return <SlotVideo src={src} poster={poster} alt={alt} scrub={scrub} />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="eager"
      decoding="async"
      draggable={false}
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}

/** Smoothstep — takes the linear scroll edge off every interpolation. */
const ease = (v: number) => v * v * (3 - 2 * v);
/** Whether the visitor has asked for less movement. The one scroll this page
 *  performs on its own still has to happen — it is what makes the tiles
 *  reachable — but it arrives instead of travelling. */
const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
/** Progress `p` mapped to 0→1 across the window [a, b], clamped. */
const seg = (p: number, a: number, b: number) =>
  Math.min(1, Math.max(0, (p - a) / (b - a)));

interface Rect {
  top: number;
  left: number;
  w: number;
  h: number;
  r: number;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpRect = (a: Rect, b: Rect, t: number): Rect => ({
  top: lerp(a.top, b.top, t),
  left: lerp(a.left, b.left, t),
  w: lerp(a.w, b.w, t),
  h: lerp(a.h, b.h, t),
  r: lerp(a.r, b.r, t),
});

interface Geometry {
  ball: Rect;
  slot: Rect;
  thumb: Rect;
  tiles: Rect[];
  /** Size, rounding and spacing of a parked image — a small 3:4 thumbnail in
   *  the row on a wide screen, a full-width 5:1 strip in the pile on a phone. */
  parked: { w: number; h: number; r: number; gap: number };
  /** True on a phone: finished images lie down in a pile instead of parking in
   *  a row beside the big image. */
  piled: boolean;
  /** Top of the first strip in that pile; it grows downwards from here. */
  pileTop: number;
  /** Type size for the phone captions. Fixed at the size the caption had over the
   *  big image: it MOVES with its picture, it does not shrink with it. */
  captionSize: number;
}

const emptyRect = (): Rect => ({ top: 0, left: 0, w: 0, h: 0, r: 0 });

/**
 * Where image `i` sits in the parked row once `kc` images have parked.
 *
 * The row is anchored to the big image's LEFT EDGE and grows leftward: the
 * newest arrival always lands in the slot beside it, top edges level, its
 * top-right corner against the big image's top-left — and everything already
 * parked has shuffled one slot further left. `kc` is fractional while an image
 * is on its way down, which is what makes that shuffle animate.
 */
function parkedRect(i: number, kc: number, g: Geometry): Rect {
  const { w, h, r, gap } = g.parked;
  if (g.piled) {
    // The pile does not shuffle: image i always owns row i, so the strips read
    // top to bottom in the order the tiles will, and each one lands in a place
    // that was empty and waiting rather than shoving its neighbours along.
    // `kc` is therefore unused here — nothing depends on how many have arrived.
    // A hairline between rows and nothing else: the five together are meant to
    // fill the screen, so there is no room to reserve for the captions and
    // they ride over the strip above instead.
    return { top: g.pileTop + i * (h + gap), left: g.slot.left, w, h, r };
  }
  const fromRight = kc - 1 - i;
  const right = g.slot.left - gap - fromRight * (w + gap);
  return { top: g.slot.top, left: right - w, w, h, r };
}

/** How many images have parked at progress `p` — fractional exactly while one
 *  is shrinking, so the row shuffles in step with it. */
function parkedCount(p: number): number {
  for (let j = 0; j < N - 1; j += 1) {
    if (p < P[j + 2]) return j + ease(seg(p, SWAP[j], P[j + 2]));
  }
  return N - 1;
}

/**
 * The rect an image occupies at progress `p`:
 *   waiting → slot → the row beside the big image → its tile
 * The last image skips the row: its shrink IS the final flight.
 */
function rectFor(i: number, p: number, g: Geometry): Rect {
  // Growing takes over exactly where the image before it gave way, so the two
  // movements are one exchange rather than a dissolve with a gap in it.
  const growStart = i === 0 ? P[0] : SWAP[i - 1];
  const growEnd = P[i + 1];
  const shrinkStart = SWAP[i];
  const shrinkEnd = P[i + 2];
  const isLast = i === N - 1;

  const waiting = i === 0 ? g.ball : g.thumb;
  const tile = g.tiles[i] ?? g.slot;

  if (p <= growStart) return waiting;
  if (p < growEnd) return lerpRect(waiting, g.slot, ease(seg(p, growStart, growEnd)));
  if (p < shrinkStart) return g.slot;

  if (isLast) return lerpRect(g.slot, tile, ease(seg(p, shrinkStart, shrinkEnd)));
  // Shrinks into the slot beside the big image (kc = i + 1 → rightmost)…
  if (p < shrinkEnd) {
    return lerpRect(g.slot, parkedRect(i, i + 1, g), ease(seg(p, shrinkStart, shrinkEnd)));
  }
  // …then slides one slot left each time a later image joins the row.
  if (p < FINAL_START) return parkedRect(i, parkedCount(p), g);
  return lerpRect(parkedRect(i, N - 1, g), tile, ease(seg(p, FINAL_START, 1)));
}

/**
 * A phone's caption: the lines belonging to ONE image, standing above it.
 *
 * On a wide screen the captions are a single stack set across the big image
 * (<SequenceCaptions>), because there is room for seven lines at once. A phone
 * has no such room, so each caption instead belongs to its picture and travels
 * with it — full strength above the big image in the middle of the page, then
 * down to the pile with it, dimmed, still standing over it.
 *
 * Positioned from the same `rectFor` the image itself uses, so the two cannot
 * come apart: the caption is bottom-anchored to the image's top edge, which
 * means a pair grows upwards and a single line sits just above the picture
 * either way.
 */
function PiledCaption({
  index,
  progress,
  geoTick,
  geo,
  capSize,
}: {
  index: number;
  progress: MotionValue<number>;
  geoTick: MotionValue<number>;
  geo: React.MutableRefObject<Geometry>;
  /** The caption type size, published by the geometry loop. */
  capSize: MotionValue<number>;
}) {
  const lines = captionGroups[index] ?? [];
  const base = linesBefore(index);

  /** How far the picture has gone from full size to parked: 0 while it is up,
   *  1 once it has lain down. The caption dims across the same window, so word
   *  and picture settle together. */
  const travel = (p: number) => ease(seg(p, SWAP[index], P[index + 2]));

  /**
   * The caption has two homes and travels between them as its picture lies
   * down.
   *
   * While the picture is EXPANDED it stands in the gap over it — the band
   * between the fixed header and the picture's top edge — centred in that gap
   * both ways, so it reads as a title over the photograph rather than crowding
   * its edge. Once the picture has PARKED the caption sits on it, centred in
   * the strip, which is the only place left for it once the five strips share
   * the screen with nothing between them.
   */
  const left = useTransform([progress, geoTick], ([p]: number[]) =>
    lerp(0, rectFor(index, p, geo.current).left, travel(p)),
  );
  const width = useTransform([progress, geoTick], ([p]: number[]) =>
    lerp(window.innerWidth, rectFor(index, p, geo.current).w, travel(p)),
  );
  const top = useTransform([progress, geoTick], ([p]: number[]) => {
    const g = geo.current;
    const blockH = lines.length * g.captionSize * CAPTION_LINE;
    const rect = rectFor(index, p, g);
    const inGap = HEADER_H + (rect.top - HEADER_H - blockH) / 2;
    const onStrip = rect.top + (rect.h - blockH) / 2;
    return lerp(inGap, onStrip, travel(p));
  });
  const fontSize = capSize;
  // Full strength while the picture is up, settling as it shrinks away.
  const opacity = useTransform(progress, (p) => lerp(1, PARKED_TEXT_OPACITY, travel(p)));

  return (
    <motion.div
      aria-hidden
      style={{ top, left, width, opacity }}
      className="pointer-events-none absolute flex flex-col items-center"
    >
      {lines.map((line, j) => (
        <PiledCaptionLine
          key={line}
          text={line}
          row={base + j}
          progress={progress}
          fontSize={fontSize}
        />
      ))}
    </motion.div>
  );
}

/** One of those lines, uncovered by the scroll rather than by a clock. */
function PiledCaptionLine({
  text,
  row,
  progress,
  fontSize,
}: {
  text: string;
  row: number;
  progress: MotionValue<number>;
  fontSize: MotionValue<number>;
}) {
  const clipPath = useTransform(progress, (p) => {
    const t = seg(p, captionArrivals[row], captionArrivals[row] + REVEAL_SPAN);
    return `inset(0 ${(1 - t) * 100}% 0 0)`;
  });
  return (
    <motion.p
      style={{ fontSize, clipPath, color: captionColor(text), lineHeight: CAPTION_LINE }}
      className={`${montserrat.className} m-0 whitespace-nowrap text-center uppercase tracking-[0.02em]`}
    >
      {text}
    </motion.p>
  );
}

export function HeroImageSequence() {
  const progress = useMotionValue(0);
  const geoTick = useMotionValue(0);
  const geo = useRef<Geometry>({
    ball: emptyRect(),
    slot: emptyRect(),
    thumb: emptyRect(),
    tiles: [],
    parked: { w: 0, h: 0, r: PARKED_RADIUS, gap: ROW_ITEM_GAP },
    piled: false,
    pileTop: 0,
    captionSize: 0,
  });

  // The big image's live rect, published so the caption stack can be set across
  // it and sized to it without re-rendering React.
  const bigTop = useMotionValue(0);
  const bigLeft = useMotionValue(0);
  const bigW = useMotionValue(0);
  const bigH = useMotionValue(0);
  // The phone caption's type size, published the same way. Read through a
  // transform of `geo` instead and it comes out stale: it is the one value on
  // this stage that does not change every frame, so a transform has nothing to
  // recompute it against and keeps whatever the very first geometry pass —
  // taken before the logo has docked — happened to produce.
  const capSize = useMotionValue(0);

  // How wide the longest caption actually sets, in ems of its own size.
  // Measured, not estimated: a per-character constant is a guess about metrics
  // only the browser knows, and getting it wrong here either runs the type off
  // the screen or leaves it needlessly small. Re-read once the webfont has
  // loaded, since the first measurement is of the fallback face.
  const capEm = useRef(LONGEST_CAPTION.length * 0.68);
  const capProbe = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const el = capProbe.current;
    if (!el) return;
    const measure = () => {
      const w = el.getBoundingClientRect().width;
      if (w > 0) capEm.current = w / CAPTION_PROBE_PX;
    };
    measure();
    document.fonts?.ready.then(measure).catch(() => {});
  }, []);
  // True the moment the fifth image reaches its tile — from here the five are
  // the tiles, and clickable.
  const [landed, setLanded] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setSelectedId(selectedTile.get());
    return selectedTile.on('change', (v) => setSelectedId(v as string | null));
  }, []);

  // Last frame's answers, kept only so React is told when one of them actually
  // changes — the scroll itself is read every frame and drives the motion
  // values directly, without a render.
  const run = useRef({
    eff: 0,
    landed: false,
    piled: false,
    autoScroll: false,
    blur: 0,
    /** Last frame's scroll position — what says which way the page is going. */
    prevY: 0,
    /** The landing brake: loaded by being past the landing, spent by firing. */
    brakeArmed: false,
    brakeUntil: 0,
  });
  // Which caption arrangement is in force — one stack across the big image, or
  // one caption per picture travelling with it. Mirrors the same measurement
  // the geometry makes, so the two can never disagree about it.
  const [piled, setPiled] = useState(false);
  // How far a phone's landed tile is blurred, in px. Zero everywhere else,
  // which is also what says "don't soften these at all". React state rather
  // than a motion value because it changes on a resize and at no other time,
  // and because it is a plain CSS transition rather than a scrubbed one.
  const [tileBlur, setTileBlur] = useState(0);

  // The height everything here is measured against, held still while a phone
  // slides its chrome. Mirrored into a ref so the rAF loop below reads the
  // current value without having to re-subscribe its listeners.
  const heldVh = useHeldViewportHeight();
  const heldVhRef = useRef(heldVh);
  heldVhRef.current = heldVh;

  useEffect(() => {
    let raf = 0;

    const update = () => {
      raf = 0;
      const vw = window.innerWidth;
      // Held, not read fresh: every pixel the phone's bar takes would otherwise
      // re-lay-out the sequence mid-scroll — the big image resizing and the
      // parked row shuffling under your thumb.
      const vh = heldVhRef.current || window.innerHeight;

      // --- Geometry --------------------------------------------------------
      const logo = document.querySelector<HTMLElement>('[data-hero-logo]');
      const logoBottom = logo ? logo.getBoundingClientRect().bottom : vh * 0.58;

      const topMin = Math.max(16, logoBottom + LOGO_GAP);
      const band = Math.max(120, vh - BOTTOM_MARGIN - topMin);

      let slotH = band;
      let slotW = slotH * ASPECT;

      // The big image is centred on the page, so both gutters are the same
      // (vw - slotW)/2 — and two things have to live in them. Right: the
      // incoming thumbnail. Left: the parked row, which at its widest holds
      // N-1 images (the fifth never parks, it flies straight to its tile) plus
      // the gaps between them and the one against the big image.
      // Both limits are solved for slotW in closed form.
      const maxWThumb = (vw / 2 - SIDE_MARGIN - THUMB_GAP) / (0.5 + THUMB);
      const rowGaps = (N - 1) * ROW_ITEM_GAP;
      const maxWRow =
        (vw - 2 * SIDE_MARGIN - 2 * rowGaps) / (1 + 2 * (N - 1) * PARKED);
      const maxW = Math.max(120, Math.min(maxWThumb, maxWRow));
      if (slotW > maxW) {
        slotW = maxW;
        slotH = slotW / ASPECT;
      }

      const mobile = vw < MOBILE_MAX;
      let parkedW = slotW * PARKED;
      let parkedGap = ROW_ITEM_GAP;
      let radius = RADIUS;
      if (mobile) {
        radius = RADIUS * MOBILE_RADIUS_SCALE;
        parkedGap = MOBILE_ROW_GAP;
        // As large as the screen allows: the width, or the band if the 3:4 of
        // it would be taller. No room is set aside for the pile any more — the
        // big image grows in the MIDDLE of the page and the pile forms at the
        // top, so the two are laid out independently.
        slotW = Math.max(120, Math.min(vw - 2 * MOBILE_SIDE_MARGIN, band * ASPECT));
        slotH = slotW / ASPECT;
        // Full width, and only the height given up.
        parkedW = slotW;
      }
      // Phone captions. Sized off the big image's width so the longest line
      // clears it.
      const captionSize = mobile
        ? Math.min(slotW * CAPTION_SIZE, (vw * CAPTION_SCREEN_FILL) / capEm.current)
        : 0;
      capSize.set(captionSize);

      // A phone's five strips share the whole band between them — the pile
      // fills the screen from under the header to where the footer starts,
      // with only a hairline between one strip and the next. Their height is
      // therefore whatever is left over divided five ways, not a ratio of
      // their width: the screen decides it, not the picture.
      // Nothing is reserved above the strips any more: a caption ends up ON
      // its own picture rather than over the one above, so the five share the
      // whole band between them with only a hairline in between.
      const parkedH = mobile
        ? Math.max(24, (band - (N - 1) * parkedGap) / N)
        : parkedW / ASPECT;

      // Centred in what is left below the logo — on a phone that is the middle
      // of the page, which is where the image grows to and shrinks back from.
      // On a wide screen it does the same job of stopping a width clamp from
      // leaving the image hanging off the top of a tall band of dead space.
      const top = topMin + Math.max(0, (band - slotH) / 2);
      const slot: Rect = { top, left: (vw - slotW) / 2, w: slotW, h: slotH, r: radius };
      bigTop.set(slot.top);
      bigLeft.set(slot.left);
      bigW.set(slot.w);
      bigH.set(slot.h);

      const tw = slotW * THUMB;
      const th = slotH * THUMB;
      const thumb: Rect = {
        top: top + slotH - th,
        left: slot.left + slotW + THUMB_GAP,
        w: tw,
        h: th,
        r: radius * THUMB,
      };

      // The parked row needs no precomputation — it is derived from `slot`,
      // which it hangs off the left edge of (see parkedRect).
      const tileEls = document.querySelectorAll<HTMLElement>('[data-main-tile]');
      const tiles: Rect[] = Array.from(tileEls).map((el) => {
        const r = el.getBoundingClientRect();
        return { top: r.top, left: r.left, w: r.width, h: r.height, r: TILE_RADIUS };
      });

      geo.current = {
        ball: { top: vh - 56 - BALL / 2, left: vw / 2 - BALL / 2, w: BALL, h: BALL, r: BALL / 2 },
        slot,
        thumb,
        tiles,
        parked: {
          w: parkedW,
          h: parkedH,
          r: mobile ? PARKED_RADIUS * MOBILE_RADIUS_SCALE : PARKED_RADIUS,
          gap: parkedGap,
        },
        piled: mobile,
        pileTop: topMin,
        captionSize,
      };

      // --- Progress, with holds -------------------------------------------
      // The sequence must finish while the tiles are on screen, so progress
      // ends where they are — which also leaves the page a couple of hundred
      // pixels of scroll to spare, so the landing can never be stranded just
      // short of the bottom.
      let end = RUNWAY_VH * vh;
      if (tiles.length) {
        const tileDocTop = window.scrollY + tiles[0].top;
        end = Math.max(vh * 0.5, tileDocTop - vh * 0.5);

        if (mobile) {
          // A phone's five tiles are one column a whole screen tall, so half a
          // screen of clearance put the landing halfway down them: the bottom
          // two arrived below the fold — lit, titled, clickable and invisible.
          // The landing is the column FRAMED instead, its top edge just under
          // the fixed chrome, so all five are on the screen at the moment the
          // sequence ends.
          end = Math.max(vh * 0.5, tileDocTop - HEADER_H);
        } else {
          // Where <MainLayout> gives the tile row a screen-tall band to sit in
          // the middle of, the landing is simply that band filling the screen:
          // stop on its top edge and the arrangement it lays out — header,
          // equal air, tiles, equal air, footer — is what the sequence resolves
          // into.
          //
          // Only when the band is CLOSED. A band with a gallery open is a whole
          // screen tall too, and for a reason that has nothing to do with
          // centring — so measuring the height alone moved the finish line the
          // instant a tile was tapped, which un-landed the tiles and closed the
          // gallery again a few frames later.
          const bandEl = document.getElementById(WORK_ANCHOR);
          const bandRect =
            bandEl?.dataset.tileBand === 'closed' ? bandEl.getBoundingClientRect() : null;
          if (bandRect && bandRect.height >= vh - 1) {
            end = Math.max(vh * 0.5, window.scrollY + bandRect.top);
          }
        }
      }

      const s = run.current;
      if (mobile !== s.piled) {
        s.piled = mobile;
        setPiled(mobile);
      }
      const blur = mobile && tiles.length ? MOBILE_TILE_BLUR_PX : 0;
      if (blur !== s.blur) {
        s.blur = blur;
        setTileBlur(blur);
      }

      // Progress IS the scroll position, and nothing else. Because it is a pure
      // function of `y`, scrolling up walks the images backwards and scrolling
      // down resumes from precisely the same frame — no accumulated error
      // either way, no state to get out of step, and no moment at which the
      // page is doing something the hand on the wheel did not ask for.
      const rawY = window.scrollY;
      let y = rawY;

      // --- A brake on the way back up --------------------------------------
      // On the frame the images become tiles, and only when that frame is
      // reached from BELOW — coming back up the page rather than arriving at
      // the end of the sequence. The scroll is set down on the landing and held
      // there for a moment, which is enough to stop a fling dead; push on and
      // it lets go, and the sequence runs backwards from exactly where it
      // stopped. See LANDING_BRAKE_MS.
      //
      // It arms by being past the landing and disarms by firing, so it happens
      // once per journey up and cannot become a wall the visitor has to fight
      // through twice.
      const now = performance.now();
      const holding = now < s.brakeUntil;
      const crossing = s.brakeArmed && tiles.length > 0 && rawY < end && s.prevY >= end;
      if (crossing) {
        s.brakeArmed = false;
        s.brakeUntil = now + LANDING_BRAKE_MS;
      }
      if ((crossing || holding) && rawY < end) {
        window.scrollTo(0, end);
        y = end;
      } else if (!holding && rawY > end + LANDING_SLACK) {
        s.brakeArmed = true;
      }

      s.eff = Math.min(1, Math.max(0, y / end));
      // …with the last few pixels of it called finished. See LANDING_SLACK: a
      // smooth scroll stops where the browser leaves it, and a landing a
      // fraction of a pixel short is a landing with nothing clickable on it.
      if (end - y <= LANDING_SLACK) s.eff = 1;
      s.prevY = y;

      progress.set(s.eff);
      geoTick.set(geoTick.get() + 1);

      // --- The phone's last beat scrolls itself ----------------------------
      // The tile column fills the screen on a phone, and the sequence's own
      // pile sits higher up the page than the column does — so at the moment
      // the last picture starts to shrink, the visitor is watching five images
      // set off for a place they cannot see. From here the page finishes the
      // journey itself.
      //
      // It is not a jump past anything. Progress IS the scroll, so this glide
      // plays the last beat out exactly as a thumb would: the pictures fly, the
      // titles come up, and it stops on the frame the sequence ends on. A hand
      // on the screen interrupts it, as it interrupts any smooth scroll.
      if (mobile) {
        if (s.eff < AUTOSCROLL_REARM) s.autoScroll = true;
        else if (s.autoScroll && s.eff >= FINAL_START && y < end - LANDING_SLACK) {
          s.autoScroll = false;
          window.scrollTo({ top: end, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
        }
      } else {
        s.autoScroll = false;
      }

      // The images only become tiles once the fifth is actually home — and stop
      // being tiles again if the sequence is scrolled back off the end.
      const home = s.eff >= 1;
      if (home !== s.landed) {
        s.landed = home;
        setLanded(home);
        if (!home) selectedTile.set(null);
        // Nothing else happens here. A phone used to be scrolled to bring the
        // tile grid into view at this moment, from back when the tiles stacked
        // three rows deep and landed half off-screen. They fill the screen on
        // their own now, so that scroll had nothing left to correct — it just
        // carried the page past the landing and let it snap back, which read as
        // the whole page lurching down and the tiles jumping into place.
      }

    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    // No wheel or touch handler any more: the sequence never drives the page,
    // so there is no scroll of its own to defend against the visitor's.
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', update);
    };
  }, [progress, geoTick, bigTop, bigLeft, bigW, bigH, capSize]);

  return (
    <>
      {/* Scroll runway — gives the sequence its length, and three quarters of
          the page's height with it. Pinned to the held viewport in px once
          mounted, so a phone sliding its chrome cannot change how long the page
          is; `svh` covers the first paint, before there is a measurement. */}
      <div
        aria-hidden
        className="relative"
        style={{ height: heldVh ? `${RUNWAY_VH * heldVh}px` : `${RUNWAY_VH * 100}svh` }}
      />

      {/* Off-screen, at a known size, in the same face and tracking as the
          captions: what their size is solved against. */}
      <span
        ref={capProbe}
        aria-hidden
        style={{ position: 'fixed', left: -99999, top: 0, fontSize: CAPTION_PROBE_PX }}
        className={`${montserrat.className} whitespace-nowrap uppercase tracking-[0.02em]`}
      >
        {LONGEST_CAPTION}
      </span>

      {/* Fixed stage. pointer-events-none so it never blocks the page — each
          image opts back in for itself once it has landed and become a tile. */}
      <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
        {heroSequenceImages.map((img, i) => (
          <SequenceImage
            key={img.label}
            image={img}
            tile={mainTiles[i]}
            index={i}
            progress={progress}
            geoTick={geoTick}
            geo={geo}
            landed={landed}
            selectedId={selectedId}
            softenPx={tileBlur}
          />
        ))}

        {/* A phone's captions ride with their pictures, so they live on the
            same stage the pictures do — above them in paint order, since they
            are declared after. */}
        {piled &&
          heroSequenceImages.map((img, i) => (
            <PiledCaption
              key={`caption-${img.label}`}
              index={i}
              progress={progress}
              geoTick={geoTick}
              geo={geo}
              capSize={capSize}
            />
          ))}
      </div>

      {/* …and a wide screen's are one stack across the big image, where there
          is room to hold all seven lines at once. */}
      {!piled && (
        <SequenceCaptions
          progress={progress}
          slotTop={bigTop}
          slotLeft={bigLeft}
          slotW={bigW}
          slotH={bigH}
        />
      )}
    </>
  );
}

function SequenceImage({
  image,
  tile,
  index,
  progress,
  geoTick,
  geo,
  landed,
  selectedId,
  softenPx,
}: {
  image: HeroSequenceImage;
  /** The tile this image becomes when it lands — its title and gallery. */
  tile: { id: string; title: string };
  index: number;
  progress: MotionValue<number>;
  geoTick: MotionValue<number>;
  geo: React.MutableRefObject<Geometry>;
  /** True once the flight is home — the image settles to 90% and is a tile. */
  landed: boolean;
  selectedId: string | null;
  /** How far to blur the landed picture, in px. 0 on a wide screen, where the
   *  tiles are photographs rather than a ground for their titles. */
  softenPx: number;
}) {
  // Every transform reads the ROOT motion values directly — chaining a derived
  // motion value into the array form of useTransform silently freezes it.
  // `geoTick` is included so a resize re-runs these without a scroll.
  const top = useTransform([progress, geoTick], ([p]: number[]) => rectFor(index, p, geo.current).top);
  const left = useTransform([progress, geoTick], ([p]: number[]) => rectFor(index, p, geo.current).left);
  const width = useTransform([progress, geoTick], ([p]: number[]) => rectFor(index, p, geo.current).w);
  const height = useTransform([progress, geoTick], ([p]: number[]) => rectFor(index, p, geo.current).h);
  const borderRadius = useTransform(
    [progress, geoTick],
    ([p]: number[]) => `${rectFor(index, p, geo.current).r}px`,
  );

  // The first image waits for the ball to switch off; later ones appear just
  // before their grow window so they are already parked beside the big one.
  // Nothing fades out at the end — the image simply becomes its tile.
  //
  // Once it has shrunk it also dims: a finished image is a marker of where the
  // sequence has been. It brightens back to full over the flight to its tile,
  // where it has to read as a photograph again. The last image never parks —
  // its shrink IS that flight — so it never dims.
  const appearAt = index === 0 ? BALL_HANDOFF : P[index] - 0.05;
  const opacity = useTransform(progress, (p) => {
    const shown = Math.min(1, Math.max(0, (p - appearAt) / 0.014));
    if (index === N - 1) return shown;
    const dimmed = lerp(1, PARKED_OPACITY, ease(seg(p, SWAP[index], P[index + 2])));
    return shown * lerp(dimmed, 1, ease(seg(p, FINAL_START, 1)));
  });

  // A clip runs only while its slot is at full size: from the frame the growth
  // finishes — which is also where the sequence pauses, so it plays under its
  // own caption — until the slot has shrunk away again. By then the pair has
  // turned over to its second face and the clip is behind it, playing to
  // nobody. State rather than a transform because it drives an imperative
  // play/pause, and it only changes twice in the whole sequence.
  // A clip runs on the scroll like everything else. Its window is the stretch
  // in which it is actually the face you can see: from the frame the slot
  // reaches full size — which is also the frame its caption starts writing
  // itself — to the frame the slot turns over, after which the clip is behind
  // a photograph. The whole clip is spent across that stretch.
  const hasClip = /\.mp4$/i.test(image.src);
  const window_ = clipWindow(index);
  const clipScrub = useTransform(progress, (p) =>
    window_ ? seg(p, window_[0], window_[1]) : 0,
  );

  // A slot with two faces turns over where its group's second caption arrives,
  // so the picture changes with the word. Read from the scroll rather than
  // signalled by the captions — both are now functions of the same number, and
  // one of them asking the other would only be a way for them to disagree.
  // Not sticky: scroll back and it turns face-up again, exactly as the caption
  // that cued it goes away again.
  const flipAt = FLIP_AT[index];
  const [flipped, setFlipped] = useState(false);
  useEffect(() => {
    if (flipAt == null) return;
    const check = (p: number) => setFlipped(p >= flipAt);
    check(progress.get());
    return progress.on('change', check);
  }, [flipAt, progress]);

  const isSelected = landed && selectedId === tile.id;
  const isOther = landed && selectedId !== null && !isSelected;
  // The settle to 90% and the selection response are the same transform, so
  // they multiply rather than fight each other.
  const scale = landed
    ? FINAL_SCALE * (isSelected ? SELECTED_SCALE : isOther ? UNSELECTED_SCALE : 1)
    : 1;
  /** Only once it IS a tile, and only where tiles are a ground for their
   *  titles. Mid-flight it is still a photograph and stays one. */
  const softened = landed && softenPx > 0;

  return (
    <motion.div
      className="absolute overflow-hidden bg-black"
      // `scale` is a transform, so it settles the image about its own centre
      // without touching the rect the flight animation is driving.
      initial={false}
      animate={{ scale }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      style={{
        top,
        left,
        width,
        height,
        borderRadius,
        opacity,
        zIndex: isSelected ? 2 : 1,
        pointerEvents: landed ? 'auto' : 'none',
        willChange: 'top, left, width, height',
      }}
    >
      <button
        type="button"
        // Marks this as a tile for <MainLayout>'s click-outside handler.
        data-sequence-tile
        aria-hidden={!landed}
        tabIndex={landed ? 0 : -1}
        aria-pressed={isSelected}
        onClick={() => selectedTile.set(isSelected ? null : tile.id)}
        className="relative block h-full w-full cursor-pointer text-left outline-none"
      >
        {/* The picture, and only the picture. Its own wrapper so a phone can
            hold it back and put it behind glass once it is a tile, without the
            scrim, the title or the selection ring going soft with it. Scaled up
            underneath so the blur's faded edge falls outside the crop rather
            than eating the tile's corners. */}
        <span
          className="absolute inset-0 block transition-[opacity,filter] duration-500"
          style={
            softened
              ? {
                  opacity: MOBILE_TILE_OPACITY,
                  filter: `blur(${softenPx}px)`,
                  transform: `scale(${MOBILE_TILE_OVERSCAN})`,
                }
              : undefined
          }
        >
          {/* A slot with a second face turns over to reveal it. The two are the
              faces of one card: `preserve-3d` on the turning element and
              `backface-hidden` on each, so exactly one is ever showing and the
              edge sweeps through as it goes. A slot without a back is the same
              markup with nothing behind it, and never turns. */}
          <span
            className="absolute inset-0 block [perspective:1400px]"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <motion.span
              className="absolute inset-0 block"
              initial={false}
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ duration: FLIP_MS / 1000, ease: [0.65, 0, 0.35, 1] }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <span className="absolute inset-0 block [backface-visibility:hidden]">
                <SlotFace
                  src={image.src}
                  poster={image.poster}
                  alt={image.alt}
                  scrub={hasClip ? clipScrub : null}
                />
              </span>
              {image.back && (
                <span
                  className="absolute inset-0 block [backface-visibility:hidden]"
                  style={{ transform: 'rotateY(180deg)' }}
                >
                  <SlotFace src={image.back} alt={image.backAlt ?? image.alt} />
                </span>
              )}
            </motion.span>
          </span>
        </span>
        {/* Scrim + title: the tile's furniture, faded in only once it IS a
            tile, so the flight itself stays a clean photograph.

            Not where the picture is already softened, though. The scrim is
            there to hold a photograph back far enough for a title to sit on it,
            which is precisely what the blur and the 40% do — laying both on
            leaves a tile that is 8% photograph and 92% black, and the picture
            may as well not be there. One or the other, never both. */}
        {!softened && (
          <span
            aria-hidden
            className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/25 transition-opacity duration-500 ${
              landed ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}
        {isSelected && (
          <span aria-hidden className="absolute inset-0 ring-2 ring-inset ring-white/40" />
        )}
        {/* On a phone the title is centred across its strip — the strips are
            wide and shallow there, and a line hung on the left edge of one
            reads as a caption rather than as the tile's name. From `sm` up the
            tiles are portraits again and it goes back to the bottom left. */}
        <span
          className={`absolute inset-0 flex flex-col items-center justify-end p-4 text-center transition-opacity duration-500 sm:items-stretch sm:text-left ${
            landed ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <h3
            className={`${bebas.className} hyphens-auto break-words text-[2.4375rem] uppercase leading-[0.86] text-white/70 sm:text-[2.925rem]`}
          >
            {tile.title}
          </h3>
        </span>
      </button>
    </motion.div>
  );
}
