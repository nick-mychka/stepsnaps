import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "~/lib/trpc";

/** The current user's to-dos dated strictly before `before` (YYYY-MM-DD). */
export function usePastTodos(before: string) {
  const trpc = useTRPC();
  return useQuery(trpc.todo.listPast.queryOptions({ before }));
}
