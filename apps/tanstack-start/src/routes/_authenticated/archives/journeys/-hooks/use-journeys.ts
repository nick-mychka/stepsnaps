import { useSuspenseQuery } from "@tanstack/react-query";

import { useTRPC } from "~/lib/trpc";

export function useJourneys() {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.journey.list.queryOptions());
}
