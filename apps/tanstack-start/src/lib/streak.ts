import { dayjs, ISO_DATE_FORMAT } from "./date";

export function computeStreak(snapDates: readonly string[]): number {
  const dateSet = new Set(snapDates);
  const today = dayjs().format(ISO_DATE_FORMAT);

  let cursor = dateSet.has(today) ? dayjs() : dayjs().subtract(1, "day");

  let streak = 0;
  while (dateSet.has(cursor.format(ISO_DATE_FORMAT))) {
    streak += 1;
    cursor = cursor.subtract(1, "day");
  }
  return streak;
}
