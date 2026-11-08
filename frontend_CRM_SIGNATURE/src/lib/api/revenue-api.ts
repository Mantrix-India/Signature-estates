import { api } from '../axios';
import { RevenueSummary, CommissionBreakdownRow, PendingPayments } from '@/types/revenue';

export async function getRevenueSummaryRequest(params?: {
  from?: string;
  to?: string;
}): Promise<RevenueSummary> {
  const { data } = await api.get('/revenue/summary', { params });
  return data.data;
}

export async function getCommissionBreakdownRequest(): Promise<CommissionBreakdownRow[]> {
  const { data } = await api.get('/revenue/commissions');
  return data.data;
}

export async function getPendingPaymentsRequest(): Promise<PendingPayments> {
  const { data } = await api.get('/revenue/pending-payments');
  return data.data;
}