import Link from 'next/link';
import { services } from '@/content/services';
import { WORK_HREF } from '@/lib/anchors';

const EMAIL = 'attilakovacs094@gmail.com';

/** `#` where there is no account to point at yet. */
const socials = [
  { label: 'Youtube', href: 'https://www.youtube.com/channel/UCJpSGpL6k7tRes6Bfcezazw' },
  { label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61591438174457' },
  { label: 'Instagram', href: 'https://www.instagram.com/attila_visual_studio/' },
  { label: 'Tiktok', href: '#' },
  { label: 'LinkedIn', href: '#' },
];

// Same order as the top bar, plus Contact — which lives in its own corner pill
// up there but belongs in the list down here.
const menu = [
  { href: WORK_HREF, label: 'Work' },
  { href: '/services', label: 'Services' },
  { href: '/info', label: 'Info' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export function Footer() {
  return (
    <footer className="border-t border-white/15 text-white/80">
      <div className="mx-auto flex max-w-shell flex-col gap-10 px-5 py-14 sm:px-8 md:flex-row md:items-start md:justify-between md:gap-8">
        {/* Bottom left — social links. All five stay on one line on a phone:
            they are set smaller there and spread across the column, which is
            what keeps them off a second row at 320px. */}
        <div className="flex flex-nowrap justify-between gap-x-2 sm:flex-wrap sm:justify-start sm:gap-x-5 sm:gap-y-2">
          {socials.map((s) => {
            const external = s.href.startsWith('http');
            return (
              <a
                key={s.label}
                href={s.href}
                {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
                className="whitespace-nowrap text-xs text-white/55 transition-colors hover:text-white sm:text-sm"
              >
                {s.label}
              </a>
            );
          })}
        </div>

        {/* Bottom right — the three lists as one block hung off the right edge,
            reading Menü, Szolgáltatások, Kapcsolat from the right.

            On a phone they keep the shape they have always had: the two lists
            side by side, the email spanning both underneath. That is why
            Kapcsolat leads in the source and is ordered back to the end there —
            source order is what puts it leftmost of the three from `md`, and
            `order-last` is what keeps it under them on a narrow screen. Centred
            while stacked, where a left edge has nothing to line up with. */}
        <div className="grid grid-cols-2 gap-8 text-center md:flex md:gap-12 md:text-left">
          <div className="order-last col-span-2 md:order-none md:col-auto">
            <p className="mb-3 text-xs uppercase tracking-[0.15em] text-white/45">Kapcsolat</p>
            <a
              href={`mailto:${EMAIL}`}
              className="text-sm transition-colors hover:text-white/60"
            >
              {EMAIL}
            </a>
          </div>

          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.15em] text-white/45">
              Szolgáltatások
            </p>
            <ul className="space-y-1.5">
              {services.map((s) => (
                <li key={s.id}>
                  <Link
                    // Straight to that category's row — the services page gives
                    // each <section> its own id.
                    href={`/services#${s.id}`}
                    className="text-sm capitalize transition-colors hover:text-white/60"
                  >
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.15em] text-white/45">Menü</p>
            <ul className="space-y-1.5">
              {menu.map((m) => (
                <li key={m.href}>
                  <Link
                    href={m.href}
                    className="text-sm transition-colors hover:text-white/60"
                  >
                    {m.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-shell px-5 pb-8 sm:px-8">
        <p className="text-xs text-white/45">
          © {new Date().getFullYear()} Attila Visual Studio
        </p>
      </div>
    </footer>
  );
}
