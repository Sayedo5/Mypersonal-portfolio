import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../prisma/generated/client/client.js';
import { hashPassword } from '../api/_lib/crypto.js';

/**
 * Creates the single owner account.
 *
 * Idempotent and deliberately narrow: it only ever touches the account at
 * ADMIN_EMAIL, and it refuses to reset the password of an account that
 * already exists. Delete ADMIN_INITIAL_PASSWORD from the hosted environment
 * once this has run in production.
 */
const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
const name = process.env.ADMIN_NAME;
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_INITIAL_PASSWORD;

if (!connectionString) throw new Error('DIRECT_URL or DATABASE_URL must be set.');
if (!name) throw new Error('ADMIN_NAME must be set.');
if (!email) throw new Error('ADMIN_EMAIL must be set.');
if (!password || password.length < 12) {
  throw new Error('ADMIN_INITIAL_PASSWORD must be set and at least 12 characters.');
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: email as string } });

  if (existing) {
    console.log(`Owner account already exists for ${email}. Nothing changed.`);
    console.log(
      existing.twoFactorEnabled
        ? 'Two-factor authentication is enabled.'
        : 'Two-factor enrollment is still pending — you will be asked to scan a QR code at first sign-in.',
    );
    return;
  }

  const user = await prisma.user.create({
    data: {
      name: name as string,
      email: email as string,
      passwordHash: await hashPassword(password as string),
      role: 'OWNER',
      twoFactorEnabled: false,
    },
    select: { id: true, email: true },
  });

  await prisma.auditLog.create({
    data: { ownerUserId: user.id, action: 'OWNER_BOOTSTRAPPED', entityType: 'User', entityId: user.id },
  });

  console.log(`Owner account created for ${user.email}.`);
  console.log('Sign in at /admin/login. You will be required to enrol an authenticator app.');
  console.log('Remove ADMIN_INITIAL_PASSWORD from your hosted environment now.');
}

main()
  .catch((error) => {
    console.error('Bootstrap failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
