'use client';

import { useEffect, useState } from 'react';

/**
 * True only on devices with a fine pointer that genuinely supports hover
 * (i.e. desktop with a mouse). Used to keep hover-driven state/logic inert on
 * touch devices, so a tap goes straight to expansion instead of triggering a
 * "hover" state that never clears — the classic double-tap iOS/Android bug.
 */
export function useHasHoverSupport(): boolean {
  const [hasHover, setHasHover] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    setHasHover(mq.matches);
    const listener = (e: MediaQueryListEvent) => setHasHover(e.matches);
    mq.addEventListener('change', listener);
    return () => mq.removeEventListener('change', listener);
  }, []);

  return hasHover;
}
