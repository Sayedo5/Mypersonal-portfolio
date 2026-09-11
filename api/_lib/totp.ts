import { Secret, TOTP } from 'otpauth';
import QRCode from 'qrcode';

import { loadServerEnv } from './env.js';

const DIGITS = 6;
const PERIOD = 30;
/** Accept the neighbouring step either side, for clock drift. */
const WINDOW = 1;

function totpFor(secretBase32: string, label: string): TOTP {
  return new TOTP({
    issuer: loadServerEnv().TOTP_ISSUER,
    label,
    algorithm: 'SHA1',
    digits: DIGITS,
    period: PERIOD,
    secret: Secret.fromBase32(secretBase32),
  });
}

export function generateTotpSecret(): string {
  return new Secret({ size: 20 }).base32;
}

export function totpUri(secretBase32: string, label: string): string {
  return totpFor(secretBase32, label).toString();
}

/** Data-URL QR code for the enrollment screen. */
export async function totpQrDataUrl(secretBase32: string, label: string): Promise<string> {
  return QRCode.toDataURL(totpUri(secretBase32, label), {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 240,
  });
}

export function verifyTotp(secretBase32: string, label: string, token: string): boolean {
  const normalized = token.replace(/\s/g, '');
  if (!/^\d{6}$/.test(normalized)) return false;
  return totpFor(secretBase32, label).validate({ token: normalized, window: WINDOW }) !== null;
}
