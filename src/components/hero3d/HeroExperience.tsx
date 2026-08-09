'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bebas_Neue } from 'next/font/google';
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import { LogoDraw } from './LogoDraw';
import { logoDockEnd } from '@/lib/heroSequenceState';
import { useHeldViewportHeight } from '@/lib/useHeldViewportHeight';

const bebas = Bebas_Neue({ subsets: ['latin', 'latin-ext'], weight: '400' });

// Past this scroll position the docked logo becomes an active Home link.
const LINK_AT = 220;
// Fallback menu-bar centre, used only if the nav can't be measured.
const NAV_TOP = 20;

/* ================================================================
   TITLE SEQUENCE (click "VISUAL STUDIO" to play)
   ----------------------------------------------------------------
   The brand fades away and the studio's disciplines take its place,
   one at a time, over the resting hero. Each rises into view as it
   fades in, holds, and fades out; the next begins as the last one
   finishes, so only ever one is on screen.
   ================================================================ */
const SEQUENCE_WORDS = [
  'Építészeti vizualizáció',
  'Építészet',
  'Belsőépítészet',
  'Fotográfia',
  'Videográfia',
  'Grafikai tervezés',
  '3D nyomtatás',
] as const;

/** Seconds. Both fades, and the still moment between them. */
const FADE = 1;
const HOLD = 3;
/** One word, start to start — and so the beat the whole sequence keeps. */
const STEP = FADE + HOLD + FADE;
/** How far a word rises as it appears. */
const RISE = 28;

/**
 * Hero:
 *
 *  1. "VISUAL STUDIO" sits centred above the logo. The "Attila lines.svg" logo
 *     draws in below it (LogoDraw), then eases to ~15% opacity while the text
 *     stays crisp.
 *  2. On scroll the logo shrinks and lifts to the top of the screen, becoming a
 *     Home link; the text fades out. Docked, the logo's height matches the menu
 *     bar's height (measured live), so the two align as a top bar.
 *  3. At rest, clicking "VISUAL STUDIO" fades it out and plays the discipline
 *     sequence (see SEQUENCE_WORDS above); it resets itself and is clickable
 *     again afterwards.
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

  // ---- Title-sequence state --------------------------------------------
  const [playing, setPlaying] = useState(false);
  /** Which word is on screen, or none — between the brand's fade-out and the
   *  first word, and again while the last one leaves. */
  const [wordIndex, setWordIndex] = useState<number | null>(null);
  const playingRef = useRef(false); // synchronous guard against double-start
  const timers = useRef<number[]>([]); // every pending timeout, cleared on reset

  const clearTimers = () => {
    timers.current.forEach((id) => clearTimeout(id));
    timers.current = [];
  };
  const schedule = (sec: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, sec * 1000));
  };

  const resetSequence = () => {
    clearTimers();
    playingRef.current = false;
    setWordIndex(null);
    setPlaying(false);
  };

  /**
   * The timeline. The brand takes the first second to leave, then each word
   * owns a STEP: a second rising in, five still, a second leaving. The index is
   * moved at the moment a word should start leaving — `AnimatePresence` in
   * `wait` mode plays that exit in full before the next word begins, which is
   * what makes one word's exit and the next one's entrance line up end to end.
   */
  const startSequence = () => {
    if (playingRef.current || !drawn || window.scrollY > 40) return;
    playingRef.current = true;
    setPlaying(true); // the brand starts fading out
    setWordIndex(null);

    schedule(FADE, () => setWordIndex(0));
    SEQUENCE_WORDS.forEach((_, i) => {
      const leaveAt = FADE + i * STEP + FADE + HOLD;
      schedule(leaveAt, () => setWordIndex(i + 1 < SEQUENCE_WORDS.length ? i + 1 : null));
    });
    schedule(FADE + SEQUENCE_WORDS.length * STEP, resetSequence);
  };

  // Cancel any pending timers if the hero unmounts mid-sequence.
  useEffect(() => () => clearTimers(), []);

  // Publish where the dock ends, so the image sequence below knows when the
  // logo has stopped moving and its own captions may begin.
  useEffect(() => {
    logoDockEnd.set(dims.endScroll);
  }, [dims.endScroll]);

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

        {/* The centred title: the brand at rest, the disciplines while the
            sequence plays. Both live in the same box so one takes over exactly
            where the other left. Fades out on scroll (shared textFade). */}
        <motion.div style={{ opacity: textFade }} className="pointer-events-none absolute inset-0">
          {/* "VISUAL STUDIO" — the trigger. It is never unmounted while it
              plays: it has to fade out over its own second, not vanish. */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.button
              type="button"
              onClick={startSequence}
              aria-label="Projekt előnézet lejátszása"
              style={{
                pointerEvents: playing ? 'none' : textPointer,
                opacity: drawn && !playing ? 1 : 0,
                transitionDuration: playing ? `${FADE * 1000}ms` : undefined,
                transitionDelay: drawn && !playing ? '250ms' : '0ms',
              }}
              className={`${bebas.className} m-0 flex cursor-pointer appearance-none items-center gap-[1.1em] border-0 bg-transparent p-0 text-[1.25rem] uppercase tracking-[0.6em] text-white outline-none transition-opacity duration-[1600ms] ease-out focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-[0.4em] focus-visible:outline-white/40 sm:text-[1.9rem] lg:text-[2.4rem]`}
            >
              <span aria-hidden>Visual</span>
              <span aria-hidden>Studio</span>
            </motion.button>
          </div>

          {/* One discipline at a time. `wait` is what holds the beat: the word
              leaving finishes before the next one starts to rise. */}
          <div className="absolute inset-0 flex items-center justify-center px-6">
            <AnimatePresence mode="wait">
              {wordIndex !== null && (
                <motion.p
                  key={wordIndex}
                  aria-hidden
                  initial={{ opacity: 0, y: reduce ? 0 : RISE }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: FADE, ease: 'easeOut' }}
                  // The negative right margin swallows the letter-spacing that
                  // trails the last glyph, so the ink is centred, not the box.
                  className={`${bebas.className} m-0 max-w-[92vw] -mr-[0.35em] text-center text-[1.25rem] uppercase leading-tight tracking-[0.35em] text-white sm:-mr-[0.6em] sm:text-[1.9rem] sm:tracking-[0.6em] lg:text-[2.4rem]`}
                >
                  {SEQUENCE_WORDS[wordIndex]}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </>
  );
}
