export interface CollectionSharedProperty {
  id: string;
  propertyId: string;
  position: number | null;
  sharedAt: string;
  property: {
    id: string;
    title: string;
    price: number;
    address: string;
    city: string;
    status: string;
  };
}

export interface Collection {
  id: string;
  clientId: string;
  name: string;
  description?: string | null;
  accessToken: string;
  expiresAt?: string | null;
  revokedAt?: string | null;
  isArchived: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  sharedProperties: CollectionSharedProperty[];
  client?: { id: string; fullName: string };
  createdBy?: { id: string; fullName: string };
}

export interface CreateCollectionValues {
  clientId: string;
  name: string;
  description?: string;
  propertyIds: string[];
  expiresAt?: string;
}