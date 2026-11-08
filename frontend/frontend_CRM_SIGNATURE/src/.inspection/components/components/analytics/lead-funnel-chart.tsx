'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { LeadFunnelItem } from '@/types/analytics';

const COLORS: Record<string, string> = {
  NEW: '#a3a3a3',
  CONTACTED: '#3b82f6',
  QUALIFIED: '#8b5cf6',
  NEGOTIATION: '#f59e0b',
  WON: '#10b981',
  LOST: '#ef4444',
};

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
            <Cell key={entry.stage} fill={COLORS[entry.stage] || '#a3a3a3'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}