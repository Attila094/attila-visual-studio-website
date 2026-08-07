import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Anton, Caveat, Poppins } from 'next/font/google';
import { PAGE_TITLE_CLASS, PAGE_TITLE_STYLE, PAGE_TOP_PAD } from '@/components/pageTitle';
import { WORK_HREF } from '@/lib/anchors';

/** Heavy condensed display for the ghosted name, the role line, the essay's
 *  heading and the buttons; a handwritten quote; and a geometric sans that
 *  carries both the card headings (bold, tracked out) and all body copy. ABOUT
 *  itself comes from the shared page-title style. */
const anton = Anton({ subsets: ['latin', 'latin-ext'], weight: '400' });
const script = Caveat({ subsets: ['latin', 'latin-ext'], weight: '400' });
const geo = Poppins({ subsets: ['latin', 'latin-ext'], weight: ['300', '700'] });

/** The oversized name behind the portrait — near-black, sampled from the mock. */
const GHOST = '#1e1e1e';
/** Its type size. Shared, because the gap under ABOUT and the quote's position
 *  are both expressed in ems of it. */
const GHOST_SIZE = 'clamp(4rem, 25.5vw, 22rem)';

/** Sampled straight out of `aboutpage.jpg`: the fact cards' plate, and the two
 *  button greys — the quiet pair against CONTACT's lighter one. */
const CARD = '#1a1a1a';
const BUTTON = '#333333';
const BUTTON_ACCENT = '#666666';

/**
 * A line in a fact card. A pair sets its second half on its own line, hung
 * under the first — the mock indents a competition's building that way rather
 * than letting it wrap.
 */
type CardLine = string | readonly [string, string];

const CARDS: { title: string; lines: readonly CardLine[] }[] = [
  {
    title: 'Végzettség',
    lines: ['PTE Mérnöki és Informatikai Kar /Bsc/', 'PTE Mérnöki és Informatikai Kar /Msc/'],
  },
  {
    title: 'Tapasztalat',
    lines: [
      'Archicad',
      '3ds max / V-ray / Corona',
      'Unreal Engine / Twinmotion',
      'Photoshop / Lightroom',
      'After Effects / Premier Pro',
    ],
  },
  {
    title: 'Pályázatok',
    lines: [
      ['2018 - Szombathely -', 'Lovas Sport- és Rendezvényközpont'],
      '2022 - Pécs Tüskésrét Fejlesztése',
      '2022 - Budapest - Ecseri úti metrómegálló',
      ['2023 - Budapest -', 'Magyar Építészeti Központ és Múzeum'],
      ['2024 - Kiskőrös -', 'Petőfi Sándor Kultúrális Központ'],
    ],
  },
];

/** The three closers. CONTACT is the light one, as in the mock; WORKS opens the
 *  home page at the tile row rather than at the hero. */
const BUTTONS = [
  { href: WORK_HREF, label: 'Works' },
  { href: '/services', label: 'Services' },
  { href: '/contact', label: 'Contact', accent: true },
];

export const metadata: Metadata = {
  title: 'About',
  description:
    'Attila Kovács — tervező építész Budapesten. Építészeti tervezés, belsőépítészet, 3D látványtervezés és építészeti fotográfia.',
};

