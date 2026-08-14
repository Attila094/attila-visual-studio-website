import type { Metadata } from 'next';
import './globals.css';
import { BallMenu } from '@/components/BallMenu';
import { DockedLogo } from '@/components/DockedLogo';
import { Footer } from '@/components/Footer';
import { HeroRevealProvider } from '@/components/home/HeroRevealContext';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  // Every relative image in this file's metadata — `opengraph-image.png` above
  // all — is resolved against this into the absolute URL a chat app's crawler
  // fetches, so it has to be the host the site actually answers on.
  metadataBase: new URL(SITE_URL),
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
  // The card itself is `src/app/opengraph-image.png` — the file convention, so
  // Next emits og:image with its absolute URL, pixel size and type, and every
  // route inherits it. `projects/[slug]` names its own image and keeps it.
  openGraph: {
    type: 'website',
    locale: 'hu_HU',
    siteName: 'Attila Visual Studio',
    url: SITE_URL,
    title: 'Attila Visual Studio — Építészeti vizualizáció & fotográfia',
    description:
      'Építészet, belsőépítészet, fotorealisztikus vizualizáció, grafika és fotó egy kézből.',
  },
  // X reads og:image when there is no twitter:image, but only draws it large
  // once the card type says so — without this the logo comes through as a
  // thumbnail beside the text.
  twitter: {
    card: 'summary_large_image',
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
