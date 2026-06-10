/**
 * Pure grid model for the challenge contribution map. No I/O, no React,
 * no timezone assumptions: ISO date strings are treated as plain calendar
 * days via UTC arithmetic, and the effective "today" is always an input.
 */

export type CellState = "completed" | "missed" | "left" | "not-scheduled";

export interface GridCell {
  date: string;
  state: CellState;
}

/** A week is 7 slots, Monday first; null slots are blanks outside the range. */
export type GridWeek = (GridCell | null)[];

export interface GridMonth {
  /** "2026-06" */
  key: string;
  /** "June 2026" */
  label: string;
  weeks: GridWeek[];
}

export interface GridInput {
  startDate: string;
  endDate: string | null;
  /** Weekday indices in JS Date convention: 0 = Sunday … 6 = Saturday. */
  scheduledDays: readonly number[];
  completedDates: readonly string[];
  /** The effective today (client-local). */
  today: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function shiftDate(date: string, days: number): string {
  return new Date(Date.parse(date) + days * DAY_MS).toISOString().slice(0, 10);
}

function weekdayOf(date: string): number {
  return new Date(`${date}T00:00:00Z`).getUTCDay();
}

/** 0 = Monday … 6 = Sunday. */
function mondayIndex(date: string): number {
  return (weekdayOf(date) + 6) % 7;
}

function monthLabel(key: string): string {
  const month = Number(key.slice(5, 7));
  return `${MONTH_NAMES[month - 1]} ${key.slice(0, 4)}`;
}

/**
 * Build the month-separated grid: each month restarts its own Monday-first
 * weeks, with leading/trailing blanks padding partial weeks. A bounded
 * challenge renders start → end; an open-ended one renders start → today
 * (or just the start day if the challenge hasn't started yet).
 */
export function buildGrid(input: GridInput): GridMonth[] {
  const { startDate, endDate, scheduledDays, today } = input;
  const completed = new Set(input.completedDates);

  const cellState = (date: string): CellState => {
    if (completed.has(date)) return "completed";
    if (!scheduledDays.includes(weekdayOf(date))) return "not-scheduled";
    return date < today ? "missed" : "left";
  };

  const renderEnd = endDate ?? (today > startDate ? today : startDate);

  const months: GridMonth[] = [];
  let month: GridMonth | null = null;
  let week: GridWeek = [];

  const flushWeek = () => {
    if (!month || week.length === 0) return;
    while (week.length < 7) week.push(null);
    month.weeks.push(week);
    week = [];
  };

  for (let date = startDate; date <= renderEnd; date = shiftDate(date, 1)) {
    const key = date.slice(0, 7);
    if (month === null || month.key !== key) {
      flushWeek();
      month = { key, label: monthLabel(key), weeks: [] };
      months.push(month);
      week = new Array<null>(mondayIndex(date)).fill(null);
    }
    week.push({ date, state: cellState(date) });
    if (week.length === 7) flushWeek();
  }
  flushWeek();

  return months;
}
