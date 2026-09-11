-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "PublishStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "ContactStatus" AS ENUM ('UNREAD', 'READ', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MediaKind" AS ENUM ('IMAGE', 'DOCUMENT', 'VIDEO');

-- CreateEnum
CREATE TYPE "StorageProvider" AS ENUM ('LOCAL', 'VERCEL_BLOB', 'STATIC');

-- CreateEnum
CREATE TYPE "ThemeMode" AS ENUM ('SYSTEM', 'LIGHT', 'DARK');

-- CreateEnum
CREATE TYPE "SkillEmphasis" AS ENUM ('CORE', 'STRONG', 'SUPPORTING');

-- CreateEnum
CREATE TYPE "EntryKind" AS ENUM ('CAPABILITY', 'OUTCOME');

-- CreateEnum
CREATE TYPE "JourneyKind" AS ENUM ('EXPERIENCE', 'EDUCATION');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'OWNER',
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mfaPassed" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TwoFactor" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "backupCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "failedVerificationCount" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TwoFactor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateLimit" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "windowStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL,
    "stableKey" TEXT NOT NULL DEFAULT 'site',
    "siteName" TEXT NOT NULL,
    "canonicalUrl" TEXT NOT NULL,
    "defaultSeoTitle" TEXT NOT NULL,
    "defaultSeoDescription" TEXT NOT NULL,
    "defaultSeoKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "ogImageUrl" TEXT,
    "allowIndexing" BOOLEAN NOT NULL DEFAULT true,
    "availableForWork" BOOLEAN NOT NULL DEFAULT true,
    "availabilityText" TEXT,
    "contactCtaLabel" TEXT NOT NULL DEFAULT 'Hire me',
    "contactCtaHref" TEXT NOT NULL DEFAULT '#contact',
    "resumeMediaAssetId" TEXT,
    "resumeUrl" TEXT,
    "footerCreditLine" TEXT,
    "structuredData" JSONB,
    "publishedPayload" JSONB,
    "publishedRevision" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "seedVersion" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThemeSettings" (
    "id" TEXT NOT NULL,
    "stableKey" TEXT NOT NULL DEFAULT 'theme',
    "defaultMode" "ThemeMode" NOT NULL DEFAULT 'DARK',
    "allowToggle" BOOLEAN NOT NULL DEFAULT true,
    "accentGold" TEXT NOT NULL DEFAULT '#D4AF37',
    "accentBronze" TEXT NOT NULL DEFAULT '#8C6E2F',
    "logoMediaAssetId" TEXT,
    "faviconMediaAssetId" TEXT,
    "portraitMediaAssetId" TEXT,
    "watermarkMediaAssetId" TEXT,
    "heroVideoMediaAssetId" TEXT,
    "socialMediaAssetId" TEXT,
    "publishedPayload" JSONB,
    "publishedAt" TIMESTAMP(3),
    "seedVersion" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ThemeSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "stableKey" TEXT NOT NULL DEFAULT 'profile',
    "name" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "initials" TEXT NOT NULL,
    "professionalTitle" TEXT NOT NULL,
    "roleLine" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "phoneHref" TEXT,
    "shortSummary" TEXT,
    "longBiography" TEXT NOT NULL,
    "workingPrinciples" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "contactPitch" TEXT NOT NULL,
    "statusCopy" TEXT,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedPayload" JSONB,
    "publishedAt" TIMESTAMP(3),
    "seedVersion" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeroSettings" (
    "id" TEXT NOT NULL,
    "stableKey" TEXT NOT NULL DEFAULT 'hero',
    "headlineTop" TEXT NOT NULL,
    "headlineBottom" TEXT NOT NULL,
    "availabilityPill" TEXT NOT NULL,
    "showPill" BOOLEAN NOT NULL DEFAULT true,
    "roleLinePart1" TEXT NOT NULL,
    "roleLinePart2" TEXT NOT NULL,
    "roleLinePart3" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "primaryCtaLabel" TEXT NOT NULL DEFAULT 'Explore my work',
    "primaryCtaHref" TEXT NOT NULL DEFAULT '#work',
    "resumeCtaLabel" TEXT NOT NULL DEFAULT 'Download resume',
    "quoteLine1" TEXT NOT NULL,
    "quoteLine2" TEXT NOT NULL,
    "scrollCueLabel" TEXT NOT NULL DEFAULT 'SCROLL',
    "terminalLines" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "publishedPayload" JSONB,
    "publishedAt" TIMESTAMP(3),
    "seedVersion" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeroSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NavigationItem" (
    "id" TEXT NOT NULL,
    "stableKey" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "targetSectionKey" TEXT,
    "externalUrl" TEXT,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL,
    "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedPayload" JSONB,
    "publishedAt" TIMESTAMP(3),
    "seedVersion" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NavigationItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentSection" (
    "id" TEXT NOT NULL,
    "stableKey" TEXT NOT NULL,
    "eyebrow" TEXT NOT NULL,
    "titleTop" TEXT NOT NULL,
    "titleBottom" TEXT NOT NULL,
    "lede" TEXT,
    "ledeAside" BOOLEAN NOT NULL DEFAULT false,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL,
    "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedPayload" JSONB,
    "publishedAt" TIMESTAMP(3),
    "seedVersion" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialLink" (
    "id" TEXT NOT NULL,
    "stableKey" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "external" BOOLEAN NOT NULL DEFAULT true,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL,
    "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedPayload" JSONB,
    "publishedAt" TIMESTAMP(3),
    "seedVersion" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stat" (
    "id" TEXT NOT NULL,
    "stableKey" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "gold" BOOLEAN NOT NULL DEFAULT false,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL,
    "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedPayload" JSONB,
    "publishedAt" TIMESTAMP(3),
    "seedVersion" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "stableKey" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "points" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL,
    "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedPayload" JSONB,
    "publishedAt" TIMESTAMP(3),
    "seedVersion" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guarantee" (
    "id" TEXT NOT NULL,
    "stableKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL,
    "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedPayload" JSONB,
    "publishedAt" TIMESTAMP(3),
    "seedVersion" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Guarantee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JourneyEntry" (
    "id" TEXT NOT NULL,
    "stableKey" TEXT NOT NULL,
    "kind" "JourneyKind" NOT NULL DEFAULT 'EXPERIENCE',
    "yearLabel" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "location" TEXT,
    "startDate" DATE,
    "endDate" DATE,
    "current" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT NOT NULL,
    "achievements" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL,
    "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedPayload" JSONB,
    "publishedAt" TIMESTAMP(3),
    "seedVersion" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JourneyEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillCategory" (
    "id" TEXT NOT NULL,
    "stableKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "badge" TEXT NOT NULL,
    "stat" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "colSpan" TEXT NOT NULL DEFAULT 'lg:col-span-6',
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL,
    "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedPayload" JSONB,
    "publishedAt" TIMESTAMP(3),
    "seedVersion" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SkillCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "stableKey" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "emphasis" "SkillEmphasis" NOT NULL DEFAULT 'SUPPORTING',
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL,
    "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedPayload" JSONB,
    "publishedAt" TIMESTAMP(3),
    "seedVersion" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "stableKey" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "summary" TEXT,
    "description" TEXT NOT NULL,
    "attribution" TEXT,
    "problem" TEXT,
    "contribution" TEXT,
    "architecture" TEXT,
    "liveUrl" TEXT,
    "repositoryUrl" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL,
    "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedPayload" JSONB,
    "publishedAt" TIMESTAMP(3),
    "seedVersion" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Technology" (
    "id" TEXT NOT NULL,
    "stableKey" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedPayload" JSONB,
    "publishedAt" TIMESTAMP(3),
    "seedVersion" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Technology_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectTechnology" (
    "projectId" TEXT NOT NULL,
    "technologyId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectTechnology_pkey" PRIMARY KEY ("projectId","technologyId")
);

