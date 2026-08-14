'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion, type Easing } from 'framer-motion';
import { useHeroReveal } from './home/HeroRevealContext';
import { logoDockEnd } from '@/lib/heroSequenceState';
import { WORK_HREF } from '@/lib/anchors';

/** The bar on wide screens. CONTACT is not in here — it has its own corner
 *  button on the left, so this slot carries INFO instead. WORK opens the home
 *  page at the tile row; the docked logo is what opens it at the hero. */
const LINKS = [
  { href: WORK_HREF, label: 'Work' },
  { href: '/services', label: 'Services' },
  { href: '/info', label: 'Info' },
  { href: '/about', label: 'About' },
];

/** The roll-down list on phones — same four, same order. */
const MOBILE_LINKS = LINKS;

/** Shared pill geometry, so the corner button matches the bar exactly — same
 *  height, same baseline. Sized at 80% of the original. */
const PILL_PAD = 'p-[4px] sm:p-[6px]';
/** …and its type, a tenth up from the 7.2/8px it was set at. */
const PILL_LINK =
  'block rounded-full px-[8px] py-[5.6px] text-[7.92px] uppercase tracking-[0.14em] transition-colors sm:px-[16px] sm:text-[8.8px]';

/**
 * Which page you are on is carried by WEIGHT, not by colour.
 *
 * The pills used to be solid white with two greys doing the work — the darker
 * grey meaning "you are here". On glass over a black page those greys are
 * barely there at all, so both went white and the distinction moved to the one
 * axis that still reads at 7px: the current page is bold, everything else is
 * regular. Held apart from PILL_LINK because the weight now belongs to the
 * STATE rather than to the pill.
 */
const INACTIVE = 'font-normal text-white/70 hover:text-white';
const ACTIVE = 'font-bold text-white';

/**
 * The background every pill wears: one pane of glass. The corner CONTACT
 * button, the phone's MENU pill and the wide bar are the same object at three
 * widths, which is the point — they used to be solid white and are now all
 * glass.
 *
 * Three things stacked, because one property does not make glass. The blur and
 * the saturation bend and enrich whatever is behind it — the pill carries
 * almost no colour of its own. The insets are the lit near edge and the dimmer
 * far edge of something with THICKNESS. And the warp below refracts the
 * backdrop, which is what stops it reading as a frosted sticker.
 *
 * The tint is 0.072 — four tenths off the 0.12 it started at, so the pane is
 * that much more of the page behind it and that much less of itself. Only the
 * FILL is thinned: the edges and the highlight are the glass's shape rather
 * than its substance, and fading those would have flattened it rather than
 * making it clearer.
 */
const PILL_BG = 'absolute inset-0 z-0 rounded-full ring-1 ring-inset ring-white/30';
const PILL_BG_STYLE = {
  backgroundColor: 'rgba(255,255,255,0.072)',
  // No gradient. There was a lit wash down the top half — the specular
  // highlight a curved pane would carry — and it read as a painted-on effect
  // rather than as light. The tint is flat now: what shapes the glass is the
  // blur, the saturation and the 1px edges, all of which are doing something
  // to the page behind rather than drawing over it.
  backdropFilter: 'blur(14px) saturate(180%)',
  WebkitBackdropFilter: 'blur(14px) saturate(180%)',
  boxShadow:
    'inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -1px 0 rgba(255,255,255,0.14), 0 10px 30px rgba(0,0,0,0.35)',
} as const;
/**
 * The refraction, on its own layer on purpose.
 *
 * `backdrop-filter: url()` is not carried everywhere — Safari in particular
 * takes the blur above and not this. Kept apart, a browser that cannot do it
 * simply drops this one layer and still gets the blur, the tint and the edges;
 * put them in one declaration and an unsupported `url()` would invalidate the
 * whole thing and leave a flat transparent box.
 */
const GLASS_WARP_STYLE = {
  backdropFilter: 'url(#pill-glass-warp)',
  WebkitBackdropFilter: 'url(#pill-glass-warp)',
} as const;

