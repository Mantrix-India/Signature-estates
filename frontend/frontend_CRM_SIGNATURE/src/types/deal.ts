import { Offer } from './offer';

export type DealStage =
  | 'BOOKING'
  | 'AGREEMENT'
  | 'LOAN'
  | 'REGISTRATION'
  | 'COMPLETED'
  | 'CANCELLED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export type PaymentMethod =
  | 'CASH'
  | 'BANK_TRANSFER'
  | 'CHEQUE'
  | 'UPI'
  | 'CARD'
  | 'LOAN_DISBURSEMENT'
  | 'OTHER';

export type CommissionStatus = 'PENDING' | 'RECEIVED' | 'PAID_OUT' | 'CANCELLED';

export interface Payment {
  id: string;
  dealId: string;
  label?: string | null;
  amount: number;
  dueDate?: string | null;
  paidAt?: string | null;
  status: PaymentStatus;
  method?: PaymentMethod | null;
  reference?: string | null;
  note?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Commission {
  id: string;
  dealId: string;
  grossAmount: number;
  agentPercent: number;
  agentAmount: number;
  companyAmount: number;
  status: CommissionStatus;
  receivedAt?: string | null;
  paidOutAt?: string | null;
  agentId: string;
  note?: string | null;
  createdAt: string;
  updatedAt: string;
  agent?: { id: string; fullName: string };
  deal?: { id: string; dealValue: number; stage: DealStage };
}

export interface DealDocument {
  id: string;
  dealId: string;
  title: string;
  docType: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
  uploadedBy?: { id: string; fullName: string };
}

export interface Deal {
  id: string;
  leadId: string;
  clientId: string;
  propertyId: string;
  ownerId?: string | null;
  agentId: string;
  stage: DealStage;
  dealValue: number;
  bookingDate: string;
  agreementDate?: string | null;
  loanApprovalDate?: string | null;
  registrationDate?: string | null;
  completedDate?: string | null;
  cancelledAt?: string | null;
  cancelReason?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  client: { id: string; fullName: string; phone: string };
  property: { id: string; title: string; price: number; city?: string | null };
  owner?: { id: string; fullName: string; phone: string } | null;
  agent: { id: string; fullName: string };
  lead?: { id: string; stage: string };
  commission?: Commission | null;
  payments?: Payment[];
  offers?: Offer[];
  documents?: DealDocument[];
  _count?: { documents: number; payments: number; offers: number };
}

export interface DealListResponse {
  deals: Deal[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface DealFormValues {
  leadId: string;
  propertyId?: string;
  ownerId?: string;
  agentId?: string;
  offerId?: string;
  dealValue?: number;
  bookingDate?: string;
  notes?: string;
}

export interface DealTransitionValues {
  stage: DealStage;
  date?: string;
  cancelReason?: string;
}

export interface PaymentFormValues {
  dealId: string;
  label?: string;
  amount: number;
  dueDate?: string;
  status?: PaymentStatus;
  method?: PaymentMethod;
  reference?: string;
  note?: string;
}

export interface PaymentUpdateValues {
  label?: string;
  amount?: number;
  dueDate?: string;
  status?: PaymentStatus;
  method?: PaymentMethod;
  reference?: string;
  note?: string;
  paidAt?: string;
}

export interface CommissionFormValues {
  dealId: string;
  grossAmount?: number;
  grossPercent?: number;
  agentPercent?: number;
  agentId?: string;
  note?: string;
}

export interface CommissionUpdateValues {
  status?: CommissionStatus;
  agentPercent?: number;
  grossAmount?: number;
  note?: string;
  receivedAt?: string;
  paidOutAt?: string;
}