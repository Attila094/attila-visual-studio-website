/**
 * Next's image optimizer refuses SVG unless `dangerouslyAllowSVG` is enabled,
 * so the remaining SVG placeholders have to bypass it. Real rasters (.webp/.jpg
 * /.png) must NOT bypass it — otherwise a 2400px source is shipped untouched to
 * a small tile, with no responsive srcset.
 *
 * Pass the result to <Image unoptimized={...} /> and each image gets the right
 * treatment as placeholders are swapped for real photography.
 */
export function shouldBypassOptimizer(src: string): boolean {
  return src.toLowerCase().endsWith('.svg');
}
