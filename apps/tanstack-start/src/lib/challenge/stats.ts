/**
 * Pure streak and progress stats for a challenge. Same conventions as the
 * grid model: plain calendar-day math, effective "today" is always an input.
 */
import { shiftDate, weekdayOf } from "./date-utils";

export interface StatsInput {
  startDate: string;
  endDate: string | null;
  /** Weekday indices in JS Date convention: 0 = Sunday … 6 = Saturday. */
  scheduledDays: readonly number[];
  completedDates: readonly string[];
  /** The effective today (client-local). */
  today: string;
}

export interface ChallengeStats {
  /** Consecutive completed scheduled days, counting back from today. */
  streak: number;
  /** Scheduled days completed within the challenge period. */
  completedCount: number;
  /** Scheduled days from the start through today (capped at the end date). */
  elapsedScheduled: number;
  /** Scheduled days in the full start→end period; null when open-ended. */
  totalScheduled: number | null;
  /** completedCount / totalScheduled, rounded; null when open-ended. */
  percentComplete: number | null;
}

/**
 * The streak walks backward from the last reachable day (today, or the end
 * date for an ended challenge). Non-scheduled days are skipped, a missed
 * scheduled day breaks the count, and today itself being unchecked doesn't
 * break a streak that ran through the previous scheduled day.
 */
export function computeChallengeStats(input: StatsInput): ChallengeStats {
  const { startDate, endDate, scheduledDays, today } = input;
  const completed = new Set(input.completedDates);

  const isScheduled = (date: string) => scheduledDays.includes(weekdayOf(date));

  const countScheduled = (from: string, to: string) => {
    let count = 0;
    for (let date = from; date <= to; date = shiftDate(date, 1)) {
      if (isScheduled(date)) count += 1;
    }
    return count;
  };

  const lastReachable = endDate && endDate < today ? endDate : today;

  let streak = 0;
  if (lastReachable >= startDate) {
    let cursor = lastReachable;
    // An unchecked today is still pending, not a miss — skip it.
    if (cursor === today && isScheduled(cursor) && !completed.has(cursor)) {
      cursor = shiftDate(cursor, -1);
    }
    while (cursor >= startDate) {
      if (!isScheduled(cursor)) {
        cursor = shiftDate(cursor, -1);
      } else if (completed.has(cursor)) {
        streak += 1;
        cursor = shiftDate(cursor, -1);
      } else {
        break;
      }
    }
  }

  const completedCount = [...completed].filter(
    (date) =>
      date >= startDate && (!endDate || date <= endDate) && isScheduled(date),
  ).length;

  const elapsedScheduled =
    lastReachable >= startDate ? countScheduled(startDate, lastReachable) : 0;

  const totalScheduled = endDate ? countScheduled(startDate, endDate) : null;
  const percentComplete =
    totalScheduled === null
      ? null
      : totalScheduled === 0
        ? 0
        : Math.round((completedCount / totalScheduled) * 100);

  return {
    streak,
    completedCount,
    elapsedScheduled,
    totalScheduled,
    percentComplete,
  };
}
