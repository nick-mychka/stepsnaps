export function ProgressSummary({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string | null;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold">Daily Activity</h2>
      <p className="text-muted-foreground text-sm">
        {startDate} to {endDate ?? "today"}
      </p>
    </div>
  );
}
