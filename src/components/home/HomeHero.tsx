'use client';

import { useEffect, useRef, useState } from 'react';
import { Bebas_Neue } from 'next/font/google';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useHeroReveal } from './HeroRevealContext';

const bebas = Bebas_Neue({ subsets: ['latin', 'latin-ext'], weight: '400' });

// Web-encoded alpha video (VP9 + alpha) transcoded from
// `hero page animation_white.mov`, with a transparent last-frame PNG poster as
// the fallback cover for browsers that can't decode VP9-alpha (e.g. Safari).
const SRC = '/hero-white.webm';
const POSTER = '/hero-white-cover.png';
const SESSION_KEY = 'avs-hero-seen';
const MAX_INTRO_MS = 8000;
// Scale the cover shrinks to when docked at the top.
const DOCK_SCALE = 0.12;

export function HomeHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();
  const { revealed, setRevealed } = useHeroReveal();
  const [dims, setDims] = useState({ endScroll: 680, yTarget: -366 });

  const { scrollY } = useScroll();
  // Cover shrinks + lifts to the top-middle and STAYS there (no fade-out).
  const scale = useTransform(scrollY, [0, dims.endScroll], [1, DOCK_SCALE], { clamp: true });
  const y = useTransform(scrollY, [0, dims.endScroll], [0, dims.yTarget], { clamp: true });
  const textScrollFade = useTransform(scrollY, [0, 180], [1, 0], { clamp: true });
  // Once shrunk (docked), the cover becomes a clickable link. Derived straight
  // from the scroll value (no React state) so it can't race.
  const coverPointer = useTransform(scrollY, (v) => (v > 300 ? 'auto' : 'none'));
  const coverCursor = useTransform(scrollY, (v) => (v > 300 ? 'pointer' : 'default'));

  // Intro playback + reveal (skip for reduced-motion / already-seen this session).
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    let alreadySeen = false;
    try {
      alreadySeen = sessionStorage.getItem(SESSION_KEY) === '1';
    } catch {
      /* ignore */
    }

    const reveal = () => {
      setRevealed(true);
      try {
        sessionStorage.setItem(SESSION_KEY, '1');
      } catch {
        /* ignore */
      }
    };

    if (reduce || alreadySeen) {
      const toEnd = () => {
        try {
          v.currentTime = Math.max(0, v.duration - 0.04);
        } catch {
          /* ignore */
        }
        v.pause();
        reveal();
      };
      if (v.readyState >= 1 && Number.isFinite(v.duration)) toEnd();
      else v.addEventListener('loadedmetadata', toEnd, { once: true });
      return;
    }

    v.play().catch(() => {});
    v.addEventListener('ended', reveal, { once: true });
    v.addEventListener('error', reveal, { once: true });
    const timer = window.setTimeout(reveal, MAX_INTRO_MS);
    return () => window.clearTimeout(timer);
  }, [reduce, setRevealed]);

  // Viewport measure + dock target. The cover is `fixed inset-0`, `origin-top`,
  // scaled to DOCK_SCALE, so its visual centre lands at `vh/2 * DOCK_SCALE +
  // yTarget`. Pick yTarget so that centre sits on the menu bar's vertical
  // midline — the shrunk logo ends up on the same Y as the nav.
  useEffect(() => {
    const measure = () => {
      const vh = window.innerHeight;
      const nav = document.querySelector<HTMLElement>('nav[aria-label]');
      let navMid = 40;
      if (nav) {
        const r = nav.getBoundingClientRect();
        navMid = r.top + r.height / 2;
      }
      // Finish docking within the actually-scrollable distance (the gallery is
      // hidden by default, so the page can be short) — but no slower than 85% of
      // the viewport. This guarantees the shrink always completes.
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - vh);
      const endScroll = Math.min(vh * 0.85, maxScroll);
      setDims({ endScroll, yTarget: navMid - (vh / 2) * DOCK_SCALE });
    };
    measure();
    // Re-measure after paint so the nav bar has its final size.
    const raf = requestAnimationFrame(measure);
    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', measure);
    };
  }, []);

  // Lock scrolling until the intro reveals.
  useEffect(() => {
    document.body.style.overflow = revealed ? '' : 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [revealed]);

  // rAF-based smooth scroll (works even where native `behavior: 'smooth'` is
  // ignored). Reduced-motion jumps instantly.
  const backToHero = () => {
    if (reduce) {
      window.scrollTo(0, 0);
      return;
    }
    const start = window.scrollY;
    const startedAt = performance.now();
    const duration = 600;
    const step = (now: number) => {
      const p = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      window.scrollTo(0, Math.round(start * (1 - eased)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  return (
    <>
      {/* Cover / intro video → shrinks to the top-middle and stays as a link
          back to the hero (scrolls to top). */}
      <motion.div
        style={{ scale, y, willChange: 'transform' }}
        className="fixed inset-0 z-40 origin-top"
      >
        <motion.div
          role="link"
          aria-label="Vissza a hero tetejére"
          onClick={() => {
            if (window.scrollY > 300) backToHero();
          }}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && window.scrollY > 300) backToHero();
          }}
          style={{ pointerEvents: coverPointer, cursor: coverCursor }}
          className="h-full w-full"
        >
          <motion.video
            ref={videoRef}
            src={SRC}
            poster={POSTER}
            muted
            playsInline
            preload="auto"
            initial={false}
            animate={{ opacity: revealed ? 0.5 : 1 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="h-full w-full object-cover"
          />
        </motion.div>
      </motion.div>

      {/* "VISUAL STUDIO" — Bebas Neue, letter-spacing widened 25%. Fades in on
          reveal, fades out on scroll. */}
      <motion.div
        style={{ opacity: textScrollFade }}
        className="pointer-events-none fixed inset-0 z-[45] flex items-center justify-center"
      >
        <motion.h2
          initial={false}
          animate={{ opacity: revealed ? 1 : 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          // 30% smaller letters, centred both axes, white. Spacing is `em`-based
          // so it's scaled up by 1/0.7 to keep the same absolute letter/word gaps.
          className={`${bebas.className} flex items-center gap-[1.286em] text-[1.575rem] uppercase tracking-[0.757em] text-white sm:text-[2.625rem] lg:text-[3.15rem]`}
        >
          <span>Visual</span>
          <span>Studio</span>
        </motion.h2>
      </motion.div>
    </>
  );
}
