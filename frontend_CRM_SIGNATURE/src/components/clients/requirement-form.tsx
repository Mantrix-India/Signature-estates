'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { RequirementFormValues } from '@/types/client';

// All fields are captured as strings from the DOM, then normalized on submit.
// Only preferredCity is validated here; everything else is optional.
const requirementFormSchema = z.object({
  propertyType: z.enum(['APARTMENT', 'VILLA', 'PLOT', 'COMMERCIAL', 'OTHER']),
  preferredCity: z.string().min(2, 'City is required'),
  purpose: z.string().optional(),
  minBudget: z.string().optional(),
  maxBudget: z.string().optional(),
  bedrooms: z.string().optional(),
  minArea: z.string().optional(),
  maxArea: z.string().optional(),
  furnishing: z.string().optional(),
  parking: z.string().optional(),
  facing: z.string().optional(),
  floorPreference: z.string().optional(),
  possessionBy: z.string().optional(),
  financing: z.string().optional(),
  urgency: z.string().optional(),
  preferredLocations: z.string().optional(),
  notes: z.string().optional(),
});

type RequirementFormRaw = z.infer<typeof requirementFormSchema>;

const inputClass =
  'w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white';
const labelClass = 'mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300';

function toNum(v?: string): number | undefined {
  if (!v || !v.trim()) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function toStr(v?: string): string | undefined {
  return v && v.trim() ? v.trim() : undefined;
}

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
  } = useForm<RequirementFormRaw>({
    resolver: zodResolver(requirementFormSchema),
    defaultValues: { propertyType: 'APARTMENT', preferredCity: '' },
  });

  async function handleFormSubmit(raw: RequirementFormRaw) {
    const values: RequirementFormValues = {
      propertyType: raw.propertyType,
      preferredCity: raw.preferredCity.trim(),
      purpose: (toStr(raw.purpose) as RequirementFormValues['purpose']) ?? undefined,
      minBudget: toNum(raw.minBudget),
      maxBudget: toNum(raw.maxBudget),
      bedrooms: toNum(raw.bedrooms),
      minArea: toNum(raw.minArea),
      maxArea: toNum(raw.maxArea),
      furnishing: (toStr(raw.furnishing) as RequirementFormValues['furnishing']) ?? undefined,
      parking:
        raw.parking === 'true' ? true : raw.parking === 'false' ? false : undefined,
      facing: toStr(raw.facing),
      floorPreference: toStr(raw.floorPreference),
      possessionBy: raw.possessionBy
        ? new Date(`${raw.possessionBy}T00:00:00`).toISOString()
        : undefined,
      financing: toStr(raw.financing),
      urgency: (toStr(raw.urgency) as RequirementFormValues['urgency']) ?? undefined,
      preferredLocations: raw.preferredLocations
        ? raw.preferredLocations.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      notes: toStr(raw.notes),
    };

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3">
      {/* Basics */}
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

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Purpose</label>
          <select {...register('purpose')} className={inputClass}>
            <option value="">Any</option>
            <option value="BUY">Buy</option>
            <option value="RENT">Rent</option>
            <option value="INVESTMENT">Investment</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Urgency</label>
          <select {...register('urgency')} className={inputClass}>
            <option value="">Unset</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
      </div>

      {/* Budget */}
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

      {/* Size */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Min area (sqft)</label>
          <input type="number" {...register('minArea')} className={inputClass} placeholder="900" />
        </div>
        <div>
          <label className={labelClass}>Max area (sqft)</label>
          <input type="number" {...register('maxArea')} className={inputClass} placeholder="1400" />
        </div>
      </div>

      {/* Preferences */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Furnishing</label>
          <select {...register('furnishing')} className={inputClass}>
            <option value="">Any</option>
            <option value="UNFURNISHED">Unfurnished</option>
            <option value="SEMI_FURNISHED">Semi-furnished</option>
            <option value="FURNISHED">Furnished</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Parking</label>
          <select {...register('parking')} className={inputClass}>
            <option value="">Any</option>
            <option value="true">Required</option>
            <option value="false">Not required</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Facing</label>
          <select {...register('facing')} className={inputClass}>
            <option value="">Any</option>
            <option value="NORTH">North</option>
            <option value="EAST">East</option>
            <option value="SOUTH">South</option>
            <option value="WEST">West</option>
            <option value="NORTH_EAST">North-East</option>
            <option value="NORTH_WEST">North-West</option>
            <option value="SOUTH_EAST">South-East</option>
            <option value="SOUTH_WEST">South-West</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Floor preference</label>
          <input {...register('floorPreference')} className={inputClass} placeholder="High floor" />
        </div>
      </div>

      {/* Timeline / finance */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Possession by</label>
          <input type="date" {...register('possessionBy')} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Financing</label>
          <input {...register('financing')} className={inputClass} placeholder="Home loan / Cash" />
        </div>
      </div>

      {/* Locations + notes */}
      <div>
        <label className={labelClass}>Preferred locations</label>
        <input
          {...register('preferredLocations')}
          className={inputClass}
          placeholder="Kharar, Mohali, Zirakpur (comma separated)"
        />
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