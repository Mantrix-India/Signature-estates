/** Indian-currency formatting: Cr / L / grouped rupees. Safe for negatives. */
export function formatPrice(price: number): string {
  const value = Number.isFinite(price) ? price : 0;
  const abs = Math.abs(value);
  if (abs >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (abs >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}

/** Short axis/tooltip form: ₹1.2Cr, ₹4.5L, ₹12K, ₹900. */
export function formatCompactPrice(value: number): string {
  const v = Number.isFinite(value) ? value : 0;
  const abs = Math.abs(v);
  if (abs >= 10000000) return `₹${(v / 10000000).toFixed(1)}Cr`;
  if (abs >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  if (abs >= 1000) return `₹${(v / 1000).toFixed(0)}K`;
  return `₹${Math.round(v)}`;
}
