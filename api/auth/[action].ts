import type { VercelRequest, VercelResponse } from '@vercel/node';

import { prisma } from '../_lib/prisma.js';
import { writeAudit } from '../_lib/audit.js';
import { enforceRateLimit, pruneRateLimits } from '../_lib/rate-limit.js';
import {
  generateBackupCodes,
  hashPassword,
  safeEqual,
  verifyPassword,
} from '../_lib/crypto.js';
import { generateTotpSecret, totpQrDataUrl, verifyTotp } from '../_lib/totp.js';
import {
  ChangePasswordSchema,
  LoginSchema,
  RecoveryCodeSchema,
  TotpSchema,
} from '../_lib/schemas.js';
import {
  HttpError,
  clientIp,
  parseOrThrow,
  readBody,
  requireMethod,
  sendOk,
  withApi,
} from '../_lib/http.js';
import {
  clearSessionCookie,
  createSession,
  destroySession,
  loadSession,
  promoteSessionToMfaPassed,
  readSessionToken,
  requireOwnerWithMfa,
  requirePartialSession,
  setSessionCookie,
} from '../_lib/session.js';

const MFA_LOCK_THRESHOLD = 5;
const MFA_LOCK_MS = 15 * 60 * 1000;

/** What the admin SPA needs to decide which screen to show. */
type SessionView = {
  authenticated: boolean;
  mfaPassed: boolean;
  needsEnrollment: boolean;
  user: { id: string; name: string; email: string } | null;
};

const anonymous: SessionView = {
  authenticated: false,
  mfaPassed: false,
  needsEnrollment: false,
  user: null,
};

async function handleSession(req: VercelRequest, res: VercelResponse) {
  requireMethod(req, ['GET']);
  const session = await loadSession(req);

  if (!session) {
    sendOk(res, anonymous);
    return;
  }

  sendOk(res, {
    authenticated: true,
    mfaPassed: session.mfaPassed,
    needsEnrollment: !session.user.twoFactorEnabled,
    user: { id: session.user.id, name: session.user.name, email: session.user.email },
  } satisfies SessionView);
}

async function handleLogin(req: VercelRequest, res: VercelResponse) {
  requireMethod(req, ['POST']);

  const ip = clientIp(req);
  await enforceRateLimit('sign-in', ip);

  const input = parseOrThrow(LoginSchema, readBody(req));
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  // Same message and comparable timing whether the account exists or not.
  const passwordOk = user ? await verifyPassword(input.password, user.passwordHash) : false;

  if (!user || !passwordOk || user.role !== 'OWNER') {
    await writeAudit({
      action: 'LOGIN_FAILED',
      entityType: 'User',
      entityId: user?.id ?? null,
      ipAddress: ip,
    });
    throw new HttpError('UNAUTHENTICATED', 'Those credentials were not recognised.');
  }

  // Password alone never grants access: the session starts un-elevated.
  const token = await createSession(req, user.id, false);
  setSessionCookie(res, token);

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await writeAudit({
    action: 'LOGIN_PASSWORD_OK',
    entityType: 'User',
    entityId: user.id,
    ipAddress: ip,
  });
  void pruneRateLimits();

  sendOk(res, {
    authenticated: true,
    mfaPassed: false,
    needsEnrollment: !user.twoFactorEnabled,
    user: { id: user.id, name: user.name, email: user.email },
  } satisfies SessionView);
}

/** Starts (or restarts) TOTP enrollment and returns the QR code. */
async function handleEnrollStart(req: VercelRequest, res: VercelResponse) {
  requireMethod(req, ['POST']);
  const session = await requirePartialSession(req);

  if (session.user.twoFactorEnabled) {
    throw new HttpError('CONFLICT', 'Two-factor authentication is already enabled.');
  }

  const secret = generateTotpSecret();
  await prisma.twoFactor.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, secret, verified: false },
    update: { secret, verified: false, backupCodes: [], failedVerificationCount: 0, lockedUntil: null },
  });

  sendOk(res, {
    secret,
    qrDataUrl: await totpQrDataUrl(secret, session.user.email),
  });
}

/** Confirms the first code, enables MFA and issues one-time recovery codes. */
async function handleEnrollVerify(req: VercelRequest, res: VercelResponse) {
  requireMethod(req, ['POST']);
  const session = await requirePartialSession(req);
  const input = parseOrThrow(TotpSchema, readBody(req));

  const record = await prisma.twoFactor.findUnique({ where: { userId: session.user.id } });
  if (!record) {
    throw new HttpError('NOT_FOUND', 'Start enrollment again to get a fresh QR code.');
  }

  if (!verifyTotp(record.secret, session.user.email, input.code)) {
    throw new HttpError('VALIDATION', 'That code did not match.', {
      code: ['Check your authenticator app and try the current code.'],
    });
  }

  const backupCodes = generateBackupCodes();
  const hashed = await Promise.all(backupCodes.map((code) => hashPassword(code)));

  await prisma.$transaction([
    prisma.twoFactor.update({
      where: { userId: session.user.id },
      data: { verified: true, backupCodes: hashed, failedVerificationCount: 0, lockedUntil: null },
    }),
    prisma.user.update({ where: { id: session.user.id }, data: { twoFactorEnabled: true } }),
    prisma.session.update({ where: { id: session.sessionId }, data: { mfaPassed: true } }),
  ]);

  await writeAudit({
    action: 'MFA_ENROLLED',
    entityType: 'User',
    entityId: session.user.id,
    ipAddress: clientIp(req),
  });

  // Shown exactly once — they are stored hashed and cannot be recovered.
  sendOk(res, { backupCodes });
}

