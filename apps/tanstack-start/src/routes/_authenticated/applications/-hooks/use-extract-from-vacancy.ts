import { useMutation } from "@tanstack/react-query";

import { useTRPC } from "~/lib/trpc";

export function useExtractFromVacancy() {
  const trpc = useTRPC();
  return useMutation(trpc.jobApplication.extractFromVacancy.mutationOptions());
}
