import type { Metadata } from 'next';
import { ContactForm } from '@/components/contact/ContactForm';

export const metadata: Metadata = {
  title: 'Kapcsolat',
  description:
    'Vedd fel a kapcsolatot az Attila Visual Studióval. Budapest, Lajos utca 142. Telefon: +36 20 547 7356. Email: attilakovacs094@gmail.com.',
};

const details = [
  { label: 'Helyszín', value: 'Budapest, Lajos utca 142', href: 'https://maps.google.com/?q=Budapest+Lajos+utca+142' },
  { label: 'Telefon', value: '+36 20 547 7356', href: 'tel:+36205477356' },
  { label: 'Email', value: 'attilakovacs094@gmail.com', href: 'mailto:attilakovacs094@gmail.com' },
];

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-shell px-5 pb-24 pt-28 sm:px-8 sm:pt-32">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
        {/* Left — heading + info */}
        <div className="lg:col-span-5">
          <p className="mb-5 text-xs font-medium uppercase tracking-[0.2em] text-muted">
            Kapcsolat
          </p>
          <h1 className="text-4xl font-semibold leading-[1.02] tracking-tight sm:text-5xl">
            Beszéljünk a
            <br />
            <span className="text-muted">projektedről.</span>
          </h1>

          <dl className="mt-12 space-y-6">
            {details.map((d) => (
              <div key={d.label} className="border-t border-line pt-4">
                <dt className="text-xs uppercase tracking-[0.15em] text-muted">{d.label}</dt>
                <dd className="mt-1 text-lg">
                  <a href={d.href} className="transition-colors hover:text-muted">
                    {d.value}
                  </a>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Right — main contact form */}
        <div className="lg:col-span-7 lg:pl-8">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
