import React, { useEffect, useState } from 'react';

import { adminApi, type AdminRow } from '../api';
import type { FieldDef } from '../components/fields';
import CollectionEditor from '../components/CollectionEditor';
import SingletonEditor from '../components/SingletonEditor';

/**
 * Every content screen in the admin panel, expressed as field schemas.
 *
 * The set below is the reconciled union of the reference project's model
 * and this portfolio's own fields — nothing that renders on the site is
 * left un-editable.
 */

const KEY_FIELD: FieldDef = {
  name: 'stableKey',
  label: '// KEY',
  type: 'text',
  help: 'Lowercase id used in links and anchors. Changing it changes the #anchor.',
};

const VISIBLE_FIELD: FieldDef = {
  name: 'visible',
  label: 'Visible on the site',
  type: 'toggle',
};

// ------------------------------------------------------------- profile

const PROFILE_FIELDS: FieldDef[] = [
  { name: 'name', label: '// FULL NAME', type: 'text' },
  { name: 'firstName', label: '// FIRST NAME', type: 'text', help: 'Used for the script signature.' },
  { name: 'initials', label: '// INITIALS', type: 'text', help: 'The logo mark in the header.' },
  { name: 'professionalTitle', label: '// PROFESSIONAL TITLE', type: 'text' },
  {
    name: 'roleLine',
    label: '// ROLE LINE',
    type: 'text',
    full: true,
    help: 'Long-form role summary used in metadata.',
  },
  { name: 'location', label: '// LOCATION', type: 'text' },
  { name: 'email', label: '// EMAIL', type: 'email' },
  { name: 'phone', label: '// PHONE (DISPLAY)', type: 'text' },
  { name: 'phoneHref', label: '// PHONE (DIAL)', type: 'text', help: 'Digits only, e.g. +923039192964' },
  {
    name: 'shortSummary',
    label: '// SHORT SUMMARY',
    type: 'textarea',
    rows: 2,
    full: true,
    help: 'One-line version used for sharing cards.',
  },
  {
    name: 'longBiography',
    label: '// BIOGRAPHY',
    type: 'textarea',
    rows: 7,
    full: true,
    help: 'The main About paragraph.',
  },
  {
    name: 'workingPrinciples',
    label: '// ABOUT BULLET POINTS',
    type: 'list',
    multiline: true,
    full: true,
    help: 'The ✦ bullets under the About paragraph.',
  },
  { name: 'contactPitch', label: '// CONTACT PITCH', type: 'textarea', rows: 4, full: true },
  { name: 'statusCopy', label: '// STATUS COPY', type: 'text', full: true },
  VISIBLE_FIELD,
];

export const ProfilePage: React.FC = () => (
  <SingletonEditor
    entity="profile"
    title="Profile"
    description="Who you are. Drives the header, the About section, the contact details and the structured data."
    fields={PROFILE_FIELDS}
  />
);

// ---------------------------------------------------------------- hero

const HERO_FIELDS: FieldDef[] = [
  { name: 'headlineTop', label: '// HEADLINE — LINE 1', type: 'text', help: 'Rendered in the neutral gradient.' },
  { name: 'headlineBottom', label: '// HEADLINE — LINE 2', type: 'text', help: 'Rendered in the gold gradient.' },
  { name: 'showPill', label: 'Show the availability pill', type: 'toggle' },
  { name: 'availabilityPill', label: '// AVAILABILITY PILL TEXT', type: 'text' },
  { name: 'roleLinePart1', label: '// ROLE LINE — PART 1', type: 'text' },
  { name: 'roleLinePart2', label: '// ROLE LINE — PART 2', type: 'text' },
  { name: 'roleLinePart3', label: '// ROLE LINE — PART 3', type: 'text' },
  {
    name: 'description',
    label: '// HERO PARAGRAPH',
    type: 'textarea',
    rows: 4,
    full: true,
    help: 'Wrap a phrase in **double asterisks** to render it in the brighter emphasis style.',
  },
  { name: 'primaryCtaLabel', label: '// PRIMARY BUTTON LABEL', type: 'text' },
  { name: 'primaryCtaHref', label: '// PRIMARY BUTTON LINK', type: 'url' },
  { name: 'resumeCtaLabel', label: '// RESUME BUTTON LABEL', type: 'text' },
  { name: 'scrollCueLabel', label: '// SCROLL CUE', type: 'text' },
  { name: 'quoteLine1', label: '// SIDE QUOTE — LINE 1', type: 'text' },
  { name: 'quoteLine2', label: '// SIDE QUOTE — LINE 2', type: 'text' },
  {
    name: 'terminalLines',
    label: '// TERMINAL TYPEWRITER LINES',
    type: 'list',
    full: true,
    help: 'Cycled one after another in the $ prompt under the headline.',
  },
];

