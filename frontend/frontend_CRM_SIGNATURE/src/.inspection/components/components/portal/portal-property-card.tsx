import { Heart, MapPin, Bed, Bath, Ruler } from 'lucide-react';

function formatPrice(price: number) {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
  return `₹${price.toLocaleString('en-IN')}`;
}

export function PortalPropertyCard({
  title,
  price,
  address,
  city,
  bedrooms,
  bathrooms,
  areaSqft,
  isFavorited,
  onToggleFavorite,
}: {
  title: string;
  price: number;
  address: string;
  city: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  areaSqft?: number | null;
  isFavorited: boolean;
  onToggleFavorite: () => void;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
        <button
          onClick={onToggleFavorite}
          className="rounded-lg p-1.5 hover:bg-neutral-100"
          aria-label="Toggle favorite"
        >
          <Heart
            size={18}
            className={isFavorited ? 'fill-red-500 text-red-500' : 'text-neutral-300'}
          />
        </button>
      </div>

      <p className="mt-1 flex items-center gap-1 text-sm text-neutral-500">
        <MapPin size={13} /> {address}, {city}
      </p>

      <p className="mt-3 text-lg font-semibold text-neutral-900">{formatPrice(price)}</p>

      {(bedrooms != null || bathrooms != null || areaSqft != null) && (
        <div className="mt-3 flex items-center gap-4 border-t border-neutral-100 pt-3 text-sm text-neutral-500">
          {bedrooms != null && (
            <span className="flex items-center gap-1"><Bed size={14} /> {bedrooms}</span>
          )}
          {bathrooms != null && (
            <span className="flex items-center gap-1"><Bath size={14} /> {bathrooms}</span>
          )}
          {areaSqft != null && (
            <span className="flex items-center gap-1"><Ruler size={14} /> {areaSqft} sqft</span>
          )}
        </div>
      )}
    </div>
  );
}