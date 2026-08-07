'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Anton, Montserrat, Poppins } from 'next/font/google';
import { AnimatePresence, motion } from 'framer-motion';
import { services, type Service, type ServiceItem } from '@/content/services';
import { PanTrack } from '@/components/PanTrack';
import { morphSpring } from '@/lib/motion';

/** WebGL: it can't render on the server, and its three.js payload has no
 *  business in the page bundle when only one card in seventeen opens it. */
const PanoramaSphere = dynamic(
  () => import('@/components/PanoramaSphere').then((m) => m.PanoramaSphere),
  { ssr: false },
);

/** The heavy condensed grotesque of the `servicepage.jpg` reference. */
const anton = Anton({ subsets: ['latin', 'latin-ext'], weight: '400' });
/** The geometric sans the panel's description is set in. */
const geo = Poppins({ subsets: ['latin', 'latin-ext'], weight: '300' });
/** Card captions — lower case, quiet, under the artwork. */
const montserrat = Montserrat({ subsets: ['latin', 'latin-ext'], weight: ['400', '500'] });

/** Card fill, sampled straight out of the reference. */
const CARD = '#333333';
/** Panel fill and its image placeholders, from `servicepageopen.jpg`. The panel
 *  sits over the page at 35% so the (blurred) catalogue still reads behind it. */
const PANEL = 'rgba(35,35,35,0.35)';
const PANEL_IMG = '#4f4f4f';
const PANEL_BLUR = 15;

/** Columns for the panel's image band, by how many images the service has.
 *  Spelled out rather than built from a template so Tailwind's scanner sees
 *  every class it has to generate. */
const PANEL_IMG_COLS: Record<number, string> = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
};

function cardLayoutId(serviceId: string, label: string) {
  return `service-card-${serviceId}-${label}`;
}

/**
 * One catalogue card. Stills lift and brighten on hover; a card backed by a
 * clip plays it instead, and a panorama orbits — in each of those the motion in
 * the tile *is* the hover response, so it doesn't also zoom.
 */
function ServiceCard({
  service,
  item,
  onOpen,
}: {
  service: Service;
  item: ServiceItem;
  onOpen: () => void;
}) {
  const video = useRef<HTMLVideoElement>(null);

  const play = useCallback(() => {
    const el = video.current;
    if (!el) return;
    // Autoplay policy is satisfied — the element is muted — but the promise
    // still rejects if the pointer leaves before the first frame decodes.
    void el.play().catch(() => {});
  }, []);

  const stop = useCallback(() => {
    const el = video.current;
    if (!el) return;
    el.pause();
    el.currentTime = 0;
  }, []);

  return (
    <motion.button
      type="button"
      layoutId={cardLayoutId(service.id, item.label)}
      onClick={onOpen}
      onHoverStart={item.video ? play : undefined}
      onHoverEnd={item.video ? stop : undefined}
      onFocus={item.video ? play : undefined}
      onBlur={item.video ? stop : undefined}
      whileHover={item.video || item.pan ? undefined : { scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      style={{ willChange: 'transform' }}
      className="group block w-full text-left"
    >
      <span
        style={{ backgroundColor: CARD }}
        className="relative block aspect-[1/1.43] overflow-hidden rounded-xl transition-[filter] duration-300 group-hover:brightness-110"
      >
        {item.pan ? (
          <PanTrack src={item.pan} />
        ) : (
          item.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.image}
              alt=""
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
          )
        )}
        {item.video && (
          <video
            ref={video}
            src={item.video}
            poster={item.image}
            muted
            loop
            playsInline
            // Nothing is fetched until the pointer arrives, so seventeen cards
            // still cost one page's worth of stills.
            preload="none"
            aria-hidden
            tabIndex={-1}
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
        )}
      </span>
      <span
        className={`${montserrat.className} mt-2 block break-words text-xs lowercase leading-snug text-white/85 sm:text-sm`}
      >
        {item.label}
      </span>
    </motion.button>
  );
}

