'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import { Owner } from '@/types/owner';
import { Property } from '@/types/property';
import { linkPropertyRequest, unlinkPropertyRequest } from '@/lib/api/owner-api';

const inputClass =
  'w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white';

export function LinkPropertyPanel({
  owner,
  allProperties,
  onRefresh,
}: {
  owner: Owner;
  allProperties: Property[];
  onRefresh: () => void;
}) {
  const linked = owner.properties ?? [];
  const linkedIds = new Set(linked.map((p) => p.id));
  const available = allProperties.filter((p) => !linkedIds.has(p.id));
  const [selected, setSelected] = useState('');
  const [busy, setBusy] = useState(false);

  async function link() {
    if (!selected) return;
    setBusy(true);
    try {
      await linkPropertyRequest(owner.id, selected);
      toast.success('Property linked');
      setSelected('');
      onRefresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to link property');
    } finally {
      setBusy(false);
    }
  }

  async function unlink(propertyId: string) {
    try {
      await unlinkPropertyRequest(owner.id, propertyId);
      toast.success('Property unlinked');
      onRefresh();
    } catch {
      toast.error('Failed to unlink property');
    }
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Linked properties</h3>

      <div className="mt-4 space-y-2">
        {linked.length === 0 && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400">No properties linked to this owner.</p>
        )}
        {linked.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-neutral-100 px-3 py-2 dark:border-neutral-800"
          >
            <span className="truncate text-sm text-neutral-900 dark:text-white">{p.title}</span>
            <button
              onClick={() => unlink(p.id)}
              aria-label="Unlink property"
              className="text-neutral-400 transition-colors hover:text-red-500"
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2 border-t border-neutral-100 pt-4 dark:border-neutral-800">
        <select value={selected} onChange={(e) => setSelected(e.target.value)} className={inputClass}>
          <option value="">Select a property to link</option>
          {available.map((p) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
        <button
          onClick={link}
          disabled={busy || !selected}
          className="shrink-0 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          Link
        </button>
      </div>
    </div>
  );
}