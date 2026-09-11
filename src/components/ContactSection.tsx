import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { profile } from '../data/profile';
import { SectionHeader } from './SectionHeader';
import { Button } from './Button';

/**
 * Optional form backend. Set VITE_CONTACT_ENDPOINT in .env to a Formspree
 * (or similar) URL and the form POSTs there. With no endpoint configured the
 * form falls back to opening the visitor's mail client with the message
 * pre-filled — so it never silently swallows an enquiry.
 */
const ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT as string | undefined;

type Status = 'idle' | 'sending' | 'sent' | 'error';

const channels = [
  { label: 'EMAIL', value: profile.email, href: `mailto:${profile.email}` },
  { label: 'PHONE', value: profile.phone, href: `tel:${profile.phoneHref}` },
  { label: 'GITHUB', value: profile.githubLabel, href: profile.github, external: true },
  { label: 'LINKEDIN', value: profile.linkedinLabel, href: profile.linkedin, external: true },
];

const fieldClass =
  'w-full bg-surface-2 border border-line focus:border-gold text-fg placeholder:text-fg-subtle/70 font-body text-[12.5px] px-4 py-3 outline-none rounded-[2px] transition-colors';

export const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<Status>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    if (!ENDPOINT) {
      const subject = encodeURIComponent(`Project enquiry from ${formData.name}`);
      const body = encodeURIComponent(
        `${formData.message}\n\n—\n${formData.name}\n${formData.email}`,
      );
      window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
      setStatus('sent');
      return;
    }

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(formData),
      });
      setStatus(res.ok ? 'sent' : 'error');
    } catch {
      setStatus('error');
    }
  };

  return (
    <footer
      id="contact"
      className="relative w-full bg-bg text-fg pt-16 pb-12 px-5 sm:px-8 lg:px-20 overflow-hidden"
    >
      <div
        className="absolute bottom-0 left-1/3 w-[32rem] h-[32rem] rounded-full blur-[170px] pointer-events-none"
        style={{ background: 'var(--glow-gold)' }}
      />

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">

          {/* ---------- Left: pitch + channels ---------- */}
          <div className="lg:col-span-5">
            <SectionHeader
              eyebrow="06 / CONTACT"
              titleTop="LET'S BUILD"
              titleBottom="SOMETHING."
              className="mb-7"
            />

            <p className="font-body text-[12.5px] sm:text-[13px] font-light text-fg-muted leading-[1.85] max-w-md mb-8">
              {profile.contactPitch}
            </p>

            <motion.ul
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="border-t border-line"
            >
              {channels.map((c) => (
                <li key={c.label} className="border-b border-line">
                  <a
                    href={c.href}
                    {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="group flex items-center justify-between gap-4 py-4 transition-colors"
                  >
                    <span className="min-w-0">
                      <span className="label-mono block text-fg-subtle mb-1.5">{c.label}</span>
                      <span className="block font-mono text-[11.5px] text-fg group-hover:text-gold transition-colors truncate">
                        {c.value}
                      </span>
                    </span>
                    <span
                      className="text-fg-subtle group-hover:text-gold group-hover:translate-x-0.5 transition-all shrink-0"
                      aria-hidden="true"
                    >
                      ↗
                    </span>
                  </a>
                </li>
              ))}
            </motion.ul>
          </div>

          {/* ---------- Right: form ---------- */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 relative w-full rounded-[2px] border border-line bg-surface p-6 sm:p-9 overflow-hidden"
          >
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
            <span className="corner-pin top-0 left-0 border-t border-l opacity-60" />
            <span className="corner-pin top-0 right-0 border-t border-r opacity-60" />
            <span className="corner-pin bottom-0 left-0 border-b border-l opacity-60" />
            <span className="corner-pin bottom-0 right-0 border-b border-r opacity-60" />

            {status === 'sent' ? (
              <div className="py-14 text-center space-y-4">
                <div className="inline-grid place-items-center w-11 h-11 rounded-full border border-gold text-gold">
                  ✓
                </div>
                <h3 className="font-display text-3xl text-fg-strong uppercase">
                  MESSAGE ON ITS WAY
                </h3>
                <p className="font-body text-[12.5px] font-light text-fg-muted max-w-sm mx-auto leading-relaxed">
                  {ENDPOINT
                    ? 'Thanks for reaching out — I reply within 24 hours.'
                    : `Your mail client should have opened. If it didn't, email me directly at ${profile.email}.`}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="contact-name" className="label-mono block text-fg-subtle mb-2">
                      // YOUR NAME
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      required
                      autoComplete="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter name"
                      className={fieldClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-email" className="label-mono block text-fg-subtle mb-2">
                      // YOUR EMAIL
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter email"
                      className={fieldClass}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-message" className="label-mono block text-fg-subtle mb-2">
                    // PROJECT DETAILS
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="What are you building, what stack are you on, and what's the deadline?"
                    className={`${fieldClass} resize-none`}
                  />
                </div>

                {status === 'error' && (
                  <p className="font-body text-[11.5px] text-red-400" role="alert">
                    Something went wrong sending that. Please email me directly at {profile.email}.
                  </p>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  block
                  disabled={status === 'sending'}
                  icon={status === 'sending' ? undefined : '↗'}
                >
                  {status === 'sending' ? 'Sending…' : 'Send message'}
                </Button>
              </form>
            )}
          </motion.div>
        </div>

        {/* ---------- Footer line ---------- */}
        <div className="pt-10 mt-14 border-t border-line flex flex-col sm:flex-row items-center justify-between text-center sm:text-left gap-3">
          <span className="font-mono text-[9.5px] tracking-[0.18em] uppercase text-fg-subtle">
            {profile.name} // {profile.location}
          </span>
          <span className="font-mono text-[9.5px] tracking-[0.18em] uppercase text-fg-subtle">
            © {new Date().getFullYear()} • BUILT WITH REACT, TYPESCRIPT &amp; TAILWIND
          </span>
        </div>
      </div>
    </footer>
  );
};

export default ContactSection;
