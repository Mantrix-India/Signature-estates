export type FeedbackSentiment = 'INTERESTED' | 'MAYBE' | 'NOT_INTERESTED';

export interface PortalProperty {
  id: string;
  title: string;
  description?: string | null;
  propertyType: string;
  status: string;
  price: number;
  areaSqft?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  address: string;
  city: string;
  state: string;
  latitude?: number | null;
  longitude?: number | null;
  amenities: string[];
  estimatedRentalMonthly?: number | null;
  maintenanceMonthly?: number | null;
  possessionDate?: string | null;
}

export interface PortalAgent {
  fullName: string;
  phone?: string | null;
}

export interface PortalComment {
  id: string;
  body: string;
  propertyId?: string | null;
  collectionId?: string | null;
  createdAt: string;
}

export interface PortalSharedProperty {
  id: string;
  sharedAt: string;
  property: PortalProperty;
}

export interface PortalFavorite {
  id: string;
  createdAt: string;
  property: PortalProperty;
}

export interface PortalSiteVisit {
  id: string;
  scheduledAt: string;
  status: string;
  clientConfirmed: boolean;
  property: { id: string; title: string; address: string; city: string };
}

export interface PortalFeedbackEntry {
  propertyId: string;
  sentiment: FeedbackSentiment;
}

// Legacy client-token portal response (backward compatible + new fields).
export interface PortalData {
  client: { id: string; fullName: string };
  agent: PortalAgent;
  sharedProperties: PortalSharedProperty[];
  favorites: PortalFavorite[];
  siteVisits: PortalSiteVisit[];
  feedback: PortalFeedbackEntry[];
  feedbackByProperty: Record<string, FeedbackSentiment>;
  comments: PortalComment[];
}

// Collection-token portal response.
export interface CollectionPropertyEntry {
  shareId: string;
  property: PortalProperty;
  isFavorited: boolean;
  feedback: FeedbackSentiment | null;
}

export interface CollectionPortalData {
  collection: { id: string; name: string; description?: string | null };
  client: { id: string; fullName: string };
  agent: PortalAgent;
  properties: CollectionPropertyEntry[];
  siteVisits: PortalSiteVisit[];
  comments: PortalComment[];
}