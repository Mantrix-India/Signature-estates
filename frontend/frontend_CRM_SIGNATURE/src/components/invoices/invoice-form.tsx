'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { InvoiceFormValues } from '@/types/invoice';
import { Client } from '@/types/client';
import { Property } from '@/types/property';

const invoiceFormSchema = z.object({
  clientId: z.string().uuid('Select a client'),
  propertyId: z.string().uuid().optional().or(z.literal('')),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  dueDate: z.string().min(1, 'Due date is required'),
  notes: z.string().optional(),
});

type InvoiceFormInput = z.input<typeof invoiceFormSchema>;
type InvoiceFormOutput = z.output<typeof invoiceFormSchema>;

const inputClass =
  'w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white';
const labelClass = 'mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300';

export function InvoiceForm({
  clients,
  properties,
  onSubmit,
}: {
  clients: Client[];
  properties: Property[];
  onSubmit: (values: InvoiceFormValues) => Promise<void>;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InvoiceFormInput>({
    resolver: zodResolver(invoiceFormSchema),
  });

  async function handleFormSubmit(rawValues: InvoiceFormInput) {
    setIsSubmitting(true);
    try {
      const values = invoiceFormSchema.parse(rawValues) as InvoiceFormOutput;
      await onSubmit({
        clientId: values.clientId,
        propertyId: values.propertyId || undefined,
        amount: values.amount,
        dueDate: new Date(values.dueDate).toISOString(),
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
        <label className={labelClass}>Property (optional)</label>
        <select {...register('propertyId')} className={inputClass}>
          <option value="">None</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Amount (₹)</label>
          <input type="number" {...register('amount')} className={inputClass} placeholder="50000" />
          {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Due date</label>
          <input type="date" {...register('dueDate')} className={inputClass} />
          {errors.dueDate && <p className="mt-1 text-xs text-red-500">{errors.dueDate.message}</p>}
        </div>
      </div>

      <div>
        <label className={labelClass}>Notes</label>
        <input {...register('notes')} className={inputClass} placeholder="Optional" />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-neutral-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
      >
        {isSubmitting ? 'Creating...' : 'Create Invoice'}
      </button>
    </form>
  );
}