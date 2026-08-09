'use client';

import { useEffect, useState } from 'react';

const TEXT = '“Alkotás és értékteremtés, építészet és vizualizáció segítségével…”';
/** The breath in the middle of the line — the comma the sentence turns on. */
const PAUSE_AFTER = 'értékteremtés,';
/** The whole line, start to finish. */
const TOTAL_MS = 2000;
const PAUSE_MS = 320;

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
