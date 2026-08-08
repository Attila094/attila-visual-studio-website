// Local content for the 5 centered service tiles. Populate directly here (or
// swap for JSON/MD/MDX frontmatter with the same shape).
//
// Order is significant: tile i is the landing place of `heroSequenceImages[i]`,
// so the two lists have to be reordered together. The ids are what pick a
// gallery layout in <ProjectsGallery>, so they stay attached to their content
// however the row is ordered.

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
    id: 'vizualizacio',
    number: '01',
    title: 'Építészeti vizualizáció',
    summary:
      'Fotorealisztikus 3D látványtervek 3ds Max, V-Ray és Twinmotion segítségével — még az első kapavágás előtt.',
    points: ['Külső és belső render', 'Animáció és bejárás', '360°-os panoráma', 'Utómunka'],
  },
  {
    id: 'epiteszet',
    number: '02',
    title: 'Építészet & Belsőépítészet',
    summary:
      'Koncepciótól a kiviteli tervig — lakó-, iroda- és vendéglátóterek, amelyek egyszerre funkcionálisak és karakteresek.',
    points: ['Koncepcióterv', 'Engedélyezési terv', 'Kiviteli terv', 'Belsőépítészeti tervezés'],
  },
  {
    id: 'foto-video',
    number: '03',
    title: 'Fotó és Videógráfia',
    summary:
      'Építészeti és belsőépítészeti fotó- és videódokumentáció, amely hűen és igényesen mutatja be az elkészült teret.',
    points: ['Építészeti fotó', 'Rövid videó / reels', 'Drónfelvétel', 'Utómunka'],
  },
  {
    id: 'grafika',
    number: '04',
    title: 'Grafikai tervezés',
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
