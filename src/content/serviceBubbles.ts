// Local content source for the expanding "bubble" service tiles.
// In a real setup this could just as easily be JSON / MD / MDX frontmatter —
// the component only relies on the shape below and `subServices.length`.

export interface ServiceBubble {
  id: string;
  index: string;
  title: string;
  /** Drives the sideways hover expansion via its `.length`. */
  subServices: string[];
}

export const serviceBubbles: ServiceBubble[] = [
  {
    id: 'epiteszet',
    index: '01',
    title: 'Építészet',
    subServices: ['Koncepció', 'Engedélyezési terv', 'Kiviteli terv'],
  },
  {
    id: 'belsoepiteszet',
    index: '02',
    title: 'Belsőépítészet',
    subServices: ['Lakótér', 'Iroda', 'Vendéglátás', 'Retail'],
  },
  {
    id: 'vizualizacio',
    index: '03',
    title: 'Vizualizáció',
    subServices: ['Still', 'Animáció', '360° panoráma'],
  },
  {
    id: 'grafika',
    index: '04',
    title: 'Grafika',
    subServices: ['Arculat', 'Nyomdai', 'Prezentáció'],
  },
  {
    id: 'foto-video',
    index: '05',
    title: 'Fotó & Videó',
    subServices: ['Fotó', 'Videó', 'Drón'],
  },
];
