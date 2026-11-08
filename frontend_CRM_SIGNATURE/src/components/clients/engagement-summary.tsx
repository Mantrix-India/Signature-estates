'use client';

import { Activity } from 'lucide-react';
import { ClientEngagement, ClientActivityType } from '@/types/engagement';

const activityLabels: Record<ClientActivityType, string> = {
  PORTAL_OPENED: 'Opened portal',
  PROPERTY_VIEWED: 'Viewed a property',
  PROPERTY_FAVORITED: 'Favorited a property',
  PROPERTY_UNFAVORITED: 'Removed a favorite',
  FEEDBACK_GIVEN: 'Gave feedback',
  COMMENT_ADDED: 'Left a comment',
  SITE_VISIT_REQUESTED: 'Requested a site visit',
  SITE_VISIT_CONFIRMED: 'Confirmed a site visit',
  CONTACT_AGENT: 'Contacted agent',
  CALL_AGENT: 'Tapped call',
  WHATSAPP_AGENT: 'Tapped WhatsApp',
};

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800/50">
      <p className="text-lg font-semibold text-neutral-900 dark:text-white">{value}</p>
      <p className="text-xs text-neutral-500 dark:text-neutral-400">{label}</p>
    </div>
  );
}

export function EngagementSummary({
  engagement,
  isLoading,
}: {
  engagement: ClientEngagement | null;
  isLoading: boolean;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-white">
        <Activity size={14} /> Engagement
      </h2>

      {isLoading ? (
        <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">Loading...</p>
      ) : !engagement ? (
        <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">No engagement data yet.</p>
      ) : (
        <>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
            <Stat label="Shared" value={engagement.summary.propertiesShared} />
            <Stat label="Viewed" value={engagement.summary.propertiesViewed} />
            <Stat label="Favorited" value={engagement.summary.favorited} />
            <Stat label="Interested" value={engagement.summary.interested} />
            <Stat label="Maybe" value={engagement.summary.maybe} />
            <Stat label="Not for them" value={engagement.summary.notInterested} />
            <Stat label="Comments" value={engagement.summary.comments} />
            <Stat label="Visits req." value={engagement.summary.siteVisitsRequested} />
          </div>

          {engagement.summary.lastActivityAt && (
            <p className="mt-3 text-xs text-neutral-400 dark:text-neutral-500">
              Last active{' '}
              {new Date(engagement.summary.lastActivityAt).toLocaleString('en-IN', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          )}

          {engagement.recentActivity.length > 0 && (
            <div className="mt-4 space-y-2 border-t border-neutral-100 pt-4 dark:border-neutral-800">
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                Recent portal activity
              </p>
              {engagement.recentActivity.map((a) => (
                <div key={a.id} className="flex items-center justify-between text-sm">
                  <span className="min-w-0 truncate text-neutral-700 dark:text-neutral-300">
                    {activityLabels[a.type]}
                    {a.property?.title && (
                      <span className="text-neutral-400"> · {a.property.title}</span>
                    )}
                  </span>
                  <span className="ml-3 shrink-0 text-xs text-neutral-400">
                    {new Date(a.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}