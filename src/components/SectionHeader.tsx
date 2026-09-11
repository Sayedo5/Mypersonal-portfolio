import React from 'react';
import { motion } from 'framer-motion';

interface SectionHeaderProps {
  /** e.g. "01 / ABOUT ME" */
  eyebrow: string;
  /** First headline line, rendered in the neutral gradient. */
  titleTop: string;
  /** Second headline line, rendered in the gold gradient. */
  titleBottom: string;
  /** Optional supporting paragraph shown beside or below the headline. */
  lede?: string;
  /** Place the lede to the right of the headline on desktop. */
  ledeAside?: boolean;
  className?: string;
}

/**
 * The eyebrow + two-line gradient headline used at the top of every
 * section. Centralised so type scale and spacing never drift apart.
 */
export const SectionHeader: React.FC<SectionHeaderProps> = ({
  eyebrow,
  titleTop,
  titleBottom,
  lede,
  ledeAside = false,
  className = '',
}) => (
  <div className={className}>
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="flex items-center gap-4 mb-6"
    >
      <span className="label-mono text-gold">{eyebrow}</span>
      <div className="w-16 sm:w-20 h-px bg-gradient-to-r from-gold via-bronze to-transparent" />
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className={
        ledeAside
          ? 'flex flex-col md:flex-row md:items-end justify-between gap-5 md:gap-10'
          : ''
      }
    >
      <h2 className="headline text-[2.75rem] min-[400px]:text-[3.25rem] sm:text-6xl md:text-7xl lg:text-[5.25rem] select-none">
        <span className="headline headline-neutral block">{titleTop}</span>
        <span className="headline headline-gold block">{titleBottom}</span>
      </h2>

      {lede && (
        <p
          className={`font-body text-[13px] sm:text-sm font-light text-fg-muted leading-[1.8] ${
            ledeAside ? 'max-w-sm md:pb-2' : 'max-w-xl mt-5'
          }`}
        >
          {lede}
        </p>
      )}
    </motion.div>
  </div>
);

export default SectionHeader;
