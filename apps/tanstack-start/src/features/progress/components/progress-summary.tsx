import { dayjs } from "~/lib/date";

export function ProgressSummary({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string | null;
}) {
  const daysCount = dayjs().diff(startDate, "day") + 1;

  return (
    <div>
      <h2 className="text-lg font-semibold">Daily Activity</h2>
      <p className="text-muted-foreground text-sm">
        {dayjs(startDate).format("MMMM D, YYYY")} to {endDate ?? "today "}(
        {daysCount} {daysCount > 1 ? "days" : "day"})
      </p>
    </div>
  );
}
