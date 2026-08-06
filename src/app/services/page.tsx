import type { Metadata } from 'next';
import { ServicesInteractive } from '@/components/services/ServicesInteractive';
import { PAGE_TITLE_CLASS, PAGE_TITLE_STYLE, PAGE_TOP_PAD } from '@/components/pageTitle';

export const metadata: Metadata = {
  title: 'Szolgáltatások',
  description:
    'Látványtervezés, építészeti tervezés, belsőépítészet, valamint fotó- és videográfia — négy szolgáltatáscsoport egy stúdióból.',
};

export default function ServicesPage() {
  return (
    // Black page with the SERVICES title over four card rows, per the
    // `servicepage.jpg` reference.
    <section className={`min-h-dvh px-5 pb-24 text-white sm:px-8 ${PAGE_TOP_PAD}`}>
      <div className="mx-auto max-w-shell">
        <h1 style={PAGE_TITLE_STYLE} className={`${PAGE_TITLE_CLASS} mb-10 sm:mb-14`}>
          Services
        </h1>

        <ServicesInteractive />
      </div>
    </section>
  );
}
