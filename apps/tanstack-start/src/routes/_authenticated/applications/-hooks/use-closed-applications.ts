import { useQuery } from "@tanstack/react-query";

import type { RouterInputs } from "@stepsnaps/api";

import { useTRPC } from "~/lib/trpc";

type ClosedListInput = Omit<RouterInputs["jobApplication"]["list"], "tab"> & {
  tab: "closed";
};

export function useClosedApplications(
  input: ClosedListInput,
  options: { enabled: boolean },
) {
  const trpc = useTRPC();
  return useQuery(
    trpc.jobApplication.list.queryOptions(input, { enabled: options.enabled }),
  );
}
