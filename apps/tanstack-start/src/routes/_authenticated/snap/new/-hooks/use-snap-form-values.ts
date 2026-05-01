import { useState } from "react";

interface ExistingSnap {
  values: {
    stepDefinition: { type: "numeric" | "text" };
    stepDefinitionId: string;
    numericValue: string | null;
    textValue: string | null;
  }[];
}

export function useSnapFormValues(
  existingSnap: ExistingSnap | null | undefined,
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
