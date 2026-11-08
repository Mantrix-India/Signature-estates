import { Building2 } from 'lucide-react';

/**
 * The brand / marketing panel shown beside the login and register forms.
 * Hidden on small screens so auth stays focused on mobile.
 */
export function AuthShowcase() {
  return (
    <aside className="relative hidden overflow-hidden lg:flex lg:w-[54%]">
      <img
        src="/auth-showcase.png"
        alt="Modern luxury residential development at dusk"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* Legibility + brand tint */}
      <div className="absolute inset-0 bg-gradient-to-tr from-neutral-950 via-neutral-950/70 to-neutral-900/30" />
      <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_0%_100%,rgba(80,90,220,0.28),transparent_55%)]" />

      <div className="relative z-10 flex w-full flex-col justify-between p-12">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white backdrop-blur">
            <Building2 size={18} />
          </span>
          <span className="text-base font-semibold tracking-tight text-white">
            Real Estate OS
          </span>
        </div>

        <div className="max-w-md">
          <h2 className="text-balance text-3xl font-semibold leading-tight tracking-tight text-white">
            Run your entire real estate business from one place.
          </h2>
          <p className="mt-4 text-pretty text-sm leading-relaxed text-neutral-300">
            Properties, builders, clients, leads, site visits, documents and
            analytics — unified into a single, calm operating system built for
            serious agencies.
          </p>

          <div className="mt-8 flex items-center gap-6">
            {[
              { value: 'Inventory', label: 'Live status sync' },
              { value: 'Pipeline', label: 'Visual lead board' },
              { value: 'Insights', label: 'Real-time analytics' },
            ].map((item) => (
              <div key={item.value}>
                <p className="text-sm font-semibold text-white">{item.value}</p>
                <p className="mt-0.5 text-xs text-neutral-400">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
