import { z } from 'zod';

const furnishingEnum = z.enum(['UNFURNISHED', 'SEMI_FURNISHED', 'FURNISHED']);

export const createPropertySchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  propertyType: z.enum(['APARTMENT', 'VILLA', 'PLOT', 'COMMERCIAL', 'OTHER']),
  status: z.enum(['AVAILABLE', 'RESERVED', 'BOOKED', 'SOLD']).optional(),
  price: z.number().positive('Price must be greater than 0'),
  areaSqft: z.number().positive().optional(),
  bedrooms: z.number().int().nonnegative().optional(),
  bathrooms: z.number().int().nonnegative().optional(),
  address: z.string().min(3, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  amenities: z.array(z.string()).optional(),
  estimatedRentalMonthly: z.number().nonnegative().optional(),
  maintenanceMonthly: z.number().nonnegative().optional(),
  annualAppreciationPercent: z.number().optional(),
  possessionDate: z.string().datetime().optional(),
  projectId: z.string().uuid().optional(),

  // V2.3 — public website listing fields. `slug` is never accepted from input:
  // it is generated on create and stays stable afterwards.
  isPublished: z.boolean().optional(),
  locality: z.string().trim().min(2, 'Locality must be at least 2 characters').max(100).optional(),
  listingType: z.enum(['SALE', 'RENT']).optional(),
  furnishing: furnishingEnum.optional(),
  floor: z.number().int().min(-5).max(250).optional(),
  totalFloors: z.number().int().min(0).max(250).optional(),
  reraId: z.string().trim().max(60).optional(),
  isFeatured: z.boolean().optional(),
  images: z.array(z.string().url('Each image must be a valid URL')).max(30).optional(),
});

export const updatePropertySchema = createPropertySchema.partial();

const booleanQuery = z
  .enum(['true', 'false'])
  .transform((v) => v === 'true')
  .optional();

export const listPropertiesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  city: z.string().optional(),
  status: z.enum(['AVAILABLE', 'RESERVED', 'BOOKED', 'SOLD']).optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  search: z.string().optional(),
  isPublished: booleanQuery,
});

export const setPublishedSchema = z.object({
  isPublished: z.boolean(),
});

export const nearbyPlacesQuerySchema = z.object({
  type: z.enum(['school', 'hospital', 'airport', 'metro', 'market']),
  radius: z.coerce.number().positive().max(20000).optional(),
});

export const compareQuerySchema = z.object({
  ids: z.string().min(1, 'Provide at least one property id'),
});

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
export type ListPropertiesQuery = z.infer<typeof listPropertiesQuerySchema>;
export type NearbyPlacesQuery = z.infer<typeof nearbyPlacesQuerySchema>;
export type CompareQuery = z.infer<typeof compareQuerySchema>;
