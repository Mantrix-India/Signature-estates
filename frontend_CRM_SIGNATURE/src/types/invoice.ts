export type InvoiceStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  client: { id: string; fullName: string; phone: string };
  propertyId?: string | null;
  property?: { id: string; title: string } | null;
  amount: number;
  status: InvoiceStatus;
  dueDate: string;
  notes?: string | null;
  createdAt: string;
}

export interface InvoiceFormValues {
  clientId: string;
  propertyId?: string;
  amount: number;
  dueDate: string;
  notes?: string;
}