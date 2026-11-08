'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Building2,
  Users,
  Handshake,
  CalendarCheck,
  ListChecks,
  CalendarRange,
  Settings,
  Building,
  Receipt,
  BarChart3,
  LogOut,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  HeartHandshakeIcon,
  HandCoins,
  KeyRound,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import type { UserRole } from '@/types/auth';

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  roles?: UserRole[];
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    title: 'About',
    items: [
      {
        label: 'Know about us',
        href: '/about',
        icon: HeartHandshakeIcon,
      },
    ],
  },

  {
    title: 'Overview',
    items: [
      {
        label: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
      },
      {
        label: 'Analytics',
        href: '/dashboard/analytics',
        icon: BarChart3,
      },
    ],
  },

  {
    title: 'Inventory',
    items: [
      {
        label: 'Properties',
        href: '/dashboard/properties',
        icon: Building2,
      },
      {
        label: 'Builders',
        href: '/dashboard/builders',
        icon: Building,
      },
    ],
  },

  {
    title: 'Sales',
    items: [
      {
        label: 'Clients',
        href: '/dashboard/clients',
        icon: Users,
      },
      {
        label: 'Leads',
        href: '/dashboard/leads',
        icon: Handshake,
      },
      {
        label: 'Follow-ups',
        href: '/dashboard/follow-ups',
        icon: ListChecks,
      },
      {
        label: 'Site Visits',
        href: '/dashboard/site-visits',
        icon: CalendarCheck,
      },
      {
        label: 'Calendar',
        href: '/dashboard/calendar',
        icon: CalendarRange,
      },
      {
        label: 'Invoices',
        href: '/dashboard/invoices',
        icon: Receipt,
      },
    ],
  },

  {
    title: 'Brokerage',
    items: [
      {
        label: 'Deals',
        href: '/dashboard/deals',
        icon: HandCoins,
      },
      {
        label: 'Owners',
        href: '/dashboard/owners',
        icon: KeyRound,
      },
      {
        label: 'Revenue',
        href: '/dashboard/revenue',
        icon: TrendingUp,
        roles: ['ADMIN', 'MANAGER'],
      },
    ],
  },
];

