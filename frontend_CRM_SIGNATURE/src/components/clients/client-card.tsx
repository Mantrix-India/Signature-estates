import Link from 'next/link';
import { Phone, Mail } from 'lucide-react';
import { Client } from '@/types/client';
import { ClientStatusBadge } from './client-status-badge';

export function ClientCard({ client }: { client: Client }) {
  return (
    <Link
      href={`/dashboard/clients/${client.id}`}
      className="block rounded-xl border border-neutral-200 bg-white p-5 transition-shadow hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div className="flex items-start justify-between">
        <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
          {client.fullName}
        </h3>
        <ClientStatusBadge status={client.status} />
      </div>

      <div className="mt-3 space-y-1.5 text-sm text-neutral-500 dark:text-neutral-400">
        <p className="flex items-center gap-1.5">
          <Phone size={13} /> {client.phone}
        </p>
        {client.email && (
          <p className="flex items-center gap-1.5">
            <Mail size={13} /> {client.email}
          </p>
        )}
      </div>

      {client.source && (
        <p className="mt-3 text-xs text-neutral-400 dark:text-neutral-500">
          Source: {client.source}
        </p>
      )}
    </Link>
  );
}