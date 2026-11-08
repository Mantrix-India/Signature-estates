'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { LeadBoard, LeadStage, Lead } from '@/types/lead';
import { LEAD_STAGES } from '@/lib/leads';
import { getLeadBoardRequest, updateLeadStageRequest } from '@/lib/api/lead-api';
import { KanbanColumn } from '@/components/leads/kanban-column';
import { useAuth } from '@/context/auth-context';

type Scope = 'all' | 'mine';

export default function LeadsPage() {
  const { user } = useAuth();
  const [board, setBoard] = useState<LeadBoard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scope, setScope] = useState<Scope>('all');
  const [query, setQuery] = useState('');
  const draggedLeadId = useRef<string | null>(null);

  const fetchBoard = useCallback(async () => {
    try {
      const result = await getLeadBoardRequest();
      setBoard(result);
    } catch {
      toast.error('Failed to load leads');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  async function handleDrop(stage: LeadStage) {
    const leadId = draggedLeadId.current;
    draggedLeadId.current = null;
    if (!leadId || !board) return;

    const currentStage = LEAD_STAGES.find((s) =>
      board[s].some((l) => l.id === leadId)
    );
    if (!currentStage || currentStage === stage) return;

    const lead = board[currentStage].find((l) => l.id === leadId)!;

    // Optimistic move — rolled back by a refetch if the PATCH fails.
    setBoard({
      ...board,
      [currentStage]: board[currentStage].filter((l) => l.id !== leadId),
      [stage]: [{ ...lead, stage }, ...board[stage]],
    });

    try {
      await updateLeadStageRequest(leadId, stage);
      toast.success(`Moved to ${stage}`);
    } catch {
      toast.error('Failed to update stage');
      fetchBoard();
    }
  }

  // Filters run on the already-loaded board so dragging stays instant.
  const visibleBoard = useMemo(() => {
    if (!board) return null;

    const needle = query.trim().toLowerCase();

    function keep(lead: Lead) {
      if (scope === 'mine' && lead.assignedToId !== user?.id) return false;
      if (!needle) return true;

      return (
        lead.client.fullName.toLowerCase().includes(needle) ||
        lead.client.phone.toLowerCase().includes(needle) ||
        (lead.property?.title.toLowerCase().includes(needle) ?? false)
      );
    }

    return LEAD_STAGES.reduce((acc, stage) => {
      acc[stage] = (board[stage] ?? []).filter(keep);
      return acc;
    }, {} as LeadBoard);
  }, [board, scope, query, user?.id]);

  const totals = useMemo(() => {
    if (!board) return { all: 0, mine: 0 };

    let all = 0;
    let mine = 0;

    for (const stage of LEAD_STAGES) {
      for (const lead of board[stage] ?? []) {
        all += 1;
        if (lead.assignedToId === user?.id) mine += 1;
      }
    }

    return { all, mine };
  }, [board, user?.id]);

  if (isLoading || !visibleBoard) {
    return (
      <div className="flex gap-4 overflow-hidden">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-[420px] w-72 shrink-0 animate-pulse rounded-2xl border border-hairline bg-surface-muted"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-5">
      {/* ---------- header ---------- */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow">Lead desk / {totals.all} total</span>

          <h1 className="font-display mt-2 text-[28px] font-semibold leading-tight text-neutral-900 dark:text-white">
            Move the right conversation forward
            <span className="text-brand-500">.</span>
          </h1>

          <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
            Drag a card between stages to update the pipeline instantly.
          </p>
        </div>

        <Link
          href="/dashboard/leads/new"
          className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-[var(--shadow-lift)] transition-colors hover:bg-brand-600"
        >
          <Plus size={17} /> New lead
        </Link>
      </div>

      {/* ---------- toolbar ---------- */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {(
            [
              ['all', 'All leads', totals.all],
              ['mine', 'My leads', totals.mine],
            ] as const
          ).map(([value, label, count]) => (
            <button
              key={value}
              onClick={() => setScope(value)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                scope === value
                  ? 'border-transparent bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                  : 'border-hairline text-neutral-600 hover:bg-surface-muted dark:text-neutral-300'
              }`}
            >
              {label}
              <b
                className={`tabular text-xs ${
                  scope === value
                    ? 'opacity-70'
                    : 'text-neutral-400 dark:text-neutral-500'
                }`}
              >
                {count}
              </b>
            </button>
          ))}
        </div>

        <label className="flex w-full items-center gap-2 rounded-lg border border-hairline bg-surface px-3 py-1.5 sm:w-72">
          <Search size={15} className="shrink-0 text-neutral-400" />

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, phone, property..."
            className="min-w-0 flex-1 bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400 dark:text-white"
          />

          {query && (
            <button
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="shrink-0 text-neutral-400 transition-colors hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <X size={14} />
            </button>
          )}
        </label>
      </div>

      {/* ---------- board ---------- */}
      <div className="scrollbar-slim flex flex-1 gap-4 overflow-x-auto pb-4">
        {LEAD_STAGES.map((stage) => (
          <KanbanColumn
            key={stage}
            stage={stage}
            leads={visibleBoard[stage]}
            onDragStart={(id) => (draggedLeadId.current = id)}
            onDrop={handleDrop}
          />
        ))}
      </div>
    </div>
  );
}
