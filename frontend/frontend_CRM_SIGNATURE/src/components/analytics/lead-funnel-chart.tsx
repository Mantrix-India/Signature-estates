'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { LeadFunnelItem } from '@/types/analytics';
import { LeadStage } from '@/types/lead';
import { STAGE_COLORS } from '@/lib/leads';

export function LeadFunnelChart({ data }: { data: LeadFunnelItem[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-neutral-200, #e5e5e5)" vertical={false} />
        <XAxis dataKey="stage" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
          {data.map((entry) => (
            <Cell key={entry.stage} fill={STAGE_COLORS[entry.stage as LeadStage] || '#a3a3a3'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}