'use client';

import { createContext, useContext, useState } from 'react';

/**
 * Coordinates the hero intro with the global BallMenu: the bouncing ball only
 * appears once the intro video has revealed the cover, and BallMenu reads that
 * flag from here.
 */
const HeroRevealContext = createContext<{
  revealed: boolean;
  setRevealed: (v: boolean) => void;
}>({ revealed: false, setRevealed: () => {} });

export function HeroRevealProvider({ children }: { children: React.ReactNode }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <HeroRevealContext.Provider value={{ revealed, setRevealed }}>
      {children}
    </HeroRevealContext.Provider>
  );
}

export const useHeroReveal = () => useContext(HeroRevealContext);
