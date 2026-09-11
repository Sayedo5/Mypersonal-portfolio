import { useCallback, useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'portfolio-theme';

/** Reads whatever the inline <head> script already resolved. */
function currentTheme(): Theme {
  if (typeof document === 'undefined') return 'dark';
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}

/**
 * Theme state backed by the data-theme attribute on <html>.
 * The initial value is set by an inline script in index.html so the
 * page never flashes the wrong theme before React hydrates.
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(currentTheme);

  const setTheme = useCallback((next: Theme) => {
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private mode or blocked storage — the theme still applies for this visit.
    }
    setThemeState(next);
  }, []);

  const toggle = useCallback(() => {
    setTheme(currentTheme() === 'dark' ? 'light' : 'dark');
  }, [setTheme]);

  // Follow the OS preference until the visitor makes an explicit choice.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const onChange = (e: MediaQueryListEvent) => {
      let stored: string | null = null;
      try {
        stored = localStorage.getItem(STORAGE_KEY);
      } catch {
        stored = null;
      }
      if (stored) return;
      const next: Theme = e.matches ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      setThemeState(next);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return { theme, setTheme, toggle };
}
