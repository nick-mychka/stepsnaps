import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "@stepsnaps/ui/toast";

import { useTRPC } from "~/lib/trpc";

export function useFinishJourney(options?: { onSuccess?: () => void }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.journey.finish.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.journey.pathFilter());
        options?.onSuccess?.();
        toast.success("Journey completed! Congrats!");
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }),
  );
}
