/**
 * Business-timezone helpers.
 *
 * The API is deployed on UTC hosts (Render/Neon) but the agency works in IST.
 * Anything that buckets by "day" or "month", or prints a time into a
 * notification, must use the business timezone — not the server's local clock —
 * otherwise "Today" follow-ups and monthly revenue shift by 5h30m.
 *
 * Override with APP_TIMEZONE (any IANA zone). Defaults to Asia/Kolkata.
 */
export const APP_TIMEZONE = process.env.APP_TIMEZONE || 'Asia/Kolkata';

/** Offset (ms) of `tz` from UTC at the given instant. Positive east of UTC. */
function tzOffsetMs(date: Date, tz: string = APP_TIMEZONE): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(date);

  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const asUtc = Date.UTC(
    get('year'),
    get('month') - 1,
    get('day'),
    get('hour'),
    get('minute'),
    get('second')
  );
  return asUtc - Math.floor(date.getTime() / 1000) * 1000;
}

/** Calendar parts of `date` as seen in the business timezone. */
export function zonedParts(date: Date, tz: string = APP_TIMEZONE) {
  const shifted = new Date(date.getTime() + tzOffsetMs(date, tz));
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth(), // 0-11
    day: shifted.getUTCDate(),
  };
}

/** UTC instant of local midnight (business timezone) for the given Y/M/D. */
export function zonedMidnight(year: number, month: number, day: number, tz: string = APP_TIMEZONE): Date {
  const guess = new Date(Date.UTC(year, month, day));
  return new Date(guess.getTime() - tzOffsetMs(guess, tz));
}

/** Start of today and start of tomorrow in the business timezone. */
export function dayBounds(now: Date = new Date(), tz: string = APP_TIMEZONE) {
  const { year, month, day } = zonedParts(now, tz);
  const startToday = zonedMidnight(year, month, day, tz);
  const startTomorrow = zonedMidnight(year, month, day + 1, tz);
  return { startToday, startTomorrow };
}

/** Sortable month key, e.g. "2026-11", in the business timezone. */
export function monthKey(date: Date, tz: string = APP_TIMEZONE): string {
  const { year, month } = zonedParts(date, tz);
  return `${year}-${String(month + 1).padStart(2, '0')}`;
}

/** Display label for a month key, e.g. "2026-11" -> "Nov 26". */
export function monthLabel(key: string): string {
  const [y, m] = key.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, 15)).toLocaleDateString('en-IN', {
    month: 'short',
    year: '2-digit',
    timeZone: 'UTC',
  });
}

/** The last `count` month keys ending with the current month, oldest first. */
export function lastMonthKeys(count: number, now: Date = new Date(), tz: string = APP_TIMEZONE): string[] {
  const { year, month } = zonedParts(now, tz);
  const keys: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(year, month - i, 15));
    keys.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`);
  }
  return keys;
}

/** Human date-time in the business timezone, for notification text. */
export function formatDateTime(date: Date, tz: string = APP_TIMEZONE): string {
  return date.toLocaleString('en-IN', {
    timeZone: tz,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
