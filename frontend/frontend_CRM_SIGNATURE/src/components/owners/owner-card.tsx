import Link from 'next/link';
import { Phone, Mail, Building2 } from 'lucide-react';
import { Owner } from '@/types/owner';

export function OwnerCard({ owner }: { owner: Owner }) {
  const propertyCount = owner._count?.properties ?? owner.properties?.length ?? 0;
  return (
    <Link
      href={`/dashboard/owners/${owner.id}`}
      className="block rounded-xl border border-neutral-200 bg-white p-4 transition-colors hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
    >
      <p className="text-sm font-semibold text-neutral-900 dark:text-white">{owner.fullName}</p>
      <div className="mt-2 space-y-1 text-xs text-neutral-500 dark:text-neutral-400">
        <p className="flex items-center gap-1.5"><Phone size={12} /> {owner.phone}</p>
        {owner.email && <p className="flex items-center gap-1.5"><Mail size={12} /> {owner.email}</p>}
        <p className="flex items-center gap-1.5"><Building2 size={12} /> {propertyCount} propert{propertyCount === 1 ? 'y' : 'ies'}</p>
      </div>
    </Link>
  );
}