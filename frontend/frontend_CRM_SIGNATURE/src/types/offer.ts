export type OfferParty = 'BUYER' | 'SELLER';

export type OfferStatus =
  | 'PROPOSED'
  | 'COUNTERED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'WITHDRAWN'
  | 'EXPIRED';

export interface Offer {
  id: string;
  leadId: string;
  clientId: string;
  propertyId: string;
  dealId?: string | null;
  party: OfferParty;
  amount: number;
  status: OfferStatus;
  note?: string | null;
  validUntil?: string | null;
  createdAt: string;
  updatedAt: string;
  property?: { id: string; title: string; price: number };
  createdBy?: { id: string; fullName: string };
}

export interface OfferFormValues {
  leadId: string;
  propertyId: string;
  party: OfferParty;
  amount: number;
  note?: string;
  validUntil?: string;
}