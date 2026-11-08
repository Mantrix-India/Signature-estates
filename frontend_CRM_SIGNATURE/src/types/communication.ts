export type CommunicationType = 'CALL' | 'EMAIL' | 'SMS' | 'WHATSAPP' | 'MEETING';
export type CommunicationDirection = 'INBOUND' | 'OUTBOUND';

export interface CommunicationLog {
  id: string;
  clientId: string;
  leadId?: string | null;
  type: CommunicationType;
  direction: CommunicationDirection;
  body: string;
  occurredAt: string;
  createdAt: string;
  createdBy: { id: string; fullName: string };
  lead?: { id: string; stage: string } | null;
  client?: { id: string; fullName: string; phone: string };
}

export interface CommunicationListResponse {
  items: CommunicationLog[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface CommunicationFormValues {
  clientId: string;
  leadId?: string;
  type: CommunicationType;
  direction: CommunicationDirection;
  body: string;
  occurredAt?: string;
}