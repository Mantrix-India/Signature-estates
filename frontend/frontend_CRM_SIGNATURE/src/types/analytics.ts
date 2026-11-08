export interface AnalyticsOverview {
  totalProperties: number;
  totalClients: number;
  totalLeads: number;
  totalSiteVisits: number;
  activeLeads: number;
  totalRevenue: number;
}

export interface InventoryBreakdown {
  status: string;
  count: number;
}

export interface LeadFunnelItem {
  stage: string;
  count: number;
}

export interface RevenueByMonth {
  month: string;
  total: number;
}

export interface BuilderPerformance {
  name: string;
  projectCount: number;
  commissionPercent: number;
}

export interface ConversionRate {
  totalLeads: number;
  wonLeads: number;
  conversionRate: number;
}