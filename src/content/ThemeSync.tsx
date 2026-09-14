import { useEffect } from 'react';

import { useContentState } from './ContentProvider';

const STORAGE_KEY = 'portfolio-theme';

/**
 * Applies the appearance settings managed in the admin panel.
 *
 * The accent colours overwrite the two CSS custom properties the whole
 * palette is derived from, and the default mode applies only when the
 * visitor has not made their own choice — an explicit preference in
 * localStorage always wins.
 */
export const ThemeSync: React.FC = () => {
  const { content, isLive } = useContentState();

  useEffect(() => {
    if (!isLive) return;

    const { theme } = content;
    const root = document.documentElement;

    // The stylesheet ships a tuned gold per theme (the light theme uses a
    // darker one for contrast). Only override when the owner has actually
    // changed the colour, so the default palette is left exactly as-is.
    const applyAccent = (property: string, value: string, shipped: string) => {
      if (value && value.toLowerCase() !== shipped) root.style.setProperty(property, value);
      else root.style.removeProperty(property);
    };

    applyAccent('--c-gold', theme.accentGold, '#d4af37');
    applyAccent('--c-bronze', theme.accentBronze, '#8c6d4f');
    root.style.setProperty('--c-heading', theme.headingColor);
    root.style.setProperty('--c-link', theme.linkColor);
    root.style.setProperty('--portfolio-font-scale', String(theme.fontScale));
    const families: Record<string, string> = {
      Montserrat: "'Montserrat', system-ui, sans-serif",
      Inter: "'Inter', system-ui, sans-serif",
      'system-ui': 'system-ui, sans-serif',
      Georgia: 'Georgia, serif',
    };
    root.style.setProperty('--portfolio-font-body', families[theme.fontFamily] ?? families.Montserrat);

    let stored: string | null = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {
      stored = null;
    }

    // Respect the visitor's own choice above the configured default.
    if (stored) return;

    const resolved =
      theme.defaultMode === 'SYSTEM'
        ? window.matchMedia('(prefers-color-scheme: light)').matches
          ? 'light'
          : 'dark'
        : theme.defaultMode.toLowerCase();

    if (root.getAttribute('data-theme') !== resolved) {
      root.setAttribute('data-theme', resolved);
    }
  }, [content, isLive]);

  return null;
};

export default ThemeSync;
