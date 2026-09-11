import type { VercelRequest, VercelResponse } from '@vercel/node';

import { readPortfolioContent } from './_lib/public-content.js';
import { requireMethod, sendOk, withApi } from './_lib/http.js';
import { loadSession } from './_lib/session.js';

/**
 * GET /api/content            published snapshots (what the live site renders)
 * GET /api/content?preview=1  live drafts, owner-only
 *
 * `no-store` is set by `withApi`, so an admin publish is visible on the very
 * next fetch — this is the SPA equivalent of the reference project's
 * `updateTag()` cache invalidation.
 */
export default withApi(async function handler(req: VercelRequest, res: VercelResponse) {
  requireMethod(req, ['GET']);

  const wantsPreview = req.query.preview === '1' || req.query.preview === 'true';
  let preview = false;

  if (wantsPreview) {
    const session = await loadSession(req);
    preview = Boolean(session && session.user.role === 'OWNER' && session.mfaPassed);
  }

  const content = await readPortfolioContent(preview);
  sendOk(res, content, { preview, generatedAt: new Date().toISOString() });
});
