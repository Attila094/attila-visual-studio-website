'use client';

import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import type { ArchSequence } from '@/content/architectureProjects';

/**
 * How far the scene is held still while its animation is drawn out, in pixels
 * of scroll. Ninety frames over this distance is about twelve pixels a frame —
 * slow enough to read as drawing, fast enough that nobody has to wheel at it.
 */
const SCRUB = 900;

/**
 * How much of the approach counts towards the drawing, before the scene parks.
 *
 * Without it the row arrives empty and only starts drawing once it has stopped,
 * which reads as something failing to load. With it the line is already being
 * laid down as the row rises into place.
 */
const LEAD = 260;

/** How far the scroll carries a text element from hidden to arrived. */
const CUE_SPAN = 0.1;

const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/**
 * A block that parks under the stacked bars while the scroll plays it.
 *
 * The wrapper is the content plus `SCRUB` pixels of empty space below it, and
 * the content is sticky inside that wrapper — so the pin lasts exactly as long
 * as that space, and `progress` is simply how far into it the page has come.
 *
 * The space is a spacer element and NOT padding on the wrapper: a sticky box is
 * held inside its containing block, which is the parent's CONTENT box, so
 * padding below it buys no travel at all and the pin silently never happens.
 *
 * The scroll is read straight rather than through a spring: a drawing
 * that keeps going after the wheel has stopped feels like it is playing itself,
 * which is the one thing a scrubbed animation must not do.
 */
export function ScrubScene({
  stick,
  children,
}: {
  /** Where the content parks — the foot of this section's bar in the stack. */
  stick: number;
  children: (progress: MotionValue<number>) => ReactNode;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const progress = useMotionValue(0);

  useEffect(() => {
    let raf = 0;
    const span = LEAD + SCRUB;

    const update = () => {
      raf = 0;
      const el = wrap.current;
      if (!el) return;
      progress.set(clamp((stick + LEAD - el.getBoundingClientRect().top) / span));
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [progress, stick]);

  return (
    <div ref={wrap}>
      <div className="sticky" style={{ top: stick }}>
        {children(progress)}
      </div>
      <div aria-hidden style={{ height: SCRUB }} />
    </div>
  );
}

/**
 * A text element cued by the scene's own progress rather than by its arrival
 * on screen.
 *
 * Inside a parked scene everything is on screen from the first frame, so
 * `whileInView` would fire the lot at once. Tied to the scroll instead, each
 * one arrives at its own point in the drawing — and goes away again on the way
 * back up, which is what makes the block feel driven by the hand on the wheel.
 */
export function Staged({
  at,
  progress,
  className,
  children,
}: {
  /** Where in the scene, 0–1, this element begins to arrive. */
  at: number;
  progress: MotionValue<number>;
  className?: string;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();
  const opacity = useTransform(progress, [at, at + CUE_SPAN], [0, 1]);
  const y = useTransform(progress, [at, at + CUE_SPAN], [reduce ? 0 : 20, 0]);
  return (
    <motion.div className={className} style={{ opacity, y }}>
      {children}
    </motion.div>
  );
}

/**
 * The animation itself: numbered frames drawn to a canvas, one per position of
 * the scroll. The map that draws itself and the maquette that unrolls are the
 * same machine with a different folder of frames.
 *
 * A canvas rather than a hundred stacked `<img>`s, which would be a hundred
 * elements for the compositor to keep in play, and rather than a video, which
 * cannot be scrubbed backwards without stalling. The canvas is sized in frame
 * pixels and scaled by CSS, so it is drawn at the source's own resolution
 * however wide the column happens to be.
 *
 * Frames are fetched only once the section is within a screen and a half, so a
 * visitor who never scrolls this far never pays for them.
 */
export function FrameSequence({
  sequence,
  progress,
}: {
  sequence: ArchSequence;
  progress: MotionValue<number>;
}) {
  const { dir, frames, width, height, alt } = sequence;
  const canvas = useRef<HTMLCanvasElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const images = useRef<HTMLImageElement[]>([]);
  /** The frame currently on the canvas, so a scroll that does not change it
   *  costs nothing. -1 while the canvas is still blank. */
  const drawn = useRef(-1);
  const reduce = useReducedMotion();

  const draw = useCallback(
    (p: number) => {
      const c = canvas.current;
      if (!c) return;
      // Reduced motion gets the finished drawing and no scrubbing at all.
      const i = reduce
        ? frames - 1
        : Math.min(frames - 1, Math.max(0, Math.round(p * (frames - 1))));
      if (i === drawn.current) return;
      const img = images.current[i];
      // Not here yet: leave the last good frame up. The image's own load
      // handler comes back for this.
      if (!img?.complete || img.naturalWidth === 0) return;
      const ctx = c.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0, c.width, c.height);
      drawn.current = i;
    },
    [frames, reduce],
  );

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let live = true;

    const load = () => {
      images.current = Array.from({ length: frames }, (_, i) => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => {
          if (live) draw(progress.get());
        };
        img.src = `${dir}/${String(i + 1).padStart(2, '0')}.webp`;
        return img;
      });
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          load();
        }
      },
      { rootMargin: '150% 0px' },
    );
    io.observe(el);

    return () => {
      live = false;
      io.disconnect();
    };
  }, [dir, draw, frames, progress]);

  useMotionValueEvent(progress, 'change', draw);

  return (
    <div
      ref={host}
      className="relative w-full"
      // The ceiling is what the parked row has room for: the stack above it,
      // the section's own padding, and nothing left over. Past that the canvas
      // letterboxes inside the box rather than running off the bottom of a
      // short window, where the end of the drawing could never be seen.
      style={{ aspectRatio: `${width} / ${height}`, maxHeight: 'calc(100vh - 15rem)' }}
    >
      <canvas
        ref={canvas}
        width={width}
        height={height}
        role="img"
        aria-label={alt}
        className="h-full w-full object-contain"
      />
    </div>
  );
}
