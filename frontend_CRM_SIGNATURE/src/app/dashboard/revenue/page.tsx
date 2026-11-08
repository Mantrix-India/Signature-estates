'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { RevenueSummary, CommissionBreakdownRow, PendingPayments } from '@/types/revenue';
import {
  getRevenueSummaryRequest,
  getCommissionBreakdownRequest,
  getPendingPaymentsRequest,
} from '@/lib/api/revenue-api';
import { DealsByStageChart } from '@/components/revenue/deals-by-stage-chart';
import { formatCurrency, isPrivilegedRole, COMMISSION_STATUS_COLORS } from '@/lib/deals';
import { CommissionStatus } from '@/types/deal';
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';

export default function RevenuePage() {
  const { user, isLoading: authLoading } = useAuth();
  const privileged = isPrivilegedRole(user?.role);

  const [summary, setSummary] = useState<RevenueSummary | null>(null);
  const [breakdown, setBreakdown] = useState<CommissionBreakdownRow[]>([]);
  const [pending, setPending] = useState<PendingPayments | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!privileged) {
      setIsLoading(false);
      return;
    }
    Promise.all([
      getRevenueSummaryRequest(),
      getCommissionBreakdownRequest(),
      getPendingPaymentsRequest(),
    ])
      .then(([s, b, p]) => {
        setSummary(s);
        setBreakdown(b);
        setPending(p);
      })
      .catch(() => toast.error('Failed to load revenue'))
      .finally(() => setIsLoading(false));
  }, [privileged]);

  if (!authLoading && !privileged) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-300 py-16 text-center dark:border-neutral-700">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Revenue is available to admins and managers only.
        </p>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Revenue</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Deal value, commission and outstanding payments</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Completed value" value={formatCurrency(summary?.completed.value ?? 0)} sub={`${summary?.completed.count ?? 0} deals`} />
            <StatCard label="Commission (gross)" value={formatCurrency(summary?.commission.gross ?? 0)} />
            <StatCard label="Company share" value={formatCurrency(summary?.commission.company ?? 0)} />
            <StatCard label="Pending payments" value={formatCurrency(summary?.payments.pendingTotal ?? 0)} />
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="mb-4 text-sm font-semibold text-neutral-900 dark:text-white">Deal value by stage</h3>
            <DealsByStageChart data={summary?.dealsByStage ?? []} />
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="mb-4 text-sm font-semibold text-neutral-900 dark:text-white">Commission by agent</h3>
            {breakdown.length === 0 ? (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">No commission recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-100 text-left text-xs text-neutral-400 dark:border-neutral-800">
                      <th className="pb-2 font-medium">Agent</th>
                      <th className="pb-2 font-medium">Status</th>
                      <th className="pb-2 text-right font-medium">Deals</th>
                      <th className="pb-2 text-right font-medium">Gross</th>
                      <th className="pb-2 text-right font-medium">Agent</th>
                      <th className="pb-2 text-right font-medium">Company</th>
                    </tr>
                  </thead>
                  <tbody>
                    {breakdown.map((r, i) => (
                      <tr key={i} className="border-b border-neutral-50 last:border-0 dark:border-neutral-800/50">
                        <td className="py-2 text-neutral-900 dark:text-white">{r.agentName ?? '—'}</td>
                        <td className="py-2">
                          <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-medium', COMMISSION_STATUS_COLORS[r.status as CommissionStatus])}>
                            {r.status}
                          </span>
                        </td>
                        <td className="py-2 text-right text-neutral-600 dark:text-neutral-300">{r.count}</td>
                        <td className="py-2 text-right text-neutral-600 dark:text-neutral-300">{formatCurrency(r.gross)}</td>
                        <td className="py-2 text-right text-neutral-600 dark:text-neutral-300">{formatCurrency(r.agent)}</td>
                        <td className="py-2 text-right text-neutral-600 dark:text-neutral-300">{formatCurrency(r.company)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Pending payments</h3>
              {pending && (
                <p className="text-xs text-neutral-400">
                  Overdue {formatCurrency(pending.overdueTotal)} · Upcoming {formatCurrency(pending.upcomingTotal)}
                </p>
              )}
            </div>
            {!pending || pending.items.length === 0 ? (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">No outstanding payments.</p>
            ) : (
              <div className="space-y-2">
                                {pending.items.map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-3 rounded-lg border border-neutral-100 px-3 py-2 dark:border-neutral-800">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
                        {formatCurrency(p.amount)}
                        {p.deal?.client ? <span className="text-neutral-400"> · {p.deal.client.fullName}</span> : null}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {p.dueDate ? `Due ${new Date(p.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}` : 'No due date'}
                      </p>
                    </div>
                    <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium', p.isOverdue ? 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400' : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400')}>
                      {p.isOverdue ? 'Overdue' : 'Upcoming'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <p className="text-xs text-neutral-400">{label}</p>
      <p className="mt-1 text-xl font-semibold text-neutral-900 dark:text-white">{value}</p>
      {sub && <p className="text-xs text-neutral-400">{sub}</p>}
    </div>
  );
}