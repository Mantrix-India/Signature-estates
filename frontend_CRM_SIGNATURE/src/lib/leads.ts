import { LeadStage } from '@/types/lead';

// Canonical V2.1 pipeline (mirrors backend src/utils/pipeline.ts). WON is retired
// from the UI: the pipeline runs on these 10 stages and CLOSED is the single win-state.
export const LEAD_STAGES: LeadStage[] = [
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'PROPERTIES_SHARED',
  'INTERESTED',
  'SITE_VISIT',
  'NEGOTIATION',
  'BOOKING',
  'CLOSED',
  'LOST',
];

export const STAGE_LABELS: Record<LeadStage, string> = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  QUALIFIED: 'Qualified',
  PROPERTIES_SHARED: 'Properties Shared',
  INTERESTED: 'Interested',
  SITE_VISIT: 'Site Visit',
  NEGOTIATION: 'Negotiation',
  BOOKING: 'Booking',
  CLOSED: 'Closed',
  LOST: 'Lost',
};

export const STAGE_COLORS: Record<LeadStage, string> = {
  NEW: '#a3a3a3',
  CONTACTED: '#3b82f6',
  QUALIFIED: '#8b5cf6',
  PROPERTIES_SHARED: '#6366f1',
  INTERESTED: '#0ea5e9',
  SITE_VISIT: '#14b8a6',
  NEGOTIATION: '#f59e0b',
  BOOKING: '#f97316',
  CLOSED: '#10b981',
  LOST: '#ef4444',
};