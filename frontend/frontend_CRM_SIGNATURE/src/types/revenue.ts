import { DealStage, PaymentStatus, CommissionStatus } from './deal';

export interface RevenueSummary {
  dealsByStage: { stage: DealStage; count: number; value: number }[];
  completed: { count: number; value: number };
  commission: { gross: number; agent: number; company: number };
  payments: {
    byStatus: Record<string, { count: number; amount: number }>;
    pendingTotal: number;
  };
}

export interface CommissionBreakdownRow {
  agentId: string;
  agentName: string | null;
  status: CommissionStatus;
  count: number;
  gross: number;
  agent: number;
  company: number;
}

export interface PendingPaymentItem {
  id: string;
  dealId: string;
  label?: string | null;
  amount: number;
  dueDate?: string | null;
  status: PaymentStatus;
  isOverdue: boolean;
  deal?: { id: string; dealValue: number; client: { id: string; fullName: string } };
}

export interface PendingPayments {
  items: PendingPaymentItem[];
  overdueTotal: number;
  upcomingTotal: number;
  total: number;
}