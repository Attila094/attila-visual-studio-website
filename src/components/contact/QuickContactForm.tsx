'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bebas_Neue, Montserrat } from 'next/font/google';
import { motion } from 'framer-motion';

const bebas = Bebas_Neue({ subsets: ['latin', 'latin-ext'], weight: '400' });
const montserrat = Montserrat({ subsets: ['latin', 'latin-ext'], weight: ['400', '500', '700'] });

/** One service the visitor has picked, shown as a tile in the basket. */
export interface QuickPick {
  /** Unique across categories — the same label can appear under two of them. */
  key: string;
  label: string;
  /** The category it was picked from, for the message. */
  category: string;
  image?: string;
}

/** The greys of `contactform.jpg`, measured off the reference. */
const PANEL = '#242424';
const TRACK = '#323232';
const PLATE = '#4d4d4d';
const FIELD = '#424242';
const PILL = '#454545';
const SEND = '#757575';

/** The fallback for a deployment with no mail key set: the same summary, handed
 *  to the visitor's own mail client instead of sent by the server. */
function buildMailto(email: string, picks: QuickPick[], from: string, note: string) {
  const lines = [
    'Érdeklődés az alábbi szolgáltatások iránt:',
    '',
    ...picks.map((p) => `— ${p.category}: ${p.label}`),
    '',
    ...(note.trim() ? ['A projekt rövid leírása:', note.trim(), ''] : []),
    `Válaszcím: ${from}`,
  ];
  return `mailto:${email}?subject=${encodeURIComponent('Ajánlatkérés — Attila Visual Studio')}&body=${encodeURIComponent(lines.join('\n'))}`;
}

type SendState = 'idle' | 'sending' | 'sent' | 'error';

const MESSAGES: Record<string, string> = {
  'invalid-email': 'Adj meg egy érvényes e-mail címet.',
  'no-picks': 'Válassz legalább egy szolgáltatást.',
  'rate-limited': 'Túl sok küldés egymás után. Próbáld újra pár perc múlva.',
  'send-failed': 'A küldés nem sikerült. Írj közvetlenül: ',
  network: 'Nem sikerült elérni a szervert. Ellenőrizd a kapcsolatot.',
};

/**
 * The quick enquiry form from `contactform.jpg`, opening under the category
 * tiles as soon as the first service is picked.
 *
 * The basket on the left is the picks themselves — each tile carries the ✕ that
 * drops it — then the reply address and the note, then KÜLDÉS. There is no
 * server behind this site, so sending hands the assembled message to the
 * visitor's own mail client; the address they type travels in the body as the
 * reply address.
 */
