'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ProjectInventory } from '@/types/inventory';
import { getProjectInventoryRequest, bulkUpdateStatusRequest } from '@/lib/api/inventory-api';
import { InventorySummaryCards } from '@/components/inventory/inventory-summary-cards';

const statusStyles: Record<string, string> = {
  AVAILABLE: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  RESERVED: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  BOOKED: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  SOLD: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
};

function formatPrice(price: number) {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
  return `₹${price.toLocaleString('en-IN')}`;
}

export default function ProjectInventoryPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [inventory, setInventory] = useState<ProjectInventory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState('SOLD');

  const fetchData = useCallback(async () => {
    try {
      const data = await getProjectInventoryRequest(params.id);
      setInventory(data);
    } catch {
      toast.error('Project not found');
      router.push('/dashboard/builders');
    } finally {
      setIsLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function toggleSelect(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  }

  async function handleBulkUpdate() {
    if (selectedIds.length === 0) {
      toast.error('Select at least one property');
      return;
    }
    try {
      const results = await bulkUpdateStatusRequest(
        selectedIds.map((id) => ({ propertyId: id, status: bulkStatus })),
        'BUILDER',
        'Bulk update from project inventory page'
      );
      const failed = results.filter((r) => !r.success);
      if (failed.length > 0) {
        toast.error(`${failed.length} update(s) failed`);
      } else {
        toast.success('Inventory updated');
      }
      setSelectedIds([]);
      fetchData();
    } catch {
      toast.error('Bulk update failed');
    }
  }

  if (isLoading) {
    return <p className="text-sm text-neutral-500 dark:text-neutral-400">Loading...</p>;
  }

  if (!inventory) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
          {inventory.projectName}
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {inventory.total} total units
        </p>
      </div>

      <InventorySummaryCards summary={inventory.summary} />

      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <span className="text-sm text-neutral-600 dark:text-neutral-300">
            {selectedIds.length} selected —
          </span>
          <select
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value)}
            className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-900 outline-none focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
          >
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="RESERVED">RESERVED</option>
            <option value="BOOKED">BOOKED</option>
            <option value="SOLD">SOLD</option>
          </select>
          <button
            onClick={handleBulkUpdate}
            className="rounded-lg bg-neutral-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            Apply (Builder Reported)
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
            <tr>
              <th className="w-10 px-4 py-3"></th>
              <th className="px-4 py-3 font-medium">Unit</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {inventory.properties.map((p) => (
              <tr key={p.id} className="bg-white dark:bg-neutral-950">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(p.id)}
                    onChange={() => toggleSelect(p.id)}
                    className="h-4 w-4 accent-neutral-900 dark:accent-white"
                  />
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/dashboard/properties/${p.id}`}
                    className="font-medium text-neutral-900 hover:underline dark:text-white"
                  >
                    {p.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">
                  {formatPrice(p.price)}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[p.status]}`}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}