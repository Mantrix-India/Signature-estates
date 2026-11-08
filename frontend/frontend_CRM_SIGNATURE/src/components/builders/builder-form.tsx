'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { BuilderFormValues } from '@/types/builder';

const builderFormSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  commissionPercent: z.coerce.number().min(0).max(100),
  address: z.string().optional(),
  notes: z.string().optional(),
});

const inputClass =
  'w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white';
const labelClass = 'mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300';

export function BuilderForm({
  defaultValues,
  onSubmit,
  submitLabel,
}: {
  defaultValues?: Partial<BuilderFormValues>;
  onSubmit: (values: BuilderFormValues) => Promise<void>;
  submitLabel: string;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.input<typeof builderFormSchema>, unknown, BuilderFormValues>({
    resolver: zodResolver(builderFormSchema),
    defaultValues,
  });
  async function handleFormSubmit(values: BuilderFormValues) {
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      <div>
        <label className={labelClass}>Builder name</label>
        <input {...register('name')} className={inputClass} placeholder="Skyline Developers" />
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Contact person</label>
          <input {...register('contactPerson')} className={inputClass} placeholder="Rajiv Mehta" />
        </div>
        <div>
          <label className={labelClass}>Phone</label>
          <input {...register('phone')} className={inputClass} placeholder="9876543210" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Email</label>
          <input {...register('email')} className={inputClass} placeholder="contact@skyline.com" />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Commission (%)</label>
          <input
            type="number"
            step="0.1"
            {...register('commissionPercent')}
            className={inputClass}
            placeholder="2.5"
          />
          {errors.commissionPercent && (
            <p className="mt-1 text-xs text-red-500">{errors.commissionPercent.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className={labelClass}>Address</label>
        <input {...register('address')} className={inputClass} placeholder="Optional" />
      </div>

      <div>
        <label className={labelClass}>Notes</label>
        <textarea {...register('notes')} rows={3} className={inputClass} placeholder="Optional" />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-neutral-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
      >
        {isSubmitting ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
}