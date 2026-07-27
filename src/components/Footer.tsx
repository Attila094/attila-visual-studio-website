import Link from 'next/link';
import { services } from '@/content/services';

const EMAIL = 'attilakovacs094@gmail.com';

const socials = ['Youtube', 'Facebook', 'Instagram', 'Tiktok', 'LinkedIn'];

const menu = [
  { href: '/', label: 'Work' },
  { href: '/services', label: 'Services' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export function Footer() {
  return (
    <footer className="border-t border-white/15 text-white/80">
      <div className="mx-auto grid max-w-shell grid-cols-1 gap-10 px-5 py-14 sm:px-8 md:grid-cols-3 md:items-start md:gap-8">
        {/* Bottom left — social links */}
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {socials.map((s) => (
            <a
              key={s}
              href="#"
              className="text-sm text-white/55 transition-colors hover:text-white"
            >
              {s}
            </a>
          ))}
        </div>

        {/* Bottom center — two lists side by side */}
        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.15em] text-white/45">
              Szolgáltatások
            </p>
            <ul className="space-y-1.5">
              {services.map((s) => (
                <li key={s.id}>
                  <Link
                    href="/services"
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

        {/* Bottom right — contact email */}
        <div className="md:text-right">
          <p className="mb-3 text-xs uppercase tracking-[0.15em] text-white/45">Kapcsolat</p>
          <a
            href={`mailto:${EMAIL}`}
            className="text-sm transition-colors hover:text-white/60"
          >
            {EMAIL}
          </a>
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
