'use client';

/**
 * Remembers that the hero's caption type-in has already run, so it plays on the
 * first load of the site and never again — surviving reloads and route changes,
 * unlike module state, which resets with every fresh document.
 *
 * sessionStorage, not localStorage: the intro is worth seeing once per visit,
 * not once per lifetime. Swap the store here to change that.
 *
 * Every access is guarded — Safari's private mode throws on storage access
 * rather than returning null, and an intro animation is never worth a crash.
 */
const KEY = 'avs:intro-typed';

function read(): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.sessionStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((n) => typeof n === 'number') : [];
  } catch {
    return [];
  }
}

/** Captions that have already typed themselves in during this visit. */
export function typedCaptions(): Set<number> {
  return new Set(read());
}

export function markCaptionTyped(index: number): void {
  if (typeof window === 'undefined') return;
  try {
    const all = new Set(read());
    all.add(index);
    window.sessionStorage.setItem(KEY, JSON.stringify([...all]));
  } catch {
    /* storage unavailable — the intro simply replays next load */
  }
}

/**
 * True once any caption has typed. The holds exist to give the type-in room to
 * play, so on a repeat load there is nothing to wait for and the sequence runs
 * without pausing.
 */
export function introAlreadyPlayed(): boolean {
  return read().length > 0;
}
