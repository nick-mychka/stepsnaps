import { useState } from "react";
import { ChartSpline } from "lucide-react";

import { Button } from "@stepsnaps/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@stepsnaps/ui/empty";

import type { SnapWithValues } from "~/features/snap";
import { SnapCard } from "~/features/snap";
import { dayjs } from "~/lib/date";
import { useSnaps } from "../-hooks/use-snaps";
import { DeleteSnapDialog } from "./delete-snap-dialog";
import { EditSnapDialog } from "./edit-snap-dialog";

type Granularity = "daily" | "weekly";

function groupSnapsByWeek(
  snaps: SnapWithValues[],
): { snap: SnapWithValues; label: string }[] {
  const weekMap = new Map<string, SnapWithValues[]>();
  for (const snap of snaps) {
    const key = dayjs(snap.date).startOf("week").format("YYYY-MM-DD");
    const group = weekMap.get(key) ?? [];
    group.push(snap);
    weekMap.set(key, group);
  }

  return Array.from(weekMap.entries()).map(([weekStart, weekSnaps]) => {
    const valueAgg = new Map<string, SnapWithValues["values"][number]>();
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
      } as SnapWithValues,
    };
  });
}

export function TimelineView(props: { journeyId: string }) {
  const { journeyId } = props;

  const { data: snaps = [] } = useSnaps(journeyId);

  const [granularity, setGranularity] = useState<Granularity>("daily");
  const [editingSnap, setEditingSnap] = useState<SnapWithValues | null>(null);
  const [deletingSnapId, setDeletingSnapId] = useState<string | null>(null);

  const dailySnaps = [...snaps].reverse();
  const weeklyItems = groupSnapsByWeek(snaps).reverse();

  const isEmpty =
    granularity === "daily"
      ? dailySnaps.length === 0
      : weeklyItems.length === 0;

  return (
    <>
      <div className="mb-4 flex w-fit gap-1 rounded-lg border p-1">
        <Button
          variant={granularity === "daily" ? "default" : "ghost"}
          size="sm"
          onClick={() => setGranularity("daily")}
        >
          Daily
        </Button>
        <Button
          variant={granularity === "weekly" ? "default" : "ghost"}
          size="sm"
          onClick={() => setGranularity("weekly")}
        >
          Weekly
        </Button>
      </div>

      {isEmpty ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ChartSpline />
            </EmptyMedia>
            <EmptyTitle>No snaps yet</EmptyTitle>
            <EmptyDescription>
              Start logging daily snaps to see your progress here.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : granularity === "daily" ? (
        <div className="flex max-w-2xl flex-col gap-4">
          {dailySnaps.map((snap) => (
            <SnapCard
              key={snap.id}
              snap={snap}
              onEdit={() => setEditingSnap(snap)}
              onDelete={() => setDeletingSnapId(snap.id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex max-w-2xl flex-col gap-4">
          {weeklyItems.map(({ snap, label }) => (
            <SnapCard key={snap.id} snap={snap} label={label} />
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
