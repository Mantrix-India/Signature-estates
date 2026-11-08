'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { RevenueByMonth } from '@/types/analytics';

function formatCompact(value: number) {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  return `₹${value}`;
}

export function RevenueChart({ data }: { data: RevenueByMonth[] }) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        No paid invoices yet — revenue will appear here once invoices are marked as paid.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-neutral-200, #e5e5e5)" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={formatCompact} />
        <Tooltip formatter={(value) => formatCompact(Number(value))} />
        <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}