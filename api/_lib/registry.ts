import type { z } from 'zod';

import { prisma } from './prisma.js';
import {
  ContentSectionSchema,
  GuaranteeSchema,
  HeroSettingsSchema,
  JourneyEntrySchema,
  NavigationItemSchema,
  ProfileSchema,
  ServiceSchema,
  SiteSettingsSchema,
  SkillCategorySchema,
  SkillSchema,
  SocialLinkSchema,
  StatSchema,
  TechnologySchema,
  ThemeSettingsSchema,
} from './schemas.js';

/**
 * One entry per editable entity. The admin router is generic over this
 * table, so adding a new content type means adding a row here plus a Zod
 * schema — not a new endpoint.
 */
export type EntityDefinition = {
  /** Prisma delegate name on the client. */
  model:
    | 'siteSettings'
    | 'themeSettings'
    | 'profile'
    | 'heroSettings'
    | 'navigationItem'
    | 'contentSection'
    | 'socialLink'
    | 'stat'
    | 'service'
    | 'guarantee'
    | 'journeyEntry'
    | 'skillCategory'
    | 'skill'
    | 'technology';
  /** Physical table name, for the publish timestamp sweep. */
  table: string;
  schema: z.ZodType<Record<string, unknown>>;
  /** Singletons are addressed by `stableKey` and cannot be created or deleted. */
  singleton?: string;
  /** Content columns copied into `publishedPayload` on publish. */
  fields: readonly string[];
  /** Default ordering for list reads. */
  orderBy?: Record<string, 'asc' | 'desc'>;
  /** Human label used in audit entries and error copy. */
  label: string;
};

export const ENTITIES = {
  site: {
    model: 'siteSettings',
    table: 'SiteSettings',
    schema: SiteSettingsSchema,
    singleton: 'site',
    label: 'Site settings',
    fields: [
      'siteName',
      'canonicalUrl',
      'defaultSeoTitle',
      'defaultSeoDescription',
      'defaultSeoKeywords',
      'ogImageUrl',
      'allowIndexing',
      'availableForWork',
      'availabilityText',
      'contactCtaLabel',
      'contactCtaHref',
      'resumeMediaAssetId',
      'resumeUrl',
      'footerCreditLine',
      'structuredData',
    ],
  },
  theme: {
    model: 'themeSettings',
    table: 'ThemeSettings',
    schema: ThemeSettingsSchema,
    singleton: 'theme',
    label: 'Appearance',
    fields: [
      'defaultMode',
      'allowToggle',
      'accentGold',
      'accentBronze',
      'logoMediaAssetId',
      'faviconMediaAssetId',
      'portraitMediaAssetId',
      'watermarkMediaAssetId',
      'heroVideoMediaAssetId',
      'socialMediaAssetId',
    ],
  },
  profile: {
    model: 'profile',
    table: 'Profile',
    schema: ProfileSchema,
    singleton: 'profile',
    label: 'Profile',
    fields: [
      'name',
      'firstName',
      'initials',
      'professionalTitle',
      'roleLine',
      'location',
      'email',
      'phone',
      'phoneHref',
      'shortSummary',
      'longBiography',
      'workingPrinciples',
      'contactPitch',
      'statusCopy',
      'visible',
    ],
  },
  hero: {
    model: 'heroSettings',
    table: 'HeroSettings',
    schema: HeroSettingsSchema,
    singleton: 'hero',
    label: 'Hero',
    fields: [
      'headlineTop',
      'headlineBottom',
      'availabilityPill',
      'showPill',
      'roleLinePart1',
      'roleLinePart2',
      'roleLinePart3',
      'description',
      'primaryCtaLabel',
      'primaryCtaHref',
      'resumeCtaLabel',
      'quoteLine1',
      'quoteLine2',
      'scrollCueLabel',
      'terminalLines',
    ],
  },
  navigation: {
    model: 'navigationItem',
    table: 'NavigationItem',
    schema: NavigationItemSchema,
    label: 'Navigation item',
    orderBy: { sortOrder: 'asc' },
    fields: ['stableKey', 'label', 'targetSectionKey', 'externalUrl', 'visible', 'sortOrder'],
  },
  sections: {
    model: 'contentSection',
    table: 'ContentSection',
    schema: ContentSectionSchema,
    label: 'Section',
    orderBy: { sortOrder: 'asc' },
    fields: [
      'stableKey',
      'eyebrow',
      'titleTop',
      'titleBottom',
      'lede',
      'ledeAside',
      'visible',
      'sortOrder',
    ],
  },
  'social-links': {
    model: 'socialLink',
    table: 'SocialLink',
    schema: SocialLinkSchema,
    label: 'Social link',
    orderBy: { sortOrder: 'asc' },
    fields: ['stableKey', 'platform', 'label', 'value', 'url', 'external', 'visible', 'sortOrder'],
  },
  stats: {
    model: 'stat',
    table: 'Stat',
    schema: StatSchema,
    label: 'Stat',
    orderBy: { sortOrder: 'asc' },
    fields: ['stableKey', 'value', 'label', 'gold', 'visible', 'sortOrder'],
  },
  services: {
    model: 'service',
    table: 'Service',
    schema: ServiceSchema,
    label: 'Service',
    orderBy: { sortOrder: 'asc' },
    fields: ['stableKey', 'number', 'title', 'description', 'points', 'visible', 'sortOrder'],
  },
  guarantees: {
    model: 'guarantee',
    table: 'Guarantee',
    schema: GuaranteeSchema,
    label: 'Guarantee',
    orderBy: { sortOrder: 'asc' },
    fields: ['stableKey', 'title', 'detail', 'visible', 'sortOrder'],
  },
  journey: {
    model: 'journeyEntry',
    table: 'JourneyEntry',
    schema: JourneyEntrySchema,
    label: 'Career entry',
    orderBy: { sortOrder: 'asc' },
    fields: [
      'stableKey',
      'kind',
      'yearLabel',
      'title',
      'organization',
      'location',
      'startDate',
      'endDate',
      'current',
      'description',
      'achievements',
      'visible',
      'sortOrder',
    ],
  },
  'skill-categories': {
    model: 'skillCategory',
    table: 'SkillCategory',
    schema: SkillCategorySchema,
    label: 'Skill category',
    orderBy: { sortOrder: 'asc' },
    fields: [
      'stableKey',
      'title',
      'badge',
      'stat',
      'description',
      'colSpan',
      'visible',
      'sortOrder',
    ],
  },
  skills: {
    model: 'skill',
    table: 'Skill',
    schema: SkillSchema,
    label: 'Skill',
    orderBy: { sortOrder: 'asc' },
    fields: ['stableKey', 'categoryId', 'name', 'emphasis', 'visible', 'sortOrder'],
  },
  technologies: {
    model: 'technology',
    table: 'Technology',
    schema: TechnologySchema,
    label: 'Technology',
    orderBy: { sortOrder: 'asc' },
    fields: ['stableKey', 'name', 'visible', 'sortOrder'],
  },
} as const satisfies Record<string, EntityDefinition>;

