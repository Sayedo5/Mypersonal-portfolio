import 'dotenv/config';

import { defineConfig } from 'prisma/config';

/**
 * Prisma 7 reads connection URLs from here rather than from schema.prisma.
 * CLI work (migrate, seed, studio) uses the DIRECT connection so it never
 * runs through Neon's pooler; the app itself uses the pooled DATABASE_URL
 * via the driver adapter in api/_lib/prisma.ts.
 */
const databaseUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DIRECT_URL or DATABASE_URL must be set for Prisma CLI commands.');
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: databaseUrl,
  },
});
