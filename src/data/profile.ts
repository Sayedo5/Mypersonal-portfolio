/**
 * Single source of truth for every piece of content on the site.
 * All of it is sourced from the CV — edit this file, not the components.
 */

export const profile = {
  name: 'Sayed Muhammad',
  firstName: 'Sayed',
  initials: 'SM',
  role: 'Full-Stack Web & Mobile Developer',
  roleLine: 'FULL STACK DEVELOPER • REACT NATIVE • NEXT.JS • NODE.JS',
  location: 'Islamabad, Pakistan',
  email: 'syedmuhammad.dev@gmail.com',
  phone: '+92-303-9192964',
  phoneHref: '+923039192964',
  github: 'https://github.com/Sayedo5',
  githubLabel: 'github.com/Sayedo5',
  linkedin: 'https://linkedin.com/in/syed-muhammad-66b493179',
  linkedinLabel: 'linkedin.com/in/syed-muhammad-66b493179',
  resume: '/resume.pdf',
  siteUrl: 'https://sayedmuhammad.dev',
  bio: 'I build production web platforms, cross-platform mobile apps and the API layers underneath them — in TypeScript, end to end. Sole frontend developer of a 60-screen legal-tech mobile app spanning roughly 133,000 lines of TypeScript and 23 API clients, with SSE-streamed AI chat, real-time WebSocket transcription and Typesense search. I ship Next.js portals, Expo apps and Node/Express APIs that share one database and one API layer.',
  contactPitch:
    'Have a product to build, a web app that needs to become a mobile app, or a Figma file waiting on a developer? Tell me the stack and the deadline — I reply within 24 hours.',
} as const;

/** Rotating phrases for the hero terminal line. */
export const terminalLines: readonly string[] = [
  'available for new projects',
  'next.js + expo + node — one shared api layer',
  'figma → production, pixel for pixel',
  'open to remote roles worldwide',
];

/** Headline metrics — every one traceable to shipped work. */
export const stats: readonly { value: string; label: string; gold?: boolean }[] = [
  { value: '60', label: 'Screens Shipped' },
  { value: '133K', label: 'Lines of TypeScript', gold: true },
  { value: '23', label: 'API Clients Integrated' },
  { value: '90+', label: 'Lighthouse Score', gold: true },
];

/** Engagement models — "how we can work together". */
export const services: readonly {
  id: string;
  number: string;
  title: string;
  description: string;
  points: readonly string[];
}[] = [
  {
    id: 'figma',
    number: '01',
    title: 'FIGMA TO PRODUCTION',
    description:
      'You have designs. You get a responsive, accessible, type-safe frontend that matches them exactly — no compromises negotiated in review.',
    points: [
      'Pixel-accurate Next.js or React Native build',
      'Tailwind, Shadcn UI and Radix primitives',
      'Every breakpoint, hover, loading and empty state',
    ],
  },
  {
    id: 'mobile',
    number: '02',
    title: 'WEB TO NATIVE MOBILE',
    description:
      'You have a working web product. You get iOS and Android apps without rewriting the business logic or standing up a second backend.',
    points: [
      'React Native + Expo Router on your existing API',
      'Native navigation, offline caching, deep linking',
      'Tuned for 60fps on real mid-range devices',
    ],
  },
  {
    id: 'api',
    number: '03',
    title: 'APIS, AUTH & REAL-TIME',
    description:
      'You need the backend behind it. You get documented REST endpoints, a schema you can trust and migrations that run cleanly in production.',
    points: [
      'Node/Express APIs, Prisma schemas, safe migrations',
      'JWT, NextAuth and OAuth with role-based access',
      'SSE streaming, WebSockets, Typesense search',
    ],
  },
];

/** What every engagement ships with. */
export const guarantees: readonly { title: string; detail: string }[] = [
  {
    title: 'STRICT TYPE SAFETY',
    detail: 'Types flow from the database schema to the UI props. No stray any at the API boundary.',
  },
  {
    title: '1:1 FIGMA PRECISION',
    detail: 'What is designed in Figma is exactly what renders in production, at every breakpoint.',
  },
  {
    title: 'DOCUMENTED APIS',
    detail: 'Every endpoint ships with a Postman collection and validated request/response payloads.',
  },
  {
    title: 'READABLE GIT HISTORY',
    detail: 'Scoped commits and PR review, so the next developer can follow what changed and why.',
  },
];

