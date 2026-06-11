/**
 * Calendar-day helpers shared by the challenge logic modules. ISO date
 * strings are treated as plain calendar days via UTC arithmetic — no
 * timezone or clock access anywhere.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

export function shiftDate(date: string, days: number): string {
  return new Date(Date.parse(date) + days * DAY_MS).toISOString().slice(0, 10);
}

/** Weekday in JS Date convention: 0 = Sunday … 6 = Saturday. */
export function weekdayOf(date: string): number {
  return new Date(`${date}T00:00:00Z`).getUTCDay();
}

/** 0 = Monday … 6 = Sunday. */
export function mondayIndex(date: string): number {
  return (weekdayOf(date) + 6) % 7;
}
