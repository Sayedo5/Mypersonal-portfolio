import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';

import { prisma } from '../_lib/prisma.js';
import { writeAudit } from '../_lib/audit.js';
import { requireOwnerWithMfa, type OwnerSession } from '../_lib/session.js';
import {
  ENTITIES,
  delegateFor,
  isEntityName,
  snapshotOf,
  stampPublished,
  toPrismaData,
  type EntityDefinition,
  type EntityName,
} from '../_lib/registry.js';
import {
  MediaAssetUpdateSchema,
  ProjectSchema,
  ReorderSchema,
} from '../_lib/schemas.js';
import {
  allowedContentTypes,
  assertBlobConfigured,
  deleteAsset,
  listMedia,
  registerAsset,
} from '../_lib/media.js';
import {
  createProject,
  deleteProject,
  getProject,
  listProjects,
  publishProject,
  toAdminProject,
  updateProject,
} from '../_lib/projects.js';
import {
  HttpError,
  clientIp,
  parseOrThrow,
  readBody,
  requireMethod,
  routeSegments,
  sendOk,
  withApi,
} from '../_lib/http.js';

type Ctx = {
  req: VercelRequest;
  res: VercelResponse;
  owner: OwnerSession;
  method: string;
  segments: string[];
};

const audit = (ctx: Ctx, action: string, entityType: string, entityId?: string | null, metadata?: Record<string, unknown>) =>
  writeAudit({
    ownerUserId: ctx.owner.user.id,
    action,
    entityType,
    entityId: entityId ?? null,
    metadata: metadata ?? null,
    ipAddress: clientIp(ctx.req),
  });

/** `updatedAt` after `publishedAt` means the draft has moved on. */
function withPublishState(row: Record<string, unknown>) {
  const publishedAt = row.publishedAt as Date | null;
  const updatedAt = row.updatedAt as Date | undefined;
  return {
    ...row,
    hasUnpublishedChanges:
      publishedAt === null || (updatedAt ? updatedAt.getTime() > publishedAt.getTime() : false),
  };
}

// ------------------------------------------------------------- overview

async function handleOverview(ctx: Ctx) {
  requireMethod(ctx.req, ['GET']);

  const [projectCount, unread, recentEvents, lastPublished, mediaCount] = await Promise.all([
    prisma.project.count(),
    prisma.contactMessage.count({ where: { status: 'UNREAD' } }),
    prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 12 }),
    prisma.project.findFirst({
      where: { publishedAt: { not: null } },
      orderBy: { publishedAt: 'desc' },
      select: { publishedAt: true },
    }),
    prisma.mediaAsset.count(),
  ]);

  // Anything whose draft has moved past its last publish counts as pending.
  const drafts = await Promise.all(
    (Object.keys(ENTITIES) as EntityName[]).map(async (entity) => {
      const rows = await delegateFor(entity).findMany({
        select: { publishedAt: true, updatedAt: true },
      });
      return rows.filter(
        (row) =>
          row.publishedAt === null ||
          (row.updatedAt as Date).getTime() > (row.publishedAt as Date).getTime(),
      ).length;
    }),
  );

  const projectDrafts = await prisma.project.findMany({
    select: { publishedAt: true, updatedAt: true },
  });

  const draftCount =
    drafts.reduce((total, count) => total + count, 0) +
    projectDrafts.filter(
      (row) => row.publishedAt === null || row.updatedAt.getTime() > row.publishedAt.getTime(),
    ).length;

  sendOk(ctx.res, {
    draftCount,
    projectCount,
    mediaCount,
    unreadMessageCount: unread,
    lastPublishedAt: lastPublished?.publishedAt ?? null,
    recentEvents,
    owner: ctx.owner.user,
  });
}

// ------------------------------------------------------ generic entities

async function publishOne(entity: EntityName, id: string): Promise<Date> {
  const delegate = delegateFor(entity);
  const row = await delegate.findUnique({ where: { id } });
  if (!row) throw new HttpError('NOT_FOUND', `${ENTITIES[entity].label} no longer exists.`);

  const publishedAt = new Date();
  const data: Record<string, unknown> = {
    publishedPayload: snapshotOf(entity, row),
    publishedAt,
  };
  // Singletons have no `status` column.
  if ('status' in row) data.status = 'PUBLISHED';

  await delegate.update({ where: { id }, data });
  // Make publishedAt == updatedAt so the row reads as cleanly published.
  await stampPublished(ENTITIES[entity].table, id);
  return publishedAt;
}

