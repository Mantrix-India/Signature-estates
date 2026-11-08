'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link2, Copy, RefreshCw, Ban } from 'lucide-react';
import {
  regeneratePortalTokenRequest,
  revokePortalTokenRequest,
} from '@/lib/api/client-api';

const actionBtn =
  'flex items-center gap-1.5 rounded-lg border border-neutral-200 px-2.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800';

function toExpiryIso(dateStr: string): string | undefined {
  if (!dateStr) return undefined;
  return new Date(`${dateStr}T23:59:59`).toISOString();
}

export function PortalAccessPanel({
  clientId,
  portalToken,
  portalTokenExpiresAt,
  portalTokenRevokedAt,
  onChanged,
}: {
  clientId: string;
  portalToken?: string | null;
  portalTokenExpiresAt?: string | null;
  portalTokenRevokedAt?: string | null;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [expiry, setExpiry] = useState('');

  const portalUrl =
    portalToken && typeof window !== 'undefined'
      ? `${window.location.origin}/portal/${portalToken}`
      : '';

  const isRevoked = !!portalTokenRevokedAt;
  const isExpired =
    !!portalTokenExpiresAt && new Date(portalTokenExpiresAt).getTime() < Date.now();
  const status = !portalToken
    ? { label: 'No link', className: 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400' }
    : isRevoked
    ? { label: 'Revoked', className: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400' }
    : isExpired
    ? { label: 'Expired', className: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' }
    : { label: 'Active', className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' };

  async function copyLink() {
    if (!portalUrl) return;
    try {
      await navigator.clipboard.writeText(portalUrl);
      toast.success('Portal link copied');
    } catch {
      toast.error('Could not copy link');
    }
  }

  async function regenerate() {
    setBusy(true);
    try {
      await regeneratePortalTokenRequest(clientId, toExpiryIso(expiry));
      toast.success('Portal link regenerated');
      onChanged();
    } catch {
      toast.error('Failed to regenerate link');
    } finally {
      setBusy(false);
    }
  }

  async function revoke() {
    if (!confirm('Revoke this portal link? The client will lose access until you regenerate it.'))
      return;
    setBusy(true);
    try {
      await revokePortalTokenRequest(clientId);
      toast.success('Portal link revoked');
      onChanged();
    } catch {
      toast.error('Failed to revoke link');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-white">
          <Link2 size={14} /> Portal Access
        </h2>
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${status.className}`}>
          {status.label}
        </span>
      </div>

      {portalTokenExpiresAt && !isRevoked && (
        <p className="mt-2 text-xs text-neutral-400 dark:text-neutral-500">
          {isExpired ? 'Expired on ' : 'Expires '}
          {new Date(portalTokenExpiresAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={copyLink} disabled={!portalToken || isRevoked} className={`${actionBtn} disabled:opacity-40`}>
          <Copy size={13} /> Copy link
        </button>
        <button onClick={regenerate} disabled={busy} className={actionBtn}>
          <RefreshCw size={13} /> {portalToken ? 'Regenerate' : 'Generate'}
        </button>
        {portalToken && !isRevoked && (
          <button onClick={revoke} disabled={busy} className={`${actionBtn} text-rose-600 dark:text-rose-400`}>
            <Ban size={13} /> Revoke
          </button>
        )}
      </div>

      <div className="mt-3">
        <label className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400">
          Set expiry on next regenerate (optional)
        </label>
        <input
          type="date"
          value={expiry}
          onChange={(e) => setExpiry(e.target.value)}
          className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
        />
      </div>
    </div>
  );
}