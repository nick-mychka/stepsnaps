import { useQuery } from "@tanstack/react-query";

import { today } from "~/lib/date";
import { useTRPC } from "~/lib/trpc";

export function useExistingSnap(journeyId: string, date: string = today()) {
  const trpc = useTRPC();
  return useQuery(trpc.snap.byDate.queryOptions({ journeyId, date }));
}
