'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import type { AnimationPlaybackControls, PanInfo } from 'framer-motion';

/** Decay time constant of the fling, in seconds. It doubles as the projection:
 *  a glide that decays over τ travels velocity × τ, so that is where the throw
 *  is aimed. */
const GLIDE_SECONDS = 0.35;

/**
 * A drag-to-look viewer for an equirectangular (360°) render.
 *
 * Two things make it work:
 *
 * 1. **The image is wider than the frame.** It is laid out at `zoom` times the
 *    frame's height, so a 2:1 render is `zoom` times the frame's width too, and
 *    only a slice of the room is on screen at once. `zoom = 2` shows a quarter
 *    turn — about a 90° field of view, which reads like standing in the room.
 *
 * 2. **The loop is real, not a rewind.** The right edge of an equirectangular
 *    render continues into its own left edge, so the track holds several
 *    identical copies and the rendered offset is the drag distance folded back
 *    into one copy's width. Whole copies are invisible: the view keeps turning
 *    in one direction forever, and there is no seam and no snap back.
 *
 * The drag distance itself is never clamped — that is what lets Framer's
 * inertia keep a fling running past the end of a copy.
 */
export function PanoramaViewer({
  src,
  /** Announced to screen readers; the viewer is a figure, not decoration. */
  label = '360°-os panoráma — húzd a képet a körbenézéshez',
  /** Height multiple of the frame. Higher zooms in and narrows the view. */
  zoom = 2,
  className = '',
}: {
  src: string;
  label?: string;
  zoom?: number;
  className?: string;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const glide = useRef<AnimationPlaybackControls | null>(null);

  const [frameWidth, setFrameWidth] = useState(0);
  const [copyWidth, setCopyWidth] = useState(0);

  /** Unbounded: it keeps counting, which is what gives a fling its physics. */
  const turn = useMotionValue(0);
  /** The same value folded into one copy — what actually gets rendered. */
  const offset = useTransform(turn, (v) =>
    copyWidth > 0 ? (((v % copyWidth) + copyWidth) % copyWidth) - copyWidth : 0,
  );

  // The copy width follows the frame, which follows the viewport — so it is
  // measured rather than computed, and the viewer stays correct at any size.
  useEffect(() => {
    const frame = frameRef.current;
    const image = imageRef.current;
    if (!frame || !image) return;

    // Layout widths, not `getBoundingClientRect` — the panel this sits in
    // morphs open under a Framer scale, and a visual rect would measure the
    // frame and the image at two different moments of that animation.
    const measure = () => {
      setFrameWidth(frame.clientWidth);
      setCopyWidth(image.offsetWidth);
    };
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(frame);
    ro.observe(image);
    // A cached image can be laid out before `load` fires; a decoded one after.
    image.addEventListener('load', measure);
    return () => {
      ro.disconnect();
      image.removeEventListener('load', measure);
    };
  }, [src, zoom]);

  // One copy either side of the frame is enough to cover it at any offset.
  const copies = copyWidth > 0 ? Math.max(2, Math.ceil(frameWidth / copyWidth) + 1) : 2;

  const stopGlide = useCallback(() => {
    glide.current?.stop();
    glide.current = null;
  }, []);

  const onPan = useCallback(
    (_: PointerEvent, info: PanInfo) => turn.set(turn.get() + info.delta.x),
    [turn],
  );

  const onPanEnd = useCallback(
    (_: PointerEvent, info: PanInfo) => {
      // The target has to be projected by hand: `animate` treats its keyframe
      // as the destination even under an inertia transition, so aiming at the
      // current value produces a fling that goes nowhere.
      glide.current = animate(turn, turn.get() + info.velocity.x * GLIDE_SECONDS, {
        type: 'inertia',
        velocity: info.velocity.x,
        timeConstant: GLIDE_SECONDS * 1000,
      });
    },
    [turn],
  );

  // Arrow keys turn the view too, so the panorama is not pointer-only.
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const direction = e.key === 'ArrowLeft' ? 1 : e.key === 'ArrowRight' ? -1 : 0;
      if (!direction) return;
      e.preventDefault();
      stopGlide();
      const step = (e.shiftKey ? frameWidth : frameWidth / 6) * direction;
      glide.current = animate(turn, turn.get() + step, { duration: 0.4, ease: 'easeOut' });
    },
    [frameWidth, stopGlide, turn],
  );

  useEffect(() => stopGlide, [stopGlide]);

  return (
    <figure
      ref={frameRef}
      className={`relative aspect-[2/1] w-full overflow-hidden rounded-xl bg-white/5 ${className}`}
    >
      <motion.div
        // Framer owns this element's transform, so the vertical centring is a
        // motion value too — a Tailwind `-translate-y-1/2` would be overwritten.
        style={{ x: offset, y: '-50%', height: `${zoom * 100}%` }}
        className="absolute left-0 top-1/2 flex will-change-transform"
      >
        {Array.from({ length: copies }, (_, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            ref={i === 0 ? imageRef : undefined}
            src={src}
            alt=""
            draggable={false}
            loading="lazy"
            decoding="async"
            className="h-full w-auto max-w-none select-none"
          />
        ))}
      </motion.div>

      {/* The gesture surface stays put while the track moves under it, so the
          pointer never loses the element it grabbed. `touch-pan-y` leaves
          vertical scrolling to the browser and takes horizontal for us. */}
      <motion.div
        aria-label={label}
        tabIndex={0}
        onPanStart={stopGlide}
        onPan={onPan}
        onPanEnd={onPanEnd}
        onKeyDown={onKeyDown}
        className="absolute inset-0 cursor-grab touch-pan-y outline-none ring-inset focus-visible:ring-2 focus-visible:ring-white/60 active:cursor-grabbing"
      />
    </figure>
  );
}
