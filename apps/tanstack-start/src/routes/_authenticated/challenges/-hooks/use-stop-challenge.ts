import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "@stepsnaps/ui/toast";

import { useTRPC } from "~/lib/trpc";

export function useStopChallenge(options?: { onSuccess?: () => void }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.challenge.stop.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.challenge.pathFilter());
        toast.success("Challenge stopped");
        options?.onSuccess?.();
      },
      onError: (err) => toast.error(err.message),
    }),
  );
}
