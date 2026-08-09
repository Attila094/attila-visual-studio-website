'use client';

import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';

/** The whole essay, first line to last. */
const TOTAL_MS = 2000;
/** How long one line takes on its own. The stagger fills what is left. */
const LINE_MS = 700;
/** Accelerating: the line opens slowly at its left edge and runs away to the
 *  right. */
const EASE = 'cubic-bezier(0.4, 0, 0.9, 0.7)';
/** Room for the descenders, given straight back so nothing moves. */
const BLEED = '0.2em';

/**
 * Reveals its copy one visual line at a time, once, the first time it is
 * scrolled into view. Each line wipes open left to right, gathering pace as it
 * goes, and rises into place as it does.
 *
 * Visual lines are not elements, so they have to be found: every word is boxed,
 * the boxes are grouped by the top they came to rest at, and each group is
 * rebuilt as one line that can be animated. That regrouping is also what would
 * quietly break the justified setting — a one-line block is its own last line,
 * and a last line is never justified — so every line but a paragraph's final
 * one is told to justify its last line too, which is exactly what it was doing
 * inside the paragraph. When the animation ends the original markup goes back,
 * so a later resize re-wraps the real paragraph rather than these frozen lines.
 */
export function RevealLines({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  // Two elements on purpose. A clip-path shrinks an element's visible box to
  // nothing, and IntersectionObserver honours that — an element hidden this way
  // never reports itself as in view, so it could never trigger its own reveal.
  // The outer box is what is watched; only the inner one is ever hidden.
  const frame = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLDivElement>(null);
  const armed = useRef(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    el.style.visibility = 'hidden';
    armed.current = true;
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || !frame.current || !armed.current) return;

    const run = () => {
      const paras = [...el.querySelectorAll('p')];
      if (!paras.length) {
        el.style.visibility = '';
        return;
      }
      const originals = paras.map((p) => p.innerHTML);
      const justified = getComputedStyle(paras[0]).textAlign === 'justify';

      // 1 — box every word, so the browser will tell us where the lines fell.
      const boxed = paras.map((p) => {
        const words = (p.textContent ?? '').split(/\s+/).filter(Boolean);
        p.textContent = '';
        return words.map((w, i) => {
          if (i) p.append(' ');
          const s = document.createElement('span');
          s.textContent = w;
          p.append(s);
          return s;
        });
      });

      // 2 — group by the top each word came to rest at.
      const lines: { para: number; words: string[] }[] = [];
      boxed.forEach((spans, para) => {
        let top: number | null = null;
        let current: string[] | null = null;
        for (const s of spans) {
          const t = Math.round(s.offsetTop);
          if (t !== top || !current) {
            current = [];
            lines.push({ para, words: current });
            top = t;
          }
          current.push(s.textContent ?? '');
        }
      });

      // 3 — rebuild each paragraph out of animatable lines.
      const inners: HTMLElement[] = [];
      paras.forEach((p, para) => {
        const own = lines.filter((l) => l.para === para);
        p.textContent = '';
        own.forEach((line, i) => {
          const outer = document.createElement('span');
          outer.style.display = 'block';
          outer.style.overflow = 'hidden';
          outer.style.paddingBottom = BLEED;
          outer.style.marginBottom = `-${BLEED}`;

          const inner = document.createElement('span');
          inner.style.display = 'block';
          // The last line of a paragraph is the one that was ragged; the rest
          // were justified across the full measure and must stay that way.
          if (justified && i < own.length - 1) inner.style.textAlignLast = 'justify';
          inner.textContent = line.words.join(' ');

          outer.append(inner);
          p.append(outer);
          inners.push(inner);
        });
      });

      el.style.visibility = '';

      // 4 — run them, the last one landing on the two-second mark.
      const gap = inners.length > 1 ? (TOTAL_MS - LINE_MS) / (inners.length - 1) : 0;
      const last = inners
        .map((inner, i) =>
          inner.animate(
            [
              { clipPath: 'inset(0 100% 0 0)', transform: 'translateY(100%)' },
              { clipPath: 'inset(0 0 0 0)', transform: 'translateY(0)' },
            ],
            { duration: LINE_MS, delay: i * gap, easing: EASE, fill: 'backwards' },
          ),
        )
        .pop();

      last?.finished
        .catch(() => {})
        .finally(() => {
          // Hand the paragraphs back exactly as they were written.
          paras.forEach((p, i) => {
            p.innerHTML = originals[i];
          });
        });
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect(); // once per page load, and no more
        run();
      },
      { threshold: 0.15 },
    );
    io.observe(frame.current);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={frame} className={className}>
      <div ref={ref}>{children}</div>
    </div>
  );
}
