'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Phone, Mail, Trash2, Heart, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Client, ClientStatus, RequirementFormValues } from '@/types/client';
import {
  getClientRequest,
  updateClientRequest,
  deleteClientRequest,
  addRequirementRequest,
  addNoteRequest,
} from '@/lib/api/client-api';
import { ClientStatusBadge } from '@/components/clients/client-status-badge';
import { RequirementForm } from '@/components/clients/requirement-form';
import { NoteForm } from '@/components/clients/note-form';
import { TimelineFeed } from '@/components/clients/timeline-feed';

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

  useEffect(() => {
    fetchClient();
  }, [fetchClient]);

  async function handleStatusChange(status: ClientStatus) {
    try {
      await updateClientRequest(params.id, { status });
      toast.success('Status updated');
      fetchClient();
    } catch {
      toast.error('Failed to update status');
    }
  }


  async function handleSharePortalLink() {
    try {
      const { api } = await import('@/lib/axios');
      const { data } = await api.get(`/clients/${params.id}/portal-link`);
      const portalUrl = `${window.location.origin}/portal/${data.data.token}`;
      await navigator.clipboard.writeText(portalUrl);
      toast.success('Portal link copied to clipboard');
    } catch {
      toast.error('Failed to generate portal link');
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
            className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button
            onClick={handleSharePortalLink}
            className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            <Share2 size={14} /> Portal Link
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column: requirements + favorites/shared */}
        <div className="space-y-6 lg:col-span-1">
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
                client.requirements.map((req) => (
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
                    {req.bedrooms != null && (
                      <p className="text-neutral-500 dark:text-neutral-400">{req.bedrooms} BHK</p>
                    )}
                  </div>
                ))
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

        {/* Right column: notes + timeline */}
        <div className="space-y-6 lg:col-span-2">
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

          <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="mb-4 text-sm font-semibold text-neutral-900 dark:text-white">Activity Timeline</h2>
            
            <TimelineFeed events={client.timeline || []} />
          </div>
        </div>
      </div>
    </div>
  );
}