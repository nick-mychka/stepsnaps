import { useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import { Button } from "@stepsnaps/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@stepsnaps/ui/card";
import { Input } from "@stepsnaps/ui/input";
import { Label } from "@stepsnaps/ui/label";
import { Progress } from "@stepsnaps/ui/progress";
import { Spinner } from "@stepsnaps/ui/spinner";
import { Textarea } from "@stepsnaps/ui/textarea";
import { toast } from "@stepsnaps/ui/toast";

import { today } from "~/lib/date";
import { useTRPC } from "~/lib/trpc";

export const Route = createFileRoute("/_authenticated/snap/new")({
  loader: ({ context }) => {
    const { trpc, queryClient } = context;
    void queryClient.prefetchQuery(trpc.journey.active.queryOptions());
    void queryClient.prefetchQuery(trpc.stepDefinition.active.queryOptions());
  },
  component: SnapFormPage,
});

function SnapFormPage() {
  const trpc = useTRPC();
  const { data: activeJourney } = useSuspenseQuery(
    trpc.journey.active.queryOptions(),
  );

  if (!activeJourney) {
    return (
      <main className="container mx-auto py-8">
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle>No Active Journey</CardTitle>
            <CardDescription>
              Start a journey from the dashboard to begin logging snaps.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return <SnapForm journeyId={activeJourney.id} />;
}

function SnapForm({ journeyId }: { journeyId: string }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: stepDefinitions = [] } = useSuspenseQuery(
    trpc.stepDefinition.active.queryOptions(),
  );

  const { data: existingSnap, isLoading: isLoadingSnap } = useQuery(
    trpc.snap.byDate.queryOptions({ journeyId, date: today() }),
  );

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

  const upsertSnap = useMutation(
    trpc.snap.upsert.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.snap.pathFilter());
        toast.success(existingSnap ? "Snap updated!" : "Snap created!");
        void navigate({ to: "/dashboard" });
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }),
  );

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
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>
            {existingSnap ? "Edit Today's Snap" : "New Snap"}
          </CardTitle>
          <CardDescription>
            {today()} — Record what you accomplished today.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stepDefinitions.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No step definitions configured. Start a journey to get predefined
              steps.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {stepDefinitions.map((sd) => {
                // Use snapshotted goal from existing snap, or current step def goal for new snaps
                const snapGoal = existingSnap?.values.find(
                  (sv) => sv.stepDefinitionId === sd.id,
                )?.goalValue;
                const goalStr = snapGoal ?? sd.goalValue;
                const goal =
                  sd.type === "numeric" && goalStr ? Number(goalStr) : null;
                const numericVal = Number(values[sd.id] ?? 0) || 0;

                return (
                  <div key={sd.id} className="flex flex-col gap-1.5">
                    <Label htmlFor={sd.id}>{sd.name}</Label>
                    {sd.type === "numeric" ? (
                      <>
                        <Input
                          id={sd.id}
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
                        {goal !== null && goal > 0 && (
                          <div className="flex items-center gap-3">
                            <Progress
                              value={Math.min((numericVal / goal) * 100, 100)}
                              className="flex-1"
                            />
                            <span className="text-muted-foreground shrink-0 text-xs">
                              {numericVal} of {goal}
                            </span>
                          </div>
                        )}
                      </>
                    ) : (
                      <Textarea
                        id={sd.id}
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
                );
              })}

              <Button type="submit" disabled={upsertSnap.isPending}>
                {upsertSnap.isPending && <Spinner />}
                {existingSnap ? "Update Snap" : "Save Snap"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
