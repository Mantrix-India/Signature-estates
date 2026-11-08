'use client';

import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Trash2 } from 'lucide-react';
import { Offer, OfferParty, OfferStatus } from '@/types/offer';
import { Property } from '@/types/property';
import { OFFER_STATUS_COLORS, formatCurrency } from '@/lib/deals';
import {
  listOffersRequest,
  createOfferRequest,
  updateOfferRequest,
  deleteOfferRequest,
} from '@/lib/api/offer-api';
import { listPropertiesRequest } from '@/lib/api/property-api';
import { cn } from '@/lib/utils';

const OFFER_STATUSES: OfferStatus[] = [
  'PROPOSED',
  'COUNTERED',
  'ACCEPTED',
  'REJECTED',
  'WITHDRAWN',
  'EXPIRED',
];

const inputClass =
  'w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white';

export function OfferTracker({
  leadId,
  defaultPropertyId,
}: {
  leadId: string;
  defaultPropertyId?: string;
}) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [party, setParty] = useState<OfferParty>('BUYER');
  const [propertyId, setPropertyId] = useState(defaultPropertyId ?? '');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const result = await listOffersRequest({ leadId });
      setOffers(result);
    } catch {
      toast.error('Failed to load offers');
    } finally {
      setIsLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    load();
    listPropertiesRequest({ limit: 100 })
      .then((res) => setProperties(res.properties))
      .catch(() => {});
  }, [load]);

  async function add() {
    const value = Number(amount);
    if (!propertyId) {
      toast.error('Select a property');
      return;
    }
    if (!value || value <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    setBusy(true);
    try {
      await createOfferRequest({ leadId, propertyId, party, amount: value, note: note || undefined });
      toast.success('Offer recorded');
      setAmount('');
      setNote('');
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to record offer');
    } finally {
      setBusy(false);
    }
  }

  async function changeStatus(id: string, status: OfferStatus) {
    try {
      await updateOfferRequest(id, { status });
      load();
    } catch {
      toast.error('Failed to update offer');
    }
  }

  async function remove(id: string) {
    try {
      await deleteOfferRequest(id);
      load();
    } catch {
      toast.error('Failed to remove offer');
    }
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Offers &amp; negotiation</h3>

      <div className="mt-4 space-y-2">
        {isLoading ? (
          <p className="text-xs text-neutral-400">Loading offers...</p>
        ) : offers.length === 0 ? (
          <p className="text-xs text-neutral-500 dark:text-neutral-400">No offers recorded yet.</p>
        ) : (
          offers.map((o) => (
            <div
              key={o.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-neutral-100 px-3 py-2 dark:border-neutral-800"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
                  {formatCurrency(o.amount)}
                  <span className="text-neutral-400"> · {o.party}</span>
                </p>
                <p className="text-xs text-neutral-400">
                  {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  {o.note ? ` · ${o.note}` : ''}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-medium', OFFER_STATUS_COLORS[o.status])}>
                  {o.status}
                </span>
                <select
                  value={o.status}
                  onChange={(e) => changeStatus(o.id, e.target.value as OfferStatus)}
                  className="rounded-lg border border-neutral-200 bg-white px-1.5 py-1 text-xs text-neutral-900 outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
                >
                  {OFFER_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <button
                  onClick={() => remove(o.id)}
                  aria-label="Delete offer"
                  className="text-neutral-400 transition-colors hover:text-red-500"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-neutral-100 pt-4 dark:border-neutral-800">
        <select value={party} onChange={(e) => setParty(e.target.value as OfferParty)} className={inputClass}>
          <option value="BUYER">Buyer</option>
          <option value="SELLER">Seller</option>
        </select>
        <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder="Amount ₹" className={inputClass} />
        <select value={propertyId} onChange={(e) => setPropertyId(e.target.value)} className={cn(inputClass, 'col-span-2')}>
          <option value="">Select property</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional)" className={cn(inputClass, 'col-span-2')} />
        <button
          onClick={add}
          disabled={busy}
          className="col-span-2 rounded-lg bg-neutral-900 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          {busy ? 'Recording...' : 'Record offer'}
        </button>
      </div>
    </div>
  );
}