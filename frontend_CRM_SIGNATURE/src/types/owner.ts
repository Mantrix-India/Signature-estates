export interface OwnerPropertySummary {
  id: string;
  title: string;
  city?: string | null;
  status: string;
  price: number;
}

export interface Owner {
  id: string;
  fullName: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  properties?: OwnerPropertySummary[];
  _count?: { properties: number };
}

export interface OwnerFormValues {
  fullName: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
}

export interface OwnerListResponse {
  owners: Owner[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}