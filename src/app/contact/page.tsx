import type { Metadata } from 'next';
import { ContactTiles } from '@/components/contact/ContactTiles';
import { PAGE_TITLE_CLASS, PAGE_TITLE_STYLE, PAGE_TOP_PAD } from '@/components/pageTitle';

const EMAIL = 'attilakovacs094@gmail.com';

export const metadata: Metadata = {
  title: 'Kapcsolat',
  description:
    'Vedd fel a kapcsolatot az Attila Visual Studióval. Budapest, Lajos utca 142. Telefon: +36 20 547 7356. Email: attilakovacs094@gmail.com.',
};

const details = [
  { label: 'Helyszín', value: 'Budapest', href: 'https://maps.google.com/?q=Budapest+Lajos+utca+142' },
  { label: 'Telefon', value: '+36 20 547 7356', href: 'tel:+36205477356' },
  { label: 'Email', value: EMAIL, href: `mailto:${EMAIL}` },
];

export default function ContactPage() {
  return (
    // A column the height of the viewport: title at the top, address row at the
    // bottom, and the tiles taking the space between — which centres them on
    // the page at any height.
    <section
      className={`mx-auto flex min-h-dvh max-w-shell flex-col px-5 pb-24 sm:px-8 ${PAGE_TOP_PAD}`}
    >
      <h1 style={PAGE_TITLE_STYLE} className={PAGE_TITLE_CLASS}>
        Contact
      </h1>

      {/* Address / phone / email — one horizontal row, directly under the
          title, so the way to reach the studio is read before the tiles. */}
      <dl className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-3">
        {details.map((d) => (
          <div key={d.label}>
            <dt className="text-xs uppercase tracking-[0.15em] text-white/45">{d.label}</dt>
            <dd className="mt-1 text-lg text-white">
              <a href={d.href} className="transition-colors hover:text-white/60">
                {d.value}
              </a>
            </dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-1 items-center py-10 sm:py-14">
        <ContactTiles email={EMAIL} />
      </div>
    </section>
  );
}
