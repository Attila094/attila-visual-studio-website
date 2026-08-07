/**
 * The tile row on the home page.
 *
 * Every WORK link on the site points here rather than at `/`: the visitor asked
 * for the work, not for the hero's scroll sequence, so they arrive with the
 * five tiles already on screen. Only the docked logo still opens the page at
 * the top, where the sequence starts.
 *
 * <HeroImageSequence> watches for this hash and drops its one-shot pauses when
 * it sees it — the pauses pace a scroll *through* the sequence, and a jump
 * straight to the end isn't one.
 */
export const WORK_ANCHOR = 'munkak';
export const WORK_HASH = `#${WORK_ANCHOR}`;
export const WORK_HREF = `/${WORK_HASH}`;
