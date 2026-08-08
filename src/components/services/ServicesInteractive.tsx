'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
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

/**
 * The opened panel: title and copy on the left, the artwork on the right, a
 * CONTACT button bottom-right.
 *
 * It fills its category's tile block exactly — the first tile's top-left to the
 * last tile's bottom-right — and stays there, so scrolling carries it along
 * with the row it belongs to rather than pinning it to the screen.
 *
 * That box is a fixed size, which the artwork has to live inside two different
 * ways. Once the band sits beside the copy (`md` up) the images are stretched
 * to the row's height instead of their own aspect, so two of them always fit.
 * Stacked under it on a phone they keep their aspect, and there the band drops
 * an image rather than hand the visitor a scrollbar inside an already small
 * panel.
 */
function ServicePanel({
  service,
  item,
  layoutId,
}: {
  service: Service;
  item: ServiceItem;
  layoutId: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // A service with no artwork yet falls back to the reference's two plates.
  const all: (string | null)[] = item.panelImages?.length ? [...item.panelImages] : [null, null];

  // `null` is "showing everything, not yet judged". The test has to run against
  // the FULL stack: dropping an image frees the very space it looks for, so
  // re-judging the reduced layout would flip the two states back and forth.
  const [fit, setFit] = useState<number | null>(null);
  const [probe, setProbe] = useState(0);

  // The box follows the tile grid, which follows the viewport.
  useEffect(() => {
    const onResize = () => setProbe((p) => p + 1);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useLayoutEffect(() => setFit(null), [item.label, probe]);

  useLayoutEffect(() => {
    const el = ref.current;
    if (fit !== null || !el) return;
    // Layout heights, not visual ones — the panel is still mid-morph on the
    // first frame, and a transform moves neither of these.
    const overflows = el.scrollHeight > el.clientHeight + 1;
    setFit(overflows ? Math.max(1, all.length - 1) : all.length);
  }, [fit, all.length]);

  const slots = all.slice(0, fit ?? all.length);

  return (
    <motion.div
      ref={ref}
      data-service-panel
      layoutId={layoutId}
      transition={morphSpring}
      style={{
        background: PANEL,
        backdropFilter: `blur(${PANEL_BLUR}px)`,
        WebkitBackdropFilter: `blur(${PANEL_BLUR}px)`,
        willChange: 'transform',
      }}
      // Exactly its category's tile block, at every width. The column layout
      // is `md` and up only: below it the panel is a plain block, so the copy
      // and the images can outgrow the box and the fit test can see it.
      className="pointer-events-auto h-full max-h-full w-full overflow-y-auto rounded-3xl p-5 md:flex md:flex-col md:p-7"
    >
      {/* Copy on the left, the artwork on the right. The image band is always
          the same width — 3.8fr against the text's 1fr, which is what the
          reference's two 1.9fr slots came to — so a service with one image or
          three still lines up with the rest. It takes all the height the
          CONTACT row leaves it, and `min-h-0` is what lets it give that height
          back to the images rather than growing the panel. */}
      <div className="grid gap-4 md:min-h-0 md:flex-1 md:grid-cols-[1fr_3.8fr]">
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
          // A 360 render takes the whole band as one drag-to-look viewer. It
          // mounts with the panel and unmounts with it, so the WebGL context
          // is short-lived. Beside the copy it takes the row's height like the
          // stills do — at 2:1 it would stand half again as tall as the tiles
          // it covers — and the wider frame simply widens the horizontal view.
          <PanoramaSphere
            src={item.panorama}
            poster={item.panoramaPoster}
            className="md:aspect-auto md:h-full md:min-h-0"
          />
        ) : (
          <div className={`grid gap-4 md:min-h-0 ${PANEL_IMG_COLS[slots.length]}`}>
            {slots.map((src, i) => (
              <span
                key={src ?? i}
                aria-hidden={!src}
                // Without artwork the slot keeps the grey plate of the
                // reference.
                style={src ? undefined : { backgroundColor: PANEL_IMG }}
                // Its own aspect while the images stack under the copy; from
                // `md` the row's height decides instead, and `object-cover`
                // takes the crop — otherwise two images at 14/11 are taller
                // than the tile row they are covering.
                className="relative block aspect-[14/11] overflow-hidden rounded-xl md:aspect-auto md:h-full md:min-h-0"
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
          // 22% of the panel, as in the reference, so it lines up under the
          // right-hand image at any width.
          className={`${anton.className} min-w-[22%] rounded-xl bg-white px-10 py-1.5 text-center text-2xl uppercase leading-tight tracking-[0.01em] text-ink transition-opacity hover:opacity-80 sm:text-3xl`}
        >
          Contact
        </Link>
      </div>
    </motion.div>
  );
}

export function ServicesInteractive() {
  // Which card is open, as a (category, item) pair.
  const [open, setOpen] = useState<{ serviceId: string; label: string } | null>(null);
  // The open item. Its category is the row the panel renders inside, so only
  // the item itself has to be looked up here.
  const item =
    services
      .find((s) => s.id === open?.serviceId)
      ?.items.find((i) => i.label === open?.label) ?? null;

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
          // The id is the footer's link target; the margin keeps the heading
          // clear of the fixed top bar when one lands here.
          <section key={s.id} id={s.id} className="scroll-mt-24">
            <h2
              className={`${anton.className} mb-2.5 text-2xl uppercase leading-none tracking-[0.01em] text-white sm:text-3xl`}
            >
              {s.title}
            </h2>

            {/* The panel belongs to this row, so it lives here rather than at
                the root: it opens over its own category's tiles and nothing
                else, and being absolute it travels with them as the page
                scrolls instead of hanging in front of the viewport. */}
            <div className="relative">
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

              {/* Click-through, so the page under it stays interactive; only
                  the panel itself takes pointer events. One <AnimatePresence>
                  per category, each always mounted — gating the presence itself
                  would unmount the panel outright and skip the morph back. */}
              <div className="pointer-events-none absolute inset-0 z-[60]">
                <AnimatePresence>
                  {open?.serviceId === s.id && item && (
                    <ServicePanel
                      key="panel"
                      service={s}
                      item={item}
                      layoutId={cardLayoutId(open.serviceId, open.label)}
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
