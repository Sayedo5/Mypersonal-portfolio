import { ContentProvider } from './content/ContentProvider';
import { DocumentHead } from './content/DocumentHead';
import { ThemeSync } from './content/ThemeSync';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { ServicesSection } from './components/ServicesSection';
import { ProjectsSection } from './components/ProjectsSection';
import { SkillsSection } from './components/SkillsSection';
import { ExperienceSection } from './components/ExperienceSection';
import { ContactSection } from './components/ContactSection';

type Props = {
  /** Owner-only preview of unpublished drafts, served at /preview. */
  preview?: boolean;
};

function App({ preview = false }: Props) {
  return (
    <ContentProvider preview={preview}>
      <DocumentHead />
      <ThemeSync />

      <div
        id="top"
        className="w-full min-h-screen bg-bg text-fg"
      >
        <a href="#main" className="skip-link">
          Skip to content
        </a>

        {preview && (
          <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full border border-gold/50 bg-surface-2/95 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-gold backdrop-blur">
            Draft preview — not the published site
          </div>
        )}

        <HeroSection />

        <main id="main">
          <AboutSection />
          <ServicesSection />
          <ProjectsSection />
          <SkillsSection />
          <ExperienceSection />
        </main>

        <ContactSection />
      </div>
    </ContentProvider>
  );
}

export default App;
