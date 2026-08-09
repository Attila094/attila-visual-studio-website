import type { Metadata } from 'next';
import Link from 'next/link';
import { Anton, Poppins } from 'next/font/google';
import { infoPhases, infoTracks, type InfoBlock } from '@/content/info';
import { GLASS_RING, GLASS_STYLE } from '@/components/glass';
import { InfoTracks } from '@/components/info/InfoTracks';
import { PAGE_TITLE_CLASS, PAGE_TITLE_STYLE, PAGE_TOP_PAD } from '@/components/pageTitle';

/** The phase headings and every plate label are the heavy condensed face of the
 *  reference; the copy under them is the geometric sans. INFO itself comes from
 *  the shared page-title style. */
// latin-ext, not just latin: the phase titles carry Ő and Ű, which live outside
// the basic Latin subset and would otherwise fall back to another face.
const anton = Anton({ subsets: ['latin', 'latin-ext'], weight: '400' });
const geo = Poppins({ subsets: ['latin', 'latin-ext'], weight: ['300', '700'] });

/** Sampled out of `infopage.jpg`: the panel that holds the phases, and the
 *  labelled plates inside it. The three service plates carry their own colour
 *  in `InfoTracks`, under their artwork. */
const PANEL = '#262626';
const PLATE = '#3c3c3c';

/** Plate proportions, straight from the reference — the five-across strip is a
 *  tall sliver, the three-across row nearly square, and both come out the same
 *  height at the widths they are used. */
const PLATE_ASPECT = {
  sm: 'aspect-[401/631]',
  lg: 'aspect-[678/640]',
} as const;

/** Their columns. Spelled out rather than built from a template so Tailwind's
 *  scanner sees every class it has to generate. */
const PLATE_COLS = {
  sm: 'grid-cols-2 sm:grid-cols-4',
  lg: 'grid-cols-1 sm:grid-cols-3',
} as const;

/** The wide row is set in caps in the reference; the narrow strip is not. */
const PLATE_TEXT = {
  sm: 'text-[clamp(0.95rem,2.4vw,2.2rem)]',
  lg: 'text-[clamp(1.2rem,4vw,3.6rem)] uppercase',
} as const;

/** Body copy. Dim, as drawn — the lead-ins above it carry the contrast. Set a
 *  fifth smaller than the reference, which oversized it against the headings. */
const BODY_CLASS =
  'text-[clamp(0.72rem,1.4vw,1.28rem)] font-light leading-[1.45] text-white/40';

/**
 * The space above a block, which the reference varies by what precedes it: a
 * phase heading stands well clear, copy following a plate row sits right under
 * it, and everything else keeps an even rhythm.
 */
function gapAbove(block: InfoBlock, prev: InfoBlock | undefined) {
  if (!prev) return 'mt-10';
  if (prev.kind === 'plates') return 'mt-2';
  return block.kind === 'plates' ? 'mt-6' : 'mt-5';
}

function Block({ block, className = '' }: { block: InfoBlock; className?: string }) {
  if (block.kind === 'plates') {
    return (
      <div className={`grid gap-3 sm:gap-4 ${PLATE_COLS[block.size]} ${className}`}>
        {block.items.map((item) => (
          <div
            key={item}
            style={{ backgroundColor: PLATE }}
            className={`flex items-center justify-center rounded-xl p-3 text-center ${PLATE_ASPECT[block.size]}`}
          >
            {/* The labels break where the reference breaks them. */}
            <span
              className={`${anton.className} whitespace-pre-line leading-[1.15] text-white ${PLATE_TEXT[block.size]}`}
            >
              {item}
            </span>
          </div>
        ))}
      </div>
    );
  }

  // A block with an `href` names its destination in the copy — the word itself
  // becomes the button, rather than the whole line becoming a link.
  const body = block.paragraphs.map((paragraph, i) => (
    <p key={paragraph} className={`${BODY_CLASS} ${i ? 'mt-6' : 'mt-1.5'}`}>
      {block.href ? withButton(paragraph, block.href) : paragraph}
    </p>
  ));

  return (
    <div className={className}>
      {block.heading && (
        <p
          className={`${geo.className} text-[clamp(0.95rem,2.3vw,2.1rem)] font-bold uppercase leading-tight tracking-[0.05em] text-white/60`}
        >
          {block.heading}
        </p>
      )}
      {body}
    </div>
  );
}

/** The label a linked block puts in its copy, in the caps the copy sets it in. */
const BUTTON_WORD = 'CONTACT';

/** Swaps that word for the studio's glass pill, leaving the sentence around it
 *  as written. */
function withButton(paragraph: string, href: string) {
  const parts = paragraph.split(BUTTON_WORD);
  if (parts.length === 1) return paragraph;

  return parts.flatMap((part, i) =>
    i === 0
      ? [part]
      : [
          <Link
            key={i}
            href={href}
            style={GLASS_STYLE}
            className={`${anton.className} mx-1 inline-block rounded-full px-5 py-1 align-middle text-[0.95em] uppercase leading-none tracking-[0.01em] text-white ${GLASS_RING} transition-colors duration-300 hover:bg-white/25`}
          >
            {BUTTON_WORD}
          </Link>,
          part,
        ],
  );
}

export const metadata: Metadata = {
  title: 'Info',
  description:
    'A látványtervezési munkafolyamat fázisról fázisra: előkészítés, előnézet, munkaközi, véglegesítés és kifizetés.',
};

export default function InfoPage() {
  return (
    <section className={`${geo.className} px-5 pb-32 sm:px-8 ${PAGE_TOP_PAD}`}>
      <div className="mx-auto max-w-shell">
        <h1 style={PAGE_TITLE_STYLE} className={PAGE_TITLE_CLASS}>
          Info
        </h1>

        {/* The three tracks the workflow is read for, as a row of plates across
            the full measure — and, under the first of them, the workflow it
            describes. The panel opens when that plate is pressed. */}
        <InfoTracks tracks={infoTracks}>
        {/* One panel for the whole workflow, as in the reference — the phases
            run inside it rather than each carrying its own plate. */}
        <div
          style={{ backgroundColor: PANEL }}
          className="mt-3 rounded-3xl p-6 sm:mt-4 sm:p-9"
        >
          {infoPhases.map((phase, i) => (
            <section key={phase.title} className={i ? 'mt-10' : ''}>
              <h2
                // Not `leading-none`: the reference only ever sets these on one
                // line, but a phone wraps them, and Anton's accents would then
                // sit in the line above.
                className={`${anton.className} text-[clamp(1.35rem,3.7vw,3.3rem)] uppercase leading-[1.1] tracking-[0.2em] text-white`}
              >
                {phase.title}
              </h2>

              {phase.blocks.map((block, j) => (
                <Block key={j} block={block} className={gapAbove(block, phase.blocks[j - 1])} />
              ))}
            </section>
          ))}
        </div>
        </InfoTracks>
      </div>
    </section>
  );
}
