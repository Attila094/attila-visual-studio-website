'use client';

import { useEffect, useState } from 'react';

const TEXT = '“Alkotás és értékteremtés, építészet és vizualizáció…”';
/** The breath in the middle of the line — the comma the sentence turns on. */
const PAUSE_AFTER = 'értékteremtés,';
/**
 * The whole line, start to finish — and it really is the whole of it: the
 * per-character step is what is left after the pause, divided by the line, so
 * the elapsed time comes to exactly this figure however long the sentence gets.
 *
 * Both numbers doubled together, which makes this the same typing at half
 * speed rather than a slower line with the same beat stapled into it — the
 * breath after the comma keeps its proportion to the words either side of it.
 */
const TOTAL_MS = 4000;
const PAUSE_MS = 640;

/**
 * The hero quote, typed out over two seconds with a beat after
 * "értékteremtés,".
 *
 * Every character is in the DOM from the first frame and only its opacity
 * changes: the quote is absolutely positioned and centred on its own height, so
 * a string that actually grew would re-wrap and shift itself while it typed.
 * The full line is the element's accessible name, so a screen reader reads it
 * once, whole, rather than a stream of letters.
 */
export function TypedQuote() {
  const chars = [...TEXT];
  /** Type the comma, then wait. */
  const pauseAt = TEXT.indexOf(PAUSE_AFTER) + PAUSE_AFTER.length;

  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(chars.length);
      return;
    }
    const step = (TOTAL_MS - PAUSE_MS) / chars.length;
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      i += 1;
      setShown(i);
      if (i >= chars.length) return;
      timer = setTimeout(tick, step + (i === pauseAt ? PAUSE_MS : 0));
    };
    timer = setTimeout(tick, step);
    return () => clearTimeout(timer);
    // The string is a constant; this runs once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <span aria-label={TEXT}>
      {chars.map((c, i) => (
        <span key={i} aria-hidden style={{ opacity: i < shown ? 1 : 0 }}>
          {c}
        </span>
      ))}
    </span>
  );
}
