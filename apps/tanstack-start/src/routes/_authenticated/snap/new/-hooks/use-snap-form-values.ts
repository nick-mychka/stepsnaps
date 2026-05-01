import { useState } from "react";

import type { SnapByDate } from "~/features/snap";

export function useSnapFormValues(
  existingSnap: SnapByDate | null | undefined,
  isLoadingSnap: boolean,
) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [initialized, setInitialized] = useState(false);

  // Initialize form from existing snap once loaded
  if (!initialized && !isLoadingSnap) {
    const initial: Record<string, string> = {};
    if (existingSnap) {
      for (const sv of existingSnap.values) {
        if (sv.stepDefinition.type === "numeric") {
          initial[sv.stepDefinitionId] = sv.numericValue ?? "";
        } else {
          initial[sv.stepDefinitionId] = sv.textValue ?? "";
        }
      }
    }
    setValues(initial);
    setInitialized(true);
  }

  return { values, setValues, initialized };
}
