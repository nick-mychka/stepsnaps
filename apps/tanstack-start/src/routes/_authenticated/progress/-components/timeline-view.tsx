import { useState } from "react";

import type { Granularity, SnapByDate } from "~/features/snap";
import { GranularityToggle, SnapCard, useGroupedSnaps } from "~/features/snap";
import { DeleteSnapDialog } from "./delete-snap-dialog";
import { EditSnapDialog } from "./edit-snap-dialog";

export function TimelineView({
  snaps,
  journeyId,
}: {
  snaps: SnapByDate[];
  journeyId: string;
}) {
  const [granularity, setGranularity] = useState<Granularity>("daily");
  const [editingSnap, setEditingSnap] = useState<SnapByDate | null>(null);
  const [deletingSnapId, setDeletingSnapId] = useState<string | null>(null);

  const items = useGroupedSnaps(snaps, granularity);
  const isDaily = granularity === "daily";

  return (
    <>
      <div className="mb-4 w-fit">
        <GranularityToggle
          granularity={granularity}
          onChange={setGranularity}
        />
      </div>

      <div className="flex max-w-2xl flex-col gap-4">
        {items.map(({ snap, label }) => (
          <SnapCard
            key={snap.id}
            snap={snap}
            label={label}
            onEdit={isDaily ? () => setEditingSnap(snap) : undefined}
            onDelete={isDaily ? () => setDeletingSnapId(snap.id) : undefined}
          />
        ))}
      </div>

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
