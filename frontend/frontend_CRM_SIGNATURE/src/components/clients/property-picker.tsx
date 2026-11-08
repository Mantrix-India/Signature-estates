'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, Check } from 'lucide-react';
import { listPropertiesRequest } from '@/lib/api/property-api';
import { Property } from '@/types/property';
import { formatPrice } from '@/lib/format';

const inputClass =
  'w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 pl-9 text-sm text-neutral-900 outline-none focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white';

export function PropertyPicker({
  selectedIds,
  onToggle,
}: {
  selectedIds: string[];
  onToggle: (propertyId: string) => void;
}) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchProperties = useCallback(async (searchTerm: string) => {
    setIsLoading(true);
    try {
      const result = await listPropertiesRequest({ search: searchTerm || undefined, limit: 50 });
      setProperties(result.properties);
    } catch {
      setProperties([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties('');
  }, [fetchProperties]);

  return (
    <div>
      <div className="relative">
        <Search
          size={15}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              fetchProperties(search);
            }
          }}
          placeholder="Search properties, then Enter"
          className={inputClass}
        />
      </div>

      <div className="mt-3 max-h-64 space-y-2 overflow-y-auto">
        {isLoading ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Loading...</p>
        ) : properties.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">No properties found.</p>
        ) : (
          properties.map((p) => {
            const selected = selectedIds.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onToggle(p.id)}
                className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition ${
                  selected
                    ? 'border-neutral-900 bg-neutral-50 dark:border-white dark:bg-neutral-800'
                    : 'border-neutral-200 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800'
                }`}
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium text-neutral-900 dark:text-white">
                    {p.title}
                  </span>
                  <span className="block truncate text-xs text-neutral-500 dark:text-neutral-400">
                    {p.city} · {formatPrice(p.price)}
                  </span>
                </span>
                <span
                  className={`ml-3 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                    selected
                      ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900'
                      : 'border-neutral-300 dark:border-neutral-700'
                  }`}
                >
                  {selected && <Check size={12} />}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}