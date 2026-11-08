'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Clock, MapPin, User, Trash2, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { SiteVisit, SiteVisitStatus } from '@/types/siteVisit';
import {
  getSiteVisitRequest,
  updateSiteVisitStatusRequest,
  confirmByClientRequest,
  confirmByBuilderRequest,
  deleteSiteVisitRequest,
} from '@/lib/api/siteVisit-api';
import { SiteVisitStatusBadge } from '@/components/site-visits/status-badge';

const statuses: SiteVisitStatus[] = ['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED'];

export default function SiteVisitDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [visit, setVisit] = useState<SiteVisit | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchVisit = useCallback(async () => {
    try {
      const data = await getSiteVisitRequest(params.id);
      setVisit(data);
    } catch {
      toast.error('Site visit not found');
      router.push('/dashboard/site-visits');
    } finally {
      setIsLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    fetchVisit();
  }, [fetchVisit]);

  async function handleStatusChange(status: SiteVisitStatus) {
    try {
      await updateSiteVisitStatusRequest(params.id, status);
      toast.success('Status updated');
      fetchVisit();
    } catch {
      toast.error('Failed to update status');
    }
  }

  async function handleConfirmClient() {
    try {
      await confirmByClientRequest(params.id);
      toast.success('Marked as client-confirmed');
      fetchVisit();
    } catch {
      toast.error('Failed to confirm');
    }
  }

  async function handleConfirmBuilder() {
    try {
      await confirmByBuilderRequest(params.id);
      toast.success('Marked as builder-confirmed');
      fetchVisit();
    } catch {
      toast.error('Failed to confirm');
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this site visit?')) return;
    try {
      await deleteSiteVisitRequest(params.id);
      toast.success('Site visit deleted');
      router.push('/dashboard/site-visits');
    } catch {
      toast.error('Failed to delete');
    }
  }

  if (isLoading) {
    return <p className="text-sm text-neutral-500 dark:text-neutral-400">Loading...</p>;
  }

  if (!visit) return null;

  const scheduledDate = new Date(visit.scheduledAt);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
            {visit.property.title}
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
            <MapPin size={13} /> {visit.property.address}, {visit.property.city}
          </p>
        </div>
        <SiteVisitStatusBadge status={visit.status} />
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600 dark:text-neutral-300">
          <span className="flex items-center gap-1.5">
            <Clock size={14} />
            {scheduledDate.toLocaleString('en-IN', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          <span className="flex items-center gap-1.5">
            <User size={14} />
            <Link href={`/dashboard/clients/${visit.client.id}`} className="hover:underline">
              {visit.client.fullName}
            </Link>
          </span>
          <span className="text-neutral-400">Agent: {visit.assignedTo.fullName}</span>
        </div>

        {visit.notes && (
          <p className="mt-3 rounded-lg bg-neutral-50 p-3 text-sm text-neutral-600 dark:bg-neutral-800/50 dark:text-neutral-300">
            {visit.notes}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-3 border-t border-neutral-100 pt-4 dark:border-neutral-800">
          <button
            onClick={handleConfirmClient}
            disabled={visit.clientConfirmed}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
              visit.clientConfirmed
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400'
                : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800'
            }`}
          >
            <Check size={14} /> {visit.clientConfirmed ? 'Client confirmed' : 'Confirm by client'}
          </button>
          <button
            onClick={handleConfirmBuilder}
            disabled={visit.builderConfirmed}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
              visit.builderConfirmed
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400'
                : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800'
            }`}
          >
            <Check size={14} /> {visit.builderConfirmed ? 'Builder confirmed' : 'Confirm by builder'}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <select
          value={visit.status}
          onChange={(e) => handleStatusChange(e.target.value as SiteVisitStatus)}
          className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <button
          onClick={handleDelete}
          className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800"
        >
          <Trash2 size={14} /> Delete
        </button>
      </div>
    </div>
  );
}