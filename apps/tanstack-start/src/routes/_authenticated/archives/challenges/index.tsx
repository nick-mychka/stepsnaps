import { createFileRoute } from "@tanstack/react-router";

import { today } from "~/lib/date";
import { ChallengeHistoryPage } from "./-challenge-history-page";

export const Route = createFileRoute("/_authenticated/archives/challenges/")({
  loader: ({ context }) => {
    const { trpc, queryClient } = context;
    void queryClient.prefetchQuery(
      trpc.challenge.listPast.queryOptions({ today: today() }),
    );
  },
  component: ChallengeHistoryPage,
});
