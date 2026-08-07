'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion, type Easing } from 'framer-motion';
import { useHeroReveal } from './home/HeroRevealContext';
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
const PILL_LINK =
  'block rounded-full px-[8px] py-[5.6px] text-[7.2px] font-bold uppercase tracking-[0.14em] transition-colors sm:px-[16px] sm:text-[8px]';
const PILL_BG =
  'absolute inset-0 z-0 rounded-full bg-white shadow-[0_10px_30px_rgba(0,0,0,0.12)] ring-1 ring-black/5';
const INACTIVE = 'text-[#6f6f6f] hover:text-ink';
const ACTIVE = 'text-[#3a3a3a]';

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

  // Links fade in left-to-right once the bar appears on scroll.
  const itemDelay = (i: number) => (asMenu && isHome && !reduce ? 0.12 + i * 0.07 : 0);
  const barDelay = asMenu && isHome && !reduce ? 0.82 : 0;
  const contactActive = isActive('/contact');

  return (
    <>
      {isHome && (
        <motion.div
          aria-hidden
          className="pointer-events-none fixed left-1/2 z-[70] rounded-full"
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
          }}
        />
      )}

      {/* CONTACT — same pill, same reveal, mirrored into the top-left corner
          and vertically aligned with the menu (identical top offset). */}
      <nav aria-label="Kapcsolat" className="fixed left-3 top-3 z-[75] sm:left-6 sm:top-5">
        <div className="relative">
          <motion.div
            initial={false}
            animate={{ opacity: asMenu ? 1 : 0 }}
            transition={{ duration: 0.3, delay: barDelay }}
            className={PILL_BG}
          />
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
              className={`${PILL_LINK} ${contactActive ? `${ACTIVE} bg-[#cfcfcf]` : INACTIVE}`}
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
        className="fixed right-3 top-3 z-[75] sm:hidden"
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
          />
          <motion.div
            style={{ pointerEvents: asMenu ? 'auto' : 'none' }}
            initial={false}
            animate={{ opacity: asMenu ? 1 : 0 }}
            transition={{ duration: 0.28, ease: 'easeOut', delay: barDelay }}
            className={`relative z-20 ${PILL_PAD}`}
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
          />
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
                    className={`${PILL_LINK} ${active ? ACTIVE : INACTIVE} ${
                      !isHome && active ? 'bg-[#cfcfcf]' : ''
                    }`}
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
