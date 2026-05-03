import { useNavigate } from "@tanstack/react-router";

import { Button } from "@stepsnaps/ui/button";
import { Spinner } from "@stepsnaps/ui/spinner";

import { SimpleCard } from "~/components/simple-card";
import { dayjs, today, yesterday } from "~/lib/date";
import { useActiveStepDefinitions } from "../-hooks/use-active-step-definitions";
import { useExistingSnap } from "../-hooks/use-existing-snap";
import { useSnapFormValues } from "../-hooks/use-snap-form-values";
import { useUpsertSnap } from "../-hooks/use-upsert-snap";
import { SnapFormField } from "./snap-form-field";

export function SnapForm({
  journeyId,
  date,
}: {
  journeyId: string;
  date?: string;
}) {
  const navigate = useNavigate();
  const targetDate = date ?? today();

  const { data: stepDefinitions = [] } = useActiveStepDefinitions();

  const { data: existingSnap, isLoading: isLoadingSnap } = useExistingSnap(
    journeyId,
    targetDate,
  );

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
      date: targetDate,
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

  const isToday = targetDate === today();
  const isYesterday = targetDate === yesterday();
  const title = isToday
    ? existingSnap
      ? "Edit Today's Snap"
      : "New Snap"
    : isYesterday
      ? existingSnap
        ? "Edit Yesterday's Snap"
        : "Snap for Yesterday"
      : existingSnap
        ? "Edit Snap"
        : "New Snap";
  const formattedDate = dayjs(targetDate).format("MMMM D, YYYY");
  const descriptionSuffix = isToday
    ? "Record what you accomplished today."
    : isYesterday
      ? "Record what you accomplished yesterday."
      : "Record what you accomplished on this day.";

  return (
    <main className="container mx-auto py-8">
      <SimpleCard
        className="max-w-lg"
        title={title}
        description={
          <>
            {formattedDate} — {descriptionSuffix}
          </>
        }
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
