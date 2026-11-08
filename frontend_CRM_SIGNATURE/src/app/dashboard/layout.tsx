'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Navbar } from '@/components/layout/navbar';
import { RouteGuard } from '@/components/auth/route-guard';
import type { ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <RouteGuard>
      <div className="relative flex h-screen overflow-hidden bg-transparent">
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

        <div className="flex flex-1 flex-col overflow-hidden">
          <Navbar onMenuClick={() => setMobileOpen(true)} />

          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <div className="animate-fade-up mx-auto w-full max-w-[1400px]">
              {children}
            </div>
          </main>
        </div>
      </div>
    </RouteGuard>
  );
}
