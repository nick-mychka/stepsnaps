import { createFileRoute } from "@tanstack/react-router";

import { JourneyHistoryPage } from "../journey/history/-journey-history-page";

export const Route = createFileRoute("/_authenticated/archives/journeys")({
  loader: ({ context }) => {
    const { trpc, queryClient } = context;
    void queryClient.prefetchQuery(trpc.journey.list.queryOptions());
  },
  component: JourneyHistoryPage,
});
