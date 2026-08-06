'use client';

import { useEffect, useState } from 'react';
import { Bebas_Neue } from 'next/font/google';
import { motion, type MotionValue } from 'framer-motion';
import { mainTiles } from '@/content/mainTiles';
import { markCaptionTyped, typedCaptions } from '@/lib/introPlayed';
import { MOBILE_MAX, TYPE_MS } from './HeroImageSequence';

const bebas = Bebas_Neue({ subsets: ['latin', 'latin-ext'], weight: '400' });

/** While the letters are landing, and once they have. */
const TYPING_OPACITY = 0.6;
const SETTLED_OPACITY = 0.1;
/** On a phone the caption sits in its own band above the images instead of over
 *  them, so it holds one steady value rather than dimming once it has landed. */
const MOBILE_OPACITY = 0.45;

export const captionTexts = mainTiles.map((t) => t.title);

/**
 * Which captions have already typed themselves in.
 *
 * Module-scoped rather than component state because the caption unmounts when
 * the sequence is scrolled backwards, and state would forget — the type effect
 * would replay on the way back down. It is seeded from (and written through to)
 * sessionStorage, so the effect also doesn't replay on a reload: it plays the
 * first time the site is loaded and no more.
 */
let typedOnce: Set<number> | null = null;
function typedSet(): Set<number> {
  // Lazily, because sessionStorage doesn't exist while rendering on the server.
  if (!typedOnce) typedOnce = typedCaptions();
  return typedOnce;
}

/**
 * The caption for the image currently at full size — centred on the page, one
 * at a time. It types in over TYPE_MS at 60%, drops to 10% the moment the last
 * letter lands, then drops behind the stage and dissolves as its image shrinks.
 * On a phone it holds a flat 45% throughout instead of that 60→10 step.
 *
 * The dissolve arrives as a motion value and is applied to the wrapper, so it
 * can follow the scroll every frame while the 60→10% step stays an ordinary
 * CSS transition on the text itself. The two multiply, as nested opacity does.
 */
export function SequenceCaptions({
  activeIndex,
  front,
  fade,
  bandTop,
  bandHeight,
}: {
  /** The caption to show at the current scroll position; -1 before the first hold. */
  activeIndex: number;
  /** True while this caption belongs in front of the images. */
  front: boolean;
  /** 1 → fully present, 0 → dissolved away. */
  fade: MotionValue<number>;
  /** Top of the phone caption band — the bottom edge of the top bar. */
  bandTop: MotionValue<number>;
  /** Its height — down to the top edge of the big image. */
  bandHeight: MotionValue<number>;
}) {
  // On a phone the caption goes ABOVE the images rather than across them: the
  // wrapper IS the band between the top bar and the images, and the text is
  // centred in it on both axes.
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_MAX - 1}px)`);
    const sync = () => setMobile(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);
  // The typing state carries the caption it belongs to, so a stale count can
  // never be painted against a new caption's text. When `activeIndex` moves,
  // this render already knows the state is for the previous one and derives
  // the right starting point instead of waiting for the effect below to
  // correct it — an effect runs AFTER paint, so that correction would arrive
  // one frame too late and flash the whole next caption on screen.
  const [typed, setTyped] = useState({ i: -1, n: 0, typing: false });
  const current = typed.i === activeIndex;
  const seenBefore = activeIndex >= 0 && typedSet().has(activeIndex);
  const count = current ? typed.n : seenBefore ? captionTexts[activeIndex].length : 0;
  const typing = current ? typed.typing : !seenBefore;

  useEffect(() => {
    if (activeIndex < 0) return;
    const text = captionTexts[activeIndex];
    if (typedSet().has(activeIndex)) {
      setTyped({ i: activeIndex, n: text.length, typing: false });
      return;
    }
    // Claim it up front, so a quick scroll back and forth mid-type doesn't
    // start the animation over — and persist it, so a reload doesn't either.
    typedSet().add(activeIndex);
    markCaptionTyped(activeIndex);
    setTyped({ i: activeIndex, n: 0, typing: true });
    let raf = 0;
    const start = performance.now();
    const tick = () => {
      const t = Math.min(1, (performance.now() - start) / TYPE_MS);
      const n = Math.round(t * text.length);
      const stillTyping = t < 1;
      // Returning `prev` unchanged lets React bail out, so the ~60 ticks a
      // second only cost a render on the frames a letter actually lands.
      setTyped((prev) =>
        prev.i === activeIndex && prev.n === n && prev.typing === stillTyping
          ? prev
          : { i: activeIndex, n, typing: stillTyping },
      );
      if (stillTyping) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [activeIndex]);

  if (activeIndex < 0) return null;

  return (
    <motion.div
      aria-hidden
      style={{
        opacity: fade,
        top: mobile ? bandTop : undefined,
        height: mobile ? bandHeight : undefined,
      }}
      className={`pointer-events-none fixed flex items-center justify-center px-6 ${
        front ? 'z-50' : 'z-20'
      } ${mobile ? 'inset-x-0' : 'inset-0'}`}
    >
      <p
        style={{
          opacity: mobile ? MOBILE_OPACITY : typing ? TYPING_OPACITY : SETTLED_OPACITY,
        }}
        className={`${bebas.className} w-full max-w-[110rem] text-center uppercase leading-[0.9] tracking-[0.08em] text-white transition-opacity duration-500 ${
          // Above the images there is only the band between the top bar and the
          // photograph, so the phone size is capped to what that band can hold.
          mobile
            ? 'text-[clamp(1.75rem,9vw,3.5rem)]'
            : 'text-[clamp(3rem,16.5vw,14.0625rem)]'
        }`}
      >
        {captionTexts[activeIndex].slice(0, count) || ' '}
      </p>
    </motion.div>
  );
}
