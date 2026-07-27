// ---------------------------------------------------------------------------
// Logo line data — coordinates taken *verbatim* from "Attila lines.svg"
// (viewBox 2036 x 711, y-down). Each path in that file is a straight segment,
// so we only need its two endpoints + its stroke opacity (visual weight).
//
// Consumed by the 2D logo-draw intro (LogoDraw).
// ---------------------------------------------------------------------------

export const SVG_W = 2036;
export const SVG_H = 711;

export type RawLine = { a: [number, number]; b: [number, number]; o: number };

/** Endpoints copied 1:1 from the SVG <path> "M ax ay L bx by" commands. */
export const RAW_LINES: RawLine[] = [
  { a: [423.503, 693.5], b: [423.503, 17.5], o: 1.0 },
  { a: [794.503, 693.5], b: [794.503, 64.5], o: 1.0 },
  { a: [500.503, 17.5], b: [1109.5, 17.5], o: 0.25 },
  { a: [845.503, 693.5], b: [1454.5, 693.5], o: 0.25 },
  { a: [1545.5, 693.5], b: [1950.5, 693.5], o: 0.15 },
  { a: [1166.5, 642.5], b: [1166.5, 17.5], o: 1.0 },
  { a: [1352.5, 575.5], b: [1352.5, 17.5], o: 0.15 },
  { a: [1545.5, 693.5], b: [1545.5, 17.5], o: 1.0 },
  { a: [2018.5, 693.5], b: [2018.5, 17.5], o: 1.0 },
  { a: [17.5029, 692.625], b: [348.743, 118.9], o: 0.5 },
  { a: [1646.42, 650.825], b: [1977.66, 77.1], o: 0.5 },
];
