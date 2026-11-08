'use client';

import { useEffect, useState } from 'react';
import { Building2, Users, Handshake, CalendarCheck, TrendingUp, IndianRupee } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  AnalyticsOverview,
  InventoryBreakdown,
  LeadFunnelItem,
  RevenueByMonth,
  BuilderPerformance,
  ConversionRate,
} from '@/types/analytics';
import {
  getOverviewRequest,
  getInventoryRequest,
  getLeadFunnelRequest,
  getRevenueByMonthRequest,
  getBuilderPerformanceRequest,
  getConversionRateRequest,
} from '@/lib/api/analytics-api';
import { StatCard } from '@/components/analytics/stat-card';
import { InventoryChart } from '@/components/analytics/inventory-chart';
import { LeadFunnelChart } from '@/components/analytics/lead-funnel-chart';
import { RevenueChart } from '@/components/analytics/revenue-chart';
import { BuilderPerformanceTable } from '@/components/analytics/builder-performance-table';

function formatPrice(price: number) {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
  return `₹${price.toLocaleString('en-IN')}`;
}

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [inventory, setInventory] = useState<InventoryBreakdown[]>([]);
  const [funnel, setFunnel] = useState<LeadFunnelItem[]>([]);
  const [revenue, setRevenue] = useState<RevenueByMonth[]>([]);
  const [builders, setBuilders] = useState<BuilderPerformance[]>([]);
  const [conversion, setConversion] = useState<ConversionRate | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAll() {
      try {
        const [ov, inv, fn, rev, bld, conv] = await Promise.all([
          getOverviewRequest(),
          getInventoryRequest(),
          getLeadFunnelRequest(),
          getRevenueByMonthRequest(),
          getBuilderPerformanceRequest(),
          getConversionRateRequest(),
        ]);
        setOverview(ov);
        setInventory(inv);
        setFunnel(fn);
        setRevenue(rev);
        setBuilders(bld);
        setConversion(conv);
      } catch {
        toast.error('Failed to load analytics');
      } finally {
        setIsLoading(false);
      }
    }
    loadAll();
  }, []);

  if (isLoading || !overview || !conversion) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Analytics</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Overview of your portfolio, pipeline, and revenue
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Properties" value={overview.totalProperties} icon={Building2} />
        <StatCard label="Total Clients" value={overview.totalClients} icon={Users} />
        <StatCard label="Active Leads" value={overview.activeLeads} icon={Handshake} />
        <StatCard label="Site Visits" value={overview.totalSiteVisits} icon={CalendarCheck} />
        <StatCard label="Total Revenue" value={formatPrice(overview.totalRevenue)} icon={IndianRupee} />
        <StatCard
          label="Conversion Rate"
          value={`${conversion.conversionRate}%`}
          icon={TrendingUp}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-white">
            Inventory Status
          </h2>
          <InventoryChart data={inventory} />
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-white">
            Lead Funnel
          </h2>
          <LeadFunnelChart data={funnel} />
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-white">
          Revenue by Month
        </h2>
        <RevenueChart data={revenue} />
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-white">
          Builder Performance
        </h2>
        <BuilderPerformanceTable data={builders} />
      </div>
    </div>
  );
}