import { cn } from '@/lib/utils';
import { ClientStatus } from '@/types/client';

const statusStyles: Record<ClientStatus, string> = {
  NEW: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
  CONTACTED: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  QUALIFIED: 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400',
  NEGOTIATION: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  CONVERTED: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  LOST: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
};

export function ClientStatusBadge({ status }: { status: ClientStatus }) {
  return (
    <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium', statusStyles[status])}>
      {status}
    </span>
  );
}