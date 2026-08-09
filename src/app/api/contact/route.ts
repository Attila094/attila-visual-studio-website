import { NextResponse } from 'next/server';

/**
 * The contact page's KÜLDÉS endpoint.
 *
 * A browser cannot send mail, and mail cannot honestly be sent *from* a
 * visitor's address — SPF and DKIM are checks on the sending domain, so a
 * message claiming to come from someone else's mailbox is what a spam filter
 * exists to catch. So the studio's own verified sender sends it and the
 * visitor's address goes in Reply-To: hitting reply in the studio's inbox
 * answers the visitor directly, which is the behaviour that was wanted.
 *
 * Transport is Resend's HTTP API — one fetch, no dependency. Set
 * `RESEND_API_KEY` (and, once a domain is verified there, `CONTACT_FROM`) in
 * the deployment's environment. Without a key the route answers 501 and the
 * form falls back to handing the message to the visitor's own mail client, so
 * the button is never dead.
 */

// Nodemailer-free, but still not the Edge runtime: keep it on Node so the
// rate-limit map below survives between requests on a warm instance.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TO = process.env.CONTACT_TO ?? 'attilakovacs094@gmail.com';
/** Resend's shared sandbox sender until a domain of your own is verified. */
const FROM = process.env.CONTACT_FROM ?? 'Attila Visual Studio <onboarding@resend.dev>';

const MAX_PICKS = 30;
const MAX_NOTE = 2000;
const MAX_LABEL = 120;

interface Pick {
  category: string;
  label: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Five sends per address-less window per instance. Crude on purpose: it costs
 *  nothing and stops a bored script, which is all an open mail relay needs. */
const RATE = new Map<string, number[]>();
const RATE_WINDOW = 10 * 60_000;
const RATE_MAX = 5;

function rateLimited(ip: string) {
  const now = Date.now();
  const hits = (RATE.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW);
  hits.push(now);
  RATE.set(ip, hits);
  if (RATE.size > 500) RATE.clear(); // never let it grow unbounded
  return hits.length > RATE_MAX;
}

const clean = (s: unknown, max: number) =>
  typeof s === 'string' ? s.replace(/\s+/g, ' ').trim().slice(0, max) : '';

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => `&${{ '&': 'amp', '<': 'lt', '>': 'gt', '"': 'quot', "'": '#39' }[c]};`);

/** The picks, grouped under their category — the summary of what was chosen. */
function groupPicks(picks: Pick[]) {
  const groups = new Map<string, string[]>();
  for (const p of picks) {
    const list = groups.get(p.category) ?? [];
    list.push(p.label);
    groups.set(p.category, list);
  }
  return [...groups.entries()];
}

export async function POST(req: Request) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    // Not a failure of the request — the mailbox simply isn't wired up yet.
    return NextResponse.json({ error: 'not-configured' }, { status: 501 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'bad-request' }, { status: 400 });
  }

  const { email, note, picks, website } = (body ?? {}) as {
    email?: unknown;
    note?: unknown;
    picks?: unknown;
    website?: unknown;
  };

  // Honeypot: a field no human ever sees, so anything in it is a bot. Answer
  // 200 so it learns nothing.
  if (clean(website, 100)) return NextResponse.json({ ok: true });

  const from = clean(email, 254);
  if (!EMAIL_RE.test(from)) {
    return NextResponse.json({ error: 'invalid-email' }, { status: 400 });
  }

  const list: Pick[] = Array.isArray(picks)
    ? picks
        .slice(0, MAX_PICKS)
        .map((p) => ({
          category: clean((p as Pick)?.category, MAX_LABEL),
          label: clean((p as Pick)?.label, MAX_LABEL),
        }))
        .filter((p) => p.label)
    : [];
  if (!list.length) {
    return NextResponse.json({ error: 'no-picks' }, { status: 400 });
  }

  const description = typeof note === 'string' ? note.trim().slice(0, MAX_NOTE) : '';
  const groups = groupPicks(list);

  const text = [
    'Új ajánlatkérés a kapcsolat oldalról.',
    '',
    'Kiválasztott szolgáltatások:',
    ...groups.flatMap(([category, labels]) => [`${category}:`, ...labels.map((l) => `  — ${l}`)]),
    '',
    ...(description ? ['A projekt rövid leírása:', description, ''] : []),
    `Válaszcím: ${from}`,
  ].join('\n');

  const html = `<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:14px;line-height:1.6;color:#111">
<p><strong>Új ajánlatkérés a kapcsolat oldalról.</strong></p>
<p><strong>Kiválasztott szolgáltatások</strong></p>
${groups
  .map(
    ([category, labels]) =>
      `<p style="margin:0 0 8px"><strong>${escapeHtml(category)}</strong><br>${labels
        .map((l) => `— ${escapeHtml(l)}`)
        .join('<br>')}</p>`,
  )
  .join('')}
${
  description
    ? `<p><strong>A projekt rövid leírása</strong><br>${escapeHtml(description).replace(/\n/g, '<br>')}</p>`
    : ''
}
<p><strong>Válaszcím</strong><br><a href="mailto:${escapeHtml(from)}">${escapeHtml(from)}</a></p>
</div>`;

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown';
  if (rateLimited(ip)) {
    return NextResponse.json({ error: 'rate-limited' }, { status: 429 });
  }

  const subject = `Ajánlatkérés — ${groups.map(([c]) => c).join(', ')} (${list.length} tétel)`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: FROM,
      to: [TO],
      // The whole point: replying in the studio's inbox goes to the visitor.
      reply_to: from,
      subject,
      text,
      html,
    }),
  });

  if (!res.ok) {
    console.error('contact: resend rejected the message', res.status, await res.text());
    return NextResponse.json({ error: 'send-failed' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
