import { Button } from "@stepsnaps/ui/button";

import type { ViewMode } from "~/features/snap/types";

interface ViewToggleProps {
  view: ViewMode;
  onChange: (view: ViewMode) => void;
}

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="flex gap-1 rounded-lg border p-1">
      <Button
        variant={view === "timeline" ? "default" : "ghost"}
        size="sm"
        onClick={() => onChange("timeline")}
      >
        Timeline
      </Button>
      <Button
        variant={view === "chart" ? "default" : "ghost"}
        size="sm"
        onClick={() => onChange("chart")}
      >
        Chart
      </Button>
    </div>
  );
}
