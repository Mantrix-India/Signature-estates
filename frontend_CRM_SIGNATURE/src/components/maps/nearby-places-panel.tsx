'use client';

import { useState } from 'react';
import { School, Hospital, Plane, TrainFront, ShoppingBag, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { NearbyPlace, PlaceType } from '@/types/nearbyPlace';
import { getNearbyPlacesRequest } from '@/lib/api/maps-api';

const placeTypes: { type: PlaceType; label: string; icon: typeof School }[] = [
  { type: 'school', label: 'Schools', icon: School },
  { type: 'hospital', label: 'Hospitals', icon: Hospital },
  { type: 'metro', label: 'Metro/Rail', icon: TrainFront },
  { type: 'market', label: 'Malls', icon: ShoppingBag },
  { type: 'airport', label: 'Airports', icon: Plane },
];

export function NearbyPlacesPanel({ propertyId }: { propertyId: string }) {
  const [activeType, setActiveType] = useState<PlaceType | null>(null);
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  async function handleSelectType(type: PlaceType) {
    setActiveType(type);
    setIsLoading(true);
    setPlaces([]);
    setHasError(false);
    try {
      const result = await getNearbyPlacesRequest(propertyId, type);
      setPlaces(result);
    } catch (err: any) {
      setHasError(true);
      toast.error(err?.response?.data?.message || 'Failed to fetch nearby places');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {placeTypes.map(({ type, label, icon: Icon }) => (
          <button
            key={type}
            onClick={() => handleSelectType(type)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              activeType === type
                ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900'
                : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800'
            }`}
          >
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
            <Loader2 size={14} className="animate-spin" /> Searching nearby...
          </div>
        ) : hasError ? (
          <p className="text-sm text-red-500">
            Couldn't fetch nearby places right now — try again in a moment.
          </p>
        ) : activeType && places.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No {activeType === 'market' ? 'malls' : `${activeType}s`} found within range.
          </p>
        ) : places.length > 0 ? (
          <div className="space-y-1.5">
            {places.map((place) => (
              <div key={place.id} className="flex items-center justify-between text-sm">
                <span className="text-neutral-700 dark:text-neutral-300">{place.name}</span>
                <span className="text-neutral-400">{place.distanceKm} km</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Select a category above to find nearby places.
          </p>
        )}
      </div>
    </div>
  );
}