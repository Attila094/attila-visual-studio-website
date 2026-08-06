import type { Metadata } from 'next';
import './globals.css';
import { BallMenu } from '@/components/BallMenu';
import { DockedLogo } from '@/components/DockedLogo';
import { Footer } from '@/components/Footer';
import { HeroRevealProvider } from '@/components/home/HeroRevealContext';

export const metadata: Metadata = {
  metadataBase: new URL('https://attilavisualstudio.hu'),
  title: {
    default: 'Attila Visual Studio — Építészeti vizualizáció & fotográfia',
    template: '%s | Attila Visual Studio',
  },
  description:
    'Attila Visual Studio — építészet és belsőépítészet, fotorealisztikus 3D vizualizáció, grafikai tervezés, valamint építészeti fotó és videó Budapesten.',
  keywords: [
    'építészeti vizualizáció',
    'belsőépítészet',
    '3D látványterv',
    'építészeti fotó',
    'V-Ray',
    'Twinmotion',
    'Budapest',
  ],
  openGraph: {
    type: 'website',
    locale: 'hu_HU',
    siteName: 'Attila Visual Studio',
    title: 'Attila Visual Studio — Építészeti vizualizáció & fotográfia',
    description:
      'Építészet, belsőépítészet, fotorealisztikus vizualizáció, grafika és fotó egy kézből.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hu">
      <body className="min-h-dvh bg-black font-sans text-ink">
        <HeroRevealProvider>
          <BallMenu />
          <DockedLogo />
          <main>{children}</main>
          <Footer />
        </HeroRevealProvider>
      </body>
    </html>
  );
}
