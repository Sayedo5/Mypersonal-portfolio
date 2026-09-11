import type { VercelRequest, VercelResponse } from '@vercel/node';

import { prisma } from './prisma.js';
import { HttpError, clientIp, clientUserAgent } from './http.js';
import { randomToken, safeEqual } from './crypto.js';
import { loadServerEnv } from './env.js';

export const SESSION_COOKIE = 'sm_admin_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

export type OwnerSession = {
  sessionId: string;
  mfaPassed: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    twoFactorEnabled: boolean;
  };
};

function parseCookies(header: string | undefined): Record<string, string> {
  if (!header) return {};
  return Object.fromEntries(
    header
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const index = part.indexOf('=');
        if (index < 0) return [part, ''];
        return [part.slice(0, index), decodeURIComponent(part.slice(index + 1))];
      }),
  );
}

function cookieAttributes(maxAgeSeconds: number): string {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}${secure}`;
}

export function setSessionCookie(res: VercelResponse, token: string): void {
  res.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE}=${encodeURIComponent(token)}; ${cookieAttributes(
      Math.floor(SESSION_TTL_MS / 1000),
    )}`,
  );
}

export function clearSessionCookie(res: VercelResponse): void {
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; ${cookieAttributes(0)}`);
}

export function readSessionToken(req: VercelRequest): string | null {
  return parseCookies(req.headers.cookie)[SESSION_COOKIE] ?? null;
}

export async function createSession(
  req: VercelRequest,
  userId: string,
  mfaPassed: boolean,
): Promise<string> {
  const token = randomToken(36);
  await prisma.session.create({
    data: {
      token,
      userId,
      mfaPassed,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
      ipAddress: clientIp(req),
      userAgent: clientUserAgent(req),
    },
  });
  return token;
}

export async function promoteSessionToMfaPassed(sessionId: string): Promise<void> {
  await prisma.session.update({ where: { id: sessionId }, data: { mfaPassed: true } });
}

export async function destroySession(token: string): Promise<void> {
  await prisma.session.deleteMany({ where: { token } });
}

/** Loads the session behind the cookie, or null. Expired rows are swept. */
export async function loadSession(req: VercelRequest): Promise<OwnerSession | null> {
  const token = readSessionToken(req);
  if (!token) return null;

  const row = await prisma.session.findUnique({
    where: { token },
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true, twoFactorEnabled: true },
      },
    },
  });

  if (!row || !safeEqual(row.token, token)) return null;

  if (row.expiresAt.getTime() <= Date.now()) {
    await prisma.session.deleteMany({ where: { id: row.id } });
    return null;
  }

  return {
    sessionId: row.id,
    mfaPassed: row.mfaPassed,
    user: row.user,
  };
}

/**
 * Signed in with a password, but not yet through TOTP. Used only by the
 * two-factor and enrollment endpoints.
 */
export async function requirePartialSession(req: VercelRequest): Promise<OwnerSession> {
  const session = await loadSession(req);
  if (!session) throw new HttpError('UNAUTHENTICATED', 'Sign in to continue.');
  if (session.user.role !== 'OWNER') throw new HttpError('FORBIDDEN', 'Owner access only.');
  return session;
}

/**
 * The guard every admin mutation uses. Mirrors the reference project's
 * `requireOwnerWithMfa`: password AND a verified TOTP code are mandatory.
 */
export async function requireOwnerWithMfa(req: VercelRequest): Promise<OwnerSession> {
  const session = await requirePartialSession(req);

  if (!session.user.twoFactorEnabled) {
    throw new HttpError(
      'MFA_ENROLLMENT_REQUIRED',
      'Set up two-factor authentication to continue.',
    );
  }

  if (!session.mfaPassed) {
    throw new HttpError('MFA_REQUIRED', 'Enter your authenticator code to continue.');
  }

  return session;
}

/** Ensures AUTH_SECRET is present before any auth work happens. */
export function authSecret(): string {
  return loadServerEnv().AUTH_SECRET;
}
