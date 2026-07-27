import type { Metadata } from 'next';
import { Bebas_Neue } from 'next/font/google';
import { ServicesInteractive } from '@/components/services/ServicesInteractive';

const bebas = Bebas_Neue({ subsets: ['latin'], weight: '400' });

export const metadata: Metadata = {
  title: 'Szolgáltatások',
  description:
    'Építészet és belsőépítészet, fotorealisztikus vizualizáció, grafikai tervezés, valamint fotózás és videózás — négy szolgáltatás egy stúdióból.',
};

export default function ServicesPage() {
  return (
    // White page — overrides the site-wide black body background.
    <section className="min-h-dvh bg-white px-5 pb-24 pt-28 sm:px-8 sm:pt-32">
      <div className="mx-auto max-w-shell">
        {/* Header block — heading + intro */}
        <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <h1 className={`${bebas.className} text-7xl leading-[1.02] tracking-tight sm:text-8xl`}>
              SERVICES
            </h1>
          </div>
        </div>

        {/* Centered interactive tiles */}
        <div className="mx-auto max-w-6xl">
          <ServicesInteractive />
        </div>
      </div>
    </section>
  );
}
