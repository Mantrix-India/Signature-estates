import type { LeadFunnelItem } from '@/types/analytics';
import type { LeadStage } from '@/types/lead';
import { STAGE_COLORS, STAGE_LABELS } from '@/lib/leads';

// Open pipeline = every stage up to and including CLOSED. LOST is reported on
// its own line underneath. The dashboard and analytics page both render this
// exact component from the same funnel data, so the bars always match.
const PIPELINE_STAGES: LeadStage[] = [
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'PROPERTIES_SHARED',
  'INTERESTED',
  'SITE_VISIT',
  'NEGOTIATION',
  'BOOKING',
  'CLOSED',
];

export function PipelineBars({ funnel }: { funnel: LeadFunnelItem[] }) {
  const counts = new Map(funnel.map((f) => [f.stage, f.count]));
  const rows = PIPELINE_STAGES.map((stage) => ({ stage, count: counts.get(stage) ?? 0 }));
  const lost = counts.get('LOST') ?? 0;
  const max = Math.max(1, ...rows.map((r) => r.count));

  return (
    <div className="space-y-3.5">
      {rows.map(({ stage, count }) => (
        <div key={stage}>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300">
              <i className="h-2 w-2 rounded-full" style={{ backgroundColor: STAGE_COLORS[stage] }} />
              {STAGE_LABELS[stage]}
            </span>
            <b className="tabular text-neutral-900 dark:text-white">{count}</b>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full rounded-full transition-[width] duration-500"
              style={{
                width: `${Math.max(count > 0 ? 6 : 0, (count / max) * 100)}%`,
                backgroundColor: STAGE_COLORS[stage],
              }}
            />
          </div>
        </div>
      ))}

      <p className="pt-1 text-xs text-neutral-500 dark:text-neutral-400">
        <span
          className="mr-1.5 inline-block h-2 w-2 rounded-full align-middle"
          style={{ backgroundColor: STAGE_COLORS.LOST }}
        />
        {lost} lost lead{lost === 1 ? '' : 's'}
      </p>
    </div>
  );
}
