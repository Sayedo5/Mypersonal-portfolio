import type { VercelRequest, VercelResponse } from '@vercel/node';

import { prisma } from './_lib/prisma.js';
import { ContactSubmissionSchema } from './_lib/schemas.js';
import { enforceRateLimit } from './_lib/rate-limit.js';
import { hashIdentifier } from './_lib/crypto.js';
import { loadServerEnv } from './_lib/env.js';
import { writeAudit } from './_lib/audit.js';
import {
  clientIp,
  clientUserAgent,
  parseOrThrow,
  readBody,
  requireMethod,
  sendOk,
  withApi,
} from './_lib/http.js';

/**
 * POST /api/contact — public contact form.
 *
 * Honeypot + hourly per-IP rate limit. The stored metadata holds only a
 * one-way hash of the address, never the address itself.
 */
export default withApi(async function handler(req: VercelRequest, res: VercelResponse) {
  requireMethod(req, ['POST']);

  const ip = clientIp(req);
  await enforceRateLimit('contact', ip);

  const input = parseOrThrow(ContactSubmissionSchema, readBody(req));

  // A filled honeypot is a bot. Answer 200 so it learns nothing.
  if (input.website.trim()) {
    sendOk(res, { received: true });
    return;
  }

  const secret = loadServerEnv().AUTH_SECRET;

  const message = await prisma.contactMessage.create({
    data: {
      name: input.name,
      email: input.email,
      company: input.company,
      subject: input.subject ?? `Project enquiry from ${input.name}`,
      message: input.message,
      requestMetadata: {
        ipHash: ip ? hashIdentifier(ip, secret) : null,
        userAgent: clientUserAgent(req)?.slice(0, 200) ?? null,
      },
    },
    select: { id: true },
  });

  await writeAudit({
    action: 'CONTACT_RECEIVED',
    entityType: 'ContactMessage',
    entityId: message.id,
    ipAddress: ip,
  });

  sendOk(res, { received: true });
});
