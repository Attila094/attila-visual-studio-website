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
  cover?: string;
  alt: string;
  /** 01 Leírás. Absent until somebody writes it. */
  description?: string;
  /** Prose inside a section, beyond the description. */
  notes?: Partial<Record<ArchSectionId, ArchNote[]>>;
  /** Stills for a section's plates, and for the strip under the hero. Where a
   *  section has none, the template draws the placeholder the design calls for. */
  media?: Partial<Record<ArchSectionId, string[]>>;
  /** A scrubbed line animation for a section, in place of its plate. */
  sequences?: Partial<Record<ArchSectionId, ArchSequence>>;
  strip?: string[];
}

const ARCH = '/media/architecture';

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
    designer: 'CSM Architect',
    year: '2022',
    cover: `${ARCH}/epiteszet/rad.webp`,
    alt: 'Rád nyeregtetős modern családi ház látványterv zöld környezetben',
    description:
      'Nyeregtetős, kortárs családi ház a zöld környezetbe simulva. A terv a hagyományos tömeg és a modern nyílászárók visszafogott, arányos találkozására épít.',
    // "Rad - line.mov" from the project folder: Hungary drawn in outline, with
    // the pin dropping on Rád. 90 frames, keyed white-on-nothing.
    sequences: {
      helyszin: {
        dir: `${ARCH}/epiteszet/rad-line`,
        frames: 90,
        width: 1500,
        height: 1036,
        alt: 'Magyarország körvonala, rajta Rád elhelyezkedése',
      },
    },
  },
  {
    slug: 'epiteszet-szuglo',
    section: 'epiteszet',
    name: 'Szugló',
    title: 'Szugló',
    location: 'Budapest',
    cover: `${ARCH}/epiteszet/szuglo.webp`,
    alt: 'Szugló építészeti látványterv',
  },
  {
    slug: 'epiteszet-hertelend',
    section: 'epiteszet',
    name: 'Hertelend',
    title: 'Hertelend',
    location: 'Hertelend',
    cover: `${ARCH}/epiteszet/hertelend.webp`,
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
    cover: `${ARCH}/epiteszet/budapest-hosszuret.webp`,
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
    cover: `${ARCH}/belsoepiteszet/pecs-rokus.webp`,
    alt: 'Pécs, Rókus belsőépítészeti látványterv',
  },
  {
    slug: 'belsoepiteszet-rad',
    section: 'belsoepiteszet',
    name: 'Rád',
    title: 'Rád — Konyha',
    location: 'Rád',
    designer: 'CSM Architect',
    year: '2022',
    cover: `${ARCH}/belsoepiteszet/rad.webp`,
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
    cover: `${ARCH}/belsoepiteszet/heviz.webp`,
    alt: 'Hévízi belsőépítészeti látványterv',
  },
  {
    slug: 'belsoepiteszet-budapest-pinty',
    section: 'belsoepiteszet',
    name: 'Budapest - Pinty',
    title: 'Budapest — Pinty',
    location: 'Budapest',
    cover: `${ARCH}/belsoepiteszet/budapest-pinty.webp`,
    alt: 'Budapest, Pinty utcai belsőépítészeti látványterv',
  },
  {
    slug: 'belsoepiteszet-pecs-petrus',
    section: 'belsoepiteszet',
    name: 'Pécs - Petrus',
    title: 'Pécs — Petrus',
    location: 'Pécs',
    cover: `${ARCH}/belsoepiteszet/pecs-petrus.webp`,
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
    cover: `${ARCH}/belsoepiteszet/godollo.webp`,
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
