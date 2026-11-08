import { Clock, MapPin, Check } from 'lucide-react';

export function PortalVisitCard({
  propertyTitle,
  address,
  city,
  scheduledAt,
  status,
  clientConfirmed,
  onConfirm,
}: {
  propertyTitle: string;
  address: string;
  city: string;
  scheduledAt: string;
  status: string;
  clientConfirmed: boolean;
  onConfirm: () => void;
}) {
  const date = new Date(scheduledAt);

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-neutral-900">{propertyTitle}</h3>
          <p className="mt-1 flex items-center gap-1 text-sm text-neutral-500">
            <MapPin size={13} /> {address}, {city}
          </p>
        </div>
        <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600">
          {status}
        </span>
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-sm text-neutral-700">
        <Clock size={14} />
        {date.toLocaleString('en-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </p>

      <button
        onClick={onConfirm}
        disabled={clientConfirmed}
        className={`mt-3 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
          clientConfirmed
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
            : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
        }`}
      >
        <Check size={14} /> {clientConfirmed ? "You've confirmed this visit" : 'Confirm I can make it'}
      </button>
    </div>
  );
}