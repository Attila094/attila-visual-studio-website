'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RAW_LINES, SVG_W, SVG_H } from './hero3d/logoLines';

/** Docked height, as a fraction of the menu pill's height — the same 70% the
 *  home hero's logo shrinks to, so the two read as one bar across the site. */
const DOCK_RATIO = 0.7;
/** Fallbacks used only for the first paint, before the nav can be measured. */
const FALLBACK = { centreY: 37, pillH: 34 };

/**
 * The logo, parked in the middle of the top bar and linking home.
 *
 * The home page is excluded: its hero owns a logo that draws in the centre and
 * then docks to this exact spot on scroll, so a second one would double up.
 *
 * The bar's height and vertical centre are measured rather than hard-coded —
 * the pills sit at `top-3` on phones and `top-5` from `sm` up, and their height
 * comes from their own type, so neither is a constant.
 */
export function DockedLogo() {
  const pathname = usePathname();
  const [box, setBox] = useState(FALLBACK);

  useEffect(() => {
    const measure = () => {
      // Both navs are queried and the hidden one skipped — it measures 0 high,
      // so this is right at either breakpoint.
      let rect: DOMRect | null = null;
      document.querySelectorAll<HTMLElement>('nav[aria-label]').forEach((n) => {
        const r = n.getBoundingClientRect();
        if (r.height > 0 && !rect) rect = r;
      });
      const r = rect as DOMRect | null;
      if (!r) return;
      setBox({ centreY: r.top + r.height / 2, pillH: r.height });
    };
    measure();
    const raf = requestAnimationFrame(measure);
    const t = setTimeout(measure, 500); // re-measure once the fonts settle
    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
      window.removeEventListener('resize', measure);
    };
  }, []);

  if (pathname === '/') return null;

  const height = box.pillH * DOCK_RATIO;
  const width = (height * SVG_W) / SVG_H;

  return (
    <Link
      href="/"
      aria-label="Home"
      className="fixed left-1/2 z-[75] -translate-x-1/2 transition-opacity hover:opacity-70"
      style={{ top: box.centreY - height / 2, width, height }}
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        preserveAspectRatio="xMidYMid meet"
        className="h-full w-full"
      >
        {RAW_LINES.map((l, i) => (
          <line
            key={i}
            x1={l.a[0]}
            y1={l.a[1]}
            x2={l.b[0]}
            y2={l.b[1]}
            stroke="#ffffff"
            strokeOpacity={l.o}
            strokeWidth={35}
            strokeLinecap="round"
          />
        ))}
      </svg>
    </Link>
  );
}
