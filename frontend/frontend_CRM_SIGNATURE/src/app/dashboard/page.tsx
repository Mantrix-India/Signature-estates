'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  CalendarDays,
  Handshake,
  Plus,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { formatPrice } from '@/lib/format';
import { LEAD_STAGES, STAGE_COLORS, STAGE_LABELS } from '@/lib/leads';
import type { LeadBoard, Lead } from '@/types/lead';
import type { AnalyticsOverview, ConversionRate } from '@/types/analytics';
import type { FollowUpBuckets } from '@/types/followup';
import {
  getOverviewRequest,
  getConversionRateRequest,
} from '@/lib/api/analytics-api';
import { getLeadBoardRequest, listLeadsRequest } from '@/lib/api/lead-api';
import { listFollowUpsRequest } from '@/lib/api/followup-api';

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

function initials(name: string) {
  return name
    .split(' ')
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

  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
  });
}

function greetingFor(hour: number) {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/* ------------------------------------------------------------------ */
/* building blocks                                                     */
/* ------------------------------------------------------------------ */

function Panel({
  eyebrow,
  title,
  action,
  children,
  className = '',
}: {
  eyebrow: string;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`flex flex-col rounded-2xl border border-hairline bg-surface p-5 shadow-[var(--shadow-soft)] ${className}`}
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h2 className="font-display mt-1.5 text-lg font-semibold text-neutral-900 dark:text-white">
            {title}
          </h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  icon: typeof Users;
  tone: string;
}) {
  return (
    <article className="rounded-2xl border border-hairline bg-surface p-5 shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-lift)]">
      <div className="flex items-start justify-between">
        <span className="text-sm text-neutral-500 dark:text-neutral-400">
          {label}
        </span>
        <span
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${tone}1f`, color: tone }}
        >
          <Icon size={16} />
        </span>
      </div>

      <strong className="font-display tabular mt-3 block text-[28px] font-semibold leading-none text-neutral-900 dark:text-white">
        {value}
      </strong>

      <p className="mt-2.5 text-xs text-neutral-500 dark:text-neutral-400">
        {sub}
      </p>
    </article>
  );
}

function SkeletonBlock({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl border border-hairline bg-surface-muted ${className}`}
    />
  );
}

/* ------------------------------------------------------------------ */
/* page                                                                */
/* ------------------------------------------------------------------ */

