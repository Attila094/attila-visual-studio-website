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
      {/* `svh`, not `dvh`: a phone's chrome slides in and out as you scroll,
          and `dvh` follows it. Here that would change the height of the page
          itself — the hero plus three viewports of runway below it — so the
          document would shrink under a fixed scroll position and everything
          would jump. `svh` is the small viewport: it holds still. */}
      <section className="relative min-h-svh">
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
