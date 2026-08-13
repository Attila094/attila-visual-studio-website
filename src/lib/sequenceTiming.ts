/**
 * Where each part of the hero sequence happens.
 *
 * The sequence is scrolled, not played. Almost everything here is therefore a
 * POSITION on the scroll's own 0→1 progress rather than a duration: nothing
 * waits, nothing pins the page, and scrolling back runs it all in reverse. The
 * single exception is a caption's reveal, which is a one-shot animation and so
 * is the one thing still measured by a clock.
 *
 * <HeroImageSequence> and <SequenceCaptions> both read these, and must agree:
 * the images move to the phase boundaries and the captions arrive on them.
 */

/**
 * Phase boundaries. Image i grows across [PHASES[i], PHASES[i+1]] and shrinks
 * across [PHASES[i+1], PHASES[i+2]], so the last image's shrink is the final
 * phase — which is exactly when every image flies to its MainTile.
 */
export const PHASES = [0, 0.18, 0.34, 0.5, 0.66, 0.82, 1] as const;

/**
 * How much scrolling opens a line's reveal, from covered to fully uncovered.
 *
 * A distance, not a duration: the wipe is drawn by the scroll itself, so it
 * opens as you go down and closes again as you come back up. Nothing here is
 * left on a clock at all.
 */
export const REVEAL_SPAN = 0.04;

/**
 * How much further the scroll has to travel before the SECOND line of a pair
 * arrives under the first — exactly the reveal, so the second line begins the
 * moment the first has finished writing itself and never before.
 */
export const PAIR_GAP = REVEAL_SPAN;

/**
 * When image `i` gives way: the point at which it starts to shrink and the next
 * one starts to grow into the space. Not the phase boundary itself but a
 * caption's worth past it — an image holds full size until every line it
 * carries has finished being revealed, so nothing moves out from under a word
 * still being written.
 */
export function swapStart(i: number, lines: number): number {
  return PHASES[i + 1] + lines * REVEAL_SPAN;
}

/** How much scrolling takes a line from full strength down to the stack. This
 *  is what "the text reduces its opacity on scroll" is: no timer, no dwell —
 *  keep scrolling and the line recedes, scroll back and it returns. */
export const DIM_SPAN = 0.1;

/** Where the whole stack starts to leave. It is gone by 1, so the captions
 *  clear the screen over the last image's flight to its tile. */
export const STACK_FADE_START = 0.9;
