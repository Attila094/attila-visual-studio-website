/**
 * The four enquiry tiles on the contact page.
 *
 * Each one stands for a services-page category and opens that category's own
 * items, so the two pages can't drift: only the cover art and the heading live
 * here, the contents are read straight out of `services.ts` via `serviceId`.
 */
export interface ContactCategory {
  index: string;
  /** Tile heading. */
  label: string;
  /** Cover art, kept from the original ten-tile layout. */
  image: string;
  /** The `Service.id` whose items open inside this tile. */
  serviceId: string;
}

export const contactCategories: ContactCategory[] = [
  {
    index: '01',
    label: 'Látványtervezés',
    image: '/projects/sequence/rad-01.webp',
    serviceId: 'latvanytervezes',
  },
  {
    index: '02',
    label: 'Belsőépítészet',
    image: '/projects/sequence/heviz-01.webp',
    serviceId: 'belsoepiteszet',
  },
  {
    index: '03',
    label: 'Építészet',
    image: '/projects/sequence/misina-01.webp',
    serviceId: 'epiteszeti-tervezes',
  },
  {
    index: '04',
    label: 'Fotózás & Videózás',
    image: '/projects/sequence/helikon-01.webp',
    serviceId: 'foto-video',
  },
];
