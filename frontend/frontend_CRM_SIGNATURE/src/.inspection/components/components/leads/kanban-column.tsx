'use client';

import { Lead, LeadStage } from '@/types/lead';
import { LeadCard } from './lead-card';

const stageLabels: Record<LeadStage, string> = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  QUALIFIED: 'Qualified',
  NEGOTIATION: 'Negotiation',
  WON: 'Won',
  LOST: 'Lost',
};

export function KanbanColumn({
  stage,
  leads,
  onDragStart,
  onDrop,
}: {
  stage: LeadStage;
  leads: Lead[];
  onDragStart: (id: string) => void;
  onDrop: (stage: LeadStage) => void;
}) {
  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => onDrop(stage)}
      className="flex w-72 shrink-0 flex-col rounded-xl bg-neutral-100/60 p-3 dark:bg-neutral-900/60"
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
          {stageLabels[stage]}
        </h3>
        <span className="text-xs text-neutral-400">{leads.length}</span>
      </div>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} onDragStart={onDragStart} />
        ))}
        {leads.length === 0 && (
          <div className="rounded-lg border border-dashed border-neutral-300 py-6 text-center text-xs text-neutral-400 dark:border-neutral-700">
            No leads
          </div>
        )}
      </div>
    </div>
  );
}