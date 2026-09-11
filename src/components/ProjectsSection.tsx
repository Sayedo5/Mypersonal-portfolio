import React from 'react';
import { motion } from 'framer-motion';
import ScrollStack, { ScrollStackItem } from './ScrollStack';
import { profile, projects } from '../data/profile';
import { SectionHeader } from './SectionHeader';
import { ButtonLink } from './Button';
import { useMediaQuery } from '../hooks/useMediaQuery';

type Project = (typeof projects)[number];

/**
 * A single project card. Rendered inside the ScrollStack deck on desktop
 * and as a plain stacked list on phones and tablets, where the sticky
 * transform deck fights the browser's own scrolling.
 */
const ProjectCard: React.FC<{ project: Project }> = ({ project }) => (
  <article className="group relative w-full rounded-lg border border-line bg-surface p-6 sm:p-9 lg:p-12 overflow-hidden transition-colors duration-500 hover:border-gold">
    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />

    <span className="corner-pin top-0 left-0 w-4 h-4 border-t-2 border-l-2" />
    <span className="corner-pin top-0 right-0 w-4 h-4 border-t-2 border-r-2" />
    <span className="corner-pin bottom-0 left-0 w-4 h-4 border-b-2 border-l-2" />
    <span className="corner-pin bottom-0 right-0 w-4 h-4 border-b-2 border-r-2" />

    <span
      className="absolute -bottom-6 -right-3 font-display text-[6rem] sm:text-9xl text-fg/5 select-none pointer-events-none leading-none"
      aria-hidden="true"
    >
      {project.number}
    </span>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-8 items-start relative z-10">

      {/* Left: identity + description */}
      <div className="lg:col-span-7 flex flex-col">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3">
          <span className="font-mono text-[11px] font-semibold text-gold">{project.number} //</span>
          <span className="label-mono text-fg-muted">{project.category}</span>
        </div>

        <h3 className="font-display text-[2.4rem] sm:text-5xl lg:text-6xl tracking-tight text-fg-strong mb-4 uppercase leading-[0.9] transition-colors group-hover:text-gold">
          {project.title}
        </h3>

        <p className="font-body text-[12.5px] sm:text-[14px] font-light text-fg-muted leading-[1.85] mb-7 max-w-2xl">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-2 mt-auto pt-5 border-t border-line-soft">
          {project.tech.map((t) => (
            <span
              key={t}
              className="px-2.5 py-1 font-body text-[9.5px] font-medium tracking-[0.14em] uppercase rounded-[2px] border border-line bg-surface-3 text-fg-muted transition-colors duration-300 group-hover:border-gold/40"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Right: metrics + links */}
      <div className="lg:col-span-5 flex flex-col gap-5 lg:pl-8 lg:border-l lg:border-line-soft">
        <div className="space-y-2.5">
          <span className="label-mono text-fg-subtle block mb-1">// PROJECT METRICS</span>
          {project.metrics.map((m) => (
            <div
              key={m.label}
              className="px-3.5 py-3 rounded-[2px] border border-line-soft bg-bg-alt flex items-center justify-between gap-3"
            >
              <span className="font-mono text-[9.5px] tracking-wider uppercase text-fg-muted">
                {m.label}
              </span>
              <span className="font-mono text-[10.5px] font-medium text-gold text-right">
                {m.value}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2.5">
          {project.liveUrl && (
            <ButtonLink href={project.liveUrl} variant="primary" block icon="↗" external>
              View live site
            </ButtonLink>
          )}
          {project.githubUrl && (
            <ButtonLink href={project.githubUrl} variant="outline" block icon="↗" external>
              View on GitHub
            </ButtonLink>
          )}
        </div>
      </div>
    </div>
  </article>
);

export const ProjectsSection: React.FC = () => {
  // The stacking deck needs real scroll runway and a fine pointer; below
  // that it degrades into a janky, hard-to-read experience.
  const useDeck = useMediaQuery('(min-width: 1024px)');

  return (
    <section
      id="work"
      className="relative w-full bg-bg text-fg pt-20 pb-24 sm:pb-32 px-5 sm:px-8 lg:px-20"
    >
      <div
        className="absolute top-1/4 left-1/3 w-[32rem] h-[32rem] rounded-full blur-[170px] pointer-events-none"
        style={{ background: 'var(--glow-gold)' }}
      />

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <SectionHeader
          eyebrow="03 / FEATURED WORK"
          titleTop="SHIPPED TO"
          titleBottom="PRODUCTION."
          lede="Real products with the scope, stack and numbers attached — no concept pieces."
          ledeAside
          className="mb-12 lg:mb-16"
        />

        {useDeck ? (
          <ScrollStack
            itemDistance={20}
            itemScale={0.035}
            itemStackDistance={28}
            stackPosition="15%"
            scaleEndPosition="6%"
            baseScale={0.88}
            useWindowScroll
          >
            {projects.map((project) => (
              <ScrollStackItem key={project.title}>
                <ProjectCard project={project} />
              </ScrollStackItem>
            ))}
          </ScrollStack>
        ) : (
          <div className="space-y-6">
            {projects.map((project) => (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </div>
        )}

        <p className="font-body text-[11.5px] font-light text-fg-muted mt-8">
          More repositories and work in progress on{' '}
          <a
            href={profile.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold hover:underline underline-offset-4 transition-colors"
          >
            {profile.githubLabel} ↗
          </a>
        </p>
      </div>
    </section>
  );
};

export default ProjectsSection;
