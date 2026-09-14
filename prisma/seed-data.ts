/**
 * Seed content.
 *
 * Everything here is the site exactly as it renders today: the structured
 * parts are imported straight from `src/data/profile.ts`, and the strings
 * that were previously hardcoded inside components are transcribed below.
 * Seeding is therefore a lift-and-shift, not a rewrite — the first page
 * load after seeding is byte-identical to the current live site.
 */

import {
  guarantees,
  journey,
  profile,
  projects,
  services,
  skillBlocks,
  stats,
  terminalLines,
} from '../src/data/profile.js';

export const SEED_VERSION = 1;

export const site = {
  stableKey: 'site',
  siteName: 'Sayed Muhammad',
  canonicalUrl: profile.siteUrl,
  defaultSeoTitle: 'Sayed Muhammad — Full-Stack Web & Mobile Developer',
  defaultSeoDescription:
    'Sayed Muhammad is a full-stack web and mobile developer in Islamabad, Pakistan, building production Next.js platforms, React Native (Expo) apps and Node.js REST APIs in TypeScript. Available for remote work.',
  defaultSeoKeywords: [
    'Full-Stack Developer',
    'React Native',
    'Next.js',
    'Node.js',
    'TypeScript',
    'Expo',
    'Islamabad',
    'Pakistan',
  ],
  ogImageUrl: `${profile.siteUrl}/og-image.png`,
  allowIndexing: true,
  availableForWork: true,
  availabilityText: 'Available for new projects',
  contactCtaLabel: 'Hire me',
  contactCtaHref: '#contact',
  hireUpworkUrl: 'https://www.upwork.com/freelancers/~01514d2dc711d77dd2',
  hireUpworkFallbackUrl: 'https://www.upwork.com/freelancers/sayedmuhammad110',
  hireFiverrUrl: 'https://www.fiverr.com/s/Emgjbxy',
  hireContactFallback: true,
  resumeUrl: profile.resume,
  footerCreditLine: 'BUILT WITH REACT, TYPESCRIPT & TAILWIND',
  structuredData: {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    url: `${profile.siteUrl}/`,
    jobTitle: profile.role,
    email: `mailto:${profile.email}`,
    telephone: profile.phone,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Islamabad',
      addressCountry: 'PK',
    },
    alumniOf: {
      '@type': 'CollegeOrUniversity',
      name: 'COMSATS University Islamabad, Abbottabad Campus',
    },
    sameAs: [profile.github, profile.linkedin],
    knowsAbout: [
      'React Native',
      'Expo',
      'Next.js',
      'React',
      'TypeScript',
      'Node.js',
      'Express.js',
      'Prisma ORM',
      'PostgreSQL',
      'MongoDB',
      'REST API Design',
      'Tailwind CSS',
      'TanStack Query',
      'Mobile App Development',
      'Web Performance',
    ],
  },
};

export const theme = {
  stableKey: 'theme',
  defaultMode: 'DARK' as const,
  allowToggle: true,
  accentGold: '#D4AF37',
  accentBronze: '#8C6D4F',
  headingColor: '#FFFFFF',
  linkColor: '#D4AF37',
  fontFamily: 'Montserrat',
  fontScale: 1,
};

export const profileRow = {
  stableKey: 'profile',
  name: profile.name,
  firstName: profile.firstName,
  initials: profile.initials,
  professionalTitle: profile.role,
  roleLine: profile.roleLine,
  location: profile.location,
  email: profile.email,
  phone: profile.phone,
  phoneHref: profile.phoneHref,
  shortSummary:
    'Full-stack web and mobile developer shipping Next.js platforms, Expo apps and the Node APIs underneath them.',
  longBiography: profile.bio,
  // Previously the hardcoded `valueProps` array in AboutSection.tsx.
  workingPrinciples: [
    'Unified architecture — a Next.js portal, an Expo app and a Node API on one database.',
    'Web-to-mobile conversion without rewriting your core business logic.',
    'Strict TypeScript from the Prisma schema through to the UI props.',
  ],
  contactPitch: profile.contactPitch,
  statusCopy: 'Available for new projects',
  visible: true,
};

export const hero = {
  stableKey: 'hero',
  // Previously the two hardcoded <span> lines in the HeroSection headline.
  headlineTop: 'SAYED',
  headlineBottom: 'MUHAMMAD',
  availabilityPill: 'Available for new projects',
  showPill: true,
  roleLinePart1: 'FULL STACK DEVELOPER',
  roleLinePart2: 'REACT NATIVE',
  roleLinePart3: 'NEXT.JS',
  description:
    'I build **Next.js web platforms**, **React Native mobile apps** and the **Node.js APIs** underneath them — all sharing one database and one API layer.',
  primaryCtaLabel: 'Explore my work',
  primaryCtaHref: '#work',
  resumeCtaLabel: 'Download resume',
  quoteLine1: 'WEB, MOBILE AND API.',
  quoteLine2: 'ONE ENGINEER, ONE STACK.',
  scrollCueLabel: 'SCROLL',
  terminalLines: [...terminalLines],
};

/** Previously the hardcoded `navItems` array in HeroSection.tsx. */
export const navigation = [
  { stableKey: 'nav-about', label: 'ABOUT', targetSectionKey: 'about' },
  { stableKey: 'nav-services', label: 'SERVICES', targetSectionKey: 'services' },
  { stableKey: 'nav-work', label: 'WORK', targetSectionKey: 'work' },
  { stableKey: 'nav-skills', label: 'SKILLS', targetSectionKey: 'skills' },
  { stableKey: 'nav-experience', label: 'EXPERIENCE', targetSectionKey: 'experience' },
  { stableKey: 'nav-contact', label: 'CONTACT', targetSectionKey: 'contact' },
].map((item, index) => ({ ...item, externalUrl: null, visible: true, sortOrder: index }));

