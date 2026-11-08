'use client';

import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { RevenueSummary } from '@/types/revenue';
import { DEAL_STAGE_LABELS, DEAL_STAGE_COLORS } from '@/lib/deals';

function formatCompact(value: number) {
  if (Math.abs(value) >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (Math.abs(value) >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  return `₹${value}`;
}

export function DealsByStageChart({ data }: { data: RevenueSummary['dealsByStage'] }) {
  if (!data || data.length === 0) {
    return (
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        No deals yet — value by stage will appear here once deals are created.
      </p>
    );
  }

  const chartData = data.map((d) => ({
    stage: DEAL_STAGE_LABELS[d.stage] ?? d.stage,
    value: d.value,
    count: d.count,
    color: DEAL_STAGE_COLORS[d.stage] ?? '#3b82f6',
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-neutral-200, #e5e5e5)" vertical={false} />
        <XAxis dataKey="stage" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={formatCompact} />
                <Tooltip formatter={(value) => formatCompact(Number(value))} />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}