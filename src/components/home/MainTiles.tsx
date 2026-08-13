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
    // On a phone the five stand in one column and SHARE THE SCREEN between
    // them: five equal rows filling everything from under the fixed header to
    // the foot of the window, with only a hairline between. Their height comes
    // from the screen rather than from a ratio, which is why this is a fixed
    // height and five rows rather than an aspect — the shape the sequence's
    // images shrink into there is the same, so the pile it builds and the row
    // it lands on are one arrangement.
    //
    // `svh`, not `dvh`: a phone's chrome slides as you scroll and `dvh` would
    // follow it, resizing the tiles — and the sequence measures these to know
    // where to fly.
    //
    // From `sm` up there is room to stand them side by side, and they take
    // their 3:4 portrait and their automatic height back.
    <div
      aria-hidden
      className="relative grid h-[calc(100svh-5.5rem)] grid-cols-1 grid-rows-5 gap-1.5 sm:h-auto sm:grid-cols-3 sm:grid-rows-none sm:gap-3 lg:grid-cols-5"
    >
      {mainTiles.map((tile, i) => (
        <div key={tile.id} data-main-tile={i} className="rounded-2xl sm:aspect-[3/4]" />
      ))}
    </div>
  );
}
