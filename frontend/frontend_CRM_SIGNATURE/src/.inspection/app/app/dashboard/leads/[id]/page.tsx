'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Phone, Home } from 'lucide-react';
import toast from 'react-hot-toast';
import { Lead, LeadStage, ActivityType } from '@/types/lead';
import { UserSummary } from '@/types/user';
import {
  getLeadRequest,
  updateLeadStageRequest,
  addActivityRequest,
  addTaskRequest,
  toggleTaskRequest,
} from '@/lib/api/lead-api';
import { listUsersRequest } from '@/lib/api/user-api';
import { ActivityForm } from '@/components/leads/activity-form';
import { TaskList } from '@/components/leads/task-list';

const stages: LeadStage[] = ['NEW', 'CONTACTED', 'QUALIFIED', 'NEGOTIATION', 'WON', 'LOST'];

function formatPrice(price: number) {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
  return `₹${price.toLocaleString('en-IN')}`;
}

export default function LeadDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLead = useCallback(async () => {
    try {
      const data = await getLeadRequest(params.id);
      setLead(data);
    } catch {
      toast.error('Lead not found');
      router.push('/dashboard/leads');
    } finally {
      setIsLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    fetchLead();
    listUsersRequest().then(setUsers).catch(() => {});
  }, [fetchLead]);

  async function handleStageChange(stage: LeadStage) {
    try {
      await updateLeadStageRequest(params.id, stage);
      toast.success('Stage updated');
      fetchLead();
    } catch {
      toast.error('Failed to update stage');
    }
  }

  async function handleAddActivity(activityType: ActivityType, description: string) {
    try {
      await addActivityRequest(params.id, { activityType, description });
      fetchLead();
    } catch {
      toast.error('Failed to log activity');
    }
  }

  async function handleAddTask(title: string, dueDate: string, assignedToId: string) {
    try {
      await addTaskRequest(params.id, {
        title,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        assignedToId,
      });
      fetchLead();
    } catch {
      toast.error('Failed to add task');
    }
  }

  async function handleToggleTask(taskId: string, isCompleted: boolean) {
    try {
      await toggleTaskRequest(params.id, taskId, isCompleted);
      fetchLead();
    } catch {
      toast.error('Failed to update task');
    }
  }

  if (isLoading) {
    return <p className="text-sm text-neutral-500 dark:text-neutral-400">Loading...</p>;
  }

  if (!lead) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
            <Link href={`/dashboard/clients/${lead.client.id}`} className="hover:underline">
              {lead.client.fullName}
            </Link>
          </h1>
          <div className="mt-2 flex items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400">
            <span className="flex items-center gap-1.5">
              <Phone size={13} /> {lead.client.phone}
            </span>
            {lead.property && (
              <span className="flex items-center gap-1.5">
                <Home size={13} /> {lead.property.title} · {formatPrice(lead.property.price)}
              </span>
            )}
          </div>
        </div>

        <select
          value={lead.stage}
          onChange={(e) => handleStageChange(e.target.value as LeadStage)}
          className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
        >
          {stages.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-white">Activities</h2>
          <ActivityForm onSubmit={handleAddActivity} />

          <div className="mt-4 space-y-3 border-t border-neutral-100 pt-4 dark:border-neutral-800">
            {lead.activities && lead.activities.length > 0 ? (
              lead.activities.map((a) => (
                <div key={a.id} className="text-sm">
                  <p className="text-neutral-900 dark:text-white">
                    <span className="mr-2 rounded bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                      {a.activityType}
                    </span>
                    {a.description}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-400 dark:text-neutral-500">
                    {a.createdBy.fullName} ·{' '}
                    {new Date(a.createdAt).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">No activities yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-white">Follow-up Tasks</h2>
          <TaskList
            tasks={lead.tasks || []}
            users={users}
            onAdd={handleAddTask}
            onToggle={handleToggleTask}
          />
        </div>
      </div>
    </div>
  );
}