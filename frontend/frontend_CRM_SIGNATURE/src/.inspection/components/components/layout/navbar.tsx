'use client';

import { Menu, Search } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { NotificationBell } from './notification-bell';

export function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-neutral-200 bg-white/80 px-4 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/80 md:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800 md:hidden"
        >
          <Menu size={18} />
        </button>

        <div className="hidden items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm text-neutral-400 dark:border-neutral-800 dark:bg-neutral-950/50 sm:flex">
          <Search size={15} />
          <span className="pr-8">Search everything…</span>
          <kbd className="rounded border border-neutral-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-neutral-400 dark:border-neutral-700 dark:bg-neutral-800">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <NotificationBell />
        <ThemeToggle />
      </div>
    </header>
  );
}
