// The five renders that drive the hero scroll sequence AND, once that sequence
// lands, the backgrounds of the five MainTiles. Order is significant: image i
// becomes tile i, so this list must stay in step with `mainTiles`.
//
// Each file is a WebP named for the service it stands for. Four are 1600x2133
// (3:4), the same aspect as a MainTile, so the final morph needs no crop;
// `foto-es-videografia` is a 2:3 frame, which `object-cover` trims to the same
// box. Filenames are slugs rather than the Hungarian titles — an ampersand and
// spaces have no business in a URL path.

export interface HeroSequenceImage {
  label: string;
  src: string;
  alt: string;
}

export const heroSequenceImages: HeroSequenceImage[] = [
  {
    label: '01',
    src: '/hero-sequence/epiteszeti-vizualizacio.webp',
    alt: 'Építészeti vizualizáció — belső látványterv',
  },
  {
    label: '02',
    src: '/hero-sequence/epiteszet-belsoepiteszet.webp',
    alt: 'Építészet & belsőépítészet — enteriőr',
  },
  {
    label: '03',
    src: '/hero-sequence/foto-es-videografia.webp',
    alt: 'Fotó és videógráfia — építészeti fotó',
  },
  {
    label: '04',
    src: '/hero-sequence/grafikai-tervezes.webp',
    alt: 'Grafikai tervezés — arculati anyag',
  },
  {
    label: '05',
    src: '/hero-sequence/3d-nyomtatas.webp',
    alt: '3D nyomtatás — nyomtatott lámpa',
  },
];
