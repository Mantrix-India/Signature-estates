'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { PropertyForm } from '@/components/properties/property-form';
import { getPropertyRequest, updatePropertyRequest } from '@/lib/api/property-api';
import { Property, PropertyFormValues } from '@/types/property';

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getPropertyRequest(params.id);
        setProperty(data);
      } catch {
        toast.error('Property not found');
        router.push('/dashboard/properties');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [params.id, router]);

  async function handleSubmit(values: PropertyFormValues) {
    try {
      await updatePropertyRequest(params.id, values);
      toast.success('Property updated');
      router.push('/dashboard/properties');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update property');
    }
  }

  if (isLoading) {
    return <p className="text-sm text-neutral-500 dark:text-neutral-400">Loading...</p>;
  }

  if (!property) return null;

  const defaultValues: Partial<PropertyFormValues> = {
    title: property.title,
    description: property.description || undefined,
    propertyType: property.propertyType,
    status: property.status,
    price: property.price,
    areaSqft: property.areaSqft || undefined,
    bedrooms: property.bedrooms || undefined,
    bathrooms: property.bathrooms || undefined,
    address: property.address,
    city: property.city,
    state: property.state,
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Edit Property</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{property.title}</p>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <PropertyForm
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          submitLabel="Save Changes"
        />
      </div>
    </div>
  );
}