ALTER TABLE "SiteSettings"
  ADD COLUMN "hireUpworkUrl" TEXT NOT NULL DEFAULT 'https://www.upwork.com/freelancers/~01514d2dc711d77dd2',
  ADD COLUMN "hireUpworkFallbackUrl" TEXT,
  ADD COLUMN "hireFiverrUrl" TEXT NOT NULL DEFAULT 'https://www.fiverr.com/s/Emgjbxy',
  ADD COLUMN "hireContactFallback" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "ThemeSettings"
  ADD COLUMN "headingColor" TEXT NOT NULL DEFAULT '#FFFFFF',
  ADD COLUMN "linkColor" TEXT NOT NULL DEFAULT '#D4AF37',
  ADD COLUMN "fontFamily" TEXT NOT NULL DEFAULT 'Montserrat',
  ADD COLUMN "fontScale" DOUBLE PRECISION NOT NULL DEFAULT 1;

ALTER TABLE "ContentSection" ADD COLUMN "extraFields" JSONB;

UPDATE "SiteSettings"
SET "publishedPayload" = COALESCE("publishedPayload", '{}'::jsonb) || jsonb_build_object(
  'hireUpworkUrl', "hireUpworkUrl",
  'hireUpworkFallbackUrl', "hireUpworkFallbackUrl",
  'hireFiverrUrl', "hireFiverrUrl",
  'hireContactFallback', "hireContactFallback"
);

UPDATE "ThemeSettings"
SET "publishedPayload" = COALESCE("publishedPayload", '{}'::jsonb) || jsonb_build_object(
  'headingColor', "headingColor",
  'linkColor', "linkColor",
  'fontFamily', "fontFamily",
  'fontScale', "fontScale"
);

UPDATE "ContentSection"
SET "extraFields" = '{}'::jsonb
WHERE "extraFields" IS NULL;

UPDATE "ContentSection"
SET "publishedPayload" = COALESCE("publishedPayload", '{}'::jsonb) || jsonb_build_object('extraFields', "extraFields");
