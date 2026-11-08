'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import { Owner, OwnerFormValues } from '@/types/owner';
import { Property } from '@/types/property';
import {
  getOwnerRequest,
  updateOwnerRequest,
  deleteOwnerRequest,
} from '@/lib/api/owner-api';
import { listPropertiesRequest } from '@/lib/api/property-api';
import { OwnerForm } from '@/components/owners/owner-form';
import { LinkPropertyPanel } from '@/components/owners/link-property-panel';

export default function OwnerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [owner, setOwner] = useState<Owner | null>(null);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const fetchOwner = useCallback(async () => {
    try {
      const result = await getOwnerRequest(id);
      setOwner(result);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load owner');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOwner();
    listPropertiesRequest({ limit: 100 })
      .then((res) => setAllProperties(res.properties))
      .catch(() => {});
  }, [fetchOwner]);

  async function handleUpdate(values: OwnerFormValues) {
    try {
      await updateOwnerRequest(id, values);
      toast.success('Owner updated');
      setEditing(false);
      fetchOwner();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update owner');
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this owner? Linked properties will be unlinked (not deleted).')) return;
    try {
      await deleteOwnerRequest(id);
      toast.success('Owner deleted');
      router.push('/dashboard/owners');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete owner');
    }
  }

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-xl border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900" />;
  }

  if (!owner) {
    return (
      <div className="space-y-4">
        <Link href="/dashboard/owners" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white">
          <ArrowLeft size={15} /> Back to owners
        </Link>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Owner not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/dashboard/owners" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white">
        <ArrowLeft size={15} /> Back to owners
      </Link>

      <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        {editing ? (
          <OwnerForm
            defaultValues={{
              fullName: owner.fullName,
              phone: owner.phone,
              email: owner.email ?? '',
              address: owner.address ?? '',
              notes: owner.notes ?? '',
            }}
            submitLabel="Save changes"
            onSubmit={handleUpdate}
          />
        ) : (
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">{owner.fullName}</h1>
              <div className="mt-1 space-y-0.5 text-sm text-neutral-500 dark:text-neutral-400">
                <p>{owner.phone}{owner.email ? ` · ${owner.email}` : ''}</p>
                {owner.address && <p>{owner.address}</p>}
                {owner.notes && <p className="text-xs">{owner.notes}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                <Pencil size={13} /> Edit
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-neutral-800 dark:hover:bg-red-500/10"
              >
                <Trash2 size={13} /> Delete
              </button>
            </div>
          </div>
        )}
      </div>

      <LinkPropertyPanel owner={owner} allProperties={allProperties} onRefresh={fetchOwner} />
    </div>
  );
}