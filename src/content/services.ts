export interface Service {
  id: string;
  index: string;
  title: string;
  /** Placeholder detail copy revealed on hover / expansion. */
  blurb: string;
  bullets: string[];
  /** The four tile-like options shown at the bottom of the enlarged tile. */
  subOptions: string[];
}

export const services: Service[] = [
  {
    id: 'epiteszet',
    index: '01',
    title: 'építészet & belsőépítészet',
    blurb:
      'Koncepciótól a kiviteli tervig: terek, amelyek egyszerre funkcionálisak és karakteresek. Lakóterek, irodák és vendéglátás áttervezése és tervezése.',
    bullets: ['Koncepcióterv', 'Belsőépítészeti tervezés', 'Anyag- és színkoncepció'],
    subOptions: ['Lakótér', 'Iroda', 'Vendéglátás', 'Köztér'],
  },
  {
    id: 'vizualizacio',
    index: '02',
    title: 'vizualizáció',
    blurb:
      'Fotorealisztikus 3D látványtervek 3ds Max, V-Ray és Twinmotion segítségével — még az első kapavágás előtt bemutatjuk a kész teret.',
    bullets: ['Külső és belső render', 'Animáció és bejárás', '360°-os panoráma'],
    subOptions: ['Still', 'Motion Still', 'Panoramic', 'Animated'],
  },
  {
    id: 'grafika',
    index: '03',
    title: 'grafikai tervezés',
    blurb:
      'Arculat, nyomdai és digitális anyagok, amelyek egységes vizuális nyelvet adnak a projektnek és a márkának.',
    bullets: ['Arculattervezés', 'Nyomdai előkészítés', 'Prezentációs anyagok'],
    subOptions: ['Arculat', 'Nyomdai', 'Digitális', 'Prezentáció'],
  },
  {
    id: 'foto-video',
    index: '04',
    title: 'fotózás & videózás',
    blurb:
      'Építészeti és belsőépítészeti fotó- és videódokumentáció, amely hűen és igényesen mutatja be az elkészült teret.',
    bullets: ['Építészeti fotó', 'Rövid videó / reels', 'Drónfelvétel'],
    subOptions: ['Fotó', 'Videó', 'Reels', 'Drón'],
  },
];