-- CreateTable
CREATE TABLE "ProjectMetric" (
    "id" TEXT NOT NULL,
    "stableKey" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectHighlight" (
    "id" TEXT NOT NULL,
    "stableKey" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "kind" "EntryKind" NOT NULL DEFAULT 'CAPABILITY',
    "text" TEXT NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectHighlight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectMedia" (
    "id" TEXT NOT NULL,
    "stableKey" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "mediaAssetId" TEXT NOT NULL,
    "displayRole" TEXT NOT NULL DEFAULT 'GALLERY',
    "caption" TEXT,
    "altText" TEXT NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL,
    "kind" "MediaKind" NOT NULL,
    "storageProvider" "StorageProvider" NOT NULL,
    "storageKey" TEXT NOT NULL,
    "publicUrl" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "byteSize" BIGINT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "altText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "company" TEXT,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "status" "ContactStatus" NOT NULL DEFAULT 'UNREAD',
    "requestMetadata" JSONB,
    "readAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "ownerUserId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "TwoFactor_userId_key" ON "TwoFactor"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RateLimit_key_key" ON "RateLimit"("key");

-- CreateIndex
CREATE INDEX "RateLimit_windowStart_idx" ON "RateLimit"("windowStart");

-- CreateIndex
CREATE UNIQUE INDEX "SiteSettings_stableKey_key" ON "SiteSettings"("stableKey");

-- CreateIndex
CREATE UNIQUE INDEX "ThemeSettings_stableKey_key" ON "ThemeSettings"("stableKey");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_stableKey_key" ON "Profile"("stableKey");

-- CreateIndex
CREATE UNIQUE INDEX "HeroSettings_stableKey_key" ON "HeroSettings"("stableKey");

-- CreateIndex
CREATE UNIQUE INDEX "NavigationItem_stableKey_key" ON "NavigationItem"("stableKey");

-- CreateIndex
CREATE INDEX "NavigationItem_visible_sortOrder_idx" ON "NavigationItem"("visible", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "ContentSection_stableKey_key" ON "ContentSection"("stableKey");

-- CreateIndex
CREATE INDEX "ContentSection_visible_sortOrder_idx" ON "ContentSection"("visible", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "SocialLink_stableKey_key" ON "SocialLink"("stableKey");

-- CreateIndex
CREATE INDEX "SocialLink_visible_sortOrder_idx" ON "SocialLink"("visible", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Stat_stableKey_key" ON "Stat"("stableKey");

-- CreateIndex
CREATE INDEX "Stat_visible_sortOrder_idx" ON "Stat"("visible", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Service_stableKey_key" ON "Service"("stableKey");

-- CreateIndex
CREATE INDEX "Service_visible_sortOrder_idx" ON "Service"("visible", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Guarantee_stableKey_key" ON "Guarantee"("stableKey");

-- CreateIndex
CREATE INDEX "Guarantee_visible_sortOrder_idx" ON "Guarantee"("visible", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "JourneyEntry_stableKey_key" ON "JourneyEntry"("stableKey");

-- CreateIndex
CREATE INDEX "JourneyEntry_kind_visible_sortOrder_idx" ON "JourneyEntry"("kind", "visible", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "SkillCategory_stableKey_key" ON "SkillCategory"("stableKey");

-- CreateIndex
CREATE INDEX "SkillCategory_visible_sortOrder_idx" ON "SkillCategory"("visible", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_stableKey_key" ON "Skill"("stableKey");

-- CreateIndex
CREATE INDEX "Skill_categoryId_visible_sortOrder_idx" ON "Skill"("categoryId", "visible", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Project_stableKey_key" ON "Project"("stableKey");

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE INDEX "Project_visible_sortOrder_idx" ON "Project"("visible", "sortOrder");

-- CreateIndex
CREATE INDEX "Project_featured_sortOrder_idx" ON "Project"("featured", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Technology_stableKey_key" ON "Technology"("stableKey");

-- CreateIndex
CREATE UNIQUE INDEX "Technology_name_key" ON "Technology"("name");

-- CreateIndex
CREATE INDEX "Technology_visible_sortOrder_idx" ON "Technology"("visible", "sortOrder");

-- CreateIndex
CREATE INDEX "ProjectTechnology_technologyId_idx" ON "ProjectTechnology"("technologyId");

-- CreateIndex
CREATE INDEX "ProjectTechnology_projectId_sortOrder_idx" ON "ProjectTechnology"("projectId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectMetric_stableKey_key" ON "ProjectMetric"("stableKey");

-- CreateIndex
CREATE INDEX "ProjectMetric_projectId_sortOrder_idx" ON "ProjectMetric"("projectId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectHighlight_stableKey_key" ON "ProjectHighlight"("stableKey");

-- CreateIndex
CREATE INDEX "ProjectHighlight_projectId_sortOrder_idx" ON "ProjectHighlight"("projectId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectMedia_stableKey_key" ON "ProjectMedia"("stableKey");

-- CreateIndex
CREATE INDEX "ProjectMedia_projectId_sortOrder_idx" ON "ProjectMedia"("projectId", "sortOrder");

-- CreateIndex
CREATE INDEX "ProjectMedia_mediaAssetId_idx" ON "ProjectMedia"("mediaAssetId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectMedia_projectId_mediaAssetId_displayRole_key" ON "ProjectMedia"("projectId", "mediaAssetId", "displayRole");

-- CreateIndex
CREATE UNIQUE INDEX "MediaAsset_storageKey_key" ON "MediaAsset"("storageKey");

-- CreateIndex
CREATE INDEX "ContactMessage_status_createdAt_idx" ON "ContactMessage"("status", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_action_createdAt_idx" ON "AuditLog"("action", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_createdAt_idx" ON "AuditLog"("entityType", "entityId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_ownerUserId_createdAt_idx" ON "AuditLog"("ownerUserId", "createdAt");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TwoFactor" ADD CONSTRAINT "TwoFactor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteSettings" ADD CONSTRAINT "SiteSettings_resumeMediaAssetId_fkey" FOREIGN KEY ("resumeMediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThemeSettings" ADD CONSTRAINT "ThemeSettings_logoMediaAssetId_fkey" FOREIGN KEY ("logoMediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThemeSettings" ADD CONSTRAINT "ThemeSettings_faviconMediaAssetId_fkey" FOREIGN KEY ("faviconMediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThemeSettings" ADD CONSTRAINT "ThemeSettings_portraitMediaAssetId_fkey" FOREIGN KEY ("portraitMediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThemeSettings" ADD CONSTRAINT "ThemeSettings_watermarkMediaAssetId_fkey" FOREIGN KEY ("watermarkMediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThemeSettings" ADD CONSTRAINT "ThemeSettings_heroVideoMediaAssetId_fkey" FOREIGN KEY ("heroVideoMediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThemeSettings" ADD CONSTRAINT "ThemeSettings_socialMediaAssetId_fkey" FOREIGN KEY ("socialMediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NavigationItem" ADD CONSTRAINT "NavigationItem_targetSectionKey_fkey" FOREIGN KEY ("targetSectionKey") REFERENCES "ContentSection"("stableKey") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "SkillCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectTechnology" ADD CONSTRAINT "ProjectTechnology_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectTechnology" ADD CONSTRAINT "ProjectTechnology_technologyId_fkey" FOREIGN KEY ("technologyId") REFERENCES "Technology"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMetric" ADD CONSTRAINT "ProjectMetric_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectHighlight" ADD CONSTRAINT "ProjectHighlight_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMedia" ADD CONSTRAINT "ProjectMedia_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMedia" ADD CONSTRAINT "ProjectMedia_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

