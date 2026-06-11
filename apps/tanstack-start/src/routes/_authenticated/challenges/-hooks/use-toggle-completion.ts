import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "@stepsnaps/ui/toast";

import { useTRPC } from "~/lib/trpc";

export function useToggleCompletion() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.challenge.toggleCompletion.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.challenge.pathFilter());
      },
      onError: (err) => toast.error(err.message),
    }),
  );
}
