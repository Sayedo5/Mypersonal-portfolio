import React from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useContent } from '../content/ContentProvider';
import { SectionHeader } from './SectionHeader';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.13, delayChildren: 0.08 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 28, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] },
  },
};

export const SkillsSection: React.FC = () => {
  const { skillBlocks, sections } = useContent();
  const section = sections.skills;

  return (
  <section
    id="skills"
    className="relative w-full bg-bg text-fg py-16 sm:py-20 px-5 sm:px-8 lg:px-20 overflow-hidden"
  >
    <div
      className="absolute top-1/3 left-1/4 w-[30rem] h-[30rem] rounded-full blur-[160px] pointer-events-none"
      style={{ background: 'var(--glow-gold)' }}
    />

    <div className="max-w-7xl mx-auto w-full relative z-10">
      <SectionHeader
        eyebrow={section.eyebrow}
        titleTop={section.titleTop}
        titleBottom={section.titleBottom}
        lede={section.lede ?? undefined}
        ledeAside={section.ledeAside}
        className="mb-12"
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-5"
      >
        {skillBlocks.map((block) => (
          <motion.div
            key={block.title}
            variants={cardVariants}
            className={`${block.colSpan} group relative p-6 sm:p-8 rounded-[2px] border border-line bg-surface/85 backdrop-blur-xl overflow-hidden transition-all duration-500 hover:border-gold hover:-translate-y-1`}
          >
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span className="corner-pin top-0 left-0 border-t border-l" />
            <span className="corner-pin bottom-0 right-0 border-b border-r" />

            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <span className="label-mono text-gold">{block.badge}</span>
              <span className="font-mono text-[9.5px] tracking-wider px-2.5 py-1 rounded-[2px] border border-line bg-surface-3 text-fg-muted whitespace-nowrap transition-colors group-hover:border-gold/40 group-hover:text-gold">
                {block.stat}
              </span>
            </div>

            <h3 className="font-display text-[1.9rem] sm:text-[2.2rem] tracking-wide text-fg-strong mb-3 leading-none transition-colors group-hover:text-gold">
              {block.title}
            </h3>

            <p className="font-body text-[12.5px] sm:text-[13px] font-light text-fg-muted leading-[1.8] mb-6 max-w-xl">
              {block.description}
            </p>

            <ul className="flex flex-wrap gap-2 pt-4 border-t border-line-soft">
              {block.items.map((tech) => (
                <li
                  key={tech}
                  className="px-3 py-1.5 font-body text-[9.5px] font-medium tracking-[0.14em] uppercase rounded-[2px] border border-line bg-surface-3 text-fg-muted transition-all duration-300 group-hover:border-gold/40 group-hover:text-fg"
                >
                  {tech}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
  );
};

export default SkillsSection;
