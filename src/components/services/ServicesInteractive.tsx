'use client';

import { useState } from 'react';
import { Bebas_Neue } from 'next/font/google';
import { AnimatePresence, motion } from 'framer-motion';
import { services } from '@/content/services';
import { useHasHoverSupport } from '@/lib/useHasHoverSupport';
import { morphSpring } from '@/lib/motion';
import { ServiceForm } from './ServiceForm';

const bebas = Bebas_Neue({ subsets: ['latin'], weight: '400' });

function serviceLayoutId(id: string) {
  return `service-tile-${id}`;
}

export function ServicesInteractive() {
  const hasHover = useHasHoverSupport();
  // The tile currently opened — driven by hover on desktop, tap on touch.
  const [activeId, setActiveId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const expanded = services.find((s) => s.id === expandedId) ?? null;

  function openForm(serviceId: string, option: string) {
    setSelectedOption(option);
    setExpandedId(serviceId);
  }

  function closeForm() {
    setExpandedId(null);
    setSelectedOption(null);
  }

  return (
    // While expanded the panel replaces the grid in normal flow, so it sizes to
    // its own content (the enquiry form used to be clipped inside a fixed-height
    // absolutely-positioned box).
    <div className={`relative ${expanded ? '' : 'min-h-[440px] sm:min-h-[420px]'}`}>
      {/* Soft colour field sitting behind the tiles — the liquid-glass blur
          needs something to refract, otherwise it reads as flat white. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 overflow-visible"
      >
        <div className="absolute -top-10 left-[4%] h-72 w-72 rounded-full bg-sky-400/40 blur-3xl" />
        <div className="absolute -top-4 right-[6%] h-80 w-80 rounded-full bg-fuchsia-400/30 blur-3xl" />
        <div className="absolute bottom-[-3rem] left-[38%] h-72 w-72 rounded-full bg-amber-300/40 blur-3xl" />
        <div className="absolute bottom-0 right-[28%] h-64 w-64 rounded-full bg-emerald-300/30 blur-3xl" />
      </div>

      {/* Stage 0/1 — the 4-tile grid (hidden while a form is open) */}
      <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 ${expanded ? 'hidden' : ''}`}>
        {services.map((service) => {
          const isActive = activeId === service.id;
          // Siblings only shrink on real hover devices (never on touch).
          const isShrunk = hasHover && activeId !== null && !isActive;

          return (
            <motion.div
              key={service.id}
              layoutId={serviceLayoutId(service.id)}
              onMouseEnter={hasHover ? () => setActiveId(service.id) : undefined}
              onMouseLeave={hasHover ? () => setActiveId(null) : undefined}
              // On touch (no hover), a tap opens/closes the tile to reveal
              // the four option buttons.
              onClick={
                !hasHover
                  ? () => setActiveId((cur) => (cur === service.id ? null : service.id))
                  : undefined
              }
              animate={{
                // Hovered tile grows 5%, the other three shrink 5%.
                scale: isActive ? 1.05 : isShrunk ? 0.95 : 1,
              }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              style={{
                willChange: 'transform',
                zIndex: isActive ? 20 : 1,
                // Depth + inner top highlight (set here: a multi-value arbitrary
                // shadow class doesn't survive Tailwind's parser).
                boxShadow:
                  '0 8px 32px rgba(15,23,42,0.12), inset 0 1px 0 rgba(255,255,255,0.9)',
              }}
              // Liquid glass: translucent fill + heavy backdrop blur/saturation,
              // a bright top edge and a soft drop shadow for depth.
              className="group relative flex min-h-[340px] flex-col overflow-hidden rounded-3xl border border-white/60 bg-white/30 p-6 backdrop-blur-2xl backdrop-saturate-150 [@media(hover:hover)and(pointer:fine)]:cursor-default"
            >
              {/* Specular sheen across the top of the glass. */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/60 to-transparent"
              />
              {isActive ? (
                /* Enlarged state: title top-left, description above the four
                   option buttons at the bottom. */
                <>
                  <div className="relative z-10">
                    <span className={`${bebas.className} text-sm tabular-nums text-muted`}>
                      {service.index}
                    </span>
                    <h3
                      className={`${bebas.className} mt-0.5 text-2xl uppercase leading-none tracking-wide text-ink`}
                    >
                      {service.title}
                    </h3>
                  </div>

                  <p className="relative z-10 mt-3 text-[11px] leading-relaxed text-muted">
                    {service.blurb}
                  </p>

                  <div className="relative z-10 mt-auto grid grid-cols-2 gap-1.5 pt-3">
                    {service.subOptions.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openForm(service.id, opt);
                        }}
                        className="rounded-xl border border-line bg-paper px-2 py-2.5 text-[11px] font-medium leading-tight transition-colors hover:bg-ink hover:text-paper"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                /* Resting state: the number scaled to fill the whole tile, with
                   the title brought forward on top of it. */
                <>
                  <span
                    aria-hidden
                    className={`${bebas.className} pointer-events-none absolute inset-0 z-0 flex items-center justify-center text-[clamp(12rem,31vw,24rem)] leading-none tracking-tighter text-ink/[0.13]`}
                  >
                    {service.index}
                  </span>
                  <div className="relative z-10 mt-auto">
                    <h3
                      className={`${bebas.className} text-3xl uppercase leading-none tracking-wide text-ink`}
                    >
                      {service.title}
                    </h3>
                  </div>
                </>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Stage 2/3 — expanded panel covering the container, hiding the tiles */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="expanded"
            layoutId={serviceLayoutId(expanded.id)}
            transition={morphSpring}
            style={{ willChange: 'transform' }}
            className="relative z-20 flex flex-col rounded-3xl border border-line bg-paper p-6 sm:p-10"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-sm font-medium tabular-nums text-muted">
                  {expanded.index}
                </span>
                <h3 className="mt-1 text-3xl font-semibold tracking-tight first-letter:uppercase sm:text-4xl">
                  {expanded.title}
                </h3>
                {selectedOption && (
                  <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-ink px-3 py-1 text-xs font-medium text-paper">
                    {selectedOption}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={closeForm}
                aria-label="Bezárás"
                className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-medium transition-colors hover:bg-ink hover:text-paper"
              >
                Bezárás <span aria-hidden>✕</span>
              </button>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-10 md:grid-cols-2">
              {/* Left — description + bullets */}
              <div>
                <p className="text-lg leading-relaxed text-muted">{expanded.blurb}</p>
                <ul className="mt-6 space-y-3">
                  {expanded.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-3 text-base">
                      <span aria-hidden className="text-muted">
                        ↗
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right — Stage 3 contact form */}
              <div className="border-t border-line pt-8 md:border-l md:border-t-0 md:pl-10 md:pt-0">
                <p className="mb-6 text-xs uppercase tracking-[0.15em] text-muted">
                  Ajánlatkérés
                </p>
                <ServiceForm service={expanded} option={selectedOption} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
