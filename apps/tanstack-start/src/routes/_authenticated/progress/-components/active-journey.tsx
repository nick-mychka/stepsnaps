import { useState } from "react";

import type { RouterOutputs } from "@stepsnaps/api";

import type { ViewMode } from "~/features/progress";
import { ViewToggle } from "~/features/progress";
import { ProgressView } from "./progress-view";

export function ActiveJourney({
  activeJourney,
}: {
  activeJourney: RouterOutputs["journey"]["list"][number];
}) {
  const [view, setView] = useState<ViewMode>("timeline");

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Progress</h1>
        <ViewToggle view={view} onChange={setView} />
      </div>
      <ProgressView activeJourney={activeJourney} view={view} />
    </>
  );
}
