import { SnapCharts } from "~/features/snap";
import { useSnaps } from "../-hooks/use-snaps";

export function ChartView(props: {
  journeyId: string;
  startDate: string;
  endDate: string | null;
}) {
  const { journeyId, startDate, endDate } = props;
  const { data: snaps = [] } = useSnaps(journeyId);

  return <SnapCharts snaps={snaps} startDate={startDate} endDate={endDate} />;
}
