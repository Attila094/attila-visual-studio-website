'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { animate, useMotionValue, useTransform, type MotionValue } from 'framer-motion';

/** Duration of one automatic image handoff. */
const STEP_DURATION = 0.9;
/** Slow-in / slow-out so the scale-up never looks linear. */
const STEP_EASE = [0.65, 0, 0.35, 1] as const;
/** Wheel delta that must build up before a step fires — filters out jitter. */
const TRIGGER_DELTA = 24;
/** Ignore wheel input this long after a step lands (trackpad momentum tail). */
const COOLDOWN_MS = 140;

/** True modulo — JS `%` keeps the sign, which breaks scrolling backwards. */
export const wrap = (i: number, n: number) => ((i % n) + n) % n;

export interface PinnedScroll {
  /** Attach to the element that should pin the page while hovered. */
  containerRef: React.RefObject<HTMLDivElement>;
  /** Unbounded float. floor() = current index, fraction = handoff progress. */
  progress: MotionValue<number>;
  /** Handoff fraction of the current transition, 0 → 1. */
  t: MotionValue<number>;
  /** Index of the image currently featured (already wrapped into 0…n-1). */
  index: number;
  /** Animate exactly one image forward/back. Used by the touch swipe. */
  step: (dir: 1 | -1) => void;
}

/**
 * Scroll-progress engine for the pinned gallery.
 *
 * THE MATH
 * Everything derives from one unbounded float, `progress`:
 *
 *   index = wrap(floor(progress), n)   → which image is featured
 *   t     = progress - floor(progress) → 0…1 handoff fraction
 *
 * One whole unit of progress == one complete handoff. Because index and t are
 * *derived* rather than stored, the sequence reverses for free (progress
 * decreases → t runs backwards) and loops for free (wrap() is unbounded in
 * both directions).
 *
 * MOTION MODEL
 * Progress is NOT tied directly to scroll distance — raw wheel deltas arrive in
 * coarse, uneven chunks, which is what made the transition feel steppy. Instead
 * each scroll gesture *triggers* one eased animation that plays out on its own,
 * so every handoff is identical and smooth regardless of how the wheel behaved.
 * A busy-lock plus a short cooldown collapses one gesture (and any trackpad
 * momentum after it) into exactly one image.
 *
 * PINNING
 * The wheel is only intercepted when all three hold: the device has a hovering
 * pointer, the cursor is inside the container, and the container has settled in
 * the viewport. Otherwise the event is left alone and the page scrolls — moving
 * the cursor out of the container is always an escape hatch.
 */
export function usePinnedScrollProgress(
  count: number,
  enabled: boolean,
  reduced = false,
): PinnedScroll {
  const containerRef = useRef<HTMLDivElement>(null);
  const progress = useMotionValue(0);
  const t = useTransform(progress, (p) => p - Math.floor(p));
  const [index, setIndex] = useState(0);

  const busy = useRef(false);
  const accum = useRef(0);
  const countRef = useRef(count);
  countRef.current = count;

  // Only re-render when the *integer* image changes, not every frame.
  useEffect(() => {
    const sync = (p: number) => setIndex(wrap(Math.floor(p), countRef.current));
    sync(progress.get());
    return progress.on('change', sync);
  }, [progress]);

  const step = useCallback(
    (dir: 1 | -1) => {
      if (busy.current) return;
      busy.current = true;
      accum.current = 0;
      animate(progress, Math.round(progress.get()) + dir, {
        duration: reduced ? 0.01 : STEP_DURATION,
        ease: STEP_EASE,
        onComplete: () => {
          window.setTimeout(() => {
            busy.current = false;
            accum.current = 0;
          }, COOLDOWN_MS);
        },
      });
    },
    [progress, reduced],
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !enabled) return;

    const hovering = { current: false };
    const onEnter = () => {
      hovering.current = true;
    };
    const onLeave = () => {
      hovering.current = false;
      accum.current = 0;
    };

    const settled = () => {
      const r = el.getBoundingClientRect();
      // The container's bottom edge has reached the viewport bottom.
      return r.bottom <= window.innerHeight + 2 && r.top < window.innerHeight;
    };

    const onWheel = (e: WheelEvent) => {
      if (!hovering.current || !settled()) return;
      // Pin the page while the gallery owns the wheel.
      e.preventDefault();
      if (busy.current) return;
      accum.current += e.deltaY;
      if (Math.abs(accum.current) < TRIGGER_DELTA) return;
      step(accum.current > 0 ? 1 : -1);
    };

    el.addEventListener('pointerenter', onEnter);
    el.addEventListener('pointerleave', onLeave);
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('pointerenter', onEnter);
      el.removeEventListener('pointerleave', onLeave);
      el.removeEventListener('wheel', onWheel);
    };
  }, [enabled, step]);

  return { containerRef, progress, t, index, step };
}
