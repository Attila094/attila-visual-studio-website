/**
 * The panorama card's hover orbit.
 *
 * Two copies of the same equirectangular render sit side by side and the track
 * slides left by exactly one of them (`tile-pan`, in globals.css). Because the
 * right edge of an equirectangular image continues into its own left edge, the
 * end of the cycle is pixel-identical to the start — the view simply keeps
 * turning, with no seam and no snap back.
 *
 * It is parked rather than unmounted, so hovering resumes the orbit from where
 * it stopped instead of jumping back to the start. Expects a `group` ancestor.
 */
export function PanTrack({ src }: { src: string }) {
  return (
    <span
      aria-hidden
      className="absolute inset-y-0 left-0 flex w-max animate-[tile-pan_40s_linear_infinite] [animation-play-state:paused] group-hover:[animation-play-state:running]"
    >
      {[0, 1].map((i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={i}
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-auto max-w-none"
        />
      ))}
    </span>
  );
}
