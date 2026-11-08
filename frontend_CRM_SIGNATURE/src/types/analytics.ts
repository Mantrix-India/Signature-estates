export interface AnalyticsOverview {
  totalProperties: number;
  totalClients: number;
  totalLeads: number;
  totalSiteVisits: number;
  activeLeads: number;
  wonLeads: number;
  lostLeads: number;
  conversionRate: number;
  /** Invoice-only revenue (kept for backwards compatibility). */
  totalRevenue: number;
  /** Collected money: PAID invoices + PAID deal payments. */
  revenue: {
    invoices: number;
    dealPayments: number;
    total: number;
  };
  /** Outstanding deal payments (PENDING/OVERDUE) on non-cancelled deals. */
  pendingPayments: number;
  deals: {
    active: number;
    completed: number;
    cancelled: number;
    activeValue: number;
    completedValue: number;
  };
  /** 'me' when deal figures are scoped to the signed-in agent. */
  scope: 'me' | 'all';
  generatedAt: string;
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
  /** Sortable key, e.g. "2026-11". */
  key: string;
  /** Display label, e.g. "Nov 26". */
  month: string;
  invoices: number;
  deals: number;
  total: number;
}

export interface BuilderPerformance {
  id: string;
  name: string;
  projectCount: number;
  propertyCount: number;
  availableCount: number;
  soldCount: number;
  commissionPercent: number;
}

export interface ConversionRate {
  totalLeads: number;
  wonLeads: number;
  conversionRate: number;
}

/** One consistent snapshot shared by the dashboard and the analytics page. */
export interface AnalyticsSnapshot {
  overview: AnalyticsOverview;
  funnel: LeadFunnelItem[];
  inventory: InventoryBreakdown[];
  revenueByMonth: RevenueByMonth[];
}
