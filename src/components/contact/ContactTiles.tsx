'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Bebas_Neue, Montserrat } from 'next/font/google';
import { AnimatePresence, motion } from 'framer-motion';
import { contactCategories, type ContactCategory } from '@/content/contactServices';
import { services, type ServiceItem } from '@/content/services';
import { PanTrack } from '@/components/PanTrack';
import { QuickContactForm, type QuickPick } from '@/components/contact/QuickContactForm';
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

/**
 * One service inside an opened tile. Same behaviour as the services-page
 * cards: a still lifts on hover, a clip plays instead, a panorama orbits.
 *
 * Choosing one adds it to the enquiry below rather than opening a mail client
 * on the spot — the point is to collect several before writing anything.
 */
function ServiceTile({
  item,
  picked,
  onToggle,
}: {
  item: ServiceItem;
  picked: boolean;
  onToggle: () => void;
}) {
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
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={picked}
      onPointerEnter={item.video ? play : undefined}
      onPointerLeave={item.video ? stop : undefined}
      onFocus={item.video ? play : undefined}
      onBlur={item.video ? stop : undefined}
      className="group block w-full text-left"
    >
      <span
        style={{ backgroundColor: PLATE }}
        className={`relative block aspect-[3/4] overflow-hidden rounded-xl transition duration-300 group-hover:brightness-110 ${
          picked ? 'ring-2 ring-white' : ''
        } ${
          // A clip or a panorama answers the hover with its own motion, so the
          // tile doesn't also zoom.
          item.video || item.pan ? '' : 'group-hover:scale-[1.03]'
        }`}
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
            preload="none"
            aria-hidden
            tabIndex={-1}
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
        )}
      </span>
      <span
        className={`${montserrat.className} mt-2 block break-words text-xs lowercase leading-snug sm:text-sm ${
          picked ? 'text-white' : 'text-white/85'
        }`}
      >
        {item.label}
      </span>
    </button>
  );
}

/** The closed state: cover art, number, heading. */
function TileFace({ category }: { category: ContactCategory }) {
  return (
    <>
      <span className="relative block aspect-[3/4] overflow-hidden rounded-2xl bg-white/5 [container-type:inline-size]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={category.image}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
        />
        {/* The scrim is the number's legibility and nothing else's — the heading
            sits below the picture, outside this box — so it darkens whichever
            end the number stands at. Bottom, now: one of these covers is a
            bright interior whose lower edge is a near-white rug, and the
            numeral would otherwise be white on white. */}
        <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
        <span
          // Sized against the tile rather than the viewport. The row is two
          // columns wide on a phone and four from `sm`, so a tile is at its
          // NARROWEST just past that breakpoint, not on the smallest screen —
          // a fixed size would be right at one width and wrong at both others.
          // The ceiling is the size asked for, on a full-width desktop tile.
          style={{ fontSize: 'clamp(3rem, 44cqw, 9rem)' }}
          className={`${bebas.className} absolute bottom-2 left-3 leading-none tabular-nums text-white/25`}
        >
          {category.index}
        </span>
      </span>
      <span
        // `pl-3` to the number's `left-3` above: the heading starts on the same
        // line the numeral does, so the two read as one column rather than the
        // title hanging off the edge of the picture.
        className={`${bebas.className} mt-3 block break-words pl-3 text-base uppercase leading-[0.95] tracking-wide text-white transition-colors group-hover:text-white/60 sm:text-lg`}
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

  // What the visitor has picked so far, across every category — the enquiry
  // form below is built from this and nothing else.
  const [picks, setPicks] = useState<QuickPick[]>([]);
  // Sending empties the basket, which would take the form — and its
  // confirmation — down with it. So the form outlives the picks by one state.
  const [sent, setSent] = useState(false);
  const togglePick = useCallback((pick: QuickPick) => {
    setSent(false);
    setPicks((prev) =>
      prev.some((p) => p.key === pick.key) ? prev.filter((p) => p.key !== pick.key) : [...prev, pick],
    );
  }, []);
  const removePick = useCallback((key: string) => {
    setPicks((prev) => prev.filter((p) => p.key !== key));
  }, []);

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
      // The form counts as inside: picking a service and then typing about it
      // is one gesture, and collapsing the category under the cursor would
      // pull the form up from under it.
      const el = e.target as HTMLElement;
      if (!el.closest?.('[data-contact-panel]') && !el.closest?.('[data-contact-form]')) {
        setOpen(null);
      }
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
    <div className="w-full">
    {/* The panel is absolutely placed against this box, so it grows to exactly
        the four tiles it replaces. */}
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
              {service.items.map((item) => {
                const key = `${category.serviceId}:${item.label}`;
                return (
                  <li key={item.label}>
                    <ServiceTile
                      item={item}
                      picked={picks.some((p) => p.key === key)}
                      onToggle={() =>
                        togglePick({
                          key,
                          label: item.label,
                          category: category.label,
                          image: item.image,
                        })
                      }
                    />
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>

    {/* The enquiry itself, under the tiles and the same width, from the moment
        the first service is picked. */}
    {(picks.length > 0 || sent) && (
      <QuickContactForm
        picks={picks}
        onRemove={removePick}
        onSent={() => {
          setSent(true);
          setPicks([]);
        }}
        email={email}
      />
    )}
    </div>
  );
}