function isActivePath(pathname: string, href: string) {
  if (href === '/dashboard') return pathname === '/dashboard';

  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinks({
  onNavigate,
  rail = false,
}: {
  onNavigate?: () => void;
  rail?: boolean;
}) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <nav
      className={cn(
        'flex flex-1 flex-col gap-5 overflow-y-auto py-4',
        rail ? 'px-2' : 'px-3'
      )}
    >
      {navGroups.map((group) => (
        <div key={group.title}>
          {!rail && (
            <p className="eyebrow px-3 pb-2 text-neutral-500/80">
              {group.title}
            </p>
          )}

          {rail && <div className="mx-auto mb-2 h-px w-6 bg-white/10" />}

          <div className="flex flex-col gap-0.5">
            {group.items
              .filter(
                (item) =>
                  !item.roles ||
                  (user ? item.roles.includes(user.role) : false)
              )
              .map((item) => {
                const active = isActivePath(pathname, item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    title={rail ? item.label : undefined}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'group relative flex items-center rounded-lg text-sm font-medium transition-all duration-150',
                      rail
                        ? 'h-10 w-10 justify-center'
                        : 'gap-3 px-3 py-2',
                      active
                        ? 'bg-white/10 text-white'
                        : 'text-neutral-300/70 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    {active && !rail && (
                      <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-brand-500" />
                    )}

                    <Icon
                      size={18}
                      className={cn(
                        'shrink-0 transition-colors',
                        active
                          ? 'text-brand-400'
                          : 'text-neutral-400/70 group-hover:text-neutral-200'
                      )}
                    />

                    {!rail && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
          </div>
        </div>
      ))}
    </nav>
  );
}

function BrandMark({
  rail = false,
  onToggleRail,
}: {
  rail?: boolean;
  onToggleRail?: () => void;
}) {
  return (
    <div
      className={cn(
        'flex h-14 items-center border-b border-white/10',
        rail ? 'justify-center px-2' : 'gap-2.5 px-5'
      )}
    >
      <span className="flex h-8 w-8 shrink-0 rotate-45 items-center justify-center rounded-[8px_2px_8px_2px] border border-brand-400/70 text-brand-300">
        <span className="-rotate-45 font-display text-lg leading-none">S</span>
      </span>

      {!rail && (
        <>
          <div className="flex min-w-0 flex-col leading-none">
            <span className="truncate font-display text-lg font-semibold tracking-tight text-white">
              Signature
            </span>

            <span className="eyebrow mt-1 text-neutral-400/70">
              Estates / OS
            </span>
          </div>

          {onToggleRail && (
            <button
              onClick={onToggleRail}
              aria-label="Collapse sidebar"
              className="ml-auto hidden h-8 w-8 items-center justify-center rounded-lg text-neutral-400/70 transition-colors hover:bg-white/5 hover:text-white md:flex"
            >
              <PanelLeftClose size={17} />
            </button>
          )}
        </>
      )}
    </div>
  );
}

function UserFooter({ rail = false }: { rail?: boolean }) {
  const { user, logout } = useAuth();

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'RE';

  if (rail) {
    return (
      <div className="flex flex-col items-center gap-1 border-t border-white/10 p-2">
        <span
          title={user?.fullName ?? 'Account'}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500/20 text-xs font-semibold text-brand-300"
        >
          {initials}
        </span>

        <Link
          href="/dashboard/settings"
          title="Settings"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-400/70 transition-colors hover:bg-white/5 hover:text-white"
        >
          <Settings size={18} />
        </Link>

        <button
          onClick={logout}
          aria-label="Log out"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-400/70 transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="border-t border-white/10 p-3">
      <div className="flex items-center gap-3 rounded-lg px-2 py-1.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-xs font-semibold text-brand-300">
          {initials}
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white">
            {user?.fullName ?? 'Account'}
          </p>

          <p className="truncate text-xs capitalize text-neutral-400/70">
            {user?.role?.toLowerCase() ?? 'agent'}
          </p>
        </div>

        <button
          onClick={logout}
          aria-label="Log out"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400/70 transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut size={16} />
        </button>
      </div>

      <Link
        href="/dashboard/settings"
        className="mt-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-neutral-300/70 transition-colors hover:bg-white/5 hover:text-white"
      >
        <Settings size={18} className="text-neutral-400/70" />
        Settings
      </Link>
    </div>
  );
}

export function Sidebar({
  mobileOpen = false,
  onClose,
}: {
  mobileOpen?: boolean;
  onClose?: () => void;
}) {
  const [rail, setRail] = useState(false);

  // Remember the collapsed state between visits.
  useEffect(() => {
    try {
      setRail(localStorage.getItem('reos:sidebar-rail') === '1');
    } catch {
      /* storage unavailable — fall back to expanded */
    }
  }, []);

  function toggleRail() {
    setRail((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('reos:sidebar-rail', next ? '1' : '0');
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [mobileOpen]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden shrink-0 flex-col bg-rail transition-[width] duration-300 ease-out md:flex',
          rail ? 'w-[76px]' : 'w-64'
        )}
      >
        <BrandMark rail={rail} onToggleRail={toggleRail} />
        <NavLinks rail={rail} />

        {rail && (
          <button
            onClick={toggleRail}
            aria-label="Expand sidebar"
            className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg text-neutral-400/70 transition-colors hover:bg-white/5 hover:text-white"
          >
            <PanelLeftOpen size={17} />
          </button>
        )}

        <UserFooter rail={rail} />
      </aside>

      {/* Mobile drawer */}
      <div
        className={cn(
          'fixed inset-0 z-40 md:hidden',
          mobileOpen ? 'pointer-events-auto' : 'pointer-events-none'
        )}
        aria-hidden={!mobileOpen}
      >
        <div
          onClick={onClose}
          className={cn(
            'absolute inset-0 bg-neutral-950/60 backdrop-blur-sm transition-opacity',
            mobileOpen ? 'opacity-100' : 'opacity-0'
          )}
        />

        <aside
          className={cn(
            'absolute left-0 top-0 flex h-full w-72 flex-col bg-rail transition-transform duration-300 ease-out',
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex items-center justify-between border-b border-white/10 pr-3">
            <div className="flex-1">
              <BrandMark />
            </div>

            <button
              onClick={onClose}
              aria-label="Close menu"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400/70 hover:bg-white/5 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          <NavLinks onNavigate={onClose} />
          <UserFooter />
        </aside>
      </div>
    </>
  );
}