export const HeroPage: React.FC = () => (
  <SingletonEditor
    entity="hero"
    title="Hero"
    description="Everything above the fold: the headline, the typewriter line, the buttons and the side quote."
    fields={HERO_FIELDS}
  />
);

// ------------------------------------------------------ about & stats

const STAT_FIELDS: FieldDef[] = [
  KEY_FIELD,
  { name: 'value', label: '// VALUE', type: 'text', help: 'e.g. 133K' },
  { name: 'label', label: '// LABEL', type: 'text' },
  { name: 'gold', label: 'Highlight in gold', type: 'toggle' },
  VISIBLE_FIELD,
];

export const AboutPage: React.FC = () => (
  <CollectionEditor
    entity="stats"
    title="Headline stats"
    description="The four metrics under the About paragraph."
    fields={STAT_FIELDS}
    titleOf={(row) => `${row.value ?? ''} — ${row.label ?? ''}`}
    addLabel="Add stat"
  />
);

// -------------------------------------------- services & guarantees

const SERVICE_FIELDS: FieldDef[] = [
  KEY_FIELD,
  { name: 'number', label: '// NUMBER', type: 'text', help: 'e.g. 01' },
  { name: 'title', label: '// TITLE', type: 'text' },
  { name: 'description', label: '// DESCRIPTION', type: 'textarea', rows: 4, full: true },
  { name: 'points', label: '// BULLET POINTS', type: 'list', multiline: true, full: true },
  VISIBLE_FIELD,
];

const GUARANTEE_FIELDS: FieldDef[] = [
  KEY_FIELD,
  { name: 'title', label: '// TITLE', type: 'text' },
  { name: 'detail', label: '// DETAIL', type: 'textarea', rows: 3, full: true },
  VISIBLE_FIELD,
];

export const ServicesPage: React.FC = () => (
  <>
    <CollectionEditor
      entity="services"
      title="Services"
      description="The engagement models shown as cards in the Services section."
      fields={SERVICE_FIELDS}
      titleOf={(row) => `${row.number ?? ''} ${row.title ?? ''}`}
      addLabel="Add service"
    />
    <CollectionEditor
      entity="guarantees"
      title="Delivery guarantees"
      description='The "what you get, every time" strip below the service cards.'
      fields={GUARANTEE_FIELDS}
      titleOf={(row) => String(row.title ?? '')}
      addLabel="Add guarantee"
    />
  </>
);

// ------------------------------------------------------------ projects

const PROJECT_FIELDS: FieldDef[] = [
  KEY_FIELD,
  { name: 'slug', label: '// SLUG', type: 'text' },
  { name: 'number', label: '// NUMBER', type: 'text', help: 'e.g. 01' },
  { name: 'title', label: '// TITLE', type: 'text' },
  { name: 'category', label: '// CATEGORY', type: 'text', full: true },
  { name: 'description', label: '// DESCRIPTION', type: 'textarea', rows: 6, full: true },
  {
    name: 'technologies',
    label: '// TECH STACK',
    type: 'list',
    full: true,
    help: 'Rendered as the chip row. Unknown names are added to the technology list automatically.',
  },
  {
    name: 'metrics',
    label: '// PROJECT METRICS',
    type: 'pairs',
    full: true,
    help: 'The label/value rail on the right of the card.',
  },
  { name: 'liveUrl', label: '// LIVE URL', type: 'url' },
  { name: 'repositoryUrl', label: '// REPOSITORY URL', type: 'url' },
  { name: 'featured', label: 'Featured project', type: 'toggle' },
  VISIBLE_FIELD,
  {
    name: 'summary',
    label: '// SUMMARY (OPTIONAL)',
    type: 'textarea',
    rows: 2,
    full: true,
    help: 'Short version for listings and sharing cards.',
  },
  { name: 'attribution', label: '// ATTRIBUTION', type: 'text', full: true },
  { name: 'problem', label: '// PROBLEM', type: 'textarea', rows: 4, full: true },
  { name: 'contribution', label: '// CONTRIBUTION', type: 'textarea', rows: 4, full: true },
  { name: 'architecture', label: '// ARCHITECTURE', type: 'textarea', rows: 4, full: true },
  {
    name: 'highlights',
    label: '// HIGHLIGHTS',
    type: 'highlights',
    full: true,
    help: 'Optional bullets under the description. Leave empty to keep the card as it is today.',
  },
  { name: 'seoTitle', label: '// SEO TITLE', type: 'text' },
  { name: 'seoDescription', label: '// SEO DESCRIPTION', type: 'textarea', rows: 2 },
];

