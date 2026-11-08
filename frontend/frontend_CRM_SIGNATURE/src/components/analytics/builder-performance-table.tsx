import { BuilderPerformance } from '@/types/analytics';

export function BuilderPerformanceTable({ data }: { data: BuilderPerformance[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-neutral-500 dark:text-neutral-400">No builders yet.</p>;
  }

  return (
    <table className="w-full text-sm">
      <thead className="text-left text-neutral-500 dark:text-neutral-400">
        <tr>
          <th className="pb-2 font-medium">Builder</th>
          <th className="pb-2 font-medium">Projects</th>
          <th className="pb-2 font-medium">Commission</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
        {data.map((b) => (
          <tr key={b.name}>
            <td className="py-2 font-medium text-neutral-900 dark:text-white">{b.name}</td>
            <td className="py-2 text-neutral-600 dark:text-neutral-300">{b.projectCount}</td>
            <td className="py-2 text-neutral-600 dark:text-neutral-300">{b.commissionPercent}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}