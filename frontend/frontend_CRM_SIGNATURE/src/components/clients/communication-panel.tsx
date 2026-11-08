"use client";

import { useEffect, useState, useCallback } from 'react';
import { Phone, Mail, MessageSquare, Users, Send, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import type {
  CommunicationLog,
  CommunicationType,
  CommunicationDirection,
} from '@/types/communication';
import {
  listCommunicationsRequest,
  createCommunicationRequest,
  deleteCommunicationRequest,
} from '@/lib/api/communication-api';

const TYPES: CommunicationType[] = ['CALL', 'EMAIL', 'SMS', 'WHATSAPP', 'MEETING'];

const typeIcon: Record<CommunicationType, typeof Phone> = {
  CALL: Phone,
  EMAIL: Mail,
  SMS: MessageSquare,
  WHATSAPP: MessageSquare,
  MEETING: Users,
};

const inputClass =
  'w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white';

export function CommunicationPanel({ clientId }: { clientId: string }) {
  const [logs, setLogs] = useState<CommunicationLog[]>([]);
  const [type, setType] = useState<CommunicationType>('CALL');
  const [direction, setDirection] = useState<CommunicationDirection>('OUTBOUND');
  const [body, setBody] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await listCommunicationsRequest({ clientId, limit: 20 });
      setLogs(res.items);
    } catch {
      toast.error('Failed to load communication logs');
    }
  }, [clientId]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  async function handleCreate() {
    if (body.trim().length < 1) {
      toast.error('Enter a note');
      return;
    }
    setIsSaving(true);
    try {
      await createCommunicationRequest({ clientId, type, direction, body: body.trim() });
      setBody('');
      toast.success('Interaction logged');
      fetchLogs();
    } catch {
      toast.error('Failed to log interaction');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteCommunicationRequest(id);
      fetchLogs();
    } catch {
      toast.error('Failed to delete');
    }
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">Log an interaction</h2>

      <div className="mt-3 space-y-3">
        <div className="flex flex-wrap gap-2">
          <select value={type} onChange={(e) => setType(e.target.value as CommunicationType)} className={inputClass + ' max-w-[8rem]'}>
            {TYPES.map((t) => (
              <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>
            ))}
          </select>
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value as CommunicationDirection)}
            className={inputClass + ' max-w-[9rem]'}
          >
            <option value="OUTBOUND">Outbound</option>
            <option value="INBOUND">Inbound</option>
          </select>
        </div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={2}
          placeholder="What was discussed?"
          className={inputClass}
        />
        <button
          onClick={handleCreate}
          disabled={isSaving}
          className="flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 disabled:opacity-60 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          <Send size={15} /> Log
        </button>
      </div>

      {logs.length > 0 && (
        <div className="mt-5 space-y-3 border-t border-neutral-100 pt-4 dark:border-neutral-800">
          {logs.map((log) => {
            const Icon = typeIcon[log.type];
            return (
              <div key={log.id} className="group flex items-start gap-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                  <Icon size={13} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-neutral-900 dark:text-white">{log.body}</p>
                  <p className="mt-0.5 text-xs text-neutral-400 dark:text-neutral-500">
                    {log.direction === 'OUTBOUND' ? 'Outbound' : 'Inbound'} {log.type.toLowerCase()} ·{' '}
                    {log.createdBy.fullName} ·{' '}
                    {new Date(log.occurredAt).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(log.id)}
                  aria-label="Delete log"
                  className="shrink-0 rounded p-1 text-neutral-300 opacity-0 transition-opacity hover:text-red-600 group-hover:opacity-100"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}