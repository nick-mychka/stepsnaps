import { useMemo, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import type { ChartConfig } from "@stepsnaps/ui/chart";
import { Button } from "@stepsnaps/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@stepsnaps/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@stepsnaps/ui/chart";
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
import { toast } from "@stepsnaps/ui/toast";

import { useTRPC } from "~/lib/trpc";

export const Route = createFileRoute("/_authed/progress")({
  loader: ({ context }) => {
    const { trpc, queryClient } = context;
    void queryClient.prefetchQuery(trpc.journey.active.queryOptions());
  },
  component: ProgressPage,
});

type ViewMode = "timeline" | "chart";

function ProgressPage() {
  const trpc = useTRPC();
  const { data: activeJourney } = useSuspenseQuery(
    trpc.journey.active.queryOptions(),
  );
  const navigate = useNavigate();
  const [view, setView] = useState<ViewMode>("timeline");

  if (!activeJourney) {
    return (
      <main className="container mx-auto py-8">
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle>No Active Journey</CardTitle>
            <CardDescription>
              Start a journey from the dashboard to view your progress.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate({ to: "/dashboard" })}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Progress</h1>
        <div className="flex gap-1 rounded-lg border p-1">
          <Button
            variant={view === "timeline" ? "default" : "ghost"}
            size="sm"
            onClick={() => setView("timeline")}
          >
            Timeline
          </Button>
          <Button
            variant={view === "chart" ? "default" : "ghost"}
            size="sm"
            onClick={() => setView("chart")}
          >
            Chart
          </Button>
        </div>
      </div>

      {view === "timeline" ? (
        <TimelineView journeyId={activeJourney.id} />
      ) : (
        <ChartView
          journeyId={activeJourney.id}
          startDate={activeJourney.startDate}
          endDate={activeJourney.endDate}
        />
      )}
    </main>
  );
}

interface SnapWithValues {
  id: string;
  journeyId: string;
  date: string;
  createdAt: Date;
  updatedAt: Date | null;
  values: {
    id: string;
    snapId: string;
    stepDefinitionId: string;
    numericValue: string | null;
    textValue: string | null;
    stepDefinition: {
      id: string;
      name: string;
      type: "numeric" | "text";
      isPredefined: boolean;
      sortOrder: number;
      isActive: boolean;
    };
  }[];
}

function TimelineView(props: { journeyId: string }) {
  const { journeyId } = props;
  const trpc = useTRPC();

  const { data: snaps = [] } = useSuspenseQuery(
    trpc.snap.list.queryOptions({ journeyId }),
  );

  // Reverse for most-recent-first display
  const sortedSnaps = [...snaps].reverse();

  const [editingSnap, setEditingSnap] = useState<SnapWithValues | null>(null);
  const [deletingSnapId, setDeletingSnapId] = useState<string | null>(null);

  return (
    <>
      {sortedSnaps.length === 0 ? (
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle>No snaps yet</CardTitle>
            <CardDescription>
              Start logging daily snaps to see your progress here.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="flex max-w-2xl flex-col gap-4">
          {sortedSnaps.map((snap) => (
            <SnapCard
              key={snap.id}
              snap={snap}
              onEdit={() => setEditingSnap(snap)}
              onDelete={() => setDeletingSnapId(snap.id)}
            />
          ))}
        </div>
      )}

      {editingSnap && (
        <EditSnapDialog
          journeyId={journeyId}
          snap={editingSnap}
          open={true}
          onOpenChange={(open) => {
            if (!open) setEditingSnap(null);
          }}
        />
      )}

      {deletingSnapId && (
        <DeleteSnapDialog
          snapId={deletingSnapId}
          open={true}
          onOpenChange={(open) => {
            if (!open) setDeletingSnapId(null);
          }}
        />
      )}
    </>
  );
}

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function ChartView(props: {
  journeyId: string;
  startDate: string;
  endDate: string | null;
}) {
  const { journeyId, startDate, endDate } = props;
  const trpc = useTRPC();

  const { data: snaps = [] } = useSuspenseQuery(
    trpc.snap.list.queryOptions({ journeyId }),
  );

  // Build chart data: one entry per day from startDate to endDate (or today)
  const { chartData, chartConfig, stepKeys } = useMemo(() => {
    // Collect all unique step definitions across all snaps
    const stepDefs = new Map<
      string,
      { name: string; type: "numeric" | "text"; sortOrder: number }
    >();
    for (const snap of snaps) {
      for (const sv of snap.values) {
        if (!stepDefs.has(sv.stepDefinitionId)) {
          stepDefs.set(sv.stepDefinitionId, {
            name: sv.stepDefinition.name,
            type: sv.stepDefinition.type,
            sortOrder: sv.stepDefinition.sortOrder,
          });
        }
      }
    }

    // Sort by sortOrder
    const sortedSteps = [...stepDefs.entries()].sort(
      (a, b) => a[1].sortOrder - b[1].sortOrder,
    );

    // Build config for ChartContainer
    const config: ChartConfig = {};
    const keys: { id: string; key: string; type: "numeric" | "text" }[] = [];
    sortedSteps.forEach(([id, def], idx) => {
      const safeKey = `step_${idx}`;
      config[safeKey] = {
        label: def.name,
        color: CHART_COLORS[idx % CHART_COLORS.length] ?? "var(--chart-1)",
      };
      keys.push({ id, key: safeKey, type: def.type });
    });

    // Build snap lookup by date
    const snapByDate = new Map<string, (typeof snaps)[number]>();
    for (const snap of snaps) {
      snapByDate.set(snap.date, snap);
    }

    // Generate days from startDate to endDate/today
    const start = new Date(startDate + "T00:00:00");
    const end = endDate
      ? new Date(endDate + "T00:00:00")
      : new Date(new Date().toISOString().slice(0, 10) + "T00:00:00");

    const data: Record<string, unknown>[] = [];
    const current = new Date(start);
    while (current <= end) {
      const dateStr = current.toISOString().slice(0, 10);
      const entry: Record<string, unknown> = {
        date: dateStr,
        label: current.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      };

      const snap = snapByDate.get(dateStr);
      for (const { id, key, type } of keys) {
        if (snap) {
          const sv = snap.values.find((v) => v.stepDefinitionId === id);
          if (type === "numeric") {
            entry[key] = sv?.numericValue ? Number(sv.numericValue) : 0;
          } else {
            // Text steps: 1 if present, 0 if absent
            entry[key] = sv?.textValue ? 1 : 0;
            // Store actual text for tooltip
            entry[`${key}_text`] = sv?.textValue ?? "";
          }
        } else {
          entry[key] = 0;
          if (type === "text") {
            entry[`${key}_text`] = "";
          }
        }
      }

      data.push(entry);
      current.setDate(current.getDate() + 1);
    }

    return { chartData: data, chartConfig: config, stepKeys: keys };
  }, [snaps, startDate, endDate]);

  if (stepKeys.length === 0) {
    return (
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>No data yet</CardTitle>
          <CardDescription>
            Log some snaps to see your chart here.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Activity</CardTitle>
        <CardDescription>
          {startDate} to {endDate ?? "today"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis tickLine={false} axisLine={false} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name, item) => {
                    const key = String(name);
                    const textKey = `${key}_text`;
                    const payload = item.payload as
                      | Record<string, unknown>
                      | undefined;
                    const textValue = payload?.[textKey];
                    if (typeof textValue === "string" && textValue) {
                      return (
                        <span>
                          {chartConfig[key]?.label}: {textValue}
                        </span>
                      );
                    }
                    return undefined;
                  }}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            {stepKeys.map(({ key }) => (
              <Bar
                key={key}
                dataKey={key}
                fill={`var(--color-${key})`}
                radius={2}
              />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function SnapCard(props: {
  snap: SnapWithValues;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { snap, onEdit, onDelete } = props;

  const dateObj = new Date(snap.date + "T00:00:00");
  const formatted = dateObj.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // Sort values by step definition sort order
  const sortedValues = [...snap.values].sort(
    (a, b) => a.stepDefinition.sortOrder - b.stepDefinition.sortOrder,
  );

  const hasValues = sortedValues.some(
    (v) => v.numericValue !== null || v.textValue !== null,
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{formatted}</CardTitle>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={onEdit}>
              Edit
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete}>
              Delete
            </Button>
          </div>
        </div>
      </CardHeader>
      {hasValues && (
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {sortedValues.map((sv) => {
              const value =
                sv.stepDefinition.type === "numeric"
                  ? sv.numericValue
                  : sv.textValue;
              if (value === null || value === "") return null;

              return (
                <div key={sv.id} className="flex justify-between gap-2">
                  <span className="text-muted-foreground">
                    {sv.stepDefinition.name}
                  </span>
                  <span className="font-medium">
                    {sv.stepDefinition.type === "numeric" ? (
                      value
                    ) : (
                      <span className="max-w-50 truncate" title={value}>
                        {value}
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function EditSnapDialog(props: {
  journeyId: string;
  snap: SnapWithValues;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { journeyId, snap } = props;
  const trpc = useTRPC();
  const queryClient = useQueryClient();

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

  const upsertSnap = useMutation(
    trpc.snap.upsert.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.snap.pathFilter());
        toast.success("Snap updated!");
        props.onOpenChange(false);
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }),
  );

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

function DeleteSnapDialog(props: {
  snapId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const deleteSnap = useMutation(
    trpc.snap.delete.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.snap.pathFilter());
        toast.success("Snap deleted");
        props.onOpenChange(false);
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }),
  );

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Snap</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this snap? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => props.onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => deleteSnap.mutate({ id: props.snapId })}
            disabled={deleteSnap.isPending}
          >
            {deleteSnap.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
