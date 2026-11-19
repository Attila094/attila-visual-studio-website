'use client';

import { useRef, useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, type MotionValue } from 'framer-motion';
import {
  ARCH_SECTIONS,
  ARCH_SECTION_LABELS,
  type ArchNote,
  type ArchProject,
  type ArchSectionId,
} from '@/content/architectureProjects';
import { LineSequence, ScrubScene, Staged } from './ScrubScene';
import { shouldBypassOptimizer } from '@/lib/image';
import { projectLayoutId } from '@/lib/motion';
import { WORK_HREF } from '@/lib/anchors';
import {
  BODY_DELAY,
  COL_1,
  COL_1_2,
  COL_1_3,
  COL_1_4,
  COL_2_4,
  COL_3,
  COL_4,
  COL_5,
  COL_TITLE,
  GRID,
  Rise,
  RiseLine,
  SectionTitle,
} from './projectGrid';

/**
 * The project detail page, as `project site template.jpg` sets it out.
 *
 * Six numbered sections down one five-column grid, each announced in the first
 * column and filled from the second across — the plates step inward section by
 * section (01 prose only, 02 left, 03 centre, 04 left again, 05 centre, 06 wide)
 * which is what gives the page its rhythm as you scroll.
 *
 * Almost every slot in the reference is a placeholder, and so is almost every
 * slot here: these projects have a cover shot each and nothing else yet. Rather
 * than invent imagery or copy, a slot with nothing behind it draws the plate the
 * design asks for and says `hamarosan` — the same word the menu tiles already
 * use for a project whose work is not up yet.
 */
export function ArchProjectView({ project }: { project: ArchProject }) {
  return (
    <article className="bg-ink text-white">
      <Hero project={project} />
      <SectionNav />
      <ImagesBand project={project} />
      <SectionStack project={project} />
    </article>
  );
}

/* ── The stack ─────────────────────────────────────────────────────────────*/

/** Clear of the fixed chrome — the CONTACT pill's foot sits at 56px. */
const STACK_TOP = 64;
/** A bar is its title and nothing else: one 20px line with 10px either side. */
const BAR_H = 40;
/** The beat between one text element and the next within a section, in seconds
 *  where the section arrives on its own, and in scene progress where it is
 *  scrubbed by the scroll. */
const STEP = 0.09;
const AT_STEP = 0.12;

/**
 * What brings a text element in.
 *
 * Most of the page is read at the reader's own pace, so a line arrives when it
 * is scrolled to and stays. Inside a parked scene nothing is "scrolled to" —
 * the whole block is on screen from the first frame — so there the lines are
 * pinned to the scene's own progress instead. Everything that sets text takes
 * one of these and passes the next on to what it contains, which is what keeps
 * a column's order the same under either régime.
 */
type Cue =
  | { kind: 'scroll'; delay: number }
  | { kind: 'scrub'; progress: MotionValue<number>; at: number };

/** The nth text element of an ordinary section. */
const nth = (n: number): Cue => ({ kind: 'scroll', delay: n * STEP });

/** A text element at a given point of a scrubbed scene. */
const sceneCue = (progress: MotionValue<number>, at: number): Cue => ({
  kind: 'scrub',
  progress,
  at,
});

/** The cue n places after this one. */
const after = (cue: Cue, n: number): Cue =>
  cue.kind === 'scroll'
    ? { kind: 'scroll', delay: cue.delay + n * STEP }
    : { kind: 'scrub', progress: cue.progress, at: cue.at + n * AT_STEP };

function Cued({
  cue,
  className,
  children,
}: {
  cue: Cue;
  className?: string;
  children: ReactNode;
}) {
  if (cue.kind === 'scrub') {
    return (
      <Staged progress={cue.progress} at={cue.at} className={className}>
        {children}
      </Staged>
    );
  }
  return (
    <RiseLine delay={cue.delay} className={className}>
      {children}
    </RiseLine>
  );
}

type SectionProps = {
  project: ArchProject;
  /** Its place in the stack — which is what sets the height its bar parks at. */
  index: number;
  /** Everything that follows it on the page, nested inside it. See below. */
  children: ReactNode;
};

/**
 * The six sections, each one wrapping the rest of the page.
 *
 * A sticky element can never leave its own parent, so six sections side by side
 * would each pin their bar and then have it shoved back off the top by the
 * section below — the bars would take turns rather than pile up. Nesting makes
 * every section's box run to the foot of the document, which is what lets its
 * bar hold its place for the whole of the rest of the scroll.
 *
 * Built from the inside out, so the order here is the order down the page.
 */
