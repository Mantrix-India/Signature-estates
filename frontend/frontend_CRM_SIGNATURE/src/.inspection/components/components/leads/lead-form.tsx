'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { LeadFormValues, LeadSource } from '@/types/lead';
import { UserSummary } from '@/types/user';
import { Client } from '@/types/client';

const leadFormSchema = z.object({
  clientId: z.string().uuid('Select a client'),
  propertyId: z.string().uuid().optional().or(z.literal('')),
  leadSourceId: z.string().uuid().optional().or(z.literal('')),
  assignedToId: z.string().uuid('Select an agent'),
});

const inputClass =
  'w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white';
const labelClass = 'mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300';

export function LeadForm({
  clients,
  users,
  sources,
  onSubmit,
}: {
  clients: Client[];
  users: UserSummary[];
  sources: LeadSource[];
  onSubmit: (values: LeadFormValues) => Promise<void>;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
  });

  async function handleFormSubmit(values: LeadFormValues) {
    setIsSubmitting(true);
    try {
      const cleaned = {
        ...values,
        propertyId: values.propertyId || undefined,
        leadSourceId: values.leadSourceId || undefined,
      };
      await onSubmit(cleaned);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label className={labelClass}>Client</label>
        <select {...register('clientId')} className={inputClass}>
          <option value="">Select a client</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.fullName}</option>
          ))}
        </select>
        {errors.clientId && <p className="mt-1 text-xs text-red-500">{errors.clientId.message}</p>}
      </div>

      <div>
        <label className={labelClass}>Assign to</label>
        <select {...register('assignedToId')} className={inputClass}>
          <option value="">Select an agent</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.fullName}</option>
          ))}
        </select>
        {errors.assignedToId && (
          <p className="mt-1 text-xs text-red-500">{errors.assignedToId.message}</p>
        )}
      </div>

      <div>
        <label className={labelClass}>Lead source (optional)</label>
        <select {...register('leadSourceId')} className={inputClass}>
          <option value="">None</option>
          {sources.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-neutral-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
      >
        {isSubmitting ? 'Creating...' : 'Create Lead'}
      </button>
    </form>
  );
}