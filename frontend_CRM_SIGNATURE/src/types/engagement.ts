export type ClientActivityType =
  | 'PORTAL_OPENED'
  | 'PROPERTY_VIEWED'
  | 'PROPERTY_FAVORITED'
  | 'PROPERTY_UNFAVORITED'
  | 'FEEDBACK_GIVEN'
  | 'COMMENT_ADDED'
  | 'SITE_VISIT_REQUESTED'
  | 'SITE_VISIT_CONFIRMED'
  | 'CONTACT_AGENT'
  | 'CALL_AGENT'
  | 'WHATSAPP_AGENT';

export interface EngagementSummary {
  propertiesShared: number;
  propertiesViewed: number;
  favorited: number;
  interested: number;
  maybe: number;
  notInterested: number;
  comments: number;
  siteVisitsRequested: number;
  siteVisits: number;
  portalOpens: number;
  lastActivityAt: string | null;
}

export interface ClientActivityEntry {
  id: string;
  type: ClientActivityType;
  createdAt: string;
  propertyId?: string | null;
  collectionId?: string | null;
  metadata?: Record<string, unknown> | null;
  property?: { id: string; title: string } | null;
}

export interface ClientEngagement {
  summary: EngagementSummary;
  recentActivity: ClientActivityEntry[];
}