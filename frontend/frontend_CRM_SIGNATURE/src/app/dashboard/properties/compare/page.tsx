'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Property } from '@/types/property';
import { comparePropertiesRequest } from '@/lib/api/property-api';
import { ComparisonTable } from '@/components/properties/comparison-table';

export default function ComparePropertiesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const ids = searchParams.get('ids')?.split(',').filter(Boolean) || [];

  useEffect(() => {
    if (ids.length === 0) {
      toast.error('No properties selected to compare');
      router.push('/dashboard/properties');
      return;
    }

    async function load() {
      try {
        const result = await comparePropertiesRequest(ids);
        setProperties(result);
      } catch {
        toast.error('Failed to load comparison');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  if (isLoading) {
    return <p className="text-sm text-neutral-500 dark:text-neutral-400">Loading...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
          Compare Properties
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Side-by-side comparison of {properties.length} propert{properties.length === 1 ? 'y' : 'ies'}
        </p>
      </div>

      {properties.length === 0 ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">No properties found.</p>
      ) : (
        <ComparisonTable properties={properties} />
      )}
    </div>
  );
}