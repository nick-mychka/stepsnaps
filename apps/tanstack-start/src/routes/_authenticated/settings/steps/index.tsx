import { createFileRoute } from "@tanstack/react-router";

import { StepsPage } from "./-steps-page";

export const Route = createFileRoute("/_authenticated/settings/steps/")({
  loader: ({ context }) => {
    const { trpc, queryClient } = context;
    void queryClient.prefetchQuery(trpc.stepDefinition.list.queryOptions());
  },
  component: StepsPage,
});