export default function AboutPage() {
  return (
    <section className={`min-h-dvh px-5 pb-24 text-white sm:px-8 ${PAGE_TOP_PAD}`}>
      <div className="mx-auto max-w-shell">
        {/* Hero — ABOUT over the ghosted name, portrait bottom-right on top of
            it. Everything is sized in vw/%, so the whole composition keeps the
            reference's proportions at any width. */}
        <div className="relative">
          <h1 style={PAGE_TITLE_STYLE} className={`${PAGE_TITLE_CLASS} relative z-10`}>
            About
          </h1>

          {/* The name and the quote share a box, so the quote can be placed off
              the name's own type size rather than a percentage of the hero —
              which would drift every time the spacing above it changes. */}
          <div
            className="relative mt-[0.0289em]"
            style={{ fontSize: GHOST_SIZE }}
          >
            <p
              aria-hidden
              style={{ color: GHOST }}
              // Anton's left side bearing is 0.0213em wider than Bebas's at
              // these two sizes — more so now that ABOUT is synthetically
              // emboldened, which strokes its A outward. Pulling the name back
              // by that much lines the two left edges up exactly.
              className={`${anton.className} -ml-[0.0213em] text-[1em] uppercase leading-[1.0] tracking-[0.01em]`}
            >
              Attila
              <br />
              Kovacs
            </p>

            {/* Dead centre of the gap between the two lines. From ATTILA's
                baseline to KOVACS's cap-top is (1 − capHeight) of the em at
                leading 1.0; Anton's cap is 0.859em and its ascent 1.1774em, so
                the midpoint lands 0.994em below the paragraph's top edge. */}
            <p
              // Capped at the portrait's left edge (100% − 37.5% − the 9%
              // inset), so on a phone it wraps instead of crossing his shoulder.
              // The extra 0.117em centres the ink rather than the line box:
              // Caveat's ascenders outrun its descenders in this string, so the
              // glyphs otherwise sit low in their own box.
              style={{
                top: `calc(${GHOST_SIZE} * 0.994)`,
                transform: 'translateY(calc(-50% - 0.117em))',
              }}
              className={`${script.className} absolute left-[9%] z-20 max-w-[52%] text-[clamp(0.9rem,1.95vw,1.6rem)] leading-none text-white`}
            >
              &ldquo;Alkotás és értékteremtés, építészet és vizualizáció
              segítségével…&rdquo;
            </p>
          </div>

          {/* No plate behind the cut-out — the ghosted name runs on behind him
              and shows through the transparent surround. */}
          <div className="absolute bottom-0 right-0 z-10 aspect-[913/1195] w-[37.5%]">
            <Image
              src="/images/about/attila-masked.png"
              alt="Portré: Kovács Attila, tervező építész"
              fill
              sizes="(min-width: 640px) 38vw, 40vw"
              priority
              className="object-cover object-top"
            />
          </div>
        </div>

        {/* The role, centred under the portrait — it shares the photo's column,
            so it stays on his midline at any width. A phone's 37.5% column is
            too narrow for it, so there it runs the full width instead. */}
        <p
          className={`${anton.className} mt-5 text-center text-[clamp(0.95rem,1.95vw,1.9rem)] leading-none text-white sm:ml-auto sm:w-[37.5%]`}
        >
          építész &amp; látványtervező
        </p>

        {/* Three fact cards — equal plates, side by side on a desktop and
            stacked on a phone. The minimum height is the mock's: the cards hold
            their shape whether they carry two lines or eight. */}
        <div className="mt-14 grid gap-3 md:grid-cols-3">
          {CARDS.map((card) => (
            <section
              key={card.title}
              style={{ backgroundColor: CARD }}
              className="rounded-2xl p-6 md:min-h-[18.5rem]"
            >
              <h2
                className={`${geo.className} text-[clamp(1.05rem,2.15vw,1.95rem)] font-bold uppercase leading-none tracking-[0.24em] text-white/65`}
              >
                {card.title}
              </h2>

              <div
                className={`${geo.className} mt-6 text-[clamp(0.85rem,1.2vw,1.1rem)] font-light leading-[1.3] text-white/55`}
              >
                {card.lines.map((line) => {
                  const [head, hung] = typeof line === 'string' ? [line, null] : line;
                  return (
                    <p key={head}>
                      {head}
                      {/* Hung under the year, roughly where the entry's own
                          text starts, as the mock sets it. */}
                      {hung && <span className="block pl-[3.6em]">{hung}</span>}
                    </p>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {/* The essay. Justified and full width, under a condensed heading. */}
        <h2
          className={`${anton.className} mt-8 text-[clamp(1.15rem,1.75vw,1.6rem)] leading-tight text-white`}
        >
          Mérnöki és művészi látásmód együttesen
        </h2>
        <div
          // Justified from `sm` up only: at a phone's measure the same setting
          // opens rivers of white space between the words.
          className={`${geo.className} mt-5 text-[clamp(0.85rem,1.2vw,1.1rem)] font-light leading-[1.3] text-white/75 sm:text-justify`}
        >
          <p>
            Építészmérnöki diplomámat a Pécsi Tudományegyetem Műszaki és Informatikai Karán
            szereztem. Tanulmányaimmal párhuzamosan, autodidakta módon sajátítottam el a
            professzionális látványtervezést, amely mára a munkám egyik alappillérévé vált.
          </p>
          <p>
            Szabadúszóként az elmúlt 10 évben széleskörű tapasztalatot szereztem az építészet, a
            belsőépítészet és a digitális vizualizáció területén. Ez a multidiszciplináris
            tapasztalati háttér biztosítja számomra azt a komplex szemléletmódot, amellyel minőségi
            műszaki tartalom mellett magasszínvonlanú esztétikai megjelenéssel társítva végzem
            tervezési folyamatokat a kezdeti koncepciótól fotorealisztikus prezentációig, teljes körű
            szolgáltatást tudok nyújtani az ügyefeleim részére.
          </p>
        </div>

        {/* Three ways on. One cell each, so the pills sit on the mock's rhythm
            however wide their labels are. */}
        <nav aria-label="Tovább" className="mt-28 grid grid-cols-3 justify-items-center gap-3">
          {BUTTONS.map((button) => (
            <Link
              key={button.href}
              href={button.href}
              style={{
                backgroundColor: button.accent ? BUTTON_ACCENT : BUTTON,
                color: button.accent ? '#ffffff' : '#0a0a0a',
              }}
              className={`${anton.className} rounded-full px-4 py-3 text-center text-[clamp(0.85rem,1.9vw,1.7rem)] uppercase leading-none tracking-[0.01em] transition-opacity hover:opacity-80 sm:px-8 lg:px-12`}
            >
              {button.label}
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
