'use client';

import { useState } from 'react';
import { PropertyStatus } from '@/types/property';
import { InventorySource } from '@/types/inventory';

const statuses: PropertyStatus[] = ['AVAILABLE', 'RESERVED', 'BOOKED', 'SOLD'];

export function StatusUpdateForm({
  currentStatus,
  onSubmit,
}: {
  currentStatus: PropertyStatus;
  onSubmit: (status: PropertyStatus, source: InventorySource, note: string) => Promise<void>;
}) {
  const [status, setStatus] = useState<PropertyStatus>(currentStatus);
  const [source, setSource] = useState<InventorySource>('AGENT');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === currentStatus) return;
    setIsSubmitting(true);
    try {
      await onSubmit(status, source, note);
      setNote('');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400">
            New status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as PropertyStatus)}
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Reported by
          </label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value as InventorySource)}
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
          >
            <option value="AGENT">Agent (me)</option>
            <option value="BUILDER">Builder reported</option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400">
          Note (optional)
        </label>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Client paid token amount"
          className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting || status === currentStatus}
        className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
      >
        {isSubmitting ? 'Updating...' : 'Update Status'}
      </button>
    </form>
  );
}