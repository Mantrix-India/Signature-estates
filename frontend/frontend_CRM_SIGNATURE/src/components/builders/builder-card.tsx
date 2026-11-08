import Link from 'next/link';
import { Building2, Phone, Percent } from 'lucide-react';
import { Builder } from '@/types/builder';

export function BuilderCard({ builder }: { builder: Builder }) {
  return (
    <Link
      href={`/dashboard/builders/${builder.id}`}
      className="block rounded-xl border border-neutral-200 bg-white p-5 transition-shadow hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
    >
      <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
        {builder.name}
      </h3>
      {builder.contactPerson && (
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          {builder.contactPerson}
        </p>
      )}

      <div className="mt-4 flex items-center gap-4 border-t border-neutral-100 pt-3 text-sm text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
        {builder.phone && (
          <span className="flex items-center gap-1">
            <Phone size={13} /> {builder.phone}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Percent size={13} /> {builder.commissionPercent}%
        </span>
        <span className="flex items-center gap-1">
          <Building2 size={13} /> {builder._count?.projects ?? 0} projects
        </span>
      </div>
    </Link>
  );
}