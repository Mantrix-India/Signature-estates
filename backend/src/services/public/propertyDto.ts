import { Prisma } from '@prisma/client';

/**
 * PUBLIC PROPERTY DTO — ALLOW-LIST.
 *
 * Two layers, both allow-lists:
 *  1. PUBLIC_PROPERTY_SELECT: the only columns ever read from the DB for public
 *     responses. Owner, createdBy, builder.commissionPercent, rental/maintenance
 *     /appreciation figures, AI summary, status logs, leads, documents, deals,
 *     offers etc. are simply never selected.
 *  2. toPublicProperty(): builds the response object field by field. A new
 *     column added to Property later is invisible here until someone adds it
 *     to BOTH lists on purpose.
 *
 * Never spread a Prisma row into a public response.
 */

/** The only rows the public may ever see. Every public query ANDs this in. */
export const PUBLIC_VISIBILITY = {
  isPublished: true,
  status: 'AVAILABLE',
} as const satisfies Prisma.PropertyWhereInput;

export const PUBLIC_PROPERTY_SELECT = {
  id: true,
  slug: true,
  title: true,
  description: true,
  propertyType: true,
  listingType: true,
  status: true,
  price: true,
  areaSqft: true,
  bedrooms: true,
  bathrooms: true,
  furnishing: true,
  floor: true,
  totalFloors: true,
  possessionDate: true,
  locality: true,
  city: true,
  state: true,
  amenities: true,
  images: true,
  reraId: true,
  isFeatured: true,
  createdAt: true,
  project: {
    select: {
      name: true,
      builder: { select: { name: true } },
    },
  },
} satisfies Prisma.PropertySelect;

export type PublicPropertyRow = Prisma.PropertyGetPayload<{ select: typeof PUBLIC_PROPERTY_SELECT }>;

export type PossessionStatus = 'READY_TO_MOVE' | 'UNDER_CONSTRUCTION';

/** Shape consumed by the public website (matches its `Property` type). */
export type PublicPropertyDto = {
  id: string;
  slug: string;
  title: string;
  description: string;
  propertyType: PublicPropertyRow['propertyType'];
  listingType: PublicPropertyRow['listingType'];
  status: PublicPropertyRow['status'];
  price: number;
  pricePerSqft: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  carpetArea: number | null;
  furnishing: PublicPropertyRow['furnishing'];
  floor: number | null;
  totalFloors: number | null;
  possessionStatus: PossessionStatus;
  possessionDate: string | null;
  locality: string | null;
  city: string;
  state: string;
  amenities: string[];
  images: string[];
  reraId: string | null;
  project: { name: string; builderName: string } | null;
  isFeatured: boolean;
  isVerified: boolean;
  createdAt: string;
};

/** Derived, not stored: no possession date or a past one means ready to move. */
export function possessionStatusOf(possessionDate: Date | null, now = new Date()): PossessionStatus {
  return possessionDate && possessionDate.getTime() > now.getTime() ? 'UNDER_CONSTRUCTION' : 'READY_TO_MOVE';
}

/** Only http(s) image URLs leave the API. */
function safeImages(images: string[]): string[] {
  return images.filter((u) => /^https?:\/\//i.test(u)).slice(0, 30);
}

export function toPublicProperty(p: PublicPropertyRow): PublicPropertyDto {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    description: p.description ?? '',
    propertyType: p.propertyType,
    listingType: p.listingType,
    status: p.status,
    price: p.price,
    pricePerSqft: p.areaSqft && p.areaSqft > 0 ? Math.round(p.price / p.areaSqft) : null,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    carpetArea: p.areaSqft,
    furnishing: p.furnishing,
    floor: p.floor,
    totalFloors: p.totalFloors,
    possessionStatus: possessionStatusOf(p.possessionDate),
    possessionDate: p.possessionDate ? p.possessionDate.toISOString() : null,
    locality: p.locality,
    city: p.city,
    state: p.state,
    amenities: [...p.amenities],
    images: safeImages(p.images),
    reraId: p.reraId,
    project: p.project ? { name: p.project.name, builderName: p.project.builder.name } : null,
    isFeatured: p.isFeatured,
    isVerified: Boolean(p.reraId),
    createdAt: p.createdAt.toISOString(),
  };
}
