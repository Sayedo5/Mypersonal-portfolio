import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../prisma/generated/client/client.js';
import { hashPassword } from '../api/_lib/crypto.js';

/**
 * Resets the owner's password and/or two-factor enrollment.
 *
 * `admin:bootstrap` is deliberately create-only — it refuses to touch an
 * account that already exists, so changing ADMIN_INITIAL_PASSWORD after the
 * first run has no effect. That is the right default (an env var should not
 * silently rewrite live credentials), but it leaves no way back in if the
 * password is lost. This script is that way back, and it is explicit about
 * it: nothing happens unless you pass the values.
 *
 *   ADMIN_EMAIL=old@example.com ADMIN_NEW_EMAIL=new@example.com npm run admin:reset
 *   ADMIN_EMAIL=you@example.com ADMIN_NEW_PASSWORD='…'           npm run admin:reset
 *   ADMIN_EMAIL=you@example.com RESET_2FA=true                   npm run admin:reset
 */
const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const newPassword = process.env.ADMIN_NEW_PASSWORD;
const newEmail = process.env.ADMIN_NEW_EMAIL?.trim().toLowerCase();
const reset2fa = process.env.RESET_2FA === 'true';

if (!connectionString) throw new Error('DIRECT_URL or DATABASE_URL must be set.');
if (!email) throw new Error('ADMIN_EMAIL must be set to the account you want to reset.');
if (!newPassword && !reset2fa && !newEmail) {
  throw new Error(
    'Nothing to do. Set ADMIN_NEW_PASSWORD, ADMIN_NEW_EMAIL and/or RESET_2FA=true.',
  );
}
if (newPassword && newPassword.length < 12) {
  throw new Error('ADMIN_NEW_PASSWORD must be at least 12 characters.');
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  console.log(`database endpoint : ${new URL(connectionString as string).hostname}`);

  const user = await prisma.user.findUnique({
    where: { email: email as string },
    select: { id: true, email: true, twoFactorEnabled: true },
  });

  if (!user) {
    const all = await prisma.user.findMany({ select: { email: true } });
    console.error(`\nNo account with email "${email}" in this database.`);
    console.error(
      all.length
        ? `Existing account(s): ${all.map((u) => `"${u.email}"`).join(', ')}`
        : 'This database has no accounts at all — run `npm run admin:bootstrap` first.',
    );
    process.exitCode = 1;
    return;
  }

  const changes: string[] = [];

  if (newEmail && newEmail !== user.email) {
    const taken = await prisma.user.findUnique({ where: { email: newEmail }, select: { id: true } });
    if (taken) throw new Error(`Another account already uses "${newEmail}".`);
    await prisma.user.update({ where: { id: user.id }, data: { email: newEmail } });
    changes.push(`email changed to "${newEmail}"`);
  }

  if (newPassword) {
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await hashPassword(newPassword) },
    });
    changes.push('password updated');
  }

  if (reset2fa) {
    await prisma.twoFactor.deleteMany({ where: { userId: user.id } });
    await prisma.user.update({ where: { id: user.id }, data: { twoFactorEnabled: false } });
    changes.push('two-factor enrollment cleared — the next sign-in shows a fresh QR code');
  }

  // Any existing session is now stale; force a clean sign-in everywhere.
  await prisma.session.deleteMany({ where: { userId: user.id } });
  await prisma.rateLimit.deleteMany({});

  await prisma.auditLog.create({
    data: {
      ownerUserId: user.id,
      action: 'OWNER_CREDENTIALS_RESET',
      entityType: 'User',
      entityId: user.id,
      metadata: { passwordChanged: Boolean(newPassword), twoFactorReset: reset2fa },
    },
  });

  console.log(`\nAccount "${user.email}":`);
  for (const change of changes) console.log(`  - ${change}`);
  console.log('  - all sessions signed out');
  console.log('\nSign in at /admin/login with the email above.');
}

main()
  .catch((error) => {
    console.error('Reset failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
