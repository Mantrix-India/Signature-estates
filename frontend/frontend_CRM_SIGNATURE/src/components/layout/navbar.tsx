'use client';

import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { NotificationBell } from './notification-bell';
import { GlobalSearch } from './global-search';

const CRUMB_LABELS: Record<string, string> = {
  dashboard: 'Overview',
  analytics: 'Analytics',
  properties: 'Properties',
  builders: 'Builders',
  clients: 'Clients',
  leads: 'Leads',
  'follow-ups': 'Follow-ups',
  'site-visits': 'Site Visits',
  calendar: 'Calendar',
  invoices: 'Invoices',
  deals: 'Deals',
  owners: 'Owners',
  revenue: 'Revenue',
  projects: 'Projects',
  settings: 'Settings',
  new: 'New',
  edit: 'Edit',
  compare: 'Compare',
};

function useCrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  // Drop the leading "dashboard" segment — it is always the root here.
  const tail = segments.slice(1);

  if (tail.length === 0) return 'Overview';

  const last = tail[tail.length - 1];

  // Detail routes end in an id; fall back to the parent section name.
  const label =
    CRUMB_LABELS[last] ??
    CRUMB_LABELS[tail[tail.length - 2]] ??
    last.replace(/-/g, ' ');

  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const crumb = useCrumb();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-hairline bg-surface/80 px-4 backdrop-blur-md md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-hairline text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 md:hidden"
        >
          <Menu size={18} />
        </button>

        <nav
          aria-label="Breadcrumb"
          className="hidden shrink-0 items-center gap-2 lg:flex"
        >
          <span className="eyebrow">Workspace</span>
          <span className="text-neutral-300 dark:text-neutral-700">/</span>
          <span className="text-sm font-medium text-neutral-900 dark:text-white">
            {crumb}
          </span>
        </nav>

        <GlobalSearch />
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <NotificationBell />
        <ThemeToggle />
      </div>
    </header>
  );
}
