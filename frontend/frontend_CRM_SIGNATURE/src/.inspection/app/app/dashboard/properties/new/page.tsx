'use client';

import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { PropertyForm } from '@/components/properties/property-form';
import { createPropertyRequest } from '@/lib/api/property-api';
import { PropertyFormValues } from '@/types/property';

export default function NewPropertyPage() {
  const router = useRouter();

  async function handleSubmit(values: PropertyFormValues) {
    try {
      await createPropertyRequest(values);
      toast.success('Property created');
      router.push('/dashboard/properties');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create property');
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">New Property</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Add a new listing to your inventory
        </p>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <PropertyForm onSubmit={handleSubmit} submitLabel="Create Property" />
      </div>
    </div>
  );
}