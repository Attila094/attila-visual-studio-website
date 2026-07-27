'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MainTiles } from './MainTiles';
import { ProjectsGallery } from './ProjectsGallery';
import { selectedTile } from '@/lib/heroSequenceState';

/**
 * The main landing content that sits between <Hero /> and <Footer />:
 * the tile row's layout, and — only while a tile is selected — the projects
 * bento gallery. The tiles the visitor actually clicks are the landed images
 * of <HeroImageSequence>, so the selection lives in a shared motion value
 * rather than in this component's own state. Clicking empty space (anything
 * that isn't a landed tile or the open gallery) closes it again.
 */
export function MainLayout() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedId(selectedTile.get());
    return selectedTile.on('change', (v) => setSelectedId(v as string | null));
  }, []);

  // Click on empty space closes the gallery. A click counts as "inside" only if
  // it lands on one of the sequence's tiles or on the open gallery.
  useEffect(() => {
    if (!selectedId) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest?.('[data-sequence-tile]')) return;
      if (galleryRef.current?.contains(t)) return;
      selectedTile.set(null);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [selectedId]);

  return (
    <section
      id="munkak"
      // No z-index here on purpose: a positioned element with one creates a
      // stacking context that would trap this section relative to the fixed
      // sequence stage (z-30), which is what paints the tiles.
      className="relative scroll-mt-24 bg-black px-4 pb-16 pt-10 sm:px-6 sm:pb-20"
    >
      <div className="mx-auto max-w-shell">
        <MainTiles />

        <AnimatePresence initial={false}>
          {selectedId && (
            <motion.div
              key="gallery"
              ref={galleryRef}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6"
            >
              <ProjectsGallery categoryId={selectedId} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
