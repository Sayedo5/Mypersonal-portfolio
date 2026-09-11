import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useContent } from '../content/ContentProvider';
import { SectionHeader } from './SectionHeader';

export const ExperienceSection: React.FC = () => {
  const { journey, sections } = useContent();
  const section = sections.experience;
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 70%', 'end 90%'],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <section
      id="experience"
      ref={containerRef}
      className="relative w-full bg-bg text-fg py-16 sm:py-20 px-5 sm:px-8 lg:px-20 overflow-hidden"
    >
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[36rem] h-[36rem] rounded-full blur-[150px] pointer-events-none"
        style={{ background: 'var(--glow-gold)' }}
      />

      <div className="max-w-4xl mx-auto w-full relative z-10">
        <SectionHeader
          eyebrow={section.eyebrow}
          titleTop={section.titleTop}
          titleBottom={section.titleBottom}
          lede={section.lede ?? undefined}
          ledeAside={section.ledeAside}
          className="mb-14"
        />

        <div className="relative w-full">
          {/* Track: left-aligned on mobile, gutter-aligned on desktop */}
          <div className="absolute left-[5px] md:left-[161px] top-3 bottom-6 w-px bg-line" />
          <motion.div
            style={{ height: lineHeight }}
            className="absolute left-[5px] md:left-[161px] top-3 w-[2px] bg-gradient-to-b from-gold via-gold-deep to-transparent origin-top"
          />

          <ol className="space-y-10 sm:space-y-12">
            {journey.map((stop, idx) => (
              <motion.li
                key={stop.id}
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.7, delay: idx * 0.06 }}
                className="relative flex flex-col md:flex-row items-start group"
              >
                {/* Desktop date gutter */}
                <div className="hidden md:block w-[161px] shrink-0 pr-8 pt-1 text-right">
                  <span className="font-mono text-[9.5px] tracking-[0.14em] text-fg-subtle transition-colors group-hover:text-gold">
                    {stop.year}
                  </span>
                </div>

                {/* Node */}
                <span className="absolute left-[5px] md:left-[161px] top-2 -translate-x-1/2 flex items-center justify-center">
                  <span
                    className={`w-2.5 h-2.5 rounded-full border transition-colors duration-300 ${
                      stop.current
                        ? 'bg-gold border-gold shadow-[0_0_12px_var(--c-gold)]'
                        : 'bg-surface-2 border-bronze group-hover:bg-gold group-hover:border-gold'
                    }`}
                  />
                </span>

                {/* Content */}
                <div className="pl-7 md:pl-10 w-full">
                  <div className="md:hidden mb-2">
                    <span className="font-mono text-[9.5px] tracking-[0.14em] text-gold">
                      {stop.year}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-1.5">
                    <h3 className="font-display text-[1.7rem] sm:text-[2rem] tracking-wide text-fg-strong leading-none transition-colors group-hover:text-gold">
                      {stop.title}
                    </h3>
                    {stop.current && (
                      <span className="px-2 py-0.5 font-body text-[8.5px] font-semibold tracking-[0.16em] uppercase border border-gold/50 text-gold bg-gold/10 rounded-[2px]">
                        CURRENT
                      </span>
                    )}
                  </div>

                  <span className="block font-body text-[9.5px] font-semibold tracking-[0.18em] uppercase text-fg-subtle mb-2.5">
                    {stop.organization}
                    {stop.location && (
                      <span className="text-fg-subtle/70"> · {stop.location}</span>
                    )}
                  </span>

                  <p className="font-body text-[12.5px] sm:text-[13px] font-light text-fg-muted leading-[1.8] max-w-lg">
                    {stop.description}
                  </p>

                  {/* Optional achievement bullets. Empty by default, so the
                      timeline renders exactly as it did before. */}
                  {stop.achievements.length > 0 && (
                    <ul className="mt-3 space-y-2 max-w-lg">
                      {stop.achievements.map((achievement) => (
                        <li
                          key={achievement}
                          className="flex items-start gap-2.5 font-body text-[12px] font-light text-fg-muted leading-relaxed"
                        >
                          <span className="text-gold mt-px shrink-0" aria-hidden="true">
                            ✦
                          </span>
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;
