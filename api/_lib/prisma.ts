import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../../prisma/generated/client/client.js';
import { HttpError } from './http.js';

/**
 * One Prisma client per warm serverless container, created lazily.
 *
 * The laziness is deliberate. Throwing at module scope kills the function
 * before any handler runs, so Vercel answers with a plain-text
 * FUNCTION_INVOCATION_FAILED and a missing environment variable looks
 * identical to a code crash. Deferring the connection until first use means
 * the failure travels through `withApi` and comes back as JSON that names
 * exactly what is missing.
 *
 * The adapter is pointed at Neon's POOLED connection string (the host with
 * `-pooler` in it): a Vercel function can be frozen mid-request, and a direct
 * connection would leak a Postgres backend on every invocation. Migrations
 * use DIRECT_URL instead, via prisma.config.ts.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new HttpError(
      'UNAVAILABLE',
      'The database is not configured: DATABASE_URL is missing from this environment. Add it in Vercel under Settings → Environment Variables (Production), then redeploy — environment changes do not affect existing deployments.',
    );
  }

  const client = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = client;
  return client;
}

function getClient(): PrismaClient {
  return (globalForPrisma.prisma ??= createClient());
}

/**
 * Behaves exactly like a PrismaClient, but the underlying client is built on
 * the first property access rather than at import time.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property, receiver) {
    return Reflect.get(getClient() as object, property, receiver);
  },
  has(_target, property) {
    return Reflect.has(getClient() as object, property);
  },
}) as PrismaClient;
