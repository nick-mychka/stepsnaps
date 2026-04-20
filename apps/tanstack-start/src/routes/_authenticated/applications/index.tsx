import { createFileRoute } from "@tanstack/react-router";

import { ApplicationsPage } from "./-applications-page";

export const Route = createFileRoute("/_authenticated/applications/")({
  loader: ({ context }) => {
    const { trpc, queryClient } = context;
    void queryClient.prefetchQuery(
      trpc.jobApplication.list.queryOptions({ page: 1, tab: "active" }),
    );
  },
  component: ApplicationsPage,
});
