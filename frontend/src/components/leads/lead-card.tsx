'use client';

import Link from 'next/link';
import { Home, User } from 'lucide-react';
import { Lead } from '@/types/lead';
import { STAGE_COLORS } from '@/lib/leads';
import { formatPrice } from '@/lib/format';

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function shortTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);

  if (mins < 60) return `${Math.max(mins, 1)}m`;

  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h`;

  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d`;

  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
  });
}

export function LeadCard({
  lead,
  onDragStart,
}: {
  lead: Lead;
  onDragStart: (id: string) => void;
}) {
  const tone = STAGE_COLORS[lead.stage];

  return (
    <div
      draggable
      onDragStart={() => onDragStart(lead.id)}
      className="cursor-grab rounded-xl border border-hairline bg-surface p-3 shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-lift)] active:cursor-grabbing"
    >
      <Link href={`/dashboard/leads/${lead.id}`} className="block">
        <div className="flex items-start justify-between gap-2">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
            style={{ backgroundColor: `${tone}22`, color: tone }}
          >
            {initials(lead.client.fullName)}
          </span>

          <span className="tabular shrink-0 text-[11px] text-neutral-400">
            {shortTime(lead.createdAt)}
          </span>
        </div>

        <p className="mt-2 truncate text-sm font-medium text-neutral-900 dark:text-white">
          {lead.client.fullName}
        </p>

        <p className="mt-1 flex items-center gap-1 truncate text-xs text-neutral-500 dark:text-neutral-400">
          <User size={11} className="shrink-0" />
          {lead.assignedTo.fullName}
        </p>

        {lead.property && (
          <p className="mt-1 flex items-center gap-1 truncate text-xs text-neutral-500 dark:text-neutral-400">
            <Home size={11} className="shrink-0" />
            <span className="truncate">{lead.property.title}</span>
          </p>
        )}

        <div className="mt-2.5 flex items-center justify-between gap-2">
          {lead.leadSource ? (
            <span className="truncate rounded-full bg-surface-muted px-2 py-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
              {lead.leadSource.name}
            </span>
          ) : (
            <span />
          )}

          {lead.property && (
            <span className="tabular shrink-0 text-[11px] font-medium text-neutral-600 dark:text-neutral-300">
              {formatPrice(lead.property.price)}
            </span>
          )}
        </div>
      </Link>
    </div>
  );
}
