// The five renders that drive the hero scroll sequence AND, once that sequence
// lands, the backgrounds of the five MainTiles. Order is significant: image i
// becomes tile i, so this list must stay in step with `mainTiles`.
//
// Each file is a 1600x2133 (3:4) WebP — the same aspect as a MainTile, so the
// final morph from image to tile needs no crop or letterboxing.

export interface HeroSequenceImage {
  label: string;
  src: string;
  alt: string;
}

export const heroSequenceImages: HeroSequenceImage[] = [
  { label: '01', src: '/hero-sequence/heviz.webp', alt: 'Hévíz — látványterv' },
  { label: '02', src: '/hero-sequence/helikon.webp', alt: 'Helikon — homlokzat' },
  { label: '03', src: '/hero-sequence/rad.webp', alt: 'Rád — látványterv' },
  { label: '04', src: '/hero-sequence/misina.webp', alt: 'Misina — látványterv' },
  { label: '05', src: '/hero-sequence/tidal.webp', alt: 'Tidal — 3D nyomtatott lámpa' },
];
