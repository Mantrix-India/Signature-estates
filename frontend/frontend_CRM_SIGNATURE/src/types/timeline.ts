export type TimelineSource =
  | 'CLIENT_TIMELINE'
  | 'LEAD_ACTIVITY'
  | 'CLIENT_ACTIVITY'
  | 'SITE_VISIT';

export interface TimelineItem {
  id: string;
  source: TimelineSource;
  type: string;
  description: string;
  actor: { id: string; fullName: string } | null;
  at: string;
  meta?: Record<string, unknown>;
}

export interface TimelineResponse {
  items: TimelineItem[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}