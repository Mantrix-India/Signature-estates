'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  Copy,
  MessageCircle,
  Plus,
  Trash2,
  RefreshCw,
  Ban,
  Archive,
  ArchiveRestore,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Collection } from '@/types/collection';
import { formatPrice } from '@/lib/format';
import {
  addCollectionPropertyRequest,
  removeCollectionPropertyRequest,
  revokeCollectionRequest,
  regenerateCollectionRequest,
  updateCollectionRequest,
} from '@/lib/api/collection-api';
import { PropertyPicker } from './property-picker';

function collectionStatus(c: Collection): { label: string; className: string } {
  if (c.isArchived)
    return { label: 'Archived', className: 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400' };
  if (c.revokedAt)
    return { label: 'Revoked', className: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400' };
  if (c.expiresAt && new Date(c.expiresAt).getTime() < Date.now())
    return { label: 'Expired', className: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' };
  return { label: 'Active', className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' };
}

const actionBtn =
  'flex items-center gap-1.5 rounded-lg border border-neutral-200 px-2.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800';

export function CollectionCard({
  collection,
  onChanged,
}: {
  collection: Collection;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [showManage, setShowManage] = useState(false);

  const portalUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/portal/c/${collection.accessToken}`
      : '';
  const status = collectionStatus(collection);
  const existingIds = collection.sharedProperties.map((s) => s.propertyId);

  async function run(fn: () => Promise<unknown>, successMsg: string) {
    setBusy(true);
    try {
      await fn();
      toast.success(successMsg);
      onChanged();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(portalUrl);
      toast.success('Collection link copied');
    } catch {
      toast.error('Could not copy link');
    }
  }

  function shareWhatsApp() {
    const text = `Hi ${collection.client?.fullName ?? ''}, here are some properties I picked for you: ${collection.name}\n${portalUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-neutral-900 dark:text-white">
              {collection.name}
            </h3>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${status.className}`}>
              {status.label}
            </span>
          </div>
          {collection.description && (
            <p className="mt-0.5 truncate text-xs text-neutral-500 dark:text-neutral-400">
              {collection.description}
            </p>
          )}
          <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
            {collection.sharedProperties.length} propert
            {collection.sharedProperties.length === 1 ? 'y' : 'ies'}
            {collection.expiresAt &&
              ` · expires ${new Date(collection.expiresAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}`}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={copyLink} className={actionBtn}>
          <Copy size={13} /> Copy link
        </button>
        <button onClick={shareWhatsApp} className={actionBtn}>
          <MessageCircle size={13} /> WhatsApp
        </button>
        <button onClick={() => setShowManage((v) => !v)} className={actionBtn}>
          {showManage ? <ChevronUp size={13} /> : <ChevronDown size={13} />} Manage
        </button>
        {collection.revokedAt ? (
          <button
            disabled={busy}
            onClick={() => run(() => regenerateCollectionRequest(collection.id), 'Access regenerated')}
            className={actionBtn}
          >
            <RefreshCw size={13} /> Regenerate
          </button>
        ) : (
          <button
            disabled={busy}
            onClick={() => run(() => revokeCollectionRequest(collection.id), 'Access revoked')}
            className={actionBtn}
          >
            <Ban size={13} /> Revoke
          </button>
        )}
        <button
          disabled={busy}
          onClick={() =>
            run(
              () => updateCollectionRequest(collection.id, { isArchived: !collection.isArchived }),
              collection.isArchived ? 'Collection restored' : 'Collection archived'
            )
          }
          className={actionBtn}
        >
          {collection.isArchived ? (
            <>
              <ArchiveRestore size={13} /> Restore
            </>
          ) : (
            <>
              <Archive size={13} /> Archive
            </>
          )}
        </button>
      </div>

      {showManage && (
        <div className="mt-4 space-y-4 border-t border-neutral-100 pt-4 dark:border-neutral-800">
          <div className="space-y-2">
            {collection.sharedProperties.length === 0 ? (
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                No properties in this collection yet.
              </p>
            ) : (
              collection.sharedProperties.map((s) => (
                <div key={s.id} className="flex items-center justify-between text-sm">
                  <span className="min-w-0 truncate text-neutral-700 dark:text-neutral-300">
                    {s.property.title}
                    <span className="ml-2 text-xs text-neutral-400">
                      {formatPrice(s.property.price)}
                    </span>
                  </span>
                  <button
                    disabled={busy}
                    onClick={() =>
                      run(
                        () => removeCollectionPropertyRequest(collection.id, s.propertyId),
                        'Property removed'
                      )
                    }
                    className="ml-3 rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-rose-600 dark:hover:bg-neutral-800"
                    aria-label="Remove property"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300">
              <Plus size={13} /> Add properties
            </p>
            <PropertyPicker
              selectedIds={existingIds}
              onToggle={(propertyId) => {
                if (existingIds.includes(propertyId)) {
                  run(
                    () => removeCollectionPropertyRequest(collection.id, propertyId),
                    'Property removed'
                  );
                } else {
                  run(
                    () => addCollectionPropertyRequest(collection.id, propertyId),
                    'Property added'
                  );
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}