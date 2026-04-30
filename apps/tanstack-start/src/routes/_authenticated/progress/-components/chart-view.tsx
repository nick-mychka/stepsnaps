import { SnapCharts } from "~/features/snap";
import { useSnaps } from "../-hooks/use-snaps";

export function ChartView({
  journeyId,
  startDate,
  endDate,
}: {
  journeyId: string;
  startDate: string;
  endDate: string | null;
}) {
  const { data: snaps = [] } = useSnaps(journeyId);

  return <SnapCharts snaps={snaps} startDate={startDate} endDate={endDate} />;
}
