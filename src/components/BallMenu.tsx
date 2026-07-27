'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, useReducedMotion, type Easing } from 'framer-motion';
import { useHeroReveal } from './home/HeroRevealContext';

const LBALL_COLORS = [
  { href: '/', label: 'Work' },
  { href: '/services', label: 'Services' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

/** Shared pill geometry, so the INFO button on the left matches the bar on the
 *  right exactly — same height, same baseline. Sized at 80% of the original. */
const PILL_PAD = 'p-[4px] sm:p-[6px]';
const PILL_LINK =
  'block rounded-full px-[8px] py-[5.6px] text-[7.2px] font-bold uppercase tracking-[0.14em] transition-colors sm:px-[16px] sm:text-[8px]';
const PILL_BG =
  'absolute inset-0 z-0 rounded-full bg-white shadow-[0_10px_30px_rgba(0,0,0,0.12)] ring-1 ring-black/5';

const BALL = 16;
const BALL_COLOR = '#ffffff';
const ACTIVE_BG = '#cfcfcf';
const DUR = 1.5; // full scroll-sequence duration (bounce up → squash → sweep right)

/**
 * Unified scroll-cue + navigation.
 *
 * Home, before scroll: a bouncing ball at the bottom-centre; the menu bar is
 * hidden. On scroll the ball stops bouncing, rises to the menu's Y and sweeps
 * right across it — the bar is revealed left-to-right in the ball's wake — then
 * carries on to the right edge of the site, bounces back, and lands on the
 * selected item, becoming its highlight background.
 *
 * The ball lives between the pill's white background (z-0) and its links (z-20),
 * so once landed it IS the active item's background, and while sweeping it reads
 * as the leading edge of the reveal. Only transform / width / height / colour /
 * clip-path animate → 60fps.
 */
export function BallMenu() {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const { revealed } = useHeroReveal();
  const isHome = pathname === '/';

  const containerRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [vp, setVp] = useState({ w: 1280, h: 800 });
  const [geo, setGeo] = useState({ rightRel: 380, midYRel: 22, aX: 8, aY: 8, aW: 84, aH: 34 });

  const isActive = useCallback(
    (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href)),
    [pathname],
  );

  const measure = useCallback(() => {
    const c = containerRef.current;
    if (!c) return;
    const cRect = c.getBoundingClientRect();
    const activeEl = c.querySelector<HTMLElement>('[data-active="true"]');
    const aRect = activeEl ? activeEl.getBoundingClientRect() : cRect;
    setGeo({
      rightRel: cRect.width,
      midYRel: cRect.height / 2,
      aX: aRect.left - cRect.left,
      aY: aRect.top - cRect.top,
      aW: aRect.width,
      aH: aRect.height,
    });
    setVp({ w: window.innerWidth, h: window.innerHeight });
  }, []);

  useEffect(() => {
    // Tracks the scroll rather than latching: the image sequence now runs
    // backwards on the way up, so the ball has to be there to take the handoff
    // back at the top.
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure);
    const raf = requestAnimationFrame(measure);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', measure);
      cancelAnimationFrame(raf);
    };
  }, [measure, pathname]);

  const asMenu = !isHome || scrolled;

  // Container's viewport origin → map the ball's bottom-centre home, the site's
  // right edge, and the viewport's top edge into container-relative offsets.
  const cRect = containerRef.current?.getBoundingClientRect();
  const cLeft = cRect?.left ?? vp.w - geo.rightRel - 24;
  const cTop = cRect?.top ?? 20;
  const midY = geo.midYRel - BALL / 2;
  const homeX = vp.w / 2 - cLeft - BALL / 2;
  const homeY = vp.h - 56 - cTop - BALL / 2;
  const ceilingY = -cTop; // ball's top edge meets the viewport's top edge
  const midAirY = (homeY + ceilingY) / 2; // apex of the rising arc
  const menuLeftX = 0; // menu bar's left edge
  const menuRightX = geo.rightRel - BALL; // menu bar's right end
  const siteRightX = vp.w - cLeft - BALL; // right edge of the site (bounce point)

  // ---- Scroll: hand the ball over to the image sequence ---------------------
  // The ball no longer flies into the bar. On scroll it becomes the first frame
  // of <HeroImageSequence>, which takes over at exactly this size and position —
  // so the ball simply switches off here and the morph looks continuous.
  const handedOff = {
    x: homeX,
    y: homeY,
    scaleX: 1,
    scaleY: 1,
    originX: 0.5,
    originY: 0.5,
    width: BALL,
    height: BALL,
    backgroundColor: BALL_COLOR,
    opacity: 0,
  };

  // Idle: a bouncing ball that squashes on floor contact (origin bottom).
  const idle = reduce
    ? { x: homeX, y: homeY, scaleX: 1, scaleY: 1, originX: 0.5, originY: 1, width: BALL, height: BALL, backgroundColor: BALL_COLOR, opacity: 1 }
    : {
        x: homeX,
        y: [homeY, homeY - 30, homeY],
        scaleX: [1.12, 0.9, 1.12],
        scaleY: [0.88, 1.12, 0.88],
        originX: 0.5,
        originY: 1,
        width: BALL,
        height: BALL,
        backgroundColor: BALL_COLOR,
        opacity: 1,
      };

  const hidden = { x: homeX, y: homeY, scaleX: 1, scaleY: 1, originX: 0.5, originY: 0.5, opacity: 0, width: BALL, height: BALL, backgroundColor: BALL_COLOR };

  const ballAnimate = asMenu ? handedOff : revealed ? idle : hidden;

  const idleLoop = { duration: 1.0, repeat: Infinity, repeatDelay: 0.06, times: [0, 0.5, 1], ease: ['easeOut', 'easeIn'] as Easing[] };
  const ballTransition = asMenu
    ? { duration: DUR * 0.1, ease: 'easeOut' as const }
    : {
        default: { duration: 0.6, ease: 'easeInOut' as const },
        y: reduce ? { duration: 0.3 } : idleLoop,
        scaleX: reduce ? { duration: 0.3 } : idleLoop,
        scaleY: reduce ? { duration: 0.3 } : idleLoop,
      };

  // Links fade in left-to-right once the bar appears on scroll.
  const itemDelay = (i: number) => (asMenu && isHome && !reduce ? 0.12 + i * 0.07 : 0);

  const barDelay = asMenu && isHome && !reduce ? 0.82 : 0;
  const infoActive = isActive('/about');

  return (
    <>
      {/* INFO — same pill, same reveal, mirrored into the top-left corner and
          vertically aligned with the bar (identical top offset and height). */}
      <nav
        aria-label="Információ"
        className="fixed left-3 top-3 z-[75] sm:left-6 sm:top-5"
      >
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
              href="/about"
              data-active={infoActive}
              className={`${PILL_LINK} ${
                infoActive ? 'text-[#3a3a3a]' : 'text-[#6f6f6f] hover:text-ink'
              } ${infoActive ? 'bg-[#cfcfcf]' : ''}`}
            >
              Info
            </Link>
          </motion.div>
        </div>
      </nav>

      <nav aria-label="Fő navigáció" className="fixed right-3 top-3 z-[75] sm:right-6 sm:top-5">
        <div ref={containerRef} className="relative">
          {/* White pill background — fades in as the ball reaches the bar */}
          <motion.div
            initial={false}
            animate={{ opacity: asMenu ? 1 : 0 }}
            transition={{ duration: 0.3, delay: barDelay }}
            className={PILL_BG}
          />

          {/* The ball → active-item background (between bg and links) */}
          {isHome && (
            <motion.div
              aria-hidden
              className="absolute left-0 top-0 z-10 rounded-full"
              initial={false}
              animate={ballAnimate}
              transition={ballTransition}
              style={{ willChange: 'transform, width, height', transformOrigin: 'center' }}
            />
          )}

          {/* Links — appear left-to-right in the ball's wake */}
          <ul
            style={{ pointerEvents: asMenu ? 'auto' : 'none' }}
            className={`relative z-20 flex items-center gap-[1.6px] sm:gap-[2.4px] ${PILL_PAD}`}
          >
            {LBALL_COLORS.map((link, i) => {
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
                    className={`${PILL_LINK} ${
                      active ? 'text-[#3a3a3a]' : 'text-[#6f6f6f] hover:text-ink'
                    } ${!isHome && active ? 'bg-[#cfcfcf]' : ''}`}
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
