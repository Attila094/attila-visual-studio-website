// The five slots that drive the hero scroll sequence AND, once that sequence
// lands, the backgrounds of the five MainTiles. Order is significant: slot i
// becomes tile i, so this list must stay in step with `mainTiles`.
//
// Two slots carry a second face. They hold a pair of disciplines rather than
// one, so when the caption moves from the first to the second the image turns
// over to match: ÉPÍTÉSZET becomes BELSŐÉPÍTÉSZET, and VIDEOGRÁFIA — which is a
// silent clip, not a still — becomes FOTOGRÁFIA. The turn is driven from
// <SequenceCaptions>, so the picture can never disagree with the word.
//
// Files are 3:4 to match a MainTile, so the final morph needs no crop; anything
// that isn't is trimmed to the same box by `object-cover`. Filenames are slugs
// rather than the Hungarian titles — an ampersand and spaces have no business
// in a URL path.

export interface HeroSequenceImage {
  label: string;
  /** The first face. A `.mp4` here is played silently on loop in its place. */
  src: string;
  alt: string;
  /** Held behind the clip until it has decoded. Stills don't need one. */
  poster?: string;
  /** The second face, shown once the slot turns over. */
  back?: string;
  backAlt?: string;
}

export const heroSequenceImages: HeroSequenceImage[] = [
  {
    label: '01',
    src: '/hero-sequence/vizualizacio.webp',
    alt: 'Vizualizáció — belső látványterv',
  },
  {
    label: '02',
    src: '/hero-sequence/epiteszet.webp',
    alt: 'Építészet — épület látványterve',
    back: '/hero-sequence/belsoepiteszet.webp',
    backAlt: 'Belsőépítészet — enteriőr',
  },
  {
    label: '03',
    src: '/hero-sequence/videografia.mp4',
    poster: '/hero-sequence/videografia.webp',
    alt: 'Videográfia — építészeti videó',
    back: '/hero-sequence/fotografia.webp',
    backAlt: 'Fotográfia — építészeti fotó',
  },
  {
    label: '04',
    src: '/hero-sequence/grafikai-tervezes.webp',
    alt: 'Grafikai tervezés — fekete-fehér arculati anyag',
  },
  {
    label: '05',
    src: '/hero-sequence/3d-nyomtatas.webp',
    alt: '3D nyomtatás — nyomtatott lámpa',
  },
];
