'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Montserrat } from 'next/font/google';
import { motion, useMotionValue, useTransform, type MotionValue } from 'framer-motion';
import { captionGroups, captionLines, linesBefore } from '@/content/sequenceCaptions';
import { markCaptionTyped, typedCaptions } from '@/lib/introPlayed';
import { CAPTION_DWELL_MS, TYPE_MS } from './HeroImageSequence';

const montserrat = Montserrat({ subsets: ['latin', 'latin-ext'], weight: '800' });

/** How long the newest line stays at full strength once it has finished. */
const DWELL_MS = 1000;
/** What every earlier line settles to — present, but behind the photograph. */
const PARKED_OPACITY = 0.1;
/** The stack leaves over this, once the sequence is done with it. */
const FADE_OUT_MS = 2000;

/** Share of its own row a line is allowed to fill, so seven of them can stand
 *  from the top of the image to the bottom without touching. */
const ROW_FILL = 0.78;
/** Share of the image's width the longest line is allowed, leaving it air. */
const WIDTH_FILL = 0.94;
/** Set at twice what the image alone would allow, so the longer lines run out
 *  past its edges onto the black. Never past the window, though — see below. */
const SIZE_SCALE = 3;
/** Share of the window the longest line may take. This is the ceiling that
 *  keeps the doubled type from running off a narrow screen. */
const SCREEN_FILL = 0.96;
const ROWS = captionLines.length;
const LONGEST = captionLines.reduce((a, b) => (b.length > a.length ? b : a));
/** The size the hidden probe below is set at — the measurement is divided back
 *  out of it, so the number itself doesn't matter, only that it is large enough
 *  to measure precisely. */
const PROBE_PX = 100;
/** Until the probe has been read: a rough width-per-character for Montserrat
 *  Medium, only ever used for the first frame. */
const FALLBACK_EM = LONGEST.length * 0.72;

/**
 * Which groups have already typed themselves in.
 *
 * Module-scoped rather than component state because the captions unmount when
 * the sequence is scrolled backwards, and state would forget — the type effect
 * would replay on the way back down. It is seeded from (and written through to)
 * sessionStorage, so the effect also doesn't replay on a reload: it plays the
 * first time the site is loaded and no more.
 */
let typedOnce: Set<number> | null = null;
function typedSet(): Set<number> {
  // Lazily, because sessionStorage doesn't exist while rendering on the server.
  if (!typedOnce) typedOnce = typedCaptions();
  return typedOnce;
}

/**
 * The sequence's captions — one growing list, set across the big image.
 *
 * Each image brings its own line, or its own pair: the second of a pair lands a
 * beat after the first, on the row beneath it, and the first dims as it starts.
 * Nothing is ever taken away, so by the last image all seven lines stand from
 * the top edge of the image to the bottom. They leave together, over two
 * seconds, once the sequence is finished with them.
 *
 * Rows are a fixed share of the image's height rather than a flowed column:
 * a line therefore appears exactly where it will stay, and the finished stack
 * spans the image precisely, whatever it is holding at the time.
 */
