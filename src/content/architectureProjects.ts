/**
 * The projects behind "01 Építészet & belsőépítészet" — the two lists in
 * <ProjectsGallery>'s architect layout — and the content of the detail page
 * each of them opens.
 *
 * Kept apart from `galleryProjects` on purpose. That list drives the bento
 * gallery and the older `/projects/<slug>` pages, and its shape is one project
 * = one image. These are whole projects presented over six numbered sections,
 * which is a different thing to describe.
 *
 * WHAT IS REAL HERE, AND WHAT IS NOT. Every name, section and cover shot is
 * taken from the menu as it already stands. The metadata and the prose are NOT
 * invented: a project whose designer, year or description nobody has written
 * down carries `undefined`, and the page says so plainly rather than showing a
 * plausible-looking guess. Fill the blanks in here and the pages follow.
 */

/** Which of the two lists a project belongs to. */
export type ArchSection = 'epiteszet' | 'belsoepiteszet';

/**
 * The six numbered sections every project page is laid out in, in order. They
 * are fixed rather than per-project: the template draws the same six headings
 * down the first column whatever the project has to put in them, which is what
 * makes one page recognisable as the same thing as the next.
 */
export const ARCH_SECTIONS = [
  'leiras',
  'helyszin',
  'beepites',
  'tomegformalas',
  'rajzok',
  'latvanyok',
] as const;

export type ArchSectionId = (typeof ARCH_SECTIONS)[number];

/** What each one is called on the page and in the jump strip above it. */
export const ARCH_SECTION_LABELS: Record<ArchSectionId, string> = {
  leiras: 'Leírás',
  helyszin: 'Helyszín',
  beepites: 'Beépítés',
  tomegformalas: 'Tömegformálás',
  rajzok: 'Rajzok',
  latvanyok: 'Látványok',
};

/** One titled paragraph inside a section — "Település", "Beépítési koncepció". */
export interface ArchNote {
  heading?: string;
  body: string;
}

/**
 * A line animation drawn out by the scroll, in place of a section's plate.
 *
 * Held as numbered still frames rather than as the video they came from: a
 * video element can be seeked but not scrubbed smoothly backwards, and the
 * point of these is that the drawing follows the scroll in both directions.
 * The frames are keyed to transparency, so what sits on the page is the line
 * itself over the page's own black rather than a white rectangle.
 *
 * `width`/`height` are the frames' own pixel size — the canvas is drawn at it,
 * and the box reserves its ratio before a single frame has loaded.
 */
export interface ArchSequence {
  /** Folder under /public. A frame is <dir>/01.webp, two digits, from 01. */
  dir: string;
  frames: number;
  width: number;
  height: number;
  alt: string;
}

/**
 * One still, with the size it was rendered at.
 *
 * The dimensions are carried rather than looked up because the band sets each
 * picture at its OWN proportions — an upright render of a room stays upright
 * instead of being cropped square to match its neighbours — and because a box
 * of the right shape can be reserved before the file has arrived, so the row
 * does not shuffle as it loads.
 */
export interface ArchImage {
  src: string;
  width: number;
  height: number;
  alt: string;
}

/**
 * A project's cover, with the size the file actually is.
 *
 * The menu crops it to a narrow 3:5 portrait tile and the project page runs it
 * full width. In the tile the picture is scaled to the box's HEIGHT and then
 * cropped at the sides, so the width the browser has to paint is the tile's
 * height times the cover's own ratio — which for a panorama is several times
 * the tile's width. A `sizes` attribute cannot say that without knowing the
 * shape of the file, which is why the numbers travel with it.
 *
 * What it shows is the project's own `alt`: one picture, one description.
 */
export interface ArchCover {
  src: string;
  width: number;
  height: number;
}

/**
 * A film that stands in for the cover at the top of a project page.
 *
 * `poster` is its own first frame, not the cover shot: it is what the hero
 * shows until the first bytes of video arrive, and a still from somewhere
 * else would cut to something different the moment it started.
 */
export interface ArchVideo {
  src: string;
  poster: string;
  width: number;
  height: number;
}

