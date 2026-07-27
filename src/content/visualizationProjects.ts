// Placeholder dataset for the "02 Vizualizáció" pinned-scroll gallery.
// Images are generated inline as SVG data URIs so there are no asset files or
// network requests — swap `src` for a real /projects/*.webp when the render is
// ready and nothing else needs to change.

export type VizCategory = 'exterior' | 'interior' | 'product';

export interface VizProject {
  name: string;
  studio: string;
  location: string;
  category: VizCategory;
  /** Intrinsic size — deliberately mixed portrait / landscape / square. */
  width: number;
  height: number;
  src: string;
  alt: string;
}

/**
 * Builds a labelled gradient placeholder at an exact intrinsic size, so the
 * layout is genuinely exercised with dynamic aspect ratios.
 */
function placeholder(width: number, height: number, label: string, hue: number): string {
  const fontSize = Math.round(Math.min(width, height) / 9);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="hsl(${hue} 26% 34%)"/>
<stop offset="1" stop-color="hsl(${(hue + 40) % 360} 22% 12%)"/>
</linearGradient></defs>
<rect width="100%" height="100%" fill="url(#g)"/>
<text x="50%" y="50%" fill="rgba(255,255,255,0.38)" font-family="Helvetica,Arial,sans-serif" font-size="${fontSize}" letter-spacing="${fontSize / 8}" text-anchor="middle" dominant-baseline="middle">${label}</text>
<text x="50%" y="${50 + fontSize / 8}%" fill="rgba(255,255,255,0.18)" font-family="Helvetica,Arial,sans-serif" font-size="${fontSize / 2.4}" text-anchor="middle" dominant-baseline="middle">${width}×${height}</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

type Seed = [name: string, studio: string, location: string, category: VizCategory, w: number, h: number, hue: number];

// Mixed aspect ratios: 16/9, 3/4, 1/1, 3/2, 2/3, 4/5, 21/9 …
const SEEDS: Seed[] = [
  ['Helikon', 'csm architect', 'Keszthely', 'exterior', 1920, 1080, 205],
  ['Rád', 'CSM Architect', 'Rád', 'interior', 1200, 1600, 24],
  ['Hévíz', 'WHB', 'Hévíz', 'exterior', 1400, 1400, 168],
  ['Misina', 'CSM Architect', 'Pécs', 'exterior', 1800, 1200, 96],
  ['Szugló', 'WHB', 'Budapest', 'interior', 1000, 1500, 286],
  ['Újpest', 'csm architect', 'Budapest', 'interior', 1600, 900, 340],
  ['Hertelend', 'WHB', 'Hertelend', 'exterior', 1500, 1000, 130],
  ['Tab', 'CSM Architect', 'Tab', 'product', 1200, 1200, 42],
  ['Petrus', 'csm architect', 'Pécs', 'interior', 1080, 1350, 258],
  ['Rókus', 'WHB', 'Pécs', 'product', 2100, 900, 190],
];

export const visualizationProjects: VizProject[] = SEEDS.map(
  ([name, studio, location, category, width, height, hue]) => ({
    name,
    studio,
    location,
    category,
    width,
    height,
    src: placeholder(width, height, name.toUpperCase(), hue),
    alt: `${name} — ${studio}, ${location} (helykitöltő látványterv)`,
  }),
);
