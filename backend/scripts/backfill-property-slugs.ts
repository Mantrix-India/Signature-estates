/**
 * Property slug backfill.
 *
 * The migration already gives every existing property a slug (title + city,
 * because `locality` did not exist yet). Run this script:
 *
 *   npx tsx scripts/backfill-property-slugs.ts
 *       -> dry run: prints what WOULD change, writes nothing
 *
 *   npx tsx scripts/backfill-property-slugs.ts --apply
 *       -> regenerates slugs for UNPUBLISHED properties from title + locality
 *          (use after the team fills in localities, before publishing)
 *
 * Published properties are never touched: their URLs may already be shared or
 * indexed. Idempotent — running it twice changes nothing the second time.
 */
import 'dotenv/config';
import { prisma } from '../src/config/prisma';
import { generateUniqueSlug, propertySlugBase } from '../src/utils/slug';

async function main() {
  const apply = process.argv.includes('--apply');

  const properties = await prisma.property.findMany({
    where: { isPublished: false },
    select: { id: true, title: true, locality: true, city: true, slug: true },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
  });

  let changed = 0;
  for (const p of properties) {
    const base = propertySlugBase(p);
    // Already on the right base (bare or with a numeric suffix)? Leave it.
    if (p.slug === base || new RegExp(`^${base}-\\d+$`).test(p.slug)) continue;

    const next = await generateUniqueSlug(prisma, base, p.id);
    changed++;
    console.log(`${apply ? 'UPDATE' : 'WOULD UPDATE'}  ${p.slug}  ->  ${next}`);
    if (apply) {
      await prisma.property.update({ where: { id: p.id }, data: { slug: next } });
    }
  }

  console.log(
    `\n${properties.length} unpublished properties checked, ${changed} ${apply ? 'updated' : 'would change'}.` +
      (apply || changed === 0 ? '' : '  Re-run with --apply to write.')
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
