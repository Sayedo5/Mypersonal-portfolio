import type { z } from 'zod';

import { prisma } from './prisma.js';
import { HttpError } from './http.js';
import { ProjectSchema } from './schemas.js';
import { stampPublished } from './registry.js';

export type ProjectInput = z.output<typeof ProjectSchema>;

/** Scalar columns copied into the published snapshot. */
export const PROJECT_SNAPSHOT_FIELDS = [
  'stableKey',
  'slug',
  'number',
  'title',
  'category',
  'summary',
  'description',
  'attribution',
  'problem',
  'contribution',
  'architecture',
  'liveUrl',
  'repositoryUrl',
  'featured',
  'seoTitle',
  'seoDescription',
  'visible',
  'sortOrder',
] as const;

const includeRelations = {
  technologies: { orderBy: { sortOrder: 'asc' as const }, include: { technology: true } },
  metrics: { orderBy: { sortOrder: 'asc' as const } },
  highlights: { orderBy: { sortOrder: 'asc' as const } },
  media: { orderBy: { sortOrder: 'asc' as const }, include: { mediaAsset: true } },
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/** Case-insensitive find-or-create so "Next.js" and "next.js" stay one row. */
async function resolveTechnologies(names: readonly string[]): Promise<string[]> {
  const ids: string[] = [];

  for (const rawName of names) {
    const name = rawName.trim();
    if (!name) continue;

    const existing = await prisma.technology.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
      select: { id: true },
    });

    if (existing) {
      ids.push(existing.id);
      continue;
    }

    const created = await prisma.technology.create({
      data: {
        name,
        stableKey: slugify(name) || `tech-${Date.now()}`,
        sortOrder: 0,
        status: 'PUBLISHED',
        publishedPayload: { stableKey: slugify(name), name, visible: true, sortOrder: 0 },
        publishedAt: new Date(),
      },
      select: { id: true },
    });
    ids.push(created.id);
  }

  return ids;
}

function scalarData(input: ProjectInput): Record<string, unknown> {
  return {
    stableKey: input.stableKey,
    slug: input.slug,
    number: input.number,
    title: input.title,
    category: input.category,
    summary: input.summary,
    description: input.description,
    attribution: input.attribution,
    problem: input.problem,
    contribution: input.contribution,
    architecture: input.architecture,
    liveUrl: input.liveUrl,
    repositoryUrl: input.repositoryUrl,
    featured: input.featured,
    seoTitle: input.seoTitle,
    seoDescription: input.seoDescription,
    visible: input.visible,
    sortOrder: input.sortOrder,
  };
}

/**
 * Metrics, highlights and technology links are small, fully-owned child
 * lists, so replacing them wholesale is simpler and safer than diffing —
 * and it keeps `sortOrder` exactly as the admin arranged it.
 */
async function replaceRelations(projectId: string, input: ProjectInput): Promise<void> {
  const technologyIds = await resolveTechnologies(input.technologies);

  await prisma.$transaction([
    prisma.projectTechnology.deleteMany({ where: { projectId } }),
    prisma.projectMetric.deleteMany({ where: { projectId } }),
    prisma.projectHighlight.deleteMany({ where: { projectId } }),
  ]);

  await prisma.$transaction([
    ...technologyIds.map((technologyId, index) =>
      prisma.projectTechnology.create({
        data: { projectId, technologyId, sortOrder: index },
      }),
    ),
    ...input.metrics.map((metric, index) =>
      prisma.projectMetric.create({
        data: {
          projectId,
          stableKey: `${input.stableKey}-metric-${index}`,
          label: metric.label,
          value: metric.value,
          sortOrder: index,
        },
      }),
    ),
    ...input.highlights.map((highlight, index) =>
      prisma.projectHighlight.create({
        data: {
          projectId,
          stableKey: `${input.stableKey}-highlight-${index}`,
          kind: highlight.kind,
          text: highlight.text,
          sortOrder: index,
        },
      }),
    ),
  ]);
}

function conflictOnSlug(error: unknown): boolean {
  const code = (error as { code?: string } | null)?.code;
  return code === 'P2002';
}

export async function listProjects() {
  return prisma.project.findMany({ orderBy: { sortOrder: 'asc' }, include: includeRelations });
}

export async function getProject(id: string) {
  const project = await prisma.project.findUnique({ where: { id }, include: includeRelations });
  if (!project) throw new HttpError('NOT_FOUND', 'That project no longer exists.');
  return project;
}

export async function createProject(input: ProjectInput) {
  try {
    const project = await prisma.project.create({ data: scalarData(input) as never });
    await replaceRelations(project.id, input);
    return getProject(project.id);
  } catch (error) {
    if (conflictOnSlug(error)) {
      throw new HttpError('CONFLICT', 'That slug or key is already in use.', {
        slug: ['Choose a different slug.'],
      });
    }
    throw error;
  }
}

export async function updateProject(id: string, input: ProjectInput) {
  try {
    await prisma.project.update({ where: { id }, data: scalarData(input) as never });
    await replaceRelations(id, input);
    return getProject(id);
  } catch (error) {
    if (conflictOnSlug(error)) {
      throw new HttpError('CONFLICT', 'That slug or key is already in use.', {
        slug: ['Choose a different slug.'],
      });
    }
    throw error;
  }
}

export async function deleteProject(id: string): Promise<void> {
  await prisma.project.delete({ where: { id } });
}

/** Copies the current scalar columns into `publishedPayload`. */
export async function publishProject(id: string) {
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) throw new HttpError('NOT_FOUND', 'That project no longer exists.');

  const snapshot: Record<string, unknown> = {};
  for (const field of PROJECT_SNAPSHOT_FIELDS) {
    snapshot[field] = (project as unknown as Record<string, unknown>)[field];
  }

  const updated = await prisma.project.update({
    where: { id },
    data: {
      publishedPayload: snapshot as never,
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
    select: { id: true, publishedAt: true },
  });

  await stampPublished('Project', id);
  return updated;
}

/** Turns a DB row (with relations) into the admin form's field shape. */
export function toAdminProject(row: Awaited<ReturnType<typeof getProject>>) {
  return {
    id: row.id,
    stableKey: row.stableKey,
    slug: row.slug,
    number: row.number,
    title: row.title,
    category: row.category,
    summary: row.summary,
    description: row.description,
    attribution: row.attribution,
    problem: row.problem,
    contribution: row.contribution,
    architecture: row.architecture,
    liveUrl: row.liveUrl,
    repositoryUrl: row.repositoryUrl,
    featured: row.featured,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    visible: row.visible,
    sortOrder: row.sortOrder,
    status: row.status,
    publishedAt: row.publishedAt,
    hasUnpublishedChanges: row.publishedAt === null || row.updatedAt > row.publishedAt,
    technologies: row.technologies.map((link) => link.technology.name),
    metrics: row.metrics.map((metric) => ({ label: metric.label, value: metric.value })),
    highlights: row.highlights.map((highlight) => ({
      kind: highlight.kind,
      text: highlight.text,
    })),
    media: row.media.map((item) => ({
      id: item.id,
      mediaAssetId: item.mediaAssetId,
      url: item.mediaAsset.publicUrl,
      altText: item.altText,
      caption: item.caption,
      displayRole: item.displayRole,
      sortOrder: item.sortOrder,
    })),
  };
}
