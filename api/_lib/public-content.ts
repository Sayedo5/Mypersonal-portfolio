import type {
  GuaranteeContent,
  JourneyContent,
  NavigationContent,
  PortfolioContent,
  ProjectContent,
  SectionContent,
  ServiceContent,
  SkillBlockContent,
  SocialLinkContent,
  StatContent,
} from '../../src/data/content-types.js';

import { prisma } from './prisma.js';

type Row = Record<string, unknown>;

/**
 * Published reads take the frozen `publishedPayload` snapshot; preview reads
 * take the live draft columns. Everything below is written against that one
 * decision so the two modes cannot diverge.
 */
function view(row: Row | null, preview: boolean): Row | null {
  if (!row) return null;
  if (preview) return row;
  const published = row.publishedPayload;
  return published && typeof published === 'object' ? (published as Row) : null;
}

function viewList(rows: Row[], preview: boolean): Row[] {
  const output: Row[] = [];
  for (const row of rows) {
    const snapshot = view(row, preview);
    if (!snapshot || snapshot.visible === false) continue;
    // Carry the real row id through; relations are keyed off it.
    output.push({ ...snapshot, id: row.id });
  }
  return output;
}

const str = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : fallback;
const nullableStr = (value: unknown): string | null =>
  typeof value === 'string' && value ? value : null;
const bool = (value: unknown, fallback = false): boolean =>
  typeof value === 'boolean' ? value : fallback;
const list = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];

/** Resolves a MediaAsset id to its public URL, with a static-path fallback. */
function mediaUrl(
  assets: Map<string, string>,
  id: unknown,
  fallback: string | null = null,
): string | null {
  if (typeof id !== 'string' || !id) return fallback;
  return assets.get(id) ?? fallback;
}

