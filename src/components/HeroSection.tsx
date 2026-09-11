import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import watermarkImg from '../assets/watermark.png';
import { profile, terminalLines } from '../data/profile';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.16,
      delayChildren: 0.2,
    },
  },
};

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 18, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 1.1,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const navItems = [
  { name: 'ABOUT', href: '#about' },
  { name: 'SERVICES', href: '#services' },
  { name: 'WORK', href: '#work' },
  { name: 'SKILLS', href: '#skills' },
  { name: 'EXPERIENCE', href: '#experience' },
  { name: 'CONTACT', href: '#contact' },
];

/**
 * Typewriter cycling the availability phrases in the hero terminal line.
 * All progression state lives inside the effect so React StrictMode's
 * double-invocation cannot start two competing timer chains.
 */
function useTypewriter(lines: readonly string[]) {
  const [text, setText] = useState('');

  useEffect(() => {
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
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const typed = useTypewriter(terminalLines);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
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
    <section className="relative w-full min-h-screen overflow-hidden bg-black text-[#E8DFD8] font-sans selection:bg-[#cbb59d] selection:text-black lg:cursor-none">
      {/* ================= 1. MINIMAL CUSTOM CURSOR (desktop only) ================= */}
      {cursorPos.x >= 0 && (
        <motion.div
          className="fixed top-0 left-0 pointer-events-none z-50 rounded-full border border-[#D4AF37]/40 hidden lg:flex items-center justify-center backdrop-blur-[1px]"
          animate={{
            x: cursorPos.x - (isHovered ? 24 : 5),
            y: cursorPos.y - (isHovered ? 24 : 5),
            width: isHovered ? 48 : 10,
            height: isHovered ? 48 : 10,
            backgroundColor: isHovered ? 'rgba(212, 175, 55, 0.1)' : 'rgba(235, 215, 195, 0.95)',
          }}
          transition={{ type: 'spring', damping: 30, stiffness: 350, mass: 0.5 }}
        />
      )}

      {/* ================= 2. FIXED VIDEO LAYER ================= */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-black flex items-center justify-end">
        <video
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
          className="h-screen w-auto max-w-none object-contain origin-right scale-95 md:scale-[0.98] lg:scale-100 opacity-60 sm:opacity-100"
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>

        {/* Seamless Soft Left Edge Blend */}
        <div className="absolute inset-y-0 left-0 w-full sm:w-3/4 lg:w-1/2 bg-gradient-to-r from-black via-black/90 sm:via-black/85 to-transparent pointer-events-none" />

        {/* ================= 3. ANIMATED WATERMARK EMBLEM ================= */}
        <div className="absolute bottom-6 right-6 lg:bottom-10 lg:right-12 pointer-events-none hidden sm:flex items-center justify-center z-10">
          <div className="relative flex items-center justify-center">
            <div className="absolute w-36 h-36 bg-black/85 rounded-full blur-xl" />

            <motion.div
              animate={{
                y: [-3, 3, -3],
                scale: [1, 1.03, 1],
              }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative flex items-center justify-center"
            >
              <img
                src={watermarkImg}
                alt=""
                aria-hidden="true"
                className="w-28 h-28 lg:w-32 lg:h-32 object-contain drop-shadow-[0_0_15px_rgba(212,175,55,0.25)]"
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* ================= 4. CONTENT LAYER ================= */}
      <div className="relative z-10 flex flex-col justify-between min-h-screen w-full px-6 sm:px-12 lg:px-16 pt-6 pb-10 pointer-events-none">

        {/* Navigation Bar */}
        <header className="relative flex items-center justify-between w-full pointer-events-auto">
          <a
            href="#top"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold tracking-[0.3em] uppercase text-[#EAD8C7] hover:opacity-75 transition-opacity"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            <span className="grid place-items-center w-7 h-7 border border-[#D4AF37]/60 text-[10px] tracking-normal text-[#D4AF37]">
              {profile.initials}
            </span>
            <span className="hidden sm:inline">SAYED MUHAMMAD</span>
          </a>

          {/* Desktop Navigation Links */}
          <nav
            aria-label="Primary"
            className="hidden lg:flex items-center space-x-7 xl:space-x-9 text-[11px] tracking-[0.24em] font-light uppercase text-[#C4B5A5] absolute left-1/2 -translate-x-1/2"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="relative group py-1 transition-colors duration-300 hover:text-[#FFF5EB]"
              >
                {item.name}
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#D4AF37]/50 transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3 ml-auto lg:ml-0">
            {/* Right Action */}
            <a
              href="#contact"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="group hidden sm:flex items-center space-x-2 text-[11px] tracking-[0.24em] font-light uppercase py-2 px-4 border border-[#8C6D4F]/50 hover:border-[#D4AF37] text-[#EAD8C7] transition-all duration-300 backdrop-blur-sm"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              <span>HIRE ME</span>
              <span className="transform transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-xs">
                ↗
              </span>
            </a>

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="lg:hidden p-2 border border-[#8C6D4F]/50 text-[#EAD8C7] hover:border-[#D4AF37] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                {menuOpen ? (
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                ) : (
                  <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                )}
              </svg>
            </button>
          </div>
        </header>

        {/* Mobile navigation panel */}
        {menuOpen && (
          <nav
            id="mobile-nav"
            aria-label="Sections"
            className="lg:hidden pointer-events-auto mt-4 border border-[#8C6D4F]/40 bg-[#0A0806]/95 backdrop-blur-md"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            <ul>
              {navItems.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="block px-5 py-3.5 text-[11px] tracking-[0.24em] uppercase text-[#C4B5A5] border-b border-[#8C6D4F]/20 hover:text-[#F7E7C4] hover:bg-[#16120E] transition-colors"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#contact"
                  onClick={() => setMenuOpen(false)}
                  className="block px-5 py-3.5 text-[11px] tracking-[0.24em] uppercase text-[#D4AF37]"
                >
                  HIRE ME ↗
                </a>
              </li>
            </ul>
          </nav>
        )}

        {/* Main Hero Row */}
        <div className="relative flex flex-col md:flex-row items-center justify-between w-full pt-10 pb-6 my-auto">

          {/* LEFT: Headline & Actions */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-sm sm:max-w-md md:max-w-lg lg:max-w-[37rem] xl:max-w-[40rem] pointer-events-auto z-20"
          >
            {/* Availability pill */}
            <motion.div variants={fadeUpVariants} className="mb-6 inline-flex items-center gap-2.5 py-1.5 pl-3 pr-4 border border-[#D4AF37]/30 bg-[#120F0C]/70 backdrop-blur-sm">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75 motion-safe:animate-ping" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#D4AF37]" />
              </span>
              <span
                className="text-[10px] tracking-[0.24em] uppercase text-[#E8D7C5]"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                Available for new projects
              </span>
            </motion.div>

            {/* Massive Condensed Headline */}
            <motion.div variants={fadeUpVariants} className="relative mb-4 select-none">
              <h1
                className="text-6xl sm:text-7xl md:text-8xl lg:text-[7rem] xl:text-[7.6rem] tracking-tight uppercase leading-[0.83]"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                <span className="block text-transparent bg-clip-text bg-gradient-to-b from-[#FFFFFF] via-[#D5CBC0] to-[#605448] drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)]">
                  SAYED
                </span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-b from-[#F7E7C4] via-[#C99E5D] to-[#543B1A] drop-shadow-[0_8px_25px_rgba(201,158,93,0.35)]">
                  MUHAMMAD
                </span>
              </h1>
            </motion.div>

            {/* Role line */}
            <motion.div variants={fadeUpVariants} className="mb-5">
              <p
                className="text-[10px] sm:text-[11px] md:text-xs font-normal tracking-[0.26em] uppercase text-[#C4B29E]"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                FULL STACK DEVELOPER <span className="text-[#8C6D4F] mx-1">•</span> REACT NATIVE{' '}
                <span className="text-[#8C6D4F] mx-1">•</span> NEXT.JS
              </p>
            </motion.div>

            {/* Terminal status line */}
            <motion.div
              variants={fadeUpVariants}
              className="mb-6 flex items-center gap-2 max-w-md px-3.5 py-2.5 border border-[#8C6D4F]/40 bg-[#0A0806]/80 backdrop-blur-sm overflow-hidden"
            >
              <span className="text-[#D4AF37] text-xs font-mono shrink-0" aria-hidden="true">
                $
              </span>
              <span className="text-[11px] sm:text-xs font-mono text-[#BDB0A4] truncate" aria-live="polite">
                {typed}
              </span>
              <span
                className="w-[7px] h-[13px] bg-[#D4AF37] shrink-0 motion-safe:animate-pulse"
                aria-hidden="true"
              />
            </motion.div>

            {/* Description */}
            <motion.div
              variants={fadeUpVariants}
              className="text-xs sm:text-sm md:text-[13.5px] font-light text-[#A8988B] leading-[1.85] tracking-wide max-w-lg mb-8"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              <p>
                I build <span className="text-[#E8D7C5]">Next.js web platforms</span>,{' '}
                <span className="text-[#E8D7C5]">React Native mobile apps</span> and the{' '}
                <span className="text-[#E8D7C5]">Node.js APIs</span> underneath them — all sharing one
                database and one API layer.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeUpVariants}
              className="flex flex-wrap items-center gap-3 sm:gap-4"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              <motion.a
                href="#work"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                whileHover={{ scale: 1.02 }}
                className="group relative inline-flex items-center space-x-3 px-6 sm:px-7 py-3.5 border border-[#8C6D4F] bg-[#120F0C]/80 hover:border-[#D4AF37] text-[#EAD8C7] hover:text-[#FFF5EB] text-[11px] font-medium tracking-[0.24em] uppercase transition-all duration-300 shadow-[0_0_25px_rgba(212,175,55,0.18)]"
              >
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#E8D7C5]/40 to-transparent pointer-events-none" />
                <span>EXPLORE MY WORK</span>
                <span className="transform transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-xs">
                  ↗
                </span>
              </motion.a>

              <motion.a
                href={profile.resume}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                whileHover={{ scale: 1.02 }}
                className="group relative inline-flex items-center space-x-2 px-6 sm:px-7 py-3.5 border border-[#8C6D4F]/40 hover:border-[#8C6D4F] text-[#BFA895] hover:text-[#EAD8C7] text-[11px] font-medium tracking-[0.24em] uppercase transition-all duration-300"
              >
                <span>DOWNLOAD RESUME</span>
                <span className="transform transition-transform duration-300 group-hover:translate-y-0.5 text-xs">
                  ↓
                </span>
              </motion.a>
            </motion.div>
          </motion.div>

          {/* RIGHT: Quote & Signature Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:flex flex-col items-start pointer-events-auto pr-24 xl:pr-36 mr-4 z-20 select-none"
          >
            <span className="text-xl text-[#C99E5D] leading-none font-serif mb-2">“</span>

            <div
              className="text-[9.5px] font-medium tracking-[0.24em] uppercase text-[#E0D3C5] space-y-1 mb-3"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              <p>WEB, MOBILE AND API.</p>
              <p>ONE ENGINEER, ONE STACK.</p>
            </div>

            <div className="w-28 h-[1px] bg-gradient-to-r from-[#D4AF37] via-[#E8D7C5]/70 to-transparent shadow-[0_0_8px_rgba(212,175,55,0.4)] mb-2" />

            <div
              className="text-[2.2rem] text-[#D8AB64] font-normal leading-none -ml-0.5"
              style={{
                fontFamily: "'Herr Von Muellerhoff', 'Allura', cursive",
                letterSpacing: '0.04em',
              }}
            >
              {profile.firstName}
            </div>
          </motion.div>
        </div>

        {/* Scroll cue */}
        <div className="hidden md:flex items-center gap-3 pointer-events-none">
          <span
            className="text-[9.5px] tracking-[0.3em] uppercase text-[#8C6D4F]"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            SCROLL
          </span>
          <div className="w-16 h-[1px] bg-gradient-to-r from-[#8C6D4F] to-transparent" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
