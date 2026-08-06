'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Bebas_Neue, Montserrat } from 'next/font/google';
import { AnimatePresence, motion } from 'framer-motion';
import { contactCategories, type ContactCategory } from '@/content/contactServices';
import { services, type ServiceItem } from '@/content/services';
import { morphSpring } from '@/lib/motion';

const bebas = Bebas_Neue({ subsets: ['latin', 'latin-ext'], weight: '400' });
const montserrat = Montserrat({ subsets: ['latin', 'latin-ext'], weight: ['400', '500'] });

/** The opened tile, over the four it covers — a touch more opaque than the
 *  services panel so the captions still read against the artwork behind. */
const PANEL = 'rgba(26,26,26,0.55)';
const PANEL_BLUR = 18;
/** Fallback fill for an item with no artwork yet. */
const PLATE = '#333333';

function tileLayoutId(id: string) {
  return `contact-tile-${id}`;
}

function mailto(email: string, label: string) {
  return `mailto:${email}?subject=${encodeURIComponent(`Ajánlatkérés — ${label}`)}`;
}

/**
 * One service inside an opened tile. Same behaviour as the services-page
 * cards: a still lifts on hover, a clip plays instead.
 */
function ServiceTile({ item, email }: { item: ServiceItem; email: string }) {
  const video = useRef<HTMLVideoElement>(null);

  const play = useCallback(() => {
    void video.current?.play().catch(() => {});
  }, []);
  const stop = useCallback(() => {
    const el = video.current;
    if (!el) return;
    el.pause();
    el.currentTime = 0;
  }, []);

  return (
    <a
      href={mailto(email, item.label)}
      onPointerEnter={item.video ? play : undefined}
      onPointerLeave={item.video ? stop : undefined}
      onFocus={item.video ? play : undefined}
      onBlur={item.video ? stop : undefined}
      className="group block"
    >
      <span
        style={{ backgroundColor: PLATE }}
        className={`relative block aspect-[3/4] overflow-hidden rounded-xl transition duration-300 group-hover:brightness-110 ${
          // A clip answers the hover by playing, so it doesn't also zoom.
          item.video ? '' : 'group-hover:scale-[1.03]'
        }`}
      >
        {item.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        {item.video && (
          <video
            ref={video}
            src={item.video}
            poster={item.image}
            muted
            loop
            playsInline
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
    </a>
  );
}

/** The closed state: cover art, number, heading. */
function TileFace({ category }: { category: ContactCategory }) {
  return (
    <>
      <span className="relative block aspect-[3/4] overflow-hidden rounded-2xl bg-white/5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={category.image}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
        />
        <span aria-hidden className="absolute inset-0 bg-gradient-to-b from-black/55 to-transparent" />
        <span className={`${bebas.className} absolute left-3 top-2 text-lg tabular-nums text-white`}>
          {category.index}
        </span>
      </span>
      <span
        className={`${bebas.className} mt-3 block break-words text-base uppercase leading-[0.95] tracking-wide text-white transition-colors group-hover:text-white/60 sm:text-lg`}
      >
        {category.label}
      </span>
    </>
  );
}

export function ContactTiles({ email }: { email: string }) {
  const [open, setOpen] = useState<string | null>(null);
  const category = contactCategories.find((c) => c.serviceId === open) ?? null;
  const service = services.find((s) => s.id === open) ?? null;

  // On a wide screen the items fit one row and the panel is exactly as tall as
  // the tiles it covers. Narrower, they wrap — so the box reserves the panel's
  // height and the rest of the page moves down instead of being written over.
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelHeight, setPanelHeight] = useState(0);
  useEffect(() => {
    const el = panelRef.current;
    if (!open || !el) {
      setPanelHeight(0);
      return;
    }
    const measure = () => setPanelHeight(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [open]);

  // Click anywhere outside the opened tile closes it; so does Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!(e.target as HTMLElement).closest?.('[data-contact-panel]')) setOpen(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    // The panel is absolutely placed against this box, so it grows to exactly
    // the four tiles it replaces.
    <div
      className="relative w-full transition-[min-height] duration-300 ease-out"
      style={{ minHeight: panelHeight || undefined }}
    >
      <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4">
        {contactCategories.map((c) => (
          <li key={c.serviceId}>
            <motion.button
              type="button"
              layoutId={tileLayoutId(c.serviceId)}
              onClick={() => setOpen(c.serviceId)}
              transition={morphSpring}
              style={{ willChange: 'transform' }}
              className="group block w-full text-left"
              aria-expanded={open === c.serviceId}
            >
              <TileFace category={c} />
            </motion.button>
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {category && service && (
          <motion.div
            key={category.serviceId}
            ref={panelRef}
            data-contact-panel
            layoutId={tileLayoutId(category.serviceId)}
            transition={morphSpring}
            style={{
              background: PANEL,
              backdropFilter: `blur(${PANEL_BLUR}px)`,
              WebkitBackdropFilter: `blur(${PANEL_BLUR}px)`,
              willChange: 'transform',
            }}
            className="absolute inset-x-0 top-0 z-20 min-h-full rounded-2xl p-4 sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <h2
                className={`${bebas.className} text-xl uppercase leading-none tracking-wide text-white sm:text-3xl`}
              >
                {category.label}
              </h2>
              <button
                type="button"
                onClick={() => setOpen(null)}
                aria-label="Bezárás"
                className={`${montserrat.className} shrink-0 rounded-full border border-white/25 px-3 py-1 text-xs lowercase text-white/70 transition-colors hover:border-white/60 hover:text-white`}
              >
                bezár
              </button>
            </div>

            {/* One tile per service in this category, straight from the
                services page. Short rows simply stop early. */}
            <ul className="mt-4 grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 md:grid-cols-5 md:gap-x-4">
              {service.items.map((item) => (
                <li key={item.label}>
                  <ServiceTile item={item} email={email} />
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
