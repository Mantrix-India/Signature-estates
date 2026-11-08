'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Briefcase, Building2, CalendarCheck, Clock, RefreshCw } from 'lucide-react';
import type { BuilderPerformance } from '@/types/analytics';
import { getBuilderPerformanceRequest } from '@/lib/api/analytics-api';
import { useAnalyticsSnapshot } from '@/lib/use-analytics';
import { formatPrice } from '@/lib/format';
import { useAuth } from '@/context/auth-context';
import { Panel, PanelError, SkeletonBlock } from '@/components/analytics/panel';
import { KpiCard } from '@/components/analytics/kpi-card';
import { HeadlineKpis } from '@/components/analytics/headline-kpis';
import { PipelineBars } from '@/components/analytics/pipeline-bars';
import { InventoryChart } from '@/components/analytics/inventory-chart';
import { LeadFunnelChart } from '@/components/analytics/lead-funnel-chart';
import { RevenueChart } from '@/components/analytics/revenue-chart';
import { BuilderPerformanceTable } from '@/components/analytics/builder-performance-table';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const privileged = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  // Same snapshot (and same headline component) as the dashboard → same numbers.
  const { snapshot, isLoading, error, reload } = useAnalyticsSnapshot();

  const [builders, setBuilders] = useState<BuilderPerformance[]>([]);
  const [buildersLoading, setBuildersLoading] = useState(true);
  const [buildersError, setBuildersError] = useState(false);

  useEffect(() => {
    let active = true;
    getBuilderPerformanceRequest()
      .then((data) => active && setBuilders(data))
      .catch(() => active && setBuildersError(true))
      .finally(() => active && setBuildersLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const overview = snapshot?.overview ?? null;
  const updatedAt = overview?.generatedAt
    ? new Date(overview.generatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow">Insights</span>
          <h1 className="font-display mt-2 text-[32px] font-semibold leading-tight text-neutral-900 dark:text-white">
            Analytics<span className="text-brand-500">.</span>
          </h1>
          <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
            Portfolio, pipeline and revenue — the same live numbers as your dashboard.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {updatedAt && (
            <span className="text-xs text-neutral-500 dark:text-neutral-400">Updated {updatedAt}</span>
          )}
          <button
            onClick={reload}
            className="flex items-center gap-1.5 rounded-xl border border-hairline bg-surface px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-surface-muted dark:text-neutral-200"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </section>

      {error && !snapshot && !isLoading && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          Analytics could not be loaded. Check that the backend is running, then press Refresh.
        </div>
      )}

      {/* Headline KPIs — identical component + data as the dashboard */}
      <HeadlineKpis overview={overview} isLoading={isLoading} />

      {/* Secondary KPIs */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <SkeletonBlock key={i} className="h-[134px]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Properties"
            value={String(overview?.totalProperties ?? 0)}
            sub={`${snapshot?.inventory.find((i) => i.status === 'AVAILABLE')?.count ?? 0} available`}
            icon={Building2}
            tone="#258b88"
          />
          <KpiCard
            label="Site visits"
            value={String(overview?.totalSiteVisits ?? 0)}
            sub="Logged all-time"
            icon={CalendarCheck}
            tone="#d97746"
          />
          <KpiCard
            label={overview?.scope === 'me' ? 'Your active deals' : 'Active deals'}
            value={String(overview?.deals.active ?? 0)}
            sub={`${formatPrice(overview?.deals.activeValue ?? 0)} in progress · ${overview?.deals.completed ?? 0} completed`}
            icon={Briefcase}
            tone="#7772bd"
          />
          <KpiCard
            label="Payments outstanding"
            value={formatPrice(overview?.pendingPayments ?? 0)}
            sub="Pending + overdue on open deals"
            icon={Clock}
            tone="#62977a"
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel
          eyebrow="Momentum"
          title="Lead pipeline"
          action={
            <Link
              href="/dashboard/leads"
              className="flex items-center gap-1 text-xs font-medium text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-400"
            >
              View board <ArrowUpRight size={13} />
            </Link>
          }
        >
          {isLoading ? (
            <SkeletonBlock className="h-64 border-0" />
          ) : !snapshot ? (
            <PanelError />
          ) : (
            <PipelineBars funnel={snapshot.funnel} />
          )}
        </Panel>

        <Panel eyebrow="Distribution" title="Leads by stage">
          {isLoading ? (
            <SkeletonBlock className="h-64 border-0" />
          ) : !snapshot ? (
            <PanelError />
          ) : (
            <LeadFunnelChart data={snapshot.funnel} />
          )}
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Panel
          eyebrow="Last 12 months"
          title="Revenue collected"
          action={
            privileged ? (
              <Link
                href="/dashboard/revenue"
                className="flex items-center gap-1 text-xs font-medium text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-400"
              >
                Revenue details <ArrowUpRight size={13} />
              </Link>
            ) : undefined
          }
        >
          {isLoading ? (
            <SkeletonBlock className="h-64 border-0" />
          ) : !snapshot ? (
            <PanelError />
          ) : (
            <RevenueChart data={snapshot.revenueByMonth} />
          )}
        </Panel>

        <Panel eyebrow="Inventory" title="Property status">
          {isLoading ? (
            <SkeletonBlock className="h-64 border-0" />
          ) : !snapshot ? (
            <PanelError />
          ) : (
            <InventoryChart data={snapshot.inventory} />
          )}
        </Panel>
      </div>

      <Panel eyebrow="Partners" title="Builder performance">
        {buildersLoading ? (
          <SkeletonBlock className="h-32 border-0" />
        ) : buildersError ? (
          <PanelError />
        ) : (
          <BuilderPerformanceTable data={builders} />
        )}
      </Panel>
    </div>
  );
}
