'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Deal, CommissionStatus } from '@/types/deal';
import { COMMISSION_STATUS_COLORS, formatCurrency } from '@/lib/deals';
import {
  upsertCommissionRequest,
  updateCommissionRequest,
  deleteCommissionRequest,
} from '@/lib/api/commission-api';
import { cn } from '@/lib/utils';

const COMMISSION_STATUSES: CommissionStatus[] = ['PENDING', 'RECEIVED', 'PAID_OUT', 'CANCELLED'];

const inputClass =
  'w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white';
const labelClass = 'mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300';

export function CommissionPanel({ deal, onRefresh }: { deal: Deal; onRefresh: () => void }) {
  const commission = deal.commission ?? null;
  const [mode, setMode] = useState<'amount' | 'percent'>('amount');
  const [gross, setGross] = useState('');
  const [agentPercent, setAgentPercent] = useState('30');
  const [busy, setBusy] = useState(false);

  async function save() {
    const grossVal = Number(gross);
    if (!grossVal || grossVal <= 0) {
      toast.error(mode === 'amount' ? 'Enter a gross amount' : 'Enter a gross percentage');
      return;
    }
    setBusy(true);
    try {
      await upsertCommissionRequest({
        dealId: deal.id,
        grossAmount: mode === 'amount' ? grossVal : undefined,
        grossPercent: mode === 'percent' ? grossVal : undefined,
        agentPercent: agentPercent ? Number(agentPercent) : undefined,
      });
      toast.success('Commission saved');
      setGross('');
      onRefresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save commission');
    } finally {
      setBusy(false);
    }
  }

  async function changeStatus(status: CommissionStatus) {
    if (!commission) return;
    try {
      await updateCommissionRequest(commission.id, { status });
      toast.success('Commission updated');
      onRefresh();
    } catch {
      toast.error('Failed to update commission');
    }
  }

  async function remove() {
    if (!commission) return;
    try {
      await deleteCommissionRequest(commission.id);
      toast.success('Commission removed');
      onRefresh();
    } catch {
      toast.error('Failed to remove commission');
    }
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Commission</h3>

      {commission ? (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Gross" value={formatCurrency(commission.grossAmount)} />
            <Stat label={`Agent (${commission.agentPercent}%)`} value={formatCurrency(commission.agentAmount)} />
            <Stat label="Company" value={formatCurrency(commission.companyAmount)} />
            <div>
              <p className="text-xs text-neutral-400">Status</p>
              <span className={cn('mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium', COMMISSION_STATUS_COLORS[commission.status])}>
                {commission.status}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 border-t border-neutral-100 pt-3 dark:border-neutral-800">
            <select
              value={commission.status}
              onChange={(e) => changeStatus(e.target.value as CommissionStatus)}
              className={inputClass}
            >
              {COMMISSION_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button
              onClick={remove}
              className="shrink-0 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-neutral-800 dark:hover:bg-red-500/10"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <div className="flex gap-2">
            <button
              onClick={() => setMode('amount')}
              className={cn('rounded-lg border px-3 py-1.5 text-xs font-medium', mode === 'amount' ? 'border-neutral-900 text-neutral-900 dark:border-white dark:text-white' : 'border-neutral-200 text-neutral-500 dark:border-neutral-800')}
            >
              Gross amount
            </button>
            <button
              onClick={() => setMode('percent')}
              className={cn('rounded-lg border px-3 py-1.5 text-xs font-medium', mode === 'percent' ? 'border-neutral-900 text-neutral-900 dark:border-white dark:text-white' : 'border-neutral-200 text-neutral-500 dark:border-neutral-800')}
            >
              % of deal value
            </button>
          </div>
          <div>
            <label className={labelClass}>{mode === 'amount' ? 'Gross commission (₹)' : 'Gross commission (% of deal value)'}</label>
            <input value={gross} onChange={(e) => setGross(e.target.value)} type="number" className={inputClass} placeholder={mode === 'amount' ? '150000' : '2'} />
          </div>
          <div>
            <label className={labelClass}>Agent share (%)</label>
            <input value={agentPercent} onChange={(e) => setAgentPercent(e.target.value)} type="number" className={inputClass} placeholder="30" />
          </div>
          <button
            onClick={save}
            disabled={busy}
            className="w-full rounded-lg bg-neutral-900 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            {busy ? 'Saving...' : 'Set commission'}
          </button>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-neutral-400">{label}</p>
      <p className="text-sm font-semibold text-neutral-900 dark:text-white">{value}</p>
    </div>
  );
}