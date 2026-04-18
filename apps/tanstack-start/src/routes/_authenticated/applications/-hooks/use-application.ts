import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "~/lib/trpc";

export function useApplication(id: string | null) {
  const trpc = useTRPC();
  return useQuery(
    trpc.jobApplication.byId.queryOptions({ id: id ?? "" }, { enabled: !!id }),
  );
}
