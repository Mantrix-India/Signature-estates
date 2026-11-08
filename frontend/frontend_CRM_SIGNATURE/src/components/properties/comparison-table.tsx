import { Check, X } from 'lucide-react';
import { Property } from '@/types/property';

function formatPrice(price: number) {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
  return `₹${price.toLocaleString('en-IN')}`;
}

function formatDate(iso?: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const rows: { label: string; render: (p: Property) => React.ReactNode }[] = [
  { label: 'Price', render: (p) => <span className="font-semibold">{formatPrice(p.price)}</span> },
  { label: 'Type', render: (p) => p.propertyType },
  { label: 'Status', render: (p) => p.status },
  { label: 'Bedrooms', render: (p) => p.bedrooms ?? '—' },
  { label: 'Bathrooms', render: (p) => p.bathrooms ?? '—' },
  { label: 'Area (sqft)', render: (p) => p.areaSqft ?? '—' },
  { label: 'City', render: (p) => p.city },
  {
    label: 'Est. Monthly Rental',
    render: (p) => (p.estimatedRentalMonthly ? formatPrice(p.estimatedRentalMonthly) : '—'),
  },
  {
    label: 'Rental Yield',
    render: (p) => (p.rentalYieldPercent != null ? `${p.rentalYieldPercent}%` : '—'),
  },
  {
    label: 'Monthly Maintenance',
    render: (p) => (p.maintenanceMonthly ? formatPrice(p.maintenanceMonthly) : '—'),
  },
  {
    label: 'Est. Annual Appreciation',
    render: (p) => (p.annualAppreciationPercent != null ? `${p.annualAppreciationPercent}%` : '—'),
  },
  { label: 'Possession Date', render: (p) => formatDate(p.possessionDate) },
];

export function ComparisonTable({ properties }: { properties: Property[] }) {
  const allAmenities = Array.from(
    new Set(properties.flatMap((p) => p.amenities || []))
  );

  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
      <table className="w-full min-w-[600px] text-sm">
        <thead>
          <tr className="border-b border-neutral-200 dark:border-neutral-800">
            <th className="w-40 p-3 text-left text-xs font-medium text-neutral-400"></th>
            {properties.map((p) => (
              <th key={p.id} className="p-3 text-left">
                <p className="font-semibold text-neutral-900 dark:text-white">{p.title}</p>
                <p className="mt-0.5 text-xs font-normal text-neutral-500 dark:text-neutral-400">
                  {p.address}
                </p>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {rows.map((row) => (
            <tr key={row.label}>
              <td className="p-3 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                {row.label}
              </td>
              {properties.map((p) => (
                <td key={p.id} className="p-3 text-neutral-700 dark:text-neutral-300">
                  {row.render(p)}
                </td>
              ))}
            </tr>
          ))}

          {allAmenities.length > 0 && (
            <tr>
              <td className="p-3 align-top text-xs font-medium text-neutral-500 dark:text-neutral-400">
                Amenities
              </td>
              {properties.map((p) => (
                <td key={p.id} className="space-y-1.5 p-3">
                  {allAmenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-1.5 text-xs">
                      {p.amenities?.includes(amenity) ? (
                        <Check size={13} className="text-emerald-500" />
                      ) : (
                        <X size={13} className="text-neutral-300 dark:text-neutral-700" />
                      )}
                      <span className="text-neutral-600 dark:text-neutral-300">{amenity}</span>
                    </div>
                  ))}
                </td>
              ))}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}