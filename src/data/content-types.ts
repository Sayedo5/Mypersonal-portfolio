/**
 * The shape of the payload served by `/api/content`.
 *
 * It mirrors the exports of `./profile.ts` one-for-one on purpose: the
 * components read whichever of the two is available, so the site renders
 * identically whether the data came from Neon or from the bundled fallback.
 *
 * Imported as a type by the API layer too, so the two ends cannot drift.
 */

export type SiteContent = {
  siteName: string;
  canonicalUrl: string;
  defaultSeoTitle: string;
  defaultSeoDescription: string;
  defaultSeoKeywords: string[];
  ogImageUrl: string | null;
  allowIndexing: boolean;
  availableForWork: boolean;
  availabilityText: string | null;
  contactCtaLabel: string;
  contactCtaHref: string;
  resumeUrl: string | null;
  footerCreditLine: string | null;
  structuredData: Record<string, unknown> | null;
};

export type ThemeContent = {
  defaultMode: 'SYSTEM' | 'LIGHT' | 'DARK';
  allowToggle: boolean;
  accentGold: string;
  accentBronze: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  portraitUrl: string | null;
  watermarkUrl: string | null;
  heroVideoUrl: string | null;
  socialUrl: string | null;
};

export type ProfileContent = {
  name: string;
  firstName: string;
  initials: string;
  professionalTitle: string;
  roleLine: string;
  location: string;
  email: string;
  phone: string | null;
  phoneHref: string | null;
  shortSummary: string | null;
  longBiography: string;
  workingPrinciples: string[];
  contactPitch: string;
  statusCopy: string | null;
};

export type HeroContent = {
  headlineTop: string;
  headlineBottom: string;
  availabilityPill: string;
  showPill: boolean;
  roleLinePart1: string;
  roleLinePart2: string;
  roleLinePart3: string;
  description: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  resumeCtaLabel: string;
  quoteLine1: string;
  quoteLine2: string;
  scrollCueLabel: string;
  terminalLines: string[];
};

export type SectionContent = {
  stableKey: string;
  eyebrow: string;
  titleTop: string;
  titleBottom: string;
  lede: string | null;
  ledeAside: boolean;
};

export type NavigationContent = {
  label: string;
  href: string;
};

export type SocialLinkContent = {
  platform: string;
  label: string;
  value: string;
  url: string;
  external: boolean;
};

export type StatContent = {
  value: string;
  label: string;
  gold: boolean;
};

export type ServiceContent = {
  id: string;
  number: string;
  title: string;
  description: string;
  points: string[];
};

export type GuaranteeContent = {
  title: string;
  detail: string;
};

export type ProjectContent = {
  slug: string;
  number: string;
  title: string;
  category: string;
  summary: string | null;
  description: string;
  attribution: string | null;
  problem: string | null;
  contribution: string | null;
  architecture: string | null;
  tech: string[];
  metrics: { label: string; value: string }[];
  highlights: { kind: 'CAPABILITY' | 'OUTCOME'; text: string }[];
  images: { url: string; altText: string; caption: string | null; displayRole: string }[];
  liveUrl: string | null;
  githubUrl: string | null;
  featured: boolean;
};

export type SkillBlockContent = {
  title: string;
  badge: string;
  stat: string;
  description: string;
  colSpan: string;
  items: string[];
};

export type JourneyContent = {
  id: string;
  kind: 'EXPERIENCE' | 'EDUCATION';
  year: string;
  title: string;
  organization: string;
  location: string | null;
  description: string;
  achievements: string[];
  current: boolean;
};

export type PortfolioContent = {
  site: SiteContent;
  theme: ThemeContent;
  profile: ProfileContent;
  hero: HeroContent;
  /** Keyed by section `stableKey`: about, services, work, skills, experience, contact. */
  sections: Record<string, SectionContent>;
  navigation: NavigationContent[];
  socialLinks: SocialLinkContent[];
  stats: StatContent[];
  services: ServiceContent[];
  guarantees: GuaranteeContent[];
  projects: ProjectContent[];
  skillBlocks: SkillBlockContent[];
  journey: JourneyContent[];
};
