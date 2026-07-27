'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { shouldBypassOptimizer } from '@/lib/image';

/**
 * Full-width project gallery. Draggable left/right (pointer drag-to-scroll),
 * native touch scroll, and — while hovered — vertical mouse-wheel / trackpad
 * gestures are translated into horizontal scrolling.
 */
export function ProjectGallery({
  images,
  alt,
  tileClassName = 'aspect-[4/3] h-[52vh]',
}: {
  images: string[];
  alt: string;
  tileClassName?: string;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startX: 0, startScroll: 0 });

  // Non-passive wheel listener so we can preventDefault the page from scrolling
  // vertically while the gallery scrolls horizontally.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return; // already horizontal
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0) return; // nothing to scroll — let the page have it
      // Only swallow the wheel while this strip can still consume it. At either
      // end the event passes through, so the page keeps scrolling normally
      // instead of trapping the visitor on the gallery.
      const atStart = el.scrollLeft <= 0.5;
      const atEnd = el.scrollLeft >= max - 0.5;
      if ((e.deltaY > 0 && atEnd) || (e.deltaY < 0 && atStart)) return;
      el.scrollLeft = Math.max(0, Math.min(max, el.scrollLeft + e.deltaY));
      e.preventDefault();
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  function onPointerDown(e: React.PointerEvent) {
    const el = scrollerRef.current;
    if (!el) return;
    drag.current = { active: true, startX: e.clientX, startScroll: el.scrollLeft };
  }
  function onPointerMove(e: React.PointerEvent) {
    const el = scrollerRef.current;
    if (!el || !drag.current.active) return;
    el.scrollLeft = drag.current.startScroll - (e.clientX - drag.current.startX);
  }
  function endDrag() {
    drag.current.active = false;
  }

  return (
    <div
      ref={scrollerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
      className="flex w-full gap-3 overflow-x-auto px-5 py-3 sm:px-8 [-ms-overflow-style:none] [scrollbar-width:none] [@media(hover:hover)and(pointer:fine)]:cursor-grab [@media(hover:hover)and(pointer:fine)]:active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
    >
      {images.map((src, i) => (
        <div
          key={`${src}-${i}`}
          className={`relative shrink-0 overflow-hidden rounded-sm bg-line ${tileClassName}`}
        >
          <Image
            src={src}
            alt={`${alt} — ${i + 1}. kép`}
            fill
            sizes="70vw"
            unoptimized={shouldBypassOptimizer(src)}
            draggable={false}
            className="pointer-events-none object-cover"
          />
        </div>
      ))}
    </div>
  );
}
