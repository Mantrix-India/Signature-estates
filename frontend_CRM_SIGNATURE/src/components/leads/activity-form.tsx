'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { ActivityType } from '@/types/lead';

const types: ActivityType[] = ['CALL', 'EMAIL', 'MEETING', 'NOTE', 'OTHER'];

export function ActivityForm({
  onSubmit,
}: {
  onSubmit: (activityType: ActivityType, description: string) => Promise<void>;
}) {
  const [type, setType] = useState<ActivityType>('CALL');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit(type, description);
      setDescription('');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <select
        value={type}
        onChange={(e) => setType(e.target.value as ActivityType)}
        className="rounded-lg border border-neutral-200 bg-white px-2 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
      >
        {types.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Log an activity..."
        className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
      />
      <button
        type="submit"
        disabled={isSubmitting || !description.trim()}
        className="flex items-center justify-center rounded-lg bg-neutral-900 px-3 py-2 text-white hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        aria-label="Add activity"
      >
        <Send size={16} />
      </button>
    </form>
  );
}