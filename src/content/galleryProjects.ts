// Local content for the projects gallery AND the project detail pages — the
// bento tiles on the homepage and the /projects/[slug] routes they morph into
// are driven by this single list. Images are served from /public/projects/.
// Replace the placeholder .svg paths with real .jpg/.webp files (keeping the
// array order preserves the bento layout).

export type Category = 'exterior' | 'interior' | 'product';
export type Medium = 'photograph' | 'render';

export interface GalleryItem {
  /** Unique route + shared-element key: /projects/<slug>. */
  slug: string;
  src: string;
  /** Short caption shown on the tile. */
  label: string;
  sublabel?: string;
  category: Category;
  /** Specific, searchable alt text (see skill SEO guidance). */
  alt: string;
  // --- detail-page fields (reference layout: helyszín / tervező / év) ---
  title: string;
  location: string;
  designer: string;
  year: string;
  medium: Medium;
  description: string;
}

// Order matters — the bento layout in ProjectsGallery maps these by index:
// [0] hero (full width) · [1,2] 50/50 · [3,4,5] 3-up · [6,7] ~62/38
export const galleryProjects: GalleryItem[] = [
  {
    slug: 'hotel-helikon',
    src: '/projects/hotel-helikon.webp',
    label: 'Hotel — Helikon',
    sublabel: 'csm architect · Keszthely',
    category: 'exterior',
    alt: 'Hotel Helikon látványterv a tóparton, borús égbolttal és tükröződő vízfelülettel',
    title: 'Helikon Hotel',
    location: 'Keszthely',
    designer: 'WHB',
    year: '2021',
    medium: 'render',
    description:
      'A Balaton partján fekvő Helikon Hotel újragondolt tömege a tóra nyíló panorámára épül. A látványterv a borús, párás hangulatot és a víz tükröződését használja fő kompozíciós eszközként, hogy a horizontális épület nyugodtan simuljon a tájba.',
  },
  {
    slug: 'helikon-ice',
    src: '/projects/helikon-ice.webp',
    label: 'Helikon',
    category: 'exterior',
    alt: 'Helikon hotel télen, befagyott tó és alkonyati égbolt előtt',
    title: 'Helikon — Tél',
    location: 'Keszthely',
    designer: 'WHB',
    year: '2021',
    medium: 'render',
    description:
      'A téli nézet a befagyott tófelület és az alkonyati égbolt kontrasztjára épít, a hotel horizontális tömegét grafikus sziluettként jelenítve meg a hideg, kék órában.',
  },
  {
    slug: 'rad-kitchen',
    src: '/projects/rad-kitchen.svg',
    label: 'Rád',
    category: 'interior',
    alt: 'Rád belsőépítészeti látványterv: fa burkolatú konyha bárszékekkel',
    title: 'Rád — Konyha',
    location: 'Rád',
    designer: 'CSM Architect',
    year: '2022',
    medium: 'render',
    description:
      'A rádi családi ház konyhája meleg faburkolattal és bárpulttal kapcsolódik az étkezőhöz. A belsőépítészeti terv a természetes anyagok és a rejtett világítás egyensúlyára törekszik.',
  },
  {
    slug: 'helikon-bw',
    src: '/projects/helikon-bw.svg',
    label: 'Helikon',
    category: 'exterior',
    alt: 'Helikon épület fekete-fehér homlokzati fotó',
    title: 'Helikon — Homlokzat',
    location: 'Keszthely',
    designer: 'WHB',
    year: '2021',
    medium: 'render',
    description:
      'A fekete-fehér homlokzati tanulmány a raszter és az arányrendszer olvashatóságát vizsgálja, a színektől függetlenül, tisztán a tömeg és a nyílásrend ritmusára koncentrálva.',
  },
  {
    slug: 'helikon-pond',
    src: '/projects/helikon-pond.svg',
    label: 'Helikon',
    category: 'exterior',
    alt: 'Helikon épületegyüttes látványterv tóval és fákkal, borús időben',
    title: 'Helikon — Tópart',
    location: 'Keszthely',
    designer: 'WHB',
    year: '2021',
    medium: 'render',
    description:
      'Az épületegyüttes a tópart felől, a vízparti sétány és a fasor takarásában. A látványterv a lágy, szórt fényben mutatja meg a tömegek ritmusát és a vízhez való kapcsolódást.',
  },
  {
    slug: 'rad-house',
    src: '/projects/rad-house.svg',
    label: 'Rád',
    category: 'exterior',
    alt: 'Rád nyeregtetős modern családi ház látványterv zöld környezetben',
    title: 'Rád — Családi ház',
    location: 'Rád',
    designer: 'CSM Architect',
    year: '2022',
    medium: 'render',
    description:
      'Nyeregtetős, kortárs családi ház a zöld környezetbe simulva. A terv a hagyományos tömeg és a modern nyílászárók visszafogott, arányos találkozására épít.',
  },
  {
    slug: 'rad-dining',
    src: '/projects/rad-dining.svg',
    label: 'Rád',
    category: 'interior',
    alt: 'Rád belsőépítészeti látványterv: étkező fa burkolattal és nagy ablakokkal',
    title: 'Rád — Étkező',
    location: 'Rád',
    designer: 'CSM Architect',
    year: '2022',
    medium: 'render',
    description:
      'Az étkező nagy üvegfelületeken át kapcsolódik a kerthez; a faburkolat és a semleges textilek nyugodt hátteret adnak a közös tereknek.',
  },
  {
    slug: 'rad-dark',
    src: '/projects/rad-dark.svg',
    label: 'Rád',
    category: 'interior',
    alt: 'Rád sötét tónusú étkező belsőépítészeti látványterv',
    title: 'Rád — Belső',
    location: 'Rád',
    designer: 'CSM Architect',
    year: '2022',
    medium: 'render',
    description:
      'A sötét tónusú belső tér a meleg mesterséges világítással intim, esti hangulatot teremt, kiemelve az anyagok textúráját és a felületek mélységét.',
  },
];

export function getGalleryProjectBySlug(slug: string): GalleryItem | undefined {
  return galleryProjects.find((p) => p.slug === slug);
}

export function getAllGallerySlugs(): string[] {
  return galleryProjects.map((p) => p.slug);
}

/**
 * Images for a project's detail page: the project's own image first, then a
 * rotating selection of the others as secondary/feature shots.
 */
export function getProjectGallery(project: GalleryItem): string[] {
  const others = galleryProjects.filter((p) => p.slug !== project.slug).map((p) => p.src);
  return [project.src, ...others];
}
