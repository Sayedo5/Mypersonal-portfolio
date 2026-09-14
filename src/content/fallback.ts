import type { PortfolioContent, SectionContent } from '../data/content-types';
import {
  guarantees,
  journey,
  profile,
  projects,
  services,
  skillBlocks,
  stats,
  terminalLines,
} from '../data/profile';

/**
 * The bundled copy of the site, in the same shape `/api/content` returns.
 *
 * This is what paints on the very first frame, before the network has said
 * anything. The live content then replaces it in place. That is the whole
 * reason the redesign to a database-backed site needs no loading state and
 * changes nothing visually: there is never a moment where a section has no
 * data to render.
 *
 * It also means the portfolio still renders correctly if the database is
 * unreachable.
 */

const sectionList: SectionContent[] = [
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
];

export const fallbackContent: PortfolioContent = {
  site: {
    siteName: 'Sayed Muhammad',
    canonicalUrl: profile.siteUrl,
    defaultSeoTitle: 'Sayed Muhammad — Full-Stack Web & Mobile Developer',
    defaultSeoDescription:
      'Sayed Muhammad is a full-stack web and mobile developer in Islamabad, Pakistan, building production Next.js platforms, React Native (Expo) apps and Node.js REST APIs in TypeScript.',
    defaultSeoKeywords: [],
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
    structuredData: null,
  },
  theme: {
    defaultMode: 'DARK',
    allowToggle: true,
    accentGold: '#D4AF37',
    accentBronze: '#8C6D4F',
    headingColor: '#FFFFFF',
    linkColor: '#D4AF37',
    fontFamily: 'Montserrat',
    fontScale: 1,
    logoUrl: null,
    faviconUrl: null,
    portraitUrl: null,
    watermarkUrl: null,
    heroVideoUrl: null,
    socialUrl: null,
  },
  profile: {
    name: profile.name,
    firstName: profile.firstName,
    initials: profile.initials,
    professionalTitle: profile.role,
    roleLine: profile.roleLine,
    location: profile.location,
    email: profile.email,
    phone: profile.phone,
    phoneHref: profile.phoneHref,
    shortSummary: null,
    longBiography: profile.bio,
    workingPrinciples: [
      'Unified architecture — a Next.js portal, an Expo app and a Node API on one database.',
      'Web-to-mobile conversion without rewriting your core business logic.',
      'Strict TypeScript from the Prisma schema through to the UI props.',
    ],
    contactPitch: profile.contactPitch,
    statusCopy: 'Available for new projects',
  },
  hero: {
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
  },
  sections: Object.fromEntries(sectionList.map((section) => [section.stableKey, section])),
  navigation: [
    { label: 'ABOUT', href: '#about' },
    { label: 'SERVICES', href: '#services' },
    { label: 'WORK', href: '#work' },
    { label: 'SKILLS', href: '#skills' },
    { label: 'EXPERIENCE', href: '#experience' },
    { label: 'CONTACT', href: '#contact' },
  ],
  socialLinks: [
    {
      platform: 'Email',
      label: 'EMAIL',
      value: profile.email,
      url: `mailto:${profile.email}`,
      external: false,
    },
    {
      platform: 'Phone',
      label: 'PHONE',
      value: profile.phone,
      url: `tel:${profile.phoneHref}`,
      external: false,
    },
    {
      platform: 'GitHub',
      label: 'GITHUB',
      value: profile.githubLabel,
      url: profile.github,
      external: true,
    },
    {
      platform: 'LinkedIn',
      label: 'LINKEDIN',
      value: profile.linkedinLabel,
      url: profile.linkedin,
      external: true,
    },
  ],
  stats: stats.map((stat) => ({ value: stat.value, label: stat.label, gold: stat.gold ?? false })),
  services: services.map((service) => ({
    id: service.id,
    number: service.number,
    title: service.title,
    description: service.description,
    points: [...service.points],
  })),
  guarantees: guarantees.map((guarantee) => ({
    title: guarantee.title,
    detail: guarantee.detail,
  })),
  projects: projects.map((project) => ({
    slug: project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    number: project.number,
    title: project.title,
    category: project.category,
    summary: null,
    description: project.description,
    attribution: null,
    problem: null,
    contribution: null,
    architecture: null,
    tech: [...project.tech],
    metrics: project.metrics.map((metric) => ({ label: metric.label, value: metric.value })),
    highlights: [],
    images: [],
    liveUrl: project.liveUrl ?? null,
    githubUrl: project.githubUrl ?? null,
    featured: false,
  })),
  skillBlocks: skillBlocks.map((block) => ({
    title: block.title,
    badge: block.badge,
    stat: block.stat,
    description: block.description,
    colSpan: block.colSpan,
    items: [...block.items],
  })),
  journey: journey.map((stop) => ({
    id: stop.id,
    kind: stop.title.startsWith('BS IN') ? 'EDUCATION' : 'EXPERIENCE',
    year: stop.year,
    title: stop.title,
    organization: stop.organization,
    location: null,
    description: stop.description,
    achievements: [],
    current: stop.current ?? false,
  })),
};

/** Section lookup that always returns something renderable. */
export function sectionOr(
  content: PortfolioContent,
  key: string,
): SectionContent {
  return (
    content.sections[key] ??
    fallbackContent.sections[key] ?? {
      stableKey: key,
      eyebrow: '',
      titleTop: '',
      titleBottom: '',
      lede: null,
      ledeAside: false,
    }
  );
}
