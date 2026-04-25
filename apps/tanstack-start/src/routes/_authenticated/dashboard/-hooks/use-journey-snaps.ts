import { useSuspenseQuery } from "@tanstack/react-query";

import { useTRPC } from "~/lib/trpc";

export function useJourneySnaps(journeyId: string) {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.snap.list.queryOptions({ journeyId }));
}
