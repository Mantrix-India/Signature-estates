'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { RevenueByMonth } from '@/types/analytics';
import { formatCompactPrice, formatPrice } from '@/lib/format';
import { axisTick, gridStroke, tooltipStyle } from './chart-theme';

/** Stacked monthly revenue: paid invoices + paid deal payments. */
export function RevenueChart({ data, height = 260 }: { data: RevenueByMonth[]; height?: number }) {
  if (data.every((d) => d.total === 0)) {
    return (
      <p className="py-6 text-sm text-neutral-500 dark:text-neutral-400">
        No money collected in the last 12 months yet — it appears here once invoices or deal
        payments are marked as paid.
      </p>
    );
  }

  return (
    <div className="text-neutral-500 dark:text-neutral-400">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
          <XAxis dataKey="month" tick={axisTick} axisLine={false} tickLine={false} />
          <YAxis
            tick={axisTick}
            axisLine={false}
            tickLine={false}
            tickFormatter={formatCompactPrice}
            width={56}
          />
          <Tooltip {...tooltipStyle} formatter={(value, name) => [formatPrice(Number(value)), name]} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="deals" name="Deal payments" stackId="rev" fill="#d97746" />
          <Bar dataKey="invoices" name="Invoices" stackId="rev" fill="#258b88" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
