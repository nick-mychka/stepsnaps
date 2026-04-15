import type { ChartConfig } from "@stepsnaps/ui/chart";

interface FunnelTooltipPayloadItem {
  dataKey: string;
  value: number;
  color: string;
}

interface FunnelTooltipProps {
  active?: boolean;
  payload?: FunnelTooltipPayloadItem[];
  label?: string;
  config: ChartConfig;
}

export function FunnelTooltip({
  active,
  payload,
  label,
  config,
}: FunnelTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-background border-border rounded-lg border px-3 py-2 shadow-md">
      <p className="text-foreground mb-2 text-sm font-semibold">{label}</p>
      <div className="flex flex-col gap-1">
        {payload.map((item) => {
          const rawLabel = config[item.dataKey]?.label;
          const labelText =
            typeof rawLabel === "string" ? rawLabel : item.dataKey;
          return (
            <div key={item.dataKey} className="flex items-center gap-3">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-muted-foreground min-w-32.5 text-xs">
                {labelText}
              </span>
              <span className="text-foreground ml-auto text-xs font-medium tabular-nums">
                {item.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
