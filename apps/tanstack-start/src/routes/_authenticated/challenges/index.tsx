import { createFileRoute } from "@tanstack/react-router";

import { ChallengesPage } from "./-challenges-page";

export const Route = createFileRoute("/_authenticated/challenges/")({
  loader: ({ context }) => {
    const { trpc, queryClient } = context;
    void queryClient.prefetchQuery(trpc.challenge.list.queryOptions());
  },
  component: ChallengesPage,
});
