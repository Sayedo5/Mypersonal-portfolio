import { z } from 'zod';

import { HttpError } from './http.js';

/**
 * Server-side environment. Anything under `api/` runs in a Vercel Node
 * function, so these values never reach the browser bundle.
 */
const optional = <S extends z.ZodTypeAny>(schema: S) =>
  z.preprocess((value) => (value === '' ? undefined : value), schema.optional());

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL must be set.'),
  DIRECT_URL: optional(z.string().min(1)),
  AUTH_SECRET: z.string().min(32, 'AUTH_SECRET must be at least 32 characters.'),
  SITE_URL: optional(z.string().min(1)),
  ADMIN_NAME: optional(z.string().min(1)),
  ADMIN_EMAIL: optional(z.string().email()),
  ADMIN_INITIAL_PASSWORD: optional(z.string().min(12)),
  TOTP_ISSUER: z.string().min(1).default('Portfolio Admin'),
  MEDIA_PROVIDER: z.enum(['vercel-blob', 'static']).default('static'),
  BLOB_READ_WRITE_TOKEN: optional(z.string().min(1)),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | undefined;

/**
 * Reports a configuration problem as a 503 that names the offending
 * variables. Values are never echoed — only variable names — so the message
 * is safe to surface in the browser.
 */
function configError(detail: string): never {
  throw new HttpError(
    'UNAVAILABLE',
    `${detail} Set it in Vercel under Settings → Environment Variables for the Production environment, then redeploy — environment changes do not apply to existing deployments.`,
  );
}

export function loadServerEnv(source: NodeJS.ProcessEnv = process.env): ServerEnv {
  if (cached) return cached;

  const parsed = serverEnvSchema.safeParse(source);
  if (!parsed.success) {
    const names = [
      ...new Set(parsed.error.issues.map((issue) => String(issue.path[0] ?? 'environment'))),
    ];
    const detail = parsed.error.issues
      .map((issue) => `${issue.path.join('.') || '_'}: ${issue.message}`)
      .join('; ');
    configError(
      `Server configuration problem with ${names.join(', ')} — ${detail}.`,
    );
  }

  if (parsed.data.MEDIA_PROVIDER === 'vercel-blob' && !parsed.data.BLOB_READ_WRITE_TOKEN) {
    configError(
      'BLOB_READ_WRITE_TOKEN is required when MEDIA_PROVIDER is "vercel-blob" (use "static" until a Blob store is linked).',
    );
  }

  cached = parsed.data;
  return cached;
}

export const isProduction = () => loadServerEnv().NODE_ENV === 'production';
