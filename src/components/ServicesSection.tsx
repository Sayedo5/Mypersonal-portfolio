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

export const ServicesSection: React.FC = () => {
  const { services, guarantees, sections } = useContent();
  const section = sections.services;

  return (
  <section
    id="services"
    className="relative w-full bg-bg text-fg py-20 sm:py-24 px-5 sm:px-8 lg:px-20 overflow-hidden"
  >
    <div
      className="absolute top-1/4 right-0 w-[30rem] h-[30rem] rounded-full blur-[160px] pointer-events-none"
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

      {/* ---------- Service panels ---------- */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-16 sm:mb-20"
      >
        {services.map((service) => (
          <motion.article
            key={service.id}
            variants={cardVariants}
            className="group relative flex flex-col p-6 sm:p-8 rounded-[2px] border border-line bg-surface/85 backdrop-blur-xl overflow-hidden transition-all duration-500 hover:border-gold hover:-translate-y-1.5"
          >
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span className="corner-pin top-0 left-0 border-t border-l" />
            <span className="corner-pin bottom-0 right-0 border-b border-r" />

            <span
              className="absolute -bottom-5 -right-1 font-display text-8xl text-fg/5 select-none pointer-events-none leading-none"
              aria-hidden="true"
            >
              {service.number}
            </span>

            <span className="label-mono text-gold mb-5 relative z-10">{service.number} //</span>

            <h3 className="font-display text-[1.9rem] sm:text-[2.1rem] tracking-wide text-fg-strong mb-3 leading-none relative z-10 transition-colors group-hover:text-gold">
              {service.title}
            </h3>

            <p className="font-body text-[12.5px] sm:text-[13px] font-light text-fg-muted leading-[1.8] mb-6 relative z-10">
              {service.description}
            </p>

            <ul className="mt-auto space-y-2.5 pt-5 border-t border-line-soft relative z-10">
              {service.points.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-2.5 font-body text-[11.5px] font-light text-fg-muted leading-relaxed"
                >
                  <span className="text-gold mt-px shrink-0" aria-hidden="true">
                    ✦
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </motion.article>
        ))}
      </motion.div>

      {/* ---------- Delivery guarantees ---------- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="flex items-center gap-4 mb-7">
          <span className="label-mono text-fg-subtle">// WHAT YOU GET, EVERY TIME</span>
          <div className="flex-1 h-px bg-gradient-to-r from-bronze to-transparent" />
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-line border border-line rounded-[2px] overflow-hidden">
          {guarantees.map((g) => (
            <div key={g.title} className="bg-surface p-5 sm:p-6 transition-colors duration-300 hover:bg-surface-3">
              <dt className="flex items-start gap-2.5 mb-3">
                <span className="text-gold text-xs mt-px" aria-hidden="true">
                  ✓
                </span>
                <span className="font-body text-[10.5px] font-semibold tracking-[0.16em] uppercase text-fg leading-snug">
                  {g.title}
                </span>
              </dt>
              <dd className="font-body text-[11.5px] font-light text-fg-muted leading-[1.75] pl-[26px]">
                {g.detail}
              </dd>
            </div>
          ))}
        </dl>
      </motion.div>
    </div>
  </section>
  );
};

export default ServicesSection;
