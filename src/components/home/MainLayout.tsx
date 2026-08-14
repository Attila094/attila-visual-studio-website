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
      // Which of the two shapes below is in force. <HeroImageSequence> reads
      // it: it treats a band that is a whole screen tall as the centred tile
      // row and ends the sequence on its top edge, and an OPEN band is a whole
      // screen tall for a completely different reason — the gallery inside it.
      // Without this it mistook one for the other, moved the finish line the
      // moment a gallery opened, un-landed the tiles and closed the gallery it
      // had just been asked to open.
      data-tile-band={selectedId ? 'open' : 'closed'}
      // No z-index here on purpose: a positioned element with one creates a
      // stacking context that would trap this section relative to the fixed
      // sequence stage (z-30), which is what paints the tiles.
      // Two shapes, depending on whether a gallery is open.
      //
      // Closed, from `lg` — where the five tiles finally sit on one row — the
      // band is a whole screen tall and holds the row in the middle of it. The
      // padding at the top is the fixed chrome's height (`pt-14` ≈ the 55px the
      // nav pills and the docked logo end at), so the centring happens in what
      // is left BELOW the header rather than in the whole window: that is what
      // makes the gap over the tiles equal the gap under them, with the footer
      // beginning exactly where the band ends. <HeroImageSequence> lands the
      // page on the top of this band, so the arrangement is what the sequence
      // resolves into. Narrower than `lg` the tiles wrap onto two or three rows
      // and a screen-tall band would only strand them.
      //
      // Open, the bottom padding comes back and the centring goes: it belongs
      // to the gallery, not to the tile row — with nothing open it was just
      // space between the tiles and the footer — and a tile row plus a gallery
      // is taller than the screen anyway, so there is no middle to sit in.
      // The scroll margin holds a WORK link's landing clear of the fixed
      // chrome — but wherever the sequence ends ON this band, it must go, and
      // not only because it would double up with the band's own padding. It is
      // 96px the anchor stops SHORT of the band's top, and the sequence ends
      // exactly on that top: leave it in and a WORK link arrives at 96.5% of
      // the flight, the images never land, and not one tile is clickable. So it
      // is off from `lg` up, where the band is centred, and off on a phone,
      // where the sequence ends on the tile column just below. It applies only
      // in between, where the tiles wrap and the sequence stops half a screen
      // short of them anyway.
      className={`relative scroll-mt-0 bg-black px-4 pt-10 transition-[padding] duration-300 ease-out sm:scroll-mt-24 sm:px-6 ${
        selectedId
          ? 'pb-16 sm:pb-20'
          : 'pb-0 lg:flex lg:min-h-svh lg:scroll-mt-0 lg:flex-col lg:justify-center lg:pt-14'
      }`}
    >
      {/* `w-full` is load-bearing once the band is a flex column: an item with
          auto side margins does not stretch to the cross axis, so this would
          size to its contents — and its contents are the empty placeholders the
          sequence measures, which would collapse the row to nothing. */}
      <div className="mx-auto w-full max-w-shell">
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
