import { useQuery } from "@tanstack/react-query";

import { today } from "~/lib/date";
import { useTRPC } from "~/lib/trpc";

export function usePastChallenges() {
  const trpc = useTRPC();
  return useQuery(trpc.challenge.listPast.queryOptions({ today: today() }));
}
