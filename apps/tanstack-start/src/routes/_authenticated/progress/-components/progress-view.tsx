import { Camera } from "lucide-react";

import type { RouterOutputs } from "@stepsnaps/api";

import type { ViewMode } from "~/features/progress";
import { SimpleEmpty } from "~/components/simple-empty";
import { ProgressCharts } from "~/features/progress";
import { useSnaps } from "../-hooks/use-snaps";
import { TimelineView } from "./timeline-view";

interface ProgressViewProps {
  activeJourney: RouterOutputs["journey"]["list"][number];
  view: ViewMode;
}

export function ProgressView({ activeJourney, view }: ProgressViewProps) {
  const { data: snaps = [] } = useSnaps(activeJourney.id);

  if (snaps.length === 0) {
    return (
      <SimpleEmpty
        icon={<Camera />}
        title="No snaps yet"
        description="Start logging daily snaps to see your progress here."
      />
    );
  }

  if (view === "timeline") {
    return <TimelineView snaps={snaps} journeyId={activeJourney.id} />;
  }

  return (
    <ProgressCharts
      snaps={snaps}
      startDate={activeJourney.startDate}
      endDate={activeJourney.endDate}
    />
  );
}
