export interface PortalSharedProperty {
  id: string;
  sharedAt: string;
  property: {
    id: string;
    title: string;
    price: number;
    address: string;
    city: string;
    bedrooms?: number | null;
    bathrooms?: number | null;
    areaSqft?: number | null;
  };
}

export interface PortalFavorite {
  id: string;
  createdAt: string;
  property: {
    id: string;
    title: string;
    price: number;
    address: string;
    city: string;
  };
}

export interface PortalSiteVisit {
  id: string;
  scheduledAt: string;
  status: string;
  clientConfirmed: boolean;
  property: { id: string; title: string; address: string; city: string };
}

export interface PortalData {
  client: { id: string; fullName: string };
  sharedProperties: PortalSharedProperty[];
  favorites: PortalFavorite[];
  siteVisits: PortalSiteVisit[];
}