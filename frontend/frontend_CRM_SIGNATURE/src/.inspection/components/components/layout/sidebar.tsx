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
  Settings,
  Building,
  Receipt,
  BarChart3,
  LogOut,
  X,
  HeartHandshakeIcon,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';

type NavItem = { label: string; href: string; icon: LucideIcon };
type NavGroup = { title: string; items: NavItem[] };

const navGroups: NavGroup[] = [


   {
    title: 'About',
    items: [
      { label: 'Know about us', href: '/about', icon: HeartHandshakeIcon },
    ],
  },




  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'Inventory',
    items: [
      { label: 'Properties', href: '/dashboard/properties', icon: Building2 },
      { label: 'Builders', href: '/dashboard/builders', icon: Building },
    ],
  },
  {
    title: 'Sales',
    items: [
      { label: 'Clients', href: '/dashboard/clients', icon: Users },
      { label: 'Leads', href: '/dashboard/leads', icon: Handshake },
      { label: 'Site Visits', href: '/dashboard/site-visits', icon: CalendarCheck },
      { label: 'Invoices', href: '/dashboard/invoices', icon: Receipt },
    ],
  },
];

function isActivePath(pathname: string, href: string) {
  if (href === '/dashboard') return pathname === '/dashboard';
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-4">
      {navGroups.map((group) => (
        <div key={group.title}>
          <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-600">
            {group.title}
          </p>
          <div className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const active = isActivePath(pathname, item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800/70 dark:text-white'
                      : 'text-neutral-500 hover:bg-neutral-100/70 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/40 dark:hover:text-white'
                  )}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-brand-500" />
                  )}
                  <Icon
                    size={18}
                    className={cn(
                      'shrink-0 transition-colors',
                      active
                        ? 'text-brand-600 dark:text-brand-400'
                        : 'text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300'
                    )}
                  />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

function BrandMark() {
  return (
    <div className="flex h-14 items-center gap-2.5 border-b border-neutral-200 px-5 dark:border-neutral-800">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
        <Building2 size={17} />
      </span>
      <div className="flex flex-col leading-none">
  <span className="whitespace-nowrap text-lg font-semibold tracking-tight">
    Signature <span className="text-[#D4AF72]">Estates</span>
  </span>

  <span className="mt-0.5 text-[11px] text-neutral-400 dark:text-neutral-600">
    Agency workspace
  </span>
</div>
    </div>
  );
}

function UserFooter() {
  const { user, logout } = useAuth();
  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'RE';

  return (
    <div className="border-t border-neutral-200 p-3 dark:border-neutral-800">
      <div className="flex items-center gap-3 rounded-lg px-2 py-1.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-xs font-semibold text-brand-700 dark:text-brand-300">
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
            {user?.fullName ?? 'Account'}
          </p>
          <p className="truncate text-xs capitalize text-neutral-500 dark:text-neutral-400">
            {user?.role?.toLowerCase() ?? 'agent'}
          </p>
        </div>
        <button
          onClick={logout}
          aria-label="Log out"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"
        >
          <LogOut size={16} />
        </button>
      </div>
      <Link
        href="/dashboard/settings"
        className="mt-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-neutral-500 transition-colors hover:bg-neutral-100/70 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/40 dark:hover:text-white"
      >
        <Settings size={18} className="text-neutral-400" />
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
      <aside className="hidden w-64 shrink-0 flex-col border-r border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 md:flex">
        <BrandMark />
        <NavLinks />
        <UserFooter />
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
            'absolute inset-0 bg-neutral-950/50 backdrop-blur-sm transition-opacity',
            mobileOpen ? 'opacity-100' : 'opacity-0'
          )}
        />
        <aside
          className={cn(
            'absolute left-0 top-0 flex h-full w-72 flex-col border-r border-neutral-200 bg-white transition-transform duration-300 ease-out dark:border-neutral-800 dark:bg-neutral-900',
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex items-center justify-between border-b border-neutral-200 pr-3 dark:border-neutral-800">
            <div className="flex-1">
              <BrandMark />
            </div>
            <button
              onClick={onClose}
              aria-label="Close menu"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"
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