export const ProjectsPage: React.FC = () => (
  <CollectionEditor
    entity="projects"
    title="Projects"
    description="Featured work. The first six fields drive the card exactly as it renders today; the rest are optional case-study detail."
    fields={PROJECT_FIELDS}
    titleOf={(row) => `${row.number ?? ''} ${row.title ?? ''}`}
    subtitleOf={(row) => String(row.category ?? '')}
    addLabel="Add project"
  />
);

// -------------------------------------------------------------- skills

const CATEGORY_FIELDS: FieldDef[] = [
  KEY_FIELD,
  { name: 'title', label: '// TITLE', type: 'text' },
  { name: 'badge', label: '// BADGE', type: 'text', help: 'e.g. CORE PILLAR' },
  { name: 'stat', label: '// STAT CHIP', type: 'text', help: 'e.g. 90+ LIGHTHOUSE' },
  {
    name: 'colSpan',
    label: '// CARD WIDTH',
    type: 'select',
    // These literal class names are also what keeps Tailwind emitting them.
    // The value itself lives in the database, which the Tailwind scanner
    // cannot see — so if you remove an option here, cards already set to
    // that width lose their column span. Add, don't replace.
    options: [
      { value: 'lg:col-span-4', label: 'One third' },
      { value: 'lg:col-span-5', label: 'Narrow (5/12)' },
      { value: 'lg:col-span-6', label: 'Half' },
      { value: 'lg:col-span-7', label: 'Wide (7/12)' },
      { value: 'lg:col-span-8', label: 'Two thirds' },
      { value: 'lg:col-span-12', label: 'Full width' },
    ],
  },
  { name: 'description', label: '// DESCRIPTION', type: 'textarea', rows: 4, full: true },
  VISIBLE_FIELD,
];

