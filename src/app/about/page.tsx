import type { Metadata } from 'next';
import Image from 'next/image';
import { Anton, Caveat, Poppins } from 'next/font/google';
import { PAGE_TITLE_CLASS, PAGE_TITLE_STYLE, PAGE_TOP_PAD } from '@/components/pageTitle';

/** Heavy condensed display for the ghosted name and the section heading, a
 *  handwritten quote, and a light geometric sans. ABOUT itself comes from the
 *  shared page-title style. */
const anton = Anton({ subsets: ['latin', 'latin-ext'], weight: '400' });
const script = Caveat({ subsets: ['latin', 'latin-ext'], weight: '400' });
const geo = Poppins({ subsets: ['latin', 'latin-ext'], weight: '300' });

/** The oversized name behind the portrait — near-black, sampled from the mock. */
const GHOST = '#1e1e1e';
/** Its type size. Shared, because the gap under ABOUT and the quote's position
 *  are both expressed in ems of it. */
const GHOST_SIZE = 'clamp(4rem, 25.5vw, 22rem)';

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
              &ldquo;Egy igazán fasza idézet, valami bölcsességről…&rdquo;
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

        {/* Végzettség */}
        <div className="mt-20 grid grid-cols-1 gap-6 md:grid-cols-2">
          <h2
            className={`${anton.className} text-[clamp(1.5rem,4.7vw,3.75rem)] uppercase leading-none tracking-[0.01em]`}
          >
            Végzettség
          </h2>
          <div className={`${geo.className} text-lg leading-snug text-white/75 sm:text-xl`}>
            <p>tervező építész</p>
            <p>PTE Mérnöki és Informatikai Kar</p>
          </div>
        </div>

        <p
          className={`${geo.className} mt-8 text-justify text-base leading-relaxed text-white/75 sm:text-lg`}
        >
          Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum
          has been the industry&apos;s standard dummy text ever since 1966, when designers at
          Letraset and James Mosley, the librarian at St Bride Printing Library in London, took a
        </p>
      </div>
    </section>
  );
}
