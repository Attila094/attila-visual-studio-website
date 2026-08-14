import { captionGroups } from '@/content/sequenceCaptions';

/**
 * Where each part of the hero sequence happens.
 *
 * The sequence is scrolled, not played, so everything here is a POSITION on the
 * scroll's own 0→1 progress rather than a duration. Nothing waits, nothing pins
 * the page, and scrolling back runs it all in reverse.
 *
 * The positions are not written down; they are BUILT, from how long each beat
 * needs. That matters because the beats are not the same length: an image
 * carrying two captions has to hold twice as long as one carrying a single
 * line, and the image carrying a film has to hold for as long as the film takes
 * to scrub. Laying the timeline out in raw units and normalising it at the end
 * means a beat can be retuned by changing one number here, without any of the
 * others having to be recalculated by hand to keep the total at 1.
 *
 * <HeroImageSequence> and <SequenceCaptions> both read these and must agree:
 * the images move to these boundaries and the captions arrive on them.
 */

/** One caption line's reveal — the unit everything else is expressed in. */
const REVEAL_RAW = 4;
/** The first image growing out of the bouncing ball. */
const GROW_RAW = 18;
/** One image giving way to the next: the shrink and the growth are the same
 *  stretch, because they are one exchange. */
const SWAP_RAW = 8;
/**
 * The clip's own stretch of scroll — six reveals' worth, so eight seconds of
 * film are spent over roughly a screen of scrolling rather than a flick of it.
 * This is the number to change if the film still runs too fast or too slow.
 */
const VIDEO_RAW = 24;

/** Which slot carries the clip. Its hold is the film's stretch plus one reveal,
 *  because its second caption is still to come after the film has ended. */
const CLIP_SLOT = 2;

const LINES = captionGroups.map((g) => g.length);

/** How long image `i` holds at full size before giving way. */
const holdRaw = (i: number) =>
  i === CLIP_SLOT ? VIDEO_RAW + REVEAL_RAW : LINES[i] * REVEAL_RAW;

/**
 * Where each line of group `i` arrives, measured from the moment that image
 * reaches full size.
 *
 * Ordinarily a line lands as the one before it finishes, so a pair is one
 * reveal apart. The clip's group is the exception: its first caption is timed
 * to FINISH exactly as the film does, so it starts one reveal before the end
 * of the film rather than at the beginning of it — the word lands on the last
 * frame instead of standing over the whole thing.
 */
const lineOffsets = (i: number) =>
  i === CLIP_SLOT
    ? [VIDEO_RAW - REVEAL_RAW, VIDEO_RAW]
    : Array.from({ length: LINES[i] }, (_, j) => j * REVEAL_RAW);

// --- Laying the timeline out ------------------------------------------------
// `bounds[i + 1]` is where image i reaches full size; `bounds[i + 2]` where it
// has parked and the next one is up.
const bounds: number[] = [0, GROW_RAW];
for (let i = 0; i < LINES.length; i += 1) {
  bounds.push(bounds[i + 1] + holdRaw(i) + SWAP_RAW);
}
const TOTAL = bounds[bounds.length - 1];

/** Phase boundaries, normalised. Image i grows across [PHASES[i], PHASES[i+1]]
 *  and is parked by PHASES[i+2]. */
export const PHASES: number[] = bounds.map((b) => b / TOTAL);

/** How much scrolling opens a line's reveal, from covered to fully uncovered. */
export const REVEAL_SPAN = REVEAL_RAW / TOTAL;

/** Where image `i` gives way — it starts to shrink and the next starts to grow.
 *  An image holds full size until every line it carries has finished being
 *  revealed, so nothing moves out from under a word still being written. */
export const SWAP_AT: number[] = LINES.map((_, i) => (bounds[i + 1] + holdRaw(i)) / TOTAL);

/** The scroll progress each caption line arrives at, in one flat list. */
export const captionArrivals: number[] = LINES.flatMap((_, i) =>
  lineOffsets(i).map((o) => (bounds[i + 1] + o) / TOTAL),
);

/**
 * The stretch a slot's clip is scrubbed across: from the frame the slot reaches
 * full size to the frame the film ends, which is also where the slot turns over
 * to its other face. `null` for a slot with no film.
 */
export function clipWindow(i: number): [number, number] | null {
  if (i !== CLIP_SLOT) return null;
  return [PHASES[i + 1], (bounds[i + 1] + VIDEO_RAW) / TOTAL];
}

/** How much scrolling takes a line from full strength down to the stack. */
export const DIM_SPAN = 0.1;

/**
 * Where the whole stack starts to leave; it is gone by 1.
 *
 * The last swap, so the captions go exactly as the images set off for their
 * tiles. Derived rather than written down: a fixed number here fell before the
 * last line had finished revealing as soon as the timeline was retuned, and the
 * stack began fading over a word still being written.
 */
export const STACK_FADE_START = SWAP_AT[SWAP_AT.length - 1];
