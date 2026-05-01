import { createFileRoute } from "@tanstack/react-router";

import { SnapFormPage } from "./-snap-form-page";

export const Route = createFileRoute("/_authenticated/snap/new/")({
  loader: ({ context }) => {
    const { trpc, queryClient } = context;
    void queryClient.prefetchQuery(trpc.journey.active.queryOptions());
    void queryClient.prefetchQuery(trpc.stepDefinition.active.queryOptions());
  },
  component: SnapFormPage,
});
