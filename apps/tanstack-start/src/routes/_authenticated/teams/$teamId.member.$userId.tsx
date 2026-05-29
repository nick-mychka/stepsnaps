import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, Road } from "lucide-react";

import { Button } from "@stepsnaps/ui/button";

import type { Granularity, SnapByDate, ViewMode } from "~/features/progress";
import { SimpleEmpty } from "~/components/simple-empty";
import {
  GranularityToggle,
  ProgressCard,
  ProgressCharts,
  useGroupedSnaps,
  ViewToggle,
} from "~/features/progress";
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

  const { data } = useSuspenseQuery(
    trpc.team.memberProgress.queryOptions({ teamId, userId }),
  );

  const [view, setView] = useState<ViewMode>("timeline");

  return (
    <main className="container mx-auto px-3 py-8">
      <Button variant="ghost" size="sm" className="mb-4" asChild>
        <Link to="/teams/$teamId" params={{ teamId }}>
          &larr; Back to Team
        </Link>
      </Button>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{data.memberName}'s Progress</h1>
        <ViewToggle view={view} onChange={setView} />
      </div>

      {!data.journey ? (
        <SimpleEmpty
          title="No Active Journey"
          icon={<Road />}
          description={
            <>{data.memberName} doesn't have an active journey right now.</>
          }
        />
      ) : (
        <MemberProgressView
          view={view}
          snaps={data.snaps}
          startDate={data.journey.startDate}
          endDate={data.journey.endDate}
        />
      )}
    </main>
  );
}

function MemberProgressView({
  view,
  snaps,
  startDate,
  endDate,
}: {
  view: ViewMode;
  snaps: SnapByDate[];
  startDate: string;
  endDate: string | null;
}) {
  if (view === "timeline") {
    return <ReadOnlyTimeline snaps={snaps} />;
  }
  return (
    <ProgressCharts snaps={snaps} startDate={startDate} endDate={endDate} />
  );
}

function ReadOnlyTimeline({ snaps }: { snaps: SnapByDate[] }) {
  const [granularity, setGranularity] = useState<Granularity>("daily");

  const items = useGroupedSnaps(snaps, granularity);

  if (items.length === 0) {
    return (
      <SimpleEmpty
        title="No snaps yet"
        icon={<Camera />}
        description="No daily snaps have been logged yet."
      />
    );
  }

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
          <ProgressCard key={snap.id} snap={snap} label={label} />
        ))}
      </div>
    </>
  );
}
