'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Bebas_Neue } from 'next/font/google';
import { motion, useMotionValue, useTransform, type MotionValue } from 'framer-motion';
import { heroSequenceImages, type HeroSequenceImage } from '@/content/heroSequence';
import { mainTiles } from '@/content/mainTiles';
import { captionGroups } from '@/content/sequenceCaptions';
import { logoDockEnd, selectedTile } from '@/lib/heroSequenceState';
import { introAlreadyPlayed } from '@/lib/introPlayed';
import { WORK_HASH } from '@/lib/anchors';
import { useHeldViewportHeight } from '@/lib/useHeldViewportHeight';
import { SequenceCaptions } from './SequenceCaptions';

const bebas = Bebas_Neue({ subsets: ['latin', 'latin-ext'], weight: '400' });

/* ================================================================
   Scroll-driven hero image sequence.

   The bouncing ball becomes a rounded image that grows to fill the stage —
   centred on the page. Each time an image reaches full size the sequence HOLDS
   while its caption types itself in across the page; the caption then rises to
   the top edge of the big image, dims, and STAYS, the next one landing beneath
   it, so the five titles build into a list. Finished images shrink to 15%,
   dim to 25% and park in a row to the left, their tops flush with the top of
   the big image. When the fifth image starts to shrink, all five fly to the
   exact rects laid out by <MainTiles> — brightening back to full on the way —
   and on arrival they BECOME the tiles: each settles to 95%, takes its title,
   and turns into a button that opens its projects gallery. The caption stack
   dissolves over that same flight, since the tiles carry those titles now.

   Progress is MAPPED from the scroll position, not integrated from deltas, so
   the images scrub cleanly in both directions: scrolling up runs the sequence
   backwards, and scrolling down picks it up from exactly where it left off.
   (Integrating deltas can't do that — a scroll up that doesn't rewind still
   has to be re-scrolled, and the sequence drifts out of step with the page.)
   The captions come and go with the scroll too; the one-shot parts are the
   pause at each hold and the captions' type-in effect, both of which happen
   once per page load and never again. Nothing starts until the hero logo has
   finished docking — the first hold point falls inside that dock.
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
/** On a phone the big image runs at twice the size the gutters would allow,
 *  and the corners come in to 40% of their radius — 34px of rounding reads as
 *  a squircle at that scale. The parked images keep their size and only lose
 *  the rounding. */
const MOBILE_SLOT_SCALE = 2;
const MOBILE_RADIUS_SCALE = 0.4;
/** On a phone the parked images shrink to whatever makes all four fit beside
 *  the doubled big image, and the spacing between them halves. */
const MOBILE_ROW_GAP = ROW_ITEM_GAP / 2;
const MOBILE_SIDE_MARGIN = 12;
/** Never shrink a parked image past this — below it there is nothing to see. */
const MIN_PARKED = 8;
/** Clearance kept around the tile grid when it is scrolled into view. */
const TILES_MARGIN = 16;
/** Scroll runway, in viewport heights. */
export const RUNWAY_VH = 3;
/** Progress at which the first image takes over from the bouncing ball. */
const BALL_HANDOFF = 0.005;
/** A caption line's type-in, and the beat it stands at full strength before the
 *  next one starts under it. */
export const TYPE_MS = 3000;
export const CAPTION_DWELL_MS = 1000;

/**
 * How long the page pauses at image `i` — long enough for every line that image
 * carries to type itself in, with the beat between a pair, and a moment over so
 * the last one can be read before the page moves on.
 */
function holdFor(i: number): number {
  const lines = captionGroups[i]?.length ?? 1;
  return lines * TYPE_MS + (lines - 1) * CAPTION_DWELL_MS + 200;
}
/** Once landed, each image settles from 100% to 95% of its tile. */
const FINAL_SCALE = 0.95;
/** Selection, once the images are tiles: picked grows 5%, the rest shrink 5%. */
const SELECTED_SCALE = 1.05;
const UNSELECTED_SCALE = 0.95;

const N = heroSequenceImages.length; // 5

/**
 * Phase boundaries. Image i grows across [P[i], P[i+1]] and shrinks across
 * [P[i+1], P[i+2]], so the last image's shrink is the final phase — which is
 * exactly when every image flies to its MainTile.
 */