async function resolveSingletonId(entity: EntityName): Promise<string> {
  const definition = ENTITIES[entity] as EntityDefinition;
  const row = await delegateFor(entity).findUnique({
    where: { stableKey: definition.singleton },
    select: { id: true },
  });
  if (!row) {
    throw new HttpError(
      'NOT_FOUND',
      `${definition.label} has not been seeded yet. Run "npm run db:seed".`,
    );
  }
  return row.id as string;
}

async function handleEntity(ctx: Ctx, entity: EntityName) {
  const definition = ENTITIES[entity] as EntityDefinition;
  const delegate = delegateFor(entity);
  const [, ...rest] = ctx.segments;
  const first = rest[0];
  const second = rest[1];

  // POST /:entity/reorder
  if (ctx.method === 'POST' && first === 'reorder') {
    const input = parseOrThrow(ReorderSchema, readBody(ctx.req));
    await prisma.$transaction(
      input.ids.map((id, index) =>
        (prisma as unknown as Record<string, { update: (args: unknown) => unknown }>)[
          definition.model
        ].update({ where: { id }, data: { sortOrder: index } }),
      ) as never,
    );
    await audit(ctx, 'REORDER', definition.label, null, { count: input.ids.length });
    sendOk(ctx.res, { reordered: input.ids.length });
    return;
  }

  // POST /:entity/publish            (singleton)
  // POST /:entity/:id/publish        (collection row)
  if (ctx.method === 'POST' && (first === 'publish' || second === 'publish')) {
    const id = first === 'publish' ? await resolveSingletonId(entity) : (first as string);
    const publishedAt = await publishOne(entity, id);
    await audit(ctx, 'PUBLISH', definition.label, id);
    sendOk(ctx.res, { id, publishedAt });
    return;
  }

  // ---- singleton: GET / PUT -------------------------------------------
  if (definition.singleton) {
    if (ctx.method === 'GET') {
      const row = await delegate.findUnique({ where: { stableKey: definition.singleton } });
      if (!row) {
        throw new HttpError(
          'NOT_FOUND',
          `${definition.label} has not been seeded yet. Run "npm run db:seed".`,
        );
      }
      sendOk(ctx.res, withPublishState(row));
      return;
    }

    if (ctx.method === 'PUT' || ctx.method === 'PATCH') {
      const input = parseOrThrow(definition.schema, readBody(ctx.req));
      const row = await delegate.update({
        where: { stableKey: definition.singleton },
        data: toPrismaData(entity, input),
      });
      await audit(ctx, 'UPDATE', definition.label, row.id as string, input);
      sendOk(ctx.res, withPublishState(row));
      return;
    }

    throw new HttpError('METHOD_NOT_ALLOWED', `${ctx.method} is not supported here.`);
  }

  // ---- collection ------------------------------------------------------
  if (ctx.method === 'GET' && !first) {
    const rows = await delegate.findMany({
      ...(definition.orderBy ? { orderBy: definition.orderBy } : {}),
    });
    sendOk(ctx.res, rows.map(withPublishState));
    return;
  }

  if (ctx.method === 'GET' && first) {
    const row = await delegate.findUnique({ where: { id: first } });
    if (!row) throw new HttpError('NOT_FOUND', `${definition.label} no longer exists.`);
    sendOk(ctx.res, withPublishState(row));
    return;
  }

  if (ctx.method === 'POST' && !first) {
    const input = parseOrThrow(definition.schema, readBody(ctx.req));
    try {
      const row = await delegate.create({ data: toPrismaData(entity, input) });
      await audit(ctx, 'CREATE', definition.label, row.id as string, input);
      sendOk(ctx.res, withPublishState(row));
    } catch (error) {
      if ((error as { code?: string }).code === 'P2002') {
        throw new HttpError('CONFLICT', 'That key is already in use.', {
          stableKey: ['Choose a different key.'],
        });
      }
      throw error;
    }
    return;
  }

  if ((ctx.method === 'PUT' || ctx.method === 'PATCH') && first) {
    const input = parseOrThrow(definition.schema, readBody(ctx.req));
    try {
      const row = await delegate.update({ where: { id: first }, data: toPrismaData(entity, input) });
      await audit(ctx, 'UPDATE', definition.label, first, input);
      sendOk(ctx.res, withPublishState(row));
    } catch (error) {
      if ((error as { code?: string }).code === 'P2002') {
        throw new HttpError('CONFLICT', 'That key is already in use.', {
          stableKey: ['Choose a different key.'],
        });
      }
      if ((error as { code?: string }).code === 'P2025') {
        throw new HttpError('NOT_FOUND', `${definition.label} no longer exists.`);
      }
      throw error;
    }
    return;
  }

  if (ctx.method === 'DELETE' && first) {
    try {
      await delegate.delete({ where: { id: first } });
    } catch (error) {
      if ((error as { code?: string }).code === 'P2025') {
        throw new HttpError('NOT_FOUND', `${definition.label} no longer exists.`);
      }
      throw error;
    }
    await audit(ctx, 'DELETE', definition.label, first);
    sendOk(ctx.res, { deleted: true });
    return;
  }

  throw new HttpError('METHOD_NOT_ALLOWED', `${ctx.method} is not supported here.`);
}

