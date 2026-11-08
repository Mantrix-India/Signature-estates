'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, CalendarDays, Plus } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { formatPrice } from '@/lib/format';
import { STAGE_COLORS, STAGE_LABELS } from '@/lib/leads';
import type { Lead } from '@/types/lead';
import type { FollowUpBuckets } from '@/types/followup';
import { listLeadsRequest } from '@/lib/api/lead-api';
import { listFollowUpsRequest } from '@/lib/api/followup-api';
import { useAnalyticsSnapshot } from '@/lib/use-analytics';
import { Panel, PanelError, SkeletonBlock } from '@/components/analytics/panel';
import { HeadlineKpis } from '@/components/analytics/headline-kpis';
import { PipelineBars } from '@/components/analytics/pipeline-bars';

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);

  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;

  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? '' : 's'} ago`;

  const days = Math.round(hrs / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;

  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

function greetingFor(hour: number) {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

const FALLBACK_COLOR = '#a3a3a3';

/* ------------------------------------------------------------------ */
/* page                                                                */
/* ------------------------------------------------------------------ */

export default function DashboardPage() {
  const { user } = useAuth();

  // Headline numbers + pipeline come from the SAME snapshot as /dashboard/analytics.
  const { snapshot, isLoading: snapshotLoading, error: snapshotError } = useAnalyticsSnapshot();

  const [followUps, setFollowUps] = useState<FollowUpBuckets | null>(null);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [today, setToday] = useState('');
  const [greeting, setGreeting] = useState('Welcome back');

  // Rendered after mount so the server and client markup always match.
  useEffect(() => {
    const now = new Date();
    setToday(
      now.toLocaleDateString('en-IN', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    );
    setGreeting(greetingFor(now.getHours()));
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // Each panel degrades on its own — one failing endpoint must not blank the page.
      const [f, l] = await Promise.allSettled([
        listFollowUpsRequest({ scope: 'me' }),
        listLeadsRequest({ page: 1, limit: 5, sort: 'created' }),
      ]);

      if (cancelled) return;

      if (f.status === 'fulfilled') setFollowUps(f.value);
      if (l.status === 'fulfilled') setRecentLeads(l.value.leads);
      setFeedLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const overview = snapshot?.overview ?? null;
  const funnel = snapshot?.funnel ?? [];
  const todayFollowUps = followUps?.today ?? [];
  const overdueCount = followUps?.counts.overdue ?? 0;

  return (
    <div className="space-y-6">
      {/* ---------- hero ---------- */}
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="eyebrow flex items-center gap-1.5">
            <CalendarDays size={13} />
            {today || ' '}
          </div>

          <h1 className="font-display mt-2 text-[32px] font-semibold leading-tight text-neutral-900 dark:text-white">
            {greeting}
            {user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}
            <span className="text-brand-500">.</span>
          </h1>

          <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
            Here&apos;s the pulse of your agency, all in one place.{' '}
            <Link
              href="/dashboard/analytics"
              className="text-brand-600 underline-offset-2 hover:underline dark:text-brand-400"
            >
              Full analytics
            </Link>
          </p>
        </div>

        <Link
          href="/dashboard/leads/new"
          className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-[var(--shadow-lift)] transition-colors hover:bg-brand-600"
        >
          <Plus size={17} /> New lead
        </Link>
      </section>

      {/* ---------- KPI row (shared with analytics) ---------- */}
      <HeadlineKpis overview={overview} isLoading={snapshotLoading} />

      {/* ---------- pipeline + recent leads ---------- */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Panel
          eyebrow="Momentum"
          title="Lead pipeline"
          action={
            <Link
              href="/dashboard/leads"
              className="flex items-center gap-1 text-xs font-medium text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-400"
            >
              View board <ArrowUpRight size={13} />
            </Link>
          }
        >
          {snapshotLoading ? (
            <div className="space-y-4">
              {[0, 1, 2, 3].map((i) => (
                <SkeletonBlock key={i} className="h-10 border-0" />
              ))}
            </div>
          ) : snapshotError && !snapshot ? (
            <PanelError />
          ) : funnel.every((s) => s.count === 0) ? (
            <p className="py-6 text-sm text-neutral-500 dark:text-neutral-400">
              No leads in the pipeline yet.{' '}
              <Link
                href="/dashboard/leads/new"
                className="text-brand-600 underline-offset-2 hover:underline dark:text-brand-400"
              >
                Add your first lead
              </Link>
              .
            </p>
          ) : (
            <PipelineBars funnel={funnel} />
          )}
        </Panel>

        <div className="flex flex-col gap-4">
          <Panel
            eyebrow={overview?.scope === 'me' ? 'Your deals' : 'Deals'}
            title="Deal desk"
            action={
              <Link
                href="/dashboard/deals"
                className="flex items-center gap-1 text-xs font-medium text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-400"
              >
                Open deals <ArrowUpRight size={13} />
              </Link>
            }
          >
            {snapshotLoading ? (
              <SkeletonBlock className="h-20 border-0" />
            ) : (
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-xs text-neutral-500 dark:text-neutral-400">Active deals</dt>
                  <dd className="tabular font-semibold text-neutral-900 dark:text-white">
                    {overview?.deals.active ?? 0}{' '}
                    <span className="text-xs font-normal text-neutral-500">
                      · {formatPrice(overview?.deals.activeValue ?? 0)}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-neutral-500 dark:text-neutral-400">Completed</dt>
                  <dd className="tabular font-semibold text-neutral-900 dark:text-white">
                    {overview?.deals.completed ?? 0}
                  </dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-xs text-neutral-500 dark:text-neutral-400">Payments outstanding</dt>
                  <dd className="tabular font-semibold text-neutral-900 dark:text-white">
                    {formatPrice(overview?.pendingPayments ?? 0)}
                  </dd>
                </div>
              </dl>
            )}
          </Panel>

          <Panel eyebrow="Live feed" title="Recent leads" className="flex-1">
            {feedLoading ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <SkeletonBlock key={i} className="h-12 border-0" />
                ))}
              </div>
            ) : recentLeads.length === 0 ? (
              <p className="py-6 text-sm text-neutral-500 dark:text-neutral-400">Nothing logged yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {recentLeads.map((lead) => {
                  const color = STAGE_COLORS[lead.stage] ?? FALLBACK_COLOR;
                  return (
                    <Link
                      key={lead.id}
                      href={`/dashboard/leads/${lead.id}`}
                      className="flex items-start gap-3 rounded-lg p-1.5 transition-colors hover:bg-surface-muted"
                    >
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
                        style={{ backgroundColor: `${color}22`, color }}
                      >
                        {initials(lead.client.fullName)}
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-neutral-900 dark:text-white">
                          <strong className="font-medium">{lead.client.fullName}</strong>
                          <span className="text-neutral-500 dark:text-neutral-400">
                            {' '}
                            · {STAGE_LABELS[lead.stage] ?? lead.stage}
                          </span>
                        </p>
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                          {relativeTime(lead.createdAt)}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </Panel>
        </div>
      </div>

      {/* ---------- follow-ups ---------- */}
      <Panel
        eyebrow="Stay in rhythm"
        title={`Today's follow-ups${todayFollowUps.length ? ` · ${todayFollowUps.length}` : ''}`}
        action={
          <Link
            href="/dashboard/follow-ups"
            className="flex items-center gap-1 text-xs font-medium text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-400"
          >
            Open follow-ups <ArrowUpRight size={13} />
          </Link>
        }
      >
        {overdueCount > 0 && (
          <div className="mb-4 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-xs text-brand-800 dark:border-brand-800 dark:bg-brand-900/30 dark:text-brand-200">
            {overdueCount} follow-up{overdueCount === 1 ? ' is' : 's are'} overdue.
          </div>
        )}

        {feedLoading ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <SkeletonBlock key={i} className="h-14 border-0" />
            ))}
          </div>
        ) : todayFollowUps.length === 0 ? (
          <p className="py-4 text-sm text-neutral-500 dark:text-neutral-400">
            Nothing due today. Enjoy the clear runway.
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-[var(--color-hairline)]">
            {todayFollowUps.slice(0, 6).map((item) => (
              <div key={item.id} className="flex items-center gap-3 py-3">
                <i className="h-8 w-0.5 shrink-0 rounded-full bg-brand-500" />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
                    {item.title}
                  </p>
                  <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                    {item.lead
                      ? `${item.lead.client.fullName} · ${item.lead.client.phone}`
                      : item.assignedTo.fullName}
                  </p>
                </div>

                {item.lead && (
                  <Link
                    href={`/dashboard/leads/${item.lead.id}`}
                    className="shrink-0 text-xs font-medium text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-400"
                  >
                    Open
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
