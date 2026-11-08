'use client';

import { useState } from 'react';
import { Deal, DealStage } from '@/types/deal';
import { ALLOWED_DEAL_TRANSITIONS, DEAL_STAGE_LABELS, DEAL_STAGE_COLORS } from '@/lib/deals';

export function StageTransition({
  deal,
  onTransition,
}: {
  deal: Deal;
  onTransition: (stage: DealStage, cancelReason?: string) => Promise<void>;
}) {
  const [pendingCancel, setPendingCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [busy, setBusy] = useState(false);

  const allowed = ALLOWED_DEAL_TRANSITIONS[deal.stage];

  async function go(stage: DealStage) {
    if (stage === 'CANCELLED' && !cancelReason.trim()) {
      setPendingCancel(true);
      return;
    }
    setBusy(true);
    try {
      await onTransition(stage, stage === 'CANCELLED' ? cancelReason.trim() : undefined);
      setPendingCancel(false);
      setCancelReason('');
    } finally {
      setBusy(false);
    }
  }

  if (allowed.length === 0) {
    return (
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        This deal is in a terminal stage ({DEAL_STAGE_LABELS[deal.stage]}). No further transitions.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {allowed.map((stage) => {
          const color = DEAL_STAGE_COLORS[stage];
          return (
            <button
              key={stage}
              onClick={() => go(stage)}
              disabled={busy}
              className="rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50"
              style={{ borderColor: `${color}55`, color }}
            >
              Move to {DEAL_STAGE_LABELS[stage]}
            </button>
          );
        })}
      </div>

      {pendingCancel && (
        <div className="space-y-2 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-500/30 dark:bg-red-500/10">
          <label className="block text-xs font-medium text-red-700 dark:text-red-400">
            Reason for cancellation (required)
          </label>
          <input
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            className="w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-red-400 dark:border-red-500/30 dark:bg-neutral-950 dark:text-white"
            placeholder="Why is this deal being cancelled?"
          />
          <button
            onClick={() => go('CANCELLED')}
            disabled={busy || !cancelReason.trim()}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            Confirm cancellation
          </button>
        </div>
      )}
    </div>
  );
}