export function QuickContactForm({
  picks,
  onRemove,
  onSent,
  email,
}: {
  picks: QuickPick[];
  onRemove: (key: string) => void;
  /** Empties the basket once the enquiry is away. */
  onSent: () => void;
  /** The studio's address — where the enquiry goes. */
  email: string;
}) {
  const [from, setFrom] = useState('');
  const [note, setNote] = useState('');
  const [invalid, setInvalid] = useState(false);
  const [state, setState] = useState<SendState>('idle');
  const [error, setError] = useState('');
  /** Bots fill every field they can see; this one no one can. */
  const [honey, setHoney] = useState('');

  // First opening brings itself into view: it appears below the fold on a
  // short window, and a form nobody sees is a form nobody fills in.
  const root = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);
  useEffect(() => {
    if (wasOpen.current || !picks.length) return;
    wasOpen.current = true;
    root.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [picks.length]);

  async function send() {
    if (!/^\S+@\S+\.\S+$/.test(from.trim())) {
      setInvalid(true);
      setError(MESSAGES['invalid-email']);
      setState('error');
      return;
    }
    setInvalid(false);
    setState('sending');
    setError('');

    let res: Response;
    try {
      res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: from.trim(),
          note,
          picks: picks.map((p) => ({ category: p.category, label: p.label })),
          website: honey,
        }),
      });
    } catch {
      setState('error');
      setError(MESSAGES.network);
      return;
    }

    if (res.ok) {
      setState('sent');
      setNote('');
      onSent();
      return;
    }

    // No mail key on this deployment yet: hand the same summary to the
    // visitor's own mail client rather than losing what they wrote.
    if (res.status === 501) {
      window.location.href = buildMailto(email, picks, from.trim(), note);
      setState('idle');
      return;
    }

    const { error: code } = await res.json().catch(() => ({ error: 'send-failed' }));
    setState('error');
    setError((MESSAGES[code as string] ?? MESSAGES['send-failed']) + (code === 'send-failed' ? email : ''));
  }

  return (
    <motion.div
      ref={root}
      data-contact-form
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      style={{ backgroundColor: PANEL }}
      className="mt-6 w-full rounded-3xl p-4 sm:p-6"
    >
      {state === 'sent' ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <p className={`${bebas.className} text-2xl uppercase tracking-wide text-white sm:text-3xl`}>
            Köszönjük, elküldtük
          </p>
          <p className={`${montserrat.className} text-sm text-white/60`}>
            Az ajánlatkérés megérkezett a stúdióhoz — a válasz a megadott címre érkezik.
          </p>
        </div>
      ) : (
      <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-6">
        {/* The basket: what has been picked so far, one tile each. */}
        <div
          style={{ backgroundColor: TRACK }}
          className="flex shrink-0 gap-3 overflow-x-auto rounded-2xl p-3 lg:w-[42%] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {picks.map((pick) => (
            <motion.div
              key={pick.key}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              style={{ backgroundColor: PLATE }}
              className="relative h-40 w-20 shrink-0 overflow-hidden rounded-xl sm:h-48 sm:w-24"
            >
              {pick.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={pick.image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-1.5 pb-1.5 pt-6"
              >
                <span
                  className={`${montserrat.className} block break-words text-[0.6rem] lowercase leading-tight text-white/90`}
                >
                  {pick.label}
                </span>
              </span>
              <button
                type="button"
                onClick={() => onRemove(pick.key)}
                aria-label={`${pick.label} eltávolítása`}
                className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-white/45 text-black/70 backdrop-blur-sm transition-colors hover:bg-white/70 hover:text-black"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                  <path
                    d="M1 1l8 8M9 1l-8 8"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </motion.div>
          ))}
        </div>

        {/* Reply address + INFO, then the note. */}
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex items-center gap-3">
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                if (invalid) setInvalid(false);
              }}
              placeholder="e-mail címed..."
              aria-label="E-mail címed"
              aria-invalid={invalid}
              style={{ backgroundColor: PILL }}
              className={`${montserrat.className} min-w-0 flex-1 rounded-full px-5 py-2.5 text-sm text-white outline-none ring-1 transition-shadow placeholder:text-white/45 ${
                invalid ? 'ring-red-400/70' : 'ring-transparent focus:ring-white/40'
              }`}
            />
            <Link
              href="/info"
              style={{ backgroundColor: PILL }}
              className={`${montserrat.className} shrink-0 rounded-full px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-white hover:text-black`}
            >
              Info
            </Link>
          </div>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="project rövid leírása..."
            aria-label="A projekt rövid leírása"
            rows={5}
            style={{ backgroundColor: FIELD }}
            className={`${montserrat.className} min-h-[9rem] w-full flex-1 resize-none rounded-2xl px-5 py-3 text-sm text-white outline-none ring-1 ring-transparent transition-shadow placeholder:text-white/45 focus:ring-white/40`}
          />

          {/* Off-screen rather than hidden: a bot reading the DOM fills it, a
              screen reader is told to leave it alone. */}
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden
            value={honey}
            onChange={(e) => setHoney(e.target.value)}
            className="absolute left-[-9999px] h-px w-px opacity-0"
          />
        </div>

        {/* KÜLDÉS. */}
        <div className="flex shrink-0 items-center justify-center">
          <button
            type="button"
            onClick={send}
            disabled={state === 'sending'}
            aria-busy={state === 'sending'}
            style={{ backgroundColor: SEND }}
            className={`${bebas.className} grid h-28 w-28 place-items-center rounded-full text-xl uppercase tracking-[0.12em] text-white transition-transform duration-300 ease-out hover:scale-105 disabled:scale-100 disabled:opacity-60 sm:h-36 sm:w-36 sm:text-2xl`}
          >
            {state === 'sending' ? 'Küldés…' : 'Küldés'}
          </button>
        </div>
      </div>
      )}

      {state === 'error' && error && (
        <p role="alert" className={`${montserrat.className} mt-3 text-xs text-red-300`}>
          {error}
        </p>
      )}
    </motion.div>
  );
}
