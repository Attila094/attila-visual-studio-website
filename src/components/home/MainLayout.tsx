'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MainTiles } from './MainTiles';
import { ProjectsGallery } from './ProjectsGallery';
import { selectedTile } from '@/lib/heroSequenceState';
import { WORK_ANCHOR } from '@/lib/anchors';

/** Room left above the gallery when it is scrolled into view — enough to clear
 *  the fixed nav pills and the docked logo, which would otherwise sit on top of
 *  the gallery's own filter row. */
const GALLERY_MARGIN = 72;

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

  // Opening a gallery pushes it in below the tiles, mostly off the bottom of
  // the screen — so bring it into view. One frame's wait lets the newly mounted
  // panel land in the layout before its position is read.
  useEffect(() => {
    if (!selectedId) return;
    const raf = requestAnimationFrame(() => {
      const el = galleryRef.current;
      if (!el) return;
      const top = window.scrollY + el.getBoundingClientRect().top - GALLERY_MARGIN;
      window.scrollTo({ top, behavior: 'smooth' });
    });
    return () => cancelAnimationFrame(raf);
  }, [selectedId]);

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
      // Where every WORK link lands.
      id={WORK_ANCHOR}
      // No z-index here on purpose: a positioned element with one creates a
      // stacking context that would trap this section relative to the fixed
      // sequence stage (z-30), which is what paints the tiles.
      // The bottom padding belongs to the gallery, not to the tile row: with
      // the gallery closed it is space between the tiles and the footer with
      // nothing in it, so it goes with the gallery it was holding open.
      className={`relative scroll-mt-24 bg-black px-4 pt-10 transition-[padding] duration-300 ease-out sm:px-6 ${
        selectedId ? 'pb-16 sm:pb-20' : 'pb-0'
      }`}
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
