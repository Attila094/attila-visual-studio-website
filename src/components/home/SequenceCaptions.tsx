'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Montserrat } from 'next/font/google';
import { motion, useMotionValue, useTransform, type MotionValue } from 'framer-motion';
import {
  captionColor,
  captionGroups,
  captionLines,
  linesBefore,
} from '@/content/sequenceCaptions';
import {
  captionArrivals,
  captionSpans,
  DIM_SPAN,
  PHASES,
  STACK_FADE_START,
  SWAP_AT,
} from '@/lib/sequenceTiming';

const montserrat = Montserrat({ subsets: ['latin', 'latin-ext'], weight: '800' });

/** What a line settles to once the scroll has moved on — present, but behind
 *  the photograph. */
const PARKED_OPACITY = 0.1;

/** Share of its own row a line is allowed to fill, so seven of them can stand
 *  from the top of the image to the bottom without touching. */
const ROW_FILL = 0.78;
/** …and half again on top of that. The row is what binds the size at any
 *  ordinary window — the two width ceilings below sit well clear of it — and a
 *  row's share is of the em BOX, most of which is the air above and below the
 *  caps rather than ink. */
const HEIGHT_SCALE = 1.5;
/** Share of the image's width the longest line is allowed, leaving it air. */
const WIDTH_FILL = 0.94;
/** Set well past what the image alone would allow, so the longer lines run out
 *  past its edges onto the black. Never past the window, though — see below. */
const SIZE_SCALE = 3;
/** Share of the window the longest line may take: the ceiling that keeps the
 *  type from running off a narrow screen. */
const SCREEN_FILL = 0.96;
const ROWS = captionLines.length;
const LONGEST = captionLines.reduce((a, b) => (b.length > a.length ? b : a));
/** The size the hidden probe below is set at — the measurement is divided back
 *  out of it, so the number itself doesn't matter, only that it is large enough
 *  to measure precisely. */
const PROBE_PX = 100;
/** Until the probe has been read: a rough width-per-character, only ever used
 *  for the first frame. */
const FALLBACK_EM = LONGEST.length * 0.72;

/**
 * The one group that does not simply land in its row.
 *
 * Every other line arrives where it will stay. This pair — ÉPÍTÉSZET and
 * BELSŐÉPÍTÉSZET — arrives in the MIDDLE of the picture instead, set across it
 * as a title rather than tucked into a list that is still mostly empty, and
 * only rises into its place in the stack as the picture gives way. Its two
 * lines move together, as one block, so the second stays under the first
 * throughout.
 *
 * Written as the group's index rather than as two row numbers so that adding a
 * discipline above it cannot silently point this at the wrong words.
 */
const CENTRED_GROUP = 1;
const CENTRED_FIRST = linesBefore(CENTRED_GROUP);
const CENTRED_COUNT = captionGroups[CENTRED_GROUP].length;
/** It travels over exactly the window its picture shrinks across, so the words
 *  leave the middle as the thing they were sitting on does. */
const TRAVEL_FROM = SWAP_AT[CENTRED_GROUP];
const TRAVEL_TO = PHASES[CENTRED_GROUP + 2];

/** Smoothstep, and progress mapped across a window — the same two helpers the
 *  sequence itself moves everything with. */
const ease = (v: number) => v * v * (3 - 2 * v);
const seg = (p: number, a: number, b: number) =>
  Math.min(1, Math.max(0, (p - a) / (b - a)));

/**
 * One line of the stack.
 *
 * Its own component because its opacity is a transform of the scroll, and a
 * hook cannot be called inside the parent's loop. Both of the things that move
 * it — the wipe that uncovers it and the strength it settles to — are pure
 * functions of how far the scroll has gone past this line's arrival. Neither is
 * an animation, so both run backwards as readily as forwards.
 */
function CaptionLine({
  row,
  progress,
  fontSize,
  rowHeight,
  offsetY,
}: {
  row: number;
  progress: MotionValue<number>;
  fontSize: MotionValue<number>;
  rowHeight: MotionValue<number>;
  /** How far this row currently sits BELOW its place in the stack. Only the
   *  centred pair gets one; every other row is already where it belongs. */
  offsetY?: MotionValue<number>;
}) {
  // The reveal is drawn by the scroll, not by a clock: the line is uncovered
  // from the left across its own span of progress, so it opens as you go down
  // and closes again on the way back up. Nothing is latched and nothing waits.
  // The span is per-line because the word over the film borrows the film's
  // length rather than taking a reveal of its own.
  const clipPath = useTransform(progress, (p) => {
    const t = Math.min(1, Math.max(0, (p - captionArrivals[row]) / captionSpans[row]));
    return `inset(0 ${(1 - t) * 100}% 0 0)`;
  });

  const opacity = useTransform(progress, (p) => {
    const arrival = captionArrivals[row];
    const t = Math.min(1, Math.max(0, (p - arrival) / DIM_SPAN));
    return 1 + (PARKED_OPACITY - 1) * t;
  });

  return (
    <motion.div
      style={{ height: rowHeight, y: offsetY }}
      className="flex items-center justify-center"
    >
      <motion.p
        style={{
          fontSize,
          opacity,
          color: captionColor(captionLines[row]),
          // A clip, not a width animation: the line is drawn in full and only
          // what you can see of it changes, so the text never re-wraps.
          clipPath,
        }}
        className={`${montserrat.className} m-0 whitespace-nowrap text-center uppercase leading-none tracking-[0.02em]`}
      >
        {captionLines[row]}
      </motion.p>
    </motion.div>
  );
}

