import { Project } from './project';

export interface Builder {
  id: string;
  name: string;
  contactPerson?: string | null;
  phone?: string | null;
  email?: string | null;
  commissionPercent: number;
  address?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { projects: number };
  projects?: Project[];
}

export interface BuilderListResponse {
  builders: Builder[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface BuilderFormValues {
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  commissionPercent: number;
  address?: string;
  notes?: string;
}

export interface BuilderFilters {
  page?: number;
  search?: string;
}