async function handleTwoFactor(req: VercelRequest, res: VercelResponse) {
  requireMethod(req, ['POST']);

  const ip = clientIp(req);
  await enforceRateLimit('two-factor', ip);

  const session = await requirePartialSession(req);
  if (session.mfaPassed) {
    sendOk(res, { mfaPassed: true });
    return;
  }

  const record = await prisma.twoFactor.findUnique({ where: { userId: session.user.id } });
  if (!record || !record.verified) {
    throw new HttpError('MFA_ENROLLMENT_REQUIRED', 'Set up two-factor authentication first.');
  }

  if (record.lockedUntil && record.lockedUntil.getTime() > Date.now()) {
    throw new HttpError('RATE_LIMITED', 'Too many incorrect codes. Try again in a few minutes.');
  }

  const body = readBody(req);
  const usingRecovery = typeof body.recoveryCode === 'string' && body.recoveryCode.trim() !== '';

  let accepted = false;
  let remainingCodes = record.backupCodes;

  if (usingRecovery) {
    const input = parseOrThrow(RecoveryCodeSchema, body);
    const candidate = input.recoveryCode.toUpperCase();

    for (const stored of record.backupCodes) {
      if (await verifyPassword(candidate, stored)) {
        accepted = true;
        // One-time use: burn the code that just worked.
        remainingCodes = record.backupCodes.filter((value) => !safeEqual(value, stored));
        break;
      }
    }
  } else {
    const input = parseOrThrow(TotpSchema, body);
    accepted = verifyTotp(record.secret, session.user.email, input.code);
  }

  if (!accepted) {
    const failures = record.failedVerificationCount + 1;
    await prisma.twoFactor.update({
      where: { userId: session.user.id },
      data: {
        failedVerificationCount: failures,
        lockedUntil: failures >= MFA_LOCK_THRESHOLD ? new Date(Date.now() + MFA_LOCK_MS) : null,
      },
    });
    await writeAudit({
      action: 'MFA_FAILED',
      entityType: 'User',
      entityId: session.user.id,
      ipAddress: ip,
    });
    throw new HttpError('VALIDATION', 'That code did not match.', {
      code: ['Check your authenticator app and try the current code.'],
    });
  }

  await prisma.twoFactor.update({
    where: { userId: session.user.id },
    data: { failedVerificationCount: 0, lockedUntil: null, backupCodes: remainingCodes },
  });
  await promoteSessionToMfaPassed(session.sessionId);

  await writeAudit({
    action: usingRecovery ? 'MFA_RECOVERY_USED' : 'MFA_OK',
    entityType: 'User',
    entityId: session.user.id,
    ipAddress: ip,
  });

  sendOk(res, { mfaPassed: true, recoveryCodesRemaining: remainingCodes.length });
}

async function handleLogout(req: VercelRequest, res: VercelResponse) {
  requireMethod(req, ['POST']);
  const token = readSessionToken(req);
  if (token) await destroySession(token);
  clearSessionCookie(res);
  sendOk(res, anonymous);
}

async function handleChangePassword(req: VercelRequest, res: VercelResponse) {
  requireMethod(req, ['POST']);
  const session = await requireOwnerWithMfa(req);
  const input = parseOrThrow(ChangePasswordSchema, readBody(req));

  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } });
  if (!(await verifyPassword(input.currentPassword, user.passwordHash))) {
    throw new HttpError('VALIDATION', 'That is not your current password.', {
      currentPassword: ['Incorrect password.'],
    });
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await hashPassword(input.newPassword) },
    }),
    // Every other device is signed out.
    prisma.session.deleteMany({ where: { userId: user.id, NOT: { id: session.sessionId } } }),
  ]);

  await writeAudit({
    action: 'PASSWORD_CHANGED',
    entityType: 'User',
    entityId: user.id,
    ipAddress: clientIp(req),
  });

  sendOk(res, { changed: true });
}

/** Regenerates recovery codes without re-enrolling the authenticator. */
async function handleRegenerateCodes(req: VercelRequest, res: VercelResponse) {
  requireMethod(req, ['POST']);
  const session = await requireOwnerWithMfa(req);

  const backupCodes = generateBackupCodes();
  await prisma.twoFactor.update({
    where: { userId: session.user.id },
    data: { backupCodes: await Promise.all(backupCodes.map((code) => hashPassword(code))) },
  });

  await writeAudit({
    action: 'MFA_CODES_REGENERATED',
    entityType: 'User',
    entityId: session.user.id,
    ipAddress: clientIp(req),
  });

  sendOk(res, { backupCodes });
}

/** Signs out every session, including this one. */
async function handleRevokeSessions(req: VercelRequest, res: VercelResponse) {
  requireMethod(req, ['POST']);
  const session = await requireOwnerWithMfa(req);

  await prisma.session.deleteMany({ where: { userId: session.user.id } });
  clearSessionCookie(res);

  await writeAudit({
    action: 'SESSIONS_REVOKED',
    entityType: 'User',
    entityId: session.user.id,
    ipAddress: clientIp(req),
  });

  sendOk(res, anonymous);
}

const ROUTES = {
  session: handleSession,
  login: handleLogin,
  'enroll-start': handleEnrollStart,
  'enroll-verify': handleEnrollVerify,
  'two-factor': handleTwoFactor,
  logout: handleLogout,
  'change-password': handleChangePassword,
  'regenerate-codes': handleRegenerateCodes,
  'revoke-sessions': handleRevokeSessions,
} as const;

export default withApi(async function handler(req: VercelRequest, res: VercelResponse) {
  const raw = req.query.action;
  const action = (Array.isArray(raw) ? raw[0] : raw) ?? '';

  const route = ROUTES[action as keyof typeof ROUTES];
  if (!route) throw new HttpError('NOT_FOUND', 'Unknown auth action.');

  await route(req, res);
});
