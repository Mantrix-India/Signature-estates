'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { InventoryBreakdown } from '@/types/analytics';
import { tooltipStyle } from './chart-theme';

const COLORS: Record<string, string> = {
  AVAILABLE: '#62977a',
  RESERVED: '#e0a43a',
  BOOKED: '#258b88',
  SOLD: '#a3a3a3',
};

const LABELS: Record<string, string> = {
  AVAILABLE: 'Available',
  RESERVED: 'Reserved',
  BOOKED: 'Booked',
  SOLD: 'Sold',
};

export function InventoryChart({ data }: { data: InventoryBreakdown[] }) {
  const rows = data.filter((d) => d.count > 0).map((d) => ({ ...d, label: LABELS[d.status] ?? d.status }));

  if (rows.length === 0) {
    return <p className="py-6 text-sm text-neutral-500 dark:text-neutral-400">No property data yet.</p>;
  }

  return (
    <div className="text-neutral-500 dark:text-neutral-400">
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={rows}
            dataKey="count"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={2}
            stroke="var(--color-surface)"
          >
            {rows.map((entry) => (
              <Cell key={entry.status} fill={COLORS[entry.status] || '#a3a3a3'} />
            ))}
          </Pie>
          <Tooltip {...tooltipStyle} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
