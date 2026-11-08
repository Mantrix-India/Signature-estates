'use client';

import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { BuilderForm } from '@/components/builders/builder-form';
import { createBuilderRequest } from '@/lib/api/builder-api';
import { BuilderFormValues } from '@/types/builder';

export default function NewBuilderPage() {
  const router = useRouter();

  async function handleSubmit(values: BuilderFormValues) {
    try {
      await createBuilderRequest(values);
      toast.success('Builder created');
      router.push('/dashboard/builders');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create builder');
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">New Builder</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Add a developer partner</p>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <BuilderForm onSubmit={handleSubmit} submitLabel="Create Builder" />
      </div>
    </div>
  );
}