'use client';

import { useCallback, useEffect, useState } from 'react';
import type { AnalyticsSnapshot } from '@/types/analytics';
import { getAnalyticsSnapshotRequest } from '@/lib/api/analytics-api';

/**
 * Shared loader for the analytics snapshot. The dashboard and the analytics page
 * both use this hook, so they read identical numbers. Refetches when the tab
 * regains focus so figures stay current after edits made elsewhere.
 */
export function useAnalyticsSnapshot() {
  const [snapshot, setSnapshot] = useState<AnalyticsSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getAnalyticsSnapshotRequest();
      setSnapshot(data);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    getAnalyticsSnapshotRequest()
      .then((data) => {
        if (!active) return;
        setSnapshot(data);
        setError(false);
      })
      .catch(() => active && setError(true))
      .finally(() => active && setIsLoading(false));

    function onFocus() {
      if (document.visibilityState === 'visible') load();
    }
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      active = false;
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [load]);

  return { snapshot, isLoading, error, reload: load };
}
