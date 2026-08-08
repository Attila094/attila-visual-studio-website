'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bebas_Neue } from 'next/font/google';
import { animate, motion, useMotionValue, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { LogoDraw } from './LogoDraw';
import { useHeldViewportHeight } from '@/lib/useHeldViewportHeight';

const bebas = Bebas_Neue({ subsets: ['latin', 'latin-ext'], weight: '400' });

// Past this scroll position the docked logo becomes an active Home link.
const LINK_AT = 220;
// Fallback menu-bar centre, used only if the nav can't be measured.
const NAV_TOP = 20;

/* ================================================================
   PREVIEW SEQUENCE (click "VISUAL STUDIO" to play)
   ----------------------------------------------------------------
   A 40s, 4-segment showcase that plays over the resting hero: the
   centred title cross-fades through place-names while 5 placeholder
   tiles fade + scale in around it (staggered), then out. The faint
   15%-opacity logo behind the text acts as the backdrop watermark.

   Adjust everything here. Each media slot accepts:
     null / ""                         → labelled empty placeholder
     "path/photo.jpg"                  → auto <img>
     "path/clip.mp4"                   → auto <video> (muted, looped)
     { type:"video", src, poster }     → explicit control
     { type:"image", src, alt }        → explicit control
   Media order per segment = [tile-1 TL, tile-2 TR, tile-3 L,
   tile-4 BC, tile-5 R].
   ================================================================ */
type MediaEntry =
  | string
  | { type?: 'image' | 'video'; src: string; poster?: string; alt?: string }
  | null;

interface Segment {
  text: string;
  media: MediaEntry[];
}

const SEQUENCE: {
  idleText: string;
  segments: Segment[];
  timing: {
    segment: number;
    tileInDur: number;
    tileStagger: number;
    tileOutAt: number;
    tileOutDur: number;
    textFade: number;
    fadeFromOpacity: number;
    fadeToOpacity: number;
    scaleFrom: number;
    scaleTo: number;
  };
} = {
  idleText: 'VISUAL STUDIO',
  // Media order per segment = [tile-1 TL, tile-2 TR, tile-3 L, tile-4 BC,
  // tile-5 R]; assigned by aspect so each render fits its tile's shape.
  // Optimised WebP renders live in /public/projects/sequence/.
  segments: [
    {
      text: 'RÁD',
      media: [
        '/projects/sequence/rad-05.webp',
        '/projects/sequence/rad-02.webp',
        '/projects/sequence/rad-01.webp',
        '/projects/sequence/rad-04.webp',
        '/projects/sequence/rad-03.webp',
      ],
    },
    {
      text: 'HÉVÍZ',
      media: [
        '/projects/sequence/heviz-02.webp',
        '/projects/sequence/heviz-03.webp',
        '/projects/sequence/heviz-01.webp',
        '/projects/sequence/heviz-04.webp',
        '/projects/sequence/heviz-05.webp',
      ],
    },
    {
      // Helikon has 3 stills; reused across the 5 tiles (repeats not adjacent).
      text: 'HELIKON',
      media: [
        '/projects/sequence/helikon-01.webp',
        '/projects/sequence/helikon-03.webp',
        '/projects/sequence/helikon-02.webp',
        '/projects/sequence/helikon-01.webp',
        '/projects/sequence/helikon-03.webp',
      ],
    },
    {
      text: 'MISINA',
      media: [
        '/projects/sequence/misina-01.webp',
        '/projects/sequence/misina-04.webp',
        '/projects/sequence/misina-05.webp',
        '/projects/sequence/misina-02.webp',
        '/projects/sequence/misina-03.webp',
      ],
    },
  ],
  timing: {
    segment: 10, // seconds per segment (4 × 10 = 40s total)
    tileInDur: 1, // tile fade + scale-in duration
    tileStagger: 1.5, // delay between consecutive tiles appearing
    tileOutAt: 9, // when tiles begin leaving, within a segment
    tileOutDur: 1, // tile fade + scale-out duration
    textFade: 1.2, // full text cross-fade (out + in)
    // Tiles start fully hidden (opacity 0), then the enter animation brightens
    // opacity 50% → 100% while scaling 90% → 120%.
    fadeFromOpacity: 0.5, // opacity at the START of the fade-in (50%)
    fadeToOpacity: 1, // opacity fully shown (100%)
    scaleFrom: 0.9, // scale at the START of the fade-in (90%)
    scaleTo: 1.2, // scale fully shown (120%)
  },
};

// Tile anchor points (centre as a % of the viewport) + shape, matching
// "project preview layout.jpg": TL landscape · TR square · L portrait ·
// BC square · R portrait.
const TILE_POSITIONS = [
  { left: '37%', top: '20%', width: 'clamp(180px, 20vw, 400px)', aspectRatio: '4 / 3' },
  { left: '69%', top: '19%', width: 'clamp(170px, 18vw, 360px)', aspectRatio: '1 / 1' },
  { left: '16%', top: '51%', width: 'clamp(150px, 14vw, 300px)', aspectRatio: '3 / 4' },
  { left: '50%', top: '80%', width: 'clamp(170px, 18vw, 360px)', aspectRatio: '1 / 1' },
  { left: '86%', top: '67%', width: 'clamp(150px, 14vw, 300px)', aspectRatio: '3 / 4' },
] as const;

// Renders an injected <img>/<video>, or a labelled placeholder when empty.
function TileMedia({ entry, label }: { entry: MediaEntry; label: string }) {
  if (!entry) {
    return (
      <div className="absolute inset-0 grid place-items-center bg-white/[0.04]">
        <span className="text-[0.7rem] tracking-[0.25em] text-white/50">{label}</span>
      </div>
    );
  }
  const e = typeof entry === 'string' ? { src: entry } : entry;
  const isVideo = ('type' in e && e.type === 'video') || /\.(mp4|webm|mov)$/i.test(e.src || '');
  if (isVideo) {
    return (
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={e.src}
        poster={'poster' in e ? e.poster : undefined}
        muted
        loop
        autoPlay
        playsInline
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="absolute inset-0 h-full w-full object-cover"
      src={e.src}
      alt={('alt' in e && e.alt) || label}
      loading="lazy"
      decoding="async"
    />
  );
}

/**
 * Hero:
 *
 *  1. "VISUAL STUDIO" sits centred above the logo. The "Attila lines.svg" logo
 *     draws in below it (LogoDraw), then eases to ~15% opacity while the text
 *     stays crisp.
 *  2. On scroll the logo shrinks and lifts to the top of the screen, becoming a
 *     Home link; the text fades out. Docked, the logo's height matches the menu
 *     bar's height (measured live), so the two align as a top bar.
 *  3. At rest, clicking "VISUAL STUDIO" plays the 40s preview sequence (see
 *     SEQUENCE above); it resets itself and is clickable again afterwards.
 *
 * `onRevealed` fires when the draw completes so the global BallMenu appears.
 */
export function HeroExperience({ onRevealed }: { onRevealed?: () => void } = {}) {
  const [drawn, setDrawn] = useState(false);
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const logoRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ endScroll: 600, yDock: -320, dockScale: 0.2 });
  /** Held, so the backdrop below doesn't resize with a phone's sliding bar. */
  const heldVh = useHeldViewportHeight();

  // Scroll-driven dock: shrink + lift the logo to the top; fade the text out.
  // Phones behave exactly like wide screens — the logo draws at full size in the
  // centre and then rides the scroll upward, arriving docked in the top bar (on
  // the menu bar's line, centred between the pills) only as the scroll
  // animation ends.
  const scale = useTransform(scrollY, [0, dims.endScroll], [1, dims.dockScale], { clamp: true });
  const y = useTransform(scrollY, [0, dims.endScroll], [0, dims.yDock], { clamp: true });
  const textFade = useTransform(scrollY, [0, 160], [1, 0], { clamp: true });
  const linkPointer = useTransform(scrollY, (v) => (v > LINK_AT ? 'auto' : 'none'));
  const linkCursor = useTransform(scrollY, (v) => (v > LINK_AT ? 'pointer' : 'default'));
  // The title is only clickable (to start the sequence) while near the top.
  const textPointer = useTransform(scrollY, (v) => (v < 40 ? 'auto' : 'none'));

  // Logo opacity: full while drawing, eases to a faint 15% at rest, then ramps
  // back to 100% as it shrinks + docks to the top.
  const settle = useMotionValue(1);
  useEffect(() => {
    if (!drawn) return;
    const controls = animate(settle, 0.15, { duration: reduce ? 0 : 1.2, ease: 'easeOut' });
    return () => controls.stop();
  }, [drawn, reduce, settle]);
  const logoOpacity = useTransform([settle, scrollY], ([s, v]: number[]) => {
    const p = Math.min(1, Math.max(0, v / (dims.endScroll || 1)));
    const dockRestore = 0.15 + 0.85 * p; // 0.15 (rest) → 1 (fully docked)
    return Math.max(s, dockRestore);
  });

  // ---- Preview-sequence state ------------------------------------------
  const [playing, setPlaying] = useState(false);
  const [seqLabel, setSeqLabel] = useState(SEQUENCE.idleText);
  const [seqVisible, setSeqVisible] = useState(true); // drives the text cross-fade
  const [segIndex, setSegIndex] = useState(0); // which segment's media to show
  const [tilesIn, setTilesIn] = useState<boolean[]>([false, false, false, false, false]);
  const playingRef = useRef(false); // synchronous guard against double-start
  const timers = useRef<number[]>([]); // every pending timeout, cleared on reset

  const clearTimers = () => {
    timers.current.forEach((id) => clearTimeout(id));
    timers.current = [];
  };
  const schedule = (sec: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, sec * 1000));
  };
  // Fade the title out, swap the string, fade it back in.
  const crossfadeLabel = (next: string) => {
    setSeqVisible(false);
    timers.current.push(
      window.setTimeout(() => {
        setSeqLabel(next);
        setSeqVisible(true);
      }, (SEQUENCE.timing.textFade / 2) * 1000),
    );
  };
  const showTile = (k: number) =>
    setTilesIn((prev) => {
      const next = [...prev];
      next[k] = true;
      return next;
    });
  const hideAllTiles = () => setTilesIn([false, false, false, false, false]);

  const resetSequence = () => {
    clearTimers();
    playingRef.current = false;
    hideAllTiles();
    setSeqVisible(true);
    setSeqLabel(SEQUENCE.idleText);
    setPlaying(false);
  };

  // Build + run the 40s timeline. Guarded to the resting hero only.
  const startSequence = () => {
    if (playingRef.current || !drawn || window.scrollY > 40) return;
    playingRef.current = true;
    setPlaying(true);
    setSegIndex(0);
    setSeqLabel(SEQUENCE.idleText); // seamless hand-off from the idle title
    setSeqVisible(true);
    hideAllTiles();

    const T = SEQUENCE.timing;
    const seg = T.segment;

    SEQUENCE.segments.forEach((s, i) => {
      const base = i * seg;
      // place-name cross-fade + load this segment's media into the hidden tiles
      schedule(base, () => {
        setSegIndex(i);
        crossfadeLabel(s.text);
      });
      // tiles fade + scale in, staggered
      for (let k = 0; k < TILE_POSITIONS.length; k++) {
        schedule(base + k * T.tileStagger, () => showTile(k));
      }
      // tiles fade + scale out at the tileOutAt mark
      schedule(base + T.tileOutAt, hideAllTiles);
    });

    const end = SEQUENCE.segments.length * seg; // 40s
    schedule(end - T.tileOutDur, () => crossfadeLabel(SEQUENCE.idleText)); // morph back
    schedule(end, resetSequence); // reset → clickable again
  };

  // Cancel any pending timers if the hero unmounts mid-sequence.
  useEffect(() => () => clearTimers(), []);

  // Measure the viewport, the logo's rest box, and the menu bar's height so the
  // docked logo lands at the top at the menu bar's height.
  useEffect(() => {
    const measure = () => {
      const vh = window.innerHeight;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - vh);
      const endScroll = Math.min(vh * 0.7, maxScroll);
      const el = logoRef.current;
      if (el) {
        // offsetHeight, not getBoundingClientRect: the rect already carries the
        // dock transform, so measuring it would feed the scale back into itself.
        // The logo is the only in-flow child of a centred fixed layer, so its
        // untransformed centre is simply the middle of the viewport.
        const logoH = el.offsetHeight || 1;
        const nav = document.querySelector('nav[aria-label]');
        const navRect = nav?.getBoundingClientRect();
        const pillH = navRect?.height || 34;
        // Docked height == 70% of the menu bar height (30% smaller than the pill).
        const dockScale = Math.min(1, pillH / logoH) * 0.7;
        // Align to the bar's live centre — the pills sit at top-3 on phones and
        // top-5 from `sm` up, so this can't be a constant.
        const targetCenterY = navRect ? navRect.top + pillH / 2 : NAV_TOP + pillH / 2;
        setDims({ endScroll, yDock: targetCenterY - vh / 2, dockScale });
      } else {
        setDims((d) => ({ ...d, endScroll }));
      }
    };
    measure();
    const raf = requestAnimationFrame(measure);
    const t = setTimeout(measure, 500); // re-measure once fonts/nav settle
    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
      window.removeEventListener('resize', measure);
    };
  }, []);

  // rAF smooth scroll back to the top when the docked logo (Home link) is used.
  const toTop = (e: React.MouseEvent) => {
    if (window.scrollY <= LINK_AT) return; // not docked yet
    e.preventDefault();
    if (reduce) {
      window.scrollTo(0, 0);
      return;
    }
    const start = window.scrollY;
    const t0 = performance.now();
    const dur = 600;
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      window.scrollTo(0, Math.round(start * (1 - eased)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  // Title content: the two-word brand, or a single place-name (kept centred
  // against the trailing letter-spacing via text-indent).
  const renderLabel = (text: string) =>
    text === SEQUENCE.idleText ? (
      <span className="flex items-center gap-[1.1em]">
        <span>Visual</span>
        <span>Studio</span>
      </span>
    ) : (
      <span className="[text-indent:0.6em]">{text}</span>
    );

  return (
    <>
      {/* Dark hero backdrop — the first viewport; scrolls away under the logo.
          Pinned to the held viewport, like the runway below it, so a phone's
          sliding chrome can't resize the page under a fixed scroll position.
          `h-svh` is the first paint, before there is a measurement. */}
      <div className="h-svh w-full bg-black" style={heldVh ? { height: heldVh } : undefined} />

      {/* Logo centred; "VISUAL STUDIO" overlaid at the logo's vertical centre.
          On scroll the logo docks to the top as a Home link; the text fades out. */}
      <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center">
        {/* Logo — draws, eases to 15%, then docks up + shrinks on scroll */}
        <motion.div
          style={{ scale, y, pointerEvents: linkPointer, cursor: linkCursor }}
          className="origin-center"
        >
          <Link href="/" aria-label="Home" onClick={toTop} className="block">
            <motion.div
              ref={logoRef}
              // Tagged so the scroll image-sequence can measure the logo's live
              // bottom edge — it keeps docking, so that target keeps moving.
              data-hero-logo
              className="relative aspect-[2036/711] w-[64vw] max-w-[874px]"
              style={{ opacity: logoOpacity }}
            >
              <LogoDraw
                onDone={() => {
                  setDrawn(true);
                  onRevealed?.();
                }}
              />
            </motion.div>
          </Link>
        </motion.div>

        {/* Preview-sequence tiles — only mounted while playing, so the resting
            hero is unchanged. Fades with the title on scroll (shared textFade). */}
        {playing && (
          <motion.div aria-hidden style={{ opacity: textFade }} className="pointer-events-none absolute inset-0">
            {TILE_POSITIONS.map((pos, k) => {
              const seg = SEQUENCE.segments[segIndex];
              const label = `${seg.text} · ${String(k + 1).padStart(2, '0')}`;
              const shown = tilesIn[k];
              return (
                // Wrapper centres the tile on its anchor; the figure scales
                // around its own centre so translate + scale don't conflict.
                <div
                  key={k}
                  className="absolute"
                  style={{
                    left: pos.left,
                    top: pos.top,
                    width: pos.width,
                    aspectRatio: pos.aspectRatio,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <motion.figure
                    className="relative m-0 h-full w-full overflow-hidden rounded-[2px] bg-neutral-900 ring-1 ring-white/10 will-change-transform"
                    initial={false}
                    animate={shown ? 'in' : 'out'}
                    variants={{
                      // Off: fully hidden.
                      out: { opacity: 0, scale: reduce ? 1 : SEQUENCE.timing.scaleFrom },
                      // In: brighten 50% → 100% while scaling 90% → 120%.
                      in: {
                        opacity: [SEQUENCE.timing.fadeFromOpacity, SEQUENCE.timing.fadeToOpacity],
                        scale: reduce
                          ? 1
                          : [SEQUENCE.timing.scaleFrom, SEQUENCE.timing.scaleTo],
                      },
                    }}
                    transition={{ duration: SEQUENCE.timing.tileInDur, ease: 'easeOut' }}
                  >
                    <TileMedia entry={seg.media[k]} label={label} />
                  </motion.figure>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* "VISUAL STUDIO" — overlaid at the centre of the logo; fades out on
            scroll. At rest it's the (clickable) sequence trigger; while playing
            it cross-fades through the place-names. */}
        <motion.div
          style={{ opacity: textFade }}
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          {playing ? (
            <div
              aria-hidden
              style={{ opacity: seqVisible ? 1 : 0 }}
              className={`${bebas.className} flex items-center justify-center text-[1.25rem] uppercase tracking-[0.6em] text-white transition-opacity duration-[600ms] ease-out sm:text-[1.9rem] lg:text-[2.4rem]`}
            >
              {renderLabel(seqLabel)}
            </div>
          ) : (
            <motion.button
              type="button"
              onClick={startSequence}
              aria-label="Projekt előnézet lejátszása"
              style={{ pointerEvents: textPointer, opacity: drawn ? 1 : 0, transitionDelay: drawn ? '250ms' : '0ms' }}
              className={`${bebas.className} m-0 flex cursor-pointer appearance-none items-center gap-[1.1em] border-0 bg-transparent p-0 text-[1.25rem] uppercase tracking-[0.6em] text-white outline-none transition-opacity duration-[1600ms] ease-out focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-[0.4em] focus-visible:outline-white/40 sm:text-[1.9rem] lg:text-[2.4rem]`}
            >
              <span aria-hidden>Visual</span>
              <span aria-hidden>Studio</span>
            </motion.button>
          )}
        </motion.div>
      </div>
    </>
  );
}
