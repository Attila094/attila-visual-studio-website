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

/**
 * One caption line's reveal — the unit everything else is expressed in.
 *
 * The whole timeline is normalised at the end, and the scroll it is spread over
 * is decided by the page, not here: a line's share of it is REVEAL_RAW/TOTAL.
 * So doubling this alone does NOT double the scrolling a word takes — it takes
 * the difference out of every other beat, which all speed up by the same
 * fraction. What gives a reveal twice the scroll and leaves the rest untouched
 * is doubling this AND lengthening the runway by the same ratio the total grew,
 * which is what RUNWAY_VH now carries.
 */
const REVEAL_RAW = 8;
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

/**
 * Lines whose reveal runs longer than the standard one, as a multiple of it.
 *
 * Keyed by the word rather than by its row — the same way the caption colours
 * are — so a long reveal travels with the line it was given to and cannot drift
 * onto its neighbour the next time the list is re-ordered.
 */
const REVEAL_MULTIPLE: Record<string, number> = {
  Fotográfia: 2,
  Grafika: 2,
};

/**
 * How much scrolling each line of group `i` takes to uncover.
 *
 * This is the primitive the rest of a group's shape is derived from. One reveal
 * by default; a multiple of it for the lines above; and the film's whole
 * stretch for the word over the clip, so those two are one gesture — the word
 * begins with the first frame and finishes on the last.
 */
const lineSpans = (i: number): number[] =>
  captionGroups[i].map((line, j) =>
    i === CLIP_SLOT && j === 0 ? VIDEO_RAW : REVEAL_RAW * (REVEAL_MULTIPLE[line] ?? 1),
  );

/**
 * Where each line of group `i` arrives, measured from the moment that image
 * reaches full size.
 *
 * A line lands as the one before it finishes, so this is just the running sum
 * of the spans above. Derived rather than written down: the offsets used to be
 * `j * REVEAL_RAW`, which quietly assumed every reveal was the same length, and
 * a line given a longer one would have had its neighbour land on top of it
 * halfway through.
 */
const lineOffsets = (i: number): number[] => {
  const offsets: number[] = [];
  let at = 0;
  for (const span of lineSpans(i)) {
    offsets.push(at);
    at += span;
  }
  return offsets;
};

/**
 * How long image `i` holds at full size before giving way: until its last line
 * has finished being written, so nothing moves out from under a word still
 * being drawn. Derived from the spans for the same reason the offsets are.
 */
const holdRaw = (i: number): number => {
  const spans = lineSpans(i);
  return Math.max(...lineOffsets(i).map((o, j) => o + spans[j]));
};

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

/** How much scrolling opens each line's reveal, from covered to fully
 *  uncovered — one entry per line, in the same order as `captionArrivals`. */
export const captionSpans: number[] = LINES.flatMap((_, i) =>
  lineSpans(i).map((s) => s / TOTAL),
);

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
 *
 * Identical, now, to the window its first caption is revealed across — the word
 * and the picture are given the same stretch on purpose. They are still worked
 * out separately rather than one deferring to the other, because they answer
 * different questions and only happen to agree.
 */
export function clipWindow(i: number): [number, number] | null {
  if (i !== CLIP_SLOT) return null;
  return [PHASES[i + 1], (bounds[i + 1] + VIDEO_RAW) / TOTAL];
}

/** How much scrolling takes a line from full strength down to the stack. */
export const DIM_SPAN = 0.1;

/**
 * How much scrolling takes each line from full strength down to the stack.
 *
 * Every line begins to give way the moment it arrives — the dim and the reveal
 * overlap, which is what makes a line read as being written and handed on in
 * one gesture — so where each starts is simply `captionArrivals`.
 *
 * One DIM_SPAN, except in two cases.
 *
 * A line given a longer reveal is given a fade to match, off the same multiple
 * — so the two keep the relationship every other line has, where the fade
 * outlasts the reveal by about four fifths and a word therefore stands at
 * roughly half strength the moment it is finished. Left on the shared span, a
 * doubled reveal simply outran it: FOTOGRÁFIA and GRAFIKA reached the stack's
 * 10% while their last quarter was still being drawn. Reading it off
 * REVEAL_MULTIPLE rather than writing it twice means the two cannot come apart
 * later.
 *
 * And the word over the film fades across the FILM's window: full strength on
 * the first frame, down to the stack exactly as the last one lands, so the word
 * and the picture finish together. That one is deliberately the exception to the
 * paragraph above — its fade and its reveal cover the same stretch, which is the
 * whole point of it.
 */
export const captionDimSpans: number[] = captionGroups.flatMap((group, i) =>
  group.map((line, j) =>
    i === CLIP_SLOT && j === 0 ? VIDEO_RAW / TOTAL : DIM_SPAN * (REVEAL_MULTIPLE[line] ?? 1),
  ),
);

/**
 * Where the whole stack starts to leave; it is gone by 1.
 *
 * The last swap, so the captions go exactly as the images set off for their
 * tiles. Derived rather than written down: a fixed number here fell before the
 * last line had finished revealing as soon as the timeline was retuned, and the
 * stack began fading over a word still being written.
 */
export const STACK_FADE_START = SWAP_AT[SWAP_AT.length - 1];
