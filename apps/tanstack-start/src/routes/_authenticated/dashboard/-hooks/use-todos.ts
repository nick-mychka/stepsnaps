import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "~/lib/trpc";

/** The current user's to-dos for a given date (YYYY-MM-DD). */
export function useTodos(date: string) {
  const trpc = useTRPC();
  return useQuery(trpc.todo.byDate.queryOptions({ date }));
}
