import { z } from 'zod';

/** Trim, then enforce length. Empty optional strings collapse to null. */
const text = (min: number, max: number, message?: string) =>
  z
    .string()
    .transform((value) => value.trim())
    .pipe(z.string().min(min, message ?? 'This field is required.').max(max));

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => value || null)
    .nullish()
    .transform((value) => value ?? null);

/** `max` caps the number of entries; `itemMax` caps each entry's length. */
const stringList = (max: number, itemMax = 400) =>
  z
    .array(z.string().transform((value) => value.trim()).pipe(z.string().max(itemMax)))
    .max(max)
    .transform((items) => items.filter(Boolean))
    .default([]);

const url = (max = 500) =>
  z
    .string()
    .trim()
    .max(max)
    .refine(
      (value) => value === '' || /^(https?:\/\/|mailto:|tel:|\/|#)/.test(value),
      'Enter a full URL, a mailto:/tel: link, or a path starting with / or #.',
    );

const optionalUrl = (max = 500) =>
  url(max)
    .transform((value) => value || null)
    .nullish()
    .transform((value) => value ?? null);

const isoDate = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the format YYYY-MM-DD.')
  .nullish()
  .transform((value) => value ?? null);

const flag = z.boolean().default(true);
const order = z.number().int().min(0).max(9999).default(0);
const stableKey = text(1, 80).pipe(
  z.string().regex(/^[a-z0-9][a-z0-9-]*$/, 'Use lowercase letters, numbers and hyphens only.'),
);

// ------------------------------------------------------------ singletons

export const SiteSettingsSchema = z.object({
  siteName: text(1, 120),
  canonicalUrl: text(1, 300),
  defaultSeoTitle: text(1, 180),
  defaultSeoDescription: text(1, 400),
  defaultSeoKeywords: stringList(40, 80),
  ogImageUrl: optionalUrl(),
  allowIndexing: z.boolean().default(true),
  availableForWork: z.boolean().default(true),
  availabilityText: optionalText(160),
  contactCtaLabel: text(1, 60),
  contactCtaHref: url(300),
  hireUpworkUrl: url(500),
  hireUpworkFallbackUrl: optionalUrl(),
  hireFiverrUrl: url(500),
  hireContactFallback: z.boolean().default(true),
  resumeMediaAssetId: optionalText(60),
  resumeUrl: optionalUrl(),
  footerCreditLine: optionalText(240),
  structuredData: z.record(z.string(), z.unknown()).nullish().transform((v) => v ?? null),
});

export const ThemeSettingsSchema = z.object({
  defaultMode: z.enum(['SYSTEM', 'LIGHT', 'DARK']).default('DARK'),
  allowToggle: z.boolean().default(true),
  accentGold: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Use a hex colour like #D4AF37.'),
  accentBronze: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Use a hex colour like #8C6E2F.'),
  headingColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Use a six-digit hex colour.'),
  linkColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Use a six-digit hex colour.'),
  fontFamily: z.enum(['Montserrat', 'Inter', 'system-ui', 'Georgia']).default('Montserrat'),
  fontScale: z.number().min(0.85).max(1.25).default(1),
  logoMediaAssetId: optionalText(60),
  faviconMediaAssetId: optionalText(60),
  portraitMediaAssetId: optionalText(60),
  watermarkMediaAssetId: optionalText(60),
  heroVideoMediaAssetId: optionalText(60),
  socialMediaAssetId: optionalText(60),
});

export const ProfileSchema = z.object({
  name: text(1, 120),
  firstName: text(1, 60),
  initials: text(1, 6),
  professionalTitle: text(1, 160),
  roleLine: text(1, 240),
  location: text(1, 120),
  email: z.string().trim().toLowerCase().pipe(z.string().email('Enter a valid email address.')),
  phone: optionalText(40),
  phoneHref: optionalText(40),
  shortSummary: optionalText(400),
  longBiography: text(1, 4000),
  workingPrinciples: stringList(12, 400),
  contactPitch: text(1, 1000),
  statusCopy: optionalText(160),
  visible: flag,
});

export const HeroSettingsSchema = z.object({
  headlineTop: text(1, 40),
  headlineBottom: text(1, 40),
  availabilityPill: text(1, 80),
  showPill: z.boolean().default(true),
  roleLinePart1: text(1, 80),
  roleLinePart2: text(1, 80),
  roleLinePart3: text(1, 80),
  description: text(1, 1000),
  primaryCtaLabel: text(1, 60),
  primaryCtaHref: url(300),
  resumeCtaLabel: text(1, 60),
  quoteLine1: text(1, 80),
  quoteLine2: text(1, 80),
  scrollCueLabel: text(1, 24),
  terminalLines: stringList(12, 160),
});

// ------------------------------------------------------- ordered lists

export const NavigationItemSchema = z.object({
  stableKey,
  label: text(1, 40),
  targetSectionKey: optionalText(80),
  externalUrl: optionalUrl(),
  visible: flag,
  sortOrder: order,
});

export const ContentSectionSchema = z.object({
  stableKey,
  eyebrow: text(1, 60),
  titleTop: text(1, 60),
  titleBottom: text(1, 60),
  lede: optionalText(600),
  ledeAside: z.boolean().default(false),
  extraFields: z.record(z.string(), z.string()).default({}),
  visible: flag,
  sortOrder: order,
});

export const SocialLinkSchema = z.object({
  stableKey,
  platform: text(1, 40),
  label: text(1, 40),
  value: text(1, 160),
  url: url(500),
  external: z.boolean().default(true),
  visible: flag,
  sortOrder: order,
});

export const StatSchema = z.object({
  stableKey,
  value: text(1, 20),
  label: text(1, 60),
  gold: z.boolean().default(false),
  visible: flag,
  sortOrder: order,
});

export const ServiceSchema = z.object({
  stableKey,
  number: text(1, 6),
  title: text(1, 80),
  description: text(1, 1000),
  points: stringList(10, 240),
  visible: flag,
  sortOrder: order,
});

export const GuaranteeSchema = z.object({
  stableKey,
  title: text(1, 80),
  detail: text(1, 400),
  visible: flag,
  sortOrder: order,
});

export const JourneyEntrySchema = z.object({
  stableKey,
  kind: z.enum(['EXPERIENCE', 'EDUCATION']).default('EXPERIENCE'),
  yearLabel: text(1, 60),
  title: text(1, 160),
  organization: text(1, 160),
  location: optionalText(120),
  startDate: isoDate,
  endDate: isoDate,
  current: z.boolean().default(false),
  description: text(1, 2000),
  achievements: stringList(12, 400),
  visible: flag,
  sortOrder: order,
});

export const SkillCategorySchema = z.object({
  stableKey,
  title: text(1, 80),
  badge: text(1, 40),
  stat: text(1, 60),
  description: text(1, 1000),
  colSpan: text(1, 40),
  visible: flag,
  sortOrder: order,
});

export const SkillSchema = z.object({
  stableKey,
  categoryId: text(1, 60, 'Choose a skill category.'),
  name: text(1, 60),
  emphasis: z.enum(['CORE', 'STRONG', 'SUPPORTING']).default('SUPPORTING'),
  visible: flag,
  sortOrder: order,
});

export const TechnologySchema = z.object({
  stableKey,
  name: text(1, 60),
  visible: flag,
  sortOrder: order,
});

// ----------------------------------------------------------- projects

export const ProjectMetricSchema = z.object({
  label: text(1, 40),
  value: text(1, 60),
});

export const ProjectHighlightSchema = z.object({
  kind: z.enum(['CAPABILITY', 'OUTCOME']).default('CAPABILITY'),
  text: text(1, 400),
});

export const ProjectSchema = z.object({
  stableKey,
  slug: stableKey,
  number: text(1, 6),
  title: text(1, 120),
  category: text(1, 120),
  summary: optionalText(600),
  description: text(1, 4000),
  attribution: optionalText(160),
  problem: optionalText(2000),
  contribution: optionalText(2000),
  architecture: optionalText(2000),
  liveUrl: optionalUrl(),
  repositoryUrl: optionalUrl(),
  featured: z.boolean().default(false),
  seoTitle: optionalText(180),
  seoDescription: optionalText(400),
  visible: flag,
  sortOrder: order,
  /** Free-text technology names; unknown ones are created on save. */
  technologies: stringList(30, 60),
  metrics: z.array(ProjectMetricSchema).max(10).default([]),
  highlights: z.array(ProjectHighlightSchema).max(12).default([]),
  images: z.array(z.string().min(1).max(80)).max(20).default([]),
});

// -------------------------------------------------------------- media

export const MediaAssetUpdateSchema = z.object({
  altText: optionalText(240),
});

// ------------------------------------------------------------ contact

const normalizeLines = (value: string) =>
  value.replace(/\r\n?/g, '\n').replace(/[ \t]+\n/g, '\n').trim();

export const ContactSubmissionSchema = z.object({
  name: text(2, 100, 'Enter your name.'),
  email: z.string().trim().toLowerCase().pipe(z.string().email('Enter a valid email address.').max(254)),
  company: optionalText(120),
  subject: optionalText(160),
  message: z
    .string()
    .transform(normalizeLines)
    .pipe(z.string().min(10, 'Tell me a little more.').max(3000)),
  /** Honeypot: real visitors never fill this in. */
  website: z.string().max(300).default(''),
});

// --------------------------------------------------------------- auth

export const LoginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.string().email('Enter a valid email address.')),
  password: z.string().min(1, 'Enter your password.').max(200),
});

export const TotpSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Enter the 6-digit code from your authenticator app.'),
});

export const RecoveryCodeSchema = z.object({
  recoveryCode: text(4, 20, 'Enter a recovery code.'),
});

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password.').max(200),
    newPassword: z.string().min(12, 'Use at least 12 characters.').max(200),
    confirmPassword: z.string().min(1, 'Confirm the new password.').max(200),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    path: ['confirmPassword'],
    message: 'The two passwords do not match.',
  });

// ------------------------------------------------------------ generic

export const ReorderSchema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(200),
});

export const PublishSchema = z.object({
  entity: z.string().min(1),
  id: z.string().min(1).optional(),
});