// ------------------------------------------------------------- projects

async function handleProjects(ctx: Ctx) {
  const [, ...rest] = ctx.segments;
  const first = rest[0];
  const second = rest[1];

  if (ctx.method === 'POST' && first === 'reorder') {
    const input = parseOrThrow(ReorderSchema, readBody(ctx.req));
    await prisma.$transaction(
      input.ids.map((id, index) =>
        prisma.project.update({ where: { id }, data: { sortOrder: index } }),
      ),
    );
    await audit(ctx, 'REORDER', 'Project', null, { count: input.ids.length });
    sendOk(ctx.res, { reordered: input.ids.length });
    return;
  }

  if (ctx.method === 'POST' && second === 'publish' && first) {
    const result = await publishProject(first);
    await audit(ctx, 'PUBLISH', 'Project', first);
    sendOk(ctx.res, result);
    return;
  }

  if (ctx.method === 'GET' && !first) {
    const rows = await listProjects();
    sendOk(ctx.res, rows.map((row) => toAdminProject(row as never)));
    return;
  }

  if (ctx.method === 'GET' && first) {
    sendOk(ctx.res, toAdminProject(await getProject(first)));
    return;
  }

  if (ctx.method === 'POST' && !first) {
    const input = parseOrThrow(ProjectSchema, readBody(ctx.req));
    const row = await createProject(input);
    await audit(ctx, 'CREATE', 'Project', row.id, { title: input.title });
    sendOk(ctx.res, toAdminProject(row));
    return;
  }

  if ((ctx.method === 'PUT' || ctx.method === 'PATCH') && first) {
    const input = parseOrThrow(ProjectSchema, readBody(ctx.req));
    const row = await updateProject(first, input);
    await audit(ctx, 'UPDATE', 'Project', first, { title: input.title });
    sendOk(ctx.res, toAdminProject(row));
    return;
  }

  if (ctx.method === 'DELETE' && first) {
    await deleteProject(first);
    await audit(ctx, 'DELETE', 'Project', first);
    sendOk(ctx.res, { deleted: true });
    return;
  }

  throw new HttpError('METHOD_NOT_ALLOWED', `${ctx.method} is not supported here.`);
}

// ---------------------------------------------------------------- media

const RegisterAssetSchema = z.object({
  storageKey: z.string().min(1).max(500),
  publicUrl: z.string().min(1).max(1000),
  originalName: z.string().min(1).max(300),
  mimeType: z.string().min(1).max(120),
  byteSize: z.number().int().min(1),
  altText: z.string().trim().max(240).nullish().transform((v) => v || null),
  width: z.number().int().positive().nullish().transform((v) => v ?? null),
  height: z.number().int().positive().nullish().transform((v) => v ?? null),
});

async function handleMedia(ctx: Ctx) {
  const [, ...rest] = ctx.segments;
  const first = rest[0];

  // Hands the browser a scoped, short-lived token for a direct Blob upload.
  if (ctx.method === 'POST' && first === 'upload-token') {
    const token = assertBlobConfigured();
    sendOk(ctx.res, {
      token,
      allowedContentTypes: allowedContentTypes(),
      pathPrefix: 'portfolio',
    });
    return;
  }

  if (ctx.method === 'GET' && !first) {
    sendOk(ctx.res, await listMedia());
    return;
  }

  if (ctx.method === 'POST' && !first) {
    const input = parseOrThrow(RegisterAssetSchema, readBody(ctx.req));
    const asset = await registerAsset(input);
    await audit(ctx, 'MEDIA_UPLOAD', 'MediaAsset', asset.id, {
      originalName: input.originalName,
      mimeType: input.mimeType,
    });
    sendOk(ctx.res, asset);
    return;
  }

  if ((ctx.method === 'PUT' || ctx.method === 'PATCH') && first) {
    const input = parseOrThrow(MediaAssetUpdateSchema, readBody(ctx.req));
    const asset = await prisma.mediaAsset.update({
      where: { id: first },
      data: { altText: input.altText },
    });
    await audit(ctx, 'MEDIA_UPDATE', 'MediaAsset', first);
    sendOk(ctx.res, asset);
    return;
  }

  if (ctx.method === 'DELETE' && first) {
    await deleteAsset(first);
    await audit(ctx, 'MEDIA_DELETE', 'MediaAsset', first);
    sendOk(ctx.res, { deleted: true });
    return;
  }

  throw new HttpError('METHOD_NOT_ALLOWED', `${ctx.method} is not supported here.`);
}

