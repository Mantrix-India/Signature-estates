import { ProjectInventory } from '@/types/inventory';

const statusStyles: Record<string, string> = {
  AVAILABLE: 'text-emerald-600 dark:text-emerald-400',
  RESERVED: 'text-amber-600 dark:text-amber-400',
  BOOKED: 'text-blue-600 dark:text-blue-400',
  SOLD: 'text-neutral-500 dark:text-neutral-400',
};

export function InventorySummaryCards({ summary }: { summary: ProjectInventory['summary'] }) {
  const entries = Object.entries(summary) as [keyof typeof summary, number][];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {entries.map(([status, count]) => (
        <div
          key={status}
          className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <p className="text-xs text-neutral-500 dark:text-neutral-400">{status}</p>
          <p className={`mt-1 text-2xl font-semibold ${statusStyles[status]}`}>{count}</p>
        </div>
      ))}
    </div>
  );
}