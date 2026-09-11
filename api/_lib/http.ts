import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';

export type ApiError = {
  code:
    | 'VALIDATION'
    | 'UNAUTHENTICATED'
    | 'MFA_REQUIRED'
    | 'MFA_ENROLLMENT_REQUIRED'
    | 'FORBIDDEN'
    | 'NOT_FOUND'
    | 'CONFLICT'
    | 'RATE_LIMITED'
    | 'METHOD_NOT_ALLOWED'
    | 'UNAVAILABLE'
    | 'UNEXPECTED';
  message: string;
  fieldErrors?: Record<string, string[]>;
};

const STATUS_BY_CODE: Record<ApiError['code'], number> = {
  VALIDATION: 422,
  UNAUTHENTICATED: 401,
  MFA_REQUIRED: 401,
  MFA_ENROLLMENT_REQUIRED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  METHOD_NOT_ALLOWED: 405,
  UNAVAILABLE: 503,
  UNEXPECTED: 500,
};

/** Thrown anywhere in a handler; `withApi` turns it into a clean JSON body. */
export class HttpError extends Error {
  readonly code: ApiError['code'];
  /** `| undefined` is required under exactOptionalPropertyTypes. */
  readonly fieldErrors?: Record<string, string[]> | undefined;

  constructor(code: ApiError['code'], message: string, fieldErrors?: Record<string, string[]>) {
    super(message);
    this.name = 'HttpError';
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

/** BigInt (MediaAsset.byteSize) and Date are not valid JSON on their own. */
export function serialize<T>(value: T): unknown {
  return JSON.parse(
    JSON.stringify(value, (_key, raw) =>
      typeof raw === 'bigint' ? Number(raw) : raw,
    ),
  );
}

export function sendJson(res: VercelResponse, status: number, body: unknown): void {
  res.status(status);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(serialize(body)));
}

export function sendError(res: VercelResponse, error: ApiError): void {
  sendJson(res, STATUS_BY_CODE[error.code], { ok: false, error });
}

export function sendOk(res: VercelResponse, data: unknown, meta?: Record<string, unknown>): void {
  sendJson(res, 200, { ok: true, data, ...(meta ? { meta } : {}) });
}

export function fieldErrorsFrom(error: z.ZodError): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.map(String).join('.') || '_form';
    (result[key] ??= []).push(issue.message);
  }
  return result;
}

export function parseOrThrow<T>(schema: z.ZodType<T>, payload: unknown): T {
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    throw new HttpError('VALIDATION', 'Some fields need attention.', fieldErrorsFrom(parsed.error));
  }
  return parsed.data;
}

export function requireMethod(req: VercelRequest, allowed: readonly string[]): string {
  const method = (req.method ?? 'GET').toUpperCase();
  if (!allowed.includes(method)) {
    throw new HttpError('METHOD_NOT_ALLOWED', `${method} is not supported here.`);
  }
  return method;
}

/** Vercel parses JSON bodies already, but be defensive about raw strings. */
export function readBody(req: VercelRequest): Record<string, unknown> {
  const raw = req.body;
  if (raw == null) return {};
  if (typeof raw === 'string') {
    if (!raw.trim()) return {};
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      throw new HttpError('VALIDATION', 'Request body was not valid JSON.');
    }
  }
  if (typeof raw === 'object') return raw as Record<string, unknown>;
  return {};
}

export function clientIp(req: VercelRequest): string | null {
  const header = req.headers['x-forwarded-for'];
  const value = Array.isArray(header) ? header[0] : header;
  return value?.split(',')[0]?.trim() || null;
}

export function clientUserAgent(req: VercelRequest): string | null {
  const value = req.headers['user-agent'];
  return (Array.isArray(value) ? value[0] : value) ?? null;
}

/** Path segments after the function's mount point, e.g. /api/admin/a/b -> ['a','b']. */
export function routeSegments(req: VercelRequest, key = 'route'): string[] {
  const value = req.query[key];
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string' && value) return value.split('/').filter(Boolean);
  return [];
}

type Handler = (req: VercelRequest, res: VercelResponse) => Promise<void> | void;

/** Uniform error handling + no-store caching for every endpoint. */
export function withApi(handler: Handler): Handler {
  return async (req, res) => {
    res.setHeader('Cache-Control', 'no-store, max-age=0, must-revalidate');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    try {
      await handler(req, res);
    } catch (error) {
      if (error instanceof HttpError) {
        sendError(res, {
          code: error.code,
          message: error.message,
          ...(error.fieldErrors ? { fieldErrors: error.fieldErrors } : {}),
        });
        return;
      }

      if (error instanceof z.ZodError) {
        sendError(res, {
          code: 'VALIDATION',
          message: 'Some fields need attention.',
          fieldErrors: fieldErrorsFrom(error),
        });
        return;
      }

      // Never leak a driver stack trace to the browser.
      console.error('[api] unexpected error', error);
      sendError(res, {
        code: 'UNEXPECTED',
        message: 'Something went wrong. Please try again.',
      });
    }
  };
}
