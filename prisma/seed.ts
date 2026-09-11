import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from './generated/client/client.js';
import * as seed from './seed-data.js';

/**
 * Idempotent seed. Every row is upserted by `stableKey`, and each one is
 * written to both the draft columns and `publishedPayload` so the public
 * site is live the moment the seed finishes.
 *
 * Re-running it restores seeded rows to their original copy. Rows you
 * created yourself in the admin panel are never touched.
 */
const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DIRECT_URL or DATABASE_URL must be set to seed the database.');
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const now = new Date();

/** Builds the published snapshot from the same object written to columns. */
function published<T extends Record<string, unknown>>(row: T, omit: readonly string[] = []) {
  const snapshot: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    if (omit.includes(key)) continue;
    snapshot[key] = value;
  }
  return snapshot;
}

async function seedSingletons() {
  const { stableKey: _siteKey, ...siteFields } = seed.site;
  await prisma.siteSettings.upsert({
    where: { stableKey: 'site' },
    create: {
      stableKey: 'site',
      ...siteFields,
      publishedPayload: published(siteFields) as never,
      publishedAt: now,
      publishedRevision: 1,
      seedVersion: seed.SEED_VERSION,
    },
    update: {
      ...siteFields,
      publishedPayload: published(siteFields) as never,
      publishedAt: now,
      seedVersion: seed.SEED_VERSION,
    },
  });

  const { stableKey: _themeKey, ...themeFields } = seed.theme;
  await prisma.themeSettings.upsert({
    where: { stableKey: 'theme' },
    create: {
      stableKey: 'theme',
      ...themeFields,
      publishedPayload: published(themeFields) as never,
      publishedAt: now,
      seedVersion: seed.SEED_VERSION,
    },
    update: {
      ...themeFields,
      publishedPayload: published(themeFields) as never,
      publishedAt: now,
      seedVersion: seed.SEED_VERSION,
    },
  });

  const { stableKey: _profileKey, ...profileFields } = seed.profileRow;
  await prisma.profile.upsert({
    where: { stableKey: 'profile' },
    create: {
      stableKey: 'profile',
      ...profileFields,
      status: 'PUBLISHED',
      publishedPayload: published(profileFields) as never,
      publishedAt: now,
      seedVersion: seed.SEED_VERSION,
    },
    update: {
      ...profileFields,
      status: 'PUBLISHED',
      publishedPayload: published(profileFields) as never,
      publishedAt: now,
      seedVersion: seed.SEED_VERSION,
    },
  });

  const { stableKey: _heroKey, ...heroFields } = seed.hero;
  await prisma.heroSettings.upsert({
    where: { stableKey: 'hero' },
    create: {
      stableKey: 'hero',
      ...heroFields,
      publishedPayload: published(heroFields) as never,
      publishedAt: now,
      seedVersion: seed.SEED_VERSION,
    },
    update: {
      ...heroFields,
      publishedPayload: published(heroFields) as never,
      publishedAt: now,
      seedVersion: seed.SEED_VERSION,
    },
  });
}

/** Upserts an ordered list keyed by `stableKey`. */
async function seedList<T extends { stableKey: string }>(
  model: {
    upsert: (args: unknown) => Promise<unknown>;
  },
  rows: readonly T[],
) {
  for (const row of rows) {
    const payload = published(row);
    await model.upsert({
      where: { stableKey: row.stableKey },
      create: {
        ...row,
        status: 'PUBLISHED',
        publishedPayload: payload,
        publishedAt: now,
        seedVersion: seed.SEED_VERSION,
      },
      update: {
        ...row,
        status: 'PUBLISHED',
        publishedPayload: payload,
        publishedAt: now,
        seedVersion: seed.SEED_VERSION,
      },
    });
  }
}

async function seedSkills() {
  for (const category of seed.skillCategoryRows) {
    const { items, ...fields } = category;
    const payload = published(fields);

    const row = await prisma.skillCategory.upsert({
      where: { stableKey: fields.stableKey },
      create: {
        ...fields,
        status: 'PUBLISHED',
        publishedPayload: payload as never,
        publishedAt: now,
        seedVersion: seed.SEED_VERSION,
      },
      update: {
        ...fields,
        status: 'PUBLISHED',
        publishedPayload: payload as never,
        publishedAt: now,
        seedVersion: seed.SEED_VERSION,
      },
      select: { id: true },
    });

    for (const [index, name] of items.entries()) {
      const stableKey = `${fields.stableKey}-${name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')}`;
      const skillFields = {
        stableKey,
        categoryId: row.id,
        name,
        emphasis: index < 3 ? ('CORE' as const) : ('SUPPORTING' as const),
        visible: true,
        sortOrder: index,
      };

      await prisma.skill.upsert({
        where: { stableKey },
        create: {
          ...skillFields,
          status: 'PUBLISHED',
          publishedPayload: published(skillFields) as never,
          publishedAt: now,
          seedVersion: seed.SEED_VERSION,
        },
        update: {
          ...skillFields,
          status: 'PUBLISHED',
          publishedPayload: published(skillFields) as never,
          publishedAt: now,
          seedVersion: seed.SEED_VERSION,
        },
      });
    }
  }
}

