'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { LeadBoard, LeadStage } from '@/types/lead';
import { getLeadBoardRequest, updateLeadStageRequest } from '@/lib/api/lead-api';
import { KanbanColumn } from '@/components/leads/kanban-column';

const stages: LeadStage[] = ['NEW', 'CONTACTED', 'QUALIFIED', 'NEGOTIATION', 'WON', 'LOST'];

export default function LeadsPage() {
  const [board, setBoard] = useState<LeadBoard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
    if (!leadId || !board) return;

    const currentStage = stages.find((s) => board[s].some((l) => l.id === leadId));
    if (currentStage === stage) return;

    const lead = board[currentStage!].find((l) => l.id === leadId)!;
    setBoard({
      ...board,
      [currentStage!]: board[currentStage!].filter((l) => l.id !== leadId),
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

  if (isLoading || !board) {
    return <p className="text-sm text-neutral-500 dark:text-neutral-400">Loading...</p>;
  }

  return (
    <div className="flex h-full flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Leads</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Drag cards between stages to update the pipeline
          </p>
        </div>
        <Link
          href="/dashboard/leads/new"
          className="flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          <Plus size={16} /> New Lead
        </Link>
      </div>

      <div className="flex flex-1 gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => (
          <KanbanColumn
            key={stage}
            stage={stage}
            leads={board[stage]}
            onDragStart={(id) => (draggedLeadId.current = id)}
            onDrop={handleDrop}
          />
        ))}
      </div>
    </div>
  );
}