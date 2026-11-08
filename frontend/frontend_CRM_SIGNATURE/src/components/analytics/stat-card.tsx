import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  hint,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  hint?: string;
}) {
  const hasTrend = typeof trend === 'number';
  const positive = (trend ?? 0) >= 0;

  return (
    <div className="group rounded-xl border border-neutral-200 bg-white p-5 transition-colors hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{label}</p>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 transition-colors group-hover:bg-brand-500/10 group-hover:text-brand-600 dark:bg-neutral-800 dark:text-neutral-400 dark:group-hover:text-brand-400">
          <Icon size={16} />
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-neutral-900 tabular-nums dark:text-white">
        {value}
      </p>
      {(hasTrend || hint) && (
        <div className="mt-1.5 flex items-center gap-1.5 text-xs">
          {hasTrend && (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 font-medium',
                positive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400'
              )}
            >
              {positive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
              {Math.abs(trend!)}%
            </span>
          )}
          {hint && <span className="text-neutral-400 dark:text-neutral-500">{hint}</span>}
        </div>
      )}
    </div>
  );
}
