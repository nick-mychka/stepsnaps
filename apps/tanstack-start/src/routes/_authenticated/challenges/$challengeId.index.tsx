import { createFileRoute } from "@tanstack/react-router";

import { ChallengeDetailPage } from "./-challenge-detail-page";

export const Route = createFileRoute(
  "/_authenticated/challenges/$challengeId/",
)({
  loader: ({ context, params }) => {
    const { trpc, queryClient } = context;
    void queryClient.prefetchQuery(
      trpc.challenge.byId.queryOptions({ id: params.challengeId }),
    );
  },
  component: ChallengeDetailPage,
});