function SectionStack({ project }: { project: ArchProject }) {
  const parts = [Leiras, Helyszin, Beepites, Tomegformalas, Rajzok, Latvanyok];
  return (
    <>
      {parts.reduceRight<ReactNode>(
        (rest, Part, i) => (
          <Part key={ARCH_SECTIONS[i]} project={project} index={i}>
            {rest}
          </Part>
        ),
        <Closing />,
      )}
    </>
  );
}

/**
 * A numbered section: a bar that parks, and a body that scrolls away behind it.
 *
 * The bar is the only part that stays. Its own body passes underneath it on the
 * way up, and so does everything in the sections below, because the bar is
 * opaque and sits above them — which is what reads as the section shrinking
 * into its title rather than merely scrolling past.
 *
 * Earlier bars take the higher `z-index`: they never overlap each other (each
 * parks one bar-height lower than the last), but each must stay in front of all
 * the content that comes after it. Everything stays well under the site chrome's
 * own z-70.
 */
function StackSection({
  id,
  n,
  index,
  children,
  rest,
  bare = false,
}: {
  id: ArchSectionId;
  n: number;
  index: number;
  children: ReactNode;
  rest: ReactNode;
  /** The section lays out its own body — it has a scene to park, and the grid
   *  belongs inside that rather than around it. */
  bare?: boolean;
}) {
  const top = STACK_TOP + index * BAR_H;
  return (
    // `scrollMarginTop` matches the parked height exactly, so a jump from the
    // 01–06 strip lands the section with its bar already in its place in the
    // stack rather than underneath it.
    <section id={id} className="relative" style={{ scrollMarginTop: top }}>
      <div
        className="sticky bg-ink shadow-[inset_0_-1px_0_rgba(255,255,255,0.08)]"
        style={{ top, height: BAR_H, zIndex: 40 - index }}
      >
        <div className={`${GRID} h-full items-center`}>
          <RiseLine className={COL_TITLE}>
            <SectionTitle n={n} label={ARCH_SECTION_LABELS[id]} />
          </RiseLine>
        </div>
      </div>

      {bare ? children : <div className={`${GRID} pb-16 pt-6`}>{children}</div>}

      {rest}
    </section>
  );
}

/** Where a section's body parks: the foot of its own bar in the stack. */
const stickUnder = (index: number) => STACK_TOP + (index + 1) * BAR_H;

/* ── 0 — Hero ──────────────────────────────────────────────────────────────
   Full width inside the grid's own 5px margin, the title ranged left along
   its foot, as the reference has it. */
function Hero({ project }: { project: ArchProject }) {
  return (
    <div className="px-[5px] pt-[5px]">
      {/* The shared element: the menu tile that opened this page carries the
          same `layoutId`, so it grows into the hero rather than cutting to it.
          Only where there is a cover — a tile on a bare plate has no picture to
          hand over. */}
      <motion.div
        layoutId={project.cover ? projectLayoutId(project.slug) : undefined}
        className="relative h-[72vh] w-full overflow-hidden bg-white/[0.06]"
        style={{ willChange: 'transform' }}
      >
        {project.cover ? (
          <Image
            src={project.cover}
            alt={project.alt}
            fill
            sizes="100vw"
            priority
            unoptimized={shouldBypassOptimizer(project.cover)}
            className="object-cover"
          />
        ) : (
          <PlateLabel>Placeholder for image or video</PlateLabel>
        )}

        {/* Only where there is a picture to darken — over a bare plate the
            scrim would just be a second grey. */}
        {project.cover && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
        )}

        {/* Over the title rather than in the top-left corner: the site's own
            CONTACT pill is fixed there, and a back link underneath it is a
            link nobody can press. */}
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
          <Link
            href={WORK_HREF}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/70 transition-colors hover:text-white"
          >
            <span aria-hidden>←</span> Vissza
          </Link>
          <h1 className="mt-3 text-2xl font-semibold uppercase tracking-[0.14em] text-white sm:text-4xl lg:text-5xl">
            {project.title}
          </h1>
        </div>
      </motion.div>
    </div>
  );
}

/* ── The 01–06 jump strip ───────────────────────────────────────────────────
   Six evenly spread links straight under the hero. A real nav, not a caption
   row: each one takes you to its section, which is the only way a page this
   long is navigable at all. */
