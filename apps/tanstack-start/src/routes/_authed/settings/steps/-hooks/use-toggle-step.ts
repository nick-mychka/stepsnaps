import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "@stepsnaps/ui/toast";

import { useTRPC } from "~/lib/trpc";

export function useToggleStep() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.stepDefinition.toggleActive.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.stepDefinition.pathFilter());
      },
      onError: (err) => toast.error(err.message),
    }),
  );
}
