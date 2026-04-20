import { keepPreviousData, useQuery } from "@tanstack/react-query";

import type { RouterInputs } from "@stepsnaps/api";

import { useTRPC } from "~/lib/trpc";

type ActiveListInput = Omit<RouterInputs["jobApplication"]["list"], "tab"> & {
  tab: "active";
};

export function useActiveApplications(input: ActiveListInput) {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.jobApplication.list.queryOptions(input),
    placeholderData: keepPreviousData,
  });
}
