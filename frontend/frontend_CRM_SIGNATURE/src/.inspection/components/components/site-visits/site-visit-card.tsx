import Link from 'next/link';
import { Clock, User, MapPin, Check } from 'lucide-react';
import { SiteVisit } from '@/types/siteVisit';
import { SiteVisitStatusBadge } from './status-badge';

export function SiteVisitCard({ siteVisit }: { siteVisit: SiteVisit }) {
  const time = new Date(siteVisit.scheduledAt).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Link
      href={`/dashboard/site-visits/${siteVisit.id}`}
      className="block rounded-xl border border-neutral-200 bg-white p-4 transition-shadow hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-neutral-900 dark:text-white">
          <Clock size={14} className="text-neutral-400" />
          {time}
        </div>
        <SiteVisitStatusBadge status={siteVisit.status} />
      </div>

      <p className="mt-2 flex items-center gap-1.5 text-sm text-neutral-700 dark:text-neutral-300">
        <MapPin size={13} /> {siteVisit.property.title}
      </p>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
        <User size={13} /> {siteVisit.client.fullName} · {siteVisit.assignedTo.fullName}
      </p>

      <div className="mt-2 flex gap-3 text-xs text-neutral-400">
        <span className="flex items-center gap-1">
          <Check size={11} className={siteVisit.clientConfirmed ? 'text-emerald-500' : ''} />
          Client {siteVisit.clientConfirmed ? 'confirmed' : 'pending'}
        </span>
        <span className="flex items-center gap-1">
          <Check size={11} className={siteVisit.builderConfirmed ? 'text-emerald-500' : ''} />
          Builder {siteVisit.builderConfirmed ? 'confirmed' : 'pending'}
        </span>
      </div>
    </Link>
  );
}