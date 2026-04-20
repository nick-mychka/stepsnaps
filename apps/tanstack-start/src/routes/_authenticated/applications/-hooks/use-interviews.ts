import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "~/lib/trpc";

export function useInterviews(
  jobApplicationId: string | null,
  options: { enabled: boolean },
) {
  const trpc = useTRPC();
  return useQuery(
    trpc.interview.list.queryOptions(
      { jobApplicationId: jobApplicationId ?? "" },
      { enabled: options.enabled },
    ),
  );
}