async function seedProjects() {
  for (const project of seed.projectRows) {
    const { technologies, metrics, highlights, ...fields } = project;
    const payload = published(fields);

    const row = await prisma.project.upsert({
      where: { stableKey: fields.stableKey },
      create: {
        ...fields,
        status: 'PUBLISHED',
        publishedPayload: payload as never,
        publishedAt: now,
        seedVersion: seed.SEED_VERSION,
      },
      update: {
        ...fields,
        status: 'PUBLISHED',
        publishedPayload: payload as never,
        publishedAt: now,
        seedVersion: seed.SEED_VERSION,
      },
      select: { id: true },
    });

    // Child lists are fully owned by the seed for seeded projects.
    await prisma.projectTechnology.deleteMany({ where: { projectId: row.id } });
    await prisma.projectMetric.deleteMany({ where: { projectId: row.id } });
    await prisma.projectHighlight.deleteMany({ where: { projectId: row.id } });

    for (const [index, name] of technologies.entries()) {
      const stableKey = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const techFields = { stableKey, name, visible: true, sortOrder: 0 };

      const technology = await prisma.technology.upsert({
        where: { name },
        create: {
          ...techFields,
          status: 'PUBLISHED',
          publishedPayload: published(techFields) as never,
          publishedAt: now,
          seedVersion: seed.SEED_VERSION,
        },
        update: { status: 'PUBLISHED', publishedAt: now },
        select: { id: true },
      });

      await prisma.projectTechnology.create({
        data: { projectId: row.id, technologyId: technology.id, sortOrder: index },
      });
    }

    for (const [index, metric] of metrics.entries()) {
      await prisma.projectMetric.create({
        data: {
          projectId: row.id,
          stableKey: `${fields.stableKey}-metric-${index}`,
          label: metric.label,
          value: metric.value,
          sortOrder: index,
        },
      });
    }

    for (const [index, highlight] of highlights.entries()) {
      await prisma.projectHighlight.create({
        data: {
          projectId: row.id,
          stableKey: `${fields.stableKey}-highlight-${index}`,
          kind: highlight.kind,
          text: highlight.text,
          sortOrder: index,
        },
      });
    }
  }
}

async function main() {
  console.log('Seeding portfolio content…');

  await seedSingletons();
  // Sections first: NavigationItem.targetSectionKey is a foreign key onto
  // ContentSection.stableKey, so the sections must exist before the menu.
  await seedList(prisma.contentSection as never, seed.sections);
  await seedList(prisma.navigationItem as never, seed.navigation);
  await seedList(prisma.socialLink as never, seed.socialLinks);
  await seedList(prisma.stat as never, seed.statRows);
  await seedList(prisma.service as never, seed.serviceRows);
  await seedList(prisma.guarantee as never, seed.guaranteeRows);
  await seedList(prisma.journeyEntry as never, seed.journeyRows);
  await seedSkills();
  await seedProjects();

  // Prisma stamps `updatedAt` at write time, a few milliseconds after the
  // `publishedAt` we pass in — which would leave every seeded row looking
  // like it had pending draft changes. Raw SQL does not trigger @updatedAt,
  // so this levels the two columns without touching anything else.
  const publishedTables = [
    'SiteSettings',
    'ThemeSettings',
    'Profile',
    'HeroSettings',
    'ContentSection',
    'NavigationItem',
    'SocialLink',
    'Stat',
    'Service',
    'Guarantee',
    'JourneyEntry',
    'SkillCategory',
    'Skill',
    'Technology',
    'Project',
  ];

  for (const table of publishedTables) {
    await prisma.$executeRawUnsafe(
      `UPDATE "${table}" SET "publishedAt" = "updatedAt" WHERE "publishedAt" IS NOT NULL`,
    );
  }

  const counts = {
    sections: await prisma.contentSection.count(),
    navigation: await prisma.navigationItem.count(),
    social: await prisma.socialLink.count(),
    stats: await prisma.stat.count(),
    services: await prisma.service.count(),
    guarantees: await prisma.guarantee.count(),
    journey: await prisma.journeyEntry.count(),
    skillCategories: await prisma.skillCategory.count(),
    skills: await prisma.skill.count(),
    projects: await prisma.project.count(),
    technologies: await prisma.technology.count(),
  };

  console.log('Seed complete:', counts);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
