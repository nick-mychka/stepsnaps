import { useMemo, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
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

import { useTRPC } from "~/lib/trpc";

export const Route = createFileRoute(
  "/_authenticated/teams/$teamId/member/$userId",
)({
  loader: ({ context, params }) => {
    const { trpc, queryClient } = context;
    void queryClient.prefetchQuery(
      trpc.team.memberProgress.queryOptions({
        teamId: params.teamId,
        userId: params.userId,
      }),
    );
  },
  component: MemberProgressPage,
});

type ViewMode = "timeline" | "chart";

function MemberProgressPage() {
  const { teamId, userId } = Route.useParams();
  const trpc = useTRPC();
  const navigate = useNavigate();
  const [view, setView] = useState<ViewMode>("timeline");

  const { data } = useSuspenseQuery(
    trpc.team.memberProgress.queryOptions({ teamId, userId }),
  );

  return (
    <main className="container mx-auto py-8">
      <Button
        variant="ghost"
        size="sm"
        className="mb-4"
        onClick={() => navigate({ to: "/teams/$teamId", params: { teamId } })}
      >
        &larr; Back to Team
      </Button>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">{data.memberName}'s Progress</h1>
        {data.journey && (
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
        )}
      </div>

      {!data.journey ? (
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle>No Active Journey</CardTitle>
            <CardDescription>
              {data.memberName} doesn't have an active journey right now.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : view === "timeline" ? (
        <ReadOnlyTimeline snaps={data.snaps} />
      ) : (
        <ReadOnlyChart
          snaps={data.snaps}
          startDate={data.journey.startDate}
          endDate={data.journey.endDate}
        />
      )}
    </main>
  );
}

interface SnapData {
  id: string;
  date: string;
  values: {
    id: string;
    stepDefinitionId: string;
    numericValue: string | null;
    textValue: string | null;
    stepDefinition: {
      id: string;
      name: string;
      type: "numeric" | "text";
      sortOrder: number;
    };
  }[];
}

function ReadOnlyTimeline(props: { snaps: SnapData[] }) {
  const sortedSnaps = [...props.snaps].reverse();

  if (sortedSnaps.length === 0) {
    return (
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>No snaps yet</CardTitle>
          <CardDescription>
            No daily snaps have been logged yet.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      {sortedSnaps.map((snap) => {
        const dateObj = new Date(snap.date + "T00:00:00");
        const formatted = dateObj.toLocaleDateString("en-US", {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
        });

        const sortedValues = [...snap.values].sort(
          (a, b) => a.stepDefinition.sortOrder - b.stepDefinition.sortOrder,
        );

        const hasValues = sortedValues.some(
          (v) => v.numericValue !== null || v.textValue !== null,
        );

        return (
          <Card key={snap.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{formatted}</CardTitle>
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
      })}
    </div>
  );
}

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function ReadOnlyChart(props: {
  snaps: SnapData[];
  startDate: string;
  endDate: string | null;
}) {
  const { snaps, startDate, endDate } = props;

  const { chartData, chartConfig, stepKeys } = useMemo(() => {
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

    const sortedSteps = [...stepDefs.entries()].sort(
      (a, b) => a[1].sortOrder - b[1].sortOrder,
    );

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

    const snapByDate = new Map<string, (typeof snaps)[number]>();
    for (const snap of snaps) {
      snapByDate.set(snap.date, snap);
    }

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
            entry[key] = sv?.textValue ? 1 : 0;
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
          <CardDescription>No snaps to chart.</CardDescription>
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
        <ChartContainer config={chartConfig} className="min-h-75 w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
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
