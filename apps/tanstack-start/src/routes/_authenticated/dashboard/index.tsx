import { createFileRoute } from "@tanstack/react-router";

import { DashboardPage } from "./-dashboard-page";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  loader: ({ context }) => {
    const { trpc, queryClient } = context;
    void queryClient.prefetchQuery(trpc.journey.active.queryOptions());
  },
  component: DashboardPage,
});
