'use client';

import { useEffect, useState } from 'react';

/**
 * The viewport height, held still while a phone slides its chrome.
 *
 * A mobile browser grows and shrinks its own viewport as you scroll: the bar
 * along the bottom drops away on the way down and comes back on the way up.
 * Anything sized in viewport units follows it. On most pages that is invisible,
 * because their height comes from their content — but the home page IS four
 * viewports of deliberate height, so the document would shorten under a fixed
 * scroll position and the whole page would jump.
 *
 * `svh` alone should hold (it is the *small* viewport — static by definition),
 * but the sequence also measures the height in JavaScript every frame, and both
 * have to agree. So the height is taken once and then held: it only follows a
 * change of width — a rotation, or a desktop window being dragged — or a change
 * of height too large to be a browser bar.
 *
 * Returns 0 until mounted; render a `svh` fallback until then.
 */
export function useHeldViewportHeight(): number {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    let w = window.innerWidth;
    let h = window.innerHeight;
    setHeight(h);

    const onResize = () => {
      const nextW = window.innerWidth;
      const nextH = window.innerHeight;
      // A fifth of the screen: far more than any browser bar, far less than a
      // rotation or a window drag.
      if (nextW !== w || Math.abs(nextH - h) > h * 0.2) {
        w = nextW;
        h = nextH;
        setHeight(nextH);
      }
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return height;
}
