import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { Button } from "@stepsnaps/ui/button";

import type { SnapByDate } from "~/features/snap";
import type { ViewMode } from "~/features/snap/types";
import { SimpleEmpty } from "~/components/simple-empty";
import { SnapCard, SnapCharts } from "~/features/snap";
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

function MemberProgressPage() {
  const { teamId, userId } = Route.useParams();
  const trpc = useTRPC();
  const [view, setView] = useState<ViewMode>("timeline");

  const { data } = useSuspenseQuery(
    trpc.team.memberProgress.queryOptions({ teamId, userId }),
  );

  return (
    <main className="container mx-auto py-8">
      <Button variant="ghost" size="sm" className="mb-4" asChild>
        <Link to="/teams/$teamId" params={{ teamId }}>
          &larr; Back to Team
        </Link>
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
        <SimpleEmpty
          title="No Active Journey"
          description={
            <>{data.memberName} doesn't have an active journey right now.</>
          }
        />
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

function ReadOnlyTimeline(props: { snaps: SnapByDate[] }) {
  const sortedSnaps = [...props.snaps].reverse();

  if (sortedSnaps.length === 0) {
    return (
      <SimpleEmpty
        title="No snaps yet"
        description="No daily snaps have been logged yet."
      />
    );
  }

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      {sortedSnaps.map((snap) => (
        <SnapCard key={snap.id} snap={snap} />
      ))}
    </div>
  );
}

function ReadOnlyChart({
  snaps,
  startDate,
  endDate,
}: {
  snaps: SnapByDate[];
  startDate: string;
  endDate: string | null;
}) {
  return <SnapCharts snaps={snaps} startDate={startDate} endDate={endDate} />;
}
