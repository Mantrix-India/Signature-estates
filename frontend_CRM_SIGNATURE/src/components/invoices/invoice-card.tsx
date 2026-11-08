import { InvoiceStatus, Invoice } from '@/types/invoice';
import { cn } from '@/lib/utils';

const statusStyles: Record<InvoiceStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  PAID: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  OVERDUE: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
  CANCELLED: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
};

function formatPrice(price: number) {
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
  return `₹${price.toLocaleString('en-IN')}`;
}

export function InvoiceCard({
  invoice,
  onStatusChange,
}: {
  invoice: Invoice;
  onStatusChange: (status: InvoiceStatus) => void;
}) {
  const statuses: InvoiceStatus[] = ['PENDING', 'PAID', 'OVERDUE', 'CANCELLED'];

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-neutral-900 dark:text-white">
            {invoice.invoiceNumber}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {invoice.client.fullName}
            {invoice.property && ` · ${invoice.property.title}`}
          </p>
        </div>
        <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium', statusStyles[invoice.status])}>
          {invoice.status}
        </span>
      </div>

      <p className="mt-3 text-lg font-semibold text-neutral-900 dark:text-white">
        {formatPrice(invoice.amount)}
      </p>
      <p className="text-xs text-neutral-400">
        Due {new Date(invoice.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
      </p>

      {invoice.notes && (
        <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">{invoice.notes}</p>
      )}

      <select
        value={invoice.status}
        onChange={(e) => onStatusChange(e.target.value as InvoiceStatus)}
        className="mt-3 w-full rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-xs text-neutral-900 outline-none focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
      >
        {statuses.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </div>
  );
}