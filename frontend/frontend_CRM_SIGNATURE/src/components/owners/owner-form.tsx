'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { OwnerFormValues } from '@/types/owner';

const schema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().min(3, 'Phone is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const inputClass =
  'w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white';
const labelClass = 'mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300';

export function OwnerForm({
  defaultValues,
  submitLabel = 'Save owner',
  onSubmit,
}: {
  defaultValues?: Partial<OwnerFormValues>;
  submitLabel?: string;
  onSubmit: (values: OwnerFormValues) => Promise<void>;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: defaultValues?.fullName ?? '',
      phone: defaultValues?.phone ?? '',
      email: defaultValues?.email ?? '',
      address: defaultValues?.address ?? '',
      notes: defaultValues?.notes ?? '',
    },
  });

  async function handleFormSubmit(values: FormValues) {
    setIsSubmitting(true);
    try {
      await onSubmit({
        fullName: values.fullName,
        phone: values.phone,
        email: values.email || undefined,
        address: values.address || undefined,
        notes: values.notes || undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Full name</label>
          <input {...register('fullName')} className={inputClass} placeholder="Owner name" />
          {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Phone</label>
          <input {...register('phone')} className={inputClass} placeholder="+91..." />
          {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
        </div>
      </div>
      <div>
        <label className={labelClass}>Email (optional)</label>
        <input {...register('email')} className={inputClass} placeholder="owner@example.com" />
        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
      </div>
      <div>
        <label className={labelClass}>Address (optional)</label>
        <input {...register('address')} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Notes (optional)</label>
        <input {...register('notes')} className={inputClass} />
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