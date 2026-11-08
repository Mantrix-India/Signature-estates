import { Phone, Mail, Users, MapPin, RefreshCw, StickyNote, Circle } from 'lucide-react';
import { ClientTimelineEvent } from '@/types/client';

const eventIcons: Record<string, typeof Phone> = {
  CALL: Phone,
  EMAIL: Mail,
  MEETING: Users,
  SITE_VISIT: MapPin,
  STATUS_CHANGE: RefreshCw,
  NOTE: StickyNote,
  OTHER: Circle,
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function TimelineFeed({ events }: { events: ClientTimelineEvent[] }) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-neutral-500 dark:text-neutral-400">No activity yet.</p>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => {
        const Icon = eventIcons[event.eventType] || Circle;
        return (
          <div key={event.id} className="flex gap-3">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
              <Icon size={13} />
            </div>
            <div>
              <p className="text-sm text-neutral-900 dark:text-white">{event.description}</p>
              <p className="mt-0.5 text-xs text-neutral-400 dark:text-neutral-500">
                {event.createdBy.fullName} · {formatDate(event.createdAt)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}