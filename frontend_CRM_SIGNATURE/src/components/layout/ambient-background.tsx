'use client';

import { cn } from '@/lib/utils';

type AmbientBackgroundProps = {
  className?: string;
};

export function AmbientBackground({ className }: AmbientBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 isolate overflow-hidden', className)}
    >
      <div className="absolute inset-0 bg-[url('/real-estate-background.png')] bg-cover bg-center opacity-[0.5] dark:opacity-[0.58]" />
      <div className="absolute inset-0 bg-background/50 dark:bg-background/42" />
    </div>
  );
}