// ---------------------------------------------------------------- inbox

const InboxStatusSchema = z.object({ status: z.enum(['UNREAD', 'READ', 'ARCHIVED']) });

async function handleInbox(ctx: Ctx) {
  const [, ...rest] = ctx.segments;
  const first = rest[0];

  if (ctx.method === 'GET' && !first) {
    const status = ctx.req.query.status;
    const filter = typeof status === 'string' && status !== 'ALL' ? { status: status as never } : {};
    sendOk(
      ctx.res,
      await prisma.contactMessage.findMany({
        where: filter,
        orderBy: { createdAt: 'desc' },
        take: 200,
      }),
    );
    return;
  }

  if ((ctx.method === 'PUT' || ctx.method === 'PATCH') && first) {
    const input = parseOrThrow(InboxStatusSchema, readBody(ctx.req));
    const now = new Date();
    const message = await prisma.contactMessage.update({
      where: { id: first },
      data: {
        status: input.status,
        readAt: input.status === 'UNREAD' ? null : now,
        archivedAt: input.status === 'ARCHIVED' ? now : null,
      },
    });
    await audit(ctx, 'INBOX_STATUS', 'ContactMessage', first, { status: input.status });
    sendOk(ctx.res, message);
    return;
  }

  if (ctx.method === 'DELETE' && first) {
    await prisma.contactMessage.delete({ where: { id: first } });
    await audit(ctx, 'INBOX_DELETE', 'ContactMessage', first);
    sendOk(ctx.res, { deleted: true });
    return;
  }

  throw new HttpError('METHOD_NOT_ALLOWED', `${ctx.method} is not supported here.`);
}

// ---------------------------------------------------------------- audit

async function handleAudit(ctx: Ctx) {
  requireMethod(ctx.req, ['GET']);
  const take = Math.min(Number(ctx.req.query.take ?? 100) || 100, 300);
  sendOk(
    ctx.res,
    await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take,
      include: { ownerUser: { select: { name: true, email: true } } },
    }),
  );
}

// ---------------------------------------------------------- publish all

async function handlePublishAll(ctx: Ctx) {
  requireMethod(ctx.req, ['POST']);

  let published = 0;

  for (const entity of Object.keys(ENTITIES) as EntityName[]) {
    const rows = await delegateFor(entity).findMany({ select: { id: true } });
    for (const row of rows) {
      await publishOne(entity, row.id as string);
      published += 1;
    }
  }

  const projects = await prisma.project.findMany({ select: { id: true } });
  for (const project of projects) {
    await publishProject(project.id);
    published += 1;
  }

  await audit(ctx, 'PUBLISH_ALL', 'Site', null, { published });
  sendOk(ctx.res, { published, publishedAt: new Date().toISOString() });
}

// --------------------------------------------------------------- router

export default withApi(async function handler(req: VercelRequest, res: VercelResponse) {
  // Password + verified TOTP required for every route below, no exceptions.
  const owner = await requireOwnerWithMfa(req);

  const segments = routeSegments(req);
  const ctx: Ctx = {
    req,
    res,
    owner,
    method: (req.method ?? 'GET').toUpperCase(),
    segments,
  };

  const head = segments[0] ?? '';

  switch (head) {
    case 'overview':
      return handleOverview(ctx);
    case 'projects':
      return handleProjects(ctx);
    case 'media':
      return handleMedia(ctx);
    case 'inbox':
      return handleInbox(ctx);
    case 'audit':
      return handleAudit(ctx);
    case 'publish-all':
      return handlePublishAll(ctx);
    default:
      if (isEntityName(head)) return handleEntity(ctx, head);
      throw new HttpError('NOT_FOUND', `Unknown admin resource "${head}".`);
  }
});
