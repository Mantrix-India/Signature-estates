'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { CollectionPortalData, FeedbackSentiment } from '@/types/portal';
import {
  getCollectionDataRequest,
  addPortalFavoriteRequest,
  removePortalFavoriteRequest,
  setPortalFeedbackRequest,
  addPortalCommentRequest,
  requestPortalVisitRequest,
  trackPortalEventRequest,
} from '@/lib/api/portal-api';
import { PortalPropertyCard } from '@/components/portal/portal-property-card';
import { PortalAgentBar } from '@/components/portal/portal-agent-bar';

export default function CollectionPortalPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;

  const [data, setData] = useState<CollectionPortalData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const result = await getCollectionDataRequest(token);
      setData(result);
    } catch {
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Track portal open once, after first successful load.
  useEffect(() => {
    if (data) trackPortalEventRequest(token, 'PORTAL_OPENED');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data !== null]);

  async function handleToggleFavorite(propertyId: string, isFavorited: boolean) {
    try {
      if (isFavorited) {
        await removePortalFavoriteRequest(token, propertyId);
        toast.success('Removed from favorites');
      } else {
        await addPortalFavoriteRequest(token, propertyId);
        toast.success('Added to favorites');
      }
      fetchData();
    } catch {
      toast.error('Something went wrong');
    }
  }

  async function handleFeedback(propertyId: string, sentiment: FeedbackSentiment) {
    try {
      await setPortalFeedbackRequest(token, propertyId, sentiment);
      toast.success('Thanks for your feedback');
      fetchData();
    } catch {
      toast.error('Something went wrong');
    }
  }

  async function handleComment(propertyId: string, body: string) {
    try {
      await addPortalCommentRequest(token, body, propertyId);
      toast.success('Comment sent to your agent');
      fetchData();
    } catch {
      toast.error('Something went wrong');
    }
  }

  async function handleRequestVisit(propertyId: string) {
    try {
      await requestPortalVisitRequest(token, propertyId);
      toast.success('Site visit requested — your agent will confirm a time');
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
            This link may be invalid, revoked, or expired. Please contact your agent.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <Toaster position="top-right" />
      <header className="border-b border-neutral-200 bg-white px-6 py-5">
        <p className="text-sm text-neutral-500">Prepared for {data.client.fullName}</p>
        <h1 className="text-xl font-semibold text-neutral-900">{data.collection.name}</h1>
        {data.collection.description && (
          <p className="mt-1 text-sm text-neutral-500">{data.collection.description}</p>
        )}
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 space-y-4 px-4 py-6 sm:px-6">
        {data.properties.length === 0 ? (
          <p className="text-center text-sm text-neutral-500">
            No properties in this collection yet — check back soon.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {data.properties.map((entry) => (
              <PortalPropertyCard
                key={entry.shareId}
                title={entry.property.title}
                price={entry.property.price}
                address={entry.property.address}
                city={entry.property.city}
                bedrooms={entry.property.bedrooms}
                bathrooms={entry.property.bathrooms}
                areaSqft={entry.property.areaSqft}
                isFavorited={entry.isFavorited}
                onToggleFavorite={() => handleToggleFavorite(entry.property.id, entry.isFavorited)}
                feedback={entry.feedback}
                onFeedback={(s) => handleFeedback(entry.property.id, s)}
                onRequestVisit={() => handleRequestVisit(entry.property.id)}
                onComment={(body) => handleComment(entry.property.id, body)}
              />
            ))}
          </div>
        )}
      </main>

      <PortalAgentBar
        agentName={data.agent.fullName}
        agentPhone={data.agent.phone}
        onCall={() => trackPortalEventRequest(token, 'CALL_AGENT')}
        onWhatsApp={() => trackPortalEventRequest(token, 'WHATSAPP_AGENT')}
      />
    </div>
  );
}