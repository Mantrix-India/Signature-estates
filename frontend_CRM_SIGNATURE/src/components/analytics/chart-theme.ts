// Recharts styling driven by the app's CSS tokens, so charts follow light/dark.
export const tooltipStyle = {
  contentStyle: {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-hairline)',
    borderRadius: 12,
    fontSize: 12,
    boxShadow: 'var(--shadow-lift)',
  },
  labelStyle: { color: 'inherit', fontWeight: 600 },
  itemStyle: { color: 'inherit' },
  cursor: { fill: 'var(--color-surface-muted)' },
};

export const axisTick = { fontSize: 11, fill: 'currentColor' };
export const gridStroke = 'var(--color-hairline)';
