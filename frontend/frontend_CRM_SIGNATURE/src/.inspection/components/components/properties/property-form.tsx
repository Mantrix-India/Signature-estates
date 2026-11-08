'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { PropertyFormValues } from '@/types/property';

const propertyFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  propertyType: z.enum(['APARTMENT', 'VILLA', 'PLOT', 'COMMERCIAL', 'OTHER']),
  status: z.enum(['AVAILABLE', 'RESERVED', 'BOOKED', 'SOLD']).optional(),
  price: z.coerce.number().positive('Price must be greater than 0'),
  areaSqft: z.coerce.number().positive().optional(),
  bedrooms: z.coerce.number().int().nonnegative().optional(),
  bathrooms: z.coerce.number().int().nonnegative().optional(),
  address: z.string().min(3, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
});

const inputClass =
  'w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white';
const labelClass = 'mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300';

export function PropertyForm({
  defaultValues,
  onSubmit,
  submitLabel,
}: {
  defaultValues?: Partial<PropertyFormValues>;
  onSubmit: (values: PropertyFormValues) => Promise<void>;
  submitLabel: string;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.input<typeof propertyFormSchema>, unknown, PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues,
  });

  async function handleFormSubmit(values: PropertyFormValues) {
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
        <label className={labelClass}>Title</label>
        <input {...register('title')} className={inputClass} placeholder="3 BHK Luxury Apartment" />
        {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <textarea
          {...register('description')}
          rows={3}
          className={inputClass}
          placeholder="Optional details about the property..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
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
          <label className={labelClass}>Status</label>
          <select {...register('status')} className={inputClass}>
            <option value="AVAILABLE">Available</option>
            <option value="RESERVED">Reserved</option>
            <option value="BOOKED">Booked</option>
            <option value="SOLD">Sold</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Price (₹)</label>
          <input type="number" {...register('price')} className={inputClass} placeholder="8500000" />
          {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Area (sqft)</label>
          <input type="number" {...register('areaSqft')} className={inputClass} placeholder="1450" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={labelClass}>Beds</label>
            <input type="number" {...register('bedrooms')} className={inputClass} placeholder="3" />
          </div>
          <div>
            <label className={labelClass}>Baths</label>
            <input type="number" {...register('bathrooms')} className={inputClass} placeholder="2" />
          </div>
        </div>
      </div>

      <div>
        <label className={labelClass}>Address</label>
        <input {...register('address')} className={inputClass} placeholder="Sector 20, Kharar" />
        {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>City</label>
          <input {...register('city')} className={inputClass} placeholder="Kharar" />
          {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city.message}</p>}
        </div>
        <div>
          <label className={labelClass}>State</label>
          <input {...register('state')} className={inputClass} placeholder="Punjab" />
          {errors.state && <p className="mt-1 text-xs text-red-500">{errors.state.message}</p>}
        </div>
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