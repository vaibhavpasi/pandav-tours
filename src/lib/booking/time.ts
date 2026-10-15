/**
 * Time helpers for Nashik (IST, UTC+05:30, no daylight saving).
 *
 * Customers pick a local date and time; the browser sends them as plain
 * strings ("2026-10-20", "06:30") and the server converts them here, so the
 * customer's device time zone can never shift a pickup time.
 */

const IST_OFFSET_MINUTES = 330;
const MS_PER_MINUTE = 60_000;
const MS_PER_DAY = 86_400_000;

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/;

/** Converts an IST wall-clock date + time to a UTC instant; null if invalid. */
export function istToUtc(date: string, time: string): Date | null {
  const d = DATE_RE.exec(date);
  const t = TIME_RE.exec(time);
  if (!d || !t) return null;
  const [year, month, day] = [Number(d[1]), Number(d[2]), Number(d[3])];
  const [hour, minute] = [Number(t[1]), Number(t[2])];

  const utcMs = Date.UTC(year, month - 1, day, hour, minute) - IST_OFFSET_MINUTES * MS_PER_MINUTE;
  const result = new Date(utcMs);
  // Reject impossible dates such as 2026-02-31 (Date.UTC would roll them over).
  const check = toIstParts(result);
  return check.date === date && check.time === `${t[1]}:${t[2]}` ? result : null;
}

export type IstParts = { date: string; time: string; minutesOfDay: number };

/** UTC instant → IST date "YYYY-MM-DD", time "HH:mm" and minutes past midnight. */
export function toIstParts(instant: Date): IstParts {
  const shifted = new Date(instant.getTime() + IST_OFFSET_MINUTES * MS_PER_MINUTE);
  const iso = shifted.toISOString();
  const hours = shifted.getUTCHours();
  const minutes = shifted.getUTCMinutes();
  return { date: iso.slice(0, 10), time: iso.slice(11, 16), minutesOfDay: hours * 60 + minutes };
}

/** Number of IST calendar days touched from `start` to `end`, inclusive. */
export function istCalendarDaysInclusive(start: Date, end: Date): number {
  const a = Date.parse(`${toIstParts(start).date}T00:00:00Z`);
  const b = Date.parse(`${toIstParts(end).date}T00:00:00Z`);
  return Math.floor((b - a) / MS_PER_DAY) + 1;
}

/** "22:00" / "22:00:00" → 1320 */
export function timeToMinutes(value: string): number {
  const t = TIME_RE.exec(value);
  if (!t) throw new Error(`Invalid time: ${value}`);
  return Number(t[1]) * 60 + Number(t[2]);
}

/**
 * True when the IST time of `instant` falls in [start, end). Windows may wrap
 * midnight (22:00 → 06:00). A window with start === end is treated as off.
 */
export function isInNightWindow(instant: Date, start: string, end: string): boolean {
  const s = timeToMinutes(start);
  const e = timeToMinutes(end);
  if (s === e) return false;
  const m = toIstParts(instant).minutesOfDay;
  return s < e ? m >= s && m < e : m >= s || m < e;
}

/** Today's IST date ("YYYY-MM-DD"), for date-input `min` attributes. */
export function istToday(now: Date): string {
  return toIstParts(now).date;
}

export function addDaysToIsoDate(date: string, days: number): string {
  const ms = Date.parse(`${date}T00:00:00Z`) + days * MS_PER_DAY;
  return new Date(ms).toISOString().slice(0, 10);
}
