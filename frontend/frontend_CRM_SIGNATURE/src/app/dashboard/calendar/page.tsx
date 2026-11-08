"use client";

import { useEffect, useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, MapPin, ListChecks } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/layout/page-header';
import { useAuth } from '@/context/auth-context';
import { listSiteVisitsRequest } from '@/lib/api/siteVisit-api';
import type { SiteVisitFilters } from '@/types/siteVisit';
import { listFollowUpsRequest } from '@/lib/api/followup-api';
import type { FollowUp } from '@/types/followup';

type Scope = 'me' | 'all';

interface CalendarEvent {
  id: string;
  kind: 'visit' | 'followup';
  date: Date;
  title: string;
  subtitle?: string;
  href: string;
  dotClass: string;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function dateKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function buildGrid(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - first.getDay());
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });
}

function followUpDot(due: Date) {
  const today = startOfDay(new Date());
  const d = startOfDay(due);
  if (d < today) return 'bg-red-500';
  if (d.getTime() === today.getTime()) return 'bg-amber-500';
  return 'bg-blue-500';
}

export default function CalendarPage() {
  const { user } = useAuth();
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [scope, setScope] = useState<Scope>('me');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<Date>(() => startOfDay(new Date()));

  const grid = useMemo(() => buildGrid(month), [month]);
  const gridStart = grid[0];
  const gridEnd = grid[grid.length - 1];

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const from = new Date(gridStart);
      from.setHours(0, 0, 0, 0);
      const to = new Date(gridEnd);
      to.setHours(23, 59, 59, 999);

      const [visitsRes, followUps] = await Promise.all([
        listSiteVisitsRequest({
          from: from.toISOString(),
          to: to.toISOString(),
          limit: 100,
          ...(scope === 'me' && user ? { assignedToId: user.id } : {}),
        } as SiteVisitFilters & { limit: number }),
        listFollowUpsRequest({ scope, includeNoDueDate: false }),
      ]);

      const visitEvents: CalendarEvent[] = visitsRes.siteVisits.map((v) => ({
        id: `visit-${v.id}`,
        kind: 'visit',
        date: new Date(v.scheduledAt),
        title: v.client.fullName,
        subtitle: v.property.title,
        href: `/dashboard/site-visits/${v.id}`,
        dotClass:
          v.status === 'CONFIRMED'
            ? 'bg-emerald-500'
            : v.status === 'CANCELLED'
              ? 'bg-red-500'
              : v.status === 'RESCHEDULED'
                ? 'bg-amber-500'
                : 'bg-indigo-500',
      }));

      const dated: FollowUp[] = [
        ...followUps.overdue,
        ...followUps.today,
        ...followUps.upcoming,
      ];
      const followEvents: CalendarEvent[] = dated
        .filter((f) => f.dueDate)
        .map((f) => {
          const due = new Date(f.dueDate as string);
          return {
            id: `fu-${f.id}`,
            kind: 'followup' as const,
            date: due,
            title: f.title,
            subtitle: f.lead ? f.lead.client.fullName : undefined,
            href: f.lead ? `/dashboard/clients/${f.lead.client.id}` : '/dashboard/follow-ups',
            dotClass: followUpDot(due),
          };
        })
        .filter((e) => e.date >= from && e.date <= to);

      setEvents([...visitEvents, ...followEvents].sort((a, b) => a.date.getTime() - b.date.getTime()));
    } catch {
      toast.error('Failed to load calendar');
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, scope, user?.id]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of events) {
      const k = dateKey(e.date);
      const arr = map.get(k);
      if (arr) arr.push(e);
      else map.set(k, [e]);
    }
    return map;
  }, [events]);

  const selectedEvents = eventsByDay.get(dateKey(selected)) || [];
  const todayKey = dateKey(startOfDay(new Date()));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar"
        description="Site visits and follow-ups at a glance"
        actions={
          <div className="flex rounded-lg border border-neutral-200 p-0.5 dark:border-neutral-800">
            {(['me', 'all'] as Scope[]).map((s) => (
              <button
                key={s}
                onClick={() => setScope(s)}
                className={
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors ' +
                  (scope === s
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                    : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white')
                }
              >
                {s === 'me' ? 'Mine' : 'All agents'}
              </button>
            ))}
          </div>
        }
      />

      <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
            {month.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
              className="rounded-lg border border-neutral-200 p-1.5 text-neutral-500 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800"
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => {
                const now = new Date();
                setMonth(new Date(now.getFullYear(), now.getMonth(), 1));
                setSelected(startOfDay(now));
              }}
              className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              Today
            </button>
            <button
              onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
              className="rounded-lg border border-neutral-200 p-1.5 text-neutral-500 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800"
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-neutral-200 bg-neutral-200 dark:border-neutral-800 dark:bg-neutral-800">
          {WEEKDAYS.map((w) => (
            <div
              key={w}
              className="bg-neutral-50 py-2 text-center text-xs font-semibold text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400"
            >
              {w}
            </div>
          ))}
          {grid.map((day) => {
            const inMonth = day.getMonth() === month.getMonth();
            const k = dateKey(day);
            const dayEvents = eventsByDay.get(k) || [];
            const isToday = k === todayKey;
            const isSelected = k === dateKey(selected);
            return (
              <button
                key={k}
                onClick={() => setSelected(startOfDay(day))}
                className={
                  'flex min-h-[92px] flex-col gap-1 p-1.5 text-left transition-colors ' +
                  (inMonth
                    ? 'bg-white dark:bg-neutral-900'
                    : 'bg-neutral-50/60 dark:bg-neutral-950/40') +
                  (isSelected ? ' ring-2 ring-inset ring-neutral-900 dark:ring-white' : '')
                }
              >
                <span
                  className={
                    'flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ' +
                    (isToday
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                      : inMonth
                        ? 'text-neutral-700 dark:text-neutral-300'
                        : 'text-neutral-400 dark:text-neutral-600')
                  }
                >
                  {day.getDate()}
                </span>
                <div className="flex flex-col gap-0.5">
                  {dayEvents.slice(0, 3).map((e) => (
                    <div
                      key={e.id}
                      className="flex items-center gap-1 truncate text-[11px] text-neutral-600 dark:text-neutral-300"
                    >
                      <span className={'h-1.5 w-1.5 shrink-0 rounded-full ' + e.dotClass} />
                      <span className="truncate">{e.title}</span>
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <span className="text-[10px] text-neutral-400">+{dayEvents.length - 3} more</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <h3 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-white">
          {selected.toLocaleDateString('en-IN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </h3>
        {isLoading ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Loading...</p>
        ) : selectedEvents.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Nothing scheduled.</p>
        ) : (
          <div className="space-y-2">
            {selectedEvents.map((e) => (
              <Link
                key={e.id}
                href={e.href}
                className="flex items-center gap-3 rounded-lg border border-neutral-200 p-3 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                  {e.kind === 'visit' ? <MapPin size={15} /> : <ListChecks size={15} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
                    {e.title}
                  </p>
                  {e.subtitle && (
                    <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                      {e.subtitle}
                    </p>
                  )}
                </div>
                <span className="shrink-0 text-xs text-neutral-400">
                  {e.date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}