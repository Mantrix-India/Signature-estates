'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { RequirementFormValues } from '@/types/client';

const requirementFormSchema = z.object({
  propertyType: z.enum(['APARTMENT', 'VILLA', 'PLOT', 'COMMERCIAL', 'OTHER']),
  preferredCity: z.string().min(2, 'City is required'),
  minBudget: z.coerce.number().nonnegative().optional(),
  maxBudget: z.coerce.number().positive().optional(),
  bedrooms: z.coerce.number().int().nonnegative().optional(),
  notes: z.string().optional(),
});

const inputClass =
  'w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white';
const labelClass = 'mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300';

export function RequirementForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (values: RequirementFormValues) => Promise<void>;
  onCancel: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.input<typeof requirementFormSchema>, unknown, RequirementFormValues>({
    resolver: zodResolver(requirementFormSchema),
  });

  async function handleFormSubmit(values: RequirementFormValues) {
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Property type</label>
          <select {...register('propertyType')} className={inputClass}>
            <option value="APARTMENT">Apartment</option>
            <option value="VILLA">Villa</option>
            <option value="PLOT">Plot</option>
            <option value="COMMERCIAL">Commercial</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Preferred city</label>
          <input {...register('preferredCity')} className={inputClass} placeholder="Kharar" />
          {errors.preferredCity && (
            <p className="mt-1 text-xs text-red-500">{errors.preferredCity.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={labelClass}>Min budget</label>
          <input type="number" {...register('minBudget')} className={inputClass} placeholder="6000000" />
        </div>
        <div>
          <label className={labelClass}>Max budget</label>
          <input type="number" {...register('maxBudget')} className={inputClass} placeholder="9000000" />
        </div>
        <div>
          <label className={labelClass}>Bedrooms</label>
          <input type="number" {...register('bedrooms')} className={inputClass} placeholder="3" />
        </div>
      </div>

      <div>
        <label className={labelClass}>Notes</label>
        <input {...register('notes')} className={inputClass} placeholder="Optional" />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-lg border border-neutral-200 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 rounded-lg bg-neutral-900 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          {isSubmitting ? 'Adding...' : 'Add Requirement'}
        </button>
      </div>
    </form>
  );
}