import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import type { ChartConfig } from "@stepsnaps/ui/chart";
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

import { useSnaps } from "../-hooks/use-snaps";
import { ApplicationTrendChart } from "./application-trend-chart";

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function ChartView(props: {
  journeyId: string;
  startDate: string;
  endDate: string | null;
}) {
  const { journeyId, startDate, endDate } = props;
  const { data: snaps = [] } = useSnaps(journeyId);

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
    <div className="flex flex-col gap-6">
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

      <ApplicationTrendChart
        chartData={chartData}
        chartConfig={chartConfig}
        stepKeys={stepKeys}
        startDate={startDate}
        endDate={endDate}
      />
    </div>
  );
}
