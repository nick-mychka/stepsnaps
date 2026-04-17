import { createFileRoute } from "@tanstack/react-router";

import { JourneyHistoryPage } from "./-journey-history-page";

export const Route = createFileRoute("/_authenticated/journey/history/")({
  loader: ({ context }) => {
    const { trpc, queryClient } = context;
    void queryClient.prefetchQuery(trpc.journey.list.queryOptions());
  },
  component: JourneyHistoryPage,
});
