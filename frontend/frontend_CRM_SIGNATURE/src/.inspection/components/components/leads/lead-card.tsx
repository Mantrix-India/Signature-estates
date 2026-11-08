'use client';

import Link from 'next/link';
import { User, Home } from 'lucide-react';
import { Lead } from '@/types/lead';

export function LeadCard({ lead, onDragStart }: { lead: Lead; onDragStart: (id: string) => void }) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(lead.id)}
      className="cursor-grab rounded-lg border border-neutral-200 bg-white p-3 text-sm shadow-sm transition-shadow hover:shadow active:cursor-grabbing dark:border-neutral-800 dark:bg-neutral-900"
    >
      <Link href={`/dashboard/leads/${lead.id}`} className="block">
        <p className="font-medium text-neutral-900 dark:text-white">{lead.client.fullName}</p>
        <p className="mt-1 flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
          <User size={11} /> {lead.assignedTo.fullName}
        </p>
        {lead.property && (
          <p className="mt-1 flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
            <Home size={11} /> {lead.property.title}
          </p>
        )}
        {lead.leadSource && (
          <span className="mt-2 inline-block rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
            {lead.leadSource.name}
          </span>
        )}
      </Link>
    </div>
  );
}