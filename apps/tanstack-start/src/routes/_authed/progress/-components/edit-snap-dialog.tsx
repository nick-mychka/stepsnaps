import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@stepsnaps/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@stepsnaps/ui/dialog";
import { Input } from "@stepsnaps/ui/input";
import { Label } from "@stepsnaps/ui/label";
import { Textarea } from "@stepsnaps/ui/textarea";

import type { SnapWithValues } from "../-types";
import { useTRPC } from "~/lib/trpc";
import { useUpsertSnap } from "../-hooks/use-upsert-snap";

export function EditSnapDialog(props: {
  journeyId: string;
  snap: SnapWithValues;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { journeyId, snap } = props;
  const trpc = useTRPC();

  // Load all step definitions (including ones that may not be in this snap)
  const { data: stepDefinitions = [] } = useQuery(
    trpc.stepDefinition.active.queryOptions(),
  );

  // Initialize form values from snap
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const sv of snap.values) {
      if (sv.stepDefinition.type === "numeric") {
        initial[sv.stepDefinitionId] = sv.numericValue ?? "";
      } else {
        initial[sv.stepDefinitionId] = sv.textValue ?? "";
      }
    }
    return initial;
  });

  const upsertSnap = useUpsertSnap({
    onSuccess: () => props.onOpenChange(false),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Use step definitions from snap values for historical steps,
    // merged with current active definitions
    const allStepIds = new Set<string>();
    const stepMap = new Map<
      string,
      { id: string; type: "numeric" | "text"; name: string }
    >();

    // Add steps from snap values (may include inactive ones)
    for (const sv of snap.values) {
      allStepIds.add(sv.stepDefinitionId);
      stepMap.set(sv.stepDefinitionId, {
        id: sv.stepDefinition.id,
        type: sv.stepDefinition.type,
        name: sv.stepDefinition.name,
      });
    }

    // Add current active definitions
    for (const sd of stepDefinitions) {
      allStepIds.add(sd.id);
      stepMap.set(sd.id, { id: sd.id, type: sd.type, name: sd.name });
    }

    const snapValues = Array.from(allStepIds)
      .map((stepId) => {
        const step = stepMap.get(stepId);
        if (!step) return null;
        const raw = values[stepId] ?? "";
        if (step.type === "numeric") {
          return {
            stepDefinitionId: stepId,
            numericValue: raw.trim() || null,
            textValue: null,
          };
        }
        return {
          stepDefinitionId: stepId,
          numericValue: null,
          textValue: raw.trim() || null,
        };
      })
      .filter(Boolean) as {
      stepDefinitionId: string;
      numericValue: string | null;
      textValue: string | null;
    }[];

    upsertSnap.mutate({
      journeyId,
      date: snap.date,
      values: snapValues,
    });
  };

  // Merge: show snap's existing step defs + current active ones
  const displaySteps: {
    id: string;
    name: string;
    type: "numeric" | "text";
    sortOrder: number;
  }[] = [];
  const seen = new Set<string>();

  // Active definitions first (they have correct sort order)
  for (const sd of stepDefinitions) {
    seen.add(sd.id);
    displaySteps.push({
      id: sd.id,
      name: sd.name,
      type: sd.type,
      sortOrder: sd.sortOrder,
    });
  }

  // Then any historical steps from this snap that are no longer active
  for (const sv of snap.values) {
    if (!seen.has(sv.stepDefinitionId)) {
      displaySteps.push({
        id: sv.stepDefinition.id,
        name: sv.stepDefinition.name,
        type: sv.stepDefinition.type,
        sortOrder: sv.stepDefinition.sortOrder,
      });
    }
  }

  displaySteps.sort((a, b) => a.sortOrder - b.sortOrder);

  const dateFormatted = new Date(snap.date + "T00:00:00").toLocaleDateString(
    "en-US",
    {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  );

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Snap</DialogTitle>
          <DialogDescription>{dateFormatted}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {displaySteps.map((sd) => (
            <div key={sd.id} className="flex flex-col gap-1.5">
              <Label htmlFor={`edit-${sd.id}`}>{sd.name}</Label>
              {sd.type === "numeric" ? (
                <Input
                  id={`edit-${sd.id}`}
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0"
                  value={values[sd.id] ?? ""}
                  onChange={(e) =>
                    setValues((prev) => ({
                      ...prev,
                      [sd.id]: e.target.value,
                    }))
                  }
                />
              ) : (
                <Textarea
                  id={`edit-${sd.id}`}
                  placeholder="What did you learn?"
                  value={values[sd.id] ?? ""}
                  onChange={(e) =>
                    setValues((prev) => ({
                      ...prev,
                      [sd.id]: e.target.value,
                    }))
                  }
                />
              )}
            </div>
          ))}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => props.onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={upsertSnap.isPending}>
              {upsertSnap.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