export const projects: readonly {
  number: string;
  title: string;
  category: string;
  description: string;
  tech: readonly string[];
  metrics: readonly { label: string; value: string }[];
  liveUrl?: string;
  githubUrl?: string;
}[] = [
  {
    number: '01',
    title: 'AI ATTORNEY',
    category: 'CROSS-PLATFORM LEGAL AI APP',
    description:
      'Cross-platform legal assistant for iOS and Android. Sole frontend developer across 60 screens and roughly 133,000 lines of TypeScript, integrating 23 separate API clients. Features SSE-streamed AI chat, real-time WebSocket speech transcription and Typesense faceted search over case law.',
    tech: ['React Native', 'Expo', 'TypeScript', 'Node.js REST API', 'NativeWind', 'Typesense', 'WebSockets', 'SSE'],
    metrics: [
      { label: 'SCREENS', value: '60 Shipped' },
      { label: 'CODEBASE', value: '~133K Lines TS' },
      { label: 'INTEGRATIONS', value: '23 API Clients' },
    ],
    githubUrl: 'https://github.com/Sayedo5',
  },
  {
    number: '02',
    title: 'AURELIUM LEDGER',
    category: 'FINANCE & SAAS ANALYTICS PLATFORM',
    description:
      'Full-stack SaaS financial dashboard with real-time data grids, dynamic date filtering and interactive charts. Automated invoice and statement generation with server-side CSV and PDF export, on a type-safe Prisma schema shared across API routes and UI.',
    tech: ['Next.js App Router', 'TypeScript', 'Node.js', 'Prisma', 'PostgreSQL', 'Recharts', 'Tailwind CSS'],
    metrics: [
      { label: 'ARCHITECTURE', value: 'Full-Stack SaaS' },
      { label: 'EXPORTS', value: 'CSV & PDF Engine' },
      { label: 'DEPLOYMENT', value: 'Vercel Production' },
    ],
    githubUrl: 'https://github.com/Sayedo5',
  },
  {
    number: '03',
    title: 'INSIGHTLYQ',
    category: 'BUSINESS ANALYTICS & ADMIN PORTAL',
    description:
      'Multi-tenant administrative portal featuring role-based authorisation, workspace management and activity logging with audit trails across tenants. Delivered to production as a client-facing dashboard with sub-second page loads.',
    tech: ['Next.js', 'React', 'Express.js', 'Prisma ORM', 'Neon DB', 'Shadcn UI', 'RBAC'],
    metrics: [
      { label: 'ARCHITECTURE', value: 'Multi-Tenant' },
      { label: 'SECURITY', value: 'RBAC + Audit Logs' },
      { label: 'PERFORMANCE', value: 'Sub-Second Loads' },
    ],
    githubUrl: 'https://github.com/Sayedo5',
  },
];

/** Bento skill matrix. colSpan values drive the 12-column grid. */
export const skillBlocks: readonly {
  title: string;
  badge: string;
  stat: string;
  description: string;
  items: readonly string[];
  colSpan: string;
}[] = [
  {
    title: 'FRONTEND WEB',
    badge: 'CORE PILLAR',
    stat: '90+ LIGHTHOUSE',
    description:
      'Next.js 14/15 across App Router and Pages Router — SSR storefronts, admin portals and client dashboards delivered to production on Vercel, with Core Web Vitals and bundle size tuned.',
    items: ['Next.js 14/15', 'React.js', 'TypeScript', 'Tailwind CSS', 'Shadcn UI', 'Radix UI', 'Recharts', 'Material UI'],
    colSpan: 'lg:col-span-7',
  },
  {
    title: 'MOBILE ENGINEERING',
    badge: 'CROSS-PLATFORM',
    stat: '60FPS iOS & ANDROID',
    description:
      'React Native and Expo Router apps built from scratch or ported from existing web platforms, sharing business logic and API endpoints.',
    items: ['React Native', 'Expo', 'Expo Router', 'NativeWind', 'Web-to-Mobile Porting'],
    colSpan: 'lg:col-span-5',
  },
  {
    title: 'BACKEND & API',
    badge: 'ARCHITECTURE',
    stat: '100% POSTMAN VALIDATED',
    description:
      'Secure REST APIs designed, built and documented from scratch in Node.js and Express, with role-based access control and real-time transport.',
    items: ['Node.js', 'Express.js', 'REST API Design', 'JWT', 'NextAuth', 'OAuth', 'SSE', 'WebSockets'],
    colSpan: 'lg:col-span-5',
  },
  {
    title: 'DATA, STATE & DEVOPS',
    badge: 'PERSISTENCE',
    stat: 'TYPE-SAFE END TO END',
    description:
      'Type-safe schemas and production migrations with Prisma ORM across relational and document stores, with caching and state architecture on the client.',
    items: ['Prisma ORM', 'PostgreSQL', 'Neon DB', 'MongoDB', 'Firebase', 'Supabase', 'TanStack Query', 'Redux Toolkit', 'Zustand', 'Git', 'Vercel'],
    colSpan: 'lg:col-span-7',
  },
];

/** Career + education timeline, newest first. */
export const journey: readonly {
  id: string;
  year: string;
  title: string;
  organization: string;
  description: string;
  current?: boolean;
}[] = [
  {
    id: '01',
    year: 'FEB 2026 — PRESENT',
    title: 'SENIOR FULL-STACK WEB & MOBILE DEVELOPER',
    organization: 'FIREFLY TECH SOLUTION',
    description:
      'Architect end-to-end web applications and cross-platform iOS/Android apps in Next.js, React Native and Express. Build and document secure REST APIs, model type-safe Prisma schemas against PostgreSQL and Neon, and implement RBAC, real-time analytics dashboards and automated CSV/PDF export engines.',
    current: true,
  },
  {
    id: '02',
    year: 'JAN 2025 — JAN 2026',
    title: 'FULL-STACK WEB DEVELOPER',
    organization: 'FIRNAS.TECH PVT. LTD.',
    description:
      'Engineered scalable web applications, client admin portals and SSR storefronts with Next.js, React, Node.js and Tailwind. Refactored legacy JavaScript into strict TypeScript, decreasing runtime bugs by 40%, and optimised Core Web Vitals to reach 90+ Lighthouse scores under WCAG 2.1 compliance.',
  },
  {
    id: '03',
    year: 'OCT 2024 — DEC 2024',
    title: 'FRONTEND WEB DEVELOPMENT INTERN',
    organization: 'FIRNAS.TECH PVT. LTD.',
    description:
      'Built responsive landing pages and UI modules with HTML5, CSS3, JavaScript and Tailwind alongside senior engineers, handling REST API data fetching, state management and responsive fixes across every viewport.',
  },
  {
    id: '04',
    year: 'GRADUATED MAR 2026',
    title: 'BS IN COMPUTER SCIENCE',
    organization: 'COMSATS UNIVERSITY ISLAMABAD — ABBOTTABAD',
    description:
      'BSCS with a focus on software engineering and systems. Certified by Firnas.tech as a Web Developer (January 2026) and for a Web Development Internship (December 2024).',
  },
];
