import { prisma } from './prisma.js';

export type AuditEvent = {
  ownerUserId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
};

/**
 * Keys that must never reach the audit table. The reference project redacts
 * the same class of values: credentials, tokens, recovery codes and the
 * bodies of contact messages.
 */
const REDACTED_KEYS = new Set([
  'password',
  'passwordhash',
  'currentpassword',
  'newpassword',
  'token',
  'secret',
  'backupcodes',
  'recoverycode',
  'code',
  'message',
  'structureddata',
]);

function redact(value: unknown, depth = 0): unknown {
  if (depth > 4 || value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return `[${value.length} items]`;

  const output: Record<string, unknown> = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (REDACTED_KEYS.has(key.toLowerCase())) {
      output[key] = '[redacted]';
      continue;
    }
    if (typeof raw === 'string' && raw.length > 120) {
      output[key] = `${raw.slice(0, 120)}…`;
      continue;
    }
    output[key] = redact(raw, depth + 1);
  }
  return output;
}

/** Audit writes must never break the operation they are recording. */
export async function writeAudit(event: AuditEvent): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        ownerUserId: event.ownerUserId ?? null,
        action: event.action,
        entityType: event.entityType,
        entityId: event.entityId ?? null,
        metadata: (event.metadata ? redact(event.metadata) : null) as never,
        ipAddress: event.ipAddress ?? null,
      },
    });
  } catch (error) {
    console.error('[audit] failed to record event', event.action, error);
  }
}
