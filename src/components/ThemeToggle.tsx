import React from 'react';
import { useTheme } from '../hooks/useTheme';

/**
 * Sun/moon theme switch. Sits in the header next to the primary CTA
 * and is sized to match the mobile menu button exactly.
 */
export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className={`group relative grid h-9 w-9 place-items-center overflow-hidden rounded-[2px] border border-line bg-surface-2 text-fg-muted transition-colors duration-300 hover:border-gold hover:text-gold ${className}`}
    >
      {/* Sun */}
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
        className={`absolute transition-all duration-400 ${
          isDark ? 'translate-y-0 rotate-0 opacity-100' : '-translate-y-6 rotate-90 opacity-0'
        }`}
      >
        <circle cx="12" cy="12" r="4.2" />
        <path d="M12 2.6v2.2M12 19.2v2.2M21.4 12h-2.2M4.8 12H2.6M18.6 5.4l-1.6 1.6M7 17l-1.6 1.6M18.6 18.6L17 17M7 7L5.4 5.4" />
      </svg>

      {/* Moon */}
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={`absolute transition-all duration-400 ${
          isDark ? 'translate-y-6 -rotate-90 opacity-0' : 'translate-y-0 rotate-0 opacity-100'
        }`}
      >
        <path d="M20.5 14.8A8.5 8.5 0 1 1 9.2 3.5a6.8 6.8 0 0 0 11.3 11.3z" />
      </svg>
    </button>
  );
};

export default ThemeToggle;
