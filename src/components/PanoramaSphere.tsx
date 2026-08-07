'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useTexture } from '@react-three/drei';
import { SphereGeometry, SRGBColorSpace } from 'three';

/** Vertical field of view. At the frame's 2:1 the horizontal view works out
 *  near 90° — about a quarter turn, which reads like standing in the room. */
const FOV = 55;

function Dome({ src }: { src: string }) {
  const texture = useTexture(src);

  // The renders are authored in sRGB; without this three treats them as linear
  // and the room comes out washed out.
  useEffect(() => {
    texture.colorSpace = SRGBColorSpace;
    texture.needsUpdate = true;
  }, [texture]);

  // Mirroring the *geometry* is what turns the sphere inside out, so the
  // camera at its centre sees the render rather than nothing.
  //
  // A negative scale on the mesh does not work: three notices the mirrored
  // matrix and flips its winding test to compensate, so the faces still point
  // outward and the sphere stays invisible from within. Baking the flip into
  // the vertices leaves the object matrix alone, and there is no compensation
  // to undo it. `side={BackSide}` would also show the inside, but mirrored
  // left-to-right — this way the room reads the right way round.
  const geometry = useMemo(() => {
    // Sphere UVs are already equirectangular, so the render maps straight on.
    const sphere = new SphereGeometry(10, 64, 40);
    sphere.scale(-1, 1, 1);
    return sphere;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

/**
 * A drag-to-look viewer that projects an equirectangular (360°) render onto the
 * inside of a sphere, with the camera at its centre.
 *
 * Unlike panning a flat copy of the same image, this reprojects: verticals stay
 * vertical wherever you turn, and the horizontal wrap is free — it is a real
 * sphere, so there is no seam to hide and nothing to loop by hand.
 *
 * Mount it only while it is on screen. It holds a WebGL context and renders on
 * a continuous loop, which is cheap for one transient panel and wasteful for a
 * page full of them.
 */
export function PanoramaSphere({
  src,
  /** Painted behind the canvas so the frame is never empty while the texture
   *  decodes. Any still from the same render will do. */
  poster,
  label = '360°-os panoráma — húzd a képet a körbenézéshez',
  className = '',
}: {
  src: string;
  poster?: string;
  label?: string;
  className?: string;
}) {
  const frameRef = useRef<HTMLElement>(null);
  const [settled, setSettled] = useState(false);

  // react-three-fiber sizes its canvas from `getBoundingClientRect`, which
  // includes any transform on an ancestor. This viewer opens inside a panel
  // that morphs into place under a Framer scale, so measuring during the
  // animation locks in a canvas that is short of the frame — and since the
  // element's *layout* box never changes, no ResizeObserver ever fires to
  // correct it. Waiting for the box to hold still hands r3f a settled frame.
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    let raf = 0;
    let last = -1;
    let stable = 0;
    const tick = () => {
      const width = el.getBoundingClientRect().width;
      stable = Math.abs(width - last) < 0.5 ? stable + 1 : 0;
      last = width;
      if (stable >= 3) return setSettled(true);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <figure
      ref={frameRef}
      aria-label={label}
      className={`relative aspect-[2/1] w-full overflow-hidden rounded-xl bg-white/5 ${className}`}
    >
      {poster && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={poster}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {settled && (
        <Canvas
          // Just off the centre: OrbitControls needs the camera and its target
          // to be distinct, and at this distance the sphere still surrounds it.
          camera={{ fov: FOV, position: [0, 0, 0.1] }}
          dpr={[1, 2]}
          // OrbitControls asks the canvas for `touch-action: none`, and
          // react-three-fiber overwrites it with `auto` — which hands the whole
          // gesture back to the browser and leaves a phone scrolling the page
          // instead of turning the room. `pan-y` splits it: horizontal turns
          // the view, vertical still scrolls. It has to be `!important` to beat
          // r3f's inline style, and a rule rather than `onCreated` so it holds
          // if r3f writes that style again.
          className="relative cursor-grab active:cursor-grabbing [&_canvas]:!touch-pan-y"
        >
          <Suspense fallback={null}>
            <Dome src={src} />
          </Suspense>

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            enableDamping
            dampingFactor={0.08}
            // Negative so the room follows the pointer rather than opposing it.
            rotateSpeed={-0.35}
            // Stay near the horizon: the poles of an interior render are its
            // least convincing part.
            minPolarAngle={Math.PI / 2.6}
            maxPolarAngle={Math.PI / 1.6}
          />
        </Canvas>
      )}
    </figure>
  );
}
