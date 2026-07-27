import type { Transition } from 'framer-motion';

/** Shared spring for the grid ↔ hero morph and the services tile expansion. */
export const morphSpring: Transition = {
  type: 'spring',
  stiffness: 260,
  damping: 32,
  mass: 0.9,
};

/** Fast easing for hover-scale and opacity, GPU-only properties. */
export const hoverEase: Transition = {
  duration: 0.3,
  ease: [0.22, 1, 0.36, 1],
};

export function projectLayoutId(slug: string): string {
  return `project-image-${slug}`;
}
