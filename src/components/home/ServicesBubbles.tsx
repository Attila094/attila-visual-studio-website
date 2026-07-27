'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { serviceBubbles } from '@/content/serviceBubbles';
import { useHasHoverSupport } from '@/lib/useHasHoverSupport';

// Base tile geometry (px). Kept as numbers so Framer can spring width/height.
const BASE_W = 200;
const BASE_H = 140;
// Extra width added to the blob per sub-service.
const SUB_UNIT = 96;

// Corner radii, written in the 8-value elliptical form so Framer can smoothly
// interpolate all eight numbers. Rest = soft rounded rectangle; active = an
// irregular organic blob (distinct per-corner radii).
const REST_RADIUS = '10% 10% 10% 10% / 14% 14% 14% 14%';
const BLOB_RADIUS = '42% 58% 38% 62% / 56% 44% 60% 40%';

// Under-damped spring → elastic overshoot + a little wobble on settle.
const blobSpring = { type: 'spring', stiffness: 110, damping: 10, mass: 0.9 } as const;

export function ServicesBubbles() {
  const hasHover = useHasHoverSupport();
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    // pb reserves room for the downward growth so the page never reflows and
    // the blob doesn't reach the projects section below.
    <section id="szolgaltatasok" className="relative z-20 scroll-mt-24 bg-paper">
      <div className="mx-auto max-w-shell px-5 pb-40 pt-16 sm:px-8">
        <p className="mb-8 text-xs font-medium uppercase tracking-[0.2em] text-muted">
          Szolgáltatások
        </p>

        <div className="flex flex-wrap justify-center gap-5">
          {serviceBubbles.map((service) => {
            const active = activeId === service.id;
            // Sideways growth = base tile + one unit per sub-service.
            const expandedW = BASE_W + service.subServices.length * SUB_UNIT;

            return (
              // Placeholder holds the base footprint in flow → zero layout shift.
              <div
                key={service.id}
                className="relative"
                style={{ width: BASE_W, height: BASE_H }}
                onMouseEnter={hasHover ? () => setActiveId(service.id) : undefined}
                onMouseLeave={hasHover ? () => setActiveId(null) : undefined}
                onClick={
                  !hasHover
                    ? () => setActiveId((cur) => (cur === service.id ? null : service.id))
                    : undefined
                }
              >
                {/* The blob. Absolute + anchored top-left, so it grows right and
                    down while overlapping surrounding content. Width, height and
                    border-radius all animate together on one spring. */}
                <motion.div
                  className={`absolute left-0 top-0 flex flex-col items-center justify-center gap-3 overflow-hidden p-6 text-center transition-colors duration-300 ${
                    active
                      ? 'bg-ink text-paper shadow-2xl'
                      : 'border border-line bg-paper text-ink'
                  }`}
                  style={{ zIndex: active ? 30 : 1, willChange: 'width, height, border-radius' }}
                  initial={false}
                  animate={{
                    width: active ? expandedW : BASE_W,
                    height: active ? BASE_H * 2 : BASE_H,
                    borderRadius: active ? BLOB_RADIUS : REST_RADIUS,
                  }}
                  transition={blobSpring}
                >
                  {/* Content lives in the blob's centre — the safe zone the
                      organic corner curves never reach. */}
                  <div>
                    <h3 className="text-base font-medium leading-tight tracking-tight">
                      {service.title}
                    </h3>
                    <span
                      className={`mt-0.5 block text-xs tabular-nums ${
                        active ? 'text-paper/50' : 'text-muted'
                      }`}
                    >
                      {service.index}
                    </span>
                  </div>

                  {!active && (
                    <span className="text-xs text-muted">
                      {service.subServices.length} szolgáltatás
                    </span>
                  )}

                  {/* Pills fade + rise in only after the morph has begun. */}
                  <AnimatePresence>
                    {active && (
                      <motion.ul
                        className="flex flex-wrap justify-center gap-2"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ delay: 0.18, duration: 0.3, ease: 'easeOut' }}
                      >
                        {service.subServices.map((sub) => (
                          <li
                            key={sub}
                            className="whitespace-nowrap rounded-full border border-paper/25 px-3 py-1 text-xs"
                          >
                            {sub}
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