export function ServicesInteractive() {
  // Which card is open, as a (category, item) pair.
  const [open, setOpen] = useState<{ serviceId: string; label: string } | null>(null);
  const service = services.find((s) => s.id === open?.serviceId) ?? null;
  const item = service?.items.find((i) => i.label === open?.label) ?? null;
  // A service with no artwork yet falls back to the reference's two plates.
  const panelSlots: (string | null)[] = item?.panelImages?.length
    ? [...item.panelImages]
    : [null, null];

  // A click anywhere outside the panel closes it. Clicking another card fires
  // this first and its own onClick second, so the panel simply switches.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!(e.target as HTMLElement).closest?.('[data-service-panel]')) setOpen(null);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  return (
    <div>
      {/* The catalogue — four categories, each a row of cards. It stays in place
          and visible while a panel is open; the panel lies over it. */}
      <div className="space-y-12 sm:space-y-14">
        {services.map((s) => (
          <section key={s.id}>
            <h2
              className={`${anton.className} mb-2.5 text-2xl uppercase leading-none tracking-[0.01em] text-white sm:text-3xl`}
            >
              {s.title}
            </h2>

            {/* Five across, as laid out in the reference; short rows simply
                stop early rather than stretching to fill the width. */}
            <ul className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 md:grid-cols-5 md:gap-x-4">
              {s.items.map((it) => (
                <li key={it.label}>
                  <ServiceCard
                    service={s}
                    item={it}
                    onOpen={() => setOpen({ serviceId: s.id, label: it.label })}
                  />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {/* Unchanged behaviour: the card morphs open. What it morphs into is now
          the `servicepageopen.jpg` panel — title and copy on the left, two
          images, a CONTACT button bottom-right — floating over the page.

          The centring layer is always mounted but click-through, so the page
          under it stays fully interactive; only the panel takes pointer events.
          Framer owns the panel's transform, so it can't be centred with one. */}
      <div className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center p-4">
        <AnimatePresence>
          {service && item && open && (
            <motion.div
              key="panel"
              data-service-panel
              layoutId={cardLayoutId(open.serviceId, open.label)}
              transition={morphSpring}
              style={{
                background: PANEL,
                backdropFilter: `blur(${PANEL_BLUR}px)`,
                WebkitBackdropFilter: `blur(${PANEL_BLUR}px)`,
                willChange: 'transform',
              }}
              // Capped at the viewport: on a phone the image band stacks, and
              // three slots are taller than the screen.
              className="pointer-events-auto max-h-full w-full max-w-[1150px] overflow-y-auto rounded-3xl p-5 sm:p-7"
            >
              {/* Copy on the left, the artwork on the right. The image band is
                  always the same width — 3.8fr against the text's 1fr, which is
                  what the reference's two 1.9fr slots came to — so a service
                  with one image or three still lines up with the rest. */}
              <div className="grid gap-4 md:grid-cols-[1fr_3.8fr]">
                <div>
                  <h3
                    className={`${anton.className} text-xl uppercase leading-none tracking-[0.01em] text-white sm:text-2xl`}
                  >
                    {item.title ?? item.label}
                  </h3>
                  <p className={`${geo.className} mt-5 text-sm leading-relaxed text-white/55`}>
                    {service.blurb}
                  </p>
                </div>

                {item.panorama ? (
                  // A 360 render takes the whole band as one 2:1 viewer — you
                  // drag it to look around the room. It mounts with the panel
                  // and unmounts with it, so the WebGL context is short-lived.
                  <PanoramaSphere src={item.panorama} poster={item.panoramaPoster} />
                ) : (
                  <div className={`grid gap-4 ${PANEL_IMG_COLS[panelSlots.length]}`}>
                    {panelSlots.map((src, i) => (
                      <span
                        key={src ?? i}
                        aria-hidden={!src}
                        // Without artwork the slot keeps the grey plate of the
                        // reference.
                        style={src ? undefined : { backgroundColor: PANEL_IMG }}
                        className="relative block aspect-[14/11] overflow-hidden rounded-xl"
                      >
                        {src && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={src}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        )}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-end">
                <Link
                  href="/contact"
                  // 22% of the panel, as in the reference, so it lines up under
                  // the right-hand image at any width.
                  className={`${anton.className} min-w-[22%] rounded-xl bg-white px-10 py-1.5 text-center text-2xl uppercase leading-tight tracking-[0.01em] text-ink transition-opacity hover:opacity-80 sm:text-3xl`}
                >
                  Contact
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
