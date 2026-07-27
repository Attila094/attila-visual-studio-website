import { HomeHero3D } from '@/components/home/HomeHero3D';
import { HeroImageSequence } from '@/components/home/HeroImageSequence';
import { MainLayout } from '@/components/home/MainLayout';

export default function HomePage() {
  return (
    <>
      {/* Hero — interactive 3D orbit experience: an SVG logo draws, then breaks
          apart into lines that orbit "VISUAL STUDIO"; hovering a line freezes it
          and opens it into a media plane. The menu bar is hidden here and morphs
          in from the bouncing ball once the intro reveals (see BallMenu). */}
      <section className="relative min-h-dvh">
        <h1 className="sr-only">
          Attila Visual Studio — építészeti vizualizáció és fotográfia
        </h1>
        <HomeHero3D />
      </section>

      {/* Scroll sequence: the bouncing ball becomes an image that grows under
          the logo, then hands off through three images before the page
          continues to MainTiles. */}
      <HeroImageSequence />

      {/* Main content between Hero and Footer: 5 tiles + projects gallery */}
      <MainLayout />
    </>
  );
}
