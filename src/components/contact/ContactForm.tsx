'use client';

import { useState } from 'react';

const EMAIL = 'attilakovacs094@gmail.com';

export function ContactForm() {
  const [values, setValues] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  function update(key: keyof typeof values) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setValues((v) => ({ ...v, [key]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subject = `Új üzenet a weboldalról — ${values.name}`;
    const body = [
      `Név: ${values.name}`,
      `Email: ${values.email}`,
      `Telefon: ${values.phone}`,
      '',
      'Üzenet:',
      values.message,
    ].join('\n');
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
  }

  const field =
    'border-b border-line bg-transparent pb-2 text-lg outline-none transition-colors placeholder:text-muted/60 focus:border-ink';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="c-name" className="text-xs uppercase tracking-[0.15em] text-muted">
            Név
          </label>
          <input id="c-name" type="text" required value={values.name} onChange={update('name')} placeholder="Teljes név" className={field} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="c-email" className="text-xs uppercase tracking-[0.15em] text-muted">
            Email
          </label>
          <input id="c-email" type="email" required value={values.email} onChange={update('email')} placeholder="nev@email.hu" className={field} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="c-phone" className="text-xs uppercase tracking-[0.15em] text-muted">
          Telefon
        </label>
        <input id="c-phone" type="tel" value={values.phone} onChange={update('phone')} placeholder="+36 …" className={field} />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="c-message" className="text-xs uppercase tracking-[0.15em] text-muted">
          Üzenet
        </label>
        <textarea id="c-message" required rows={5} value={values.message} onChange={update('message')} placeholder="Miben segíthetek?" className={`${field} resize-none`} />
      </div>

      <button
        type="submit"
        className="inline-flex w-fit items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-medium text-paper transition-transform duration-300 hover:-translate-y-0.5"
      >
        Üzenet küldése <span aria-hidden>↗</span>
      </button>
    </form>
  );
}
