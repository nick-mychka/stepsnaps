import { useState } from "react";
import { ChartSpline } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@stepsnaps/ui/empty";

import type { SnapWithValues } from "~/features/snap";
import { SnapCard } from "~/features/snap";
import { useSnaps } from "../-hooks/use-snaps";
import { DeleteSnapDialog } from "./delete-snap-dialog";
import { EditSnapDialog } from "./edit-snap-dialog";

export function TimelineView(props: { journeyId: string }) {
  const { journeyId } = props;

  const { data: snaps = [] } = useSnaps(journeyId);

  // Reverse for most-recent-first display
  const sortedSnaps = [...snaps].reverse();

  const [editingSnap, setEditingSnap] = useState<SnapWithValues | null>(null);
  const [deletingSnapId, setDeletingSnapId] = useState<string | null>(null);

  return (
    <>
      {sortedSnaps.length === 0 ? (
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
