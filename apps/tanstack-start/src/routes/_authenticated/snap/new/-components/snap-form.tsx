import { useNavigate } from "@tanstack/react-router";

import { Button } from "@stepsnaps/ui/button";
import { Spinner } from "@stepsnaps/ui/spinner";

import { SimpleCard } from "~/components/simple-card";
import { today } from "~/lib/date";
import { useActiveStepDefinitions } from "../-hooks/use-active-step-definitions";
import { useExistingSnap } from "../-hooks/use-existing-snap";
import { useSnapFormValues } from "../-hooks/use-snap-form-values";
import { useUpsertSnap } from "../-hooks/use-upsert-snap";
import { SnapFormField } from "./snap-form-field";

export function SnapForm({ journeyId }: { journeyId: string }) {
  const navigate = useNavigate();

  const { data: stepDefinitions = [] } = useActiveStepDefinitions();

  const { data: existingSnap, isLoading: isLoadingSnap } =
    useExistingSnap(journeyId);

  const { values, setValues, initialized } = useSnapFormValues(
    existingSnap,
    isLoadingSnap,
  );

  const upsertSnap = useUpsertSnap({
    wasUpdate: !!existingSnap,
    onSuccess: () => void navigate({ to: "/dashboard" }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const snapValues = stepDefinitions.map((sd) => {
      const raw = values[sd.id] ?? "";
      if (sd.type === "numeric") {
        return {
          stepDefinitionId: sd.id,
          numericValue: raw.trim() || null,
          textValue: null,
        };
      }
      return {
        stepDefinitionId: sd.id,
        numericValue: null,
        textValue: raw.trim() || null,
      };
    });

    upsertSnap.mutate({
      journeyId,
      date: today(),
      values: snapValues,
    });
  };

  if (!initialized) {
    return (
      <main className="container mx-auto py-8">
        <p className="text-muted-foreground">Loading...</p>
      </main>
    );
  }

  return (
    <main className="container mx-auto py-8">
      <SimpleCard
        className="max-w-lg"
        title={existingSnap ? "Edit Today's Snap" : "New Snap"}
        description={<>{today()} — Record what you accomplished today.</>}
      >
        {stepDefinitions.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No step definitions configured. Start a journey to get predefined
            steps.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {stepDefinitions.map((sd) => {
              const snapGoalValue = existingSnap?.values.find(
                (sv) => sv.stepDefinitionId === sd.id,
              )?.goalValue;

              return (
                <SnapFormField
                  key={sd.id}
                  stepDefinition={sd}
                  value={values[sd.id] ?? ""}
                  snapGoalValue={snapGoalValue}
                  onChange={(next) =>
                    setValues((prev) => ({ ...prev, [sd.id]: next }))
                  }
                />
              );
            })}

            <Button type="submit" disabled={upsertSnap.isPending}>
              {upsertSnap.isPending && <Spinner />}
              {existingSnap ? "Update Snap" : "Save Snap"}
            </Button>
          </form>
        )}
      </SimpleCard>
    </main>
  );
}
