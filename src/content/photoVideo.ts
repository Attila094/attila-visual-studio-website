/**
 * The photography and film shown under "Fotózás & Videózás" on the home page.
 *
 * Everything under `projects/Fotó és video`, re-encoded for the web: the stills
 * as WebP with a 1600px long edge (next/image derives the tile sizes from the
 * dimensions recorded here), the film as 1080p H.264 with a WebP poster.
 *
 * Both orientations are in here — roughly four portraits to every landscape —
 * which is why the gallery lays them out in columns and lets each keep its own
 * shape rather than cropping them all to one aspect.
 */
export interface PhotoItem {
  src: string;
  width: number;
  height: number;
}

export interface VideoItem {
  src: string;
  /** Held in the frame until playback starts; the file itself is not fetched
   *  until the visitor asks for it. */
  poster: string;
  width: number;
  height: number;
}

/** A shoot, as its own folder in the source. Named for the alt text and the
 *  caption above each set. */
export interface PhotoSet {
  title: string;
  photos: PhotoItem[];
  videos: VideoItem[];
}

export const photoSets: PhotoSet[] = [
  {
    title: 'Pécs – Buday',
    photos: [
      { src: '/media/photo/pecs-buday/04.webp', width: 1600, height: 1067 },
      { src: '/media/photo/pecs-buday/05.webp', width: 1067, height: 1600 },
      { src: '/media/photo/pecs-buday/06.webp', width: 1067, height: 1600 },
      { src: '/media/photo/pecs-buday/07.webp', width: 1067, height: 1600 },
      { src: '/media/photo/pecs-buday/08.webp', width: 1067, height: 1600 },
      { src: '/media/photo/pecs-buday/09.webp', width: 1067, height: 1600 },
      { src: '/media/photo/pecs-buday/10-1.webp', width: 1067, height: 1600 },
      { src: '/media/photo/pecs-buday/11.webp', width: 1067, height: 1600 },
      { src: '/media/photo/pecs-buday/15.webp', width: 1067, height: 1600 },
      { src: '/media/photo/pecs-buday/17-2.webp', width: 1067, height: 1600 },
      { src: '/media/photo/pecs-buday/18.webp', width: 1600, height: 1067 },
      { src: '/media/photo/pecs-buday/22.webp', width: 1067, height: 1600 },
      { src: '/media/photo/pecs-buday/26.webp', width: 1067, height: 1600 },
      { src: '/media/photo/pecs-buday/28.webp', width: 1067, height: 1600 },
      { src: '/media/photo/pecs-buday/34.webp', width: 1600, height: 1067 },
      { src: '/media/photo/pecs-buday/37.webp', width: 1067, height: 1600 },
      { src: '/media/photo/pecs-buday/38.webp', width: 1067, height: 1600 },
      { src: '/media/photo/pecs-buday/41.webp', width: 1600, height: 1067 },
    ],
    videos: [
      {
        src: '/media/video/pecs-buday.mp4',
        poster: '/media/video/pecs-buday.webp',
        width: 1920,
        height: 1080,
      },
    ],
  },
  {
    title: 'Villány – Bayer',
    photos: [
      { src: '/media/photo/villany-bayer/sauska-exterior-000.webp', width: 1600, height: 1200 },
      { src: '/media/photo/villany-bayer/sauska-exterior-005.webp', width: 1600, height: 1200 },
      { src: '/media/photo/villany-bayer/sauska-exterior-006.webp', width: 1067, height: 1600 },
      { src: '/media/photo/villany-bayer/sauska-exterior-010.webp', width: 1067, height: 1600 },
      { src: '/media/photo/villany-bayer/sauska-exterior-011.webp', width: 1067, height: 1600 },
      { src: '/media/photo/villany-bayer/sauska-exterior-014.webp', width: 1600, height: 1600 },
      { src: '/media/photo/villany-bayer/sauska-ext-detail-01.webp', width: 1067, height: 1600 },
      { src: '/media/photo/villany-bayer/sauska-ext-detail-07.webp', width: 1200, height: 1600 },
      { src: '/media/photo/villany-bayer/sauska-ext-detail-08.webp', width: 1067, height: 1600 },
      { src: '/media/photo/villany-bayer/sauska-ext-detail-09.webp', width: 1067, height: 1600 },
      { src: '/media/photo/villany-bayer/sauska-interior-02.webp', width: 1600, height: 1067 },
      { src: '/media/photo/villany-bayer/sauska-interior-04.webp', width: 1067, height: 1600 },
      { src: '/media/photo/villany-bayer/sauska-interior-05-2.webp', width: 1067, height: 1600 },
      { src: '/media/photo/villany-bayer/sauska-interior-06.webp', width: 1067, height: 1600 },
      { src: '/media/photo/villany-bayer/sauska-interior-07.webp', width: 1067, height: 1600 },
      { src: '/media/photo/villany-bayer/sauska-interior-08.webp', width: 1067, height: 1600 },
      { src: '/media/photo/villany-bayer/sauska-interior-11.webp', width: 1067, height: 1600 },
      { src: '/media/photo/villany-bayer/sauska-interior-detail-01.webp', width: 1067, height: 1600 },
      { src: '/media/photo/villany-bayer/sauska-interior-detail-02.webp', width: 1067, height: 1600 },
      { src: '/media/photo/villany-bayer/sauska-interior-dining.webp', width: 1600, height: 1067 },
      { src: '/media/photo/villany-bayer/sauska-interior-dinner-01.webp', width: 1067, height: 1600 },
      { src: '/media/photo/villany-bayer/sauska-interior-dinner-04.webp', width: 1067, height: 1600 },
    ],
    videos: [],
  },
];

/** Every still, flattened, each carrying the shoot it belongs to. */
export const allPhotos = photoSets.flatMap((set) =>
  set.photos.map((photo) => ({ ...photo, set: set.title })),
);

/** Every film, likewise. */
export const allVideos = photoSets.flatMap((set) =>
  set.videos.map((video) => ({ ...video, set: set.title })),
);