export interface ArchProject {
  /** Unique route: /projects/architecture/<slug>. Carries the section, because
   *  Rád and Újpest each appear in BOTH lists and a bare name would collide. */
  slug: string;
  section: ArchSection;
  /** As the menu lists it. */
  name: string;
  /** The page's own title, over the hero. */
  title: string;
  location: string;
  /** Unknown for most of these; the page prints an em dash rather than a guess. */
  designer?: string;
  year?: string;
  /** The cover shot the menu already uses. Doubles as the hero. */
  cover?: ArchCover;
  /** A film for the hero, where there is one. The cover stays: it is still
   *  what the menu tile shows, and still the poster's understudy. */
  video?: ArchVideo;
  alt: string;
  /** 01 Leírás. Absent until somebody writes it. */
  description?: string;
  /** Prose inside a section, beyond the description. */
  /**
   * A section's note columns, in the order that section lays them out: 02 has
   * just "Település" out in the fifth column, 04 has its two middle columns,
   * and so on. A slot nobody has written yet is left `undefined` and the page
   * prints the template's heading over a `hamarosan`, so a project can fill a
   * later column without having to invent the ones before it.
   */
  notes?: Partial<Record<ArchSectionId, (ArchNote | undefined)[]>>;
  /** Stills for a section's plates, and for the strip under the hero. Where a
   *  section has none, the template draws the placeholder the design calls for. */
  media?: Partial<Record<ArchSectionId, string[]>>;
  /** A scrubbed line animation for a section, in place of its plate. */
  sequences?: Partial<Record<ArchSectionId, ArchSequence>>;
  /** The band under the hero. Empty until a project's stills are in. */
  strip?: ArchImage[];
}

const ARCH = '/media/architecture';

/**
 * A cover, at the resolution it is kept at: re-encoded from the project
 * folder's own cover file, capped at 2400 on the long edge, and otherwise
 * framed exactly as it was.
 */
const coverOf = (file: string, width: number, height: number): ArchCover => ({
  src: `${ARCH}/${file}.webp`,
  width,
  height,
});

/**
 * A still from the Rád house, named after the file it came from so that a
 * picture on the page can always be traced back to the render it was made
 * from. Every one of them is the original render's own resolution, re-encoded
 * to WebP — what reaches a visitor is whatever size Next's optimiser decides
 * the band needs, which is a fraction of it.
 */
const radStill = (file: string, width: number, height: number, alt: string): ArchImage => ({
  src: `${ARCH}/epiteszet/rad/${file}.webp`,
  width,
  height,
  alt,
});

/**
 * "Építészet", in the order the menu lists it.
 *
 * `Projected` is deliberately absent: it is the open slot at the end of the row
 * that leads to the contact form, not a project, and giving it a page would
 * invent a sixth building.
 */
