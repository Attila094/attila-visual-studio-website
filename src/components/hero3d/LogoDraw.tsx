'use client';

import { motion } from 'framer-motion';
import { RAW_LINES, SVG_W, SVG_H } from './logoLines';

/**
 * Phase 1 — the 2D reveal. Draws each logo stroke with Framer Motion's
 * `pathLength` on a <motion.line>, staggered. When the whole orchestration
 * finishes it calls `onDone`, which triggers the hand-off to the R3F field.
 *
 * The endpoints are the same RAW_LINES the 3D field uses, so the drawn logo and
 * the 3D logo-formation line up during the crossfade.
 */
export function LogoDraw({ onDone }: { onDone: () => void }) {
  return (
    <motion.svg
      className="absolute inset-0 h-full w-full"
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      preserveAspectRatio="xMidYMid meet"
      initial="hidden"
      animate="visible"
      onAnimationComplete={() => onDone()}
    >
      {RAW_LINES.map((l, i) => (
        <motion.line
          key={i}
          x1={l.a[0]}
          y1={l.a[1]}
          x2={l.b[0]}
          y2={l.b[1]}
          stroke="#ffffff"
          strokeOpacity={l.o}
          strokeWidth={35}
          strokeLinecap="round"
          variants={{
            hidden: { pathLength: 0, opacity: 0 },
            visible: {
              pathLength: 1,
              opacity: 1,
              transition: {
                pathLength: { delay: i * 0.11, duration: 0.7, ease: 'easeInOut' },
                opacity: { delay: i * 0.11, duration: 0.2 },
              },
            },
          }}
        />
      ))}
    </motion.svg>
  );
}
