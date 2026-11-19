'use client';

import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * The layout grid a project page runs on: five equal columns, 5px between them
 * and the same 5px from each edge of the window.
 *
 * The columns are never drawn. They exist so that every block places itself by
 * COLUMN rather than by a width of its own — which is what keeps a title, a
 * paragraph and an image edge lining up with each other down the page instead
 * of each one being nudged into position separately.
 *
 * Five columns of a phone would be about seventy pixels each, narrower than
 * most of these words, so below `md` the grid collapses to one and each block
 * takes the full measure. The columns are `fr`, so between those two states
 * they simply scale with the window.
 *
 * Shared, because two different project templates draw on it and a grid that
 * two files each describe for themselves is a grid that drifts.
 */
export const GRID = 'grid grid-cols-1 gap-y-8 px-[5px] md:grid-cols-5 md:gap-x-[5px]';

/** Column spans, by the role a block plays rather than by number — so a block
 *  asks for "the prose column" and cannot be moved by renumbering. */
export const COL_TITLE = 'md:col-span-1 md:col-start-1';
export const COL_BODY = 'md:col-span-2 md:col-start-4';
export const COL_PLATE = 'md:col-span-2 md:col-start-2';
/** Spans used by the six-section template, which places plates more widely. */
export const COL_1 = 'md:col-span-1 md:col-start-1';
export const COL_2 = 'md:col-span-1 md:col-start-2';
export const COL_3 = 'md:col-span-1 md:col-start-3';
export const COL_4 = 'md:col-span-1 md:col-start-4';
export const COL_5 = 'md:col-span-1 md:col-start-5';
export const COL_1_2 = 'md:col-span-2 md:col-start-1';
export const COL_1_3 = 'md:col-span-3 md:col-start-1';
export const COL_1_4 = 'md:col-span-4 md:col-start-1';
export const COL_2_4 = 'md:col-span-3 md:col-start-2';

/** The beat between a section's title landing and its body following it. */
export const BODY_DELAY = 0.12;

/**
 * One block, rising into place as it is scrolled to.
 *
 * `once`, because a block that replays every time it passes the fold turns the
 * page into a flicker-book. `amount: 0.2` so a tall block starts as soon as its
 * top edge is properly inside the window, rather than holding still until a
 * fifth of it is already showing.
 *
 * Under `prefers-reduced-motion` the travel goes and the fade stays: the point
 * of the setting is movement, and a block appearing with no transition at all
 * reads as a glitch rather than as restraint.
 */
export function Rise({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: reduce ? 0.3 : 0.6, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

/**
 * One line of text, rising into place on its own.
 *
 * `Rise` moves a whole column at once, which is right for a plate or a
 * carousel. Prose wants the opposite: a heading, then its paragraph, then the
 * next pair — so each text element carries its own reveal and its own place in
 * the queue, and a block of copy assembles itself line by line instead of
 * arriving as one slab.
 *
 * Shorter travel and a tighter trigger than `Rise` for the same reason: at
 * 36px a run of six staggered lines reads as a wave rather than as text.
 */
export function RiseLine({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: reduce ? 0.3 : 0.5, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

/**
 * A section's heading on the grid: the number, then the name.
 *
 * Two digits, because a page that counts 1, 2, 3 down the first column and then
 * reaches 10 would shunt its own left edge sideways — `tabular-nums` holds the
 * glyph widths, not the digit count.
 */
export function SectionTitle({
  n,
  label = 'Leírás',
  tone = 'dark',
}: {
  n: number;
  label?: string;
  /** `dark` for the black six-section template, `light` for the paper page. */
  tone?: 'dark' | 'light';
}) {
  const num = tone === 'dark' ? 'text-white/40' : 'text-muted';
  const name = tone === 'dark' ? 'text-white' : '';
  return (
    <p className="flex items-baseline gap-3 text-left text-sm">
      <span className={`tabular-nums ${num}`}>{String(n).padStart(2, '0')}</span>
      <span className={`uppercase tracking-wide ${name}`}>{label}</span>
    </p>
  );
}
