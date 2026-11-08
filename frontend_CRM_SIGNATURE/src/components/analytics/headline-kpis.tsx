import { Handshake, TrendingUp, Users, Wallet } from 'lucide-react';
import type { AnalyticsOverview } from '@/types/analytics';
import { formatPrice } from '@/lib/format';
import { KpiCard } from './kpi-card';
import { SkeletonBlock } from './panel';

/**
 * The four headline KPIs. Rendered by BOTH the dashboard and the analytics page
 * from the same overview object, so they are guaranteed to match.
 */
export function HeadlineKpis({ overview, isLoading }: { overview: AnalyticsOverview | null; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <SkeletonBlock key={i} className="h-[134px]" />
        ))}
      </div>
    );
  }

  const o = overview;
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        label="Active leads"
        value={String(o?.activeLeads ?? 0)}
        sub={`${o?.totalLeads ?? 0} leads in total`}
        icon={Handshake}
        tone="#d97746"
      />
      <KpiCard
        label="Clients"
        value={String(o?.totalClients ?? 0)}
        sub={`${o?.totalProperties ?? 0} properties on the books`}
        icon={Users}
        tone="#258b88"
      />
      <KpiCard
        label="Conversion rate"
        value={`${(o?.conversionRate ?? 0).toFixed(1)}%`}
        sub={`${o?.wonLeads ?? 0} closed of ${o?.totalLeads ?? 0}`}
        icon={TrendingUp}
        tone="#7772bd"
      />
      <KpiCard
        label="Revenue collected"
        value={formatPrice(o?.revenue.total ?? 0)}
        sub={`Deals ${formatPrice(o?.revenue.dealPayments ?? 0)} · Invoices ${formatPrice(o?.revenue.invoices ?? 0)}`}
        icon={Wallet}
        tone="#62977a"
      />
    </div>
  );
}
