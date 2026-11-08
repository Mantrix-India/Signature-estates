'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { Globe } from 'lucide-react';
import { PropertyFormValues } from '@/types/property';

/** '' / null / NaN -> undefined, so empty optional inputs don't fail validation. */
const blankToUndefined = (v: unknown) =>
  v === '' || v === null || v === undefined || (typeof v === 'number' && Number.isNaN(v))
    ? undefined
    : typeof v === 'string'
      ? v.trim() === ''
        ? undefined
        : v.trim()
      : v;

const optionalText = (max: number, message?: string) =>
  z.preprocess(blankToUndefined, z.string().max(max, message).optional());
const optionalInt = (min: number, max: number) =>
  z.preprocess(blankToUndefined, z.coerce.number().int().min(min).max(max).optional());

/** One URL per line (or comma separated) -> string[] */
function splitList(text: string | undefined, separator: RegExp) {
  return (text ?? '')
    .split(separator)
    .map((s) => s.trim())
    .filter(Boolean);
}

const propertyFormSchema = z
  .object({
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

    // Public website (V2.3)
    isPublished: z.boolean().optional(),
    locality: z.preprocess(
      blankToUndefined,
      z.string().min(2, 'Locality must be at least 2 characters').max(100).optional()
    ),
    listingType: z.enum(['SALE', 'RENT']).optional(),
    furnishing: z.preprocess(
      blankToUndefined,
      z.enum(['UNFURNISHED', 'SEMI_FURNISHED', 'FURNISHED']).optional()
    ),
    floor: optionalInt(-5, 250),
    totalFloors: optionalInt(0, 250),
    reraId: optionalText(60, 'RERA id is too long'),
    isFeatured: z.boolean().optional(),
    amenitiesText: z.string().optional(),
    imagesText: z
      .string()
      .optional()
      .refine(
        (text) => splitList(text, /[\n,]+/).every((u) => /^https?:\/\/\S+$/i.test(u)),
        'Each image must be a full link starting with http:// or https://'
      )
      .refine((text) => splitList(text, /[\n,]+/).length <= 30, 'Maximum 30 images'),
  })
  .transform(({ amenitiesText, imagesText, ...rest }) => ({
    ...rest,
    amenities: splitList(amenitiesText, /,/),
    images: splitList(imagesText, /[\n,]+/),
  }));

type FormInput = z.input<typeof propertyFormSchema>;

const inputClass =
  'w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white';
const labelClass = 'mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300';
const hintClass = 'mt-1 text-xs text-neutral-500 dark:text-neutral-400';

function toFormDefaults(values?: Partial<PropertyFormValues>): Partial<FormInput> {
  if (!values) return { listingType: 'SALE', isPublished: false, isFeatured: false };
  const { amenities, images, ...rest } = values;
  return {
    listingType: 'SALE',
    isPublished: false,
    isFeatured: false,
    ...rest,
    amenitiesText: (amenities ?? []).join(', '),
    imagesText: (images ?? []).join('\n'),
  };
}

