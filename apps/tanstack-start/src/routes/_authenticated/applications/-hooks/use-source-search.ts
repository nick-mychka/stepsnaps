import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "~/lib/trpc";

export function useSourceSearch(query: string, options: { enabled: boolean }) {
  const trpc = useTRPC();
  return useQuery(
    trpc.source.search.queryOptions({ query }, { enabled: options.enabled }),
  );
}
