import { cn } from '@/lib/utils';
import { SiteVisitStatus } from '@/types/siteVisit';

const statusStyles: Record<SiteVisitStatus, string> = {
  SCHEDULED: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  CONFIRMED: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  COMPLETED: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
  CANCELLED: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
  RESCHEDULED: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
};

export function SiteVisitStatusBadge({ status }: { status: SiteVisitStatus }) {
  return (
    <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium', statusStyles[status])}>
      {status}
    </span>
  );
}