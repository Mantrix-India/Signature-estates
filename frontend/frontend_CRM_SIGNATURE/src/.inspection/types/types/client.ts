import { PropertyType } from './property';

export type ClientStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'NEGOTIATION' | 'CONVERTED' | 'LOST';
export type TimelineEventType =
  | 'CALL'
  | 'EMAIL'
  | 'MEETING'
  | 'SITE_VISIT'
  | 'STATUS_CHANGE'
  | 'NOTE'
  | 'OTHER';

export interface ClientRequirement {
  id: string;
  propertyType: PropertyType;
  preferredCity: string;
  minBudget?: number | null;
  maxBudget?: number | null;
  bedrooms?: number | null;
  notes?: string | null;
  createdAt: string;
}

export interface ClientNote {
  id: string;
  content: string;
  createdAt: string;
  createdBy: { fullName: string };
}

export interface ClientTimelineEvent {
  id: string;
  eventType: TimelineEventType;
  description: string;
  createdAt: string;
  createdBy: { fullName: string };
}

export interface Client {
  id: string;
  fullName: string;
  phone: string;
  email?: string | null;
  source?: string | null;
  status: ClientStatus;
  createdAt: string;
  updatedAt: string;
  requirements?: ClientRequirement[];
  notes?: ClientNote[];
  timeline?: ClientTimelineEvent[];
  favorites?: { id: string; property: { id: string; title: string; price: number } }[];
  sharedProperties?: { id: string; property: { id: string; title: string; price: number } }[];
}

export interface ClientListResponse {
  clients: Client[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface ClientFormValues {
  fullName: string;
  phone: string;
  email?: string;
  source?: string;
  status?: ClientStatus;
}

export interface ClientFilters {
  page?: number;
  limit?: number;
  status?: ClientStatus;
  search?: string;
}
export interface RequirementFormValues {
  propertyType: PropertyType;
  preferredCity: string;
  minBudget?: number;
  maxBudget?: number;
  bedrooms?: number;
  notes?: string;
}