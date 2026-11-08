'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search, CheckSquare, Square, Trash2, Bookmark, BookmarkPlus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Client, ClientFilters, ClientStatus } from '@/types/client';
import { listClientsRequest } from '@/lib/api/client-api';
import { ClientCard } from '@/components/clients/client-card';
import { bulkClientsRequest } from '@/lib/api/bulk-api';
import { SavedView } from '@/types/savedview';
import {
  listSavedViewsRequest,
  createSavedViewRequest,
  deleteSavedViewRequest,
} from '@/lib/api/savedview-api';

const statuses: ClientStatus[] = ['NEW', 'CONTACTED', 'QUALIFIED', 'NEGOTIATION', 'CONVERTED', 'LOST'];

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<ClientFilters>({ page: 1 });

  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [views, setViews] = useState<SavedView[]>([]);

  const fetchClients = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await listClientsRequest(filters);
      setClients(result.clients);
    } catch {
      toast.error('Failed to load clients');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const fetchViews = useCallback(async () => {
    try {
      setViews(await listSavedViewsRequest('clients'));
    } catch {
      // non-critical
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  useEffect(() => {
    fetchViews();
  }, [fetchViews]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function exitSelectMode() {
    setSelectMode(false);
    setSelected(new Set());
  }

  async function handleBulkStatus(status: ClientStatus) {
    if (selected.size === 0) return;
    try {
      await bulkClientsRequest({ ids: [...selected], action: 'status', status });
      toast.success(`Updated ${selected.size} client(s)`);
      exitSelectMode();
      fetchClients();
    } catch {
      toast.error('Bulk update failed');
    }
  }

  async function handleBulkDelete() {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} client(s)? This cannot be undone.`)) return;
    try {
      const res = await bulkClientsRequest({ ids: [...selected], action: 'delete' });
      toast.success(`Deleted ${res.deleted ?? selected.size} client(s)`);
      exitSelectMode();
      fetchClients();
    } catch {
      toast.error('Bulk delete failed');
    }
  }

  async function handleSaveView() {
    const name = window.prompt('Name this view');
    if (!name || name.trim().length === 0) return;
    try {
      await createSavedViewRequest({
        name: name.trim(),
        entity: 'clients',
        config: { search: filters.search ?? '', status: filters.status ?? '' },
      });
      toast.success('View saved');
      fetchViews();
    } catch {
      toast.error('Failed to save view');
    }
  }

  function applyView(view: SavedView) {
    const cfg = view.config as { search?: string; status?: string };
    setFilters({
      page: 1,
      search: cfg.search || undefined,
      status: (cfg.status || undefined) as ClientStatus | undefined,
    });
  }

  async function handleDeleteView(id: string) {
    try {
      await deleteSavedViewRequest(id);
      fetchViews();
    } catch {
      toast.error('Failed to delete view');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Clients</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Manage buyer and prospect relationships
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => (selectMode ? exitSelectMode() : setSelectMode(true))}
            className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            {selectMode ? <X size={16} /> : <CheckSquare size={16} />}
            {selectMode ? 'Cancel' : 'Select'}
          </button>
          <Link
            href="/dashboard/clients/new"
            className="flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            <Plus size={16} /> New Client
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search clients..."
            value={filters.search || ''}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
            className="w-full rounded-lg border border-neutral-200 bg-white py-2 pl-9 pr-3 text-sm text-neutral-900 outline-none focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
          />
        </div>
        <select
          value={filters.status || ''}
          onChange={(e) =>
            setFilters({ ...filters, status: (e.target.value || undefined) as ClientStatus, page: 1 })
          }
          className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
        >
          <option value="">All statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button
          onClick={handleSaveView}
          className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          <BookmarkPlus size={16} /> Save view
        </button>
      </div>

      {views.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Bookmark size={14} className="text-neutral-400" />
          {views.map((v) => (
            <span
              key={v.id}
              className="group flex items-center gap-1 rounded-full border border-neutral-200 bg-white py-1 pl-3 pr-1.5 text-xs text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
            >
              <button onClick={() => applyView(v)} className="font-medium hover:text-neutral-900 dark:hover:text-white">
                {v.name}
              </button>
              <button
                onClick={() => handleDeleteView(v.id)}
                aria-label={`Delete view ${v.name}`}
                className="rounded-full p-0.5 text-neutral-300 hover:text-red-600"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900" />
          ))}
        </div>
      ) : clients.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 py-16 text-center dark:border-neutral-700">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No clients yet. Add your first one.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => {
            const isSelected = selected.has(client.id);
            return (
              <div key={client.id} className="relative">
                <ClientCard client={client} />
                {selectMode && (
                  <button
                    onClick={() => toggle(client.id)}
                    aria-label={isSelected ? 'Deselect client' : 'Select client'}
                    className={`absolute inset-0 z-10 flex items-start justify-start rounded-xl p-3 transition-colors ${
                      isSelected ? 'bg-neutral-900/5 ring-2 ring-neutral-900 dark:bg-white/5 dark:ring-white' : 'ring-1 ring-transparent hover:bg-neutral-900/[0.02]'
                    }`}
                  >
                    <span className="text-neutral-700 dark:text-neutral-200">
                      {isSelected ? <CheckSquare size={18} /> : <Square size={18} className="text-neutral-400" />}
                    </span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {selectMode && selected.size > 0 && (
        <div className="fixed inset-x-0 bottom-6 z-40 mx-auto flex w-fit items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
          <span className="text-sm font-medium text-neutral-900 dark:text-white">
            {selected.size} selected
          </span>
          <select
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) handleBulkStatus(e.target.value as ClientStatus);
              e.target.value = '';
            }}
            className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-900 outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
          >
            <option value="" disabled>Set status…</option>
            {statuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-500/10"
          >
            <Trash2 size={15} /> Delete
          </button>
          <button
            onClick={exitSelectMode}
            className="rounded-lg p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
            aria-label="Cancel selection"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}