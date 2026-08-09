/**
 * The hero sequence's captions, grouped by the image they belong to.
 *
 * Most images carry one line. Two carry a pair: the second lands a beat after
 * the first, under it, and the first dims as it starts — so "ÉPÍTÉSZET" and
 * "BELSŐÉPÍTÉSZET" read as one thought in two parts rather than as two
 * separate images' worth of caption.
 *
 * The list is the studio's disciplines, so it is not `mainTiles` — the tiles
 * name five services, these name seven.
 */
export const captionGroups: readonly (readonly string[])[] = [
  ['Vizualizáció'],
  ['Építészet', 'Belsőépítészet'],
  ['Videográfia', 'Fotográfia'],
  ['Grafikai tervezés'],
  ['3D nyomtatás'],
];

/** Every line, in order — what the finished stack reads as. */
export const captionLines: string[] = captionGroups.flatMap((g) => [...g]);

/**
 * Lines that are not plain white.
 *
 * Keyed by the line itself rather than by its row, so the colour travels with
 * the word and cannot drift onto its neighbour the next time the list is
 * re-ordered. The lookup is exact — "Építészet" does not colour
 * "Belsőépítészet".
 */
const captionColors: Record<string, string> = {
  // 20% grey, read as printers read it: a fifth of the way from white to
  // black, so the word sets a shade softer than the rest of the stack. It
  // multiplies with the line's opacity, which is what actually holds the
  // parked lines back.
  Építészet: '#cccccc',
};

export function captionColor(line: string): string {
  return captionColors[line] ?? '#ffffff';
}

/** How many lines precede group `i`, so a line's place in the stack can be
 *  found from the image it belongs to. */
export function linesBefore(group: number): number {
  let n = 0;
  for (let i = 0; i < group; i += 1) n += captionGroups[i].length;
  return n;
}
