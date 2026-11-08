import Link from 'next/link';
import { Bed, Bath, Ruler, MapPin, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import { Property } from '@/types/property';
import { cn } from '@/lib/utils';

const statusStyles: Record<string, string> = {
  AVAILABLE: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  RESERVED: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  BOOKED: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  SOLD: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
};

function formatPrice(price: number) {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
  return `₹${price.toLocaleString('en-IN')}`;
}

export function PropertyCard({
  property,
  onDelete,
}: {
  property: Property;
  onDelete: (id: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative rounded-xl border border-neutral-200 bg-white p-5 transition-shadow hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-start justify-between">
        <span
          className={cn(
            'rounded-full px-2.5 py-1 text-xs font-medium',
            statusStyles[property.status]
          )}
        >
          {property.status}
        </span>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            aria-label="Property actions"
          >
            <MoreVertical size={16} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-9 z-10 w-32 rounded-lg border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
              <Link
                href={`/dashboard/properties/${property.id}/edit`}
                className="block px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                Edit
              </Link>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(property.id);
                }}
                className="block w-full px-3 py-1.5 text-left text-sm text-red-600 hover:bg-neutral-50 dark:hover:bg-neutral-800"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <Link href={`/dashboard/properties/${property.id}`} className="block">
        <h3 className="mt-3 line-clamp-1 text-base font-semibold text-neutral-900 dark:text-white">
          {property.title}
        </h3>

        <p className="mt-1 flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400">
          <MapPin size={13} />
          <span className="line-clamp-1">
            {property.city}, {property.state}
          </span>
        </p>

        <p className="mt-3 text-lg font-semibold text-neutral-900 dark:text-white">
          {formatPrice(property.price)}
        </p>

        <div className="mt-4 flex items-center gap-4 border-t border-neutral-100 pt-3 text-sm text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
          {property.bedrooms != null && (
            <span className="flex items-center gap-1">
              <Bed size={14} /> {property.bedrooms}
            </span>
          )}
          {property.bathrooms != null && (
            <span className="flex items-center gap-1">
              <Bath size={14} /> {property.bathrooms}
            </span>
          )}
          {property.areaSqft != null && (
            <span className="flex items-center gap-1">
              <Ruler size={14} /> {property.areaSqft} sqft
            </span>
          )}
        </div>
      </Link>
    </div>
  );
}