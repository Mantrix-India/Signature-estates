import { api } from '../axios';
import {
  AnalyticsOverview,
  InventoryBreakdown,
  LeadFunnelItem,
  RevenueByMonth,
  BuilderPerformance,
  ConversionRate,
} from '@/types/analytics';

export async function getOverviewRequest(): Promise<AnalyticsOverview> {
  const { data } = await api.get('/analytics/overview');
  return data.data;
}

export async function getInventoryRequest(): Promise<InventoryBreakdown[]> {
  const { data } = await api.get('/analytics/inventory');
  return data.data;
}

export async function getLeadFunnelRequest(): Promise<LeadFunnelItem[]> {
  const { data } = await api.get('/analytics/lead-funnel');
  return data.data;
}

export async function getRevenueByMonthRequest(): Promise<RevenueByMonth[]> {
  const { data } = await api.get('/analytics/revenue-by-month');
  return data.data;
}

export async function getBuilderPerformanceRequest(): Promise<BuilderPerformance[]> {
  const { data } = await api.get('/analytics/builder-performance');
  return data.data;
}

export async function getConversionRateRequest(): Promise<ConversionRate> {
  const { data } = await api.get('/analytics/conversion-rate');
  return data.data;
}