'use client';

import { LayoutGroup } from 'framer-motion';

/**
 * A template (not a layout) re-mounts on every route change, which is exactly
 * what the shared-element grid ↔ hero morph needs: the outgoing and incoming
 * routes share one LayoutGroup so Framer Motion can interpolate the matching
 * `layoutId` across the navigation instead of jump-cutting.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <LayoutGroup>{children}</LayoutGroup>;
}
