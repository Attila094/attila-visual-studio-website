/**
 * The three sets behind the "Építészeti vizualizáció" tile, taken from
 * `projects/Vizualizáció` and re-encoded for the web.
 *
 * Stills keep their own proportions (the set runs from a 2.19:1 panorama crop
 * to a 3:4 portrait), so their dimensions are recorded here for next/image.
 * The panoramas are true 360 renders — 6000x3000 equirectangular — stored at
 * 2560 wide for the sphere's texture, with a lighter 1280 copy standing in
 * until it decodes.
 */
export interface VizStill {
  src: string;
  width: number;
  height: number;
}

export interface VizPanorama {
  /** The equirectangular texture the sphere is mapped with. */
  src: string;
  /** A flat still of the same render: the grid tile, and the frame the viewer
   *  holds until its texture is ready. */
  poster: string;
}

export interface VizAnimation {
  src: string;
  poster: string;
}

export const vizStills: VizStill[] = [
  // The two Misina shots open the set — the rest keeps its previous order.
  { src: '/media/viz/still/misina-01.webp', width: 1600, height: 1200 },
  { src: '/media/viz/still/misina-04.webp', width: 1600, height: 1600 },
  { src: '/media/viz/still/cover-helikon-facade-shot.webp', width: 1200, height: 1600 },
  { src: '/media/viz/still/helikon-cloudy-shot.webp', width: 1600, height: 1054 },
  { src: '/media/viz/still/helikon-winter-pink-sky.webp', width: 1600, height: 1200 },
  { src: '/media/viz/still/hertelend-side.webp', width: 1600, height: 732 },
  { src: '/media/viz/still/heviz-01.webp', width: 1200, height: 1600 },
  { src: '/media/viz/still/heviz-02.webp', width: 1600, height: 1137 },
  { src: '/media/viz/still/heviz-03.webp', width: 1600, height: 1600 },
  { src: '/media/viz/still/heviz-04.webp', width: 1600, height: 1200 },
  { src: '/media/viz/still/heviz-05.webp', width: 1200, height: 1600 },
  { src: '/media/viz/still/heviz-a109-bathroom.webp', width: 1200, height: 1600 },
  { src: '/media/viz/still/heviz-a307-kitchen.webp', width: 1600, height: 1200 },
  { src: '/media/viz/still/heviz-a405-nappali.webp', width: 1600, height: 1600 },
  { src: '/media/viz/still/heviz-a405-szoba.webp', width: 1600, height: 1600 },
  { src: '/media/viz/still/heviz-b302-bathroom.webp', width: 1200, height: 1600 },
  { src: '/media/viz/still/heviz-b302-kitchen.webp', width: 1600, height: 1200 },
  { src: '/media/viz/still/heviz-b302-kitchen-detail.webp', width: 1200, height: 1600 },
  { src: '/media/viz/still/heviz-b303-bathroom.webp', width: 1200, height: 1600 },
  { src: '/media/viz/still/heviz-b303-kitchen-2.webp', width: 1600, height: 1600 },
  { src: '/media/viz/still/heviz-aerial-00.webp', width: 1600, height: 1600 },
  { src: '/media/viz/still/heviz-aerial-01.webp', width: 1600, height: 1429 },
  { src: '/media/viz/still/heviz-aerial-02.webp', width: 1600, height: 1319 },
  { src: '/media/viz/still/misina-03.webp', width: 1600, height: 1200 },
  { src: '/media/viz/still/misina-05.webp', width: 1200, height: 1600 },
  { src: '/media/viz/still/exterior-001-1.webp', width: 1600, height: 1600 },
  { src: '/media/viz/still/exterior-001-2.webp', width: 1600, height: 1600 },
  { src: '/media/viz/still/rad-interior-02.webp', width: 1200, height: 1600 },
  { src: '/media/viz/still/rad-interior-03.webp', width: 1600, height: 1200 },
  { src: '/media/viz/still/rad-interior-09.webp', width: 1200, height: 1600 },
  { src: '/media/viz/still/rad-interior-10.webp', width: 1600, height: 1200 },
  { src: '/media/viz/still/cover-pte-tp.webp', width: 1600, height: 900 },
  { src: '/media/viz/still/pte-b-epulet-kozossegi-02.webp', width: 1600, height: 900 },
];

export const vizPanoramas: VizPanorama[] = [
  { src: '/media/viz/panoramic/a204-nappali.webp', poster: '/media/viz/panoramic/a204-nappali-poster.webp' },
  { src: '/media/viz/panoramic/a206-nappali.webp', poster: '/media/viz/panoramic/a206-nappali-poster.webp' },
  { src: '/media/viz/panoramic/a209-nappali.webp', poster: '/media/viz/panoramic/a209-nappali-poster.webp' },
  { src: '/media/viz/panoramic/a307-nappali.webp', poster: '/media/viz/panoramic/a307-nappali-poster.webp' },
  { src: '/media/viz/panoramic/a307-night.webp', poster: '/media/viz/panoramic/a307-night-poster.webp' },
  { src: '/media/viz/panoramic/a405-nappali.webp', poster: '/media/viz/panoramic/a405-nappali-poster.webp' },
  { src: '/media/viz/panoramic/b303-furdo.webp', poster: '/media/viz/panoramic/b303-furdo-poster.webp' },
  { src: '/media/viz/panoramic/b405-furdo.webp', poster: '/media/viz/panoramic/b405-furdo-poster.webp' },
  { src: '/media/viz/panoramic/b406-nappali.webp', poster: '/media/viz/panoramic/b406-nappali-poster.webp' },
  { src: '/media/viz/panoramic/b406-szoba.webp', poster: '/media/viz/panoramic/b406-szoba-poster.webp' },
];

export const vizAnimations: VizAnimation[] = [
  {
    src: '/media/viz/animation/helikon-cover.mp4',
    poster: '/media/viz/animation/helikon-cover.webp',
  },
  {
    src: '/media/viz/animation/rad-exteriors.mp4',
    poster: '/media/viz/animation/rad-exteriors.webp',
  },
];