/** Previously the hardcoded <SectionHeader/> props in each section file. */
export const sections = [
  {
    stableKey: 'about',
    eyebrow: '01 / ABOUT ME',
    titleTop: 'ONE ENGINEER.',
    titleBottom: 'WEB, MOBILE & API.',
    lede: null,
    ledeAside: false,
  },
  {
    stableKey: 'services',
    eyebrow: '02 / HOW WE WORK',
    titleTop: 'WHAT I BUILD',
    titleBottom: 'FOR CLIENTS.',
    lede: 'Three ways clients bring me in. Each one ends with something running in production — not a prototype, and not a handover document.',
    ledeAside: true,
  },
  {
    stableKey: 'work',
    eyebrow: '03 / FEATURED WORK',
    titleTop: 'SHIPPED TO',
    titleBottom: 'PRODUCTION.',
    lede: 'Real products with the scope, stack and numbers attached — no concept pieces.',
    ledeAside: true,
  },
  {
    stableKey: 'skills',
    eyebrow: '04 / TECH MATRIX',
    titleTop: 'THE FULL STACK.',
    titleBottom: 'END TO END.',
    lede: 'No logo wall of tools read about once. Everything listed here is in a codebase I have delivered to production.',
    ledeAside: false,
  },
  {
    stableKey: 'experience',
    eyebrow: '05 / EXPERIENCE',
    titleTop: 'EXPERIENCE &',
    titleBottom: 'EDUCATION.',
    lede: null,
    ledeAside: false,
  },
  {
    stableKey: 'contact',
    eyebrow: '06 / CONTACT',
    titleTop: "LET'S BUILD",
    titleBottom: 'SOMETHING.',
    lede: null,
    ledeAside: false,
  },
].map((section, index) => ({ ...section, extraFields: {}, visible: true, sortOrder: index }));

/** Previously the hardcoded `channels` array in ContactSection.tsx. */
export const socialLinks = [
  {
    stableKey: 'email',
    platform: 'Email',
    label: 'EMAIL',
    value: profile.email,
    url: `mailto:${profile.email}`,
    external: false,
  },
  {
    stableKey: 'phone',
    platform: 'Phone',
    label: 'PHONE',
    value: profile.phone,
    url: `tel:${profile.phoneHref}`,
    external: false,
  },
  {
    stableKey: 'github',
    platform: 'GitHub',
    label: 'GITHUB',
    value: profile.githubLabel,
    url: profile.github,
    external: true,
  },
  {
    stableKey: 'linkedin',
    platform: 'LinkedIn',
    label: 'LINKEDIN',
    value: profile.linkedinLabel,
    url: profile.linkedin,
    external: true,
  },
].map((link, index) => ({ ...link, visible: true, sortOrder: index }));

export const statRows = stats.map((stat, index) => ({
  stableKey: `stat-${index + 1}`,
  value: stat.value,
  label: stat.label,
  gold: stat.gold ?? false,
  visible: true,
  sortOrder: index,
}));

export const serviceRows = services.map((service, index) => ({
  stableKey: service.id,
  number: service.number,
  title: service.title,
  description: service.description,
  points: [...service.points],
  visible: true,
  sortOrder: index,
}));

export const guaranteeRows = guarantees.map((guarantee, index) => ({
  stableKey: `guarantee-${index + 1}`,
  title: guarantee.title,
  detail: guarantee.detail,
  visible: true,
  sortOrder: index,
}));

/**
 * The existing `journey` array mixes roles and the degree. The final entry
 * is the BSCS, so it seeds as EDUCATION; ordering on the page is unchanged.
 */
export const journeyRows = journey.map((stop, index) => ({
  stableKey: `journey-${stop.id}`,
  kind: stop.title.startsWith('BS IN') ? ('EDUCATION' as const) : ('EXPERIENCE' as const),
  yearLabel: stop.year,
  title: stop.title,
  organization: stop.organization,
  location: null,
  startDate: null,
  endDate: null,
  current: stop.current ?? false,
  description: stop.description,
  achievements: [] as string[],
  visible: true,
  sortOrder: index,
}));

export const skillCategoryRows = skillBlocks.map((block, index) => ({
  stableKey: block.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
  title: block.title,
  badge: block.badge,
  stat: block.stat,
  description: block.description,
  colSpan: block.colSpan,
  visible: true,
  sortOrder: index,
  items: [...block.items],
}));

export const projectRows = projects.map((project, index) => {
  const slug = project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return {
    stableKey: slug,
    slug,
    number: project.number,
    title: project.title,
    category: project.category,
    summary: null,
    description: project.description,
    attribution: null,
    problem: null,
    contribution: null,
    architecture: null,
    liveUrl: project.liveUrl ?? null,
    repositoryUrl: project.githubUrl ?? null,
    featured: index === 0,
    seoTitle: null,
    seoDescription: null,
    visible: true,
    sortOrder: index,
    technologies: [...project.tech],
    metrics: project.metrics.map((metric) => ({ label: metric.label, value: metric.value })),
    highlights: [] as { kind: 'CAPABILITY' | 'OUTCOME'; text: string }[],
  };
});
