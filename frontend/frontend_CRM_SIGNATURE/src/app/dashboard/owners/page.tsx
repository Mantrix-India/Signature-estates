'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, X, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { Owner, OwnerFormValues } from '@/types/owner';
import { listOwnersRequest, createOwnerRequest } from '@/lib/api/owner-api';
import { OwnerCard } from '@/components/owners/owner-card';
import { OwnerForm } from '@/components/owners/owner-form';

export default function OwnersPage() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');

  const fetchOwners = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await listOwnersRequest({ search: search || undefined, limit: 100 });
      setOwners(result.owners);
    } catch {
      toast.error('Failed to load owners');
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchOwners, 250);
    return () => clearTimeout(t);
  }, [fetchOwners]);

  async function handleCreate(values: OwnerFormValues) {
    try {
      await createOwnerRequest(values);
      toast.success('Owner added');
      setShowForm(false);
      fetchOwners();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to add owner');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Owners</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Property owners and their listings</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Cancel' : 'New Owner'}
        </button>
      </div>

      {showForm && (
        <div className="mx-auto max-w-lg rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
          <OwnerForm submitLabel="Add owner" onSubmit={handleCreate} />
        </div>
      )}

      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search owners..."
          className="w-full rounded-lg border border-neutral-200 bg-white py-2 pl-9 pr-3 text-sm text-neutral-900 outline-none focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900" />
          ))}
        </div>
      ) : owners.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 py-16 text-center dark:border-neutral-700">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">No owners yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {owners.map((owner) => (
            <OwnerCard key={owner.id} owner={owner} />
          ))}
        </div>
      )}
    </div>
  );
}