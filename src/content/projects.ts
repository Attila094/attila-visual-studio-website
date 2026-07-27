export type Medium = 'photograph' | 'render';

/** Matches the `id` of a service in content/services.ts. */
export type ServiceId = 'epiteszet' | 'vizualizacio' | 'grafika' | 'foto-video';

export interface Project {
  slug: string;
  /** Grid overline, e.g. "01 / Interior" */
  index: string;
  title: string;
  category: string;
  /** Which homepage category row this project belongs to. */
  serviceId: ServiceId;
  location: string;
  year: string;
  medium: Medium;
  summary: string;
  /** Specific, searchable alt text (see skill SEO guidance). */
  alt: string;
  /** Square thumbnail served in the grid. */
  thumbSrc: string;
  /** Full-res asset for the detail hero. */
  heroSrc: string;
  /** Optional explicit gallery; falls back to a generated set (see getGallery). */
  gallery?: string[];
}

/**
 * Placeholder projects. Swap `thumbSrc` / `heroSrc` for real photography and
 * V-Ray / Twinmotion renders — the grid → hero morph keys off `slug`, so no
 * component changes are needed when assets are replaced.
 */
export const projects: Project[] = [
  {
    slug: 'arbor-park',
    index: '01',
    title: 'Arbor Park',
    category: 'Belsőépítészeti vizualizáció',
    serviceId: 'vizualizacio',
    location: 'Budapest, XIII.',
    year: '2025',
    medium: 'render',
    summary:
      'Minimalista nappali vizualizáció padlótól a mennyezetig érő ablakokkal és meleg faburkolattal, Twinmotionben renderelve.',
    alt: 'Minimalista Arbor Park nappali vizualizáció padlótól mennyezetig érő ablakokkal és meleg faburkolattal, Twinmotionben renderelve',
    thumbSrc: '/images/projects/arbor-park.svg',
    heroSrc: '/images/projects/arbor-park.svg',
  },
  {
    slug: 'riverside-loft',
    index: '02',
    title: 'Riverside Loft',
    category: 'Építészeti fotográfia',
    serviceId: 'foto-video',
    location: 'Budapest, IX.',
    year: '2024',
    medium: 'photograph',
    summary:
      'Nyers betonfalak és tölgyfa részletek találkozása egy dunai loftban, természetes reggeli fényben fotózva.',
    alt: 'Riverside Loft nyers betonfalakkal és tölgyfa részletekkel, természetes reggeli fényben fotózva',
    thumbSrc: '/images/projects/riverside-loft.svg',
    heroSrc: '/images/projects/riverside-loft.svg',
  },
  {
    slug: 'glass-house',
    index: '03',
    title: 'Glass House',
    category: 'Építészeti vizualizáció',
    serviceId: 'vizualizacio',
    location: 'Balaton',
    year: '2025',
    medium: 'render',
    summary:
      'Áttetsző, üvegburkolatú hétvégi ház a tóparton, tükröződő felületekkel, V-Ray fizikai fénnyel renderelve.',
    alt: 'Glass House üvegburkolatú tóparti hétvégi ház tükröződő felületekkel, V-Ray fizikai fénnyel renderelve',
    thumbSrc: '/images/projects/glass-house.svg',
    heroSrc: '/images/projects/glass-house.svg',
  },
  {
    slug: 'urban-office',
    index: '04',
    title: 'Urban Office',
    category: 'Belsőépítészet',
    serviceId: 'epiteszet',
    location: 'Budapest, V.',
    year: '2024',
    medium: 'render',
    summary:
      'Nyitott irodai tér akusztikus mennyezettel és zöld térelválasztókkal, hideg és meleg fények egyensúlyában.',
    alt: 'Urban Office nyitott irodai tér akusztikus mennyezettel és zöld térelválasztókkal',
    thumbSrc: '/images/projects/urban-office.svg',
    heroSrc: '/images/projects/urban-office.svg',
  },
  {
    slug: 'lakeside-villa',
    index: '05',
    title: 'Lakeside Villa',
    category: 'Építészeti vizualizáció',
    serviceId: 'vizualizacio',
    location: 'Tihany',
    year: '2025',
    medium: 'render',
    summary:
      'Terméskő és fa homlokzatú villa a domboldalon, alkonyati égbolttal, 3ds Max és V-Ray felhasználásával.',
    alt: 'Lakeside Villa terméskő és fa homlokzattal a domboldalon, alkonyati égbolttal renderelve',
    thumbSrc: '/images/projects/lakeside-villa.svg',
    heroSrc: '/images/projects/lakeside-villa.svg',
  },
  {
    slug: 'concrete-atrium',
    index: '06',
    title: 'Concrete Atrium',
    category: 'Építészeti fotográfia',
    serviceId: 'foto-video',
    location: 'Budapest, VIII.',
    year: '2023',
    medium: 'photograph',
    summary:
      'Monolit betonátrium felülvilágítóval, ahol a fény és árnyék grafikus mintázatot rajzol a falakra.',
    alt: 'Concrete Atrium monolit betonátrium felülvilágítóval, fény és árnyék grafikus mintázatával',
    thumbSrc: '/images/projects/concrete-atrium.svg',
    heroSrc: '/images/projects/concrete-atrium.svg',
  },
  {
    slug: 'minimal-kitchen',
    index: '07',
    title: 'Minimal Kitchen',
    category: 'Belsőépítészeti vizualizáció',
    serviceId: 'epiteszet',
    location: 'Szentendre',
    year: '2024',
    medium: 'render',
    summary:
      'Fogantyú nélküli konyha matt felületekkel és rejtett világítással, semleges anyaghasználattal.',
    alt: 'Minimal Kitchen fogantyú nélküli konyha matt felületekkel és rejtett világítással',
    thumbSrc: '/images/projects/minimal-kitchen.svg',
    heroSrc: '/images/projects/minimal-kitchen.svg',
  },
  {
    slug: 'rooftop-terrace',
    index: '08',
    title: 'Rooftop Terrace',
    category: 'Építészeti fotográfia',
    serviceId: 'foto-video',
    location: 'Budapest, VI.',
    year: '2025',
    medium: 'photograph',
    summary:
      'Tetőterasz a városi látképpel, faburkolatú padlóval és alacsony ültetett zöldfelületekkel, kék órában.',
    alt: 'Rooftop Terrace tetőterasz városi látképpel, faburkolatú padlóval, kék órában fotózva',
    thumbSrc: '/images/projects/rooftop-terrace.svg',
    heroSrc: '/images/projects/rooftop-terrace.svg',
  },
  {
    slug: 'timber-pavilion',
    index: '09',
    title: 'Timber Pavilion',
    category: 'Építészeti vizualizáció',
    serviceId: 'vizualizacio',
    location: 'Sopron',
    year: '2023',
    medium: 'render',
    summary:
      'Rétegelt-ragasztott fa szerkezetű pavilon az erdő szélén, lágy szórt fénnyel és textúrás anyagokkal.',
    alt: 'Timber Pavilion rétegelt-ragasztott fa szerkezetű pavilon az erdő szélén, lágy szórt fénnyel renderelve',
    thumbSrc: '/images/projects/timber-pavilion.svg',
    heroSrc: '/images/projects/timber-pavilion.svg',
  },
  {
    slug: 'loft-atelier',
    index: '10',
    title: 'Loft Atelier',
    category: 'Belsőépítészet',
    serviceId: 'epiteszet',
    location: 'Budapest, VII.',
    year: '2024',
    medium: 'render',
    summary:
      'Galériaszintes műteremlakás nyers acélszerkezettel és világos vakolt falakkal, tág belmagassággal.',
    alt: 'Loft Atelier galériaszintes műteremlakás nyers acélszerkezettel és világos vakolt falakkal',
    thumbSrc: '/images/projects/loft-atelier.svg',
    heroSrc: '/images/projects/loft-atelier.svg',
  },
  {
    slug: 'studio-arculat',
    index: '11',
    title: 'Studio Arculat',
    category: 'Arculattervezés',
    serviceId: 'grafika',
    location: 'Budapest',
    year: '2025',
    medium: 'render',
    summary:
      'Teljes vizuális arculat egy építészstúdiónak: logórendszer, tipográfia és nyomdai sablonok.',
    alt: 'Studio Arculat vizuális arculat logórendszerrel és tipográfiával egy építészstúdiónak',
    thumbSrc: '/images/projects/studio-arculat.svg',
    heroSrc: '/images/projects/studio-arculat.svg',
  },
  {
    slug: 'kiallitas-grafika',
    index: '12',
    title: 'Kiállítás Grafika',
    category: 'Kiállítási grafika',
    serviceId: 'grafika',
    location: 'Budapest',
    year: '2024',
    medium: 'render',
    summary:
      'Egy építészeti kiállítás teljes grafikai rendszere: falgrafika, terelés és katalógus.',
    alt: 'Kiállítás Grafika falgrafikai és terelőrendszer egy építészeti kiállításhoz',
    thumbSrc: '/images/projects/kiallitas-grafika.svg',
    heroSrc: '/images/projects/kiallitas-grafika.svg',
  },
  {
    slug: 'nyomdai-sorozat',
    index: '13',
    title: 'Nyomdai Sorozat',
    category: 'Nyomdai tervezés',
    serviceId: 'grafika',
    location: 'Budapest',
    year: '2023',
    medium: 'render',
    summary:
      'Prémium nyomdai kiadványsorozat egy lakóparki fejlesztéshez, egységes rácsrendszerrel.',
    alt: 'Nyomdai Sorozat prémium kiadványsorozat egységes rácsrendszerrel egy lakóparki fejlesztéshez',
    thumbSrc: '/images/projects/nyomdai-sorozat.svg',
    heroSrc: '/images/projects/nyomdai-sorozat.svg',
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getAllProjectSlugs(): string[] {
  return projects.map((p) => p.slug);
}

export function getProjectsByService(serviceId: ServiceId): Project[] {
  return projects.filter((p) => p.serviceId === serviceId);
}

/**
 * All images for a project's detail gallery. Uses an explicit `gallery` if
 * present; otherwise builds a placeholder set from this project's hero plus a
 * rotating selection of the other placeholders.
 */
export function getGallery(project: Project): string[] {
  if (project.gallery?.length) return project.gallery;
  const others = projects
    .filter((p) => p.slug !== project.slug)
    .map((p) => p.thumbSrc);
  return [project.heroSrc, ...others].slice(0, 6);
}