/**
 * The sequence's captions — one growing list, set across the big image.
 *
 * Each line arrives at its own place on the scroll and STAYS, the next landing
 * beneath it, so by the last image all seven stand from the top edge of the
 * image to the bottom. Nothing is on a timer except each line's one-shot
 * reveal: how strong a line is, how many are showing and when the stack leaves
 * are all read straight off the scroll, so the whole thing runs backwards just
 * as readily as forwards.
 *
 * Rows are a fixed share of the image's height rather than a flowed column: a
 * line therefore appears exactly where it will stay, and the finished stack
 * spans the image precisely, whatever it is holding at the time.
 */
export function SequenceCaptions({
  progress,
  slotTop,
  slotLeft,
  slotW,
  slotH,
}: {
  /** The sequence's scroll progress — what every part of this reads from. */
  progress: MotionValue<number>;
  /** The big image's live rect — the stack is set across it. */
  slotTop: MotionValue<number>;
  slotLeft: MotionValue<number>;
  slotW: MotionValue<number>;
  slotH: MotionValue<number>;
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
    // Asked again once the webfont has settled, and again on the frame after —
    // the first measurement is of the fallback face, which is materially wider,
    // and `document.fonts.ready` can resolve before the real face has actually
    // been applied to this element. Unlike the phone's, this feeds a motion
    // value, so a late answer still reaches the type.
    document.fonts?.ready.then(() => requestAnimationFrame(measure)).catch(() => {});
    const t = window.setTimeout(measure, 400);
    return () => window.clearTimeout(t);
  }, [longestEm]);

  /**
   * Well past what the image's own width would allow — so the longer lines
   * break out over the black either side — held under two ceilings: the window,
   * which it must never overflow, and its own row, which it must never outgrow
   * or the seven lines would collide.
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
          ((h / ROWS) * ROW_FILL * HEIGHT_SCALE) / 1.15,
        ),
      );
    },
  );
  const rowHeight = useTransform(slotH, (h) => h / ROWS);

  /**
   * How far the centred pair sits below its rows, at this moment.
   *
   * The distance is the gap between where the block's centre WOULD be in the
   * stack and the middle of the picture; it closes to nothing over the shrink.
   * Solved from the group's position rather than written down, so it stays
   * right if a line is added above it.
   */
  const pairY = useTransform([progress, slotH], ([p, h]: number[]) => {
    const rowH = h / ROWS;
    const drop = h / 2 - (CENTRED_FIRST + CENTRED_COUNT / 2) * rowH;
    return drop * (1 - ease(seg(p, TRAVEL_FROM, TRAVEL_TO)));
  });

  /** The stack leaves over the last image's flight — read off the scroll like
   *  everything else, so scrolling back brings it straight home. */
  const stackOpacity = useTransform(progress, (p) =>
    Math.min(1, Math.max(0, (1 - p) / (1 - STACK_FADE_START))),
  );

  // How many lines have been reached. State rather than a transform because it
  // decides what is MOUNTED, and it changes seven times in the whole sequence.
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const check = (p: number) => {
      let n = 0;
      for (let r = 0; r < ROWS; r += 1) if (p >= captionArrivals[r]) n = r + 1;
      setShown(n);
    };
    check(progress.get());
    return progress.on('change', check);
  }, [progress]);

  if (!shown) return null;

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
          opacity: stackOpacity,
        }}
        className="pointer-events-none fixed z-40 flex flex-col"
      >
        {Array.from({ length: shown }, (_, row) => (
          <CaptionLine
            key={row}
            row={row}
            progress={progress}
            fontSize={fontSize}
            rowHeight={rowHeight}
            offsetY={
              row >= CENTRED_FIRST && row < CENTRED_FIRST + CENTRED_COUNT ? pairY : undefined
            }
          />
        ))}
      </motion.div>
    </>
  );
}
