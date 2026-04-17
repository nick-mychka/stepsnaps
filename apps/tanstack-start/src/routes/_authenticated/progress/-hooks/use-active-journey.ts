import { useSuspenseQuery } from "@tanstack/react-query";

import { useTRPC } from "~/lib/trpc";

export function useActiveJourney() {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.journey.active.queryOptions());
}
