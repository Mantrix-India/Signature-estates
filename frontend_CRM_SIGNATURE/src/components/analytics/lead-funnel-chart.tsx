'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { LeadFunnelItem } from '@/types/analytics';
import { LeadStage } from '@/types/lead';
import { STAGE_COLORS, STAGE_LABELS } from '@/lib/leads';
import { axisTick, gridStroke, tooltipStyle } from './chart-theme';

export function LeadFunnelChart({ data }: { data: LeadFunnelItem[] }) {
  if (data.every((d) => d.count === 0)) {
    return <p className="py-6 text-sm text-neutral-500 dark:text-neutral-400">No leads yet.</p>;
  }

  const rows = data.map((d) => ({ ...d, label: STAGE_LABELS[d.stage as LeadStage] ?? d.stage }));

  return (
    <div className="text-neutral-500 dark:text-neutral-400">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={rows} margin={{ bottom: 24 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
          <XAxis
            dataKey="label"
            tick={axisTick}
            axisLine={false}
            tickLine={false}
            interval={0}
            angle={-30}
            textAnchor="end"
          />
          <YAxis tick={axisTick} axisLine={false} tickLine={false} allowDecimals={false} width={32} />
          <Tooltip {...tooltipStyle} formatter={(value) => [value, 'Leads']} />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {rows.map((entry) => (
              <Cell key={entry.stage} fill={STAGE_COLORS[entry.stage as LeadStage] || '#a3a3a3'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
