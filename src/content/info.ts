/**
 * The INFO page — the studio's project workflow, phase by phase.
 *
 * Transcribed from the `infopage.jpg` layout reference: the INFO title over
 * three service plates, then one dark panel holding the five phases. Each
 * phase is a heading and a run of blocks: copy under an uppercase lead-in, or
 * a row of labelled plates.
 */

/** The three tracks named across the top of the reference. The newline is the
 *  break it draws — at this plate width the line would otherwise just fit. */
export const infoTracks = ['Látvány\ntervezés', 'Építészet', 'Fotózás'];

/** Copy under an uppercase lead-in. `href` turns the paragraphs into a link. */
export interface InfoTextBlock {
  kind: 'text';
  heading?: string;
  paragraphs: string[];
  href?: string;
}

/**
 * A row of labelled plates. `sm` is the five-across strip of deliverables under
 * ADATSZOLGÁLTATÁS; `lg` the three-across row of modelling levels. A newline in
 * a label is a line break the reference draws, not a wrap.
 */
export interface InfoPlatesBlock {
  kind: 'plates';
  size: 'sm' | 'lg';
  items: string[];
}

export type InfoBlock = InfoTextBlock | InfoPlatesBlock;

export interface InfoPhase {
  title: string;
  blocks: InfoBlock[];
}

export const infoPhases: InfoPhase[] = [
  {
    title: 'Fázis 01 – Előkészítés',
    blocks: [
      {
        kind: 'text',
        heading: 'Kapcsolatfelvétel',
        paragraphs: ['Vedd fel velem a kapcsolatot, látogass el a CONTACT oldalra'],
        href: '/contact',
      },
      {
        kind: 'text',
        heading: 'Adatszolgáltatás',
        paragraphs: ['Az árajánlat elkészítéséhez az alábbi információkra lenne szükségem:'],
      },
      {
        kind: 'plates',
        size: 'sm',
        items: ['CAD tervek', '3D modell', 'anyagok\ntextúrák', 'mobiliák', 'mood'],
      },
      {
        kind: 'text',
        heading: 'Árajánlat',
        paragraphs: [
          'A kapott adatszolgáltatás és egyeztetett munkaleírás alapján elkészítem az árajánlatot',
        ],
      },
      {
        kind: 'text',
        heading: 'Szerződés',
        paragraphs: [
          'Az árajánlat elfogadását követően elkészítjük a szerződést. A következő fázis a szerződés aláírása és az előleg (40%-a a teljes összegnek) kifizetését követően kezdődik.',
        ],
      },
    ],
  },
  {
    title: 'Fázis 02 – Előnézet',
    blocks: [
      { kind: 'text', heading: 'Modellezés', paragraphs: [] },
      {
        kind: 'plates',
        size: 'lg',
        items: ['Nincs\n3D modell', 'Alap\n3D modell', 'Részletes\n3D modell'],
      },
      {
        kind: 'text',
        paragraphs: [
          'Kapott modell ellenőrzése, optimalizálása és felkészítése a látványtervezés elkezdéséhez. Modell tér berendezése előre elkészített modell elemekkel. Amennyiben az ügyfél szeretne egyedileg tervezett mobiliákat vagy pontos gyártói modelleket alkalmazni, egyedi megegyezés alapján lehetséges.',
        ],
      },
      {
        kind: 'text',
        heading: 'Nézőpontok, kompozíció, megvilágítás, anyagok/textúrák',
        paragraphs: [
          'Elkészítjük a modell bevilágítását, a kamerák beállítását és a jelenetet alapvetően meghatározó alap anyagokat. Az eredmény elküldését követően várjuk a visszajelzéseket. Ebben a fázisban van lehetősége az ügyfélnek a bevilágítás, kamerák és alap anyagok módosítására.',
        ],
      },
    ],
  },
  {
    title: 'Fázis 03 – Munkaközi',
    blocks: [
      {
        kind: 'text',
        paragraphs: [
          'Ebben a fázisban az észrevételek alapján elvégezem a kért módosításokat és tovább dolgozom a jelenetet. A renderek közel “végleges” állapotot fognak mutatni, részletes anyagokkal, megvilágítással, kiválasztott modellekkel. Ebben a fázisban van lehetősége az ügyfélnek az anyagok és modellek módosítására.',
          'Ezt követően további módosításra csak felár ellenében van lehetőség.',
        ],
      },
    ],
  },
  {
    title: 'Fázis 04 – Véglegesítés',
    blocks: [
      {
        kind: 'text',
        paragraphs: [
          'A végső jóváhagyást követően a rendereket és utómunkálatokat elkészítem. Ez a fázis néhány napot vesz igénybe a project léptékétől, a képek mennyiségétől és kívánt minőségétől függően.',
        ],
      },
    ],
  },
  {
    title: 'Fázis 05 – Kifizetés',
    blocks: [
      {
        kind: 'text',
        paragraphs: ['A fizetés részletei egyéni egyeztetés alapján (fennmaradó 60%).'],
      },
    ],
  },
];