export default function DashboardPage() {
  const { user } = useAuth();

  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [conversion, setConversion] = useState<ConversionRate | null>(null);
  const [board, setBoard] = useState<LeadBoard | null>(null);
  const [followUps, setFollowUps] = useState<FollowUpBuckets | null>(null);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
      // Each panel degrades on its own — one failing endpoint must not
      // blank the whole dashboard.
      const [o, c, b, f, l] = await Promise.allSettled([
        getOverviewRequest(),
        getConversionRateRequest(),
        getLeadBoardRequest(),
        listFollowUpsRequest({ scope: 'me' }),
        listLeadsRequest({ page: 1, limit: 5 }),
      ]);

      if (cancelled) return;

      if (o.status === 'fulfilled') setOverview(o.value);
      if (c.status === 'fulfilled') setConversion(c.value);
      if (b.status === 'fulfilled') setBoard(b.value);
      if (f.status === 'fulfilled') setFollowUps(f.value);
      if (l.status === 'fulfilled') setRecentLeads(l.value.leads);

      setIsLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  // Pipeline bars — the six stages between first contact and close.
  const pipelineStages = LEAD_STAGES.filter(
    (stage) => stage !== 'LOST' && stage !== 'NEW'
  );

  const stageCounts = board
    ? pipelineStages.map((stage) => ({
        stage,
        count: board[stage]?.length ?? 0,
      }))
    : [];

  const maxStageCount = Math.max(1, ...stageCounts.map((s) => s.count));

  const todayFollowUps = followUps?.today ?? [];
  const overdueCount = followUps?.counts.overdue ?? 0;

  return (
    <div className="space-y-6">
      {/* ---------- hero ---------- */}
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="eyebrow flex items-center gap-1.5">
            <CalendarDays size={13} />
            {today || ' '}
          </div>

          <h1 className="font-display mt-2 text-[32px] font-semibold leading-tight text-neutral-900 dark:text-white">
            {greeting}
            {user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}
            <span className="text-brand-500">.</span>
          </h1>

          <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
            Here&apos;s the pulse of your agency, all in one place.
          </p>
        </div>

        <Link
          href="/dashboard/leads/new"
          className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-[var(--shadow-lift)] transition-colors hover:bg-brand-600"
        >
          <Plus size={17} /> New lead
        </Link>
      </section>

      {/* ---------- KPI row ---------- */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <SkeletonBlock key={i} className="h-[134px]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Active leads"
            value={String(overview?.activeLeads ?? 0)}
            sub={`${overview?.totalLeads ?? 0} leads in total`}
            icon={Handshake}
            tone="#d97746"
          />
          <KpiCard
            label="Clients"
            value={String(overview?.totalClients ?? 0)}
            sub={`${overview?.totalProperties ?? 0} properties on the books`}
            icon={Users}
            tone="#258b88"
          />
          <KpiCard
            label="Conversion rate"
            value={`${(conversion?.conversionRate ?? 0).toFixed(1)}%`}
            sub={`${conversion?.wonLeads ?? 0} closed of ${
              conversion?.totalLeads ?? 0
            }`}
            icon={TrendingUp}
            tone="#7772bd"
          />
          <KpiCard
            label="Revenue"
            value={formatPrice(overview?.totalRevenue ?? 0)}
            sub={`${overview?.totalSiteVisits ?? 0} site visits logged`}
            icon={Wallet}
            tone="#62977a"
          />
        </div>
      )}

      {/* ---------- pipeline + recent leads ---------- */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Panel
          eyebrow="Momentum"
          title="Deal pipeline"
          action={
            <Link
              href="/dashboard/leads"
              className="flex items-center gap-1 text-xs font-medium text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-400"
            >
              View board <ArrowUpRight size={13} />
            </Link>
          }
        >
          {isLoading ? (
            <div className="space-y-4">
              {[0, 1, 2, 3].map((i) => (
                <SkeletonBlock key={i} className="h-10 border-0" />
              ))}
            </div>
          ) : stageCounts.every((s) => s.count === 0) ? (
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
            <div className="space-y-4">
              {stageCounts.map(({ stage, count }) => (
                <div key={stage}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300">
                      <i
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: STAGE_COLORS[stage] }}
                      />
                      {STAGE_LABELS[stage]}
                    </span>
                    <b className="tabular text-neutral-900 dark:text-white">
                      {count}
                    </b>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
                    <div
                      className="h-full rounded-full transition-[width] duration-500"
                      style={{
                        width: `${Math.max(
                          count > 0 ? 6 : 0,
                          (count / maxStageCount) * 100
                        )}%`,
                        backgroundColor: STAGE_COLORS[stage],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel eyebrow="Live feed" title="Recent leads">
          {isLoading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <SkeletonBlock key={i} className="h-12 border-0" />
              ))}
            </div>
          ) : recentLeads.length === 0 ? (
            <p className="py-6 text-sm text-neutral-500 dark:text-neutral-400">
              Nothing logged yet.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {recentLeads.map((lead) => (
                <Link
                  key={lead.id}
                  href={`/dashboard/leads/${lead.id}`}
                  className="flex items-start gap-3 rounded-lg p-1.5 transition-colors hover:bg-surface-muted"
                >
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
                    style={{
                      backgroundColor: `${STAGE_COLORS[lead.stage]}22`,
                      color: STAGE_COLORS[lead.stage],
                    }}
                  >
                    {initials(lead.client.fullName)}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-neutral-900 dark:text-white">
                      <strong className="font-medium">
                        {lead.client.fullName}
                      </strong>
                      <span className="text-neutral-500 dark:text-neutral-400">
                        {' '}
                        · {STAGE_LABELS[lead.stage]}
                      </span>
                    </p>

                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      {relativeTime(lead.createdAt)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Panel>
      </div>

      {/* ---------- follow-ups ---------- */}
      <Panel
        eyebrow="Stay in rhythm"
        title={`Today's follow-ups${
          todayFollowUps.length ? ` · ${todayFollowUps.length}` : ''
        }`}
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
            {overdueCount} follow-up{overdueCount === 1 ? ' is' : 's are'}{' '}
            overdue.
          </div>
        )}

        {isLoading ? (
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
