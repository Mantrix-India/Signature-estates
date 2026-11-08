'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { LeadForm } from '@/components/leads/lead-form';
import { createLeadRequest, listLeadSourcesRequest } from '@/lib/api/lead-api';
import { listUsersRequest } from '@/lib/api/user-api';
import { listClientsRequest } from '@/lib/api/client-api';
import { LeadFormValues, LeadSource } from '@/types/lead';
import { UserSummary } from '@/types/user';
import { Client } from '@/types/client';

export default function NewLeadPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [sources, setSources] = useState<LeadSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [clientsRes, usersRes, sourcesRes] = await Promise.all([
          listClientsRequest({ limit: 100 }),
          listUsersRequest(),
          listLeadSourcesRequest(),
        ]);
        setClients(clientsRes.clients);
        setUsers(usersRes);
        setSources(sourcesRes);
      } catch {
        toast.error('Failed to load form data');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  async function handleSubmit(values: LeadFormValues) {
    try {
      const lead = await createLeadRequest(values);
      toast.success('Lead created');
      router.push(`/dashboard/leads/${lead.id}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create lead');
    }
  }

  if (isLoading) {
    return <p className="text-sm text-neutral-500 dark:text-neutral-400">Loading...</p>;
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">New Lead</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Create a sales opportunity for an existing client
        </p>
      </div>

      {clients.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 py-10 text-center dark:border-neutral-700">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            You need at least one client before creating a lead.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
          <LeadForm clients={clients} users={users} sources={sources} onSubmit={handleSubmit} />
        </div>
      )}
    </div>
  );
}