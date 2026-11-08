'use client';

import { Search } from 'lucide-react';
import { PropertyFilters, PropertyStatus } from '@/types/property';

const statuses: PropertyStatus[] = ['AVAILABLE', 'RESERVED', 'BOOKED', 'SOLD'];

export function PropertyFiltersBar({
  filters,
  onChange,
}: {
  filters: PropertyFilters;
  onChange: (filters: PropertyFilters) => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
        />
        <input
          type="text"
          placeholder="Search by title or address..."
          value={filters.search || ''}
          onChange={(e) => onChange({ ...filters, search: e.target.value, page: 1 })}
          className="w-full rounded-lg border border-neutral-200 bg-white py-2 pl-9 pr-3 text-sm text-neutral-900 outline-none focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
        />
      </div>

      <select
        value={filters.status || ''}
        onChange={(e) =>
          onChange({
            ...filters,
            status: (e.target.value || undefined) as PropertyStatus | undefined,
            page: 1,
          })
        }
        className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
      >
        <option value="">All statuses</option>
        {statuses.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </div>
  );
}