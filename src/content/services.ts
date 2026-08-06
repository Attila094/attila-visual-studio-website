export interface ServiceItem {
  /** Caption under the card. */
  label: string;
  /** Heading inside the opened panel. Falls back to the label. */
  title?: string;
  /** Card artwork. Also the poster frame when `video` is set; without either
   *  the card falls back to a plain plate. */
  image?: string;
  /** Silent clip that plays on hover in place of the still. */
  video?: string;
}

/** Everything under `Thumbnails - services`, re-encoded for the web. */
const MEDIA = '/media/services';

export interface Service {
  id: string;
  /** Category heading above the card row. */
  title: string;
  /** Detail copy shown in the panel once a card is chosen. */
  blurb: string;
  bullets: string[];
  /** The cards in this category — each one opens the detail panel. */
  items: ServiceItem[];
}

/** The four categories of the `servicepage.jpg` layout, in reference order. */
export const services: Service[] = [
  {
    id: 'latvanytervezes',
    title: 'Látványtervezés',
    blurb:
      'Fotorealisztikus 3D látványtervek 3ds Max, V-Ray és Twinmotion segítségével — még az első kapavágás előtt bemutatjuk a kész teret.',
    bullets: ['Külső és belső render', 'Animáció és bejárás', '360°-os panoráma'],
    items: [
      { label: 'Kültéri', title: 'Kültéri látványterv', image: `${MEDIA}/kulteri.webp` },
      { label: 'Drónfotó', title: 'Drónfotó látványterv', image: `${MEDIA}/dronfoto.webp` },
      { label: 'Beltéri', title: 'Beltéri látványterv', image: `${MEDIA}/belteri.webp` },
      { label: 'Panoráma', title: 'Panoráma látványterv', image: `${MEDIA}/panorama.webp` },
      {
        label: 'Animáció',
        title: 'Animált látványterv',
        image: `${MEDIA}/animacio.webp`,
        video: `${MEDIA}/animacio.mp4`,
      },
    ],
  },
  {
    id: 'epiteszeti-tervezes',
    title: 'Építészeti tervezés',
    blurb:
      'Koncepciótól a kiviteli tervig: lakó- és középületek, valamint köztéri terek tervezése, bővítése és felújítása.',
    bullets: ['Koncepcióterv', 'Engedélyezési és kiviteli terv', 'Tervezői művezetés'],
    items: [
      { label: 'Lakóépület tervezés', image: `${MEDIA}/lakoepulet-tervezes.webp` },
      { label: 'Lakóépület bővítés', image: `${MEDIA}/lakoepulet-bovites.webp` },
      // No thumbnail supplied for this one yet — the card stays a plain plate.
      { label: 'Lakóépület felújítás' },
      { label: 'Középület tervezés', image: `${MEDIA}/kozepulet-tervezes.webp` },
      { label: 'Köztér tervezés', image: `${MEDIA}/kozter-tervezes.webp` },
    ],
  },
  {
    id: 'belsoepiteszet',
    title: 'Belsőépítészet',
    blurb:
      'Terek, amelyek egyszerre funkcionálisak és karakteresek — lakóterek, irodák és vendéglátóhelyek belsőépítészeti tervezése.',
    bullets: ['Belsőépítészeti tervezés', 'Anyag- és színkoncepció', 'Egyedi bútorterv'],
    items: [
      { label: 'Belsőépítészeti tervezés' },
      { label: 'Belsőépítészeti átalakítás', image: `${MEDIA}/belsoepiteszeti-atalakitas.webp` },
      { label: 'Bútortervezés' },
    ],
  },
  {
    id: 'foto-video',
    title: 'Fotó- és videográfia',
    blurb:
      'Építészeti és belsőépítészeti fotó- és videódokumentáció, amely hűen és igényesen mutatja be az elkészült teret.',
    bullets: ['Építészeti fotó', 'Rövid videó / reels', 'Drónfelvétel'],
    items: [
      { label: 'Építészeti fotózás', image: `${MEDIA}/epiteszeti-fotozas.webp` },
      {
        label: 'Építészeti videózás',
        image: `${MEDIA}/epiteszeti-videozas.webp`,
        video: `${MEDIA}/epiteszeti-videozas.mp4`,
      },
      { label: 'Drón fotózás', image: `${MEDIA}/dron-fotozas.webp` },
      {
        label: 'Drón videózás',
        image: `${MEDIA}/dron-videozas.webp`,
        video: `${MEDIA}/dron-videozas.mp4`,
      },
    ],
  },
];
