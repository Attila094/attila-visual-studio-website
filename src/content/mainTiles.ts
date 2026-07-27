// Local content for the 5 centered service tiles. Populate directly here (or
// swap for JSON/MD/MDX frontmatter with the same shape).

export interface MainTile {
  id: string;
  number: string;
  title: string;
  /** Shown in the expanded "big tile" view. */
  summary: string;
  points: string[];
}

export const mainTiles: MainTile[] = [
  {
    id: 'epiteszet',
    number: '01',
    title: 'Építészet & Belsőépítészet',
    summary:
      'Koncepciótól a kiviteli tervig — lakó-, iroda- és vendéglátóterek, amelyek egyszerre funkcionálisak és karakteresek.',
    points: ['Koncepcióterv', 'Engedélyezési terv', 'Kiviteli terv', 'Belsőépítészeti tervezés'],
  },
  {
    id: 'vizualizacio',
    number: '02',
    title: 'Vizualizáció',
    summary:
      'Fotorealisztikus 3D látványtervek 3ds Max, V-Ray és Twinmotion segítségével — még az első kapavágás előtt.',
    points: ['Külső és belső render', 'Animáció és bejárás', '360°-os panoráma', 'Utómunka'],
  },
  {
    id: 'foto-video',
    number: '03',
    title: 'Fotózás & Videózás',
    summary:
      'Építészeti és belsőépítészeti fotó- és videódokumentáció, amely hűen és igényesen mutatja be az elkészült teret.',
    points: ['Építészeti fotó', 'Rövid videó / reels', 'Drónfelvétel', 'Utómunka'],
  },
  {
    id: 'grafika',
    number: '04',
    title: 'Grafika',
    summary:
      'Arculat, nyomdai és digitális anyagok, amelyek egységes vizuális nyelvet adnak a projektnek és a márkának.',
    points: ['Arculattervezés', 'Nyomdai előkészítés', 'Prezentációs anyagok', 'Digitális grafika'],
  },
  {
    id: 'nyomtatas',
    number: '05',
    title: '3D Nyomtatás',
    summary:
      'Fizikai makettek és prototípusok 3D nyomtatással — a tervekből kézzel fogható modell.',
    points: ['Építészeti makett', 'Prototípus', 'Kis szériás gyártás', 'Utómunka és festés'],
  },
];
