import { useSuspenseQuery } from "@tanstack/react-query";

import { useTRPC } from "~/lib/trpc";

export function useActiveStepDefinitions() {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.stepDefinition.active.queryOptions());
}
