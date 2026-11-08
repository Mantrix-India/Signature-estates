'use client';

import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ClientForm } from '@/components/clients/client-form';
import { createClientRequest } from '@/lib/api/client-api';
import { ClientFormValues } from '@/types/client';

export default function NewClientPage() {
  const router = useRouter();

  async function handleSubmit(values: ClientFormValues) {
    try {
      const client = await createClientRequest(values);
      toast.success('Client added');
      router.push(`/dashboard/clients/${client.id}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to add client');
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">New Client</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Add a buyer or prospect</p>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <ClientForm onSubmit={handleSubmit} submitLabel="Add Client" />
      </div>
    </div>
  );
}