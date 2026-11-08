'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Trash2 } from 'lucide-react';
import { Deal, PaymentStatus } from '@/types/deal';
import { PAYMENT_STATUS_COLORS, PAYMENT_METHODS, formatCurrency } from '@/lib/deals';
import {
  createPaymentRequest,
  updatePaymentRequest,
  deletePaymentRequest,
} from '@/lib/api/payment-api';
import { cn } from '@/lib/utils';

const PAYMENT_STATUSES: PaymentStatus[] = ['PENDING', 'PAID', 'OVERDUE', 'CANCELLED'];

const inputClass =
  'w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white';

export function PaymentsPanel({ deal, onRefresh }: { deal: Deal; onRefresh: () => void }) {
  const payments = deal.payments ?? [];
  const [amount, setAmount] = useState('');
  const [label, setLabel] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [method, setMethod] = useState('');
  const [busy, setBusy] = useState(false);

  async function add() {
    const value = Number(amount);
    if (!value || value <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    setBusy(true);
    try {
      await createPaymentRequest({
        dealId: deal.id,
        amount: value,
        label: label || undefined,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        method: (method || undefined) as never,
      });
      toast.success('Payment added');
      setAmount('');
      setLabel('');
      setDueDate('');
      setMethod('');
      onRefresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to add payment');
    } finally {
      setBusy(false);
    }
  }

  async function changeStatus(id: string, status: PaymentStatus) {
    try {
      await updatePaymentRequest(id, { status });
      toast.success('Payment updated');
      onRefresh();
    } catch {
      toast.error('Failed to update payment');
    }
  }

  async function remove(id: string) {
    try {
      await deletePaymentRequest(id);
      toast.success('Payment removed');
      onRefresh();
    } catch {
      toast.error('Failed to remove payment');
    }
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Payments</h3>

      <div className="mt-4 space-y-2">
        {payments.length === 0 && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400">No payments scheduled yet.</p>
        )}
        {payments.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-neutral-100 px-3 py-2 dark:border-neutral-800"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
                {formatCurrency(p.amount)}
                {p.label ? <span className="text-neutral-400"> · {p.label}</span> : null}
              </p>
              <p className="text-xs text-neutral-400">
                {p.dueDate
                  ? `Due ${new Date(p.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
                  : 'No due date'}
                {p.method ? ` · ${p.method}` : ''}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-medium', PAYMENT_STATUS_COLORS[p.status])}>
                {p.status}
              </span>
              <select
                value={p.status}
                onChange={(e) => changeStatus(p.id, e.target.value as PaymentStatus)}
                className="rounded-lg border border-neutral-200 bg-white px-1.5 py-1 text-xs text-neutral-900 outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
              >
                {PAYMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button
                onClick={() => remove(p.id)}
                aria-label="Delete payment"
                className="text-neutral-400 transition-colors hover:text-red-500"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-neutral-100 pt-4 dark:border-neutral-800">
        <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder="Amount ₹" className={inputClass} />
        <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label (e.g. Booking)" className={inputClass} />
        <input value={dueDate} onChange={(e) => setDueDate(e.target.value)} type="date" className={inputClass} />
        <select value={method} onChange={(e) => setMethod(e.target.value)} className={inputClass}>
          <option value="">Method</option>
          {PAYMENT_METHODS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <button
          onClick={add}
          disabled={busy}
          className="col-span-2 rounded-lg bg-neutral-900 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          {busy ? 'Adding...' : 'Add payment'}
        </button>
      </div>
    </div>
  );
}