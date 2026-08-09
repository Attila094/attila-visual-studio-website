/**
 * Row-span masonry, shared by the work galleries.
 *
 * The alternative is CSS multi-column, which packs beautifully and cannot let
 * one item span the others — and both galleries need exactly that, to open a
 * tile across the full width. So they stay real grids: 1px rows, no row gap,
 * and every tile claims as many rows as it is tall plus the gap it carries as
 * its own bottom margin. Each column then packs against whatever is above it in
 * that column alone, with no dead space, while the columns stay on their rails.
 */

/** The gap between tiles, in px. Supplied by each tile's own margin-bottom, so
 *  it has to be counted into the span rather than left to `row-gap`. */
export const MASONRY_GAP = 12;

/** How many 1px rows a tile of this shape needs at this width. */
export function masonryRowSpan(width: number, height: number, boxWidth: number) {
  if (!boxWidth || !width) return 1;
  return Math.max(1, Math.ceil(boxWidth * (height / width) + MASONRY_GAP));
}

/**
 * The width of one column and of the whole grid, read back from the resolved
 * `grid-template-columns`. Taking it from the browser rather than recomputing
 * it keeps the responsive column counts in the class list, where they belong.
 */
export function masonryTracks(el: HTMLElement) {
  const tracks = getComputedStyle(el)
    .gridTemplateColumns.split(' ')
    .map(parseFloat)
    .filter((n) => !Number.isNaN(n));
  return { column: tracks[0] ?? 0, full: el.clientWidth, count: tracks.length };
}
