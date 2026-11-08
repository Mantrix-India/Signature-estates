export type SiteVisitStatus = 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';

export interface SiteVisit {
  id: string;
  clientId: string;
  client: { id: string; fullName: string; phone: string };
  propertyId: string;
  property: { id: string; title: string; address: string; city: string };
  assignedToId: string;
  assignedTo: { id: string; fullName: string };
  scheduledAt: string;
  status: SiteVisitStatus;
  clientConfirmed: boolean;
  builderConfirmed: boolean;
  notes?: string | null;
  createdBy: { id: string; fullName: string };
  createdAt: string;
  updatedAt: string;
}

export interface SiteVisitListResponse {
  siteVisits: SiteVisit[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface SiteVisitFilters {
  page?: number;
  status?: SiteVisitStatus;
  assignedToId?: string;
  from?: string;
  to?: string;
}

export interface SiteVisitFormValues {
  clientId: string;
  propertyId: string;
  assignedToId: string;
  scheduledAt: string;
  notes?: string;
}