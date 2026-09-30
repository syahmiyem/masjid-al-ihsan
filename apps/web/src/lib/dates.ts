// Calendar arithmetic on ISO dates (YYYY-MM-DD), timezone-free: every date is a Malaysian calendar date.
import type { Weekday } from './types.ts';

export const WEEKDAY_KEYS: Weekday[] = ['ahad', 'isnin', 'selasa', 'rabu', 'khamis', 'jumaat', 'sabtu'];

const toUtc = (iso: string) => new Date(`${iso}T00:00:00Z`);
const fromUtc = (d: Date) => d.toISOString().slice(0, 10);

export function addDays(iso: string, days: number): string {
  const d = toUtc(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return fromUtc(d);
}

export function weekdayOf(iso: string): Weekday {
  return WEEKDAY_KEYS[toUtc(iso).getUTCDay()];
}

/** Inclusive list of dates. */
export function dateRange(from: string, to: string): string[] {
  const out: string[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) out.push(d);
  return out;
}

/** "2026-10" → first and last date of that month. */
export function monthBounds(month: string): { first: string; last: string } {
  const [y, m] = month.split('-').map(Number);
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return { first: `${month}-01`, last: `${month}-${String(last).padStart(2, '0')}` };
}

export function addMonths(month: string, n: number): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1 + n, 1));
  return d.toISOString().slice(0, 7);
}

/** Months from `from` to `to` inclusive, as "YYYY-MM". */
export function monthRange(from: string, to: string): string[] {
  const out: string[] = [];
  for (let m = from; m <= to; m = addMonths(m, 1)) out.push(m);
  return out;
}

/** Monday of the week containing `iso` (Malaysian weeks are shown Isnin → Ahad). */
export function weekStart(iso: string): string {
  const day = toUtc(iso).getUTCDay(); // 0 = Ahad
  return addDays(iso, day === 0 ? -6 : 1 - day);
}

/** nth weekday of a month, or the last one ("terakhir"). Returns undefined if it doesn't exist (e.g. 5th). */
export function nthWeekdayOfMonth(
  month: string,
  weekday: Weekday,
  nth: number | 'terakhir',
): string | undefined {
  const { first, last } = monthBounds(month);
  const matches = dateRange(first, last).filter((d) => weekdayOf(d) === weekday);
  return nth === 'terakhir' ? matches.at(-1) : matches[nth - 1];
}
