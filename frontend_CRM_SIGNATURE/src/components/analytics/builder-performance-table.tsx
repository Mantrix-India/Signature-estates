import Link from 'next/link';
import { BuilderPerformance } from '@/types/analytics';

export function BuilderPerformanceTable({ data }: { data: BuilderPerformance[] }) {
  if (data.length === 0) {
    return <p className="py-6 text-sm text-neutral-500 dark:text-neutral-400">No builders yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-xs text-neutral-500 dark:text-neutral-400">
          <tr className="border-b border-hairline">
            <th className="pb-2 font-medium">Builder</th>
            <th className="pb-2 text-right font-medium">Projects</th>
            <th className="pb-2 text-right font-medium">Units</th>
            <th className="pb-2 text-right font-medium">Available</th>
            <th className="pb-2 text-right font-medium">Booked / Sold</th>
            <th className="pb-2 text-right font-medium">Commission</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-hairline)]">
          {data.map((b) => (
            <tr key={b.id}>
              <td className="py-2.5 font-medium text-neutral-900 dark:text-white">
                <Link href={`/dashboard/builders/${b.id}`} className="hover:text-brand-600 dark:hover:text-brand-400">
                  {b.name}
                </Link>
              </td>
              <td className="tabular py-2.5 text-right text-neutral-600 dark:text-neutral-300">{b.projectCount}</td>
              <td className="tabular py-2.5 text-right text-neutral-600 dark:text-neutral-300">{b.propertyCount}</td>
              <td className="tabular py-2.5 text-right text-neutral-600 dark:text-neutral-300">{b.availableCount}</td>
              <td className="tabular py-2.5 text-right text-neutral-600 dark:text-neutral-300">{b.soldCount}</td>
              <td className="tabular py-2.5 text-right text-neutral-600 dark:text-neutral-300">{b.commissionPercent}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
