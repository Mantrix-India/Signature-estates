'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { Builder, BuilderFilters } from '@/types/builder';
import { listBuildersRequest } from '@/lib/api/builder-api';
import { BuilderCard } from '@/components/builders/builder-card';

export default function BuildersPage() {
  const [builders, setBuilders] = useState<Builder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<BuilderFilters>({ page: 1 });

  const fetchBuilders = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await listBuildersRequest(filters);
      setBuilders(result.builders);
    } catch {
      toast.error('Failed to load builders');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchBuilders();
  }, [fetchBuilders]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Builders</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Manage developer partners and their projects
          </p>
        </div>
        <Link
          href="/dashboard/builders/new"
          className="flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          <Plus size={16} /> New Builder
        </Link>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          placeholder="Search builders..."
          value={filters.search || ''}
          onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
          className="w-full rounded-lg border border-neutral-200 bg-white py-2 pl-9 pr-3 text-sm text-neutral-900 outline-none focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900" />
          ))}
        </div>
      ) : builders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 py-16 text-center dark:border-neutral-700">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No builders yet. Add your first developer partner.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {builders.map((builder) => (
            <BuilderCard key={builder.id} builder={builder} />
          ))}
        </div>
      )}
    </div>
  );
}