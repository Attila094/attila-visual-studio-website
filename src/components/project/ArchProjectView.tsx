'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion, type MotionValue } from 'framer-motion';
import {
  ARCH_SECTIONS,
  ARCH_SECTION_LABELS,
  type ArchNote,
  type ArchProject,
  type ArchSectionId,
  type ArchVideo,
} from '@/content/architectureProjects';
import { FrameSequence, ScrubScene, Staged } from './ScrubScene';
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
/** Under every bar, over everything else: where the cap above the stack sits.
 *  See <StackCap>. */
const CAP_Z = 34;
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
      {index === 0 && <StackCap />}

      <div
        className="sticky bg-ink shadow-[inset_0_-1px_0_rgba(255,255,255,0.08)]"
        style={{ top, height: BAR_H, zIndex: 40 - index }}
      >
        {/* The whole bar is the link, not just the words in it: once six of
            them are stacked they are the page's table of contents, and a
            target one line tall and one column wide is a target nobody hits.
            The tint goes on the link rather than on the bar, so what stays
            opaque stays opaque — a translucent background here would let the
            page show through the one thing that has to hide it. */}
        <a
          href={`#${id}`}
          className={`${GRID} group h-full items-center transition-colors hover:bg-white/[0.05]`}
        >
          <RiseLine className={COL_TITLE}>
            <SectionTitle n={n} label={ARCH_SECTION_LABELS[id]} />
          </RiseLine>
        </a>
      </div>

      {bare ? children : <div className={`${GRID} pb-16 pt-6`}>{children}</div>}

      {rest}
    </section>
  );
}

/** Where a section's body parks: the foot of its own bar in the stack. */
const stickUnder = (index: number) => STACK_TOP + (index + 1) * BAR_H;

/**
 * The strip above the stack.
 *
 * The bars park clear of the site's own fixed chrome, which leaves the top 64
 * pixels of the window belonging to nobody: a paragraph on its way out of the
 * page would duck behind the first bar and then come back into view above it,
 * which reads as the stack leaking. This covers that strip in the page's own
 * black for as long as the stack is up.
 *
 * It is nothing in the layout — a zero-height box with its sheet hanging out
 * below it — and sticky at the very top of the FIRST section, which runs to
 * the foot of the document, so once it is up it stays up. Until then it sits
 * exactly over that section's own bar row, which is page-coloured and empty,
 * and is therefore invisible: it is under every bar, so the title it passes
 * over is drawn straight back on top of it.
 */
