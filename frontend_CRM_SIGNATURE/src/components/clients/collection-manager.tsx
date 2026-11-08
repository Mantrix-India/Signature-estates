'use client';

import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { FolderPlus } from 'lucide-react';
import { Collection } from '@/types/collection';
import {
  listCollectionsRequest,
  createCollectionRequest,
} from '@/lib/api/collection-api';
import { CollectionCard } from './collection-card';
import { PropertyPicker } from './property-picker';

const inputClass =
  'w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white';
const labelClass = 'mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300';

function toExpiryIso(dateStr: string): string | undefined {
  if (!dateStr) return undefined;
  return new Date(`${dateStr}T23:59:59`).toISOString();
}

export function CollectionManager({ clientId }: { clientId: string }) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [includeArchived, setIncludeArchived] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [expiry, setExpiry] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCollections = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await listCollectionsRequest(clientId, includeArchived);
      setCollections(data);
    } catch {
      toast.error('Failed to load collections');
    } finally {
      setIsLoading(false);
    }
  }, [clientId, includeArchived]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  function resetForm() {
    setName('');
    setDescription('');
    setExpiry('');
    setSelectedIds([]);
    setShowCreate(false);
  }

  async function handleCreate() {
    if (!name.trim()) {
      toast.error('Collection name is required');
      return;
    }
    setIsSubmitting(true);
    try {
      await createCollectionRequest({
        clientId,
        name: name.trim(),
        description: description.trim() || undefined,
        propertyIds: selectedIds,
        expiresAt: toExpiryIso(expiry),
      });
      toast.success('Collection created');
      resetForm();
      fetchCollections();
    } catch {
      toast.error('Failed to create collection');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-white">
          <FolderPlus size={14} /> Collections
        </h2>
        <button
          onClick={() => setShowCreate((v) => !v)}
          className="text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
        >
          {showCreate ? 'Cancel' : '+ New collection'}
        </button>
      </div>

      {showCreate && (
        <div className="mt-4 space-y-3 rounded-lg bg-neutral-50 p-4 dark:bg-neutral-800/50">
          <div>
            <label className={labelClass}>Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Rahul Shortlist"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Description (optional)</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="3 picks in Kharar"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Access expires (optional)</label>
            <input
              type="date"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Properties ({selectedIds.length} selected)</label>
            <PropertyPicker
              selectedIds={selectedIds}
              onToggle={(propertyId) =>
                setSelectedIds((prev) =>
                  prev.includes(propertyId)
                    ? prev.filter((id) => id !== propertyId)
                    : [...prev, propertyId]
                )
              }
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={resetForm}
              className="flex-1 rounded-lg border border-neutral-200 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-neutral-900 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              {isSubmitting ? 'Creating...' : 'Create collection'}
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-end">
        <label className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
          <input
            type="checkbox"
            checked={includeArchived}
            onChange={(e) => setIncludeArchived(e.target.checked)}
            className="rounded border-neutral-300 dark:border-neutral-700"
          />
          Show archived
        </label>
      </div>

      <div className="mt-2 space-y-3">
        {isLoading ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Loading...</p>
        ) : collections.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No collections yet. Create one to share a curated set of properties.
          </p>
        ) : (
          collections.map((c) => (
            <CollectionCard key={c.id} collection={c} onChanged={fetchCollections} />
          ))
        )}
      </div>
    </div>
  );
}