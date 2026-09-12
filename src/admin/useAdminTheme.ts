import { useCallback, useEffect, useState } from 'react';

export type AdminTheme = 'light' | 'dark';

/**
 * The admin panel's own light/dark setting.
 *
 * Stored under a separate key from the portfolio's theme on purpose: the two
 * are different products. You can run the public site in dark and work in the
 * dashboard in light without either overriding the other.
 */
const STORAGE_KEY = 'admin-theme';

function initialTheme(): AdminTheme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // Private mode or blocked storage — fall through to the system setting.
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useAdminTheme() {
  const [theme, setThemeState] = useState<AdminTheme>(initialTheme);

  const setTheme = useCallback((next: AdminTheme) => {
    setThemeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // The choice still applies for this visit.
    }
  }, []);

  const toggle = useCallback(
    () => setTheme(theme === 'dark' ? 'light' : 'dark'),
    [theme, setTheme],
  );

  // Follow the OS until an explicit choice is stored.
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (event: MediaQueryListEvent) => {
      let stored: string | null = null;
      try {
        stored = localStorage.getItem(STORAGE_KEY);
      } catch {
        stored = null;
      }
      if (!stored) setThemeState(event.matches ? 'dark' : 'light');
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  return { theme, setTheme, toggle };
}
