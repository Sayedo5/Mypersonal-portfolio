import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

import { requestContentRefresh } from '../../content/ContentProvider';
import { ApiError, adminApi, authApi, type SessionView } from '../api';
import { useAdminTheme } from '../useAdminTheme';
import { ActionButton, Banner } from './ui';

type NavItem = { to: string; label: string; glyph: string; badge?: 'unread' };

export const ADMIN_NAV: readonly { label: string; items: readonly NavItem[] }[] = [
  {
    label: 'Overview',
    items: [{ to: '/admin', label: 'Dashboard', glyph: '◧' }],
  },
  {
    label: 'Content',
    items: [
      { to: '/admin/profile', label: 'Profile', glyph: '◍' },
      { to: '/admin/hero', label: 'Hero', glyph: '▲' },
      { to: '/admin/hire-links', label: 'Hire Me links', glyph: '↗' },
      { to: '/admin/about', label: 'About & stats', glyph: '▦' },
      { to: '/admin/services', label: 'Services', glyph: '▤' },
      { to: '/admin/projects', label: 'Projects', glyph: '▣' },
      { to: '/admin/skills', label: 'Skills', glyph: '▨' },
      { to: '/admin/career', label: 'Career', glyph: '▥' },
      { to: '/admin/contact', label: 'Contact links', glyph: '◇' },
    ],
  },
  {
    label: 'Structure',
    items: [
      { to: '/admin/sections', label: 'Section headings', glyph: '☰' },
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
      { to: '/admin/inbox', label: 'Inbox', glyph: '✉', badge: 'unread' },
      { to: '/admin/audit', label: 'Audit log', glyph: '⋮' },
    ],
  },
  {
    label: 'Account',
    items: [{ to: '/admin/security', label: 'Security', glyph: '⚿' }],
  },
];

/** Page title in the topbar, derived from the active route. */
function titleFor(pathname: string): string {
  for (const group of ADMIN_NAV) {
    for (const item of group.items) {
      if (item.to === pathname) return item.label;
    }
  }
  return 'Dashboard';
}

export const AdminShell: React.FC<{
  session: SessionView;
  onSignOut: () => void;
  children: React.ReactNode;
}> = ({ session, onSignOut, children }) => {
  const location = useLocation();
  const { theme, toggle } = useAdminTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [unread, setUnread] = useState(0);
  const [pendingDrafts, setPendingDrafts] = useState<number | null>(null);
  const [banner, setBanner] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);

  // Keep the sidebar counters live as you move around the panel.
  useEffect(() => {
    let cancelled = false;
    adminApi
      .overview()
      .then((data) => {
        if (cancelled) return;
        setUnread(data.unreadMessageCount);
        setPendingDrafts(data.draftCount);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [location.pathname, publishing]);

  useEffect(() => setMenuOpen(false), [location.pathname]);
  useEffect(() => setQuickActionsOpen(false), [location.pathname]);

  const publishEverything = async () => {
    if (!window.confirm('Publish every pending draft across the whole site?')) return;
    setPublishing(true);
    try {
      const result = await adminApi.publishAll();
      setBanner({ tone: 'success', text: `Published ${result.published} records to the live site.` });
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
    <div className="ad" data-ad-theme={theme}>
      <div className="ad-shell">
        {menuOpen && (
          <button
            type="button"
            aria-label="Close menu"
            className="ad-backdrop"
            onClick={() => setMenuOpen(false)}
          />
        )}

        <aside className={`ad-sidebar ${menuOpen ? 'is-open' : ''}`}>
          <div className="ad-brand">
            <span className="ad-brand-mark">SM</span>
            <span>
              <span className="ad-brand-name">Portfolio CMS</span>
              <br />
              <span className="ad-brand-sub">Content management</span>
            </span>
          </div>

          <nav className="ad-nav" aria-label="Admin sections">
            {ADMIN_NAV.map((group) => (
              <div key={group.label} className="ad-nav-group">
                <p className="ad-nav-label">{group.label}</p>
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/admin'}
                    className={({ isActive }) => `ad-nav-link ${isActive ? 'is-active' : ''}`}
                  >
                    <span className="ad-nav-icon" aria-hidden="true">
                      {item.glyph}
                    </span>
                    {item.label}
                    {item.badge === 'unread' && unread > 0 && (
                      <span className="ad-nav-badge">{unread}</span>
                    )}
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>

          <div className="ad-sidebar-foot">
            Signed in as
            <br />
            <strong style={{ fontWeight: 600 }}>{session.user?.email}</strong>
          </div>
        </aside>

        <div className="ad-main">
          <header className="ad-topbar">
            <button
              type="button"
              className="ad-icon-btn ad-burger"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              ☰
            </button>

            <span className="ad-page-title">{titleFor(location.pathname)}</span>

            {pendingDrafts !== null && (
              <span className={`ad-chip ${pendingDrafts > 0 ? 'ad-chip--draft' : 'ad-chip--ok'}`}>
                {pendingDrafts > 0 ? `${pendingDrafts} unpublished` : 'All published'}
              </span>
            )}

            <a className="ad-btn ad-topbar-direct" href="/preview" target="_blank" rel="noopener noreferrer">
              Preview
            </a>
            <a className="ad-btn ad-topbar-direct" href="/" target="_blank" rel="noopener noreferrer">
              View site
            </a>

            <button
              type="button"
              className="ad-icon-btn"
              onClick={toggle}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {theme === 'dark' ? '☀' : '☾'}
            </button>

            <ActionButton tone="primary" onClick={publishEverything} loading={publishing}>
              Publish all
            </ActionButton>
            <ActionButton className="ad-topbar-direct" onClick={() => void signOut()}>Sign out</ActionButton>
            <button
              type="button"
              className="ad-icon-btn ad-mobile-more"
              aria-label="Open more actions"
              aria-expanded={quickActionsOpen}
              onClick={() => setQuickActionsOpen((open) => !open)}
            >
              ···
            </button>
            {quickActionsOpen && (
              <div className="ad-topbar-menu">
                <a href="/preview" target="_blank" rel="noopener noreferrer" onClick={() => setQuickActionsOpen(false)}>Preview</a>
                <a href="/" target="_blank" rel="noopener noreferrer" onClick={() => setQuickActionsOpen(false)}>View site</a>
                <button type="button" onClick={() => { setQuickActionsOpen(false); void signOut(); }}>Sign out</button>
              </div>
            )}
          </header>

          <main className="ad-content">
            {banner && <Banner tone={banner.tone}>{banner.text}</Banner>}
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminShell;
