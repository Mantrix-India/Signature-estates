import { ArrowRight } from 'lucide-react';
import { InventoryStatusLog } from '@/types/inventory';

export function StatusHistoryTimeline({ logs }: { logs: InventoryStatusLog[] }) {
  if (logs.length === 0) {
    return <p className="text-sm text-neutral-500 dark:text-neutral-400">No status changes yet.</p>;
  }

  return (
    <div className="space-y-3">
      {logs.map((log) => (
        <div key={log.id} className="flex items-start gap-3 text-sm">
          <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-neutral-300 dark:bg-neutral-600" />
          <div>
            <p className="flex items-center gap-1.5 text-neutral-900 dark:text-white">
              {log.previousStatus} <ArrowRight size={12} /> <span className="font-medium">{log.newStatus}</span>
              {log.source === 'BUILDER' && (
                <span className="ml-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                  Builder reported
                </span>
              )}
            </p>
            {log.note && (
              <p className="mt-0.5 text-neutral-500 dark:text-neutral-400">{log.note}</p>
            )}
            <p className="mt-0.5 text-xs text-neutral-400 dark:text-neutral-500">
              {log.changedBy.fullName} ·{' '}
              {new Date(log.createdAt).toLocaleString('en-IN', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}