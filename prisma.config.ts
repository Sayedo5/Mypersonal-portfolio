import 'dotenv/config';

import { defineConfig } from 'prisma/config';

/**
 * Prisma 7 reads connection URLs from here rather than from schema.prisma.
 *
 * The URL is deliberately OPTIONAL. `prisma generate` only reads the schema
 * and emits the client — it never opens a connection — and it runs from
 * `postinstall`, which on Vercel executes during `npm install`. Throwing
 * here would fail the build for anyone who has not yet set database
 * credentials, including a fresh `git clone`.
 *
 * The commands that genuinely need a database (`migrate`, `db push`, `seed`,
 * `studio`) fail with Prisma's own clear message if the URL is missing.
 *
 * When present, CLI work uses the DIRECT connection so it never runs through
 * Neon's pooler — PgBouncer's transaction pooling breaks the advisory locks
 * that migrations rely on. The app itself uses the pooled DATABASE_URL via
 * the driver adapter in api/_lib/prisma.ts.
 */
const databaseUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  ...(databaseUrl ? { datasource: { url: databaseUrl } } : {}),
});
