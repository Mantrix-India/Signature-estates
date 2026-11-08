-- V2.3 — Public website listings
-- Additive only: new enum TYPE + new nullable/defaulted columns. No existing
-- column is renamed, retyped or dropped, so the raw-SQL AI service is unaffected
-- on reads. (A brand-new enum type may be used in the same migration; the
-- "split migration" rule only applies to ALTER TYPE ... ADD VALUE.)

-- CreateEnum
CREATE TYPE "ListingType" AS ENUM ('SALE', 'RENT');

-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "locality" TEXT,
ADD COLUMN     "listingType" "ListingType" NOT NULL DEFAULT 'SALE',
ADD COLUMN     "furnishing" "RequirementFurnishing",
ADD COLUMN     "floor" INTEGER,
ADD COLUMN     "totalFloors" INTEGER,
ADD COLUMN     "reraId" TEXT,
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "images" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Backfill: slug for every existing property.
-- Mirrors src/utils/slug.ts: lowercase, non [a-z0-9] runs -> '-', trimmed,
-- capped at 80 chars, base = title + locality (locality is NULL for all
-- existing rows, so city is used as the fallback). Collisions get -2, -3, ...
-- Oldest property keeps the bare slug. Loop is collision-proof (it checks the
-- actual table, so "x-2" can never clash with a different base "x-2").
DO $$
DECLARE
  r         RECORD;
  base_slug TEXT;
  candidate TEXT;
  n         INTEGER;
BEGIN
  FOR r IN
    SELECT "id", "title", COALESCE("locality", "city") AS place
    FROM "properties"
    WHERE "slug" IS NULL
    ORDER BY "createdAt" ASC, "id" ASC
  LOOP
    base_slug := lower(coalesce(r."title", '') || ' ' || coalesce(r.place, ''));
    base_slug := regexp_replace(base_slug, '[^a-z0-9]+', '-', 'g');
    base_slug := trim(both '-' from base_slug);
    base_slug := trim(both '-' from left(base_slug, 80));
    IF base_slug = '' THEN
      base_slug := 'property';
    END IF;

    candidate := base_slug;
    n := 1;
    WHILE EXISTS (SELECT 1 FROM "properties" WHERE "slug" = candidate) LOOP
      n := n + 1;
      candidate := base_slug || '-' || n;
    END LOOP;

    UPDATE "properties" SET "slug" = candidate WHERE "id" = r."id";
  END LOOP;
END $$;

-- Every row now has a slug; enforce it.
ALTER TABLE "properties" ALTER COLUMN "slug" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "properties_slug_key" ON "properties"("slug");

-- CreateIndex
CREATE INDEX "properties_isPublished_status_idx" ON "properties"("isPublished", "status");

-- Seed: "Website" lead source (idempotent, and case-insensitive so an existing
-- "website"/"WEBSITE" row is reused rather than duplicated).
INSERT INTO "lead_sources" ("id", "name", "createdAt")
SELECT gen_random_uuid()::text, 'Website', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "lead_sources" WHERE lower("name") = 'website');
