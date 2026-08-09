/**
 * The studio's glass button.
 *
 * It carries no colour of its own — the saturated blur bends whatever is behind
 * it, the first inset is the lit near edge of a thick pane, the second its far
 * edge, and the drop shadow lifts it off the page. Shared so that every CONTACT
 * on the site is demonstrably the same button rather than four drifting copies
 * of one.
 */
export const GLASS_STYLE = {
  backgroundColor: 'rgba(255,255,255,0.15)',
  backdropFilter: 'blur(14px) saturate(180%)',
  WebkitBackdropFilter: 'blur(14px) saturate(180%)',
  boxShadow:
    'inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -1px 0 rgba(255,255,255,0.12), 0 10px 30px rgba(0,0,0,0.35)',
} as const;

/** Its edge. The hover is left to the caller — the About page's pair fade
 *  rather than brighten. */
export const GLASS_RING = 'ring-1 ring-inset ring-white/25';
