import { useQuery } from "@tanstack/react-query";

import { today } from "~/lib/date";
import { useTRPC } from "~/lib/trpc";

export function useChallenge(id: string) {
  const trpc = useTRPC();
  return useQuery(trpc.challenge.byId.queryOptions({ id, today: today() }));
}
