/**
 * How long each beat of the hero sequence lasts.
 *
 * <HeroImageSequence> and <SequenceCaptions> both have to agree on these: the
 * sequence decides how long to pause on an image, the captions decide how long
 * to spend writing into that pause, and a disagreement shows up as a caption
 * cut off mid-word or an image left sitting on a finished line. They live here
 * rather than in either component so neither has to import the other for them.
 */

/** One caption line's type-in. */
export const TYPE_MS = 3000;
/** The beat between the two lines of a pair, before the second starts. */
export const CAPTION_DWELL_MS = 1000;
/** How long the newest line stands at full strength once it has finished… */
export const DWELL_MS = 1000;
/** …and how long it then takes to settle back into the stack. */
export const PARK_FADE_MS = 500;
/** The whole stack leaves over this, once the sequence is done with it. */
export const FADE_OUT_MS = 2000;

/**
 * An image's expand — and, because one image growing IS the one before it
 * retreating, the same span covers a shrink. Under autoplay this is the clock
 * the sequence moves to; under a manual scroll it is only the width of the
 * window the movement is spread across.
 */
export const GROW_MS = 2000;
/** Dead air after a caption has settled into the stack, before the next image
 *  begins to expand. */
export const BEFORE_NEXT_MS = 1000;

/**
 * How long the sequence pauses on an image carrying `lines` captions: long
 * enough for every one of them to type itself in, with the beat between a pair,
 * and then for the last to stand, fade back into the stack, and be left alone
 * for a moment before anything moves again.
 */
export function holdMsFor(lines: number): number {
  return (
    lines * TYPE_MS +
    (lines - 1) * CAPTION_DWELL_MS +
    DWELL_MS +
    PARK_FADE_MS +
    BEFORE_NEXT_MS
  );
}
