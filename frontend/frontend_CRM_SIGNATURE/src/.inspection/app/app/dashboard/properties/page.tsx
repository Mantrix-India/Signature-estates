'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Scale } from 'lucide-react';
import toast from 'react-hot-toast';
import { Property, PropertyFilters } from '@/types/property';
import { listPropertiesRequest, deletePropertyRequest } from '@/lib/api/property-api';
import { PropertyCard } from '@/components/properties/property-card';
import { PropertyFiltersBar } from '@/components/properties/property-filters';
import { AiSearchBar } from '@/components/ai/ai-search-bar';

export default function PropertiesPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<PropertyFilters>({ page: 1 });
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const fetchProperties = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await listPropertiesRequest(filters);
      setProperties(result.properties);
      setTotalPages(result.pagination.totalPages);
    } catch {
      toast.error('Failed to load properties');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  async function handleDelete(id: string) {
    if (!confirm('Delete this property? This cannot be undone.')) return;
    try {
      await deletePropertyRequest(id);
      toast.success('Property deleted');
      fetchProperties();
    } catch {
      toast.error('Failed to delete property');
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id);
      if (prev.length >= 4) {
        toast.error('You can compare up to 4 properties at a time');
        return prev;
      }
      return [...prev, id];
    });
  }

  function handleCompare() {
    if (selectedIds.length < 2) {
      toast.error('Select at least 2 properties to compare');
      return;
    }
    router.push(`/dashboard/properties/compare?ids=${selectedIds.join(',')}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Properties</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Manage your property listings
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <button
              onClick={handleCompare}
              className="flex items-center gap-2 rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              <Scale size={16} /> Compare ({selectedIds.length})
            </button>
          )}
          <Link
            href="/dashboard/properties/new"
            className="flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            <Plus size={16} /> New Property
          </Link>
        </div>
      </div>

      <AiSearchBar />

      <PropertyFiltersBar filters={filters} onChange={setFilters} />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-52 animate-pulse rounded-xl border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900"
            />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 py-16 text-center dark:border-neutral-700">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No properties found. Add your first listing to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <div key={property.id} className="relative">
              <label className="absolute left-3 top-3 z-10 flex h-5 w-5 cursor-pointer items-center justify-center rounded border border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-900">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(property.id)}
                  onChange={() => toggleSelect(property.id)}
                  className="h-4 w-4 cursor-pointer accent-neutral-900 dark:accent-white"
                />
              </label>
              <PropertyCard property={property} onDelete={handleDelete} />
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setFilters((f) => ({ ...f, page: p }))}
              className={`h-8 w-8 rounded-lg text-sm ${
                filters.page === p
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                  : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-900'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}