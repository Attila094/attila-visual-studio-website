import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Attila Kovács — építész és vizualizációs szakember Budapesten. Építészeti tervezés, belsőépítészet, 3D látványtervezés és építészeti fotográfia.',
};

const skillGroups = [
  {
    title: 'Tervezés',
    items: [
      'Építészeti tervezés (koncepció → kiviteli terv)',
      'Belsőépítészeti tervezés',
      'Tér- és funkcióoptimalizálás',
      'Anyag- és színkoncepció',
    ],
  },
  {
    title: 'Vizualizáció',
    items: [
      '3ds Max + V-Ray fotorealisztikus render',
      'Twinmotion valós idejű látvány',
      'Animáció és 360°-os bejárás',
      'Utómunka: Photoshop, DaVinci',
    ],
  },
  {
    title: 'Grafika & média',
    items: [
      'Arculat- és nyomdai tervezés',
      'Prezentációs anyagok',
      'Építészeti fotó- és videódokumentáció',
      'Drónfelvétel',
    ],
  },
  {
    title: 'Eszközök',
    items: ['AutoCAD / ArchiCAD', 'SketchUp', 'Adobe Creative Suite', 'Lumix rendszer'],
  },
];

export default function AboutPage() {
  return (
    // White page — overrides the site-wide black body background.
    <section className="min-h-dvh bg-white px-5 pb-24 pt-28 sm:px-8 sm:pt-32">
      <div className="mx-auto max-w-shell">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Mirrored layout: portrait moves to the RIGHT on desktop, the text
            block to the left. Mobile keeps portrait-first ordering. */}
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl bg-line lg:sticky lg:top-28 lg:order-2 lg:self-start">
            <Image
              src="/images/about/portrait.svg"
              alt="Portré: Attila Kovács, építész és vizualizációs szakember"
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              priority
              // Placeholder SVG — remove `unoptimized` when a real portrait is added.
              unoptimized
              className="object-cover"
            />
          </div>

          {/* Bio + skills — sits on the LEFT after the mirror. */}
          <div className="lg:order-1">
            {/* 400% larger than the old text-xs eyebrow (12px → 60px). */}
            <p className="mb-5 text-6xl font-medium uppercase leading-none tracking-[0.2em] text-muted">
              About
            </p>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Attila Kovács
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              Építész és vizualizációs szakember vagyok Budapesten. Az épített teret a koncepciótól
              a kész látványig végigkísérem — tervezek, renderelek, fotózok, és a hozzájuk tartozó
              vizuális anyagot is elkészítem.
            </p>

            <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2">
              {skillGroups.map((group) => (
                <div key={group.title}>
                  <h2 className="mb-4 border-b border-line pb-2 text-sm font-semibold uppercase tracking-[0.12em]">
                    {group.title}
                  </h2>
                  <ul className="space-y-2.5">
                    {group.items.map((item) => (
                      <li key={item} className="flex gap-3 text-[15px] leading-snug text-muted">
                        <span aria-hidden className="mt-1 text-ink">
                          ↗
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
