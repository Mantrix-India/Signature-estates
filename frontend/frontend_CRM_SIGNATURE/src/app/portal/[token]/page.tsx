'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { PortalData, FeedbackSentiment } from '@/types/portal';
import {
  getPortalDataRequest,
  addPortalFavoriteRequest,
  removePortalFavoriteRequest,
  setPortalFeedbackRequest,
  addPortalCommentRequest,
  requestPortalVisitRequest,
  confirmPortalVisitRequest,
  trackPortalEventRequest,
} from '@/lib/api/portal-api';
import { PortalPropertyCard } from '@/components/portal/portal-property-card';
import { PortalVisitCard } from '@/components/portal/portal-visit-card';
import { PortalAgentBar } from '@/components/portal/portal-agent-bar';

export default function ClientPortalPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;

  const [data, setData] = useState<PortalData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const result = await getPortalDataRequest(token);
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

  useEffect(() => {
    if (data) trackPortalEventRequest(token, 'PORTAL_OPENED');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data !== null]);

  const favoritedPropertyIds = new Set((data?.favorites || []).map((f) => f.property.id));

  async function handleToggleFavorite(propertyId: string) {
    try {
      if (favoritedPropertyIds.has(propertyId)) {
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

  async function handleConfirmVisit(visitId: string) {
    try {
      await confirmPortalVisitRequest(token, visitId);
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
            This portal link may be invalid, revoked, or expired. Please contact your agent.
          </p>
        </div>
      </div>
    );
  }

  const feedbackByProperty = data.feedbackByProperty || {};

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <Toaster position="top-right" />
      <header className="border-b border-neutral-200 bg-white px-6 py-5">
        <p className="text-sm text-neutral-500">Welcome</p>
        <h1 className="text-xl font-semibold text-neutral-900">{data.client.fullName}</h1>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 space-y-8 px-4 py-8 sm:px-6">
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
                  feedback={feedbackByProperty[sp.property.id] ?? null}
                  onFeedback={(s) => handleFeedback(sp.property.id, s)}
                  onRequestVisit={() => handleRequestVisit(sp.property.id)}
                  onComment={(body) => handleComment(sp.property.id, body)}
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
              Nothing to show yet -- check back soon.
            </p>
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