const EPITESZET: ArchProject[] = [
  {
    slug: 'epiteszet-rad',
    section: 'epiteszet',
    name: 'Rád',
    title: 'Rád — Családi ház',
    location: 'Rád',
    designer: 'The Line Studio',
    year: '2026',
    cover: coverOf('epiteszet/rad', 1600, 1600),
    // "RAD - exterior.mov" from the project folder. The picture in it is a
    // 1080 square padded out to 16:9 with black; the padding is cropped away
    // here, so what the page holds is the picture and nothing else.
    video: {
      src: `${ARCH}/epiteszet/rad-exterior.mp4`,
      poster: `${ARCH}/epiteszet/rad-exterior-poster.webp`,
      width: 1080,
      height: 1080,
    },
    alt: 'Rád nyeregtetős modern családi ház látványterv zöld környezetben',
    description:
      'Nyeregtetős, kortárs családi ház a zöld környezetbe simulva. A terv a hagyományos tömeg és a modern nyílászárók visszafogott, arányos találkozására épít.',
    // "Rad - line.mov" from the project folder: Hungary drawn in outline, with
    // the pin dropping on Rád. 90 frames, keyed white-on-nothing.
    notes: {
      // 02's one note column: "Település", out in the fifth beside the map.
      helyszin: [
        {
          body:
            'Rád egy nyugodt, közel kétezer fős község Pest vármegyében, a Váci járásban, a Cserhát és a Gödöllői-dombság találkozásánál, Váctól alig néhány kilométerre. Az Árpád-kor óta lakott település legismertebb látnivalói közé tartozik a 18. századi barokk római katolikus templom és a késő barokk-copf stílusú Muslay-kúria, amelyeket lankás, erdős és kirándulásra is alkalmas dombvidéki környezet vesz körül. Falusias hangulata és a fővároshoz való közelsége miatt ma is kedvelt, csendes lakó- és pihenőhely.',
        },
      ],
    },
    sequences: {
      helyszin: {
        dir: `${ARCH}/epiteszet/rad-line`,
        frames: 90,
        width: 1500,
        height: 1036,
        alt: 'Magyarország körvonala, rajta Rád elhelyezkedése',
      },
      beepites: {
        dir: `${ARCH}/epiteszet/rad-site`,
        frames: 121,
        width: 1504,
        height: 1504,
        alt: 'A telepítési terv kigurul, és a makett házai, fái és a tereplépcső kiemelkednek belőle',
      },
    },
    // The project folder's own renders, outside first and then through the
    // house, which is the order anybody walks it in.
    strip: [
      radStill('exterior-000', 3000, 2250, 'A kivilágított üvegezett oromfal alkonyatkor, lombtalan fák mögött'),
      radStill('exterior-001-1', 3000, 3000, 'A sötét faburkolatú ház a kert felől, a szomszédos házak előtt'),
      radStill('exterior-001-2', 3000, 3000, 'A ház oldalnézete a magas fűvel benőtt kert felől'),
      radStill('shot-03', 2250, 3000, 'Az üvegezett oromfal alulról, a kerti kerítés mögül'),
      radStill('exterior-006', 2000, 2000, 'A faburkolatos homlokzat és a bejáratig vezető lépcsős járda'),
      radStill('exterior-013', 2000, 2000, 'A ház hosszanti homlokzata a lejtős rét felől'),
      radStill('exterior-007', 2000, 2000, 'A ház borús téli alkonyatban, csupasz fák között'),
      radStill('interior-01', 2560, 1920, 'Étkező a konyha felé nézve, lineáris függesztett lámpatesttel'),
      radStill('interior-00', 1920, 2560, 'Az étkező a sötét burkolatú átjáróból nézve'),
      radStill('interior-03', 2560, 1920, 'Konyhasziget bárszékekkel és kör alakú páraelszívóval'),
      radStill('interior-02', 1920, 2560, 'A konyhapult és a bárszékek a nappali felől'),
      radStill('interior-04', 1500, 1500, 'Nappali a függesztett kandallóval és a terasz üvegfalával'),
      radStill('interior-07', 2000, 2000, 'A nappali égő kandallóval, fa mennyezet alatt'),
      radStill('interior-08', 2000, 2000, 'A nappali ülőgarnitúrája a kandalló körül'),
      radStill('interior-06', 1000, 1000, 'Pihenősarok a függönyös ablaknál, pihenőfotellel'),
      radStill('interior-05', 2250, 3000, 'Esti fény a nappali olvasósarkában'),
    ],
  },
  {
    slug: 'epiteszet-szuglo',
    section: 'epiteszet',
    name: 'Szugló',
    title: 'Szugló',
    location: 'Budapest',
    cover: coverOf('epiteszet/szuglo', 2400, 2400),
    alt: 'Szugló építészeti látványterv',
  },
  {
    slug: 'epiteszet-hertelend',
    section: 'epiteszet',
    name: 'Hertelend',
    title: 'Hertelend',
    location: 'Hertelend',
    cover: coverOf('epiteszet/hertelend', 2400, 1099),
    alt: 'Hertelend építészeti látványterv',
  },
  {
    slug: 'epiteszet-ujpest',
    section: 'epiteszet',
    name: 'Újpest',
    title: 'Újpest',
    location: 'Budapest — Újpest',
    alt: 'Újpest építészeti projekt',
  },
  {
    slug: 'epiteszet-budapest-hosszuret',
    section: 'epiteszet',
    name: 'Budapest - Hosszúrét',
    title: 'Budapest — Hosszúrét',
    location: 'Budapest — Hosszúrét',
    cover: coverOf('epiteszet/budapest-hosszuret', 2400, 1484),
    alt: 'Budapest, hosszúréti építészeti látványterv',
  },
];

