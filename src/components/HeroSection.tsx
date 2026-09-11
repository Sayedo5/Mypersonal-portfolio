import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import watermarkImg from '../assets/watermark.png';
import { useContent } from '../content/ContentProvider';
import { RichText } from './RichText';
import { ButtonLink } from './Button';
import { ThemeToggle } from './ThemeToggle';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.14, delayChildren: 0.15 },
  },
};

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 18, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] },
  },
};

/**
 * Typewriter cycling the availability phrases in the hero terminal line.
 * All progression state lives inside the effect so React StrictMode's
 * double-invocation cannot start two competing timer chains.
 */
function useTypewriter(lines: readonly string[]) {
  const [text, setText] = useState('');

  useEffect(() => {
    if (!lines.length) {
      setText('');
      return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setText(lines[0]);
      return;
    }

    let timer = 0;
    let lineIndex = 0;
    let charCount = 0;
    let deleting = false;
    let cancelled = false;

    const tick = () => {
      if (cancelled) return;
      const full = lines[lineIndex];

      if (deleting) {
        charCount -= 1;
        if (charCount <= 0) {
          charCount = 0;
          deleting = false;
          lineIndex = (lineIndex + 1) % lines.length;
        }
      } else {
        charCount += 1;
      }

      setText(full.slice(0, charCount));

      const atEnd = !deleting && charCount >= full.length;
      if (atEnd) deleting = true;

      timer = window.setTimeout(tick, atEnd ? 2200 : deleting ? 28 : 55);
    };

    timer = window.setTimeout(tick, 900);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [lines]);

  return text;
}

export const HeroSection: React.FC = () => {
  const { profile, hero, site, theme, navigation } = useContent();
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const typed = useTypewriter(hero.terminalLines);

  const navItems = navigation.map((item) => ({ name: item.label, href: item.href }));
  const resumeHref = site.resumeUrl ?? '/resume.pdf';

  // Pointer-driven cursor is desktop-only; skip the listener on touch devices.
  useEffect(() => {
    if (!window.matchMedia('(min-width: 1024px) and (pointer: fine)').matches) return;
    const handleMouseMove = (e: MouseEvent) => setCursorPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <section className="relative w-full min-h-[100svh] overflow-hidden bg-bg text-fg lg:cursor-none">
      {/* ================= 1. CUSTOM CURSOR (desktop, fine pointer only) ================= */}
      {cursorPos.x >= 0 && (
        <motion.div
          className="fixed top-0 left-0 pointer-events-none z-50 rounded-full border border-gold/40 hidden lg:flex items-center justify-center backdrop-blur-[1px]"
          animate={{
            x: cursorPos.x - (isHovered ? 24 : 5),
            y: cursorPos.y - (isHovered ? 24 : 5),
            width: isHovered ? 48 : 10,
            height: isHovered ? 48 : 10,
            backgroundColor: isHovered ? 'rgba(212, 175, 55, 0.12)' : 'rgba(212, 175, 55, 0.9)',
          }}
          transition={{ type: 'spring', damping: 30, stiffness: 350, mass: 0.5 }}
        />
      )}

      {/* ================= 2. FIXED VIDEO LAYER ================= */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-bg flex items-center justify-center sm:justify-end">
        <video
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
          className="h-full w-auto min-w-full sm:min-w-0 max-w-none object-cover sm:object-contain origin-center sm:origin-right"
          style={{ opacity: 'var(--video-opacity)', mixBlendMode: 'var(--video-blend)' as never }}
        >
          <source src={theme.heroVideoUrl ?? '/videos/hero.mp4'} type="video/mp4" />
        </video>

        {/* Scrim: full wash on phones so text stays readable, side fade on desktop. */}
        <div
          className="absolute inset-0 sm:hidden"
          style={{
            background:
              'linear-gradient(to bottom, var(--scrim-from) 0%, var(--scrim-via) 45%, var(--scrim-from) 100%)',
          }}
        />
        <div
          className="absolute inset-y-0 left-0 hidden sm:block w-3/4 lg:w-1/2"
          style={{
            background:
              'linear-gradient(to right, var(--scrim-from) 0%, var(--scrim-via) 45%, transparent 100%)',
          }}
        />

        {/* ================= 3. WATERMARK EMBLEM ================= */}
        <div className="absolute bottom-6 right-6 lg:bottom-10 lg:right-12 pointer-events-none hidden md:flex items-center justify-center z-10">
          <div className="relative flex items-center justify-center">
            <div className="absolute w-36 h-36 rounded-full blur-xl bg-bg/85" />
            <motion.div
              animate={{ y: [-3, 3, -3], scale: [1, 1.03, 1] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative flex items-center justify-center"
            >
              <img
                src={theme.watermarkUrl ?? watermarkImg}
                alt=""
                aria-hidden="true"
                className="w-24 h-24 lg:w-32 lg:h-32 object-contain drop-shadow-[0_0_15px_rgba(212,175,55,0.25)]"
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* ================= 4. CONTENT LAYER ================= */}
      <div className="relative z-10 flex flex-col min-h-[100svh] w-full px-5 sm:px-8 lg:px-16 pt-5 pb-10">

        {/* ---------- Navigation ---------- */}
        <header className="relative flex items-center justify-between gap-3 w-full">
          <a
            href="#top"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="flex items-center gap-2.5 shrink-0 font-body text-[11px] sm:text-xs font-semibold tracking-[0.28em] uppercase text-fg hover:text-gold transition-colors"
          >
            <span className="grid place-items-center w-8 h-8 border border-gold/60 text-[10px] tracking-normal text-gold">
              {profile.initials}
            </span>
            <span className="hidden sm:inline">{profile.name.toUpperCase()}</span>
          </a>

          {/* Desktop nav */}
          <nav
            aria-label="Primary"
            className="hidden lg:flex items-center gap-7 xl:gap-9 absolute left-1/2 -translate-x-1/2"
          >
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="relative group py-1 font-body text-[11px] tracking-[0.22em] font-light uppercase text-fg-muted hover:text-fg transition-colors duration-300"
              >
                {item.name}
                <span className="absolute bottom-0 left-0 w-0 h-px bg-gold transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggle />

            <ButtonLink
              href={site.contactCtaHref}
              variant="primary"
              icon="↗"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="hidden sm:inline-flex !px-4 !py-2 !text-[10px]"
            >
              {site.contactCtaLabel}
            </ButtonLink>

            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="lg:hidden grid h-9 w-9 place-items-center rounded-[2px] border border-line bg-surface-2 text-fg-muted hover:border-gold hover:text-gold transition-colors"
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                {menuOpen ? (
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                ) : (
                  <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                )}
              </svg>
            </button>
          </div>
        </header>

        {/* ---------- Mobile nav panel ---------- */}
        {menuOpen && (
          <nav
            id="mobile-nav"
            aria-label="Sections"
            className="lg:hidden mt-3 border border-line bg-surface/95 backdrop-blur-md rounded-[2px] overflow-hidden"
          >
            <ul>
              {navItems.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="block px-5 py-3.5 font-body text-[11px] tracking-[0.22em] uppercase text-fg-muted border-b border-line-soft hover:text-gold hover:bg-surface-3 transition-colors"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
              <li className="p-3">
                <ButtonLink href={site.contactCtaHref} variant="primary" block icon="↗" onClick={() => setMenuOpen(false)}>
                  {site.contactCtaLabel}
                </ButtonLink>
              </li>
            </ul>
          </nav>
        )}

        {/* ---------- Hero body ---------- */}
        <div className="flex-1 flex flex-col lg:flex-row items-start lg:items-center justify-center lg:justify-between w-full py-10 sm:py-14 gap-10">

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-xl lg:max-w-[37rem] xl:max-w-[40rem] z-20"
          >
            {/* Availability pill */}
            {hero.showPill && site.availableForWork && (
              <motion.div
                variants={fadeUpVariants}
                className="mb-5 inline-flex items-center gap-2.5 py-1.5 pl-3 pr-4 border border-gold/30 bg-surface-2/70 backdrop-blur-sm rounded-full"
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-gold opacity-75 motion-safe:animate-ping" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-gold" />
                </span>
                <span className="font-body text-[9.5px] sm:text-[10px] tracking-[0.22em] uppercase text-fg">
                  {site.availabilityText ?? hero.availabilityPill}
                </span>
              </motion.div>
            )}

            {/* Headline */}
            <motion.h1
              variants={fadeUpVariants}
              className="headline text-[3.25rem] min-[400px]:text-[3.75rem] sm:text-7xl md:text-8xl lg:text-[6.5rem] xl:text-[7.4rem] mb-4 select-none"
            >
              <span className="headline headline-neutral block">{hero.headlineTop}</span>
              <span className="headline headline-gold block">{hero.headlineBottom}</span>
            </motion.h1>

            {/* Role line */}
            <motion.p
              variants={fadeUpVariants}
              className="mb-5 font-body text-[9.5px] min-[400px]:text-[10.5px] md:text-xs tracking-[0.2em] sm:tracking-[0.26em] uppercase text-fg-muted"
            >
              {hero.roleLinePart1} <span className="text-gold mx-1">•</span> {hero.roleLinePart2}
              <span className="text-gold mx-1">•</span> {hero.roleLinePart3}
            </motion.p>

            {/* Terminal status line */}
            <motion.div
              variants={fadeUpVariants}
              className="mb-6 flex items-center gap-2 w-full max-w-md px-3.5 py-2.5 border border-line bg-surface/80 backdrop-blur-sm rounded-[2px] overflow-hidden"
            >
              <span className="font-mono text-xs text-gold shrink-0" aria-hidden="true">
                $
              </span>
              <span className="font-mono text-[10.5px] sm:text-xs text-fg-muted truncate" aria-live="polite">
                {typed}
              </span>
              <span className="w-[7px] h-[13px] bg-gold shrink-0 motion-safe:animate-pulse" aria-hidden="true" />
            </motion.div>

            {/* Description */}
            <motion.p
              variants={fadeUpVariants}
              className="font-body text-[13px] sm:text-sm font-light text-fg-muted leading-[1.85] max-w-lg mb-8"
            >
              <RichText text={hero.description} />
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUpVariants} className="flex flex-col min-[400px]:flex-row flex-wrap gap-3">
              <ButtonLink
                href={hero.primaryCtaHref}
                variant="primary"
                icon="↗"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                {hero.primaryCtaLabel}
              </ButtonLink>
              <ButtonLink
                href={resumeHref}
                variant="outline"
                icon="↓"
                iconDirection="down"
                external
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                {hero.resumeCtaLabel}
              </ButtonLink>
            </motion.div>
          </motion.div>

          {/* Quote & signature — desktop only */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="hidden xl:flex flex-col items-start pr-24 2xl:pr-36 z-20 select-none"
          >
            <span className="text-xl text-gold-deep leading-none font-serif mb-2">“</span>
            <div className="font-body text-[9.5px] font-medium tracking-[0.22em] uppercase text-fg space-y-1 mb-3">
              <p>{hero.quoteLine1}</p>
              <p>{hero.quoteLine2}</p>
            </div>
            <div className="w-28 h-px bg-gradient-to-r from-gold to-transparent mb-2" />
            <div className="font-script text-[2.2rem] text-gold leading-none -ml-0.5 tracking-wide">
              {profile.firstName}
            </div>
          </motion.div>
        </div>

        {/* ---------- Scroll cue ---------- */}
        <div className="hidden md:flex items-center gap-3">
          <span className="label-mono text-fg-subtle">{hero.scrollCueLabel}</span>
          <div className="w-16 h-px bg-gradient-to-r from-bronze to-transparent" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
