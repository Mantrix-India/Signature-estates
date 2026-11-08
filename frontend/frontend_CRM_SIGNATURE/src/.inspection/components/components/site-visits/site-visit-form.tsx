'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { SiteVisitFormValues } from '@/types/siteVisit';
import { UserSummary } from '@/types/user';
import { Client } from '@/types/client';
import { Property } from '@/types/property';

const siteVisitFormSchema = z.object({
  clientId: z.string().uuid('Select a client'),
  propertyId: z.string().uuid('Select a property'),
  assignedToId: z.string().uuid('Select an agent'),
  scheduledDate: z.string().min(1, 'Date is required'),
  scheduledTime: z.string().min(1, 'Time is required'),
  notes: z.string().optional(),
});

type FormShape = z.infer<typeof siteVisitFormSchema>;

const inputClass =
  'w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white';
const labelClass = 'mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300';

export function SiteVisitForm({
  clients,
  properties,
  users,
  onSubmit,
}: {
  clients: Client[];
  properties: Property[];
  users: UserSummary[];
  onSubmit: (values: SiteVisitFormValues) => Promise<void>;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormShape>({
    resolver: zodResolver(siteVisitFormSchema),
  });

  async function handleFormSubmit(values: FormShape) {
    setIsSubmitting(true);
    try {
      const scheduledAt = new Date(`${values.scheduledDate}T${values.scheduledTime}:00`).toISOString();
      await onSubmit({
        clientId: values.clientId,
        propertyId: values.propertyId,
        assignedToId: values.assignedToId,
        scheduledAt,
        notes: values.notes,
      });
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
        <label className={labelClass}>Property</label>
        <select {...register('propertyId')} className={inputClass}>
          <option value="">Select a property</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
        {errors.propertyId && <p className="mt-1 text-xs text-red-500">{errors.propertyId.message}</p>}
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Date</label>
          <input type="date" {...register('scheduledDate')} className={inputClass} />
          {errors.scheduledDate && (
            <p className="mt-1 text-xs text-red-500">{errors.scheduledDate.message}</p>
          )}
        </div>
        <div>
          <label className={labelClass}>Time</label>
          <input type="time" {...register('scheduledTime')} className={inputClass} />
          {errors.scheduledTime && (
            <p className="mt-1 text-xs text-red-500">{errors.scheduledTime.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className={labelClass}>Notes</label>
        <textarea {...register('notes')} rows={2} className={inputClass} placeholder="Optional" />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-neutral-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
      >
        {isSubmitting ? 'Scheduling...' : 'Schedule Visit'}
      </button>
    </form>
  );
}