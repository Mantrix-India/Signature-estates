export type PropertyType = 'APARTMENT' | 'VILLA' | 'PLOT' | 'COMMERCIAL' | 'OTHER';
export type PropertyStatus = 'AVAILABLE' | 'RESERVED' | 'BOOKED' | 'SOLD';
export type ListingType = 'SALE' | 'RENT';
export type Furnishing = 'UNFURNISHED' | 'SEMI_FURNISHED' | 'FURNISHED';

export interface Property {
  id: string;
  title: string;
  description?: string | null;
  propertyType: PropertyType;
  status: PropertyStatus;
  price: number;
  areaSqft?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  address: string;
  city: string;
  state: string;
  latitude?: number | null;
  longitude?: number | null;
  amenities?: string[];
  estimatedRentalMonthly?: number | null;
  maintenanceMonthly?: number | null;
  annualAppreciationPercent?: number | null;
  possessionDate?: string | null;
  rentalYieldPercent?: number | null;
  // Public website (V2.3)
  isPublished: boolean;
  slug: string;
  locality?: string | null;
  listingType?: ListingType;
  furnishing?: Furnishing | null;
  floor?: number | null;
  totalFloors?: number | null;
  reraId?: string | null;
  isFeatured?: boolean;
  images?: string[];
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyListResponse {
  properties: Property[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PropertyFilters {
  page?: number;
  limit?: number;
  city?: string;
  status?: PropertyStatus;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  isPublished?: boolean;
}

export interface PropertyFormValues {
  title: string;
  description?: string;
  propertyType: PropertyType;
  status?: PropertyStatus;
  price: number;
  areaSqft?: number;
  bedrooms?: number;
  bathrooms?: number;
  address: string;
  city: string;
  state: string;
  // Public website (V2.3). isPublished is only sent by ADMIN/MANAGER.
  isPublished?: boolean;
  locality?: string;
  listingType?: ListingType;
  furnishing?: Furnishing;
  floor?: number;
  totalFloors?: number;
  reraId?: string;
  isFeatured?: boolean;
  amenities?: string[];
  images?: string[];
}