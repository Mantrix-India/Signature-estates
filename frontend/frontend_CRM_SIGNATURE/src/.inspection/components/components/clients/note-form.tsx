'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';

export function NoteForm({ onSubmit }: { onSubmit: (content: string) => Promise<void> }) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit(content);
      setContent('');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Add a note..."
        className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
      />
      <button
        type="submit"
        disabled={isSubmitting || !content.trim()}
        className="flex items-center justify-center rounded-lg bg-neutral-900 px-3 py-2 text-white hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        aria-label="Add note"
      >
        <Send size={16} />
      </button>
    </form>
  );
}