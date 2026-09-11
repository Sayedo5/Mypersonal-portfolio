import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../../prisma/generated/client/client.js';

/**
 * One Prisma client per warm serverless container.
 *
 * The adapter is pointed at Neon's POOLED connection string (the host with
 * `-pooler` in it). That matters: a Vercel function may be frozen mid-request
 * and a direct connection would leak a Postgres backend every invocation.
 * Migrations use DIRECT_URL instead, via prisma.config.ts.
 */
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL must be set for the application.');
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
