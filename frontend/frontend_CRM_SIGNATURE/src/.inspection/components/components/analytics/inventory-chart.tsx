'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { InventoryBreakdown } from '@/types/analytics';

const COLORS: Record<string, string> = {
  AVAILABLE: '#10b981',
  RESERVED: '#f59e0b',
  BOOKED: '#3b82f6',
  SOLD: '#a3a3a3',
};

export function InventoryChart({ data }: { data: InventoryBreakdown[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-neutral-500 dark:text-neutral-400">No property data yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="status"
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={2}
        >
          {data.map((entry) => (
            <Cell key={entry.status} fill={COLORS[entry.status] || '#a3a3a3'} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}