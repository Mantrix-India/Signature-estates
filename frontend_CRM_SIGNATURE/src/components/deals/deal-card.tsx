import Link from 'next/link';
import { Deal } from '@/types/deal';
import { DEAL_STAGE_LABELS, DEAL_STAGE_COLORS, formatCurrency } from '@/lib/deals';

export function DealCard({ deal }: { deal: Deal }) {
  const color = DEAL_STAGE_COLORS[deal.stage];
  return (
    <Link
      href={`/dashboard/deals/${deal.id}`}
      className="block rounded-xl border border-neutral-200 bg-white p-4 transition-colors hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-neutral-900 dark:text-white">
            {deal.client.fullName}
          </p>
          <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
            {deal.property.title}
          </p>
        </div>
        <span
          className="shrink-0 rounded-full px-2.5 py-1 text-xs font-medium"
          style={{ backgroundColor: `${color}1a`, color }}
        >
          {DEAL_STAGE_LABELS[deal.stage]}
        </span>
      </div>

      <p className="mt-3 text-lg font-semibold text-neutral-900 dark:text-white">
        {formatCurrency(deal.dealValue)}
      </p>

      <div className="mt-3 flex items-center justify-between text-xs text-neutral-400">
        <span className="truncate">{deal.agent.fullName}</span>
        {deal._count && (
          <span className="shrink-0">
            {deal._count.payments} payments · {deal._count.documents} docs
          </span>
        )}
      </div>
    </Link>
  );
}