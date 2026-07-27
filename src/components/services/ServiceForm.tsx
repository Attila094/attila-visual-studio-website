'use client';

import { useState } from 'react';
import type { Service } from '@/content/services';

const EMAIL = 'attilakovacs094@gmail.com';

/**
 * Minimalist service enquiry form. "Send" builds a mailto: link with the form
 * data and hands off to the user's mail client — nothing is sent on the user's
 * behalf, they still review and send the message themselves.
 */
export function ServiceForm({
  service,
  option,
}: {
  service: Service;
  option?: string | null;
}) {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [description, setDescription] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subject = option
      ? `Ajánlatkérés — ${service.title} (${option})`
      : `Ajánlatkérés — ${service.title}`;
    const body = [
      `Név: ${name}`,
      `Elérhetőség: ${contact}`,
      ...(option ? [`Kategória: ${option}`] : []),
      '',
      'Leírás:',
      description,
    ].join('\n');
    const href = `mailto:${EMAIL}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="svc-name" className="text-xs uppercase tracking-[0.15em] text-muted">
          Név
        </label>
        <input
          id="svc-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Teljes név"
          className="border-b border-line bg-transparent pb-2 text-lg outline-none transition-colors placeholder:text-muted/60 focus:border-ink"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="svc-contact" className="text-xs uppercase tracking-[0.15em] text-muted">
          Elérhetőség
        </label>
        <input
          id="svc-contact"
          type="text"
          required
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="Email vagy telefonszám"
          className="border-b border-line bg-transparent pb-2 text-lg outline-none transition-colors placeholder:text-muted/60 focus:border-ink"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="svc-desc" className="text-xs uppercase tracking-[0.15em] text-muted">
          Leírás
        </label>
        <textarea
          id="svc-desc"
          required
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Mesélj a projektről…"
          className="resize-none border-b border-line bg-transparent pb-2 text-lg outline-none transition-colors placeholder:text-muted/60 focus:border-ink"
        />
      </div>

      <button
        type="submit"
        className="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper transition-transform duration-300 hover:-translate-y-0.5"
      >
        Küldés <span aria-hidden>↗</span>
      </button>
    </form>
  );
}
