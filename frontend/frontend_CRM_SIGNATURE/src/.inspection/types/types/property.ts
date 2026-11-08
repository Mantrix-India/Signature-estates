export type PropertyType = 'APARTMENT' | 'VILLA' | 'PLOT' | 'COMMERCIAL' | 'OTHER';
export type PropertyStatus = 'AVAILABLE' | 'RESERVED' | 'BOOKED' | 'SOLD';

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
}