function SectionNav() {
  return (
    <nav aria-label="Szakaszok" className="px-[5px] pt-[5px]">
      <ul className="grid grid-cols-3 gap-[5px] sm:grid-cols-6">
        {ARCH_SECTIONS.map((id, i) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className="flex items-baseline gap-2 bg-white/[0.06] px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <span className="tabular-nums text-white/40">{String(i + 1).padStart(2, '0')}</span>
              <span className="truncate">{ARCH_SECTION_LABELS[id]}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/* ── The images band ───────────────────────────────────────────────────────
   "IMAGES — horizontally scrollable and dragable". Until a project has a set
   of stills, this is the band itself labelled, rather than a row of empty
   frames pretending to be one. */
function ImagesBand({ project }: { project: ArchProject }) {
  const images = project.strip ?? [];
  return (
    <div className="px-[5px] py-[5px]">
      {images.length > 0 ? (
        <DragRow>
          {images.map((src) => (
            <div key={src} className="relative h-56 w-80 shrink-0 overflow-hidden bg-white/[0.06]">
              <Image
                src={src}
                alt={project.alt}
                fill
                sizes="320px"
                unoptimized={shouldBypassOptimizer(src)}
                draggable={false}
                className="pointer-events-none object-cover"
              />
            </div>
          ))}
        </DragRow>
      ) : (
        <div className="grid h-40 w-full place-items-center bg-white/[0.06] text-center">
          <div>
            <p className="text-xl font-semibold uppercase tracking-[0.2em] text-white/70">Images</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-white/40">
              horizontally scrollable and dragable
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── 01 Leírás ─────────────────────────────────────────────────────────────
   The meta table across the fourth and fifth columns; the description under it
   in the fourth alone, as the reference sets it. */
function Leiras({ project, index, children }: SectionProps) {
  return (
    <StackSection id="leiras" n={1} index={index} rest={children}>
      <div className="md:col-span-2 md:col-start-4">
        <MetaTable project={project} cue={nth(1)} />
      </div>
      <div className={COL_4}>
        <Body text={project.description} cue={nth(4)} />
      </div>
    </StackSection>
  );
}

/* ── 02 Helyszín ───────────────────────────────────────────────────────────
   The map holds the left three columns; "Település" sits out in the fifth and
   the concept note in the fourth.

   Where the project has a line animation for this section, the whole row parks
   under the stack and the scroll draws it: the country comes out in outline,
   the two notes arrive one after the other as it does, and the pin drops on
   the town last. Where it has not, the row is the plate the design calls for
   and the notes arrive as they are scrolled to, as everywhere else. */
function Helyszin({ project, index, children }: SectionProps) {
  const sequence = project.sequences?.helyszin;
  const notes = project.notes?.helyszin;

  if (!sequence) {
    return (
      <StackSection id="helyszin" n={2} index={index} rest={children}>
        <Rise delay={BODY_DELAY} className={COL_1_3}>
          <Plate ratio="aspect-[16/10]">Placeholder for scrollable animation</Plate>
        </Rise>
        <div className={COL_4}>
          <Notes notes={notes} fallbackHeading="Beépítési koncepció" cue={nth(1)} />
        </div>
        <div className={COL_5}>
          <Notes notes={undefined} fallbackHeading="Település" cue={nth(3)} />
        </div>
      </StackSection>
    );
  }

  return (
    <StackSection id="helyszin" n={2} index={index} rest={children} bare>
      <ScrubScene stick={stickUnder(index)}>
        {(progress) => (
          <div className={`${GRID} pb-16 pt-6`}>
            <div className={COL_1_3}>
              <LineSequence sequence={sequence} progress={progress} />
            </div>
            <div className={COL_4}>
              <Notes
                notes={notes}
                fallbackHeading="Beépítési koncepció"
                cue={sceneCue(progress, 0.32)}
              />
            </div>
            <div className={COL_5}>
              <Notes
                notes={undefined}
                fallbackHeading="Település"
                cue={sceneCue(progress, 0.56)}
              />
            </div>
          </div>
        )}
      </ScrubScene>
    </StackSection>
  );
}

/* ── 03 Beépítés ───────────────────────────────────────────────────────────
   The plate steps right into columns two to four; the fifth carries the note
   and, beneath it, the meta table again. */
function Beepites({ project, index, children }: SectionProps) {
  return (
    <StackSection id="beepites" n={3} index={index} rest={children}>
      <Rise delay={BODY_DELAY} className={COL_2_4}>
        <Plate ratio="aspect-[16/10]">Placeholder for scrollable animation</Plate>
      </Rise>
      <div className={`${COL_5} space-y-8`}>
        <Notes notes={project.notes?.beepites} fallbackHeading="Beépítési koncepció" cue={nth(1)} />
        <MetaTable project={project} cue={nth(3)} />
      </div>
    </StackSection>
  );
}

/* ── 04 Tömegformálás ──────────────────────────────────────────────────────
   Back to the left: the plate on columns one and two with a justified
   paragraph under it, and a note in each of the third and fourth. */
function Tomegformalas({ project, index, children }: SectionProps) {
  return (
    <StackSection id="tomegformalas" n={4} index={index} rest={children}>
      <div className={COL_1_2}>
        <Rise delay={BODY_DELAY}>
          <Plate ratio="aspect-[4/3]">Placeholder for scrollable animation</Plate>
        </Rise>
        <div className="mt-4 text-justify">
          <Body text={project.description} cue={nth(1)} />
        </div>
      </div>
      <div className={COL_3}>
        <Notes
          notes={project.notes?.tomegformalas}
          fallbackHeading="Beépítési koncepció"
          cue={nth(2)}
        />
      </div>
      <div className={COL_4}>
        <Notes notes={undefined} fallbackHeading="Beépítési koncepció" cue={nth(4)} />
      </div>
    </StackSection>
  );
}

/* ── 05 Rajzok ─────────────────────────────────────────────────────────────
   A note in the first column, the carousel across two to four, a second note
   out in the fifth. */
function Rajzok({ project, index, children }: SectionProps) {
  return (
    <StackSection id="rajzok" n={5} index={index} rest={children}>
      <div className={COL_1}>
        <Notes notes={project.notes?.rajzok} fallbackHeading="Beépítési koncepció" cue={nth(1)} />
      </div>
      <Rise delay={BODY_DELAY} className={COL_2_4}>
        <Carousel images={project.media?.rajzok} alt={project.alt} ratio="aspect-[16/9]" />
      </Rise>
      <div className={COL_5}>
        <Notes notes={undefined} fallbackHeading="Beépítési koncepció" cue={nth(3)} />
      </div>
    </StackSection>
  );
}

/* ── 06 Látványok ──────────────────────────────────────────────────────────
   The widest plate on the page — four columns — with the closing paragraph
   ranged under its left edge. */
function Latvanyok({ project, index, children }: SectionProps) {
  return (
    <StackSection id="latvanyok" n={6} index={index} rest={children}>
      <div className={COL_1_4}>
        <Rise delay={BODY_DELAY}>
          <Carousel images={project.media?.latvanyok} alt={project.alt} ratio="aspect-[2/1]" />
        </Rise>
        <div className="mt-4 max-w-xl text-justify">
          <Body text={project.description} cue={nth(1)} />
        </div>
      </div>
    </StackSection>
  );
}

/* ── The closing block ─────────────────────────────────────────────────────
   The foot of the page, and the one block with no bar of its own: it is where
   the stack is read from, not another thing to add to it. */
function Closing() {
  return (
    <section className={`${GRID} border-t border-white/10 py-14`}>
      <RiseLine className={COL_TITLE}>
        <p className="text-sm uppercase tracking-wide text-white/50">Kapcsolat</p>
      </RiseLine>
      <RiseLine delay={STEP} className="md:col-span-2 md:col-start-4">
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-ink transition-transform duration-300 hover:-translate-y-0.5"
        >
          Hasonló projektet tervezel? Beszéljünk <span aria-hidden>↗</span>
        </Link>
      </RiseLine>
    </section>
  );
}

/* ── Shared pieces ─────────────────────────────────────────────────────────*/

/** A grey plate where the design calls for media that does not exist yet. */
function Plate({ children, ratio }: { children: ReactNode; ratio: string }) {
  return (
    <div className={`relative w-full ${ratio} bg-white/[0.08]`}>
      <PlateLabel>{children}</PlateLabel>
    </div>
  );
}

function PlateLabel({ children }: { children: ReactNode }) {
  return (
    <span className="absolute inset-0 grid place-items-center px-4 text-center">
      <span className="text-[11px] uppercase tracking-[0.2em] text-white/45 sm:text-sm">
        {children}
      </span>
    </span>
  );
}

/**
 * A plate with prev/next under its right edge, as the reference draws it.
 *
 * The arrows are rendered only where there is more than one image to step
 * between — controls over a single picture, or over a placeholder, are a
 * promise the page cannot keep.
 */
function Carousel({
  images,
  alt,
  ratio,
}: {
  images?: string[];
  alt: string;
  ratio: string;
}) {
  const [i, setI] = useState(0);
  const list = images ?? [];
  const step = (d: number) => setI((v) => (v + d + list.length) % list.length);

  if (list.length === 0) return <Plate ratio={ratio}>Placeholder for image or video</Plate>;

  return (
    <div>
      <div className={`relative w-full ${ratio} overflow-hidden bg-white/[0.08]`}>
        <Image
          key={list[i]}
          src={list[i]}
          alt={alt}
          fill
          sizes="(min-width: 768px) 60vw, 100vw"
          unoptimized={shouldBypassOptimizer(list[i])}
          className="object-cover"
        />
      </div>
      {list.length > 1 && (
        <div className="mt-3 flex justify-end gap-6">
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Előző kép"
            className="text-xl text-white/70 transition-transform hover:-translate-x-0.5 hover:text-white"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Következő kép"
            className="text-xl text-white/70 transition-transform hover:translate-x-0.5 hover:text-white"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * A titled paragraph, or the plain admission that it is not written yet.
 *
 * Heading and body are separate lines in the queue — the heading arrives, then
 * what it introduces, which is the order they are read in.
 */
function Notes({
  notes,
  fallbackHeading,
  cue,
}: {
  notes?: ArchNote[];
  fallbackHeading: string;
  cue: Cue;
}) {
  const list = notes?.length ? notes : [{ heading: fallbackHeading, body: '' }];
  return (
    <div className="space-y-6">
      {list.map((note, i) => (
        <div key={`${note.heading ?? ''}-${i}`}>
          {note.heading && (
            <Cued cue={after(cue, i * 2)}>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
                {note.heading}
              </h3>
            </Cued>
          )}
          <div className="mt-2">
            <Body text={note.body} cue={after(cue, i * 2 + 1)} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Body copy — or, with nothing to set, the same `hamarosan` the menu tiles
 *  use, rather than filler that reads like a description. */
function Body({ text, cue }: { text?: string; cue: Cue }) {
  return (
    <Cued cue={cue}>
      {text ? (
        <p className="text-sm leading-relaxed text-white/70">{text}</p>
      ) : (
        <p className="text-sm uppercase tracking-[0.2em] text-white/25">hamarosan</p>
      )}
    </Cued>
  );
}

/** helyszín / tervező / év. An unknown value prints an em dash: a blank row
 *  reads as a bug, and a plausible guess would be worse than either. */
function MetaTable({ project, cue }: { project: ArchProject; cue: Cue }) {
  const rows: [string, string | undefined, boolean][] = [
    ['helyszín', project.location, true],
    ['tervező', project.designer, true],
    ['év', project.year, false],
  ];
  return (
    <dl className="text-sm">
      {rows.map(([k, v, upper], i) => (
        <Cued
          key={k}
          cue={after(cue, i)}
          className="flex items-center justify-between border-b border-white/15 py-2"
        >
          <dt className="text-white/50">{k}</dt>
          <dd
            className={`tabular-nums ${upper ? 'uppercase tracking-wide' : ''} ${
              v ? 'text-white' : 'text-white/30'
            }`}
          >
            {v ?? '—'}
          </dd>
        </Cued>
      ))}
    </dl>
  );
}

/**
 * The images band's scroller: vertical wheel becomes horizontal scroll, and a
 * pointer drag scrolls too. Lifted from the menu's own tile row so the two
 * behave identically — a visitor who has dragged one has learned both.
 */
function DragRow({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startX: 0, startScroll: 0 });

  return (
    <motion.div
      ref={ref}
      onPointerDown={(e) => {
        const el = ref.current;
        if (!el) return;
        drag.current = { active: true, startX: e.clientX, startScroll: el.scrollLeft };
      }}
      onPointerMove={(e) => {
        const el = ref.current;
        if (!el || !drag.current.active) return;
        el.scrollLeft = drag.current.startScroll - (e.clientX - drag.current.startX);
      }}
      onPointerUp={() => {
        drag.current.active = false;
      }}
      onPointerLeave={() => {
        drag.current.active = false;
      }}
      className="flex gap-[5px] overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [@media(hover:hover)and(pointer:fine)]:cursor-grab [@media(hover:hover)and(pointer:fine)]:active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
    >
      {children}
    </motion.div>
  );
}
