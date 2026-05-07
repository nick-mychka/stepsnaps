import { Button } from "@stepsnaps/ui/button";

import type { Granularity } from "../types";

interface GranularityToggleProps {
  granularity: Granularity;
  onChange: (granularity: Granularity) => void;
}

export function GranularityToggle({
  granularity,
  onChange,
}: GranularityToggleProps) {
  return (
    <div className="flex gap-1 rounded-lg border p-1">
      <Button
        variant={granularity === "daily" ? "default" : "ghost"}
        size="sm"
        onClick={() => onChange("daily")}
      >
        Daily
      </Button>
      <Button
        variant={granularity === "weekly" ? "default" : "ghost"}
        size="sm"
        onClick={() => onChange("weekly")}
      >
        Weekly
      </Button>
    </div>
  );
}
