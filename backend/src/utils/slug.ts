import { Prisma, PrismaClient } from '@prisma/client';

/**
 * URL-safe slug. Must stay in step with the PL/pgSQL backfill in
 * prisma/migrations/20261101090000_add_public_listing_fields/migration.sql:
 * lowercase, strip accents, non [a-z0-9] runs -> '-', trim '-', cap at 80 chars.
 */
export function slugify(input: string): string {
  const slug = input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '');
  return slug || 'property';
}

/** Base slug for a property: title + locality, falling back to city. */
export function propertySlugBase(p: { title: string; locality?: string | null; city?: string | null }) {
  return slugify(`${p.title} ${p.locality || p.city || ''}`);
}

type SlugDb = PrismaClient | Prisma.TransactionClient;

/**
 * Returns `base`, or `base-2`, `base-3`, ... — the first one not already taken.
 * `excludeId` lets a property keep/regenerate its own slug without colliding
 * with itself. The unique index on properties.slug is the final guard against
 * a concurrent insert racing us; callers retry on P2002 (see createProperty).
 */
export async function generateUniqueSlug(db: SlugDb, base: string, excludeId?: string): Promise<string> {
  const taken = await db.property.findMany({
    where: {
      OR: [{ slug: base }, { slug: { startsWith: `${base}-` } }],
      ...(excludeId && { NOT: { id: excludeId } }),
    },
    select: { slug: true },
  });
  const used = new Set(taken.map((t) => t.slug));
  if (!used.has(base)) return base;
  let n = 2;
  while (used.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}
