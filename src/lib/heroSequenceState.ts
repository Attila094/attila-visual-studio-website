'use client';

import { motionValue } from 'framer-motion';

/**
 * Shared state between <HeroImageSequence> and <MainLayout>, which are siblings
 * in the page tree with no common owner. A module-scoped motion value keeps
 * them in sync without threading a provider through the layout — it lives for
 * the lifetime of the tab, exactly like the sequence itself.
 *
 * The five images ARE the tiles once they land, so the selected tile is owned
 * here: the sequence sets it on click, and <MainLayout> reads it to decide
 * which projects gallery to open underneath.
 */
export const selectedTile = motionValue<string | null>(null);

/**
 * The scroll position at which the hero logo finishes docking into the top bar,
 * published by <HeroExperience> because only it knows the measurement.
 *
 * The sequence waits for it before typing its first caption — a line landing
 * letter by letter while the logo is still travelling reads as two animations
 * fighting for the same moment. Zero until measured, which fails open: a page
 * without the hero simply has nothing to wait for.
 */
export const logoDockEnd = motionValue(0);

/**
 * The scroll position the sequence ends on — and, once it has ended, the lowest
 * the page may be scrolled to.
 *
 * The sequence plays once. Everything above the landing is therefore spent: a
 * hero that cannot be re-entered and four screens of runway with nothing left
 * in them, which is the black void you get if the page will still scroll up
 * into it. So the landing becomes the floor, and the page simply stops there.
 *
 * Published here rather than kept inside <HeroImageSequence> because the hero's
 * own docked logo is a "back to the top" link, and with a floor in force the
 * top it should go to is this, not zero. Nought until the landing, which fails
 * open: no floor, no clamping, and a page without the sequence is unaffected.
 */
export const sequenceFloor = motionValue(0);
