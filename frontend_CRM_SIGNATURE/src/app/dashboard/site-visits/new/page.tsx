'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { SiteVisitForm } from '@/components/site-visits/site-visit-form';
import { createSiteVisitRequest } from '@/lib/api/siteVisit-api';
import { listUsersRequest } from '@/lib/api/user-api';
import { listClientsRequest } from '@/lib/api/client-api';
import { listPropertiesRequest } from '@/lib/api/property-api';
import { SiteVisitFormValues } from '@/types/siteVisit';
import { UserSummary } from '@/types/user';
import { Client } from '@/types/client';
import { Property } from '@/types/property';

export default function NewSiteVisitPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [clientsRes, propertiesRes, usersRes] = await Promise.all([
          listClientsRequest({ limit: 100 }),
          listPropertiesRequest({ limit: 100 }),
          listUsersRequest(),
        ]);
        setClients(clientsRes.clients);
        setProperties(propertiesRes.properties);
        setUsers(usersRes);
      } catch {
        toast.error('Failed to load form data');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  async function handleSubmit(values: SiteVisitFormValues) {
    try {
      const visit = await createSiteVisitRequest(values);
      toast.success('Site visit scheduled');
      router.push(`/dashboard/site-visits/${visit.id}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to schedule visit');
    }
  }

  if (isLoading) {
    return <p className="text-sm text-neutral-500 dark:text-neutral-400">Loading...</p>;
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Schedule Site Visit</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Book a property viewing for a client
        </p>
      </div>

      {clients.length === 0 || properties.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 py-10 text-center dark:border-neutral-700">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            You need at least one client and one property first.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
          <SiteVisitForm clients={clients} properties={properties} users={users} onSubmit={handleSubmit} />
        </div>
      )}
    </div>
  );
}