export function PropertyForm({
  defaultValues,
  onSubmit,
  submitLabel,
  canPublish = false,
  websiteUrl,
}: {
  defaultValues?: Partial<PropertyFormValues>;
  onSubmit: (values: PropertyFormValues) => Promise<void>;
  submitLabel: string;
  /** ADMIN / MANAGER only. When false the switch is hidden and isPublished is never sent. */
  canPublish?: boolean;
  /** Public page address, shown on the edit screen. */
  websiteUrl?: string;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormInput, unknown, PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: toFormDefaults(defaultValues),
  });

  const isPublished = watch('isPublished');

  async function handleFormSubmit(values: PropertyFormValues) {
    setIsSubmitting(true);
    try {
      const payload = { ...values };
      if (!canPublish) delete payload.isPublished;
      await onSubmit(payload);
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

      {/* ── Public website ─────────────────────────────────────────── */}
      <div className="space-y-5 border-t border-neutral-200 pt-5 dark:border-neutral-800">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-white">
              <Globe size={15} /> Public website
            </h3>
            <p className={hintClass}>
              What buyers see on the Signature Estates website. Only available properties are shown.
            </p>
          </div>

          {canPublish && (
            <label className="flex shrink-0 cursor-pointer items-center gap-3">
              <span
                className={
                  isPublished
                    ? 'text-xs font-medium text-emerald-600 dark:text-emerald-400'
                    : 'text-xs font-medium text-neutral-500 dark:text-neutral-400'
                }
              >
                {isPublished ? 'Published' : 'Not published'}
              </span>
              <span className="relative inline-flex h-6 w-11 items-center">
                <input type="checkbox" {...register('isPublished')} className="peer sr-only" />
                <span className="absolute inset-0 rounded-full bg-neutral-300 transition-colors peer-checked:bg-emerald-500 peer-focus-visible:ring-2 peer-focus-visible:ring-neutral-400 dark:bg-neutral-700" />
                <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
              </span>
            </label>
          )}
        </div>

        {!canPublish && (
          <p className="rounded-lg bg-neutral-50 px-3 py-2 text-xs text-neutral-500 dark:bg-neutral-950 dark:text-neutral-400">
            {isPublished ? 'This property is live on the website.' : 'This property is not on the website yet.'}{' '}
            Only an admin or manager can publish or unpublish.
          </p>
        )}

        {websiteUrl && (
          <p className={hintClass}>
            Website address:{' '}
            <a href={websiteUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2">
              {websiteUrl}
            </a>
          </p>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Locality</label>
            <input {...register('locality')} className={inputClass} placeholder="Sector 70" />
            {errors.locality && <p className="mt-1 text-xs text-red-500">{errors.locality.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Listing type</label>
            <select {...register('listingType')} className={inputClass}>
              <option value="SALE">For sale</option>
              <option value="RENT">For rent</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Furnishing</label>
            <select {...register('furnishing')} className={inputClass}>
              <option value="">Not set</option>
              <option value="UNFURNISHED">Unfurnished</option>
              <option value="SEMI_FURNISHED">Semi-furnished</option>
              <option value="FURNISHED">Furnished</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Floor</label>
            <input type="number" {...register('floor')} className={inputClass} placeholder="5" />
            {errors.floor && <p className="mt-1 text-xs text-red-500">Enter a whole number</p>}
          </div>
          <div>
            <label className={labelClass}>Total floors</label>
            <input type="number" {...register('totalFloors')} className={inputClass} placeholder="14" />
            {errors.totalFloors && <p className="mt-1 text-xs text-red-500">Enter a whole number</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>RERA id</label>
            <input {...register('reraId')} className={inputClass} placeholder="PBRERA-SAS80-PR0123" />
            <p className={hintClass}>Shows a “Verified” badge on the website.</p>
            {errors.reraId && <p className="mt-1 text-xs text-red-500">{errors.reraId.message}</p>}
          </div>
          <div className="flex items-start pt-7">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
              <input
                type="checkbox"
                {...register('isFeatured')}
                className="h-4 w-4 accent-neutral-900 dark:accent-white"
              />
              Featured (shown first on the website)
            </label>
          </div>
        </div>

        <div>
          <label className={labelClass}>Amenities</label>
          <input
            {...register('amenitiesText')}
            className={inputClass}
            placeholder="Swimming pool, Gym, Clubhouse, Power backup"
          />
          <p className={hintClass}>Separate with commas.</p>
        </div>

        <div>
          <label className={labelClass}>Photos</label>
          <textarea
            {...register('imagesText')}
            rows={4}
            className={`${inputClass} font-mono text-xs`}
            placeholder={'https://res.cloudinary.com/.../photo-1.jpg\nhttps://res.cloudinary.com/.../photo-2.jpg'}
          />
          <p className={hintClass}>One image link per line. The first photo is the cover image.</p>
          {errors.imagesText && <p className="mt-1 text-xs text-red-500">{errors.imagesText.message}</p>}
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
