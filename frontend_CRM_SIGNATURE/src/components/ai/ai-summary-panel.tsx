'use client';

import { useState } from 'react';
import { Sparkles, Loader2, TrendingUp, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { aiSummaryRequest } from '@/lib/api/ai-api';
import { AiSummaryResponse } from '@/types/ai';

export function AiSummaryPanel({ propertyId }: { propertyId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<AiSummaryResponse | null>(null);

  async function handleGenerate() {
    setIsLoading(true);
    try {
      const result = await aiSummaryRequest(propertyId);
      setSummary(result);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || 'AI summary is temporarily unavailable. Please try again shortly.'
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-neutral-900 dark:text-white">
          <Sparkles size={14} /> AI Summary
        </h2>
        {summary && (
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-700 disabled:opacity-50 dark:text-neutral-400 dark:hover:text-neutral-200"
          >
            {isLoading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
            Refresh
          </button>
        )}
      </div>

      {!summary ? (
        <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Generate an AI-written overview with pros, cons, and an investment note.
          </p>
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {isLoading ? 'Generating...' : 'Generate AI Summary'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-neutral-700 dark:text-neutral-300">{summary.summary}</p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <h3 className="mb-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">Pros</h3>
              <ul className="space-y-1">
                {summary.pros.map((p, i) => (
                  <li key={i} className="text-xs text-neutral-600 dark:text-neutral-400">• {p}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-2 text-xs font-semibold text-amber-600 dark:text-amber-400">Cons</h3>
              <ul className="space-y-1">
                {summary.cons.map((c, i) => (
                  <li key={i} className="text-xs text-neutral-600 dark:text-neutral-400">• {c}</li>
                ))}
              </ul>
            </div>
          </div>

          {summary.investment_score != null && (
            <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800">
              <div className="flex items-center gap-2">
                <TrendingUp size={14} className="text-neutral-500 dark:text-neutral-400" />
                <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                  Investment Score: {summary.investment_score}/10
                </span>
              </div>
              {summary.investment_note && (
                <p className="mt-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                  {summary.investment_note}
                </p>
              )}
            </div>
          )}

          <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
            {summary.cached ? 'Cached' : 'Freshly generated'} · AI-generated, verify independently
          </p>
        </div>
      )}
    </div>
  );
}