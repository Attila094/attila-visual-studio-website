'use client';

import { useEffect, useState } from 'react';

/** Every ten seconds the two words trade places. */
const INTERVAL_MS = 10_000;

/**
 * The two words each slot can hold. Whichever one is first carries the
 * sentence's capital, so the heading stays correct Hungarian either way round.
 */
const SLOTS = [
  ['Mérnöki', 'Művészi'],
  ['művészi', 'mérnöki'],
] as const;

/**
 * One word, on a two-word reel. The reel is exactly two line-heights tall
 * inside a one-line window, so rolling it half its height swaps the word the
 * way a split-flap does.
 *
 * `align-top` is what keeps the baseline: with the window one line tall and its
 * rows set to the same leading as the heading, aligning their tops aligns their
 * baselines exactly.
 */
function Reel({ words, flipped }: { words: readonly [string, string]; flipped: boolean }) {
  return (
    <span className="inline-grid h-[1.25em] overflow-hidden align-top">
      <span
        style={{ transform: flipped ? 'translateY(-50%)' : 'none' }}
        // Half a second of stillness after the beat, then a second of travel
        // that gathers pace and settles again — a symmetric ease, so the word
        // is quickest as it passes the window's middle.
        className="grid transition-transform delay-500 duration-1000 ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none"
      >
        <span className="block h-[1.25em] leading-[1.25em]">{words[0]}</span>
        <span className="block h-[1.25em] leading-[1.25em]">{words[1]}</span>
      </span>
    </span>
  );
}

/**
 * "Mérnöki és művészi látásmód együttesen" — the two adjectives swap seats on a
 * ten-second beat, each rolling past the other.
 *
 * Both reels are as wide as the wider of their two words, so the words around
 * them never move when the swap happens.
 */
export function SwapHeading({ className }: { className?: string }) {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setFlipped((v) => !v), INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <h2 className={className} aria-label="Mérnöki és művészi látásmód együttesen">
      <span aria-hidden>
        <Reel words={SLOTS[0]} flipped={flipped} />
        {' és '}
        <Reel words={SLOTS[1]} flipped={flipped} />
        {' látásmód együttesen'}
      </span>
    </h2>
  );
}
