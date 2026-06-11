import { useQuery } from "@tanstack/react-query";

import { today } from "~/lib/date";
import { useTRPC } from "~/lib/trpc";

export function useActiveChallenges() {
  const trpc = useTRPC();
  return useQuery(trpc.challenge.list.queryOptions({ today: today() }));
}