export const SkillsPage: React.FC = () => {
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    let cancelled = false;
    adminApi
      .list<AdminRow>('skill-categories')
      .then((rows) => {
        if (cancelled) return;
        setCategories(
          rows.map((row) => ({ value: row.id, label: String(row.title ?? row.stableKey) })),
        );
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const skillFields: FieldDef[] = [
    KEY_FIELD,
    { name: 'name', label: '// SKILL', type: 'text' },
    {
      name: 'categoryId',
      label: '// CATEGORY',
      type: 'select',
      options: categories,
      help: 'Which card this chip appears in.',
    },
    {
      name: 'emphasis',
      label: '// EMPHASIS',
      type: 'select',
      options: [
        { value: 'CORE', label: 'Core' },
        { value: 'STRONG', label: 'Strong' },
        { value: 'SUPPORTING', label: 'Supporting' },
      ],
    },
    VISIBLE_FIELD,
  ];

  return (
    <>
      <CollectionEditor
        entity="skill-categories"
        title="Skill cards"
        description="The bento grid in the Tech Matrix section."
        fields={CATEGORY_FIELDS}
        titleOf={(row) => String(row.title ?? '')}
        subtitleOf={(row) => String(row.badge ?? '')}
        addLabel="Add card"
      />
      <CollectionEditor
        entity="skills"
        title="Skill chips"
        description="Individual technologies. Each one belongs to a card above."
        fields={skillFields}
        titleOf={(row) => String(row.name ?? '')}
        subtitleOf={(row) =>
          categories.find((category) => category.value === row.categoryId)?.label ?? ''
        }
        addLabel="Add skill"
      />
    </>
  );
};

// -------------------------------------------------------------- career

const JOURNEY_FIELDS: FieldDef[] = [
  KEY_FIELD,
  {
    name: 'kind',
    label: '// TYPE',
    type: 'select',
    options: [
      { value: 'EXPERIENCE', label: 'Experience' },
      { value: 'EDUCATION', label: 'Education' },
    ],
  },
  {
    name: 'yearLabel',
    label: '// DATE LABEL',
    type: 'text',
    help: 'Shown in the timeline gutter, e.g. "FEB 2026 — PRESENT".',
  },
  { name: 'title', label: '// ROLE / QUALIFICATION', type: 'text', full: true },
  { name: 'organization', label: '// EMPLOYER / INSTITUTION', type: 'text', full: true },
  { name: 'location', label: '// LOCATION', type: 'text' },
  { name: 'current', label: 'Current position', type: 'toggle' },
  { name: 'startDate', label: '// START DATE', type: 'text', help: 'YYYY-MM-DD, optional.' },
  { name: 'endDate', label: '// END DATE', type: 'text', help: 'YYYY-MM-DD, optional.' },
  { name: 'description', label: '// DESCRIPTION', type: 'textarea', rows: 6, full: true },
  {
    name: 'achievements',
    label: '// ACHIEVEMENTS',
    type: 'list',
    multiline: true,
    full: true,
    help: 'Optional bullets. Leave empty to keep the timeline as it is today.',
  },
  VISIBLE_FIELD,
];

export const CareerPage: React.FC = () => (
  <CollectionEditor
    entity="journey"
    title="Experience & education"
    description="One timeline, newest first. Set the type to Education for degrees and certifications."
    fields={JOURNEY_FIELDS}
    titleOf={(row) => String(row.title ?? '')}
    subtitleOf={(row) => `${row.organization ?? ''} · ${row.yearLabel ?? ''}`}
    addLabel="Add entry"
  />
);

// ------------------------------------------------------- contact links

const SOCIAL_FIELDS: FieldDef[] = [
  KEY_FIELD,
  { name: 'platform', label: '// PLATFORM', type: 'text', help: 'e.g. GitHub, Email, Phone' },
  { name: 'label', label: '// LABEL', type: 'text', help: 'Small caps label, e.g. GITHUB' },
  { name: 'value', label: '// DISPLAYED VALUE', type: 'text', full: true },
  { name: 'url', label: '// LINK', type: 'url', full: true, help: 'https://…, mailto:… or tel:…' },
  { name: 'external', label: 'Open in a new tab', type: 'toggle' },
  VISIBLE_FIELD,
];

export const ContactLinksPage: React.FC = () => (
  <CollectionEditor
    entity="social-links"
    title="Contact channels"
    description="The list beside the contact form. Add as many as you like — GitHub, LinkedIn, X, a calendar link."
    fields={SOCIAL_FIELDS}
    titleOf={(row) => `${row.label ?? ''} — ${row.value ?? ''}`}
    addLabel="Add channel"
  />
);

// ------------------------------------------------------------ structure

const SECTION_FIELDS: FieldDef[] = [
  KEY_FIELD,
  { name: 'eyebrow', label: '// EYEBROW', type: 'text', help: 'e.g. 01 / ABOUT ME' },
  { name: 'titleTop', label: '// HEADLINE — LINE 1', type: 'text' },
  { name: 'titleBottom', label: '// HEADLINE — LINE 2', type: 'text' },
  { name: 'lede', label: '// SUPPORTING PARAGRAPH', type: 'textarea', rows: 3, full: true },
  { name: 'ledeAside', label: 'Place the paragraph beside the headline', type: 'toggle' },
  VISIBLE_FIELD,
];

export const SectionsPage: React.FC = () => (
  <CollectionEditor
    entity="sections"
    title="Section headings"
    description="The eyebrow and two-line headline at the top of every section. The key must match the section's anchor (about, services, work, skills, experience, contact)."
    fields={SECTION_FIELDS}
    titleOf={(row) => `${row.titleTop ?? ''} ${row.titleBottom ?? ''}`}
    subtitleOf={(row) => String(row.eyebrow ?? '')}
    addLabel="Add section"
  />
);

const NAV_FIELDS: FieldDef[] = [
  KEY_FIELD,
  { name: 'label', label: '// LABEL', type: 'text' },
  {
    name: 'targetSectionKey',
    label: '// SECTION KEY',
    type: 'text',
    help: 'Scrolls to #key. Leave blank if you set an external URL.',
  },
  {
    name: 'externalUrl',
    label: '// EXTERNAL URL',
    type: 'url',
    full: true,
    help: 'Takes priority over the section key.',
  },
  VISIBLE_FIELD,
];

export const NavigationPage: React.FC = () => (
  <CollectionEditor
    entity="navigation"
    title="Navigation"
    description="The header menu, on desktop and in the mobile panel."
    fields={NAV_FIELDS}
    titleOf={(row) => String(row.label ?? '')}
    subtitleOf={(row) => String(row.externalUrl ?? `#${row.targetSectionKey ?? ''}`)}
    addLabel="Add link"
  />
);

// --------------------------------------------------------- appearance

const THEME_FIELDS: FieldDef[] = [
  {
    name: 'defaultMode',
    label: '// DEFAULT THEME',
    type: 'select',
    options: [
      { value: 'DARK', label: 'Dark' },
      { value: 'LIGHT', label: 'Light' },
      { value: 'SYSTEM', label: "Follow the visitor's system" },
    ],
  },
  { name: 'allowToggle', label: 'Let visitors switch theme', type: 'toggle' },
  { name: 'accentGold', label: '// GOLD ACCENT', type: 'color' },
  { name: 'accentBronze', label: '// BRONZE ACCENT', type: 'color' },
  {
    name: 'portraitMediaAssetId',
    label: '// ABOUT PORTRAIT',
    type: 'media',
    mediaKind: 'IMAGE',
    help: 'Falls back to the bundled about.jpg when empty.',
  },
  {
    name: 'watermarkMediaAssetId',
    label: '// WATERMARK EMBLEM',
    type: 'media',
    mediaKind: 'IMAGE',
  },
  {
    name: 'heroVideoMediaAssetId',
    label: '// HERO BACKGROUND VIDEO',
    type: 'media',
    mediaKind: 'VIDEO',
    help: 'Falls back to /videos/hero.mp4 when empty.',
  },
  { name: 'logoMediaAssetId', label: '// LOGO', type: 'media', mediaKind: 'IMAGE' },
  { name: 'faviconMediaAssetId', label: '// FAVICON', type: 'media', mediaKind: 'IMAGE' },
  {
    name: 'socialMediaAssetId',
    label: '// SOCIAL SHARE IMAGE',
    type: 'media',
    mediaKind: 'IMAGE',
  },
];

export const AppearancePage: React.FC = () => (
  <SingletonEditor
    entity="theme"
    title="Appearance"
    description="Theme defaults and the images the site uses. Anything left empty keeps the bundled asset, so the design never breaks."
    fields={THEME_FIELDS}
  />
);

// ----------------------------------------------------------------- seo

const SITE_FIELDS: FieldDef[] = [
  { name: 'siteName', label: '// SITE NAME', type: 'text' },
  { name: 'canonicalUrl', label: '// CANONICAL URL', type: 'url' },
  { name: 'defaultSeoTitle', label: '// PAGE TITLE', type: 'text', full: true },
  { name: 'defaultSeoDescription', label: '// META DESCRIPTION', type: 'textarea', rows: 3, full: true },
  { name: 'defaultSeoKeywords', label: '// KEYWORDS', type: 'list', full: true },
  { name: 'ogImageUrl', label: '// SHARE IMAGE URL', type: 'url', full: true },
  { name: 'allowIndexing', label: 'Allow search engines to index the site', type: 'toggle' },
  { name: 'availableForWork', label: 'Show the "available for work" pill', type: 'toggle' },
  { name: 'availabilityText', label: '// AVAILABILITY TEXT', type: 'text', full: true },
  { name: 'contactCtaLabel', label: '// HEADER BUTTON LABEL', type: 'text' },
  { name: 'contactCtaHref', label: '// HEADER BUTTON LINK', type: 'url' },
  {
    name: 'resumeMediaAssetId',
    label: '// RESUME FILE',
    type: 'media',
    mediaKind: 'DOCUMENT',
    help: 'Upload a PDF in Media, then pick it here.',
  },
  {
    name: 'resumeUrl',
    label: '// RESUME URL (FALLBACK)',
    type: 'url',
    help: 'Used when no file is selected above.',
  },
  { name: 'footerCreditLine', label: '// FOOTER CREDIT LINE', type: 'text', full: true },
  {
    name: 'structuredData',
    label: '// SCHEMA.ORG JSON-LD',
    type: 'json',
    rows: 14,
    full: true,
    help: 'Structured data for search engines. Must be valid JSON.',
  },
];

export const SeoPage: React.FC = () => (
  <SingletonEditor
    entity="site"
    title="SEO & site settings"
    description="Title, description, sharing image, indexing and the structured data search engines read."
    fields={SITE_FIELDS}
  />
);
