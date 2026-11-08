'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Phone, Mail, Trash2, Heart, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Client, ClientStatus, RequirementFormValues } from '@/types/client';
import { ClientEngagement } from '@/types/engagement';
import {
  getClientRequest,
  updateClientRequest,
  deleteClientRequest,
  addRequirementRequest,
  addNoteRequest,
  getClientEngagementRequest,
} from '@/lib/api/client-api';
import { ClientStatusBadge } from '@/components/clients/client-status-badge';
import { RequirementForm } from '@/components/clients/requirement-form';
import { NoteForm } from '@/components/clients/note-form';
import { TimelineFeed } from '@/components/clients/timeline-feed';
import { PortalAccessPanel } from '@/components/clients/portal-access-panel';
import { CollectionManager } from '@/components/clients/collection-manager';
import { EngagementSummary } from '@/components/clients/engagement-summary';
import { CommunicationPanel } from '@/components/clients/communication-panel';

const statuses: ClientStatus[] = ['NEW', 'CONTACTED', 'QUALIFIED', 'NEGOTIATION', 'CONVERTED', 'LOST'];

function formatPrice(price: number) {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
  return `₹${price.toLocaleString('en-IN')}`;
}

export default function ClientDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRequirementForm, setShowRequirementForm] = useState(false);

  const [engagement, setEngagement] = useState<ClientEngagement | null>(null);
  const [engagementLoading, setEngagementLoading] = useState(true);

  const fetchClient = useCallback(async () => {
    try {
      const data = await getClientRequest(params.id);
      setClient(data);
    } catch {
      toast.error('Client not found');
      router.push('/dashboard/clients');
    } finally {
      setIsLoading(false);
    }
  }, [params.id, router]);

  const fetchEngagement = useCallback(async () => {
    setEngagementLoading(true);
    try {
      const data = await getClientEngagementRequest(params.id);
      setEngagement(data);
    } catch {
      setEngagement(null);
    } finally {
      setEngagementLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchClient();
    fetchEngagement();
  }, [fetchClient, fetchEngagement]);

  async function handleStatusChange(status: ClientStatus) {
    try {
      await updateClientRequest(params.id, { status });
      toast.success('Status updated');
      fetchClient();
    } catch {
      toast.error('Failed to update status');
    }
  }

  async function handleAddRequirement(values: RequirementFormValues) {
    try {
      await addRequirementRequest(params.id, values);
      toast.success('Requirement added');
      setShowRequirementForm(false);
      fetchClient();
    } catch {
      toast.error('Failed to add requirement');
    }
  }

  async function handleAddNote(content: string) {
    try {
      await addNoteRequest(params.id, content);
      fetchClient();
    } catch {
      toast.error('Failed to add note');
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this client? This cannot be undone.')) return;
    try {
      await deleteClientRequest(params.id);
      toast.success('Client deleted');
      router.push('/dashboard/clients');
    } catch {
      toast.error('Failed to delete client');
    }
  }

  if (isLoading) {
    return <p className="text-sm text-neutral-500 dark:text-neutral-400">Loading...</p>;
  }

  if (!client) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
              {client.fullName}
            </h1>
            <ClientStatusBadge status={client.status} />
          </div>
          <div className="mt-2 flex items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400">
            <span className="flex items-center gap-1.5">
              <Phone size={13} /> {client.phone}
            </span>
            {client.email && (
              <span className="flex items-center gap-1.5">
                <Mail size={13} /> {client.email}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={client.status}
            onChange={(e) => handleStatusChange(e.target.value as ClientStatus)}
            title="Auto-derived from the lead pipeline. Manual changes are overridden when a lead's stage changes; use this mainly for clients without leads."
            className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column: portal access, collections, requirements, favorites/shared */}
        <div className="space-y-6 lg:col-span-1">
          <PortalAccessPanel
            clientId={client.id}
            portalToken={client.portalToken}
            portalTokenExpiresAt={client.portalTokenExpiresAt}
            portalTokenRevokedAt={client.portalTokenRevokedAt}
            onChanged={fetchClient}
          />

          <CollectionManager clientId={client.id} />

          <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">Requirements</h2>
              <button
                onClick={() => setShowRequirementForm((v) => !v)}
                className="text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              >
                {showRequirementForm ? 'Cancel' : '+ Add'}
              </button>
            </div>

            {showRequirementForm && (
              <div className="mt-4">
                <RequirementForm
                  onSubmit={handleAddRequirement}
                  onCancel={() => setShowRequirementForm(false)}
                />
              </div>
            )}

            <div className="mt-4 space-y-3">
              {client.requirements && client.requirements.length > 0 ? (
                client.requirements.map((req) => {
                  const chips: string[] = [];
                  if (req.purpose) chips.push(req.purpose);
                  if (req.bedrooms != null) chips.push(`${req.bedrooms} BHK`);
                  if (req.minArea || req.maxArea)
                    chips.push(`${req.minArea ?? 'Any'}–${req.maxArea ?? 'Any'} sqft`);
                  if (req.furnishing) chips.push(req.furnishing.replace('_', ' ').toLowerCase());
                  if (req.parking != null) chips.push(req.parking ? 'Parking' : 'No parking');
                  if (req.facing) chips.push(req.facing.replace('_', '-'));
                  if (req.floorPreference) chips.push(req.floorPreference);
                  if (req.urgency) chips.push(`${req.urgency} urgency`);
                  return (
                    <div key={req.id} className="rounded-lg bg-neutral-50 p-3 text-sm dark:bg-neutral-800/50">
                      <p className="font-medium text-neutral-900 dark:text-white">
                        {req.propertyType} in {req.preferredCity}
                      </p>
                      {(req.minBudget || req.maxBudget) && (
                        <p className="mt-1 text-neutral-500 dark:text-neutral-400">
                          {req.minBudget ? formatPrice(req.minBudget) : 'Any'} –{' '}
                          {req.maxBudget ? formatPrice(req.maxBudget) : 'Any'}
                        </p>
                      )}
                      {chips.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {chips.map((c, i) => (
                            <span
                              key={i}
                              className="rounded-full bg-white px-2 py-0.5 text-xs text-neutral-600 capitalize dark:bg-neutral-900 dark:text-neutral-300"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      )}
                      {req.preferredLocations && req.preferredLocations.length > 0 && (
                        <p className="mt-2 text-xs text-neutral-400 dark:text-neutral-500">
                          {req.preferredLocations.join(' · ')}
                        </p>
                      )}
                      {req.notes && (
                        <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">{req.notes}</p>
                      )}
                    </div>
                  );
                })
              ) : (
                !showRequirementForm && (
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    No requirements captured yet.
                  </p>
                )
              )}
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-white">
              <Heart size={14} /> Favorites
            </h2>
            <div className="mt-3 space-y-2">
              {client.favorites && client.favorites.length > 0 ? (
                client.favorites.map((f) => (
                  <div key={f.id} className="flex items-center justify-between text-sm">
                    <span className="text-neutral-700 dark:text-neutral-300">{f.property.title}</span>
                    <span className="text-neutral-400">{formatPrice(f.property.price)}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-neutral-500 dark:text-neutral-400">None yet.</p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-white">
              <Share2 size={14} /> Shared Properties
            </h2>
            <div className="mt-3 space-y-2">
              {client.sharedProperties && client.sharedProperties.length > 0 ? (
                client.sharedProperties.map((s) => (
                  <div key={s.id} className="flex items-center justify-between text-sm">
                    <span className="text-neutral-700 dark:text-neutral-300">{s.property.title}</span>
                    <span className="text-neutral-400">{formatPrice(s.property.price)}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-neutral-500 dark:text-neutral-400">None yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right column: engagement + notes + communication + timeline */}
        <div className="space-y-6 lg:col-span-2">
          <EngagementSummary engagement={engagement} isLoading={engagementLoading} />

          <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-white">Add a note</h2>
            <NoteForm onSubmit={handleAddNote} />

            {client.notes && client.notes.length > 0 && (
              <div className="mt-5 space-y-3 border-t border-neutral-100 pt-4 dark:border-neutral-800">
                {client.notes.map((note) => (
                  <div key={note.id} className="text-sm">
                    <p className="text-neutral-900 dark:text-white">{note.content}</p>
                    <p className="mt-0.5 text-xs text-neutral-400 dark:text-neutral-500">
                      {note.createdBy.fullName} ·{' '}
                      {new Date(note.createdAt).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <CommunicationPanel clientId={client.id} />

          <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="mb-4 text-sm font-semibold text-neutral-900 dark:text-white">Activity Timeline</h2>

            <TimelineFeed clientId={client.id} />
          </div>
        </div>
      </div>
    </div>
  );
}