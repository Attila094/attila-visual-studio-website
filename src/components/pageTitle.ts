import { Bebas_Neue } from 'next/font/google';

const bebas = Bebas_Neue({ subsets: ['latin', 'latin-ext'], weight: '400' });

/**
 * The page title, as set on the about page's ABOUT: Bebas, bold, tight
 * tracking, scaling with the viewport. Shared so the four pages can't drift
 * apart — change it here and every title follows.
 */
export const PAGE_TITLE_CLASS = `${bebas.className} text-[clamp(2.5rem,9.8vw,9rem)] uppercase leading-none tracking-[0.01em] text-white`;

/** Bebas ships a single weight, so the bold has to be inline — next/font's own
 *  class carries `font-weight: 400` at the same specificity and beats a
 *  `font-bold` utility. */
export const PAGE_TITLE_STYLE = { fontWeight: 700 } as const;

/** Top padding of a titled page, so all four titles start on the same line. */
export const PAGE_TOP_PAD = 'pt-[4.375rem] sm:pt-20';
