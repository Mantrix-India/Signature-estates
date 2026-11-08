"use client";

import { useEffect, useState, useCallback } from 'react';
import {
  Phone,
  Mail,
  Users,
  MapPin,
  RefreshCw,
  StickyNote,
  Circle,
  Activity,
  Globe,
  type LucideIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { TimelineItem, TimelineSource } from '@/types/timeline';
import { getClientTimelineRequest } from '@/lib/api/client-api';

const typeIcons: Record<string, LucideIcon> = {
  CALL: Phone,
  EMAIL: Mail,
  MEETING: Users,
  SITE_VISIT: MapPin,
  STATUS_CHANGE: RefreshCw,
  NOTE: StickyNote,
  OTHER: Circle,
};

const sourceMeta: Record<TimelineSource, { label: string; icon: LucideIcon; dot: string }> = {
  CLIENT_TIMELINE: { label: 'CRM', icon: StickyNote, dot: 'bg-neutral-400' },
  LEAD_ACTIVITY: { label: 'Lead', icon: Activity, dot: 'bg-blue-500' },
  CLIENT_ACTIVITY: { label: 'Portal', icon: Globe, dot: 'bg-emerald-500' },
  SITE_VISIT: { label: 'Visit', icon: MapPin, dot: 'bg-amber-500' },
};

const FILTERS: { value: TimelineSource | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'CLIENT_TIMELINE', label: 'CRM' },
  { value: 'LEAD_ACTIVITY', label: 'Leads' },
  { value: 'CLIENT_ACTIVITY', label: 'Portal' },
  { value: 'SITE_VISIT', label: 'Visits' },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function TimelineFeed({ clientId }: { clientId: string }) {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [source, setSource] = useState<TimelineSource | 'ALL'>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  const fetchTimeline = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getClientTimelineRequest(clientId, {
        limit: 100,
        ...(source !== 'ALL' ? { source } : {}),
      });
      setItems(result.items);
    } catch {
      toast.error('Failed to load activity');
    } finally {
      setIsLoading(false);
    }
  }, [clientId, source]);

  useEffect(() => {
    fetchTimeline();
  }, [fetchTimeline]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setSource(f.value)}
            className={
              'rounded-full px-3 py-1 text-xs font-medium transition-colors ' +
              (source === f.value
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700')
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Loading activity...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">No activity yet.</p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const meta = sourceMeta[item.source];
            const Icon = typeIcons[item.type] || meta.icon;
            return (
              <div key={`${item.source}-${item.id}`} className="flex gap-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                  <Icon size={13} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-neutral-900 dark:text-white">{item.description}</p>
                    <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                      <span className={'h-1.5 w-1.5 rounded-full ' + meta.dot} />
                      {meta.label}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-neutral-400 dark:text-neutral-500">
                    {(item.actor?.fullName ?? 'Client')} · {formatDate(item.at)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}