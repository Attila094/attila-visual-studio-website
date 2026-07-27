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
