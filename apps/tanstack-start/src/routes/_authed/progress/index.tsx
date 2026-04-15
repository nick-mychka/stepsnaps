import { createFileRoute } from "@tanstack/react-router";

import { ProgressPage } from "./-progress-page";

export const Route = createFileRoute("/_authed/progress/")({
  loader: ({ context }) => {
    const { trpc, queryClient } = context;
    void queryClient.prefetchQuery(trpc.journey.active.queryOptions());
  },
  component: ProgressPage,
});
