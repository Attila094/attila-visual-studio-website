# Attila Visual Studio

Építészeti vizualizáció & fotográfia portfólió — Next.js (App Router) · Tailwind CSS · Framer Motion.

Single-page app feel with client-side routing across four views: **Home**, **Services**, **About**, **Contact**.

## Requirements

Node.js 18.18+ (or 20+) and npm. **Node was not installed on the build machine**, so the
project has not yet been `npm install`-ed or built here. Install Node from
<https://nodejs.org> (LTS), then:

```bash
npm install       # install dependencies
npm run dev        # http://localhost:3000
npm run build      # production build (run this after grid/transition changes)
npm start          # serve the production build
```

## Structure

```
src/app/                     routes, layout, template (LayoutGroup), metadata
  page.tsx                   Home — hero + morphing 1:1 project grid
  services/page.tsx          Services — 3-stage interactive tiles
  about/page.tsx             About — two-column portrait + skills
  contact/page.tsx           Contact — info + main form
  projects/[slug]/page.tsx   Project detail — shared-element hero + JSON-LD
src/components/
  Nav.tsx                    header, desktop links + mobile overlay menu
  grid/ProjectGrid.tsx       hover / sibling-scale + layoutId morph (touch-gated)
  project/                   ProjectHero (morph target), ProjectJsonLd
  services/                  ServicesInteractive + ServiceForm
  contact/ContactForm.tsx
src/content/                 projects.ts, services.ts (edit copy here)
src/lib/                     useHasHoverSupport, motion constants
public/images/               placeholder SVG assets (swap for real photos/renders)
```

## Replacing placeholder images

Grid thumbnails and detail heroes are grayscale **SVG** placeholders under
`public/images/projects/`. Because Next's image optimizer can't rasterize SVG
without `sharp`, every placeholder `<Image>` carries an `unoptimized` prop so it
is served as a plain static file.

To use real photography / renders:

1. Drop `.jpg` / `.webp` files into `public/images/projects/` and update the
   `thumbSrc` / `heroSrc` paths in `src/content/projects.ts` (the grid → hero
   morph keys off each project's `slug`, so no component edits are needed).
2. Remove the `unoptimized` prop from the three `<Image>` components
   (`ProjectGrid.tsx`, `ProjectHero.tsx`, `about/page.tsx`) to get full
   `next/image` optimization (AVIF/WebP, responsive sizes).
3. For optimized images in a **production** build, install sharp:
   `npm install sharp`.

## Notes on the build spec

- The requested `claude.md` guideline file was **not present** in the project
  directory, so the build follows the `architectural-portfolio-builder` skill
  guidelines: GPU-only (`transform`/`opacity`) animations, hover logic gated
  behind `(hover: hover) and (pointer: fine)`, `dvh` units for full-page views,
  a 2-col mobile grid, `next/image` everywhere, `generateMetadata` + JSON-LD.
- Forms use `mailto:attilakovacs094@gmail.com` — they open the visitor's mail
  client with the fields prefilled; nothing is sent server-side. Add an API
  route / form service later if you want direct delivery.
