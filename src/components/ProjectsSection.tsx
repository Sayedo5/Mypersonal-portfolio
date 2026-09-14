import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ScrollStack, { ScrollStackItem } from './ScrollStack';
import { useContent } from '../content/ContentProvider';
import type { ProjectContent } from '../data/content-types';
import { SectionHeader } from './SectionHeader';
import { ButtonLink } from './Button';
import { useMediaQuery } from '../hooks/useMediaQuery';

type Project = ProjectContent;

/**
 * A single project card. Rendered inside the ScrollStack deck on desktop
 * and as a plain stacked list on phones and tablets, where the sticky
 * transform deck fights the browser's own scrolling.
 */
const ProjectCard: React.FC<{ project: Project; onOpen: (project: Project) => void }> = ({ project, onOpen }) => (
  <article role="button" tabIndex={0} aria-label={`Open details for ${project.title}`} onClick={(event) => { if ((event.target as HTMLElement).closest('a,button')) return; onOpen(project); }} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onOpen(project); } }} className="group relative w-full rounded-lg border border-line bg-surface p-6 sm:p-9 lg:p-12 overflow-hidden transition-all duration-500 hover:border-gold hover:-translate-y-1 cursor-pointer">
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

        {/* Case-study detail and gallery. Both are empty on the seeded
            projects, so the card renders exactly as it did before. */}
        {project.highlights.length > 0 && (
          <ul className="space-y-2.5 mb-7 max-w-2xl">
            {project.highlights.map((highlight) => (
              <li
                key={highlight.text}
                className="flex items-start gap-2.5 font-body text-[12px] font-light text-fg-muted leading-relaxed"
              >
                <span className="text-gold mt-px shrink-0" aria-hidden="true">
                  ✦
                </span>
                {highlight.text}
              </li>
            ))}
          </ul>
        )}

        {project.images.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-7">
            {project.images.map((image) => (
              <img
                key={image.url}
                src={image.url}
                alt={image.altText}
                loading="lazy"
                className="h-28 w-auto rounded-[2px] border border-line object-cover"
              />
            ))}
          </div>
        )}

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

const ProjectDetail: React.FC<{ project: Project; onClose: () => void }> = ({ project, onClose }) => {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = previous; };
  }, [onClose]);

  return (
    <motion.div className="project-modal-backdrop" role="presentation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <motion.section role="dialog" aria-modal="true" aria-labelledby="project-detail-title" className="project-modal" initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.98 }} transition={{ duration: 0.32 }}>
        <button type="button" className="project-modal-close" aria-label="Close project details" onClick={onClose}>×</button>
        <div className="project-modal-kicker"><span className="label-mono text-gold">{project.number} // CASE STUDY</span><span className="label-mono text-fg-muted">{project.category}</span></div>
        <h2 id="project-detail-title" className="headline project-modal-title"><span className="headline-neutral">{project.title}</span></h2>
        <p className="project-modal-description">{project.description}</p>
        {project.images.length > 0 && <div className="project-gallery">{project.images.map((image) => <figure key={image.url}><img src={image.url} alt={image.altText} />{image.caption && <figcaption>{image.caption}</figcaption>}</figure>)}</div>}
        <div className="project-detail-grid">
          {([['Summary', project.summary], ['Attribution', project.attribution], ['Problem', project.problem], ['Contribution', project.contribution], ['Architecture', project.architecture]] as const).filter(([, value]) => value).map(([label, value]) => <div key={label} className="project-detail-block"><span className="label-mono text-gold">{label}</span><p>{value}</p></div>)}
          {project.metrics.length > 0 && <div className="project-detail-block"><span className="label-mono text-gold">Metrics</span><div className="project-detail-metrics">{project.metrics.map((metric) => <span key={metric.label}><b>{metric.value}</b>{metric.label}</span>)}</div></div>}
          {project.highlights.length > 0 && <div className="project-detail-block"><span className="label-mono text-gold">Highlights</span><ul>{project.highlights.map((item) => <li key={item.text}>✦ {item.text}</li>)}</ul></div>}
        </div>
        <div className="project-detail-tech">{project.tech.map((tech) => <span key={tech}>{tech}</span>)}</div>
        <div className="project-detail-actions">{project.liveUrl && <ButtonLink onClick={(event) => event.stopPropagation()} href={project.liveUrl} external variant="primary" icon="↗">View live site</ButtonLink>}{project.githubUrl && <ButtonLink onClick={(event) => event.stopPropagation()} href={project.githubUrl} external variant="outline" icon="↗">View on GitHub</ButtonLink>}</div>
      </motion.section>
    </motion.div>
  );
};

export const ProjectsSection: React.FC = () => {
  const { projects, socialLinks, sections } = useContent();
  const section = sections.work;
  const github = socialLinks.find((link) => link.platform.toLowerCase() === 'github');

  // The stacking deck needs real scroll runway and a fine pointer; below
  // that it degrades into a janky, hard-to-read experience.
  const useDeck = useMediaQuery('(min-width: 1024px)');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

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
          eyebrow={section.eyebrow}
          titleTop={section.titleTop}
          titleBottom={section.titleBottom}
          lede={section.lede ?? undefined}
          ledeAside={section.ledeAside}
          extraFields={section.extraFields}
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
                <ProjectCard project={project} onOpen={setSelectedProject} />
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
                <ProjectCard project={project} onOpen={setSelectedProject} />
              </motion.div>
            ))}
          </div>
        )}

        {github && (
          <p className="font-body text-[11.5px] font-light text-fg-muted mt-8">
            More repositories and work in progress on{' '}
            <a
              href={github.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:underline underline-offset-4 transition-colors"
            >
              {github.value} ↗
            </a>
          </p>
        )}
      </div>
      {selectedProject && <ProjectDetail project={selectedProject} onClose={() => setSelectedProject(null)} />}
    </section>
  );
};

export default ProjectsSection;
