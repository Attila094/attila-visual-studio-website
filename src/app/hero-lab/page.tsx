'use client';

import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';

// R3F must not run during SSR — load the whole experience client-only.
const HeroExperience = dynamic(
  () => import('@/components/hero3d/HeroExperience').then((m) => m.HeroExperience),
  { ssr: false },
);

/**
 * Local-only scratch page for iterating on the hero in isolation. It is NOT
 * part of the public site: a production build renders the 404 instead, so the
 * route can't be reached or indexed. Still available under `next dev`.
 */
export default function HeroLabPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <HeroExperience />;
}
