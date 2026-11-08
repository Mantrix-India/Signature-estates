import type { LucideIcon } from 'lucide-react';

/** KPI tile shared by the dashboard and the analytics page. */
export function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  tone: string;
}) {
  return (
    <article className="rounded-2xl border border-hairline bg-surface p-5 shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-lift)]">
      <div className="flex items-start justify-between">
        <span className="text-sm text-neutral-500 dark:text-neutral-400">{label}</span>
        <span
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${tone}1f`, color: tone }}
        >
          <Icon size={16} />
        </span>
      </div>

      <strong className="font-display tabular mt-3 block text-[28px] font-semibold leading-none text-neutral-900 dark:text-white">
        {value}
      </strong>

      {sub && <p className="mt-2.5 text-xs text-neutral-500 dark:text-neutral-400">{sub}</p>}
    </article>
  );
}