export async function readPortfolioContent(preview = false): Promise<PortfolioContent> {
  const [
    siteRow,
    themeRow,
    profileRow,
    heroRow,
    sectionRows,
    navRows,
    socialRows,
    statRows,
    serviceRows,
    guaranteeRows,
    journeyRows,
    categoryRows,
    skillRows,
    projectRows,
    mediaRows,
  ] = await Promise.all([
    prisma.siteSettings.findUnique({ where: { stableKey: 'site' } }),
    prisma.themeSettings.findUnique({ where: { stableKey: 'theme' } }),
    prisma.profile.findUnique({ where: { stableKey: 'profile' } }),
    prisma.heroSettings.findUnique({ where: { stableKey: 'hero' } }),
    prisma.contentSection.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.navigationItem.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.socialLink.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.stat.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.service.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.guarantee.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.journeyEntry.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.skillCategory.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.skill.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.project.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        technologies: { orderBy: { sortOrder: 'asc' }, include: { technology: true } },
        metrics: { orderBy: { sortOrder: 'asc' } },
        highlights: { orderBy: { sortOrder: 'asc' } },
        media: { orderBy: { sortOrder: 'asc' }, include: { mediaAsset: true } },
      },
    }),
    prisma.mediaAsset.findMany({ select: { id: true, publicUrl: true } }),
  ]);

  const assets = new Map(mediaRows.map((asset) => [asset.id, asset.publicUrl]));

  const site = (view(siteRow as Row | null, preview) ?? {}) as Row;
  const theme = (view(themeRow as Row | null, preview) ?? {}) as Row;
  const profile = (view(profileRow as Row | null, preview) ?? {}) as Row;
  const hero = (view(heroRow as Row | null, preview) ?? {}) as Row;

  const sectionList = viewList(sectionRows as Row[], preview);
  const sections: Record<string, SectionContent> = {};
  for (const row of sectionList) {
    const key = str(row.stableKey);
    if (!key) continue;
    sections[key] = {
      stableKey: key,
      eyebrow: str(row.eyebrow),
      titleTop: str(row.titleTop),
      titleBottom: str(row.titleBottom),
      lede: nullableStr(row.lede),
      ledeAside: bool(row.ledeAside),
    };
  }

  const navigation: NavigationContent[] = viewList(navRows as Row[], preview).map((row) => ({
    label: str(row.label),
    href: nullableStr(row.externalUrl) ?? `#${str(row.targetSectionKey)}`,
  }));

  const socialLinks: SocialLinkContent[] = viewList(socialRows as Row[], preview).map((row) => ({
    platform: str(row.platform),
    label: str(row.label),
    value: str(row.value),
    url: str(row.url),
    external: bool(row.external, true),
  }));

  const stats: StatContent[] = viewList(statRows as Row[], preview).map((row) => ({
    value: str(row.value),
    label: str(row.label),
    gold: bool(row.gold),
  }));

  const services: ServiceContent[] = viewList(serviceRows as Row[], preview).map((row) => ({
    id: str(row.stableKey),
    number: str(row.number),
    title: str(row.title),
    description: str(row.description),
    points: list(row.points),
  }));

  const guarantees: GuaranteeContent[] = viewList(guaranteeRows as Row[], preview).map((row) => ({
    title: str(row.title),
    detail: str(row.detail),
  }));

  const journey: JourneyContent[] = viewList(journeyRows as Row[], preview).map((row, index) => ({
    id: str(row.stableKey, String(index + 1)),
    kind: row.kind === 'EDUCATION' ? 'EDUCATION' : 'EXPERIENCE',
    year: str(row.yearLabel),
    title: str(row.title),
    organization: str(row.organization),
    location: nullableStr(row.location),
    description: str(row.description),
    achievements: list(row.achievements),
    current: bool(row.current),
  }));

  // Skills hang off their category, so both must survive the publish filter.
  const visibleSkills = viewList(skillRows as Row[], preview);
  const skillsByCategory = new Map<string, string[]>();
  for (const skill of visibleSkills) {
    const categoryId = str(skill.categoryId);
    if (!categoryId) continue;
    const bucket = skillsByCategory.get(categoryId) ?? [];
    bucket.push(str(skill.name));
    skillsByCategory.set(categoryId, bucket);
  }

  const skillBlocks: SkillBlockContent[] = viewList(categoryRows as Row[], preview).map((row) => ({
    title: str(row.title),
    badge: str(row.badge),
    stat: str(row.stat),
    description: str(row.description),
    colSpan: str(row.colSpan, 'lg:col-span-6'),
    items: skillsByCategory.get(str(row.id)) ?? [],
  }));

  // Project relations live in their own tables, so the snapshot only covers
  // scalar columns; relations are always read live and filtered by `visible`.
  const projects: ProjectContent[] = (projectRows as unknown as Row[])
    .map((row) => {
      const snapshot = view(row, preview);
      if (!snapshot || snapshot.visible === false) return null;

      const relations = row as unknown as {
        technologies: { technology: { name: string; visible: boolean } }[];
        metrics: { label: string; value: string; visible: boolean }[];
        highlights: { kind: string; text: string; visible: boolean }[];
        media: {
          altText: string;
          caption: string | null;
          displayRole: string;
          visible: boolean;
          mediaAsset: { publicUrl: string };
        }[];
      };

      return {
        slug: str(snapshot.slug),
        number: str(snapshot.number),
        title: str(snapshot.title),
        category: str(snapshot.category),
        summary: nullableStr(snapshot.summary),
        description: str(snapshot.description),
        attribution: nullableStr(snapshot.attribution),
        problem: nullableStr(snapshot.problem),
        contribution: nullableStr(snapshot.contribution),
        architecture: nullableStr(snapshot.architecture),
        tech: relations.technologies
          .filter((link) => link.technology.visible !== false)
          .map((link) => link.technology.name),
        metrics: relations.metrics
          .filter((metric) => metric.visible !== false)
          .map((metric) => ({ label: metric.label, value: metric.value })),
        highlights: relations.highlights
          .filter((highlight) => highlight.visible !== false)
          .map((highlight) => ({
            kind: highlight.kind === 'OUTCOME' ? ('OUTCOME' as const) : ('CAPABILITY' as const),
            text: highlight.text,
          })),
        images: relations.media
          .filter((item) => item.visible !== false)
          .map((item) => ({
            url: item.mediaAsset.publicUrl,
            altText: item.altText,
            caption: item.caption,
            displayRole: item.displayRole,
          })),
        liveUrl: nullableStr(snapshot.liveUrl),
        githubUrl: nullableStr(snapshot.repositoryUrl),
        featured: bool(snapshot.featured),
      } satisfies ProjectContent;
    })
    .filter((project): project is ProjectContent => project !== null);

  return {
    site: {
      siteName: str(site.siteName),
      canonicalUrl: str(site.canonicalUrl),
      defaultSeoTitle: str(site.defaultSeoTitle),
      defaultSeoDescription: str(site.defaultSeoDescription),
      defaultSeoKeywords: list(site.defaultSeoKeywords),
      ogImageUrl: nullableStr(site.ogImageUrl),
      allowIndexing: bool(site.allowIndexing, true),
      availableForWork: bool(site.availableForWork, true),
      availabilityText: nullableStr(site.availabilityText),
      contactCtaLabel: str(site.contactCtaLabel, 'Hire me'),
      contactCtaHref: str(site.contactCtaHref, '#contact'),
      resumeUrl: mediaUrl(assets, site.resumeMediaAssetId, nullableStr(site.resumeUrl)),
      footerCreditLine: nullableStr(site.footerCreditLine),
      structuredData:
        site.structuredData && typeof site.structuredData === 'object'
          ? (site.structuredData as Record<string, unknown>)
          : null,
    },
    theme: {
      defaultMode:
        theme.defaultMode === 'LIGHT' || theme.defaultMode === 'SYSTEM'
          ? theme.defaultMode
          : 'DARK',
      allowToggle: bool(theme.allowToggle, true),
      accentGold: str(theme.accentGold, '#D4AF37'),
      accentBronze: str(theme.accentBronze, '#8C6E2F'),
      logoUrl: mediaUrl(assets, theme.logoMediaAssetId),
      faviconUrl: mediaUrl(assets, theme.faviconMediaAssetId),
      portraitUrl: mediaUrl(assets, theme.portraitMediaAssetId),
      watermarkUrl: mediaUrl(assets, theme.watermarkMediaAssetId),
      heroVideoUrl: mediaUrl(assets, theme.heroVideoMediaAssetId),
      socialUrl: mediaUrl(assets, theme.socialMediaAssetId),
    },
    profile: {
      name: str(profile.name),
      firstName: str(profile.firstName),
      initials: str(profile.initials),
      professionalTitle: str(profile.professionalTitle),
      roleLine: str(profile.roleLine),
      location: str(profile.location),
      email: str(profile.email),
      phone: nullableStr(profile.phone),
      phoneHref: nullableStr(profile.phoneHref),
      shortSummary: nullableStr(profile.shortSummary),
      longBiography: str(profile.longBiography),
      workingPrinciples: list(profile.workingPrinciples),
      contactPitch: str(profile.contactPitch),
      statusCopy: nullableStr(profile.statusCopy),
    },
    hero: {
      headlineTop: str(hero.headlineTop),
      headlineBottom: str(hero.headlineBottom),
      availabilityPill: str(hero.availabilityPill),
      showPill: bool(hero.showPill, true),
      roleLinePart1: str(hero.roleLinePart1),
      roleLinePart2: str(hero.roleLinePart2),
      roleLinePart3: str(hero.roleLinePart3),
      description: str(hero.description),
      primaryCtaLabel: str(hero.primaryCtaLabel, 'Explore my work'),
      primaryCtaHref: str(hero.primaryCtaHref, '#work'),
      resumeCtaLabel: str(hero.resumeCtaLabel, 'Download resume'),
      quoteLine1: str(hero.quoteLine1),
      quoteLine2: str(hero.quoteLine2),
      scrollCueLabel: str(hero.scrollCueLabel, 'SCROLL'),
      terminalLines: list(hero.terminalLines),
    },
    sections,
    navigation,
    socialLinks,
    stats,
    services,
    guarantees,
    projects,
    skillBlocks,
    journey,
  };
}
