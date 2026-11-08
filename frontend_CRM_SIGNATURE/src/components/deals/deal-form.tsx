'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { DealFormValues } from '@/types/deal';
import { Lead } from '@/types/lead';
import { Property } from '@/types/property';
import { Owner } from '@/types/owner';
import { UserSummary } from '@/types/user';

const schema = z.object({
  leadId: z.string().uuid('Select a lead'),
  dealValue: z.coerce.number().positive('Deal value must be greater than 0'),
  propertyId: z.string().uuid().optional().or(z.literal('')),
  ownerId: z.string().uuid().optional().or(z.literal('')),
  agentId: z.string().uuid().optional().or(z.literal('')),
  bookingDate: z.string().optional(),
  notes: z.string().optional(),
});

type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

const inputClass =
  'w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white';
const labelClass = 'mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300';

export function DealForm({
  leads,
  properties,
  owners,
  users,
  canAssignAgent,
  onSubmit,
}: {
  leads: Lead[];
  properties: Property[];
  owners: Owner[];
  users: UserSummary[];
  canAssignAgent: boolean;
  onSubmit: (values: DealFormValues) => Promise<void>;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInput>({ resolver: zodResolver(schema) });

  async function handleFormSubmit(raw: FormInput) {
    setIsSubmitting(true);
    try {
      const v = schema.parse(raw) as FormOutput;
      await onSubmit({
        leadId: v.leadId,
        dealValue: v.dealValue,
        propertyId: v.propertyId || undefined,
        ownerId: v.ownerId || undefined,
        agentId: v.agentId || undefined,
        bookingDate: v.bookingDate ? new Date(v.bookingDate).toISOString() : undefined,
        notes: v.notes || undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label className={labelClass}>Lead</label>
        <select {...register('leadId')} className={inputClass}>
          <option value="">Select a lead</option>
          {leads.map((l) => (
            <option key={l.id} value={l.id}>
              {l.client.fullName}
              {l.property ? ` — ${l.property.title}` : ''}
            </option>
          ))}
        </select>
        {errors.leadId && <p className="mt-1 text-xs text-red-500">{errors.leadId.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Deal value (₹)</label>
          <input type="number" {...register('dealValue')} className={inputClass} placeholder="5000000" />
          {errors.dealValue && (
            <p className="mt-1 text-xs text-red-500">{errors.dealValue.message}</p>
          )}
        </div>
        <div>
          <label className={labelClass}>Booking date</label>
          <input type="date" {...register('bookingDate')} className={inputClass} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Property (defaults to the lead's property)</label>
        <select {...register('propertyId')} className={inputClass}>
          <option value="">Use lead's property</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Owner (optional)</label>
        <select {...register('ownerId')} className={inputClass}>
          <option value="">None</option>
          {owners.map((o) => (
            <option key={o.id} value={o.id}>{o.fullName}</option>
          ))}
        </select>
      </div>

      {canAssignAgent && (
        <div>
          <label className={labelClass}>Agent (defaults to you / the lead's assignee)</label>
          <select {...register('agentId')} className={inputClass}>
            <option value="">Default</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.fullName}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className={labelClass}>Notes</label>
        <input {...register('notes')} className={inputClass} placeholder="Optional" />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-neutral-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
      >
        {isSubmitting ? 'Creating...' : 'Create Deal'}
      </button>
    </form>
  );
}