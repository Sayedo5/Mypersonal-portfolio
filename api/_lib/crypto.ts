import { createHmac, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
) => Promise<Buffer>;

const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

/**
 * scrypt with a per-password salt. Format: `scrypt$<saltHex>$<hashHex>`.
 * Node ships scrypt in core, so this avoids a native bcrypt build in a
 * serverless bundle.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const derived = await scryptAsync(password.normalize('NFKC'), salt, KEY_LENGTH);
  return `scrypt$${salt.toString('hex')}$${derived.toString('hex')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, saltHex, hashHex] = stored.split('$');
  if (scheme !== 'scrypt' || !saltHex || !hashHex) return false;

  const expected = Buffer.from(hashHex, 'hex');
  const derived = await scryptAsync(
    password.normalize('NFKC'),
    Buffer.from(saltHex, 'hex'),
    expected.length,
  );
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}

export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url');
}

/** Constant-time compare for opaque tokens and recovery codes. */
export function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

/**
 * One-way IP hash for contact rate limiting, so the inbox never stores a
 * raw visitor address.
 */
export function hashIdentifier(value: string, secret: string): string {
  return createHmac('sha256', secret).update(value).digest('hex');
}

/** Human-friendly 10-character recovery codes, e.g. `A3F9-K2M8Q1`. */
export function generateBackupCodes(count = 10): string[] {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: count }, () => {
    const raw = Array.from(randomBytes(10), (byte) => alphabet[byte % alphabet.length]).join('');
    return `${raw.slice(0, 4)}-${raw.slice(4)}`;
  });
}
