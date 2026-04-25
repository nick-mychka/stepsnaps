import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "@stepsnaps/ui/toast";

import { useTRPC } from "~/lib/trpc";

export function useStartJourney() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.journey.start.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.journey.pathFilter());
        toast.success("Journey started!");
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }),
  );
}
