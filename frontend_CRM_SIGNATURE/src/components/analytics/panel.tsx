import type { ReactNode } from 'react';

/** Card shell shared by the dashboard and the analytics page (one design system). */
export function Panel({
  eyebrow,
  title,
  action,
  children,
  className = '',
}: {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`flex flex-col rounded-2xl border border-hairline bg-surface p-5 shadow-[var(--shadow-soft)] ${className}`}
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
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

export function SkeletonBlock({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-2xl border border-hairline bg-surface-muted ${className}`} />
  );
}

export function PanelError({ message = 'Could not load this section.' }: { message?: string }) {
  return <p className="py-6 text-sm text-neutral-500 dark:text-neutral-400">{message}</p>;
}
