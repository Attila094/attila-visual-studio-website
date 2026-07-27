'use client';

import { mainTiles } from '@/content/mainTiles';

/**
 * The tile row — as LAYOUT ONLY.
 *
 * The visible tiles are the five images from <HeroImageSequence>: they fly to
 * these rects at the end of the sequence and become the buttons themselves.
 * What stays here is the grid that decides where those rects are, so the
 * gallery below still gets pushed down by a real element and the sequence has
 * something to measure (`data-main-tile`).
 */
export function MainTiles() {
  return (
    <div
      aria-hidden
      className="relative grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
    >
      {mainTiles.map((tile, i) => (
        <div key={tile.id} data-main-tile={i} className="aspect-[3/4] rounded-2xl" />
      ))}
    </div>
  );
}
