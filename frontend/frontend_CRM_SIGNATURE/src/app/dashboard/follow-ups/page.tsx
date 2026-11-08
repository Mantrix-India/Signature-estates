"use client";

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Trash2, AlertCircle, CalendarDays, CalendarClock, Inbox } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/layout/page-header';
import { FollowUp, FollowUpBuckets } from '@/types/followup';
import {
  listFollowUpsRequest,
  createFollowUpRequest,
  updateFollowUpRequest,
  deleteFollowUpRequest,
} from '@/lib/api/followup-api';

type Scope = 'me' | 'all';

const inputClass =
  'w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white';

function formatDue(iso?: string | null) {
  if (!iso) return 'No due date';
  return new Date(iso).toLocaleString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function FollowUpRow({
  item,
  onToggle,
  onDelete,
}: {
  item: FollowUp;
  onToggle: (item: FollowUp) => void;
  onDelete: (item: FollowUp) => void;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
      <input
        type="checkbox"
        checked={item.isCompleted}
        onChange={() => onToggle(item)}
        className="mt-1 h-4 w-4 shrink-0 rounded border-neutral-300 dark:border-neutral-700"
        aria-label="Mark complete"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-neutral-900 dark:text-white">{item.title}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400">
          <span>{formatDue(item.dueDate)}</span>
          {item.lead && (
            <Link
              href={`/dashboard/clients/${item.lead.client.id}`}
              className="text-neutral-600 underline-offset-2 hover:underline dark:text-neutral-300"
            >
              {item.lead.client.fullName}
            </Link>
          )}
          <span className="text-neutral-400 dark:text-neutral-600">
            {item.assignedTo.fullName}
          </span>
        </div>
      </div>
      <button
        onClick={() => onDelete(item)}
        aria-label="Delete follow-up"
        className="shrink-0 rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-red-600 dark:hover:bg-neutral-800"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}

function Bucket({
  title,
  count,
  icon: Icon,
  accent,
  items,
  onToggle,
  onDelete,
}: {
  title: string;
  count: number;
  icon: typeof AlertCircle;
  accent: string;
  items: FollowUp[];
  onToggle: (item: FollowUp) => void;
  onDelete: (item: FollowUp) => void;
}) {
  return (
    <div className="flex flex-col rounded-xl border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-900/40">
      <div className="mb-3 flex items-center gap-2">
        <Icon size={16} className={accent} />
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">{title}</h2>
        <span className="ml-auto rounded-full bg-neutral-200 px-2 py-0.5 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
          {count}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {items.length === 0 ? (
          <p className="rounded-lg border border-dashed border-neutral-300 py-5 text-center text-xs text-neutral-400 dark:border-neutral-700">
            Nothing here
          </p>
        ) : (
          items.map((item) => (
            <FollowUpRow key={item.id} item={item} onToggle={onToggle} onDelete={onDelete} />
          ))
        )}
      </div>
    </div>
  );
}

export default function FollowUpsPage() {
  const [buckets, setBuckets] = useState<FollowUpBuckets | null>(null);
  const [scope, setScope] = useState<Scope>('me');
  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchFollowUps = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await listFollowUpsRequest({ scope });
      setBuckets(result);
    } catch {
      toast.error('Failed to load follow-ups');
    } finally {
      setIsLoading(false);
    }
  }, [scope]);

  useEffect(() => {
    fetchFollowUps();
  }, [fetchFollowUps]);

  async function handleCreate() {
    if (title.trim().length < 2) {
      toast.error('Enter a title');
      return;
    }
    setIsSaving(true);
    try {
      await createFollowUpRequest({
        title: title.trim(),
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      });
      setTitle('');
      setDueDate('');
      toast.success('Follow-up added');
      fetchFollowUps();
    } catch {
      toast.error('Failed to add follow-up');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggle(item: FollowUp) {
    try {
      await updateFollowUpRequest(item.id, { isCompleted: !item.isCompleted });
      fetchFollowUps();
    } catch {
      toast.error('Failed to update');
    }
  }

  async function handleDelete(item: FollowUp) {
    try {
      await deleteFollowUpRequest(item.id);
      toast.success('Deleted');
      fetchFollowUps();
    } catch {
      toast.error('Failed to delete');
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Follow-ups"
        description="Everything on your plate, grouped by when it's due"
        actions={
          <div className="flex rounded-lg border border-neutral-200 p-0.5 dark:border-neutral-800">
            {(['me', 'all'] as Scope[]).map((s) => (
              <button
                key={s}
                onClick={() => setScope(s)}
                className={
                  'rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors ' +
                  (scope === s
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                    : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white')
                }
              >
                {s === 'me' ? 'Mine' : 'All agents'}
              </button>
            ))}
          </div>
        }
      />

      <div className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400">
            New follow-up
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Call about the Whitefield 3BHK"
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Due (optional)
          </label>
          <input
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={inputClass}
          />
        </div>
        <button
          onClick={handleCreate}
          disabled={isSaving}
          className="flex items-center justify-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 disabled:opacity-60 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      {isLoading || !buckets ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Bucket
            title="Overdue"
            count={buckets.counts.overdue}
            icon={AlertCircle}
            accent="text-red-500"
            items={buckets.overdue}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
          <Bucket
            title="Today"
            count={buckets.counts.today}
            icon={CalendarDays}
            accent="text-amber-500"
            items={buckets.today}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
          <Bucket
            title="Upcoming"
            count={buckets.counts.upcoming}
            icon={CalendarClock}
            accent="text-blue-500"
            items={buckets.upcoming}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        </div>
      )}

      {buckets && buckets.noDueDate && buckets.noDueDate.length > 0 && (
        <Bucket
          title="No due date"
          count={buckets.counts.noDueDate}
          icon={Inbox}
          accent="text-neutral-400"
          items={buckets.noDueDate}
          onToggle={handleToggle}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}