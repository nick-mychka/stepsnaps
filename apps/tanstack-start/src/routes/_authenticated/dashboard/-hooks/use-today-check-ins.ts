import { useQuery } from "@tanstack/react-query";

import { today } from "~/lib/date";
import { useTRPC } from "~/lib/trpc";

export function useTodayCheckIns() {
  const trpc = useTRPC();
  return useQuery(
    trpc.challenge.todayCheckIns.queryOptions({ today: today() }),
  );
}
