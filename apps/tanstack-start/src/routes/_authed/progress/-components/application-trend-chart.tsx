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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
} from "@stepsnaps/ui/chart";

import { FunnelTooltip } from "./funnel-tooltip";

// ── Names that belong to the outreach funnel ─────────────────────────────────
const FUNNEL_LABELS = ["Interviews", "Recruiter Replies", "Applications Sent"];

const FUNNEL_COLORS: Record<string, string> = {
  Interviews: "#93c5fd", // blue-300 — найсвітліший
  "Recruiter Replies": "#3b82f6", // blue-500 — середній
  "Applications Sent": "#1d4ed8", // blue-700 — найтемніший
};

export function ApplicationTrendChart(props: {
  chartData: Record<string, unknown>[];
  chartConfig: ChartConfig;
  stepKeys: { id: string; key: string; type: "numeric" | "text" }[];
  startDate: string;
  endDate: string | null;
}) {
  const { chartData, chartConfig, stepKeys, startDate, endDate } = props;

  // Filter only funnel step keys
  const funnelKeys = stepKeys.filter(({ key }) => {
    const lbl = chartConfig[key]?.label;
    return typeof lbl === "string" && FUNNEL_LABELS.includes(lbl);
  });

  if (funnelKeys.length === 0) return null;

  const funnelConfig: ChartConfig = {};
  for (const { key } of funnelKeys) {
    const rawLabel = chartConfig[key]?.label;
    const label = typeof rawLabel === "string" ? rawLabel : key;
    funnelConfig[key] = {
      label,
      color:
        FUNNEL_COLORS[label] ?? chartConfig[key]?.color ?? "var(--chart-1)",
    };
  }

  // Compute integer ticks 0..max so Y-axis steps by 1
  const maxVal = Math.max(
    0,
    ...chartData.flatMap((row) =>
      funnelKeys.map(({ key }) => Number(row[key] ?? 0)),
    ),
  );
  const yTicks = Array.from({ length: maxVal + 1 }, (_, i) => i);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Activity</CardTitle>
        <CardDescription>
          {startDate} to {endDate ?? "today"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={funnelConfig} className="min-h-75 w-full">
          <LineChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              ticks={yTicks}
            />
            <ChartTooltip content={<FunnelTooltip config={funnelConfig} />} />
            <ChartLegend content={<ChartLegendContent />} />
            {funnelKeys.map(({ key }) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={`var(--color-${key})`}
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 0, fill: `var(--color-${key})` }}
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
            ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
