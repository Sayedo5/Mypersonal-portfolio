import { prisma } from './prisma.js';
import { HttpError } from './http.js';
import { hashIdentifier } from './crypto.js';
import { loadServerEnv } from './env.js';

type Rule = { windowSeconds: number; max: number };

/** Mirrors the reference project's Better Auth custom rules. */
export const RATE_RULES = {
  'sign-in': { windowSeconds: 60, max: 5 },
  'two-factor': { windowSeconds: 60, max: 5 },
  contact: { windowSeconds: 3600, max: 5 },
} as const satisfies Record<string, Rule>;

/**
 * Database-backed fixed-window counter. The identifier is HMAC'd with
 * AUTH_SECRET so raw IP addresses are never persisted.
 */
export async function enforceRateLimit(
  bucket: keyof typeof RATE_RULES,
  identifier: string | null,
): Promise<void> {
  const rule = RATE_RULES[bucket];
  const secret = loadServerEnv().AUTH_SECRET;
  const key = `${bucket}:${hashIdentifier(identifier ?? 'anonymous', secret)}`;
  const now = new Date();
  const windowStartedAfter = new Date(now.getTime() - rule.windowSeconds * 1000);

  const existing = await prisma.rateLimit.findUnique({ where: { key } });

  if (!existing || existing.windowStart < windowStartedAfter) {
    await prisma.rateLimit.upsert({
      where: { key },
      create: { key, count: 1, windowStart: now },
      update: { count: 1, windowStart: now },
    });
    return;
  }

  if (existing.count >= rule.max) {
    throw new HttpError('RATE_LIMITED', 'Too many attempts. Wait a minute and try again.');
  }

  await prisma.rateLimit.update({ where: { key }, data: { count: { increment: 1 } } });
}

/** Best-effort housekeeping so the table cannot grow without bound. */
export async function pruneRateLimits(): Promise<void> {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  await prisma.rateLimit.deleteMany({ where: { windowStart: { lt: cutoff } } });
}
