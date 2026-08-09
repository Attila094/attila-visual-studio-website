'use client';

import { useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Anton, Poppins } from 'next/font/google';
import { AnimatePresence, motion } from 'framer-motion';
import { GLASS_RING, GLASS_STYLE } from '@/components/glass';
import type { InfoTrack } from '@/content/info';

const anton = Anton({ subsets: ['latin', 'latin-ext'], weight: '400' });
const geo = Poppins({ subsets: ['latin', 'latin-ext'], weight: ['300', '700'] });

/** Sampled out of `infopage.jpg` — the plate the artwork now sits under, and
 *  the panel that opens below the row. */
const TRACK = '#333333';
const PANEL = '#262626';

/**
 * How hard the artwork is thrown out of focus, as a percentage of a full blur.
 * The plates are a mood, not a portfolio: the label has to win, so the
 * photograph stays a wash behind it.
 */
const BLUR_FULL_PX = 28;
const BLUR_PERCENT = 20;
const BLUR_PX = (BLUR_FULL_PX * BLUR_PERCENT) / 100;

/** What a plate with no workflow written yet opens: the panel, empty, and the
 *  way to ask about it in the meantime. */
function ComingSoon() {
  return (
    <div
      style={{ backgroundColor: PANEL }}
      className="mt-3 flex min-h-[18rem] flex-col items-center justify-center gap-6 rounded-3xl p-6 text-center sm:mt-4 sm:p-9"
    >
      <p
        className={`${anton.className} text-[clamp(1.35rem,3.7vw,3.3rem)] uppercase leading-[1.1] tracking-[0.2em] text-white`}
      >
        Leírás hamarosan
      </p>
      <p
        className={`${geo.className} flex flex-wrap items-center justify-center gap-3 text-[clamp(0.9rem,1.75vw,1.6rem)] font-light text-white/40`}
      >
        Addig is
        <Link
          href="/contact"
          style={GLASS_STYLE}
          className={`${anton.className} rounded-full px-8 py-2 text-[clamp(0.9rem,1.9vw,1.7rem)] uppercase leading-none tracking-[0.01em] text-white ${GLASS_RING} transition-colors duration-300 hover:bg-white/25`}
        >
          Contact
        </Link>
      </p>
    </div>
  );
}

/**
 * The three tracks across the top of INFO, and whatever the pressed one opens
 * below the row.
 *
 * Everything written so far describes the LÁTVÁNYTERVEZÉS process, so that
 * plate owns the workflow panel. The other two open the same panel, empty, with
 * the way to ask about them in the meantime — one at a time, whichever was
 * pressed last, and pressing it again shuts it.
 */
export function InfoTracks({ tracks, children }: { tracks: InfoTrack[]; children: ReactNode }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <>
      <div className="mt-10 grid grid-cols-3 gap-4 sm:mt-14 sm:gap-6">
        {tracks.map((track, i) => {
          const face = (
            <>
              {/* Scaled up past its own frame: a blur bleeds transparency in
                  from the edges, and the overflow crop hides that. */}
              <Image
                src={track.image}
                alt=""
                fill
                sizes="33vw"
                style={{ filter: `blur(${BLUR_PX}px)`, transform: 'scale(1.12)' }}
                className="object-cover"
              />
              {/* The label reads white in the reference, and a blurred
                  photograph is not reliably dark. */}
              <span aria-hidden className="absolute inset-0 bg-black/45" />
              <span
                className={`${anton.className} relative whitespace-pre-line text-[clamp(1rem,4vw,3.6rem)] uppercase leading-[1.28] text-white`}
              >
                {track.label}
              </span>
            </>
          );

          const shell =
            'relative flex aspect-[719/997] items-center justify-center overflow-hidden rounded-2xl p-3 text-center';

          return (
            <button
              key={track.label}
              type="button"
              onClick={() => setOpen((v) => (v === i ? null : i))}
              aria-expanded={open === i}
              style={{ backgroundColor: TRACK }}
              className={`${shell} transition-transform duration-300 ease-out hover:scale-[1.01]`}
            >
              {face}
            </button>
          );
        })}
      </div>

      {/* Mounted only while open — the same fold the projects gallery uses.
          The key is the plate, so moving from one to another swaps the panel
          rather than leaving the first one's contents behind. */}
      <AnimatePresence initial={false}>
        {open !== null && (
          <motion.div
            key={open}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {open === 0 ? children : <ComingSoon />}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
