'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import { PortalData } from '@/types/portal';
import {
  getPortalDataRequest,
  addPortalFavoriteRequest,
  removePortalFavoriteRequest,
  confirmPortalVisitRequest,
} from '@/lib/api/portal-api';
import { PortalPropertyCard } from '@/components/portal/portal-property-card';
import { PortalVisitCard } from '@/components/portal/portal-visit-card';

export default function ClientPortalPage() {
  const params = useParams<{ token: string }>();
  const [data, setData] = useState<PortalData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const result = await getPortalDataRequest(params.token);
      setData(result);
    } catch {
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  }, [params.token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const favoritedPropertyIds = new Set((data?.favorites || []).map((f) => f.property.id));

  async function handleToggleFavorite(propertyId: string) {
    try {
      if (favoritedPropertyIds.has(propertyId)) {
        await removePortalFavoriteRequest(params.token, propertyId);
        toast.success('Removed from favorites');
      } else {
        await addPortalFavoriteRequest(params.token, propertyId);
        toast.success('Added to favorites');
      }
      fetchData();
    } catch {
      toast.error('Something went wrong');
    }
  }

  async function handleConfirmVisit(visitId: string) {
    try {
      await confirmPortalVisitRequest(params.token, visitId);
      toast.success('Visit confirmed');
      fetchData();
    } catch {
      toast.error('Something went wrong');
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <p className="text-sm text-neutral-500">Loading...</p>
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 text-center">
        <div>
          <p className="text-lg font-semibold text-neutral-900">Link not found</p>
          <p className="mt-1 text-sm text-neutral-500">
            This portal link may be invalid or expired. Please contact your agent.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Toaster position="top-right" />

      <header className="border-b border-neutral-200 bg-white px-6 py-5">
        <p className="text-sm text-neutral-500">Welcome</p>
        <h1 className="text-xl font-semibold text-neutral-900">{data.client.fullName}</h1>
      </header>

      <main className="mx-auto max-w-3xl space-y-8 px-6 py-8">
        {data.sharedProperties.length > 0 && (
          <section>
            <h2 className="mb-3 text-sm font-semibold text-neutral-900">
              Properties shared with you
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {data.sharedProperties.map((sp) => (
                <PortalPropertyCard
                  key={sp.id}
                  title={sp.property.title}
                  price={sp.property.price}
                  address={sp.property.address}
                  city={sp.property.city}
                  bedrooms={sp.property.bedrooms}
                  bathrooms={sp.property.bathrooms}
                  areaSqft={sp.property.areaSqft}
                  isFavorited={favoritedPropertyIds.has(sp.property.id)}
                  onToggleFavorite={() => handleToggleFavorite(sp.property.id)}
                />
              ))}
            </div>
          </section>
        )}

        {data.favorites.length > 0 && (
          <section>
            <h2 className="mb-3 text-sm font-semibold text-neutral-900">Your favorites</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {data.favorites.map((f) => (
                <PortalPropertyCard
                  key={f.id}
                  title={f.property.title}
                  price={f.property.price}
                  address={f.property.address}
                  city={f.property.city}
                  isFavorited={true}
                  onToggleFavorite={() => handleToggleFavorite(f.property.id)}
                />
              ))}
            </div>
          </section>
        )}

        {data.siteVisits.length > 0 && (
          <section>
            <h2 className="mb-3 text-sm font-semibold text-neutral-900">Your site visits</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {data.siteVisits.map((visit) => (
                <PortalVisitCard
                  key={visit.id}
                  propertyTitle={visit.property.title}
                  address={visit.property.address}
                  city={visit.property.city}
                  scheduledAt={visit.scheduledAt}
                  status={visit.status}
                  clientConfirmed={visit.clientConfirmed}
                  onConfirm={() => handleConfirmVisit(visit.id)}
                />
              ))}
            </div>
          </section>
        )}

        {data.sharedProperties.length === 0 &&
          data.favorites.length === 0 &&
          data.siteVisits.length === 0 && (
            <p className="text-center text-sm text-neutral-500">
              Nothing to show yet — check back soon.
            </p>
          )}
      </main>
    </div>
  );
}