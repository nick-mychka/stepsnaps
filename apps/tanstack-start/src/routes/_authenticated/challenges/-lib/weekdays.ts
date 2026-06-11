/** Weekday indices follow the JS Date convention: 0 = Sunday … 6 = Saturday. */
export const WEEKDAYS = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 0, label: "Sun" },
] as const;

export const EVERYDAY = WEEKDAYS.map((d) => d.value);

export function formatSchedule(scheduledDays: number[]): string {
  if (scheduledDays.length === 7) return "Every day";
  return WEEKDAYS.filter((d) => scheduledDays.includes(d.value))
    .map((d) => d.label)
    .join(", ");
}
