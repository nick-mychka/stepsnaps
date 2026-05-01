import { useMemo } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

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
  ChartTooltip,
  ChartTooltipContent,
} from "@stepsnaps/ui/chart";

import type { SnapByDate } from "../types";
import { dayjs, ISO_DATE_FORMAT } from "~/lib/date";

export function SnapCharts({
  snaps,
  startDate,
  endDate,
}: {
  snaps: SnapByDate[];
  startDate: string;
  endDate: string | null;
}) {
  // Build chart data: one entry per day from startDate to endDate (or today)
  const { chartData, chartConfig, stepKeys } = useMemo(() => {
    // Collect all unique step definitions across all snaps
    const stepDefs = new Map<
      string,
      { name: string; type: "numeric" | "text"; sortOrder: number }
    >();
    snaps.forEach((snap) => {
      snap.values.forEach((sv) => {
        if (!stepDefs.has(sv.stepDefinitionId)) {
          stepDefs.set(sv.stepDefinitionId, {
            name: sv.stepDefinition.name,
            type: sv.stepDefinition.type,
            sortOrder: sv.stepDefinition.sortOrder,
          });
        }
      });
    });

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
        color: "var(--chart-1)",
      };
      keys.push({ id, key: safeKey, type: def.type });
    });

    // Build snap lookup by date
    const snapByDate = new Map<string, (typeof snaps)[number]>();
    for (const snap of snaps) {
      snapByDate.set(snap.date, snap);
    }

    // Generate days from startDate to endDate/today
    const start = startDate;
    const end = endDate ?? dayjs().format(ISO_DATE_FORMAT);

    const data: Record<string, unknown>[] = [];
    let current = start;
    while (dayjs(current).isSameOrBefore(end)) {
      const entry: Record<string, unknown> = {
        date: current,
        label: dayjs(current).format("MMM DD"),
      };

      const snap = snapByDate.get(current);
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
      current = dayjs(current).add(1, "day").format(ISO_DATE_FORMAT);
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
      <div>
        <h2 className="text-lg font-semibold">Daily Activity</h2>
        <p className="text-muted-foreground text-sm">
          {startDate} to {endDate ?? "today"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {stepKeys.map(({ key }) => (
          <Card key={key}>
            <CardHeader>
              <CardTitle>{chartConfig[key]?.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="min-h-40 w-full">
                <LineChart data={chartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis tickLine={false} axisLine={false} width={30} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line dataKey={key} stroke="var(--chart-1)" strokeWidth={2} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
