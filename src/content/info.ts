/**
 * The INFO page — the studio's project workflow, phase by phase.
 *
 * Transcribed from the `infopage.jpg` layout reference: one big INFO title, then
 * a stack of FÁZIS headings, each holding uppercase sub-headings with their own
 * paragraphs beneath.
 */
export interface InfoBlock {
  /** Uppercase lead-in above the paragraphs. Omitted where the phase has none. */
  heading?: string;
  /** Each string is its own paragraph. */
  lines: string[];
  /** When set, the block's lines become a link to this route. */
  href?: string;
}

export interface InfoPhase {
  title: string;
  blocks: InfoBlock[];
}

export const infoPhases: InfoPhase[] = [
  {
    title: 'Fázis 00 - Előkészítés',
    blocks: [
      {
        heading: 'Kapcsolatfelvétel',
        lines: ['Vedd fel velem a kapcsolatot, látogass el a kapcsolatok oldalra'],
        href: '/contact',
      },
      {
        heading: 'Adatszolgáltatás',
        lines: [
          'Mielőtt a végső árajánlatot elkészítenénk további információra lesz szükségünk,',
          '– 2D épület és környezet tervek (dwg, dwf, pdf, etc…)',
          '– 3D épület modellezés (fbx, dae, 3ds, obj, etc…) or CAD/BIM adatok az épületről (ArchiCAD, AutoCAD, Revit, IFC etc…)',
          '– Amennyiben az adatok megosztása nem lehetséges, print-screen készítése is elegendő lehet',
          '– Képek a környezetről, szomszédokról (landscape, streets, etc…)',
          '– Referenciaképek a kívánt képek hangulatához.',
          '*a megosztott fájlokat bizalmasan kezeljük /Terms & Conditions, Privacy policy & GDPR/.',
        ],
      },
      {
        heading: 'Árajánlat',
        lines: [
          'Miután minden kapott adatot átnéztünk elkészítjük a végleges árajánlatot és elküldjük jóváhagyásra.',
        ],
      },
      {
        heading: 'Szerződés – előleg kifizetése',
        lines: [
          'Röviddel a végső árajánlat elfogadását követően elkészítjük a szerződést.',
          'Megkezdjük a munkát a szerződés aláírása és az előleg (40%-a a teljes összegnek) kifizetését követően.',
        ],
      },
    ],
  },
  {
    title: 'Fázis 01 - Modellezés',
    blocks: [
      {
        heading: 'A – 3D model felépítése – modelt nem szolgáltatott',
        lines: [
          'Az első rendereken az épületet anyagok és textúrák nélkül ábrázoljuk (az ügyfél jóváhagyhatja az épület és környezet modellt). Az eredmény elküldését követően várjuk a visszajelzéseket. Ebben a fázisban van lehetősége az ügyfélnek a modell részleteket változtatni.',
        ],
      },
      {
        heading: 'B – Javítás és részletezés – 3D modelt szolgáltatott',
        lines: [
          'Amennyiben modell elérhető, elvégzünk néhány javítást illetve további részletek kidolgozását. Építészeti látványtervezésnél kiemelkedően fontos a modell részletezettsége. A modell apró részletei adják meg a képek valóságszerűségét.',
        ],
      },
      {
        heading: 'C – Részletes 3D model importálása – részletes 3D modelt szolgáltatott',
        lines: [
          'Ellenőrzés, optimalizálás és felkészítés a látványtervezés elkezdéséhez.',
          'Amennyiben az ügyfél szeretné teljesíteni a részletes 3D modell követelményeit az alábbi lépések elvégzésével megteheti. A követelmények teljesítése jelentős pénz és időbeli csökkenést eredményez.',
        ],
      },
    ],
  },
  {
    title: 'Fázis 02 - Előnézet',
    blocks: [
      {
        heading: 'Megvilágítás, kompozíció, anyagok/textúrák',
        lines: [
          'Elkészítjük a modell bevilágítását, a kamerák beállítását és a jelenetet alapvetően meghatározó alap anyagokat. Az eredmény elküldését követően várjuk a visszajelzéseket. Ebben a fázisban van lehetősége az ügyfélnek a bevilágítás, kamerák és alap anyagok módosítására.',
        ],
      },
    ],
  },
  {
    title: 'Fázis 03 - Pre-final',
    blocks: [
      {
        lines: [
          'Ebben a fázisban az észrevételek alapján elvégezzük a módosításokat és tovább dolgozzuk a jelenetet. A renderek közel végleges állapotot fognak mutatni, részletes anyagokkal, további modellekkel (amennyiben igényelt) és kívánt mennyiségű emberrel. Ebben a fázisban van lehetősége az ügyfélnek az anyagok, további modellek és emberek módosítására.',
        ],
      },
    ],
  },
  {
    // The reference numbers this 03 as well — kept verbatim.
    title: 'Fázis 03 - Final',
    blocks: [
      {
        lines: [
          'A végső jóváhagyást követően a rendereket elkészítjük. Ez a fázis néhány napot vesz igénybe a project léptékétől, a kívánt képek mennyiségétől és minőségétől függően.',
        ],
      },
    ],
  },
  {
    title: 'Fázis 04 - Kifizetés',
    blocks: [
      {
        lines: ['A fizetés részletei egyéni egyeztetés alapján (fennmaradó 50%).'],
      },
    ],
  },
];
