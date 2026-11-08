import { DealStage, PaymentStatus, CommissionStatus } from '@/types/deal';
import { OfferStatus } from '@/types/offer';

// Canonical V2.2 deal lifecycle (mirrors backend src/utils/deal.ts). Single
// frontend source of truth for stages, transitions, labels and colours.
export const DEAL_STAGES: DealStage[] = [
  'BOOKING',
  'AGREEMENT',
  'LOAN',
  'REGISTRATION',
  'COMPLETED',
  'CANCELLED',
];

export const DEAL_STAGE_LABELS: Record<DealStage, string> = {
  BOOKING: 'Booking',
  AGREEMENT: 'Agreement',
  LOAN: 'Loan',
  REGISTRATION: 'Registration',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const DEAL_STAGE_COLORS: Record<DealStage, string> = {
  BOOKING: '#f97316',
  AGREEMENT: '#f59e0b',
  LOAN: '#8b5cf6',
  REGISTRATION: '#3b82f6',
  COMPLETED: '#10b981',
  CANCELLED: '#ef4444',
};

// Mirrors backend ALLOWED_DEAL_TRANSITIONS. Terminal stages have no next steps.
export const ALLOWED_DEAL_TRANSITIONS: Record<DealStage, DealStage[]> = {
  BOOKING: ['AGREEMENT', 'CANCELLED'],
  AGREEMENT: ['LOAN', 'REGISTRATION', 'CANCELLED'],
  LOAN: ['REGISTRATION', 'CANCELLED'],
  REGISTRATION: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  PAID: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  OVERDUE: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
  CANCELLED: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
};

export const COMMISSION_STATUS_COLORS: Record<CommissionStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  RECEIVED: 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400',
  PAID_OUT: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  CANCELLED: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
};

export const OFFER_STATUS_COLORS: Record<OfferStatus, string> = {
  PROPOSED: 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400',
  COUNTERED: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  ACCEPTED: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  REJECTED: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
  WITHDRAWN: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
  EXPIRED: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
};

export const PAYMENT_METHODS: string[] = [
  'CASH',
  'BANK_TRANSFER',
  'CHEQUE',
  'UPI',
  'CARD',
  'LOAN_DISBURSEMENT',
  'OTHER',
];

/** Indian-currency formatting: Cr / L / grouped rupees. */
export function formatCurrency(amount: number): string {
  if (Math.abs(amount) >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (Math.abs(amount) >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function isPrivilegedRole(role?: string): boolean {
  return role === 'ADMIN' || role === 'MANAGER';
}