function StackCap() {
  return (
    <div aria-hidden className="sticky top-0 h-0" style={{ zIndex: CAP_Z }}>
      <div className="bg-ink" style={{ height: STACK_TOP }} />
    </div>
  );
}

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
        {project.video ? (
          <HeroFilm video={project.video} alt={project.alt} />
        ) : project.cover ? (
          <Image
            src={project.cover.src}
            alt={project.alt}
            fill
            sizes="100vw"
            priority
            unoptimized={shouldBypassOptimizer(project.cover.src)}
            className="object-cover"
          />
        ) : (
          <PlateLabel>Placeholder for image or video</PlateLabel>
        )}

        {/* Only where there is a picture to darken — over a bare plate the
            scrim would just be a second grey. */}
        {(project.cover || project.video) && (
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

/**
 * The hero's film.
 *
 * It plays by itself, so it is muted — which is not a style choice: a browser
 * will not start a film with sound on its own, and asking it to only gets the
 * poster left up. Muted, looping and inline, which is the whole of what makes
 * an autoplaying background film work on a phone as well as a desktop.
 *
 * `autoPlay` is not in the markup. It is started from an effect instead, so
 * the server and the first client render agree on the attributes and nothing
 * has to be reconciled on hydration — and so that a reader who has asked for
 * less motion is not overruled. For them it does not start: the poster stays
 * up and the film gets its own controls, which is a film offered rather than
 * a film imposed.
 */
function HeroFilm({ video, alt }: { video: ArchVideo; alt: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduce) return;
    // A browser that refuses anyway leaves the poster up, which is a perfectly
    // good hero — so there is nothing to handle but the unhandled rejection.
    void el.play().catch(() => {});
  }, [reduce]);

  return (
    <video
      ref={ref}
      src={video.src}
      poster={video.poster}
      width={video.width}
      height={video.height}
      muted
      loop
      playsInline
      controls={reduce === true}
      // Enough to size and show the poster; the bytes follow when it plays,
      // so a reader who never sets it going never pays for the film.
      preload="metadata"
      aria-label={alt}
      className="absolute inset-0 h-full w-full object-cover"
    />
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

/* ── The images band ───────────────────────────────────────────────────────────
   "IMAGES — horizontally scrollable and dragable": a row you throw sideways
   with the wheel or drag with the pointer, running off the right-hand edge of
   the page, so that it is plain there is more of it than the window holds.

   Until a project has its stills the row holds plates at the two shapes the
   finished band will — upright and across — rather than one long empty bar.
   A band of the right height, with the right number of things in it and the
   right amount of it hanging off the edge, is the only kind of placeholder
   that says anything about what it is standing in for. */

/**
 * The shapes the placeholder row runs through, in order.
 *
 * Deliberately not a repeating pair: upright, across, upright reads as a
 * pattern, and a set of photographs never is one.
 */
const BAND_SHAPES = ['4 / 3', '3 / 4', '4 / 3', '4 / 3', '3 / 4', '4 / 3', '3 / 4', '3 / 4'];

/** One height for the band at any width, whatever is in it: the plates and the
 *  real stills are the same row, and only their widths differ. */
const BAND_H = 'h-44 sm:h-56 lg:h-64';

function ImagesBand({ project }: { project: ArchProject }) {
  const images = project.strip ?? [];
  return (
    <div className="px-[5px] py-[5px]">
      <DragRow>
        {images.length > 0
          ? images.map((img) => (
              // The box takes the render's own proportions, so an upright shot
              // of a room stands upright in the row and nothing is cropped to
              // make the band tidy. It is also the shape the row holds open
              // while the file is still coming, which is why the dimensions
              // travel with the picture.
              <div
                key={img.src}
                className={`relative ${BAND_H} shrink-0 overflow-hidden bg-white/[0.06]`}
                style={{ aspectRatio: `${img.width} / ${img.height}` }}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  // The band is 256px tall at its tallest, so the widest of
                  // these sets about 345 — a long way under the render it is
                  // cut from, which is the whole point of going through the
                  // optimiser rather than shipping the source.
                  sizes="(min-width: 1024px) 345px, (min-width: 640px) 300px, 240px"
                  unoptimized={shouldBypassOptimizer(img.src)}
                  draggable={false}
                  className="pointer-events-none object-cover"
                />
              </div>
            ))
          : BAND_SHAPES.map((shape, i) => (
              <div
                key={i}
                aria-hidden
                className={`${BAND_H} shrink-0 bg-white/[0.06]`}
                style={{ aspectRatio: shape }}
              />
            ))}
      </DragRow>
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

   The fourth column is left empty on purpose: the row is the map and the town
   beside it, and a second heading in between was only ever a placeholder with
   nothing behind it.

   Where the project has a line animation for this section, the whole row parks
   under the stack and the scroll draws it: the country comes out in outline,
   the note arrives beside it as it does, and the pin drops on the town last.
   Where it has not, the row is the plate the design calls for and the note
   arrives as it is scrolled to, as everywhere else. */
function Helyszin({ project, index, children }: SectionProps) {
  const sequence = project.sequences?.helyszin;
  const notes = project.notes?.helyszin;

  if (!sequence) {
    return (
      <StackSection id="helyszin" n={2} index={index} rest={children}>
        <Rise delay={BODY_DELAY} className={COL_1_3}>
          <Plate ratio="aspect-[16/10]">Placeholder for scrollable animation</Plate>
        </Rise>
        <div className={COL_5}>
          <Notes note={notes?.[0]} fallbackHeading="Település" cue={nth(1)} />
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
              <FrameSequence sequence={sequence} progress={progress} />
            </div>
            <div className={COL_5}>
              <Notes
                note={notes?.[0]}
                fallbackHeading="Település"
                cue={sceneCue(progress, 0.32)}
              />
            </div>
          </div>
        )}
      </ScrubScene>
    </StackSection>
  );
}

/* ── 03 Beépítés Beépítés ───────────────────────────────────────────────────────────
   The plate steps right into columns two to four; the fifth carries the note
   and, beneath it, the meta table again.

   Where the project has an animation for this section the row parks under the
   stack and the scroll plays it — the site plan unrolls and the maquette comes
   up off it — with the note and the table arriving beside it as it builds.
   Where it has not, the row is the plate the design calls for. */
function Beepites({ project, index, children }: SectionProps) {
  const sequence = project.sequences?.beepites;
  const note = project.notes?.beepites?.[0];

  if (!sequence) {
    return (
      <StackSection id="beepites" n={3} index={index} rest={children}>
        <Rise delay={BODY_DELAY} className={COL_2_4}>
          <Plate ratio="aspect-[16/10]">Placeholder for scrollable animation</Plate>
        </Rise>
        <div className={`${COL_5} space-y-8`}>
          <Notes note={note} fallbackHeading="Beépítési koncepció" cue={nth(1)} />
          <MetaTable project={project} cue={nth(3)} />
        </div>
      </StackSection>
    );
  }

  return (
    <StackSection id="beepites" n={3} index={index} rest={children} bare>
      <ScrubScene stick={stickUnder(index)}>
        {(progress) => (
          <div className={`${GRID} pb-16 pt-6`}>
            <div className={COL_2_4}>
              <FrameSequence sequence={sequence} progress={progress} />
            </div>
            <div className={`${COL_5} space-y-8`}>
              <Notes
                note={note}
                fallbackHeading="Beépítési koncepció"
                cue={sceneCue(progress, 0.18)}
              />
              <MetaTable project={project} cue={sceneCue(progress, 0.5)} />
            </div>
          </div>
        )}
      </ScrubScene>
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
          note={project.notes?.tomegformalas?.[0]}
          fallbackHeading="Beépítési koncepció"
          cue={nth(2)}
        />
      </div>
      <div className={COL_4}>
        <Notes note={project.notes?.tomegformalas?.[1]} fallbackHeading="Beépítési koncepció" cue={nth(4)} />
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
        <Notes note={project.notes?.rajzok?.[0]} fallbackHeading="Beépítési koncepció" cue={nth(1)} />
      </div>
      <Rise delay={BODY_DELAY} className={COL_2_4}>
        <Carousel images={project.media?.rajzok} alt={project.alt} ratio="aspect-[16/9]" />
      </Rise>
      <div className={COL_5}>
        <Notes note={project.notes?.rajzok?.[1]} fallbackHeading="Beépítési koncepció" cue={nth(3)} />
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
 * One of a section's note columns: a heading and the paragraph under it — or
 * the plain admission that the paragraph is not written yet.
 *
 * The heading is the template's, because the slot is the template's: "Település"
 * is the fifth column of 02 wherever you are on the site. A project may still
 * override it where its own note is about something else.
 *
 * Heading and body are separate lines in the queue — the heading arrives, then
 * what it introduces, which is the order they are read in.
 */
function Notes({
  note,
  fallbackHeading,
  cue,
}: {
  note?: ArchNote;
  fallbackHeading: string;
  cue: Cue;
}) {
  return (
    <div>
      <Cued cue={cue}>
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
          {note?.heading ?? fallbackHeading}
        </h3>
      </Cued>
      <div className="mt-2">
        <Body text={note?.body} cue={after(cue, 1)} />
      </div>
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
 *
 * The grab cursor used to be behind an `(hover:hover) and (pointer:fine)`
 * query written without the spaces CSS needs, so the rule was thrown away and
 * no scroller on the site has shown a grab cursor. It is unguarded now: a
 * `cursor` declaration is inert on a device with no pointer to draw.
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
      className="flex gap-[5px] overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] cursor-grab active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
    >
      {children}
    </motion.div>
  );
}
