import { useSuspenseQuery } from "@tanstack/react-query";

import { useTRPC } from "~/lib/trpc";

export function useStepDefinitions() {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.stepDefinition.list.queryOptions());
}
