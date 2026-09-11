import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import type { Variants } from 'framer-motion';
import aboutImg from '../assets/about.jpg';
import { useContent } from '../content/ContentProvider';
import { SectionHeader } from './SectionHeader';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.16, delayChildren: 0.1 } },
};

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 28, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] },
  },
};

export const AboutSection: React.FC = () => {
  const { profile, stats, theme, sections } = useContent();
  const section = sections.about;
  const valueProps = profile.workingPrinciples;
  const cardRef = useRef<HTMLDivElement>(null);
  const [isCardHovered, setIsCardHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const spotlightX = useMotionValue(200);
  const spotlightY = useMotionValue(200);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [14, -14]), {
    damping: 18,
    stiffness: 220,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-14, 14]), {
    damping: 18,
    stiffness: 220,
  });

  const spotlightBg = useTransform(
    [spotlightX, spotlightY],
    ([x, y]) =>
      `radial-gradient(circle 240px at ${x}px ${y}px, rgba(255,255,255,0.32), rgba(212,175,55,0.18), transparent 80%)`,
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    spotlightX.set(e.clientX - rect.left);
    spotlightY.set(e.clientY - rect.top);
  };

  const handleMouseLeave = () => {
    setIsCardHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <section
      id="about"
      className="relative w-full bg-bg text-fg py-20 sm:py-24 lg:py-32 px-5 sm:px-8 lg:px-20 overflow-hidden"
    >
      {/* Ambient glows */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 -left-20 w-[28rem] h-[28rem] rounded-full blur-[150px] pointer-events-none"
        style={{ background: 'var(--glow-gold)' }}
      />

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <SectionHeader
          eyebrow={section.eyebrow}
          titleTop={section.titleTop}
          titleBottom={section.titleBottom}
          lede={section.lede ?? undefined}
          ledeAside={section.ledeAside}
          className="mb-12 lg:mb-16"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* ---------- Left: copy ---------- */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="lg:col-span-7 order-2 lg:order-1"
          >
            <motion.p
              variants={fadeUpVariants}
              className="font-body text-[13px] sm:text-[14.5px] font-light text-fg-muted leading-[1.9] mb-8 max-w-xl"
            >
              I&apos;m <span className="text-gold font-medium">{profile.name}</span>, a full-stack web
              and mobile developer based in {profile.location}. {profile.longBiography}
            </motion.p>

            <motion.ul variants={fadeUpVariants} className="space-y-3 mb-10 max-w-xl">
              {valueProps.map((line) => (
                <li
                  key={line}
                  className="flex items-start gap-3 font-body text-[12.5px] sm:text-[13px] font-light text-fg-muted leading-relaxed"
                >
                  <span className="text-gold mt-0.5 shrink-0" aria-hidden="true">
                    ✦
                  </span>
                  {line}
                </li>
              ))}
            </motion.ul>

            {/* Metrics */}
            <motion.dl
              variants={fadeUpVariants}
              className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-5 pt-7 border-t border-line"
            >
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col">
                  <dd
                    className={`font-display text-[2.1rem] sm:text-[2.4rem] leading-none tracking-tight ${
                      stat.gold ? 'text-gold' : 'text-fg-strong'
                    }`}
                  >
                    {stat.value}
                  </dd>
                  <dt className="font-body text-[9.5px] font-medium tracking-[0.18em] uppercase text-fg-muted mt-2 leading-snug">
                    {stat.label}
                  </dt>
                </div>
              ))}
            </motion.dl>
          </motion.div>

          {/* ---------- Right: portrait ---------- */}
          <div className="lg:col-span-5 order-1 lg:order-2 flex items-center justify-center relative [perspective:1400px]">
            <motion.div
              animate={{
                scale: isCardHovered ? 1.12 : 1,
                opacity: isCardHovered ? 0.35 : 0.16,
                rotate: isCardHovered ? 180 : 0,
              }}
              transition={{ duration: 3, ease: 'easeOut' }}
              className="absolute -inset-5 bg-[conic-gradient(from_0deg,var(--c-gold)_0%,var(--c-bronze)_30%,transparent_60%,var(--c-gold)_100%)] blur-2xl rounded-3xl pointer-events-none"
            />

            <motion.div
              ref={cardRef}
              style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsCardHovered(true)}
              onMouseLeave={handleMouseLeave}
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              className="group relative p-3 sm:p-3.5 w-full max-w-[330px] sm:max-w-[380px] border border-line rounded-[2px] bg-surface-2/80 backdrop-blur-xl transition-colors duration-500 hover:border-gold"
              // Card shadow follows the active theme.
            >
              <div className="absolute inset-0 rounded-[2px] pointer-events-none overflow-hidden">
                <motion.div
                  animate={{ x: isCardHovered ? ['-100%', '200%'] : '-100%' }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
                  className="w-1/2 h-full bg-gradient-to-r from-transparent via-gold/25 to-transparent skew-x-12"
                />
              </div>

              {/* Corner brackets */}
              <div className="pointer-events-none">
                <span className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-gold transition-transform duration-500 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5" />
                <span className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-gold transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                <span className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-gold transition-transform duration-500 group-hover:-translate-x-0.5 group-hover:translate-y-0.5" />
                <span className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-gold transition-transform duration-500 group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
              </div>

              <div className="relative overflow-hidden w-full aspect-4/5 bg-bg rounded-[2px]">
                <img
                  src={theme.portraitUrl ?? aboutImg}
                  alt={`${profile.name}, ${profile.professionalTitle}`}
                  loading="lazy"
                  width={800}
                  height={1000}
                  className="w-full h-full object-cover object-top transition-all duration-700 ease-out group-hover:scale-[1.03]"
                />

                <motion.div
                  className="absolute inset-0 pointer-events-none mix-blend-overlay transition-opacity duration-300"
                  style={{ background: spotlightBg, opacity: isCardHovered ? 1 : 0 }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent pointer-events-none" />

                <div className="absolute bottom-3 right-4 z-20 select-none">
                  <span className="font-script text-3xl text-gold-soft drop-shadow-[0_0_12px_rgba(0,0,0,0.6)] transition-colors duration-300 group-hover:text-white">
                    {profile.firstName}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AboutSection;
