'use client';

import dynamic from 'next/dynamic';
import { useHeroReveal } from './HeroRevealContext';

// R3F must not run during SSR — load the whole experience client-only.
const HeroExperience = dynamic(
  () => import('@/components/hero3d/HeroExperience').then((m) => m.HeroExperience),
  { ssr: false },
);

/**
 * Homepage hero: the interactive 3D orbit experience (logo draws → lines break
 * into orbits around "VISUAL STUDIO" → hover reveals media).
 *
 * The global BallMenu's bouncing-ball scroll cue only appears once the intro has
 * "revealed" (see HeroRevealContext / BallMenu). We fire that the moment the
 * logo finishes drawing and the hand-off to the 3D field begins.
 */
export function HomeHero3D() {
  const { setRevealed } = useHeroReveal();
  return <HeroExperience onRevealed={() => setRevealed(true)} />;
}
