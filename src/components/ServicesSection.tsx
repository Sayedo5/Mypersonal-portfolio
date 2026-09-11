import React from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { guarantees, services } from '../data/profile';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.14, delayChildren: 0.1 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
  },
};

export const ServicesSection: React.FC = () => {
  return (
    <section
      id="services"
      className="relative w-full bg-black text-[#E8DFD8] font-sans selection:bg-[#cbb59d] selection:text-black pt-20 pb-24 px-6 sm:px-12 lg:px-20 overflow-hidden"
    >
      {/* Ambient Glows */}
      <div className="absolute top-1/4 right-1/4 w-[32rem] h-[32rem] bg-[#D4AF37]/5 rounded-full blur-[170px] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full relative z-10">

        {/* Eyebrow Header */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex items-center space-x-4 mb-7"
        >
          <span
            className="text-[11px] font-medium tracking-[0.35em] uppercase text-[#D4AF37]"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            02 / HOW WE WORK
          </span>
          <div className="w-20 h-[1px] bg-gradient-to-r from-[#D4AF37]/80 via-[#8C6D4F]/40 to-transparent" />
        </motion.div>

        {/* Section Headline */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6"
        >
          <h2
            className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] tracking-tight uppercase leading-[0.85] select-none"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            <span className="block text-transparent bg-clip-text bg-gradient-to-b from-[#FFFFFF] via-[#D5CBC0] to-[#605448] drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
              WHAT I BUILD
            </span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-b from-[#F7E7C4] via-[#C99E5D] to-[#543B1A] drop-shadow-[0_8px_25px_rgba(201,158,93,0.35)]">
              FOR CLIENTS.
            </span>
          </h2>

          <p
            className="text-xs sm:text-sm font-light text-[#A8988B] max-w-sm leading-relaxed"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            Three ways clients bring me in. Each one ends with something running in production — not a
            prototype, and not a handover document.
          </p>
        </motion.div>

        {/* Service Panels */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20"
        >
          {services.map((service) => (
            <motion.article
              key={service.id}
              variants={cardVariants}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className="relative flex flex-col p-8 rounded-sm border border-[#8C6D4F]/35 bg-[#100D0B]/85 backdrop-blur-xl overflow-hidden transition-all duration-500 hover:border-[#D4AF37]/80 hover:shadow-[0_16px_45px_rgba(212,175,55,0.14)] group"
            >
              {/* Top Border Highlight */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Corner Pins */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#D4AF37]/40 group-hover:border-[#D4AF37] transition-colors duration-300" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#D4AF37]/40 group-hover:border-[#D4AF37] transition-colors duration-300" />

              {/* Watermark number */}
              <span
                className="absolute -bottom-5 -right-1 text-8xl font-bold text-[#EAD8C7]/5 select-none pointer-events-none leading-none"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                aria-hidden="true"
              >
                {service.number}
              </span>

              <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-[#D4AF37] mb-5 relative z-10">
                {service.number} //
              </span>

              <h3
                className="text-3xl sm:text-[2.1rem] font-normal tracking-wide text-white mb-4 group-hover:text-[#F7E7C4] transition-colors leading-none relative z-10"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                {service.title}
              </h3>

              <p
                className="text-xs sm:text-[13px] text-[#A8988B] font-light leading-[1.8] mb-7 group-hover:text-[#D5CBC0] transition-colors relative z-10"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                {service.description}
              </p>

              <ul className="mt-auto space-y-2.5 pt-5 border-t border-[#8C6D4F]/20 relative z-10">
                {service.points.map((point) => (
                  <li
                    key={point}
                    className="flex items-start gap-2.5 text-[11.5px] font-light text-[#BDB0A4] leading-relaxed"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    <span className="text-[#D4AF37] mt-px shrink-0" aria-hidden="true">
                      ✦
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </motion.div>

        {/* ================= DELIVERY GUARANTEES ================= */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center space-x-4 mb-8">
            <span
              className="text-[10px] font-medium tracking-[0.3em] uppercase text-[#8C6D4F]"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              // WHAT YOU GET, EVERY TIME
            </span>
            <div className="flex-1 h-[1px] bg-gradient-to-r from-[#8C6D4F]/40 to-transparent" />
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#8C6D4F]/20 border border-[#8C6D4F]/20 rounded-sm overflow-hidden">
            {guarantees.map((g) => (
              <div key={g.title} className="bg-[#0A0806] p-6 group hover:bg-[#100D0B] transition-colors duration-300">
                <dt className="flex items-center gap-2.5 mb-3">
                  <span className="text-[#D4AF37] text-xs" aria-hidden="true">
                    ✓
                  </span>
                  <span
                    className="text-[11px] font-medium tracking-[0.18em] uppercase text-[#F3DBB3]"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    {g.title}
                  </span>
                </dt>
                <dd
                  className="text-[11.5px] font-light text-[#A8988B] leading-[1.75] pl-[26px]"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
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
