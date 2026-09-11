import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

import { requestContentRefresh } from '../../content/ContentProvider';
import { ApiError, adminApi, authApi, type SessionView } from '../api';
import { ActionButton, Banner } from './ui';

export const ADMIN_NAV: readonly {
  label: string;
  items: readonly { to: string; label: string; glyph: string }[];
}[] = [
  {
    label: 'Workspace',
    items: [{ to: '/admin', label: 'Overview', glyph: '◇' }],
  },
  {
    label: 'Content',
    items: [
      { to: '/admin/profile', label: 'Profile', glyph: '◈' },
      { to: '/admin/hero', label: 'Hero', glyph: '▲' },
      { to: '/admin/about', label: 'About & stats', glyph: '▤' },
      { to: '/admin/services', label: 'Services', glyph: '▦' },
      { to: '/admin/projects', label: 'Projects', glyph: '▣' },
      { to: '/admin/skills', label: 'Skills', glyph: '▩' },
      { to: '/admin/career', label: 'Career', glyph: '▥' },
      { to: '/admin/contact', label: 'Contact links', glyph: '✉' },
    ],
  },
  {
    label: 'Structure',
    items: [
      { to: '/admin/sections', label: 'Sections', glyph: '☰' },
      { to: '/admin/navigation', label: 'Navigation', glyph: '⌗' },
    ],
  },
  {
    label: 'Presentation',
    items: [
      { to: '/admin/appearance', label: 'Appearance', glyph: '◐' },
      { to: '/admin/media', label: 'Media', glyph: '▢' },
      { to: '/admin/seo', label: 'SEO', glyph: '⌕' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/admin/inbox', label: 'Inbox', glyph: '✦' },
      { to: '/admin/audit', label: 'Audit', glyph: '⋮' },
    ],
  },
  {
    label: 'Account',
    items: [{ to: '/admin/security', label: 'Security', glyph: '⚿' }],
  },
];

export const AdminShell: React.FC<{
  session: SessionView;
  onSignOut: () => void;
  children: React.ReactNode;
}> = ({ session, onSignOut, children }) => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [banner, setBanner] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);

  const publishEverything = async () => {
    if (!window.confirm('Publish every draft across the whole site?')) return;
    setPublishing(true);
    try {
      const result = await adminApi.publishAll();
      setBanner({ tone: 'success', text: `Published ${result.published} records.` });
      requestContentRefresh();
    } catch (error) {
      setBanner({
        tone: 'error',
        text: error instanceof ApiError ? error.message : 'Publishing failed.',
      });
    } finally {
      setPublishing(false);
    }
  };

  const signOut = async () => {
    try {
      await authApi.logout();
    } finally {
      onSignOut();
    }
  };

  return (
    <div className="min-h-screen bg-bg text-fg">
      <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-line bg-bg/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            className="grid h-9 w-9 place-items-center rounded-[2px] border border-line bg-surface-2 text-fg-muted transition-colors hover:border-gold hover:text-gold lg:hidden"
          >
            ☰
          </button>
          <span className="font-display text-[1.3rem] tracking-wide text-fg-strong">
            Portfolio CMS
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/preview"
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-[11px] uppercase tracking-[0.16em] text-fg-muted transition-colors hover:text-gold"
          >
            Preview ↗
          </a>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-[11px] uppercase tracking-[0.16em] text-fg-muted transition-colors hover:text-gold"
          >
            Live site ↗
          </a>
          <ActionButton tone="primary" onClick={publishEverything} loading={publishing}>
            Publish all
          </ActionButton>
          <ActionButton onClick={() => void signOut()}>Sign out</ActionButton>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1500px] gap-0 lg:gap-8 lg:px-6">
        <aside
          className={`${
            menuOpen ? 'block' : 'hidden'
          } w-full shrink-0 border-b border-line bg-surface/60 p-4 lg:block lg:w-60 lg:border-b-0 lg:bg-transparent lg:py-8`}
        >
          <nav aria-label="Admin sections" className="space-y-6">
            {ADMIN_NAV.map((group) => (
              <div key={group.label}>
                <p className="label-mono mb-2 text-fg-subtle">{group.label}</p>
                <ul className="space-y-0.5">
                  {group.items.map((item) => (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        end={item.to === '/admin'}
                        onClick={() => setMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 rounded-[2px] px-3 py-2 font-body text-[12.5px] transition-colors ${
                            isActive
                              ? 'bg-surface-3 text-gold'
                              : 'text-fg-muted hover:bg-surface-2 hover:text-fg'
                          }`
                        }
                      >
                        <span aria-hidden="true" className="text-[11px]">
                          {item.glyph}
                        </span>
                        {item.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <p className="mt-8 border-t border-line pt-4 font-body text-[11px] font-light text-fg-subtle">
            Signed in as
            <br />
            <span className="text-fg-muted">{session.user?.email}</span>
          </p>
        </aside>

        <main key={location.pathname} className="min-w-0 flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-0 lg:py-8">
          {banner && <Banner tone={banner.tone}>{banner.text}</Banner>}
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminShell;