/** Fully round: what the pills wear except the phone's menu while it is open. */
const PILL_R_FULL = 9999;

/**
 * The refraction layer, carrying its OWN rounded corners.
 *
 * It has to. A backdrop-filtered box sitting inside an `overflow: hidden`
 * rounded parent is clipped by that parent WITHOUT antialiasing in Chrome, and
 * the result is exactly the stair-stepped rim this had — the pill looked
 * low-resolution along its curve. Given the radius itself, the layer clips
 * against its own border-box, which is antialiased, and the parent needs no
 * overflow clip at all. The radius is passed in rather than assumed because the
 * phone's menu opens from a capsule into a card and this must follow it.
 */
function GlassPane({ radius }: { radius: number }) {
  return (
    <motion.span
      aria-hidden
      initial={false}
      animate={{ borderRadius: radius }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-none absolute inset-0"
      style={GLASS_WARP_STYLE}
    />
  );
}

/**
 * Where the phone's chrome sits: the same distance from the window's edge as
 * from its top.
 *
 * 12px on both axes, matching `top-3`, so each pill sits in an even corner. It
 * was briefly pulled in to 25px to line up with the tile column's visible
 * edges; that made the side gap nearly twice the one above it, and a corner
 * button reads as misplaced long before anyone works out what it was aligned
 * to. From `sm` up the original wider offsets come back.
 */
const MENU_X = 'right-3';
const CONTACT_X = 'left-3 sm:left-6';
/**
 * …and the menu pill runs a tenth wider than its content asks for, all of it
 * added on the LEFT so it grows inward, away from the edge it is anchored to.
 * 6.2px is a tenth of the 62px it measures at, plus the 4px it already had.
 */
const MOBILE_MENU_LEAD = 'pl-[10.2px]';

/** Phone menu pill corners. Closed it is a capsule — at the bar's 30px height
 *  that is an effective 15px radius; opened, the corners come in to half that
 *  so the rolled-down panel reads as a card rather than a stretched pill. */
const PILL_R = 15;
const PILL_R_OPEN = PILL_R / 2;

const BALL = 16;
const BALL_COLOR = '#ffffff';
/** Ball centre, in px above the viewport bottom. Must match the `ball` rect in
 *  <HeroImageSequence> so the handoff to the image sequence is invisible. */
const BALL_CENTRE_UP = 56;

/**
 * Unified scroll-cue + navigation.
 *
 * Home, before scroll: a bouncing ball at the bottom-centre; the menu is
 * hidden. On scroll the ball switches off at exactly the size and position
 * <HeroImageSequence> takes over at, so the morph reads as continuous, and the
 * navigation fades in.
 *
 * Wide screens get the full bar. Phones get a single MENU pill that rolls down
 * — there is no room for four items beside the corner button at that width.
 */
export function BallMenu() {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const { revealed } = useHeroReveal();
  const isHome = pathname === '/';

  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const isActive = useCallback(
    (href: string) => {
      // WORK carries a hash, which is not part of the path — compare the route.
      const path = href.split('#')[0] || '/';
      return path === '/' ? pathname === '/' : pathname.startsWith(path);
    },
    [pathname],
  );

  useEffect(() => {
    // Tracks the scroll rather than latching: the image sequence runs backwards
    // on the way up, so the ball has to be there to take the handoff back.
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Navigating closes the roll-down; so does a tap anywhere outside it.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!(e.target as HTMLElement).closest?.('[data-mobile-menu]')) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  const asMenu = !isHome || scrolled;

  // ---- The scroll-cue ball --------------------------------------------------
  // Its own fixed element rather than a child of the bar: the bar is hidden on
  // phones, and the ball must not go with it.
  const idleLoop = {
    duration: 1.0,
    repeat: Infinity,
    repeatDelay: 0.06,
    times: [0, 0.5, 1],
    ease: ['easeOut', 'easeIn'] as Easing[],
  };
  const idle = reduce
    ? { y: 0, scaleX: 1, scaleY: 1, opacity: 1 }
    : { y: [0, -30, 0], scaleX: [1.12, 0.9, 1.12], scaleY: [0.88, 1.12, 0.88], opacity: 1 };
  const ballAnimate = asMenu
    ? { y: 0, scaleX: 1, scaleY: 1, opacity: 0 }
    : revealed
      ? idle
      : { y: 0, scaleX: 1, scaleY: 1, opacity: 0 };
  const ballTransition = asMenu
    ? { duration: 0.15, ease: 'easeOut' as const }
    : {
        default: { duration: 0.6, ease: 'easeInOut' as const },
        y: reduce ? { duration: 0.3 } : idleLoop,
        scaleX: reduce ? { duration: 0.3 } : idleLoop,
        scaleY: reduce ? { duration: 0.3 } : idleLoop,
      };

  /**
   * Pressing the ball takes the visitor to where the image sequence begins —
   * the point the logo finishes docking, which is also the moment the first
   * caption is allowed to type itself in. Published by <HeroExperience>; the
   * 70%-of-a-viewport fallback is the same figure it measures, for the frame
   * before it has.
   */
  const toSequence = () => {
    const target = logoDockEnd.get() || window.innerHeight * 0.7;
    // Rounded up, so the landing is past the dock rather than a fraction short
    // of it — the sequence gates its first caption on exactly that line.
    window.scrollTo({ top: Math.ceil(target), behavior: reduce ? 'auto' : 'smooth' });
  };

  // Links fade in left-to-right once the bar appears on scroll.
  const itemDelay = (i: number) => (asMenu && isHome && !reduce ? 0.12 + i * 0.07 : 0);
  const barDelay = asMenu && isHome && !reduce ? 0.82 : 0;
  const contactActive = isActive('/contact');

  return (
    <>
      {isHome && (
        <motion.button
          type="button"
          aria-label="Tovább a képsorhoz"
          onClick={toSequence}
          className="fixed left-1/2 z-[70] cursor-pointer rounded-full border-0 p-0"
          initial={false}
          animate={ballAnimate}
          transition={ballTransition}
          style={{
            bottom: BALL_CENTRE_UP - BALL / 2,
            width: BALL,
            height: BALL,
            marginLeft: -BALL / 2,
            backgroundColor: BALL_COLOR,
            transformOrigin: 'center bottom',
            willChange: 'transform',
            // Only while it is the scroll cue; once it has handed over to the
            // image sequence it is invisible and must not swallow clicks.
            pointerEvents: asMenu ? 'none' : 'auto',
          }}
        />
      )}

      {/* CONTACT — same pill, same reveal, mirrored into the top-left corner
          and vertically aligned with the menu (identical top offset). */}
      {/* The glass pill's refraction. Rendered once, referenced by id: a
          turbulence field, softened so it warps in slow swells rather than
          grain, driving a displacement of the backdrop. Zero-sized and hidden,
          since only the filter is wanted, never the element. */}
      <svg aria-hidden width="0" height="0" className="absolute" focusable="false">
        <defs>
          {/* The region runs well outside the pill on purpose. A displacement
              pulls each pixel from somewhere NEARBY, and at the rim that
              somewhere lies outside the element — with the region stopping at
              its edge those samples came back as transparent black and drew a
              broken dark fringe all the way round, which is most of what read
              as "pixelated". Given room to sample beyond itself, the warp has
              real pixels to fetch and the rim stays clean.

              sRGB because the default linear space bands visibly across a
              gradient this shallow; one octave and a modest scale because the
              want is a slow swell in the glass, not grain. */}
          <filter
            id="pill-glass-warp"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.015"
              numOctaves={1}
              seed={7}
              result="noise"
            />
            <feGaussianBlur in="noise" stdDeviation={2} result="swell" />
            <feDisplacementMap
              in="SourceGraphic"
              in2="swell"
              scale={8}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      <nav aria-label="Kapcsolat" className={`fixed top-3 z-[75] sm:top-5 ${CONTACT_X}`}>
        <div className="relative">
          <motion.div
            initial={false}
            animate={{ opacity: asMenu ? 1 : 0 }}
            transition={{ duration: 0.3, delay: barDelay }}
            className={PILL_BG}
            style={PILL_BG_STYLE}
          >
            <GlassPane radius={PILL_R_FULL} />
          </motion.div>
          <motion.div
            style={{ pointerEvents: asMenu ? 'auto' : 'none' }}
            initial={false}
            animate={{ opacity: asMenu ? 1 : 0 }}
            transition={{ duration: 0.28, ease: 'easeOut', delay: barDelay }}
            className={`relative z-20 flex items-center ${PILL_PAD}`}
          >
            <Link
              href="/contact"
              data-active={contactActive}
              // Always bold and white, unlike the bar's links. CONTACT is the
              // one thing here that is a call rather than a place, and it is
              // meant to carry the same weight whether or not you are already
              // on its page — so it does not dim to 70% the way an unvisited
              // nav item does.
              className={`${PILL_LINK} ${ACTIVE}`}
            >
              Contact
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* Phones: one pill that rolls down. */}
      <nav
        aria-label="Fő navigáció"
        data-mobile-menu
        className={`fixed top-3 z-[75] sm:hidden ${MENU_X}`}
      >
        <div className="relative">
          <motion.div
            initial={false}
            animate={{ opacity: asMenu ? 1 : 0, borderRadius: open ? PILL_R_OPEN : PILL_R }}
            transition={{
              opacity: { duration: 0.3, delay: barDelay },
              borderRadius: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
            }}
            className={PILL_BG}
            style={PILL_BG_STYLE}
          >
            <GlassPane radius={open ? PILL_R_OPEN : PILL_R} />
          </motion.div>
          <motion.div
            style={{ pointerEvents: asMenu ? 'auto' : 'none' }}
            initial={false}
            animate={{ opacity: asMenu ? 1 : 0 }}
            transition={{ duration: 0.28, ease: 'easeOut', delay: barDelay }}
            className={`relative z-20 ${PILL_PAD} ${MOBILE_MENU_LEAD}`}
          >
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              className={`${PILL_LINK} flex items-center gap-[6px] ${INACTIVE}`}
            >
              Menu
              <motion.span
                aria-hidden
                animate={{ rotate: open ? 180 : 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="block text-[6px] leading-none"
              >
                ▼
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {open && (
                <motion.ul
                  key="items"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  {MOBILE_LINKS.map((link) => {
                    const active = isActive(link.href);
                    return (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          onClick={() => setOpen(false)}
                          className={`${PILL_LINK} ${active ? ACTIVE : INACTIVE}`}
                        >
                          {link.label}
                        </Link>
                      </li>
                    );
                  })}
                </motion.ul>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </nav>

      {/* Wide screens: the full bar. */}
      <nav
        aria-label="Fő navigáció"
        className="fixed right-3 top-3 z-[75] hidden sm:block sm:right-6 sm:top-5"
      >
        <div className="relative">
          <motion.div
            initial={false}
            animate={{ opacity: asMenu ? 1 : 0 }}
            transition={{ duration: 0.3, delay: barDelay }}
            className={PILL_BG}
            style={PILL_BG_STYLE}
          >
            <GlassPane radius={PILL_R_FULL} />
          </motion.div>
          <ul
            style={{ pointerEvents: asMenu ? 'auto' : 'none' }}
            className={`relative z-20 flex items-center gap-[1.6px] sm:gap-[2.4px] ${PILL_PAD}`}
          >
            {LINKS.map((link, i) => {
              const active = isActive(link.href);
              return (
                <motion.li
                  key={link.href}
                  data-active={active}
                  initial={false}
                  animate={{ opacity: asMenu ? 1 : 0 }}
                  transition={{ duration: 0.28, ease: 'easeOut', delay: itemDelay(i) }}
                >
                  <Link
                    href={link.href}
                    className={`${PILL_LINK} ${active ? ACTIVE : INACTIVE}`}
                  >
                    {link.label}
                  </Link>
                </motion.li>
              );
            })}
          </ul>
        </div>
      </nav>
    </>
  );
}
