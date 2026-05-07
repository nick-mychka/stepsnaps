import { useMemo } from "react";

import type { Granularity, SnapByDate } from "../types";
import { dayjs } from "~/lib/date";

export interface GroupedSnapItem {
  snap: SnapByDate;
  label?: string;
}

function groupSnapsByWeek(snaps: SnapByDate[]): GroupedSnapItem[] {
  const weekMap = new Map<string, SnapByDate[]>();
  for (const snap of snaps) {
    const key = dayjs(snap.date).startOf("week").format("YYYY-MM-DD");
    const group = weekMap.get(key) ?? [];
    group.push(snap);
    weekMap.set(key, group);
  }

  return Array.from(weekMap.entries()).map(([weekStart, weekSnaps]) => {
    const valueAgg = new Map<string, SnapByDate["values"][number]>();
    let journeyId = "";
    let firstCreatedAt: Date | undefined;
    let lastUpdatedAt: Date | null = null;

    for (const snap of weekSnaps) {
      firstCreatedAt ??= snap.createdAt;
      lastUpdatedAt = snap.updatedAt;
      journeyId ||= snap.journeyId;

      for (const value of snap.values) {
        const existing = valueAgg.get(value.stepDefinitionId);
        if (!existing) {
          valueAgg.set(value.stepDefinitionId, { ...value });
        } else if (
          value.stepDefinition.type === "numeric" &&
          value.numericValue !== null
        ) {
          const sum =
            parseFloat(existing.numericValue ?? "0") +
            parseFloat(value.numericValue);
          valueAgg.set(value.stepDefinitionId, {
            ...existing,
            numericValue: String(sum),
          });
        } else if (
          value.stepDefinition.type === "text" &&
          value.textValue !== null
        ) {
          valueAgg.set(value.stepDefinitionId, {
            ...existing,
            textValue: value.textValue,
          });
        }
      }
    }

    const weekEnd = dayjs(weekStart).add(6, "day");
    const label = `${dayjs(weekStart).format("MMM D")} – ${weekEnd.format("MMM D, YYYY")}`;

    return {
      label,
      snap: {
        id: weekStart,
        journeyId,
        date: weekStart,
        createdAt: firstCreatedAt ?? new Date(weekStart),
        updatedAt: lastUpdatedAt,
        values: Array.from(valueAgg.values()),
      } as SnapByDate,
    };
  });
}

export function useGroupedSnaps(
  snaps: SnapByDate[],
  granularity: Granularity,
): GroupedSnapItem[] {
  return useMemo(() => {
    if (granularity === "weekly") {
      return groupSnapsByWeek(snaps).toReversed();
    }
    return snaps.toReversed().map((snap) => ({ snap }));
  }, [snaps, granularity]);
}
