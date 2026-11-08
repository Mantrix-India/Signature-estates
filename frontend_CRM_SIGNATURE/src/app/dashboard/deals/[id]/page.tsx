'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Deal, DealStage } from '@/types/deal';
import { getDealRequest, transitionDealRequest, deleteDealRequest } from '@/lib/api/deal-api';
import { StageTransition } from '@/components/deals/stage-transition';
import { PaymentsPanel } from '@/components/deals/payments-panel';
import { CommissionPanel } from '@/components/deals/commission-panel';
import { DocumentsPanel } from '@/components/deals/documents-panel';
import { OfferTracker } from '@/components/offers/offer-tracker';
import { DEAL_STAGE_LABELS, DEAL_STAGE_COLORS, formatCurrency, isPrivilegedRole } from '@/lib/deals';
import { useAuth } from '@/context/auth-context';

function fmtDate(value?: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function DealDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const privileged = isPrivilegedRole(user?.role);

  const [deal, setDeal] = useState<Deal | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDeal = useCallback(async () => {
    try {
      const result = await getDealRequest(id);
      setDeal(result);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load deal');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDeal();
  }, [fetchDeal]);

  async function handleTransition(stage: DealStage, cancelReason?: string) {
    try {
      await transitionDealRequest(id, { stage, cancelReason });
      toast.success(`Moved to ${DEAL_STAGE_LABELS[stage]}`);
      fetchDeal();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Transition not allowed');
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this deal? Payments and commission will be removed too.')) return;
    try {
      await deleteDealRequest(id);
      toast.success('Deal deleted');
      router.push('/dashboard/deals');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete deal');
    }
  }

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-xl border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900" />;
  }

  if (!deal) {
    return (
      <div className="space-y-4">
        <Link href="/dashboard/deals" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white">
          <ArrowLeft size={15} /> Back to deals
        </Link>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Deal not found.</p>
      </div>
    );
  }

  const color = DEAL_STAGE_COLORS[deal.stage];
  const timeline: { label: string; value: string | null }[] = [
    { label: 'Booked', value: fmtDate(deal.bookingDate) },
    { label: 'Agreement', value: fmtDate(deal.agreementDate) },
    { label: 'Loan approved', value: fmtDate(deal.loanApprovalDate) },
    { label: 'Registered', value: fmtDate(deal.registrationDate) },
    { label: 'Completed', value: fmtDate(deal.completedDate) },
    { label: 'Cancelled', value: fmtDate(deal.cancelledAt) },
  ].filter((t) => t.value);

  return (
    <div className="space-y-6">
      <Link href="/dashboard/deals" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white">
        <ArrowLeft size={15} /> Back to deals
      </Link>

      <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">{deal.client.fullName}</h1>
              <span className="rounded-full px-2.5 py-1 text-xs font-medium" style={{ backgroundColor: `${color}1a`, color }}>
                {DEAL_STAGE_LABELS[deal.stage]}
              </span>
            </div>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {deal.property.title}
              {deal.property.city ? ` · ${deal.property.city}` : ''} · Agent: {deal.agent.fullName}
            </p>
            {deal.owner && (
              <p className="text-xs text-neutral-400">Owner: {deal.owner.fullName} · {deal.owner.phone}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-2xl font-semibold text-neutral-900 dark:text-white">{formatCurrency(deal.dealValue)}</p>
            {privileged && (
              <button
                onClick={handleDelete}
                className="mt-2 inline-flex items-center gap-1.5 text-xs text-neutral-400 transition-colors hover:text-red-500"
              >
                <Trash2 size={13} /> Delete deal
              </button>
            )}
          </div>
        </div>

        {deal.cancelReason && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-500/10 dark:text-red-400">
            Cancelled: {deal.cancelReason}
          </p>
        )}

        {timeline.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-neutral-100 pt-4 dark:border-neutral-800">
            {timeline.map((t) => (
              <div key={t.label}>
                <p className="text-[11px] uppercase tracking-wide text-neutral-400">{t.label}</p>
                <p className="text-sm text-neutral-900 dark:text-white">{t.value}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 border-t border-neutral-100 pt-4 dark:border-neutral-800">
          <p className="mb-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">Stage</p>
          <StageTransition deal={deal} onTransition={handleTransition} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <PaymentsPanel deal={deal} onRefresh={fetchDeal} />
        {privileged && <CommissionPanel deal={deal} onRefresh={fetchDeal} />}
        <DocumentsPanel deal={deal} onRefresh={fetchDeal} />
        <OfferTracker leadId={deal.leadId} defaultPropertyId={deal.propertyId} />
      </div>
    </div>
  );
}