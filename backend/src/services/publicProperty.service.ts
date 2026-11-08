import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { PublicListQuery } from '../validators/public.validator';
import {
  PUBLIC_PROPERTY_SELECT,
  PUBLIC_VISIBILITY,
  PublicPropertyDto,
  toPublicProperty,
} from './public/propertyDto';

const insensitive = (value: string) => ({ equals: value, mode: 'insensitive' as const });

/** Every public query goes through this: visibility first, filters second. */
function visible(...filters: Prisma.PropertyWhereInput[]): Prisma.PropertyWhereInput {
  return { AND: [PUBLIC_VISIBILITY, ...filters] };
}

function buildFilters(q: PublicListQuery, now = new Date()): Prisma.PropertyWhereInput[] {
  const f: Prisma.PropertyWhereInput[] = [];
  if (q.locality) f.push({ locality: insensitive(q.locality) });
  if (q.city) f.push({ city: insensitive(q.city) });
  if (q.propertyType) f.push({ propertyType: q.propertyType });
  if (q.listingType) f.push({ listingType: q.listingType });
  if (q.furnishing) f.push({ furnishing: q.furnishing });
  if (q.bedrooms !== undefined) f.push({ bedrooms: q.bedrooms });
  if (q.minPrice !== undefined) f.push({ price: { gte: q.minPrice } });
  if (q.maxPrice !== undefined) f.push({ price: { lte: q.maxPrice } });
  if (q.amenities && q.amenities.length > 0) f.push({ amenities: { hasEvery: q.amenities } });
  if (q.possessionStatus === 'UNDER_CONSTRUCTION') f.push({ possessionDate: { gt: now } });
  if (q.possessionStatus === 'READY_TO_MOVE') {
    f.push({ OR: [{ possessionDate: null }, { possessionDate: { lte: now } }] });
  }
  return f;
}

function buildOrderBy(sort: PublicListQuery['sort']): Prisma.PropertyOrderByWithRelationInput[] {
  // createdAt + id tie-breakers keep pagination stable.
  const tail: Prisma.PropertyOrderByWithRelationInput[] = [{ createdAt: 'desc' }, { id: 'asc' }];
  switch (sort) {
    case 'price_asc':
      return [{ price: 'asc' }, ...tail];
    case 'price_desc':
      return [{ price: 'desc' }, ...tail];
    case 'area_desc':
      return [{ areaSqft: { sort: 'desc', nulls: 'last' } }, ...tail];
    case 'area_asc':
      return [{ areaSqft: { sort: 'asc', nulls: 'last' } }, ...tail];
    case 'newest':
    default:
      return [{ isFeatured: 'desc' }, ...tail];
  }
}

export async function listPublicProperties(q: PublicListQuery) {
  if (q.minPrice !== undefined && q.maxPrice !== undefined && q.minPrice > q.maxPrice) {
    throw new AppError('minPrice cannot be greater than maxPrice', 400);
  }
  const where = visible(...buildFilters(q));

  const [rows, total] = await Promise.all([
    prisma.property.findMany({
      where,
      select: PUBLIC_PROPERTY_SELECT,
      orderBy: buildOrderBy(q.sort),
      skip: (q.page - 1) * q.limit,
      take: q.limit,
    }),
    prisma.property.count({ where }),
  ]);

  return {
    properties: rows.map(toPublicProperty),
    pagination: {
      page: q.page,
      limit: q.limit,
      total,
      totalPages: Math.ceil(total / q.limit),
    },
  };
}

export async function getPublicPropertyBySlug(slug: string): Promise<PublicPropertyDto> {
  const row = await prisma.property.findFirst({
    where: visible({ slug }),
    select: PUBLIC_PROPERTY_SELECT,
  });
  // Same 404 for "doesn't exist", "unpublished" and "sold": never confirm a hidden listing.
  if (!row) throw new AppError('Property not found', 404);
  return toPublicProperty(row);
}

const SIMILAR_LIMIT = 4;
const SIMILAR_PRICE_BAND = 0.25;

/**
 * Same property type, price within ±25%. Same locality first; if that gives
 * fewer than 4, top up from the same city.
 */
export async function getSimilarPublicProperties(slug: string): Promise<PublicPropertyDto[]> {
  const base = await prisma.property.findFirst({
    where: visible({ slug }),
    select: { id: true, propertyType: true, price: true, locality: true, city: true },
  });
  if (!base) throw new AppError('Property not found', 404);

  const common: Prisma.PropertyWhereInput = {
    id: { not: base.id },
    propertyType: base.propertyType,
    price: {
      gte: base.price * (1 - SIMILAR_PRICE_BAND),
      lte: base.price * (1 + SIMILAR_PRICE_BAND),
    },
  };
  const orderBy: Prisma.PropertyOrderByWithRelationInput[] = [{ createdAt: 'desc' }, { id: 'asc' }];

  const sameLocality = base.locality
    ? await prisma.property.findMany({
        where: visible(common, { locality: insensitive(base.locality) }),
        select: PUBLIC_PROPERTY_SELECT,
        orderBy,
        take: SIMILAR_LIMIT,
      })
    : [];

  let results = sameLocality;
  if (results.length < SIMILAR_LIMIT) {
    const sameCity = await prisma.property.findMany({
      where: visible(common, {
        city: insensitive(base.city),
        id: { notIn: [base.id, ...results.map((r) => r.id)] },
      }),
      select: PUBLIC_PROPERTY_SELECT,
      orderBy,
      take: SIMILAR_LIMIT - results.length,
    });
    results = [...results, ...sameCity];
  }

  return results.map(toPublicProperty);
}

export async function listPublicLocalities() {
  const [byLocality, byCity] = await Promise.all([
    prisma.property.groupBy({
      by: ['city', 'locality'],
      where: visible({ locality: { not: null } }),
      _count: { _all: true },
    }),
    prisma.property.groupBy({
      by: ['city'],
      where: visible(),
      _count: { _all: true },
    }),
  ]);

  const desc = <T extends { count: number }>(a: T, b: T) => b.count - a.count;

  return {
    localities: byLocality
      .map((g) => ({ locality: g.locality as string, city: g.city, count: g._count._all }))
      .sort((a, b) => desc(a, b) || a.locality.localeCompare(b.locality)),
    cities: byCity
      .map((g) => ({ city: g.city, count: g._count._all }))
      .sort((a, b) => desc(a, b) || a.city.localeCompare(b.city)),
  };
}
