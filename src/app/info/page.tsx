import type { Metadata } from 'next';
import Link from 'next/link';
import { Bebas_Neue, Poppins } from 'next/font/google';
import { infoPhases } from '@/content/info';
import { PAGE_TITLE_CLASS, PAGE_TITLE_STYLE, PAGE_TOP_PAD } from '@/components/pageTitle';

/** Every title on the page is Bebas; the paragraphs stay in the geometric sans
 *  of the reference. Both are scoped here — the rest of the site is on Inter. */
// latin-ext, not just latin: the phase titles carry Ő and Ű, which live outside
// the basic Latin subset and would otherwise fall back to another face.
const bebas = Bebas_Neue({ subsets: ['latin', 'latin-ext'], weight: '400' });
const geo = Poppins({ subsets: ['latin', 'latin-ext'], weight: ['300', '400'] });

export const metadata: Metadata = {
  title: 'Info',
  description:
    'A látványtervezési munkafolyamat fázisról fázisra: előkészítés, modellezés, előnézet, pre-final, final és kifizetés.',
};

export default function InfoPage() {
  return (
    <section className={`${geo.className} px-5 pb-32 sm:px-8 ${PAGE_TOP_PAD}`}>
      <div className="mx-auto max-w-shell">
        <h1 style={PAGE_TITLE_STYLE} className={PAGE_TITLE_CLASS}>
          Info
        </h1>

        {/* One column, left aligned, wide measure — as laid out in the reference. */}
        <div className="mt-10 max-w-5xl space-y-16 sm:mt-14 sm:space-y-24">
          {infoPhases.map((phase) => (
            <section key={phase.title}>
              <h2
                className={`${bebas.className} text-[clamp(1.5rem,3.4vw,2.25rem)] uppercase leading-tight tracking-[0.14em] text-white`}
              >
                {phase.title}
              </h2>

              <div className="mt-4 space-y-6">
                {phase.blocks.map((block, i) => {
                  const body = (
                    <div className="space-y-1">
                      {block.lines.map((line) => (
                        <p key={line} className="font-light leading-snug text-white/50">
                          {line}
                        </p>
                      ))}
                    </div>
                  );

                  return (
                    <div key={block.heading ?? i} className="text-lg sm:text-xl">
                      {block.heading && (
                        <p
                          className={`${bebas.className} uppercase leading-snug tracking-[0.06em] text-white`}
                        >
                          {block.heading}
                        </p>
                      )}
                      {block.href ? (
                        <Link
                          href={block.href}
                          className="block transition-opacity hover:opacity-60"
                        >
                          {body}
                        </Link>
                      ) : (
                        body
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