export type EntityName = keyof typeof ENTITIES;

export function isEntityName(value: string): value is EntityName {
  return Object.prototype.hasOwnProperty.call(ENTITIES, value);
}

/** Untyped delegate access — the router validates the entity name first. */
export function delegateFor(entity: EntityName) {
  const definition = ENTITIES[entity] as EntityDefinition;
  return (prisma as unknown as Record<string, never>)[definition.model] as {
    findMany: (args?: unknown) => Promise<Record<string, unknown>[]>;
    findUnique: (args: unknown) => Promise<Record<string, unknown> | null>;
    findFirst: (args: unknown) => Promise<Record<string, unknown> | null>;
    create: (args: unknown) => Promise<Record<string, unknown>>;
    update: (args: unknown) => Promise<Record<string, unknown>>;
    delete: (args: unknown) => Promise<Record<string, unknown>>;
    count: (args?: unknown) => Promise<number>;
  };
}

/**
 * Marks a row as cleanly published.
 *
 * `updatedAt` is stamped by Prisma at write time, so it always lands a few
 * milliseconds AFTER the `publishedAt` value passed into the same update —
 * which would leave every freshly published row looking like it still had
 * pending draft changes. This raw statement is the fix: it does not trigger
 * `@updatedAt`, so it can set the two columns equal and make
 * `updatedAt > publishedAt` mean exactly "edited since publishing".
 */
export async function stampPublished(table: string, id: string): Promise<void> {
  await prisma.$executeRawUnsafe(
    `UPDATE "${table}" SET "publishedAt" = "updatedAt" WHERE "id" = $1`,
    id,
  );
}

/** Extracts just the publishable content columns from a row. */
export function snapshotOf(
  entity: EntityName,
  row: Record<string, unknown>,
): Record<string, unknown> {
  const definition = ENTITIES[entity] as EntityDefinition;
  const snapshot: Record<string, unknown> = {};
  for (const field of definition.fields) {
    const value = row[field];
    snapshot[field] = value instanceof Date ? value.toISOString().slice(0, 10) : value;
  }
  return snapshot;
}

/** Columns that must be turned into Date objects before hitting Prisma. */
const DATE_FIELDS = new Set(['startDate', 'endDate']);

export function toPrismaData(
  entity: EntityName,
  input: Record<string, unknown>,
): Record<string, unknown> {
  const definition = ENTITIES[entity] as EntityDefinition;
  const data: Record<string, unknown> = {};

  for (const field of definition.fields) {
    if (!(field in input)) continue;
    const value = input[field];

    if (DATE_FIELDS.has(field)) {
      data[field] = typeof value === 'string' && value ? new Date(`${value}T00:00:00.000Z`) : null;
      continue;
    }

    data[field] = value;
  }

  return data;
}
