'use client';

import { useState } from 'react';
import { Lead, LeadStage } from '@/types/lead';
import { STAGE_LABELS, STAGE_COLORS } from '@/lib/leads';
import { LeadCard } from './lead-card';

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
  const [isOver, setIsOver] = useState(false);
  const tone = STAGE_COLORS[stage];

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={() => {
        setIsOver(false);
        onDrop(stage);
      }}
      className={`flex w-72 shrink-0 flex-col rounded-2xl border bg-surface-muted/70 p-3 transition-colors ${
        isOver
          ? 'border-brand-400 bg-brand-50/60 dark:bg-brand-900/20'
          : 'border-hairline'
      }`}
    >
      {/* column head */}
      <div className="mb-3 flex items-center justify-between gap-2 px-1">
        <div className="flex min-w-0 items-center gap-2">
          <i
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: tone }}
          />

          <h3 className="truncate text-sm font-semibold text-neutral-700 dark:text-neutral-200">
            {STAGE_LABELS[stage]}
          </h3>
        </div>

        <span
          className="tabular shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium"
          style={{ backgroundColor: `${tone}1f`, color: tone }}
        >
          {leads.length}
        </span>
      </div>

      {/* cards */}
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} onDragStart={onDragStart} />
        ))}

        {leads.length === 0 && (
          <div className="rounded-xl border border-dashed border-neutral-300 py-7 text-center text-xs text-neutral-400 dark:border-neutral-700">
            No leads
          </div>
        )}
      </div>
    </div>
  );
}