export function SequenceCaptions({
  activeIndex,
  slotTop,
  slotLeft,
  slotW,
  slotH,
  done,
  onAdvance,
}: {
  /** The image whose caption group is current; -1 before the first hold. */
  activeIndex: number;
  /** The big image's live rect — the stack is set across it. */
  slotTop: MotionValue<number>;
  slotLeft: MotionValue<number>;
  slotW: MotionValue<number>;
  slotH: MotionValue<number>;
  /** True once the sequence has begun its last phase — the stack's cue to go. */
  done: boolean;
  /** Called when a group moves to its second line, which is also the moment its
   *  image should turn over to the discipline that line names. */
  onAdvance: (group: number) => void;
}) {
  // How wide the longest line actually sets, in ems of its own size. Measured
  // rather than estimated: a character-width constant is a guess about a font
  // whose metrics only the browser knows, and getting it wrong either overflows
  // the image or leaves the type needlessly small. Re-read once the webfont has
  // loaded, since the first measurement is of the fallback face.
  const longestEm = useMotionValue(FALLBACK_EM);
  const probe = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const el = probe.current;
    if (!el) return;
    const measure = () => {
      const w = el.getBoundingClientRect().width;
      if (w > 0) longestEm.set(w / PROBE_PX);
    };
    measure();
    document.fonts?.ready.then(measure).catch(() => {});
  }, [longestEm]);

  /**
   * Twice what the image's own width would allow — so the longer lines break
   * out over the black either side — held under two ceilings: the window, which
   * it must never overflow, and its own row, which it must never outgrow or the
   * seven lines would collide.
   */
  const fontSize = useTransform(
    [slotLeft, slotW, slotH, longestEm],
    ([l, w, h, em]: number[]) => {
      const vw = 2 * l + w; // the slot is centred, so this is the window
      return Math.max(
        9,
        Math.min(
          (w * WIDTH_FILL * SIZE_SCALE) / em,
          (vw * SCREEN_FILL) / em,
          ((h / ROWS) * ROW_FILL) / 1.15,
        ),
      );
    },
  );
  const rowHeight = useTransform(slotH, (h) => h / ROWS);

  /**
   * `started` — how many of the current group's lines have begun; `n` — how far
   * the newest is typed. Carrying the group with them means a stale count can
   * never be painted against a new group's text.
   */
  const [shown, setShown] = useState({ group: -1, started: 0, n: 0 });
  /** The one line at full strength, as a global row index. -1 once its beat is
   *  over and every line is equal again. */
  const [full, setFull] = useState(-1);

  useEffect(() => {
    if (activeIndex < 0) return;
    const group = captionGroups[activeIndex];
    const base = linesBefore(activeIndex);

    if (typedSet().has(activeIndex)) {
      // Been here before: the group belongs on screen whole, with no replay —
      // and so does the turned-over face of its image.
      setShown({ group: activeIndex, started: group.length, n: group[group.length - 1].length });
      setFull(-1);
      if (group.length > 1) onAdvance(activeIndex);
      return;
    }
    // Claim it up front, so a quick scroll back and forth mid-type doesn't
    // start the animation over — and persist it, so a reload doesn't either.
    typedSet().add(activeIndex);
    markCaptionTyped(activeIndex);

    let raf = 0;
    const timers: number[] = [];

    const typeLine = (li: number) => {
      const text = group[li];
      // The new line takes the light; everything above it dims to the stack.
      setFull(base + li);
      setShown({ group: activeIndex, started: li + 1, n: 0 });
      // The line above is starting to fade — that is the beat the image turns
      // over on, so the picture changes with the word rather than after it.
      if (li > 0) onAdvance(activeIndex);
      const start = performance.now();
      const tick = () => {
        const t = Math.min(1, (performance.now() - start) / TYPE_MS);
        const n = Math.round(t * text.length);
        // Returning `prev` unchanged lets React bail out, so the ~60 ticks a
        // second only cost a render on the frames a letter actually lands.
        setShown((prev) =>
          prev.group === activeIndex && prev.started === li + 1 && prev.n === n
            ? prev
            : { group: activeIndex, started: li + 1, n },
        );
        if (t < 1) {
          raf = requestAnimationFrame(tick);
        } else if (li + 1 < group.length) {
          timers.push(window.setTimeout(() => typeLine(li + 1), CAPTION_DWELL_MS));
        } else {
          timers.push(window.setTimeout(() => setFull(-1), DWELL_MS));
        }
      };
      raf = requestAnimationFrame(tick);
    };

    typeLine(0);
    return () => {
      cancelAnimationFrame(raf);
      timers.forEach((id) => clearTimeout(id));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- onAdvance is stable
  }, [activeIndex]);

  if (activeIndex < 0) return null;

  // Every line up to and including the newest one that has begun. A scroll back
  // shortens the list; the rows the remaining lines sit on never move.
  const base = linesBefore(activeIndex);
  const started = shown.group === activeIndex ? shown.started : captionGroups[activeIndex].length;
  const visibleRows = base + started;

  return (
    <>
      {/* Off-screen, at a known size, in the same face and tracking as the
          lines: what the type size is solved from. */}
      <span
        ref={probe}
        aria-hidden
        style={{ position: 'fixed', left: -99999, top: 0, fontSize: PROBE_PX }}
        className={`${montserrat.className} whitespace-nowrap uppercase leading-none tracking-[0.02em]`}
      >
        {LONGEST}
      </span>

    <motion.div
      aria-hidden
      style={{
        top: slotTop,
        left: slotLeft,
        width: slotW,
        height: slotH,
        opacity: done ? 0 : 1,
        transition: `opacity ${FADE_OUT_MS}ms ease-out`,
      }}
      className="pointer-events-none fixed z-40 flex flex-col"
    >
      {Array.from({ length: visibleRows }, (_, row) => {
        const typing = row === base + started - 1 && shown.group === activeIndex;
        const text = typing ? captionLines[row].slice(0, shown.n) : captionLines[row];
        return (
          <motion.div
            key={row}
            style={{ height: rowHeight }}
            className="flex items-center justify-center"
          >
            <motion.p
              style={{
                fontSize,
                opacity: row === full ? 1 : PARKED_OPACITY,
              }}
              className={`${montserrat.className} m-0 whitespace-nowrap text-center uppercase leading-none tracking-[0.02em] text-white transition-opacity duration-500`}
            >
              {text || ' '}
            </motion.p>
          </motion.div>
        );
      })}
    </motion.div>
    </>
  );
}