const P = [0, 0.18, 0.34, 0.5, 0.66, 0.82, 1] as const;
const FINAL_START = P[N]; // 0.82 — the fifth image begins to shrink
/** The sequence pauses at each of these — one per fully-grown image. */
const HOLD_POINTS = [P[1], P[2], P[3], P[4], P[5]];
/** What a finished image dims to once it has shrunk into the parked row — it is
 *  a marker of where the sequence has been, not something to look at. Full
 *  again by the time it lands on its tile. */
const PARKED_OPACITY = 0.25;
/** How long a two-faced slot takes to turn over. */
const FLIP_MS = 900;

/** One face of a slot: a still, or a silent clip played in its place. */
function SlotFace({ src, poster, alt }: { src: string; poster?: string; alt: string }) {
  if (/\.mp4$/i.test(src)) {
    return (
      <video
        src={src}
        poster={poster}
        // It has to start on its own, so it is muted — the only way a browser
        // will allow that — and it loops, because the slot outlives the clip.
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-label={alt}
        className="absolute inset-0 h-full w-full object-cover"
      />
    );
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
  /** Size, rounding and spacing of a parked image. Carried separately because
   *  on a phone the slot grows while these shrink to fit beside it. */
  parked: { w: number; h: number; r: number; gap: number };
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
  const fromRight = kc - 1 - i;
  const right = g.slot.left - gap - fromRight * (w + gap);
  return { top: g.slot.top, left: right - w, w, h, r };
}

/** How many images have parked at progress `p` — fractional exactly while one
 *  is shrinking, so the row shuffles in step with it. */
function parkedCount(p: number): number {
  for (let j = 0; j < N - 1; j += 1) {
    if (p < P[j + 2]) return j + ease(seg(p, P[j + 1], P[j + 2]));
  }
  return N - 1;
}

/**
 * The rect an image occupies at progress `p`:
 *   waiting → slot → the row beside the big image → its tile
 * The last image skips the row: its shrink IS the final flight.
 */
function rectFor(i: number, p: number, g: Geometry): Rect {
  const growStart = P[i];
  const growEnd = P[i + 1];
  const shrinkStart = P[i + 1];
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

export function HeroImageSequence() {
  const progress = useMotionValue(0);
  const geoTick = useMotionValue(0);
  const geo = useRef<Geometry>({
    ball: emptyRect(),
    slot: emptyRect(),
    thumb: emptyRect(),
    tiles: [],
    parked: { w: 0, h: 0, r: PARKED_RADIUS, gap: ROW_ITEM_GAP },
  });

  // Caption state. Each image adds its line — or its pair — to a list set
  // across the big image, and nothing is taken away, so `captionIndex` is the
  // newest group rather than the only one.
  const [captionIndex, setCaptionIndex] = useState(-1);
  // True once the last image has begun to shrink: the cue for the whole caption
  // stack to fade away, over two seconds.
  const [captionsDone, setCaptionsDone] = useState(false);
  // Which slots have turned over to their second face. Driven by the captions:
  // a slot turns when its group moves to its second line, so the picture and
  // the word can never disagree. Sticky, like the type-in — scrolling back
  // does not turn it face-up again, since the caption stays too.
  const [flipped, setFlipped] = useState<boolean[]>(() => heroSequenceImages.map(() => false));
  const flipSlot = useCallback((i: number) => {
    setFlipped((prev) => (prev[i] ? prev : prev.map((v, k) => (k === i ? true : v))));
  }, []);
  // The big image's live rect, published so the caption stack can be set across
  // it and sized to it without re-rendering React.
  const bigTop = useMotionValue(0);
  const bigLeft = useMotionValue(0);
  const bigW = useMotionValue(0);
  const bigH = useMotionValue(0);
  // True the moment the fifth image reaches its tile — from here the five are
  // the tiles, and clickable.
  const [landed, setLanded] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setSelectedId(selectedTile.get());
    return selectedTile.on('change', (v) => setSelectedId(v as string | null));
  }, []);

  // `eff` is last frame's progress, kept only to spot a hold being crossed;
  // `nextHold` never goes back, which is what makes the pauses one-shot;
  // `lockY` is the scroll position the page is pinned to during a hold.
  const run = useRef({
    eff: 0,
    holdUntil: 0,
    nextHold: 0,
    lockY: 0,
    landed: false,
    caption: -1,
    finishing: false,
    finalEff: 1,
  });

  // The height everything here is measured against, held still while a phone
  // slides its chrome. Mirrored into a ref so the rAF loop below reads the
  // current value without having to re-subscribe its listeners.
  const heldVh = useHeldViewportHeight();
  const heldVhRef = useRef(heldVh);
  heldVhRef.current = heldVh;

  useEffect(() => {
    let raf = 0;
    // The pause exists to give the caption's type-in room to play. On a repeat
    // load there is no type-in left, so there is nothing to wait for and the
    // sequence scrubs freely. Read once, on the client, where storage exists.
    const holdMs = introAlreadyPlayed() ? 0 : 1;

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
        // Doubled, but never wider than the screen or taller than the band.
        slotW = Math.min(slotW * MOBILE_SLOT_SCALE, vw - 2 * SIDE_MARGIN, band * ASPECT);
        slotH = slotW / ASPECT;
        // The doubled image leaves too little gutter for the row at its old
        // size, so size the parked images to the room that's actually left:
        // N-1 of them plus the gaps between them and the one against the big
        // image, inside the left gutter. Never larger than they'd be anyway.
        const gutter = (vw - slotW) / 2;
        const room = gutter - MOBILE_SIDE_MARGIN - (N - 1) * parkedGap;
        parkedW = Math.max(MIN_PARKED, Math.min(parkedW, room / (N - 1)));
      }
      const parkedH = parkedW / ASPECT;

      // Centred vertically in the band too, so a width clamp doesn't leave the
      // image hanging off the top of a tall band of dead space.
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
      };

      // --- Progress, with holds -------------------------------------------
      // The sequence must finish while the tiles are on screen, so progress
      // ends where they sit halfway down the viewport — which also leaves the
      // page a couple of hundred pixels of scroll to spare, so the landing can
      // never be stranded just short of the bottom.
      let end = RUNWAY_VH * vh;
      if (tiles.length) {
        const tileDocTop = window.scrollY + tiles[0].top;
        end = Math.max(vh * 0.5, tileDocTop - vh * 0.5);
      }

      const s = run.current;
      const now = performance.now();
      // The logo is home once the scroll has passed the dock's end. Zero until
      // <HeroExperience> has measured it, which reads as "already docked" —
      // the right answer for any page that has no hero logo to wait for.
      // The pixel of slack matters: the dock ends on a fractional scroll
      // position (70% of a viewport height) that an integer scroll can land
      // just short of, and the gate would then never open.
      const docked = window.scrollY >= logoDockEnd.get() - 1;

      // A WORK link lands on the tile row, which is past the end of the
      // sequence. The pauses exist to pace a scroll *through* it, and there was
      // none — left armed they would fire all five at once and pin the page at
      // the landing for as long as a caption takes to type. Read from the URL
      // rather than a `hashchange` listener: a same-page hash link is a
      // `pushState`, which does not fire that event.
      if (s.nextHold < HOLD_POINTS.length && window.location.hash === WORK_HASH) {
        s.nextHold = HOLD_POINTS.length;
        s.holdUntil = 0;
      }

      if (now < s.holdUntil) {
        // Held: the PAGE is pinned too, not just the sequence. Letting the page
        // scroll on during the pause would carry it past the whole
        // choreography while the images stood still. Pinning also means a hold
        // costs no scroll at all, which keeps the mapping below honest.
        if (window.scrollY !== s.lockY) window.scrollTo(0, s.lockY);
      } else {
        const y = window.scrollY;
        // Progress IS the scroll position. Because it's a pure function of `y`,
        // scrolling up walks the images backwards and scrolling down resumes
        // from precisely the same frame — no accumulated error either way.
        const p = Math.min(1, Math.max(0, y / end));

        // The PAUSE is the exception: it fires once per hold point, the first
        // time progress reaches it, so scrolling back up never re-pauses the
        // page. (The captions themselves are free to come and go — only their
        // type-in is one-shot, and that's latched inside <SequenceCaptions>.)
        // Nothing fires until the logo has finished docking: the first hold
        // point falls inside the dock, and a caption typing itself in while the
        // logo is still travelling is two animations over one moment. Held
        // back, it fires the instant the logo lands.
        if (docked) {
          while (s.nextHold < HOLD_POINTS.length && p >= HOLD_POINTS[s.nextHold]) {
            // An image carrying two lines is pinned for both of them.
            s.holdUntil = now + (holdMs ? holdFor(s.nextHold) : 0);
            s.lockY = y;
            s.nextHold += 1;
            // Where the last hold caught the page. The final shrink is any
            // progress past this, which is what the captions leave on.
            if (s.nextHold === HOLD_POINTS.length) s.finalEff = p;
          }
        }
        s.eff = p;
      }

      progress.set(s.eff);
      geoTick.set(geoTick.get() + 1);

      // Which caption is the newest tracks the scroll in both directions, the
      // same as the images: the last hold point reached owns the front of the
      // stack, and the ones before it stay parked above the image.
      let visible = -1;
      if (docked) {
        for (let i = 0; i < HOLD_POINTS.length; i += 1) {
          if (s.eff >= HOLD_POINTS[i]) visible = i;
        }
      }
      if (visible !== s.caption) {
        s.caption = visible;
        setCaptionIndex(visible);
      }
      // The last image starts to shrink when its own hold lets the page go
      // again — FINAL_START alone is not enough, because that progress is also
      // the fifth hold POINT, and the fade would start on the very frame the
      // last line began typing. Past the last hold, with the pause spent, is
      // the moment the shrink actually begins.
      const finishing =
        s.nextHold >= HOLD_POINTS.length && now >= s.holdUntil && s.eff > s.finalEff + 0.002;
      if (finishing !== s.finishing) {
        s.finishing = finishing;
        setCaptionsDone(finishing);
      }

      // The images only become tiles once the fifth is actually home — and stop
      // being tiles again if the sequence is scrolled back off the end.
      const home = s.eff >= 1;
      if (home !== s.landed) {
        s.landed = home;
        setLanded(home);
        if (!home) selectedTile.set(null);
        // On a phone the tiles stack three rows deep and land half off-screen,
        // so bring the whole grid into view. DOWN only: scrolling up would drop
        // progress back under 1, un-land the tiles and re-trigger this.
        else if (mobile && tiles.length) {
          const gridTop = window.scrollY + tiles[0].top;
          const last = tiles[tiles.length - 1];
          const gridH = last.top + last.h - tiles[0].top;
          const target =
            gridH + 2 * TILES_MARGIN <= vh
              ? gridTop - (vh - gridH) / 2 // fits: centre it
              : gridTop - TILES_MARGIN; // taller than the screen: top-align
          if (target > window.scrollY) {
            window.scrollTo({ top: target, behavior: 'smooth' });
          }
        }
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    // Swallow the input itself during a hold, so the browser never starts a
    // scroll we would have to snap back from (that fight is what reads as jank).
    const blockDuringHold = (e: Event) => {
      if (performance.now() < run.current.holdUntil) e.preventDefault();
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);
    window.addEventListener('wheel', blockDuringHold, { passive: false });
    window.addEventListener('touchmove', blockDuringHold, { passive: false });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', update);
      window.removeEventListener('wheel', blockDuringHold);
      window.removeEventListener('touchmove', blockDuringHold);
    };
  }, [progress, geoTick, bigTop, bigLeft, bigW, bigH]);

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
            flipped={flipped[i]}
          />
        ))}
      </div>

      <SequenceCaptions
        activeIndex={captionIndex}
        slotTop={bigTop}
        slotLeft={bigLeft}
        slotW={bigW}
        slotH={bigH}
        done={captionsDone}
        onAdvance={flipSlot}
      />
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
  flipped,
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
  /** True once this slot's caption has moved to its second line, which is the
   *  cue for the slot to turn over to its second face. */
  flipped: boolean;
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
    const dimmed = lerp(1, PARKED_OPACITY, ease(seg(p, P[index + 1], P[index + 2])));
    return shown * lerp(dimmed, 1, ease(seg(p, FINAL_START, 1)));
  });

  const isSelected = landed && selectedId === tile.id;
  const isOther = landed && selectedId !== null && !isSelected;
  // The settle to 90% and the selection response are the same transform, so
  // they multiply rather than fight each other.
  const scale = landed
    ? FINAL_SCALE * (isSelected ? SELECTED_SCALE : isOther ? UNSELECTED_SCALE : 1)
    : 1;

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
              <SlotFace src={image.src} poster={image.poster} alt={image.alt} />
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
        {/* Scrim + title: the tile's furniture, faded in only once it IS a
            tile, so the flight itself stays a clean photograph. */}
        <span
          aria-hidden
          className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/25 transition-opacity duration-500 ${
            landed ? 'opacity-100' : 'opacity-0'
          }`}
        />
        {isSelected && (
          <span aria-hidden className="absolute inset-0 ring-2 ring-inset ring-white/40" />
        )}
        <span
          className={`absolute inset-0 flex flex-col justify-end p-4 transition-opacity duration-500 ${
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
