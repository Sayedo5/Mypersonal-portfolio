import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
  siExpo,
  siExpress,
  siFirebase,
  siGit,
  siJsonwebtokens,
  siMongodb,
  siNeon,
  siNextdotjs,
  siNodedotjs,
  siPostgresql,
  siPrisma,
  siRadixui,
  siReact,
  siRedux,
  siShadcnui,
  siSupabase,
  siTailwindcss,
  siTanstack,
  siTypescript,
  siVercel,
} from 'simple-icons';
import type { SimpleIcon } from 'simple-icons';
import watermarkImg from '../assets/watermark.png';
import { useContent } from '../content/ContentProvider';
import { RichText } from './RichText';
import { ButtonLink } from './Button';
import { ThemeToggle } from './ThemeToggle';
import { useHireMe } from './HireMeModal';

const orbitGlyph = (name: string) => {
  const normalized = name.toLowerCase();
  if (normalized.includes('typescript')) return 'TS';
  if (normalized.includes('react')) return '⚛';
  if (normalized.includes('node')) return 'N';
  if (normalized.includes('next')) return 'N>';
  return name.trim().slice(0, 2).toUpperCase();
};

const orbitTechOrder = [
  'Next.js',
  'React.js',
  'React Native',
  'TypeScript',
  'Tailwind CSS',
  'Shadcn UI',
  'Radix UI',
  'Expo',
  'Node.js',
  'Express.js',
  'JWT',
  'Prisma ORM',
  'PostgreSQL',
  'Neon DB',
  'MongoDB',
  'Firebase',
  'Supabase',
  'TanStack Query',
  'Redux Toolkit',
  'Git',
  'Vercel',
];

const getOrbitIcon = (name: string): SimpleIcon | null => {
  const normalized = name.toLowerCase();
  if (normalized.includes('next')) return siNextdotjs;
  if (normalized.includes('react')) return siReact;
  if (normalized.includes('typescript')) return siTypescript;
  if (normalized.includes('tailwind')) return siTailwindcss;
  if (normalized.includes('shadcn')) return siShadcnui;
  if (normalized.includes('radix')) return siRadixui;
  if (normalized.includes('expo')) return siExpo;
  if (normalized.includes('node')) return siNodedotjs;
  if (normalized.includes('express')) return siExpress;
  if (normalized.includes('jwt')) return siJsonwebtokens;
  if (normalized.includes('prisma')) return siPrisma;
  if (normalized.includes('postgres')) return siPostgresql;
  if (normalized.includes('neon')) return siNeon;
  if (normalized.includes('mongo')) return siMongodb;
  if (normalized.includes('firebase')) return siFirebase;
  if (normalized.includes('supabase')) return siSupabase;
  if (normalized.includes('tanstack')) return siTanstack;
  if (normalized.includes('redux')) return siRedux;
  if (normalized === 'git') return siGit;
  if (normalized === 'vercel') return siVercel;
  return null;
};

const TechMark: React.FC<{ name: string }> = ({ name }) => {
  const normalized = name.toLowerCase();
  const icon = getOrbitIcon(name);

  if (icon) {
    const isNext = normalized.includes('next');
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={`tech-orbit-icon ${isNext ? 'tech-orbit-icon-next' : ''}`} fill="currentColor" style={{ color: isNext ? 'var(--c-fg-strong)' : `#${icon.hex}` }}>
        <path d={icon.path} />
      </svg>
    );
  }

  if (normalized.includes('tailwind')) {
    return <svg viewBox="0 0 24 24" aria-hidden="true" className="tech-orbit-icon tech-orbit-icon-tailwind"><path d="M5 14.5c1.3-4.4 3.6-6.6 6.9-6.6 4.9 0 4 4.9 7.1 4.9 1.2 0 2.2-.4 3-1.2-1.3 4.4-3.6 6.6-6.9 6.6-4.9 0-4-4.9-7.1-4.9-1.2 0-2.2.4-3 1.2Z" /></svg>;
  }

  return <span className="tech-orbit-fallback-mark">{orbitGlyph(name)}</span>;
};

const FloatingTechOrbit: React.FC<{ skills: string[]; watermarkUrl: string | null }> = ({ skills, watermarkUrl }) => {
  const [active, setActive] = useState(false);
  const uniqueSkills = skills.filter(Boolean).filter((skill, index, all) => all.indexOf(skill) === index);
  const selectedSkills = orbitTechOrder
    .map((preferred) => uniqueSkills.find((skill) => {
      const value = skill.toLowerCase();
      if (preferred === 'React.js') return value.includes('react.js');
      if (preferred === 'React Native') return value.includes('react native');
      if (preferred === 'Next.js') return value.includes('next.js');
      return value.includes(preferred.toLowerCase().replace(' orm', '').replace(' toolkit', ''));
    }))
    .filter((skill, index, all): skill is string => Boolean(skill) && all.indexOf(skill) === index);
  const orbitItems = selectedSkills.map((skill, index) => ({ skill, ring: index % 2 }));
  const ringCounts = [0, 1].map((ring) => orbitItems.filter((item) => item.ring === ring).length);
  const ringPositions = [0, 1].map(() => 0);

  if (!orbitItems.length) return null;

  return (
    <div
      className={`tech-orbit ${active ? 'is-active' : ''}`}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
    >
      <div className="tech-orbit-stage" aria-hidden={!active}>
        <div className="tech-orbit-ring tech-orbit-ring-inner" />
        <div className="tech-orbit-ring tech-orbit-ring-outer" />
        <div className="tech-orbit-track">
          {orbitItems.map(({ skill, ring }) => {
            const position = ringPositions[ring]++;
            const delay = `${-((14 / ringCounts[ring]) * position).toFixed(3)}s`;
            return (
              <div className={`tech-orbit-item tech-orbit-item-${ring === 0 ? 'inner' : 'outer'}`} key={skill} style={{ '--orbit-delay': delay } as React.CSSProperties}>
                <button
                  type="button"
                  className="tech-orbit-badge"
                  aria-label={skill}
                  tabIndex={active ? 0 : -1}
                >
                  <TechMark name={skill} />
                  <span className="tech-orbit-label">{skill}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <button type="button" className="tech-orbit-core" aria-label="Show technologies used by Sayed Muhammad" onClick={() => setActive((value) => !value)}>
        <span className="tech-orbit-core-glow" aria-hidden="true" />
        <img src={watermarkUrl ?? watermarkImg} alt="" aria-hidden="true" />
      </button>
    </div>
  );
};

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
  const { profile, hero, site, theme, navigation, skillBlocks } = useContent();
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const typed = useTypewriter(hero.terminalLines);
  const { open: openHire } = useHireMe();

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
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-bg">
        <video
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
          className="absolute inset-0 h-full w-full max-w-none object-cover object-center"
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

      </div>

      <FloatingTechOrbit skills={skillBlocks.flatMap((block) => block.items)} watermarkUrl={theme.watermarkUrl} />

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
            {theme.logoUrl ? <img src={theme.logoUrl} alt="" className="w-8 h-8 object-contain" /> : <span className="grid place-items-center w-8 h-8 border border-gold/60 text-[10px] tracking-normal text-gold">{profile.initials}</span>}
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
              href="#hire-me"
              onClick={(event) => { event.preventDefault(); openHire(); }}
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
                <ButtonLink href="#hire-me" variant="primary" block icon="↗" onClick={(event) => { event.preventDefault(); setMenuOpen(false); openHire(); }}>
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
