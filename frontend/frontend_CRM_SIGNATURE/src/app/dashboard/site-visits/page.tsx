'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { SiteVisit } from '@/types/siteVisit';
import { listSiteVisitsRequest } from '@/lib/api/siteVisit-api';
import { SiteVisitCard } from '@/components/site-visits/site-visit-card';

function groupByDate(visits: SiteVisit[]) {
  const groups: Record<string, SiteVisit[]> = {};
  for (const visit of visits) {
    const dateKey = new Date(visit.scheduledAt).toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(visit);
  }
  return groups;
}

export default function SiteVisitsPage() {
  const [siteVisits, setSiteVisits] = useState<SiteVisit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchVisits = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await listSiteVisitsRequest({ limit: 100 } as any);
      setSiteVisits(result.siteVisits);
    } catch {
      toast.error('Failed to load site visits');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  const grouped = groupByDate(siteVisits);
  const dateKeys = Object.keys(grouped);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Site Visits</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Upcoming and past property viewings
          </p>
        </div>
        <Link
          href="/dashboard/site-visits/new"
          className="flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          <Plus size={16} /> Schedule Visit
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900" />
          ))}
        </div>
      ) : dateKeys.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 py-16 text-center dark:border-neutral-700">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No site visits scheduled yet.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {dateKeys.map((dateKey) => (
            <div key={dateKey}>
              <h2 className="mb-2 text-sm font-semibold text-neutral-500 dark:text-neutral-400">
                {dateKey}
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {grouped[dateKey].map((visit) => (
                  <SiteVisitCard key={visit.id} siteVisit={visit} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}