/**
 * "04 Grafikai tervezés" — everything under `projects/Grafika`, re-encoded.
 *
 * Plan and Axonometry are the two ARBOR drawing sets, square line drawings at
 * 1400px. Motion Diagram is the two concept animations: they arrive as GIFs —
 * one of them 184 MB — so they are served as H.264, poster first, and play
 * silently on loop.
 */

const MEDIA = '/media/graphics';

export interface GraphicStill {
  src: string;
  width: number;
  height: number;
}

export interface GraphicClip extends GraphicStill {
  poster: string;
}

/** `projects/Grafika/alaprajzok` — the ARBOR floor plans. */
export const graphicPlans: GraphicStill[] = [
  '01-04-10',
  '02',
  '03',
  '05',
  '08',
  '09',
  '16',
  '17',
  '18',
].map((n) => ({ src: `${MEDIA}/plan/arbor-${n}.webp`, width: 1400, height: 1400 }));

/** `projects/Grafika/axonometry` — the same flats, drawn axonometrically. */
export const graphicAxonometries: GraphicStill[] = [
  '01',
  '02',
  '03',
  '05',
  '08',
  '09',
  '16',
  '17',
  '18',
].map((n) => ({ src: `${MEDIA}/axonometry/arbor-${n}.webp`, width: 1400, height: 1400 }));

/** `projects/Grafika/Motion Diagram` — the concept animations. */
export const graphicMotion: GraphicClip[] = [
  {
    src: `${MEDIA}/motion/hertelend.mp4`,
    poster: `${MEDIA}/motion/hertelend.webp`,
    width: 1080,
    height: 1080,
  },
  {
    src: `${MEDIA}/motion/zuglo.mp4`,
    poster: `${MEDIA}/motion/zuglo.webp`,
    width: 1080,
    height: 1010,
  },
];
