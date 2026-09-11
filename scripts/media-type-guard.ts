/**
 * Regression guard for the Vercel build error:
 *   TS2345: altText is optional in the object passed, but required in the
 *   function's parameter type.
 *
 * registerAsset must accept BOTH shapes, so no compiler configuration
 * (Vercel's builder included) can reject the call site.
 */
import { registerAsset } from '../api/_lib/media.js';

type Params = Parameters<typeof registerAsset>[0];

const base = {
  storageKey: 'portfolio/x.png',
  publicUrl: 'https://example.com/x.png',
  originalName: 'x.png',
  mimeType: 'image/png',
  byteSize: 1234,
};

// 1. altText absent entirely (what zod's .nullish() emits — the failing case)
const withoutAlt: Params = base;

// 2. altText explicitly undefined
const undefinedAlt: Params = { ...base, altText: undefined };

// 3. altText null
const nullAlt: Params = { ...base, altText: null };

// 4. altText a real string, plus dimensions
const fullAlt: Params = { ...base, altText: 'A portrait', width: 800, height: 1000 };

export const shapes = [withoutAlt, undefinedAlt, nullAlt, fullAlt];
