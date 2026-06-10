import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "@stepsnaps/ui/toast";

import { useTRPC } from "~/lib/trpc";

export function useUpdateChallenge(options?: { onSuccess?: () => void }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.challenge.update.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.challenge.pathFilter());
        toast.success("Challenge updated!");
        options?.onSuccess?.();
      },
      onError: (err) => toast.error(err.message),
    }),
  );
}
