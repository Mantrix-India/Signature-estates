'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { BuilderForm } from '@/components/builders/builder-form';
import { getBuilderRequest, updateBuilderRequest } from '@/lib/api/builder-api';
import { Builder, BuilderFormValues } from '@/types/builder';

export default function EditBuilderPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [builder, setBuilder] = useState<Builder | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getBuilderRequest(params.id);
        setBuilder(data);
      } catch {
        toast.error('Builder not found');
        router.push('/dashboard/builders');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [params.id, router]);

  async function handleSubmit(values: BuilderFormValues) {
    try {
      await updateBuilderRequest(params.id, values);
      toast.success('Builder updated');
      router.push(`/dashboard/builders/${params.id}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update builder');
    }
  }

  if (isLoading) {
    return <p className="text-sm text-neutral-500 dark:text-neutral-400">Loading...</p>;
  }

  if (!builder) return null;

  const defaultValues: Partial<BuilderFormValues> = {
    name: builder.name,
    contactPerson: builder.contactPerson || undefined,
    phone: builder.phone || undefined,
    email: builder.email || undefined,
    commissionPercent: builder.commissionPercent,
    address: builder.address || undefined,
    notes: builder.notes || undefined,
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Edit Builder</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{builder.name}</p>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <BuilderForm defaultValues={defaultValues} onSubmit={handleSubmit} submitLabel="Save Changes" />
      </div>
    </div>
  );
}