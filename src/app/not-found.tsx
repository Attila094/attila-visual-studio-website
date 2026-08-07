import type { Metadata } from 'next';
import Link from 'next/link';
import { Anton, Poppins } from 'next/font/google';
import { PAGE_TITLE_CLASS, PAGE_TITLE_STYLE, PAGE_TOP_PAD } from '@/components/pageTitle';
import { WORK_HREF } from '@/lib/anchors';

const anton = Anton({ subsets: ['latin', 'latin-ext'], weight: '400' });
const geo = Poppins({ subsets: ['latin', 'latin-ext'], weight: '300' });

export const metadata: Metadata = {
  title: 'Az oldal nem található',
};

/** Same pills as the about page's closers. */
const LINKS = [
  { href: WORK_HREF, label: 'Works' },
  { href: '/services', label: 'Services' },
  { href: '/contact', label: 'Contact', accent: true },
];

const BUTTON = '#333333';
const BUTTON_ACCENT = '#666666';

/**
 * 404.
 *
 * Without this file Next serves its own, which sets no colour of its own and so
 * inherits the layout's `text-ink` — near-black type on the site's black page,
 * in English, with no way back.
 */
export default function NotFound() {
  return (
    <section
      className={`flex min-h-dvh flex-col px-5 pb-24 text-white sm:px-8 ${PAGE_TOP_PAD}`}
    >
      <div className="mx-auto flex w-full max-w-shell flex-1 flex-col justify-center">
        <h1 style={PAGE_TITLE_STYLE} className={PAGE_TITLE_CLASS}>
          404
        </h1>

        <p
          className={`${anton.className} mt-4 text-[clamp(1.15rem,1.75vw,1.6rem)] leading-tight text-white`}
        >
          Ez az oldal nem található
        </p>
        <p
          className={`${geo.className} mt-3 max-w-md text-[clamp(0.85rem,1.2vw,1.1rem)] font-light leading-[1.4] text-white/55`}
        >
          Lehet, hogy elköltözött, vagy elgépelted a címet. Innen tovább:
        </p>

        <nav aria-label="Tovább" className="mt-10 flex flex-wrap gap-3">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                backgroundColor: link.accent ? BUTTON_ACCENT : BUTTON,
                color: link.accent ? '#ffffff' : '#0a0a0a',
              }}
              className={`${anton.className} rounded-full px-8 py-3 text-center text-[clamp(0.85rem,1.9vw,1.7rem)] uppercase leading-none tracking-[0.01em] transition-opacity hover:opacity-80`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
