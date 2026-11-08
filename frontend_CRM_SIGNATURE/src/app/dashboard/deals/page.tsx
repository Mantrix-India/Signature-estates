'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Deal, DealFormValues, DealStage } from '@/types/deal';
import { Lead } from '@/types/lead';
import { Property } from '@/types/property';
import { Owner } from '@/types/owner';
import { UserSummary } from '@/types/user';
import { listDealsRequest, createDealRequest } from '@/lib/api/deal-api';
import { listLeadsRequest } from '@/lib/api/lead-api';
import { listPropertiesRequest } from '@/lib/api/property-api';
import { listOwnersRequest } from '@/lib/api/owner-api';
import { listUsersRequest } from '@/lib/api/user-api';
import { DealCard } from '@/components/deals/deal-card';
import { DealForm } from '@/components/deals/deal-form';
import { DEAL_STAGES, DEAL_STAGE_LABELS, isPrivilegedRole } from '@/lib/deals';
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';

export default function DealsPage() {
  const { user } = useAuth();
  const privileged = isPrivilegedRole(user?.role);

  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [scope, setScope] = useState<'me' | 'all'>('me');
  const [stage, setStage] = useState<DealStage | ''>('');

  const [leads, setLeads] = useState<Lead[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [users, setUsers] = useState<UserSummary[]>([]);

  const fetchDeals = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await listDealsRequest({
        scope,
        stage: stage || undefined,
        limit: 100,
      });
      setDeals(result.deals);
    } catch {
      toast.error('Failed to load deals');
    } finally {
      setIsLoading(false);
    }
  }, [scope, stage]);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  useEffect(() => {
    Promise.all([
      listLeadsRequest({ limit: 100 }),
      listPropertiesRequest({ limit: 100 }),
      listOwnersRequest({ limit: 100 }),
    ])
      .then(([leadsRes, propsRes, ownersRes]) => {
        setLeads(leadsRes.leads);
        setProperties(propsRes.properties);
        setOwners(ownersRes.owners);
      })
      .catch(() => {});
    if (isPrivilegedRole(user?.role)) {
      listUsersRequest().then(setUsers).catch(() => {});
    }
  }, [user?.role]);

  async function handleCreate(values: DealFormValues) {
    try {
      await createDealRequest(values);
      toast.success('Deal created');
      setShowForm(false);
      fetchDeals();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create deal');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Deals</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Bookings, agreements and closings</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Cancel' : 'New Deal'}
        </button>
      </div>

      {showForm && (
        <div className="mx-auto max-w-lg rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
          <DealForm
            leads={leads}
            properties={properties}
            owners={owners}
            users={users}
            canAssignAgent={privileged}
            onSubmit={handleCreate}
          />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {privileged && (
          <div className="flex rounded-lg border border-neutral-200 p-0.5 dark:border-neutral-800">
            {(['me', 'all'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setScope(s)}
                className={cn(
                  'rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors',
                  scope === s
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                )}
              >
                {s === 'me' ? 'My deals' : 'All deals'}
              </button>
            ))}
          </div>
        )}
        <select
          value={stage}
          onChange={(e) => setStage(e.target.value as DealStage | '')}
          className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-900 outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
        >
          <option value="">All stages</option>
          {DEAL_STAGES.map((s) => (
            <option key={s} value={s}>{DEAL_STAGE_LABELS[s]}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-xl border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900" />
          ))}
        </div>
      ) : deals.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 py-16 text-center dark:border-neutral-700">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">No deals yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      )}
    </div>
  );
}