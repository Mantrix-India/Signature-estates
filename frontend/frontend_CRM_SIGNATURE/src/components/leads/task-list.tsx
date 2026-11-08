'use client';

import { useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { LeadTask } from '@/types/lead';
import { UserSummary } from '@/types/user';

export function TaskList({
  tasks,
  users,
  onAdd,
  onToggle,
}: {
  tasks: LeadTask[];
  users: UserSummary[];
  onAdd: (title: string, dueDate: string, assignedToId: string) => Promise<void>;
  onToggle: (taskId: string, isCompleted: boolean) => Promise<void>;
}) {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assignedToId, setAssignedToId] = useState(users[0]?.id || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !assignedToId) return;
    setIsSubmitting(true);
    try {
      await onAdd(title, dueDate, assignedToId);
      setTitle('');
      setDueDate('');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleAdd} className="flex flex-wrap gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Follow up call..."
          className="min-w-[140px] flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="rounded-lg border border-neutral-200 bg-white px-2 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
        />
        <select
          value={assignedToId}
          onChange={(e) => setAssignedToId(e.target.value)}
          className="rounded-lg border border-neutral-200 bg-white px-2 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
        >
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.fullName}</option>
          ))}
        </select>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-1 rounded-lg bg-neutral-900 px-3 py-2 text-sm text-white hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          <Plus size={14} /> Add
        </button>
      </form>

      <div className="space-y-2">
        {tasks.length === 0 && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">No tasks yet.</p>
        )}
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center justify-between rounded-lg border border-neutral-200 px-3 py-2 dark:border-neutral-800"
          >
            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggle(task.id, !task.isCompleted)}
                className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                  task.isCompleted
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : 'border-neutral-300 dark:border-neutral-700'
                }`}
                aria-label="Toggle task"
              >
                {task.isCompleted && <Check size={12} />}
              </button>
              <span
                className={`text-sm ${
                  task.isCompleted
                    ? 'text-neutral-400 line-through'
                    : 'text-neutral-900 dark:text-white'
                }`}
              >
                {task.title}
              </span>
            </div>
            <span className="text-xs text-neutral-400">
              {task.assignedTo.fullName}
              {task.dueDate && ` · ${new Date(task.dueDate).toLocaleDateString('en-IN')}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}