import { prisma } from './prisma.js';
import { HttpError } from './http.js';
import { loadServerEnv } from './env.js';

/**
 * Media lives in Vercel Blob. The browser uploads straight to Blob using a
 * short-lived client token, then calls back here to register the asset —
 * so a 10 MB portrait never has to squeeze through a serverless function's
 * request-body limit.
 */

const IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
  'image/svg+xml',
]);
const DOCUMENT_TYPES = new Set(['application/pdf']);
const VIDEO_TYPES = new Set(['video/mp4', 'video/webm']);

export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

export function kindForMimeType(mimeType: string): 'IMAGE' | 'DOCUMENT' | 'VIDEO' {
  if (IMAGE_TYPES.has(mimeType)) return 'IMAGE';
  if (DOCUMENT_TYPES.has(mimeType)) return 'DOCUMENT';
  if (VIDEO_TYPES.has(mimeType)) return 'VIDEO';
  throw new HttpError('VALIDATION', `Files of type ${mimeType} are not allowed.`, {
    file: ['Upload an image, an MP4/WebM video, or a PDF.'],
  });
}

export function allowedContentTypes(): string[] {
  return [...IMAGE_TYPES, ...DOCUMENT_TYPES, ...VIDEO_TYPES];
}

export function assertBlobConfigured(): string {
  const env = loadServerEnv();
  if (env.MEDIA_PROVIDER !== 'vercel-blob' || !env.BLOB_READ_WRITE_TOKEN) {
    throw new HttpError(
      'UNAVAILABLE',
      'Media uploads are disabled. Link a Vercel Blob store and set MEDIA_PROVIDER="vercel-blob".',
    );
  }
  return env.BLOB_READ_WRITE_TOKEN;
}

export async function listMedia() {
  return prisma.mediaAsset.findMany({ orderBy: { createdAt: 'desc' } });
}

/**
 * Alt text, width and height are all optional here on purpose.
 *
 * Upload is a two-step flow: the browser sends the file to Blob storage and
 * immediately registers it, then the owner writes the alt text in the Media
 * screen (saved on blur). So an asset legitimately has no alt text at the
 * moment it is registered — required alt text is enforced where it actually
 * matters, on ProjectMedia, which the schema types as non-null.
 *
 * Each field accepts `undefined` as well as `null` so the shape is satisfied
 * whether the caller's validator emits an optional key or a required one —
 * this is what the Vercel build tripped over when the property was required.
 */
export async function registerAsset(input: {
  storageKey: string;
  publicUrl: string;
  originalName: string;
  mimeType: string;
  byteSize: number;
  altText?: string | null | undefined;
  width?: number | null | undefined;
  height?: number | null | undefined;
}) {
  if (input.byteSize > MAX_UPLOAD_BYTES) {
    throw new HttpError('VALIDATION', 'That file is larger than the 50 MB limit.');
  }

  return prisma.mediaAsset.upsert({
    where: { storageKey: input.storageKey },
    create: {
      kind: kindForMimeType(input.mimeType),
      storageProvider: 'VERCEL_BLOB',
      storageKey: input.storageKey,
      publicUrl: input.publicUrl,
      originalName: input.originalName,
      mimeType: input.mimeType,
      byteSize: BigInt(Math.round(input.byteSize)),
      width: input.width ?? null,
      height: input.height ?? null,
      altText: input.altText ?? null,
    },
    update: {
      publicUrl: input.publicUrl,
      byteSize: BigInt(Math.round(input.byteSize)),
      // Only touch alt text when the caller actually supplied it, so
      // re-uploading a file does not wipe the description already written
      // for it in the Media screen.
      ...(input.altText === undefined ? {} : { altText: input.altText }),
    },
  });
}

/**
 * Counts every reference to an asset. Mirrors the reference project's rule
 * that a referenced asset can never be deleted out from under the site.
 */
export async function countReferences(id: string): Promise<number> {
  const [site, theme, projectMedia] = await Promise.all([
    prisma.siteSettings.count({ where: { resumeMediaAssetId: id } }),
    prisma.themeSettings.count({
      where: {
        OR: [
          { logoMediaAssetId: id },
          { faviconMediaAssetId: id },
          { portraitMediaAssetId: id },
          { watermarkMediaAssetId: id },
          { heroVideoMediaAssetId: id },
          { socialMediaAssetId: id },
        ],
      },
    }),
    prisma.projectMedia.count({ where: { mediaAssetId: id } }),
  ]);

  return site + theme + projectMedia;
}

export async function deleteAsset(id: string): Promise<void> {
  const asset = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!asset) throw new HttpError('NOT_FOUND', 'That file no longer exists.');

  if ((await countReferences(id)) > 0) {
    throw new HttpError(
      'CONFLICT',
      'That file is still in use. Remove it from the section that references it first.',
    );
  }

  if (asset.storageProvider === 'VERCEL_BLOB') {
    const token = assertBlobConfigured();
    const { del } = await import('@vercel/blob');
    await del(asset.publicUrl, { token });
  }

  await prisma.mediaAsset.delete({ where: { id } });
}