/** "Belsőépítészet", in the order the menu lists it. */
const BELSOEPITESZET: ArchProject[] = [
  {
    slug: 'belsoepiteszet-pecs-rokus',
    section: 'belsoepiteszet',
    name: 'Pécs - Rókus',
    title: 'Pécs — Rókus',
    location: 'Pécs',
    cover: coverOf('belsoepiteszet/pecs-rokus', 1600, 2400),
    alt: 'Pécs, Rókus belsőépítészeti látványterv',
  },
  {
    slug: 'belsoepiteszet-rad',
    section: 'belsoepiteszet',
    name: 'Rád',
    title: 'Rád — Konyha',
    location: 'Rád',
    designer: 'The Line Studio',
    year: '2026',
    cover: coverOf('belsoepiteszet/rad', 1200, 1600),
    alt: 'Rád belsőépítészeti látványterv: fa burkolatú konyha bárszékekkel',
    description:
      'Meleg tónusú faburkolat és visszafogott kőfelületek: a konyha a ház közös terének folytatása, nem külön helyiség. A bárszékes pult a napi használat és a vendéglátás közötti átmenetet oldja fel.',
  },
  {
    slug: 'belsoepiteszet-heviz',
    section: 'belsoepiteszet',
    name: 'Hévíz',
    title: 'Hévíz',
    location: 'Hévíz',
    cover: coverOf('belsoepiteszet/heviz', 1600, 1600),
    alt: 'Hévízi belsőépítészeti látványterv',
  },
  {
    slug: 'belsoepiteszet-budapest-pinty',
    section: 'belsoepiteszet',
    name: 'Budapest - Pinty',
    title: 'Budapest — Pinty',
    location: 'Budapest',
    cover: coverOf('belsoepiteszet/budapest-pinty', 2400, 2400),
    alt: 'Budapest, Pinty utcai belsőépítészeti látványterv',
  },
  {
    slug: 'belsoepiteszet-pecs-petrus',
    section: 'belsoepiteszet',
    name: 'Pécs - Petrus',
    title: 'Pécs — Petrus',
    location: 'Pécs',
    cover: coverOf('belsoepiteszet/pecs-petrus', 640, 915),
    alt: 'Pécs, Petrus belsőépítészeti látványterv',
  },
  {
    slug: 'belsoepiteszet-ujpest',
    section: 'belsoepiteszet',
    name: 'Újpest',
    title: 'Újpest',
    location: 'Budapest — Újpest',
    alt: 'Újpest belsőépítészeti projekt',
  },
  {
    slug: 'belsoepiteszet-godollo',
    section: 'belsoepiteszet',
    name: 'Gödöllő',
    title: 'Gödöllő',
    location: 'Gödöllő',
    cover: coverOf('belsoepiteszet/godollo', 2000, 2000),
    alt: 'Gödöllői belsőépítészeti látványterv',
  },
];

/** Both lists, flat — what the route's `generateStaticParams` builds from. */
export const architectureProjects: ArchProject[] = [...EPITESZET, ...BELSOEPITESZET];

export function getArchProjectsBySection(section: ArchSection): ArchProject[] {
  return architectureProjects.filter((p) => p.section === section);
}

export function getArchProjectBySlug(slug: string): ArchProject | undefined {
  return architectureProjects.find((p) => p.slug === slug);
}

export function getAllArchSlugs(): string[] {
  return architectureProjects.map((p) => p.slug);
}

/** The route a menu entry points at. One place, so the list and the tiles
 *  beside it can never disagree about where a project lives. */
export function archProjectHref(slug: string): string {
  return `/projects/architecture/${slug}`;
}
